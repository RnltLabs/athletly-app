/**
 * Root Layout — Athletly V2
 *
 * Entry point for the app. Handles:
 * - NativeWind global CSS import
 * - Auth state initialization
 * - Route guarding (auth → onboarding → tabs)
 * - Global providers (SafeArea, Toast, StatusBar)
 */

import '../global.css';
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { ToastProvider } from '@/components/ui/Toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Colors } from '@/lib/colors';
import { usePushNotifications } from '@/hooks/usePushNotifications';

/**
 * Auth guard — redirects to the correct route group based on auth state.
 * Runs whenever session, onboarding status, or current segment changes.
 */
function useAuthGuard() {
  const { session, isOnboarded, isInitialized } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';

    if (!session) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else if (!isOnboarded) {
      if (!inOnboardingGroup) {
        router.replace('/(onboarding)');
      }
    } else {
      if (inAuthGroup || inOnboardingGroup) {
        router.replace('/(tabs)');
      }
    }
  }, [session, isOnboarded, isInitialized, segments, router]);
}

function LoadingScreen() {
  return (
    <View
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: Colors.background }}
    >
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

export default function RootLayout() {
  const { isInitialized, initialize } = useAuthStore();

  useEffect(() => {
    const subscription = initialize();
    return () => {
      subscription?.unsubscribe();
    };
  }, [initialize]);

  useAuthGuard();
  usePushNotifications();

  if (!isInitialized) {
    return (
      <SafeAreaProvider>
        <LoadingScreen />
        <StatusBar style="dark" />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <ErrorBoundary>
          <Stack screenOptions={{ headerShown: false }} />
        </ErrorBoundary>
        <StatusBar style="dark" />
      </ToastProvider>
    </SafeAreaProvider>
  );
}
