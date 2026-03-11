/**
 * Onboarding Chat Screen — Athletly V2
 *
 * Design spec section 7.4.
 * Chat-based onboarding: no forms, no wizards, just a conversation.
 *
 * - Auto-sends "Hallo" on first open (when no session exists)
 * - Progress bar at top (approximate, based on message count)
 * - Inverted FlatList for messages
 * - Inline chat bubbles (assistant left, user right)
 * - Quick reply chips
 * - Voice input + send button
 * - Handles onboarding_complete SSE event
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Mic, MicOff, Send } from 'lucide-react-native';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useAuthStore } from '@/store/authStore';
import { useChatStream } from '@/hooks/useChatStream';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { Colors } from '@/lib/colors';
import { log } from '@/lib/logger';
import { apiGet } from '@/lib/api';
import type { ChatMessage, StreamMessage, StreamProgress } from '@/types/chat';

const TAG = 'OnboardingScreen';

/**
 * Approximate onboarding progress based on message count.
 * Typical onboarding is ~10-14 exchanges (20-28 messages total).
 * Cap at 0.95 — the last 5% happens when onboarding_complete fires.
 */
const ESTIMATED_TOTAL_MESSAGES = 24;

function estimateProgress(messageCount: number): number {
  return Math.min(0.95, messageCount / ESTIMATED_TOTAL_MESSAGES);
}

/** Generate a unique message ID. */
function createMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ---------------------------------------------------------------------------
// Inline Components (not imported from components/chat/ — that's Wave 2 Agent 7)
// ---------------------------------------------------------------------------

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <View
      className={`mb-3 max-w-[85%] ${isUser ? 'self-end' : 'self-start'}`}
    >
      <View
        className={`rounded-2xl px-4 py-3 ${
          isUser
            ? 'rounded-br-md'
            : 'rounded-bl-md'
        }`}
        style={{
          backgroundColor: isUser ? Colors.primary : Colors.surface,
          ...(isUser ? {} : {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.06,
            shadowRadius: 4,
            elevation: 2,
          }),
        }}
      >
        <Text
          className={`text-base leading-6 ${
            isUser ? 'text-white' : 'text-text-primary'
          }`}
        >
          {message.content}
        </Text>
      </View>
    </View>
  );
}

