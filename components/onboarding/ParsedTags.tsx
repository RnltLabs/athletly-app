import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { X } from 'lucide-react-native';
import { Colors } from '@/lib/colors';

interface ParsedTagsProps {
  tags: string[];
  onRemove: (tag: string) => void;
  color?: string;
}

interface AnimatedTagProps {
  tag: string;
  color: string;
  onRemove: (tag: string) => void;
}

function AnimatedTag({ tag, color, onRemove }: AnimatedTagProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  return (
    <Animated.View style={{ opacity }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: Colors.primaryLight,
          borderRadius: 100,
          paddingVertical: 6,
          paddingLeft: 12,
          paddingRight: 8,
          gap: 4,
        }}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: '500',
            color: color,
            flexShrink: 1,
          }}
          numberOfLines={1}
        >
          {tag}
        </Text>
        <Pressable
          onPress={() => onRemove(tag)}
          accessibilityRole="button"
          accessibilityLabel={`${tag} entfernen`}
          hitSlop={8}
        >
          <X size={14} color={color} strokeWidth={2.5} />
        </Pressable>
      </View>
    </Animated.View>
  );
}

export function ParsedTags({ tags, onRemove, color }: ParsedTagsProps) {
  const activeColor = color ?? Colors.primary;

  if (tags.length === 0) {
    return null;
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
      }}
    >
      {tags.map((tag) => (
        <AnimatedTag
          key={tag}
          tag={tag}
          color={activeColor}
          onRemove={onRemove}
        />
      ))}
    </View>
  );
}

export default ParsedTags;
