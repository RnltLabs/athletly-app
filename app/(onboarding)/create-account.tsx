/**
 * Create Account Screen — Athletly V2 Companion Onboarding
 *
 * Design spec section 3.7 — Step 6 of 6.
 * Final step: creates a Supabase account, posts all collected onboarding
 * data to the backend, marks the user as onboarded, then redirects to tabs.
 *
 * Submit flow:
 *   1. supabase.auth.signUp(email, password)
 *   2. Wait for session to be available via getSession()
 *   3. POST /api/onboarding/setup with all store data (apiPost attaches auth headers)
 *   4. if Garmin credentials stored → POST /garmin/connect (non-blocking)
 *   5. authStore.setOnboarded(true)
 *   6. onboardingStore.reset()
 *   7. router.replace('/(tabs)')
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
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
import { CompanionCard } from '@/components/onboarding/CompanionCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';
import { apiPost } from '@/lib/api';
import { Colors } from '@/lib/colors';
import { log } from '@/lib/logger';

const TAG = 'CreateAccountScreen';

// ---------------------------------------------------------------------------
// Password strength indicator (pattern from register.tsx)
// ---------------------------------------------------------------------------

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
        {/* Three strength bars */}
        <View className="flex-1 flex-row gap-1">
          <View
            className="flex-1 h-1 rounded-full"
            style={{
              backgroundColor:
                strength.progress >= 0.33 ? strength.color : Colors.surfaceMuted,
            }}
          />
          <View
            className="flex-1 h-1 rounded-full"
            style={{
              backgroundColor:
                strength.progress >= 0.66 ? strength.color : Colors.surfaceMuted,
            }}
          />
          <View
            className="flex-1 h-1 rounded-full"
            style={{
              backgroundColor:
                strength.progress >= 1 ? strength.color : Colors.surfaceMuted,
            }}
          />
        </View>
        <Text className="text-xs" style={{ color: strength.color }}>
          {strength.label}
        </Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Onboarding setup payload type
// ---------------------------------------------------------------------------

interface OnboardingSetupPayload {
  sports: string[];
  custom_sport: string | null;
  goals: string[];
  custom_goal: string | null;
  available_days: string[];
  wearable: string | null;
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function CreateAccountScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  // Onboarding store — read all collected data
  const sports = useOnboardingStore((s) => s.sports);
  const customSport = useOnboardingStore((s) => s.customSport);
  const goals = useOnboardingStore((s) => s.goals);
  const customGoal = useOnboardingStore((s) => s.customGoal);
  const availableDays = useOnboardingStore((s) => s.availableDays);
  const wearable = useOnboardingStore((s) => s.wearable);
  const garminCredentials = useOnboardingStore((s) => s.garminCredentials);
  const resetOnboarding = useOnboardingStore((s) => s.reset);

  // Auth store — to mark user as onboarded
  const setOnboarded = useAuthStore((s) => s.setOnboarded);

  useEffect(() => {
    log.info(TAG, 'Screen mounted');
    return () => log.info(TAG, 'Screen unmounted');
  }, []);

