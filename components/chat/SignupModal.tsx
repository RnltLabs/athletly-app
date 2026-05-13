/**
 * SignupModal - Athletly V2
 *
 * Modal for in-chat authentication. Supports both signup (default) and login.
 * Caller passes the initial mode; user can toggle inside the modal.
 *
 * Style note: NativeWind's wrapped Pressable does not reliably honour the
 * function-form of the `style` prop, so we use plain object styles.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, Mail, Lock } from 'lucide-react-native';
import { Input } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { Colors } from '@/lib/colors';
import { log } from '@/lib/logger';

const TAG = 'SignupModal';

type AuthMode = 'signup' | 'login';

interface SignupModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialMode?: AuthMode;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

const SUBMIT_BUTTON_STYLE = {
  backgroundColor: Colors.primary,
  borderRadius: 12,
  height: 52,
  width: '100%' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
  paddingHorizontal: 20,
  shadowColor: Colors.primary,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 10,
  elevation: 4,
} as const;

const TOGGLE_LINK_STYLE = {
  marginTop: 14,
  alignItems: 'center' as const,
};

const MODE_COPY: Record<AuthMode, {
  title: string;
  cta: string;
  toggle: string;
  toggleAction: string;
}> = {
  signup: {
    title: 'Account erstellen',
    cta: 'Account erstellen',
    toggle: 'Schon einen Account?',
    toggleAction: 'Anmelden',
  },
  login: {
    title: 'Anmelden',
    cta: 'Anmelden',
    toggle: 'Noch keinen Account?',
    toggleAction: 'Registrieren',
  },
};

export function SignupModal({
  visible,
  onClose,
  onSuccess,
  initialMode = 'signup',
}: SignupModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Re-sync mode when the modal is reopened with a different initialMode.
  useEffect(() => {
    if (visible) {
      setMode(initialMode);
      setError(null);
      setInfo(null);
    }
  }, [visible, initialMode]);

  const copy = MODE_COPY[mode];

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

  const handleToggleMode = () => {
    setMode((prev) => (prev === 'signup' ? 'login' : 'signup'));
    setError(null);
    setInfo(null);
  };

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('Bitte gib eine gultige E-Mail-Adresse ein.');
      return;
    }
    if (mode === 'signup' && password.length < MIN_PASSWORD_LENGTH) {
      setError(`Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen haben.`);
      return;
    }
    if (mode === 'login' && password.length === 0) {
      setError('Bitte gib dein Passwort ein.');
      return;
    }

    setError(null);
    setInfo(null);
    setIsLoading(true);

    try {
      if (mode === 'signup') {
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

        log.info(TAG, 'Signup success, awaiting email confirmation');
        setInfo(
          'Wir haben dir eine Bestatigungs-Mail geschickt. Klicke den Link, dann komm zuruck.',
        );
        return;
      }

      // mode === 'login'
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (signInError) {
        log.warn(TAG, 'Login error', { message: signInError.message });
        setError(signInError.message);
        return;
      }

      if (data.session) {
        log.info(TAG, 'Login success');
        resetState();
        onSuccess();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten.';
      log.error(TAG, 'Auth exception', { error: String(err) });
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
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <Pressable className="bg-white rounded-2xl p-6 mx-6 w-80" onPress={() => {}}>
            <View className="flex-row items-center justify-between mb-5">
              <Text className="text-text-primary text-lg font-semibold">
                {copy.title}
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
                placeholder={
                  mode === 'signup'
                    ? `Mindestens ${MIN_PASSWORD_LENGTH} Zeichen`
                    : 'Dein Passwort'
                }
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
              onPress={handleSubmit}
              disabled={isLoading}
              style={
                isLoading
                  ? [SUBMIT_BUTTON_STYLE, { opacity: 0.5 }]
                  : SUBMIT_BUTTON_STYLE
              }
              android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
              accessibilityRole="button"
              accessibilityLabel={copy.cta}
              accessibilityState={{ disabled: isLoading }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
                  {copy.cta}
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={handleToggleMode}
              disabled={isLoading}
              style={TOGGLE_LINK_STYLE}
              accessibilityRole="button"
              accessibilityLabel={copy.toggleAction}
            >
              <Text style={{ color: Colors.textSecondary, fontSize: 14 }}>
                {copy.toggle}{' '}
                <Text style={{ color: Colors.primary, fontWeight: '600' }}>
                  {copy.toggleAction}
                </Text>
              </Text>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

export default SignupModal;
