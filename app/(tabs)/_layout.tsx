/**
 * Tab Layout — Athletly V2
 *
 * Bottom tab navigation with 4 tabs:
 * Today (Home), Plan, Coach, Profil.
 * Dark theme, OLED-optimized.
 * Wrapped in ErrorBoundary for graceful crash handling.
 */

import { Tabs } from 'expo-router';
import { Home, Calendar, MessageCircle, User } from 'lucide-react-native';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Colors } from '@/lib/colors';

const TAB_BAR_STYLE = {
  backgroundColor: Colors.background,
  borderTopColor: Colors.border,
  borderTopWidth: 0.5,
} as const;

const TAB_BAR_LABEL_STYLE = {
  fontSize: 10,
} as const;

export default function TabLayout() {
  return (
    <ErrorBoundary>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: TAB_BAR_STYLE,
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textMuted,
          tabBarLabelStyle: TAB_BAR_LABEL_STYLE,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Today',
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="plan"
          options={{
            title: 'Plan',
            tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="coach"
          options={{
            title: 'Coach',
            tabBarIcon: ({ color, size }) => (
              <MessageCircle size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profil',
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          }}
        />
      </Tabs>
    </ErrorBoundary>
  );
}
