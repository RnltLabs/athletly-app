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
import { useEffect, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { ToastProvider } from '@/components/ui/Toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Colors } from '@/lib/colors';
import { log } from '@/lib/logger';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const TAG = 'RootLayout';

/**
 * Auth guard — redirects to the correct route group based on auth state.
 * Runs whenever session, onboarding status, or current segment changes.
 */
function useAuthGuard() {
  const { session, isOnboarded, isInitialized } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) {
      log.debug(TAG, 'AuthGuard: waiting for initialization...');
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';

    log.info(TAG, 'AuthGuard evaluating', {
      hasSession: !!session,
      isOnboarded,
      currentSegment: segments[0],
      inAuthGroup,
      inOnboardingGroup,
    });

    if (!session) {
      // Not logged in → welcome screen handles the fork (new flow / existing account)
      if (!inOnboardingGroup) {
        log.info(TAG, 'AuthGuard → redirect to /(onboarding)');
        router.replace('/(onboarding)');
      }
    } else {
      // Logged in → go to tabs regardless of onboarding status
      // (agent re-triggers plan creation in background if needed)
      if (inAuthGroup || inOnboardingGroup) {
        log.info(TAG, 'AuthGuard → redirect to /(tabs)');
        router.replace('/(tabs)');
      }
    }
  }, [session, isOnboarded, isInitialized, segments, router]);
}

function LoadingScreen() {
  const mountTime = useRef(Date.now());

  useEffect(() => {
    log.info(TAG, '⏳ LoadingScreen mounted');

    // Warn if loading takes too long
    const warnTimer = setTimeout(() => {
      const elapsed = Date.now() - mountTime.current;
      log.warn(TAG, `⚠️ LoadingScreen still visible after ${elapsed}ms! Auth may be stuck.`);
      log.warn(TAG, 'AuthStore state:', useAuthStore.getState());
    }, 5000);

    const criticalTimer = setTimeout(() => {
      const elapsed = Date.now() - mountTime.current;
      log.error(TAG, `🚨 LoadingScreen stuck for ${elapsed}ms! Dumping full state.`);
      const state = useAuthStore.getState();
      log.error(TAG, 'Full AuthStore state', {
        isInitialized: state.isInitialized,
        isLoading: state.isLoading,
        hasSession: !!state.session,
        hasUser: !!state.user,
        isOnboarded: state.isOnboarded,
      });
    }, 15000);

    return () => {
      const elapsed = Date.now() - mountTime.current;
      log.info(TAG, `LoadingScreen unmounted after ${elapsed}ms`);
      clearTimeout(warnTimer);
      clearTimeout(criticalTimer);
    };
  }, []);

  return (
    <View
      className="flex-1 items-center justify-center"
      style={{ backgroundColor: Colors.background }}
    >
      <ActivityIndicator size="large" color={Colors.primary} />
      {__DEV__ && (
        <Text style={{ color: Colors.textSecondary, fontSize: 12, marginTop: 16 }}>
          Initializing...
        </Text>
      )}
    </View>
  );
}

export default function RootLayout() {
  const { isInitialized, initialize } = useAuthStore();

  log.debug(TAG, `render() — isInitialized: ${isInitialized}`);

  useEffect(() => {
    log.info(TAG, '🚀 RootLayout mounted, calling initialize()');
    const subscription = initialize();
    return () => {
      log.info(TAG, 'RootLayout unmounting, cleaning up subscription');
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

  log.info(TAG, '✅ Rendering main app (initialized)');

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
