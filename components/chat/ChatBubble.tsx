/**
 * ChatBubble — Athletly V2
 *
 * Message bubble component for the coach chat.
 * - AI messages: left-aligned, surface bg, rounded-tl-sm
 * - User messages: right-aligned, primary bg, rounded-tr-sm
 * - System messages: centered, muted, italic
 * - Timestamp below in caption size
 * - Tool call badges row when present
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Wrench } from 'lucide-react-native';
import type { ChatMessage } from '@/types/chat';
import { Colors } from '@/lib/colors';

interface ChatBubbleProps {
  message: ChatMessage;
}

function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function ToolCallBadges({ toolCalls }: { toolCalls: string[] }) {
  return (
    <View className="flex-row flex-wrap gap-1.5 mt-2">
      {toolCalls.map((tool, index) => (
        <View
          key={`${tool}-${index}`}
          className="flex-row items-center bg-surface-nested rounded-full px-2.5 py-1"
        >
          <Wrench size={10} color={Colors.textMuted} strokeWidth={2} />
          <Text className="text-text-muted text-[10px] ml-1">{tool}</Text>
        </View>
      ))}
    </View>
  );
}

function AssistantBubble({ message }: { message: ChatMessage }) {
  return (
    <View className="self-start max-w-[85%] mb-3">
      <View className="rounded-2xl rounded-tl-sm px-4 py-3" style={{ backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 }}>
        <Text className="text-text-primary text-base leading-6">
          {message.content}
        </Text>
        {message.toolCalls && message.toolCalls.length > 0 && (
          <ToolCallBadges toolCalls={message.toolCalls} />
        )}
      </View>
      <Text className="text-text-muted text-[10px] mt-1 ml-1">
        {formatTime(message.timestamp)}
      </Text>
    </View>
  );
}

function UserBubble({ message }: { message: ChatMessage }) {
  return (
    <View className="self-end max-w-[85%] mb-3">
      <View className="bg-primary rounded-2xl rounded-tr-sm px-4 py-3">
        <Text className="text-white text-base leading-6">
          {message.content}
        </Text>
      </View>
      <Text className="text-text-muted text-[10px] mt-1 mr-1 text-right">
        {formatTime(message.timestamp)}
      </Text>
    </View>
  );
}

function SystemBubble({ message }: { message: ChatMessage }) {
  return (
    <View className="self-center max-w-[85%] mb-3 px-4 py-2">
      <Text className="text-text-muted text-sm italic text-center">
        {message.content}
      </Text>
    </View>
  );
}

export function ChatBubble({ message }: ChatBubbleProps) {
  switch (message.role) {
    case 'assistant':
      return <AssistantBubble message={message} />;
    case 'user':
      return <UserBubble message={message} />;
    case 'system':
      return <SystemBubble message={message} />;
  }
}

export default ChatBubble;
