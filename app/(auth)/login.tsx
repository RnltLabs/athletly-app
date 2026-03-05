/**
 * Login Screen — Athletly V2
 *
 * Design spec section 7.6.
 * Email + password sign-in with German UI labels.
 */

import { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/lib/colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { signIn, isLoading } = useAuth();
  const router = useRouter();

  const handleSignIn = useCallback(async () => {
    setError(null);

    if (!email.trim()) {
      setError('Bitte gib deine E-Mail-Adresse ein.');
      return;
    }
    if (!password) {
      setError('Bitte gib dein Passwort ein.');
      return;
    }

    const result = await signIn(email, password);
    if (!result.success) {
      setError(result.error ?? 'Ein Fehler ist aufgetreten.');
    }
    // On success, auth state change triggers auto-redirect via root layout guard
  }, [email, password, signIn]);

  const navigateToRegister = useCallback(() => {
    router.push('/(auth)/register');
  }, [router]);

  return (
    <View className="flex-1" style={{ backgroundColor: Colors.background }}>
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '45%' }}
      />
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo on gradient */}
            <View className="items-center mb-8 pt-4">
              <View
                className="w-20 h-20 rounded-[20px] items-center justify-center mb-4"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <Text className="text-white text-4xl font-bold">A</Text>
              </View>
              <Text className="text-white text-3xl font-bold">
                Athletly
              </Text>
              <Text className="text-white/80 text-sm mt-1">
                Dein AI Fitness Coach
              </Text>
            </View>

            {/* White card for form */}
            <View
              className="bg-white rounded-t-3xl flex-1 px-6 pt-8"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 4,
              }}
            >
              {/* Heading */}
              <Text className="text-text-primary text-xl font-semibold mb-6">
                Willkommen zurueck
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

              {/* Password input */}
              <View className="mb-6">
                <Input
                  label="Passwort"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Dein Passwort"
                  isPassword
                  autoCapitalize="none"
                  autoComplete="password"
                  returnKeyType="done"
                  editable={!isLoading}
                  onSubmitEditing={handleSignIn}
                />
              </View>

              {/* Sign in button */}
              <Button
                variant="primary"
                size="lg"
                label="Anmelden"
                onPress={handleSignIn}
                loading={isLoading}
                disabled={isLoading}
              />

              {/* Links */}
              <View className="items-center mt-6 gap-3">
                <Pressable onPress={navigateToRegister}>
                  <Text className="text-text-secondary text-sm">
                    Kein Account?{' '}
                    <Text className="text-primary font-medium">Registrieren</Text>
                  </Text>
                </Pressable>

                <Pressable>
                  <Text className="text-text-muted text-sm">
                    Passwort vergessen?
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
