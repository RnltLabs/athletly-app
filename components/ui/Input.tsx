import React, { useState } from 'react';
import { View, TextInput, Text, Pressable } from 'react-native';
import type { TextInputProps } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  isPassword?: boolean;
}

export function Input({
  label,
  error,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  isPassword = false,
  ...textInputProps
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const borderClass = error
    ? 'border-error'
    : focused
      ? 'border-primary'
      : 'border-border';

  return (
    <View className="w-full">
      {label && (
        <Text className="text-text-secondary text-sm mb-1.5 ml-1">{label}</Text>
      )}
      <View
        className={`
          flex-row items-center bg-surface border ${borderClass}
          rounded-xl h-12 px-4
        `}
      >
        {LeftIcon && (
          <LeftIcon size={20} color="#71717A" strokeWidth={2} className="mr-2" />
        )}
        <TextInput
          className="flex-1 text-text-primary text-base"
          placeholderTextColor="#71717A"
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...textInputProps}
        />
        {isPassword && (
          <Pressable onPress={() => setShowPassword((prev) => !prev)} className="ml-2">
            {showPassword
              ? <EyeOff size={20} color="#71717A" strokeWidth={2} />
              : <Eye size={20} color="#71717A" strokeWidth={2} />}
          </Pressable>
        )}
        {RightIcon && !isPassword && (
          <RightIcon size={20} color="#71717A" strokeWidth={2} className="ml-2" />
        )}
      </View>
      {error && (
        <Text className="text-error text-xs mt-1 ml-1">{error}</Text>
      )}
    </View>
  );
}

export default Input;
