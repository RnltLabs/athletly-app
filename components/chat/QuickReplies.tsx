/**
 * QuickReplies — Athletly V2
 *
 * Horizontal scrolling chip row for quick reply suggestions.
 * Shown below agent messages when appropriate.
 * Styled per design spec section 5.7.
 */

import React from 'react';
import { ScrollView, Pressable, Text } from 'react-native';

interface QuickRepliesProps {
  replies: string[];
  onSelect: (reply: string) => void;
}

export function QuickReplies({ replies, onSelect }: QuickRepliesProps) {
  if (replies.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="px-4 py-2 gap-2"
      keyboardShouldPersistTaps="handled"
    >
      {replies.map((reply) => (
        <Pressable
          key={reply}
          onPress={() => onSelect(reply)}
          className="bg-surface border border-primary/15 rounded-full px-4 py-2.5"
          style={({ pressed }) => ({
            backgroundColor: pressed ? 'rgba(59,130,246,0.12)' : undefined,
            borderColor: pressed ? 'rgba(59,130,246,0.25)' : undefined,
          })}
          accessibilityRole="button"
          accessibilityLabel={reply}
        >
          <Text className="text-blue-400 text-sm font-medium">{reply}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

export default QuickReplies;
