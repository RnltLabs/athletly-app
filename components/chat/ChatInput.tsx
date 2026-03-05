/**
 * ChatInput — Athletly V2
 *
 * Chat input bar at the bottom of the coach screen.
 * - TextInput with auto-grow (up to 4 lines)
 * - Mic button for voice input (pulsing red when recording)
 * - Send button (visible only when text is non-empty)
 * - Safe area padding at bottom
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, Pressable, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mic, MicOff, Send } from 'lucide-react-native';
import { Colors } from '@/lib/colors';

interface ChatInputProps {
  onSend: (text: string) => void;
  onVoiceStart: () => void;
  onVoiceStop: () => void;
  isListening: boolean;
  voiceTranscript: string;
  disabled?: boolean;
}

const MAX_INPUT_LINES = 4;
const LINE_HEIGHT = 20;
const MAX_INPUT_HEIGHT = MAX_INPUT_LINES * LINE_HEIGHT + 24; // + padding

function PulsingMic({ onPress }: { onPress: () => void }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <Pressable
      onPress={onPress}
      className="h-9 w-9 rounded-full items-center justify-center"
      style={{ backgroundColor: 'rgba(248,113,113,0.15)' }}
      accessibilityRole="button"
      accessibilityLabel="Aufnahme stoppen"
    >
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <MicOff size={20} color={Colors.error} strokeWidth={2} />
      </Animated.View>
    </Pressable>
  );
}

export function ChatInput({
  onSend,
  onVoiceStart,
  onVoiceStop,
  isListening,
  voiceTranscript,
  disabled = false,
}: ChatInputProps) {
  const [text, setText] = useState('');
  const [inputHeight, setInputHeight] = useState(LINE_HEIGHT + 24);
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  // Auto-fill from voice transcript
  useEffect(() => {
    if (voiceTranscript) {
      setText(voiceTranscript);
    }
  }, [voiceTranscript]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (trimmed.length === 0) return;
    onSend(trimmed);
    setText('');
    setInputHeight(LINE_HEIGHT + 24);
  };

  const handleMicPress = () => {
    if (isListening) {
      onVoiceStop();
    } else {
      onVoiceStart();
    }
  };

  const hasText = text.trim().length > 0;

  return (
    <View
      className="bg-surface border-t border-border/50 px-4 pt-2"
      style={{ paddingBottom: Math.max(insets.bottom, 8) }}
    >
      <View className="flex-row items-end gap-2">
        {/* Mic button */}
        {isListening ? (
          <PulsingMic onPress={handleMicPress} />
        ) : (
          <Pressable
            onPress={handleMicPress}
            disabled={disabled}
            className="h-9 w-9 rounded-full items-center justify-center"
            style={({ pressed }) => ({
              opacity: pressed ? 0.7 : disabled ? 0.4 : 1,
            })}
            accessibilityRole="button"
            accessibilityLabel="Spracheingabe"
          >
            <Mic size={20} color={Colors.textSecondary} strokeWidth={2} />
          </Pressable>
        )}

        {/* Text input */}
        <View
          className="flex-1 bg-surface-elevated rounded-2xl px-4 py-2 justify-center"
          style={{ minHeight: 40, maxHeight: MAX_INPUT_HEIGHT }}
        >
          <TextInput
            ref={inputRef}
            className="text-text-primary text-base"
            placeholderTextColor={Colors.textMuted}
            placeholder="Nachricht..."
            value={text}
            onChangeText={setText}
            onSubmitEditing={handleSend}
            multiline
            scrollEnabled={inputHeight >= MAX_INPUT_HEIGHT}
            onContentSizeChange={(e) => {
              const height = Math.min(
                e.nativeEvent.contentSize.height + 16,
                MAX_INPUT_HEIGHT,
              );
              setInputHeight(height);
            }}
            style={{
              height: Math.min(inputHeight - 16, MAX_INPUT_HEIGHT - 16),
              lineHeight: LINE_HEIGHT,
            }}
            editable={!disabled}
            returnKeyType="default"
            blurOnSubmit={false}
          />
        </View>

        {/* Send button */}
        {hasText && (
          <Pressable
            onPress={handleSend}
            disabled={disabled}
            className="h-9 w-9 rounded-full bg-primary items-center justify-center"
            style={({ pressed }) => ({
              opacity: pressed ? 0.8 : disabled ? 0.5 : 1,
            })}
            accessibilityRole="button"
            accessibilityLabel="Nachricht senden"
          >
            <Send size={18} color="#FFFFFF" strokeWidth={2} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default ChatInput;
