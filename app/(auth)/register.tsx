/**
 * Register Screen — Athletly V2
 *
 * Design spec section 7.6 (register variant).
 * Email + password sign-up with password strength indicator.
 */

import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/lib/colors';

type PasswordStrength = 'weak' | 'ok' | 'strong';

interface StrengthInfo {
  level: PasswordStrength;
  label: string;
  color: string;
  progress: number;
}

function getPasswordStrength(password: string): StrengthInfo {
  if (password.length < 6) {
    return { level: 'weak', label: 'Schwach', color: Colors.error, progress: 0.33 };
  }
  if (password.length < 8) {
    return { level: 'ok', label: 'OK', color: Colors.warning, progress: 0.66 };
  }
  return { level: 'strong', label: 'Stark', color: Colors.success, progress: 1 };
}

function PasswordStrengthIndicator({ password }: { password: string }) {
  const strength = useMemo(() => getPasswordStrength(password), [password]);

  if (password.length === 0) return null;

  return (
    <View className="mt-2">
      <View className="flex-row items-center gap-2">
        {/* Strength bars */}
        <View className="flex-1 flex-row gap-1">
          <View
            className="flex-1 h-1 rounded-full"
            style={{ backgroundColor: strength.progress >= 0.33 ? strength.color : Colors.surfaceElevated }}
          />
          <View
            className="flex-1 h-1 rounded-full"
            style={{ backgroundColor: strength.progress >= 0.66 ? strength.color : Colors.surfaceElevated }}
          />
          <View
            className="flex-1 h-1 rounded-full"
            style={{ backgroundColor: strength.progress >= 1 ? strength.color : Colors.surfaceElevated }}
          />
        </View>
        <Text className="text-xs" style={{ color: strength.color }}>
          {strength.label}
        </Text>
      </View>
    </View>
  );
}

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { signUp, isLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const handleSignUp = useCallback(async () => {
    setError(null);

    if (!email.trim()) {
      setError('Bitte gib deine E-Mail-Adresse ein.');
      return;
    }
    if (!password) {
      setError('Bitte gib ein Passwort ein.');
      return;
    }
    if (password.length < 6) {
      setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }

    const result = await signUp(email, password);
    if (!result.success) {
      setError(result.error ?? 'Ein Fehler ist aufgetreten.');
    } else {
      toast.show('success', 'Konto erstellt!');
      // Auth state change triggers auto-redirect via root layout guard
    }
  }, [email, password, signUp, toast]);

  const navigateToLogin = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="px-6">
            {/* Logo */}
            <View className="items-center mb-8">
              <View
                className="w-20 h-20 rounded-[20px] items-center justify-center mb-4"
                style={{ backgroundColor: Colors.primary }}
              >
                <Text className="text-white text-4xl font-bold">A</Text>
              </View>
              <Text className="text-text-primary text-3xl font-bold">
                Athletly
              </Text>
              <Text className="text-text-secondary text-sm mt-1">
                Dein AI Fitness Coach
              </Text>
            </View>

            {/* Heading */}
            <Text className="text-text-primary text-xl font-semibold mb-6">
              Konto erstellen
            </Text>

            {/* Error banner */}
            {error && (
              <View className="bg-error/10 border border-error/30 rounded-xl px-4 py-3 mb-4">
                <Text className="text-error text-sm">{error}</Text>
              </View>
            )}

            {/* Email input */}
            <View className="mb-4">
              <Input
                label="E-Mail"
                value={email}
                onChangeText={setEmail}
                placeholder="name@beispiel.de"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                returnKeyType="next"
                editable={!isLoading}
              />
            </View>

            {/* Password input + strength */}
            <View className="mb-6">
              <Input
                label="Passwort"
                value={password}
                onChangeText={setPassword}
                placeholder="Mindestens 6 Zeichen"
                isPassword
                autoCapitalize="none"
                autoComplete="new-password"
                returnKeyType="done"
                editable={!isLoading}
                onSubmitEditing={handleSignUp}
              />
              <PasswordStrengthIndicator password={password} />
            </View>

            {/* Sign up button */}
            <Button
              variant="primary"
              size="lg"
              label="Registrieren"
              onPress={handleSignUp}
              loading={isLoading}
              disabled={isLoading}
            />

            {/* Link to login */}
            <View className="items-center mt-6">
              <Pressable onPress={navigateToLogin}>
                <Text className="text-text-secondary text-sm">
                  Bereits ein Konto?{' '}
                  <Text className="text-primary font-medium">Anmelden</Text>
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