function ThinkingIndicator({ status }: { status: string }) {
  return (
    <View className="self-start mb-3 max-w-[85%]">
      <View
        className="rounded-2xl rounded-bl-md px-4 py-3"
        style={{
          backgroundColor: Colors.surface,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.06,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <Text className="text-text-secondary text-sm">{status}</Text>
      </View>
    </View>
  );
}

function QuickReplies({
  replies,
  onSelect,
}: {
  replies: string[];
  onSelect: (reply: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="px-4 py-2"
    >
      {replies.map((reply) => (
        <Pressable
          key={reply}
          onPress={() => onSelect(reply)}
          className="bg-surface-nested border border-divider rounded-full px-4 py-2 mr-2"
        >
          <Text className="text-text-primary text-sm">{reply}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

/** Fallback quick replies when the backend is unreachable. */
const FALLBACK_SPORT_REPLIES = ['Laufen', 'Radfahren', 'Schwimmen', 'Gym', 'Yoga'];
const FALLBACK_GOAL_REPLIES = ['Fitness verbessern', 'Abnehmen', 'Wettkampf', 'Gesundheit'];
const FALLBACK_FREQUENCY_REPLIES = ['3x pro Woche', '4x pro Woche', '5x pro Woche', 'Taeglich'];

interface OnboardingSuggestions {
  readonly sports: readonly string[];
  readonly goals: readonly string[];
  readonly frequencies: readonly string[];
}

const FALLBACK_SUGGESTIONS: OnboardingSuggestions = {
  sports: FALLBACK_SPORT_REPLIES,
  goals: FALLBACK_GOAL_REPLIES,
  frequencies: FALLBACK_FREQUENCY_REPLIES,
};

async function fetchSuggestions(): Promise<OnboardingSuggestions> {
  try {
    return await apiGet<OnboardingSuggestions>('/api/onboarding/suggestions');
  } catch {
    return FALLBACK_SUGGESTIONS;
  }
}

function getQuickReplies(
  messageCount: number,
  suggestions: OnboardingSuggestions,
): string[] {
  // Simple heuristic: show sport replies early, goals mid, frequency later
  if (messageCount < 4) return [];
  if (messageCount < 8) return [...suggestions.sports];
  if (messageCount < 12) return [...suggestions.goals];
  if (messageCount < 16) return [...suggestions.frequencies];
  return [];
}

export default function OnboardingScreen() {
  useEffect(() => {
    log.info(TAG, 'Screen mounted');
    return () => log.info(TAG, 'Screen unmounted');
  }, []);
  const {
    messages,
    sessionId,
    isSessionLoaded,
    addMessage,
    setSessionId,
    markComplete,
    loadSession,
  } = useOnboardingStore();
  const setOnboarded = useAuthStore((state) => state.setOnboarded);

  const {
    sendMessage: streamMessage,
    isStreaming,
    progress: streamProgress,
    error: streamError,
  } = useChatStream();

  const {
    isListening,
    isAvailable: voiceAvailable,
    transcript,
    startListening,
    stopListening,
  } = useVoiceInput();

  const [inputText, setInputText] = useState('');
  const [suggestions, setSuggestions] = useState<OnboardingSuggestions>(FALLBACK_SUGGESTIONS);
  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  const hasSentInitialRef = useRef(false);

  // Load saved session on mount
  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // Fetch dynamic suggestions on mount (non-blocking, falls back to static list)
  useEffect(() => {
    let cancelled = false;
    fetchSuggestions().then((result) => {
      if (!cancelled) {
        setSuggestions(result);
      }
    });
    return () => { cancelled = true; };
  }, []);

  // Sync voice transcript to input
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

  // Auto-send "Hallo" on first open (no sessionId, no messages, session loaded)
  useEffect(() => {
    if (!isSessionLoaded) return;
    if (hasSentInitialRef.current) return;
    if (sessionId) {
      log.info(TAG, 'Resuming existing session', { sessionId });
      return;
    }
    if (messages.length > 0) return;

    log.info(TAG, 'Auto-sending initial "Hallo"');
    hasSentInitialRef.current = true;
    sendUserMessage('Hallo');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSessionLoaded, sessionId, messages.length]);

  const handleOnboardingComplete = useCallback(() => {
    log.info(TAG, '🎉 Onboarding complete!');
    markComplete();
    setOnboarded(true);
    // Auth guard in root layout handles redirect to (tabs)
  }, [markComplete, setOnboarded]);

  const handleStreamMessage = useCallback(
    (streamMsg: StreamMessage) => {
      // Capture session ID from first response
      if (streamMsg.sessionId && streamMsg.sessionId !== sessionId) {
        setSessionId(streamMsg.sessionId);
      }

      const assistantMessage: ChatMessage = {
        id: createMessageId(),
        role: 'assistant',
        content: streamMsg.content,
        timestamp: new Date(),
      };
      addMessage(assistantMessage);
    },
    [sessionId, setSessionId, addMessage],
  );

  const sendUserMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      if (isStreaming) return;

      log.info(TAG, 'User message', { length: trimmed.length, messageCount: messages.length });

      // Add user message to store
      const userMessage: ChatMessage = {
        id: createMessageId(),
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      };
      addMessage(userMessage);
      setInputText('');

      try {
        await streamMessage(
          trimmed,
          sessionId ?? '',
          handleStreamMessage,
          undefined,
          'onboarding',
          handleOnboardingComplete,
        );
      } catch {
        // Error state is managed by useChatStream hook
      }
    },
    [
      isStreaming,
      sessionId,
      addMessage,
      streamMessage,
      handleStreamMessage,
      handleOnboardingComplete,
    ],
  );

  const handleSend = useCallback(() => {
    sendUserMessage(inputText);
  }, [inputText, sendUserMessage]);

  const handleQuickReply = useCallback(
    (reply: string) => {
      sendUserMessage(reply);
    },
    [sendUserMessage],
  );

  const handleVoicePress = useCallback(async () => {
    if (isListening) {
      await stopListening();
    } else {
      await startListening();
    }
  }, [isListening, startListening, stopListening]);

  const quickReplies = getQuickReplies(messages.length, suggestions);
  const canSend = inputText.trim().length > 0 && !isStreaming;

  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => <ChatBubble message={item} />,
    [],
  );

  const keyExtractor = useCallback((item: ChatMessage) => item.id, []);

  return (
    <View className="flex-1" style={{ backgroundColor: Colors.background }}>
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4 }}
      />
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          {/* Progress bar */}
          <View className="px-4 pt-2 pb-1">
            <ProgressBar
              progress={estimateProgress(messages.length)}
              height={4}
            />
          </View>

          {/* Chat messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={keyExtractor}
            inverted
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              isStreaming && streamProgress ? (
                <ThinkingIndicator status={streamProgress.status} />
              ) : null
            }
          />

          {/* Stream error */}
          {streamError && (
            <View className="mx-4 mb-2 bg-error/10 border border-error/30 rounded-xl px-4 py-2">
              <Text className="text-error text-sm">{streamError}</Text>
            </View>
          )}

          {/* Quick reply chips */}
          {quickReplies.length > 0 && !isStreaming && (
            <QuickReplies replies={quickReplies} onSelect={handleQuickReply} />
          )}

          {/* Input bar */}
          <View className="flex-row items-end px-4 py-3 gap-2 border-t border-divider">
            {/* Voice button */}
            {voiceAvailable && (
              <Pressable
                onPress={handleVoicePress}
                className="w-11 h-11 rounded-full items-center justify-center"
                style={{
                  backgroundColor: isListening ? Colors.error : Colors.surfaceMuted,
                }}
              >
                {isListening ? (
                  <MicOff size={20} color="#FFFFFF" strokeWidth={2} />
                ) : (
                  <Mic size={20} color="#94A3B8" strokeWidth={2} />
                )}
              </Pressable>
            )}

            {/* Text input */}
            <View className="flex-1 bg-white border border-divider rounded-xl px-4 min-h-[44px] justify-center">
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Nachricht schreiben..."
                placeholderTextColor={Colors.textMuted}
                className="text-text-primary text-base py-2.5"
                multiline
                maxLength={2000}
                editable={!isStreaming}
                returnKeyType="send"
                blurOnSubmit
                onSubmitEditing={handleSend}
              />
            </View>

            {/* Send button */}
            <Pressable
              onPress={handleSend}
              disabled={!canSend}
              className="w-11 h-11 rounded-full items-center justify-center"
              style={{
                backgroundColor: canSend ? Colors.primary : Colors.surfaceMuted,
              }}
            >
              <Send
                size={20}
                color={canSend ? '#FFFFFF' : Colors.textMuted}
                strokeWidth={2}
              />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
