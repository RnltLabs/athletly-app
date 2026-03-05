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
          className="bg-white border border-primary/20 rounded-full px-4 py-2.5"
          style={({ pressed }) => ({
            backgroundColor: pressed ? 'rgba(37,99,235,0.08)' : undefined,
            borderColor: pressed ? 'rgba(37,99,235,0.3)' : undefined,
          })}
          accessibilityRole="button"
          accessibilityLabel={reply}
        >
          <Text className="text-primary text-sm font-medium">{reply}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

export default QuickReplies;
