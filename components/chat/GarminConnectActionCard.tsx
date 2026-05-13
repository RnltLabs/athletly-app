/**
 * GarminConnectActionCard - Athletly V2
 *
 * In-chat surface for the agent's request_garmin_connect action.
 * Renders an ActionCard that opens the existing GarminConnectModal.
 * On success, the card collapses and the agent continues the flow.
 */

import React, { useState } from 'react';
import { ActionCard } from './ActionCard';
import { GarminConnectModal } from '@/components/profile/GarminConnectModal';
import { log } from '@/lib/logger';

const TAG = 'GarminConnectActionCard';

interface GarminConnectActionCardProps {
  label?: string;
  description?: string;
  onSuccess?: () => void;
}

const DEFAULT_LABEL = 'Garmin verbinden';
const DEFAULT_DESCRIPTION = 'Verbinde Garmin Connect, damit ich deine Trainingsdaten lesen kann.';

export function GarminConnectActionCard({
  label = DEFAULT_LABEL,
  description = DEFAULT_DESCRIPTION,
  onSuccess,
}: GarminConnectActionCardProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [connected, setConnected] = useState(false);

  const handleSuccess = () => {
    log.info(TAG, 'Garmin connect success');
    setModalVisible(false);
    setConnected(true);
    onSuccess?.();
  };

  if (connected) {
    return (
      <ActionCard
        label="Garmin verbunden"
        description="Verbindung steht. Wir konnen weitermachen."
        onPress={() => {}}
        disabled
        variant="subtle"
      />
    );
  }

  return (
    <>
      <ActionCard
        label={label}
        description={description}
        onPress={() => setModalVisible(true)}
      />
      <GarminConnectModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}

export default GarminConnectActionCard;
