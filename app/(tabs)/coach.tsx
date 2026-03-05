/**
 * Coach Chat Screen — Athletly V2
 *
 * Primary interaction surface. User talks to AI coach,
 * receives plans, analysis, and recommendations.
 *
 * Design spec section 7.3:
 * - Inverted FlatList (newest at bottom)
 * - Agent status indicator (thinking/tool calls)
 * - Quick replies after certain messages
 * - Chat input bar at bottom with voice support
 * - Checkpoint cards inline for plan approval
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { GradientHeader } from '@/components/ui/GradientHeader';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { useChatStream } from '@/hooks/useChatStream';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { AgentStatus } from '@/components/chat/AgentStatus';
import { CheckpointCard } from '@/components/chat/CheckpointCard';
import { QuickReplies } from '@/components/chat/QuickReplies';
import type { ChatMessage, StreamProgress } from '@/types/chat';

const WELCOME_REPLIES = [
  'Erstelle einen Trainingsplan',
  'Analysiere mein Training',
  'Wie geht es meiner Erholung?',
];

export default function CoachScreen() {
  const user = useAuthStore((s) => s.user);
  const {
    messages,
    sessionId,
    isTyping,
    pendingCheckpoint,
    isConfirming,
    addMessage,
    setSessionId,
    setTyping,
    setPendingCheckpoint,
    confirmCheckpoint,
    loadMessages,
  } = useChatStore();

  const { sendMessage, isStreaming, progress, toolsUsed } = useChatStream();
  const voice = useVoiceInput();

  const { prefill } = useLocalSearchParams<{ prefill?: string }>();
  const [agentStatus, setAgentStatus] = useState('');
  const [agentTool, setAgentTool] = useState<string | undefined>(undefined);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const prefillHandled = useRef(false);

  // Load messages on mount
  useEffect(() => {
    if (user?.id) {
      loadMessages(user.id);
    }
  }, [user?.id, loadMessages]);

  // Show welcome quick replies when only welcome message present
  useEffect(() => {
    if (messages.length === 1 && messages[0]?.id === 'welcome') {
      setQuickReplies(WELCOME_REPLIES);
    }
  }, [messages]);

  const handleSend = useCallback(
    async (text: string) => {
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: new Date(),
        synced: false,
      };
      addMessage(userMsg);
      setTyping(true);
      setQuickReplies([]);
      setAgentStatus('Denke nach...');
      setAgentTool(undefined);

      try {
        await sendMessage(
          text,
          sessionId || 'new',
          (msg) => {
            const assistantMsg: ChatMessage = {
              id: `assistant-${Date.now()}`,
              role: 'assistant',
              content: msg.content,
              timestamp: new Date(),
              toolCalls: toolsUsed.length > 0 ? [...toolsUsed] : undefined,
              synced: false,
            };
            addMessage(assistantMsg);
            setSessionId(msg.sessionId);
          },
          (prog: StreamProgress) => {
            setAgentStatus(prog.status);
            setAgentTool(prog.tool);
          },
          'coach',
          undefined,
          (cp) => {
            setPendingCheckpoint(cp);
          },
        );
      } catch (err) {
        console.error('[CoachScreen] Send error:', err);
        const errorMsg: ChatMessage = {
          id: `error-${Date.now()}`,
          role: 'system',
          content: 'Fehler beim Senden. Bitte versuche es erneut.',
          timestamp: new Date(),
          synced: false,
        };
        addMessage(errorMsg);
      } finally {
        setTyping(false);
        setAgentStatus('');
        setAgentTool(undefined);
      }
    },
    [sessionId, sendMessage, addMessage, setSessionId, setTyping, setPendingCheckpoint, toolsUsed],
  );

  // Auto-send prefilled message from Quick Actions
  useEffect(() => {
    if (prefill && !prefillHandled.current) {
      prefillHandled.current = true;
      handleSend(prefill);
    }
  }, [prefill, handleSend]);

  const handleQuickReply = useCallback(
    (reply: string) => {
      setQuickReplies([]);
      handleSend(reply);
    },
    [handleSend],
  );

  const handleCheckpointConfirm = useCallback(
    (accepted: boolean) => {
      confirmCheckpoint(accepted);
    },
    [confirmCheckpoint],
  );

  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => {
      if (
        item.checkpointId &&
        pendingCheckpoint &&
        pendingCheckpoint.id === item.checkpointId
      ) {
        return (
          <View>
            <ChatBubble message={item} />
            <CheckpointCard
              checkpoint={pendingCheckpoint}
              onConfirm={handleCheckpointConfirm}
              isConfirming={isConfirming}
            />
          </View>
        );
      }

      return <ChatBubble message={item} />;
    },
    [pendingCheckpoint, isConfirming, handleCheckpointConfirm],
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  return (
    <View className="flex-1 bg-background">
      <GradientHeader
        title="Coach"
        rightContent={
          <View className="flex-row items-center gap-1.5">
            <View className="w-2 h-2 rounded-full bg-success" />
            <Text className="text-white text-xs font-medium">Online</Text>
          </View>
        }
      />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >

        {/* Message list (inverted) */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={keyExtractor}
          inverted
          contentContainerClassName="px-4 py-2"
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />

        {/* Quick replies */}
        {quickReplies.length > 0 && !isTyping && (
          <QuickReplies replies={quickReplies} onSelect={handleQuickReply} />
        )}

        {/* Agent status */}
        <AgentStatus
          isActive={isTyping || isStreaming}
          status={agentStatus}
          tool={agentTool}
        />

        {/* Input bar */}
        <ChatInput
          onSend={handleSend}
          onVoiceStart={voice.startListening}
          onVoiceStop={voice.stopListening}
          isListening={voice.isListening}
          voiceTranscript={voice.transcript}
          disabled={isStreaming}
        />
      </KeyboardAvoidingView>
    </View>
  );
}
