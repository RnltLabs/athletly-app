/**
 * Forgot Password Screen — Athletly V2
 *
 * Sends a password-reset link via Supabase.
 * German UI labels, matches login screen design.
 */

import { useState, useCallback, useEffect } from 'react';
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
import { log } from '@/lib/logger';

const TAG = 'ForgotPassword';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const { resetPassword, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    log.info(TAG, 'Screen mounted');
  }, []);

  const handleReset = useCallback(async () => {
    setError(null);
    log.info(TAG, 'Password reset attempt', { email: email.trim().toLowerCase() });

    if (!email.trim()) {
      setError('Bitte gib deine E-Mail-Adresse ein.');
      return;
    }

    const endTimer = log.time(TAG, 'resetPassword');
    const result = await resetPassword(email);
    endTimer();

    if (!result.success) {
      log.warn(TAG, 'Reset failed', { error: result.error });
      setError(result.error ?? 'Ein Fehler ist aufgetreten.');
      return;
    }

    log.info(TAG, 'Reset email sent');
    setSent(true);
  }, [email, resetPassword]);

  const navigateToLogin = useCallback(() => {
    router.back();
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

            {/* White card */}
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
              <Text className="text-text-primary text-xl font-semibold mb-2">
                Passwort zuruecksetzen
              </Text>
              <Text className="text-text-secondary text-sm mb-6">
                Gib deine E-Mail-Adresse ein und wir senden dir einen Link zum Zuruecksetzen.
              </Text>

              {sent ? (
                /* Success state */
                <View className="bg-green-50 border border-green-200 rounded-xl px-4 py-4 mb-6">
                  <Text className="text-green-800 text-sm leading-5">
                    Wir haben dir einen Link zum Zuruecksetzen gesendet. Bitte pruefe dein
                    E-Mail-Postfach.
                  </Text>
                </View>
              ) : (
                <>
                  {/* Error banner */}
                  {error && (
                    <View className="bg-error/10 border border-error/30 rounded-xl px-4 py-3 mb-4">
                      <Text className="text-error text-sm">{error}</Text>
                    </View>
                  )}

                  {/* Email input */}
                  <View className="mb-6">
                    <Input
                      label="E-Mail"
                      value={email}
                      onChangeText={setEmail}
                      placeholder="name@beispiel.de"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      autoComplete="email"
                      returnKeyType="done"
                      editable={!isLoading}
                      onSubmitEditing={handleReset}
                    />
                  </View>

                  {/* Submit button */}
                  <Button
                    variant="primary"
                    size="lg"
                    label="Link senden"
                    onPress={handleReset}
                    loading={isLoading}
                    disabled={isLoading}
                  />
                </>
              )}

              {/* Back to login */}
              <View className="items-center mt-6">
                <Pressable onPress={navigateToLogin}>
                  <Text className="text-text-secondary text-sm">
                    Zurueck zur{' '}
                    <Text className="text-primary font-medium">Anmeldung</Text>
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
