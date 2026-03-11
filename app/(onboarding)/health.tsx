/**
 * Health Screen — Athletly V2 Companion Onboarding
 *
 * Design spec section 3.5 — Health Connection (Step 4 of 6).
 *
 * - Title: "Hast du einen Fitness-Tracker?"
 * - Platform-adaptive options:
 *     iOS:     Apple Health  + Garmin Connect
 *     Android: Health Connect + Garmin Connect
 * - Connected services show green checkmark (Check from lucide-react-native)
 * - "Weiter" always enabled — health connection is optional
 * - "Später einrichten" ghost link also advances to summary
 * - Navigates to /(onboarding)/summary on confirm or skip
 *
 * Apple Health / Health Connect: request permissions only (no sync yet — no auth).
 * Garmin: collect credentials in-memory, POST /garmin/connect after account creation.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Platform,
  Modal,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Check, Heart, Activity, Watch, X, Mail, Lock } from 'lucide-react-native';
import { CompanionCard } from '@/components/onboarding/CompanionCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Colors } from '@/lib/colors';
import { useOnboardingStore } from '@/store/onboardingStore';
import type { WearableType } from '@/store/onboardingStore';
import { log } from '@/lib/logger';

const TAG = 'HealthScreen';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WearableOption {
  id: WearableType;
  label: string;
  description: string;
  Icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  platforms: ('ios' | 'android')[];
}

// ─── Wearable option definitions ──────────────────────────────────────────────

const WEARABLE_OPTIONS: WearableOption[] = [
  {
    id: 'apple_health',
    label: 'Apple Health',
    description: 'iPhone & Apple Watch',
    Icon: Heart,
    platforms: ['ios'],
  },
  {
    id: 'health_connect',
    label: 'Health Connect',
    description: 'Android & Wear OS',
    Icon: Activity,
    platforms: ['android'],
  },
  {
    id: 'garmin',
    label: 'Garmin Connect',
    description: 'Garmin Wearables',
    Icon: Watch,
    platforms: ['ios', 'android'],
  },
];

// ─── Row component ────────────────────────────────────────────────────────────

interface WearableRowProps {
  option: WearableOption;
  isConnected: boolean;
  isLoading: boolean;
  onPress: (id: WearableType) => void;
}

function WearableRow({ option, isConnected, isLoading, onPress }: WearableRowProps) {
  const { id, label, description, Icon } = option;

  return (
    <Pressable
      onPress={() => onPress(id)}
      disabled={isLoading}
      accessibilityRole="button"
      accessibilityLabel={`${label} ${isConnected ? 'Verbunden' : 'Verbinden'}`}
      accessibilityState={{ selected: isConnected, disabled: isLoading }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 14,
        borderWidth: 1,
        backgroundColor: isConnected ? Colors.successLight : Colors.surfaceNested,
        borderColor: isConnected ? Colors.success : Colors.divider,
        opacity: pressed || isLoading ? 0.75 : 1,
        marginBottom: 10,
      })}
    >
      {/* Left icon */}
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: isConnected ? Colors.success : Colors.surface,
          borderWidth: 1,
          borderColor: isConnected ? Colors.success : Colors.divider,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Icon
          size={20}
          color={isConnected ? '#FFFFFF' : Colors.textSecondary}
          strokeWidth={2}
        />
      </View>

      {/* Labels */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 15,
            fontWeight: '600',
            color: Colors.textPrimary,
            lineHeight: 20,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: Colors.textMuted,
            lineHeight: 16,
          }}
        >
          {description}
        </Text>
      </View>

      {/* Status badge */}
      {isLoading ? (
        <ActivityIndicator size="small" color={Colors.primary} />
      ) : isConnected ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: Colors.success,
            borderRadius: 20,
            paddingHorizontal: 10,
            paddingVertical: 4,
          }}
        >
          <Check size={13} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#FFFFFF' }}>
            Verbunden
          </Text>
        </View>
      ) : (
        <View
          style={{
            borderRadius: 20,
            paddingHorizontal: 10,
            paddingVertical: 4,
            backgroundColor: Colors.primaryLight,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '600', color: Colors.primary }}>
            Verbinden
          </Text>
        </View>
      )}
    </Pressable>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HealthScreen() {
  const router = useRouter();
  const wearable = useOnboardingStore((s) => s.wearable);
  const setWearable = useOnboardingStore((s) => s.setWearable);
  const setGarminCredentials = useOnboardingStore((s) => s.setGarminCredentials);
  const setStep = useOnboardingStore((s) => s.setStep);

  // Which wearable is currently requesting permissions
  const [connectingId, setConnectingId] = useState<WearableType | null>(null);

  // Garmin credential modal state
  const [garminModalVisible, setGarminModalVisible] = useState(false);
  const [garminEmail, setGarminEmail] = useState('');
  const [garminPassword, setGarminPassword] = useState('');
  const [garminError, setGarminError] = useState<string | null>(null);

  const platform = Platform.OS as 'ios' | 'android';

  const visibleOptions = WEARABLE_OPTIONS.filter((opt) =>
    opt.platforms.includes(platform),
  );

  useEffect(() => {
    log.info(TAG, 'Screen mounted', { platform });
    setStep(3);
    return () => log.info(TAG, 'Screen unmounted');
  }, [setStep, platform]);

  const handleGarminSubmit = useCallback(() => {
    const trimmedEmail = garminEmail.trim();
    if (!trimmedEmail || !garminPassword) {
      setGarminError('Bitte gib E-Mail und Passwort ein.');
      return;
    }
    log.info(TAG, 'Garmin credentials stored (in-memory only)');
    setGarminCredentials({ email: trimmedEmail, password: garminPassword });
    setWearable('garmin');
    setGarminModalVisible(false);
    setGarminEmail('');
    setGarminPassword('');
    setGarminError(null);
  }, [garminEmail, garminPassword, setGarminCredentials, setWearable]);

  const handleGarminClose = useCallback(() => {
    setGarminModalVisible(false);
    setGarminEmail('');
    setGarminPassword('');
    setGarminError(null);
  }, []);

  const handleWearablePress = useCallback(
    async (id: WearableType) => {
      if (wearable === id) {
        log.info(TAG, 'Wearable deselected', { id });
        setWearable(null);
        if (id === 'garmin') setGarminCredentials(null);
        return;
      }

      if (id === 'garmin') {
        // Open credential modal — actual API call happens after account creation
        setGarminModalVisible(true);
        return;
      }

      // Apple Health / Health Connect: request permissions only (no sync — no userId yet)
      if (id === 'apple_health') {
        setConnectingId('apple_health');
        try {
          const svc = await import('@/lib/services/appleHealthService');
          const granted = await svc.requestAuthorization();
          if (granted) {
            log.info(TAG, 'Apple Health permissions granted');
            setWearable('apple_health');
          } else {
            log.warn(TAG, 'Apple Health permissions denied');
          }
        } catch (err) {
          log.error(TAG, 'Apple Health permission error', { error: String(err) });
        } finally {
          setConnectingId(null);
        }
        return;
      }

      if (id === 'health_connect') {
        setConnectingId('health_connect');
        try {
          const HealthConnectService = await import('@/lib/services/healthConnectService');
          const initialized = await HealthConnectService.initializeSdk();
          if (!initialized) {
            log.warn(TAG, 'Health Connect SDK initialization failed');
            setConnectingId(null);
            return;
          }
          const granted = await HealthConnectService.requestAuthorization();
          if (granted.length > 0) {
            log.info(TAG, 'Health Connect permissions granted', { count: granted.length });
            setWearable('health_connect');
          } else {
            log.warn(TAG, 'Health Connect permissions denied');
          }
        } catch (err) {
          log.error(TAG, 'Health Connect permission error', { error: String(err) });
        } finally {
          setConnectingId(null);
        }
        return;
      }
    },
    [wearable, setWearable, setGarminCredentials],
  );

  const handleContinue = useCallback(() => {
    log.info(TAG, 'Navigating to summary', { wearable });
    router.push('/(onboarding)/summary');
  }, [router, wearable]);

  const handleSkip = useCallback(() => {
    log.info(TAG, 'Skipping health setup — navigating to summary');
    router.push('/(onboarding)/summary');
  }, [router]);

  return (
    <SafeAreaView
      className="flex-1"
      edges={['bottom']}
      style={{ backgroundColor: Colors.background }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 24,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Main card */}
        <CompanionCard question="Hast du einen Fitness-Tracker?">
          <View>
            {visibleOptions.map((option) => (
              <WearableRow
                key={option.id}
                option={option}
                isConnected={wearable === option.id}
                isLoading={connectingId === option.id}
                onPress={handleWearablePress}
              />
            ))}
          </View>
        </CompanionCard>

        {/* Spacer */}
        <View style={{ flex: 1, minHeight: 32 }} />

        {/* Primary CTA — always enabled */}
        <Button
          variant="primary"
          size="lg"
          label="Weiter"
          onPress={handleContinue}
        />

        {/* Ghost skip link */}
        <Pressable
          onPress={handleSkip}
          accessibilityRole="button"
          accessibilityLabel="Später einrichten"
          style={({ pressed }) => ({
            alignItems: 'center',
            paddingVertical: 14,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: Colors.textSecondary,
            }}
          >
            Später einrichten
          </Text>
        </Pressable>
      </ScrollView>

      <Modal visible={garminModalVisible} transparent animationType="fade" onRequestClose={handleGarminClose}>
        <Pressable style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }} onPress={handleGarminClose}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <Pressable style={{ backgroundColor: '#FFF', borderRadius: 20, padding: 24, width: 320 }} onPress={() => {}}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: '600', color: Colors.textPrimary }}>Garmin Connect</Text>
                <Pressable onPress={handleGarminClose} hitSlop={12}><X size={20} color={Colors.textMuted} /></Pressable>
              </View>
              <Text style={{ fontSize: 14, color: Colors.textSecondary, marginBottom: 16 }}>
                Melde dich mit deinem Garmin Konto an. Die Verbindung wird nach der Kontoerstellung hergestellt.
              </Text>
              <Input label="E-Mail" leftIcon={Mail} placeholder="garmin@example.com" value={garminEmail} onChangeText={setGarminEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} />
              <View style={{ height: 12 }} />
              <Input label="Passwort" leftIcon={Lock} isPassword placeholder="Passwort" value={garminPassword} onChangeText={setGarminPassword} />
              {garminError && (
                <View style={{ backgroundColor: Colors.errorLight, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, marginTop: 12 }}>
                  <Text style={{ fontSize: 13, color: Colors.error }}>{garminError}</Text>
                </View>
              )}
              <View style={{ marginTop: 16 }}>
                <Button variant="primary" size="lg" label="Verbinden" onPress={handleGarminSubmit} />
              </View>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
