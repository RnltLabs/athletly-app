import { View } from 'react-native';
import { Colors } from '@/lib/colors';

interface Props {
  total: number;
  current: number;
}

export function ProgressDots({ total, current }: Props) {
  return (
    <View className="flex-row items-center justify-center" style={{ gap: 8 }}>
      {Array.from({ length: total }, (_, index) => {
        const isActive = index === current;
        const isCompleted = index < current;
        const size = isActive ? 10 : 8;
        const color = isCompleted || isActive ? Colors.primary : Colors.surfaceMuted;

        return (
          <View
            key={index}
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
            }}
          />
        );
      })}
    </View>
  );
}
