/**
 * SignupModal - Athletly V2
 *
 * Modal for in-chat account creation. Calls Supabase signUp directly.
 * The auth store picks up the new session via onAuthStateChange, so the
 * caller just needs to close the modal on success.
 */

import React, { useState } from 'react';
import { View, Text, Modal, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { X, Mail, Lock } from 'lucide-react-native';
import { Input } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/lib/colors';
import { log } from '@/lib/logger';

const SUBMIT_BUTTON_STYLE = {
  backgroundColor: Colors.primary,
  borderRadius: 12,
  height: 52,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  paddingHorizontal: 20,
  shadowColor: Colors.primary,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 10,
  elevation: 4,
};

const TAG = 'SignupModal';

interface SignupModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export function SignupModal({ visible, onClose, onSuccess }: SignupModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetState = () => {
    setEmail('');
    setPassword('');
    setError(null);
    setInfo(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSignup = async () => {
    const trimmedEmail = email.trim();

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('Bitte gib eine gultige E-Mail-Adresse ein.');
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen haben.`);
      return;
    }

    setError(null);
    setInfo(null);
    setIsLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
      });

      if (signUpError) {
        log.warn(TAG, 'Signup error', { message: signUpError.message });
        setError(signUpError.message);
        return;
      }

      if (data.session) {
        log.info(TAG, 'Signup success, session active');
        resetState();
        onSuccess();
        return;
      }

      // Email confirmation required - defensive fallback
      log.info(TAG, 'Signup success, awaiting email confirmation');
      setInfo('Wir haben dir eine Bestatigungs-Mail geschickt. Klicke den Link, dann komm zuruck.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup fehlgeschlagen.';
      log.error(TAG, 'Signup exception', { error: String(err) });
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable
        className="flex-1 justify-center items-center"
        style={{ backgroundColor: Colors.overlay }}
        onPress={handleClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable
            className="bg-white rounded-2xl p-6 mx-6 w-80"
            onPress={() => {}}
          >
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-text-primary text-lg font-semibold">
                Account erstellen
              </Text>
              <Pressable
                onPress={handleClose}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel="Schliessen"
              >
                <X size={20} color={Colors.textMuted} />
              </Pressable>
            </View>

            <View className="gap-3 mb-4">
              <Input
                label="E-Mail"
                leftIcon={Mail}
                placeholder="du@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <Input
                label="Passwort"
                leftIcon={Lock}
                isPassword
                placeholder={`Mindestens ${MIN_PASSWORD_LENGTH} Zeichen`}
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
              />
            </View>

            {error && (
              <View className="bg-error/10 rounded-xl px-4 py-2.5 mb-4">
                <Text className="text-error text-sm">{error}</Text>
              </View>
            )}

            {info && (
              <View className="bg-primary/10 rounded-xl px-4 py-2.5 mb-4">
                <Text className="text-text-primary text-sm">{info}</Text>
              </View>
            )}

            <Pressable
              onPress={handleSignup}
              disabled={isLoading}
              style={({ pressed }) => [
                SUBMIT_BUTTON_STYLE,
                { opacity: pressed && !isLoading ? 0.85 : isLoading ? 0.5 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Account erstellen"
              accessibilityState={{ disabled: isLoading }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="font-semibold text-base" style={{ color: '#FFFFFF' }}>
                  Account erstellen
                </Text>
              )}
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

export default SignupModal;
