/**
 * PreSignupChat - Athletly V2
 *
 * Full-screen pre-signup chat state. Shown when the user has no Supabase
 * session. Renders a welcome message + signup CTA + login link. No SSE
 * connection is established here - the real chat takes over the moment a
 * session is acquired (handled at the root layout).
 */

import React, { useState } from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientHeader } from '@/components/ui/GradientHeader';
import { ChatBubble } from './ChatBubble';
import { ActionCard } from './ActionCard';
import { SignupModal } from './SignupModal';
import type { ChatMessage } from '@/types/chat';

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-pre-signup',
  role: 'assistant',
  content:
    'Hi! Ich bin Athletly, dein AI-Coach. Erstell dir kurz einen Account oder melde dich an, dann legen wir los.',
  timestamp: new Date(),
  synced: false,
};

type AuthMode = 'signup' | 'login';

type Item =
  | { kind: 'message'; message: ChatMessage }
  | { kind: 'action'; id: string; variant: AuthMode };

// FlatList is inverted, so index 0 renders at the BOTTOM of the screen.
// Visual order from top to bottom: welcome -> signup CTA -> login link.
const ITEMS: Item[] = [
  { kind: 'action', id: 'login-link', variant: 'login' },
  { kind: 'action', id: 'signup-action', variant: 'signup' },
  { kind: 'message', message: WELCOME_MESSAGE },
];

export function PreSignupChat() {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<AuthMode>('signup');

  const openSignup = () => {
    setModalMode('signup');
    setModalVisible(true);
  };

  const openLogin = () => {
    setModalMode('login');
    setModalVisible(true);
  };

  const renderItem = ({ item }: { item: Item }) => {
    if (item.kind === 'message') {
      return <ChatBubble message={item.message} />;
    }
    if (item.variant === 'signup') {
      return (
        <ActionCard
          label="Account erstellen"
          description="Erstelle einen kostenlosen Account und wir legen los."
          onPress={openSignup}
        />
      );
    }
    return (
      <ActionCard
        label="Anmelden"
        description="Schon dabei? Melde dich mit deiner E-Mail an."
        variant="subtle"
        onPress={openLogin}
      />
    );
  };

  const keyExtractor = (item: Item) =>
    item.kind === 'message' ? item.message.id : item.id;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['bottom']}>
      <View className="flex-1 bg-background">
        <GradientHeader title="Athletly" />
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <FlatList
            data={ITEMS}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            inverted
            contentContainerClassName="px-4 py-2"
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        </KeyboardAvoidingView>
        <SignupModal
          visible={modalVisible}
          initialMode={modalMode}
          onClose={() => setModalVisible(false)}
          onSuccess={() => setModalVisible(false)}
        />
      </View>
    </SafeAreaView>
  );
}

export default PreSignupChat;
