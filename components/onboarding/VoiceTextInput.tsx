/**
 * VoiceTextInput — Athletly V2 Companion Onboarding
 *
 * Combined voice recording button + text input for onboarding steps.
 * Uses expo-speech-recognition via useVoiceInput hook (de-DE).
 * Calls onVoiceResult with the final transcript when recording ends.
 * Shows an ActivityIndicator below when isProcessing is true (AI parsing).
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  Text,
} from 'react-native';
import { Mic, MicOff } from 'lucide-react-native';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { Colors } from '@/lib/colors';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onVoiceResult: (transcript: string) => void;
  placeholder?: string;
  isProcessing?: boolean;
}

export function VoiceTextInput({
  value,
  onChangeText,
  onVoiceResult,
  placeholder = 'Oder schreib es hier…',
  isProcessing = false,
}: Props) {
  const { isListening, isAvailable, transcript, startListening, stopListening, error } =
    useVoiceInput();

  // Track the previous isListening value to detect the transition from
  // recording → stopped, then fire onVoiceResult with the final transcript.
  const wasListeningRef = useRef(false);

  useEffect(() => {
    const justFinished = wasListeningRef.current && !isListening;
    wasListeningRef.current = isListening;

    if (justFinished && transcript.length > 0) {
      onVoiceResult(transcript);
    }
  }, [isListening, transcript, onVoiceResult]);

  const handleMicPress = async () => {
    if (isListening) {
      await stopListening();
    } else {
      await startListening();
    }
  };

  const micBgColor = isListening ? Colors.error : Colors.primary;
  const micIcon = isListening
    ? <MicOff size={22} color={Colors.surface} strokeWidth={2} />
    : <Mic size={22} color={Colors.surface} strokeWidth={2} />;

  // Live transcript preview — shown inside the text field while recording.
  const displayValue = isListening && transcript.length > 0 ? transcript : value;

  return (
    <View>
      {/* Row: mic button + text input */}
      <View className="flex-row items-center gap-2">
        {/* Mic button — 48×48 px */}
        <Pressable
          onPress={handleMicPress}
          disabled={!isAvailable}
          style={{ backgroundColor: micBgColor, opacity: isAvailable ? 1 : 0.4 }}
          className="w-12 h-12 rounded-[14px] items-center justify-center"
          accessibilityLabel={isListening ? 'Aufnahme stoppen' : 'Spracheingabe starten'}
          accessibilityRole="button"
        >
          {micIcon}
        </Pressable>

        {/* Text input */}
        <View
          className="flex-1 flex-row items-center bg-white rounded-[14px] h-12 px-4"
          style={{
            borderWidth: 1,
            borderColor: isListening ? Colors.primary : Colors.inputBorder,
          }}
        >
          <TextInput
            className="flex-1 text-base"
            style={{ color: Colors.textPrimary }}
            placeholderTextColor={Colors.textMuted}
            placeholder={isListening ? 'Ich höre zu…' : placeholder}
            value={displayValue}
            onChangeText={onChangeText}
            editable={!isListening}
            returnKeyType="done"
          />
        </View>
      </View>

      {/* Error message */}
      {error !== null && !isListening && (
        <Text
          className="text-xs mt-1.5 ml-14"
          style={{ color: Colors.error }}
        >
          {error}
        </Text>
      )}

      {/* Loading indicator — shown while AI is parsing the transcript */}
      {isProcessing && (
        <View className="flex-row items-center mt-2 ml-14 gap-2">
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text className="text-xs" style={{ color: Colors.textSecondary }}>
            Wird verarbeitet…
          </Text>
        </View>
      )}
    </View>
  );
}

export default VoiceTextInput;
