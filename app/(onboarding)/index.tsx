/**
 * Welcome Screen — Athletly V2 Companion Onboarding
 *
 * Design spec section 3.1.
 * Entry point for the companion onboarding flow.
 *
 * - Gradient background (top portion), matching auth screens
 * - Logo + subtitle centered on gradient
 * - Primary CTA navigates to sport selection
 * - Ghost link navigates to login for returning users
 * - No ProgressDots on this screen
 */

import { useCallback, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import { Colors } from '@/lib/colors';
import { log } from '@/lib/logger';

const TAG = 'WelcomeScreen';

export default function WelcomeScreen() {
  const router = useRouter();

  useEffect(() => {
    log.info(TAG, 'Screen mounted');
    return () => log.info(TAG, 'Screen unmounted');
  }, []);

  const handleGetStarted = useCallback(() => {
    log.info(TAG, 'Navigating to sport selection');
    router.push('/(onboarding)/sport');
  }, [router]);

  const handleExistingAccount = useCallback(() => {
    log.info(TAG, 'Navigating to login — existing account');
    router.replace('/(auth)/login');
  }, [router]);

  return (
    <View className="flex-1" style={{ backgroundColor: Colors.background }}>
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientMid, Colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '55%' }}
      />

      <SafeAreaView className="flex-1 items-center justify-between px-6 py-8">
        {/* Logo + headline on gradient */}
        <View className="flex-1 items-center justify-center gap-3">
          <View
            className="w-20 h-20 rounded-[20px] items-center justify-center mb-2"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <Text className="text-white text-4xl font-bold">A</Text>
          </View>

          <Text
            className="text-4xl font-bold"
            style={{ color: Colors.textOnGradient }}
          >
            Athletly
          </Text>

          <Text
            className="text-base"
            style={{ color: 'rgba(255,255,255,0.8)' }}
          >
            Dein AI Fitness Coach
          </Text>
        </View>

        {/* Companion illustration placeholder */}
        <View
          className="w-48 h-48 rounded-full items-center justify-center mb-4"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
        >
          <Text style={{ fontSize: 72 }}>🏃</Text>
        </View>

        {/* CTA area */}
        <View className="w-full gap-4 pb-4">
          <Button
            variant="primary"
            size="lg"
            label="Lass uns loslegen"
            onPress={handleGetStarted}
          />

          <Pressable
            onPress={handleExistingAccount}
            accessibilityRole="button"
            accessibilityLabel="Ich habe bereits einen Account"
            className="items-center py-2"
          >
            <Text
              className="text-sm font-medium"
              style={{ color: Colors.textOnGradient, opacity: 0.85 }}
            >
              Ich habe bereits einen Account
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}
