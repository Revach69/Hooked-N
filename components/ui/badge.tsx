import React from 'react';
import { Text, StyleSheet, TextProps } from 'react-native';

export interface BadgeProps extends TextProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

function Badge({ style, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <Text style={[styles.base, variantStyles[variant], style]} {...props}>
      {children}
    </Text>
  );
}

const variantStyles = StyleSheet.create({
  default: {
    backgroundColor: '#1f2937',
    color: '#ffffff',
  },
  secondary: {
    backgroundColor: '#e5e5e5',
    color: '#000000',
  },
  destructive: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1f2937',
    color: '#1f2937',
  },
});

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    fontSize: 12,
    borderRadius: 4,
    overflow: 'hidden',
  },
});

Badge.displayName = 'Badge';

export { Badge };
