import React from 'react';
import { Pressable, Text, ActivityIndicator, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'icon';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label?: string;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary rounded-xl',
  secondary: 'bg-surface-elevated border border-border rounded-xl',
  ghost: 'bg-transparent rounded-xl',
  destructive: 'bg-error/10 rounded-xl',
  icon: 'rounded-full items-center justify-center',
};

const variantTextClasses: Record<ButtonVariant, string> = {
  primary: 'text-white font-semibold',
  secondary: 'text-text-primary font-medium',
  ghost: 'text-text-secondary font-medium',
  destructive: 'text-error font-semibold',
  icon: 'text-text-primary',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-4',
  md: 'h-11 px-5',
  lg: 'h-[52px] px-6',
};

const iconSizeMap: Record<ButtonSize, number> = { sm: 16, md: 20, lg: 24 };
const textSizeMap: Record<ButtonSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-base',
};

const iconOnlySizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-[52px] w-[52px]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  label,
  icon: Icon,
  iconPosition = 'left',
  onPress,
  disabled = false,
  loading = false,
}: ButtonProps) {
  const isIcon = variant === 'icon';
  const iconSize = iconSizeMap[size];
  const iconColor =
    variant === 'primary' ? '#FFFFFF' :
    variant === 'destructive' ? '#F87171' :
    variant === 'ghost' ? '#A1A1AA' :
    '#FAFAFA';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`
        flex-row items-center justify-center
        ${isIcon ? iconOnlySizeClasses[size] : sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabled ? 'opacity-50' : ''}
      `}
      style={({ pressed }) => ({ opacity: pressed && !disabled ? 0.8 : disabled ? 0.5 : 1 })}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={label}
    >
      {loading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : (
        <View className="flex-row items-center gap-2">
          {Icon && iconPosition === 'left' && (
            <Icon size={iconSize} color={iconColor} strokeWidth={2} />
          )}
          {label && !isIcon && (
            <Text className={`${variantTextClasses[variant]} ${textSizeMap[size]}`}>
              {label}
            </Text>
          )}
          {Icon && iconPosition === 'right' && (
            <Icon size={iconSize} color={iconColor} strokeWidth={2} />
          )}
        </View>
      )}
    </Pressable>
  );
}

export default Button;
