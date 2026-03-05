/**
 * Profile Screen — Athletly V2
 *
 * Account settings, connected services, and app preferences.
 * Design spec section 7.5. German text throughout.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Watch,
  Smartphone,
  Bell,
  Globe,
  Mail,
  Lock,
  LogOut,
  Trash2,
} from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useHealthStore } from '@/store/healthStore';
import { useAuth } from '@/hooks/useAuth';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { Card } from '@/components/ui';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { SettingsRow } from '@/components/profile/SettingsRow';
import { ServiceStatus } from '@/components/profile/ServiceStatus';
import { GarminConnectModal } from '@/components/profile/GarminConnectModal';

const APP_VERSION = '1.0.0';

interface GarminStatus {
  connected: boolean;
  last_sync?: string;
}

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const connectedServices = useHealthStore((s) => s.connectedServices);
  const fetchConnectedServices = useHealthStore((s) => s.fetchConnectedServices);
  const { signOut } = useAuth();

  const [garminStatus, setGarminStatus] = useState<GarminStatus>({ connected: false });
  const [garminLoading, setGarminLoading] = useState(false);
  const [showGarminModal, setShowGarminModal] = useState(false);

  const email = user?.email ?? '';
  const createdAt = user?.created_at;

  const garminService = connectedServices.find((s) => s.provider === 'garmin');
  const isGarminConnected = garminStatus.connected || (garminService?.connected ?? false);
  const lastSync = garminStatus.last_sync ?? garminService?.lastSync;

  /**
   * Load Garmin connection status from the API.
   */
  const loadGarminStatus = useCallback(async () => {
    try {
      const status = await apiGet<GarminStatus>('/garmin/status');
      setGarminStatus(status);
    } catch {
      // Fail silently — status defaults to disconnected
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchConnectedServices(user.id);
      loadGarminStatus();
    }
  }, [user?.id, fetchConnectedServices, loadGarminStatus]);

  /**
   * Sync Garmin data.
   */
  const handleGarminSync = useCallback(async () => {
    setGarminLoading(true);
    try {
      await apiPost('/garmin/sync');
      await loadGarminStatus();
    } catch {
      Alert.alert('Sync fehlgeschlagen', 'Garmin-Daten konnten nicht synchronisiert werden.');
    } finally {
      setGarminLoading(false);
    }
  }, [loadGarminStatus]);

  /**
   * Disconnect Garmin.
   */
  const handleGarminDisconnect = useCallback(() => {
    Alert.alert(
      'Garmin trennen',
      'Moechtest du die Verbindung zu Garmin Connect wirklich trennen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Trennen',
          style: 'destructive',
          onPress: async () => {
            setGarminLoading(true);
            try {
              await apiDelete('/garmin/disconnect');
              setGarminStatus({ connected: false });
              if (user?.id) {
                fetchConnectedServices(user.id);
              }
            } catch {
              Alert.alert('Fehler', 'Verbindung konnte nicht getrennt werden.');
            } finally {
              setGarminLoading(false);
            }
          },
        },
      ],
    );
  }, [user?.id, fetchConnectedServices]);

  /**
   * Handle successful Garmin connect.
   */
  const handleGarminConnected = useCallback(() => {
    setShowGarminModal(false);
    loadGarminStatus();
    if (user?.id) {
      fetchConnectedServices(user.id);
    }
  }, [user?.id, fetchConnectedServices, loadGarminStatus]);

  /**
   * Logout with confirmation dialog.
   */
  const handleLogout = useCallback(() => {
    Alert.alert(
      'Abmelden',
      'Moechtest du dich wirklich abmelden?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Abmelden',
          style: 'destructive',
          onPress: async () => {
            const result = await signOut();
            if (!result.success) {
              Alert.alert('Fehler', result.error ?? 'Abmelden fehlgeschlagen.');
            }
          },
        },
      ],
    );
  }, [signOut]);

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-background">
      <View className="px-4 pt-2 pb-2">
        <Text className="text-text-primary text-2xl font-bold">
          Profil
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-8"
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader email={email} createdAt={createdAt} />

        {/* Verbundene Dienste */}
        <SectionHeader title="Verbundene Dienste" />
        <Card>
          <ServiceStatus
            name="Garmin Connect"
            icon={Watch}
            isConnected={isGarminConnected}
            lastSync={lastSync}
            onConnect={() => setShowGarminModal(true)}
            onSync={handleGarminSync}
            onDisconnect={handleGarminDisconnect}
            isLoading={garminLoading}
          />
          <View className="h-px bg-border/30 ml-14" />
          <ServiceStatus
            name="Apple Health"
            icon={Smartphone}
            isConnected={false}
          />
          <View className="py-1.5 px-4">
            <Text className="text-xs text-text-muted ml-11">Demnaechst</Text>
          </View>
        </Card>

        {/* Einstellungen */}
        <SectionHeader title="Einstellungen" />
        <Card>
          <SettingsRow
            icon={Globe}
            label="Sprache"
            value="Deutsch"
            onPress={() => {}}
          />
          <SettingsRow
            icon={Bell}
            label="Benachrichtigungen"
            onPress={() => {}}
            isLast
          />
        </Card>

        {/* Account */}
        <SectionHeader title="Account" />
        <Card>
          <SettingsRow
            icon={Mail}
            label="E-Mail"
            value={email}
          />
          <SettingsRow
            icon={Lock}
            label="Passwort aendern"
            onPress={() => {}}
          />
          <SettingsRow
            icon={LogOut}
            label="Abmelden"
            onPress={handleLogout}
            isDestructive
          />
          <SettingsRow
            icon={Trash2}
            label="Konto loeschen"
            isDestructive
            isLast
          />
        </Card>

        {/* App Version */}
        <Text className="text-text-muted text-xs text-center mt-6">
          Athletly v{APP_VERSION}
        </Text>
      </ScrollView>

      <GarminConnectModal
        visible={showGarminModal}
        onClose={() => setShowGarminModal(false)}
        onSuccess={handleGarminConnected}
      />
    </SafeAreaView>
  );
}

/**
 * Section header for profile groups.
 */
function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="text-text-secondary text-xs uppercase tracking-wider mb-2 mt-6 ml-1">
      {title}
    </Text>
  );
}