  const handleCreateAccount = useCallback(async () => {
    setError(null);
    log.info(TAG, 'Account creation started', { email: email.trim().toLowerCase() });

    // --- Input validation ---
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

    setIsLoading(true);

    try {
      // Step 1: Create Supabase user
      const endSignUp = log.time(TAG, 'supabase.auth.signUp');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      });
      endSignUp();

      if (signUpError) {
        log.warn(TAG, 'signUp failed', { message: signUpError.message });
        setError(signUpError.message ?? 'Registrierung fehlgeschlagen.');
        return;
      }

      log.info(TAG, 'signUp succeeded', {
        userId: signUpData.user?.id?.slice(0, 8),
        hasSession: !!signUpData.session,
      });

      // Step 2: Ensure session is available (signUp may return session directly
      // or require a round-trip depending on Supabase project email-confirm setting)
      let session = signUpData.session;

      if (!session) {
        log.debug(TAG, 'No inline session — fetching via getSession()');
        const endGetSession = log.time(TAG, 'getSession after signUp');
        const { data: sessionData } = await supabase.auth.getSession();
        endGetSession();
        session = sessionData.session;
      }

      if (!session) {
        // Email confirmation required — inform user and bail out gracefully
        log.warn(TAG, 'No session after signUp — email confirmation likely required');
        setError(
          'Bitte bestätige deine E-Mail-Adresse und melde dich dann an.',
        );
        return;
      }

      // Step 3: POST /api/onboarding/setup with all collected data
      const payload: OnboardingSetupPayload = {
        sports,
        custom_sport: customSport,
        goals,
        custom_goal: customGoal,
        available_days: availableDays,
        wearable,
      };

      log.info(TAG, 'POSTing /api/onboarding/setup', payload);
      const endSetup = log.time(TAG, 'POST /api/onboarding/setup');

      try {
        await apiPost('/api/onboarding/setup', payload);
        endSetup();
        log.info(TAG, '/api/onboarding/setup succeeded');
      } catch (setupErr) {
        endSetup();
        // Non-fatal: log and continue — agent can recover later
        log.error(TAG, '/api/onboarding/setup failed', { error: String(setupErr) });
      }

      // Step 4: POST /garmin/connect if Garmin credentials were stored during onboarding
      const garminCreds = useOnboardingStore.getState().garminCredentials;
      if (garminCreds) {
        try {
          await apiPost('/garmin/connect', {
            email: garminCreds.email,
            password: garminCreds.password,
          });
          log.info(TAG, 'Garmin connected successfully');
        } catch (garminErr) {
          // Non-blocking — user can connect later in profile
          log.warn(TAG, 'Garmin connect failed (non-blocking)', { error: String(garminErr) });
        }
      }

      // Step 5: Mark user as onboarded (temporary flag while agent creates plan)
      setOnboarded(true);
      log.info(TAG, 'setOnboarded(true)');

      // Step 6: Clear onboarding store
      resetOnboarding();
      log.info(TAG, 'Onboarding store reset');

      // Step 7: Redirect to main app
      log.info(TAG, 'Navigating to /(tabs)');
      router.replace('/(tabs)');
    } catch (err) {
      log.error(TAG, 'Unexpected error during account creation', { error: String(err) });
      setError('Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es erneut.');
    } finally {
      setIsLoading(false);
    }
  }, [
    email,
    password,
    sports,
    customSport,
    goals,
    customGoal,
    availableDays,
    wearable,
    garminCredentials,
    setOnboarded,
    resetOnboarding,
    router,
  ]);

  const handleNavigateToLogin = useCallback(() => {
    log.info(TAG, 'Navigating to login');
    router.replace('/(auth)/login');
  }, [router]);

  return (
    <View className="flex-1" style={{ backgroundColor: Colors.background }}>
      <SafeAreaView className="flex-1" edges={['bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <CompanionCard
              question="Fast geschafft!"
              subtitle="Erstelle dein Konto"
            >
              {/* Error banner */}
              {error && (
                <View
                  className="rounded-xl px-4 py-3 mb-4"
                  style={{
                    backgroundColor: Colors.errorLight,
                    borderWidth: 1,
                    borderColor: `${Colors.error}4D`, // ~30% opacity
                  }}
                >
                  <Text className="text-sm" style={{ color: Colors.error }}>
                    {error}
                  </Text>
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

              {/* Password input + strength indicator */}
              <View className="mb-2">
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
                  onSubmitEditing={handleCreateAccount}
                />
                <PasswordStrengthIndicator password={password} />
              </View>
            </CompanionCard>

            {/* Spacer */}
            <View className="h-6" />

            {/* Primary CTA */}
            <Button
              variant="primary"
              size="lg"
              label="Konto erstellen"
              onPress={handleCreateAccount}
              loading={isLoading}
              disabled={isLoading}
            />

            {/* Ghost link to login */}
            <View className="items-center mt-5">
              <Pressable
                onPress={handleNavigateToLogin}
                accessibilityRole="button"
                accessibilityLabel="Bereits ein Konto? Anmelden"
                className="py-2"
              >
                <Text
                  className="text-sm"
                  style={{ color: Colors.textSecondary }}
                >
                  Bereits ein Konto?{' '}
                  <Text
                    className="font-medium"
                    style={{ color: Colors.primary }}
                  >
                    Anmelden
                  </Text>
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
