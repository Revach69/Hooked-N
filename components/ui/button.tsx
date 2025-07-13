import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';

export interface ButtonProps extends TouchableOpacityProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const variantStyles: Record<Required<ButtonProps>['variant'], ViewStyle> = {
  default: { backgroundColor: '#1f2937' },
  destructive: { backgroundColor: '#dc2626' },
  outline: { borderWidth: 1, borderColor: '#1f2937', backgroundColor: 'transparent' },
  secondary: { backgroundColor: '#e5e5e5' },
  ghost: { backgroundColor: 'transparent' },
  link: { backgroundColor: 'transparent' },
};

const textVariantStyles: Record<Required<ButtonProps>['variant'], TextStyle> = {
  default: { color: '#ffffff' },
  destructive: { color: '#ffffff' },
  outline: { color: '#1f2937' },
  secondary: { color: '#000000' },
  ghost: { color: '#1f2937' },
  link: { color: '#1f2937', textDecorationLine: 'underline' },
};

const sizeStyles: Record<Required<ButtonProps>['size'], ViewStyle> = {
  default: { paddingVertical: 8, paddingHorizontal: 16 },
  sm: { paddingVertical: 4, paddingHorizontal: 12 },
  lg: { paddingVertical: 12, paddingHorizontal: 20 },
  icon: { padding: 8, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
};

const Button = React.forwardRef<React.ComponentRef<typeof TouchableOpacity>, ButtonProps>(
  (
    {
      children,
      style,
      variant = 'default',
      size = 'default',
      ...props
    },
    ref
  ) => {
    return (
      <TouchableOpacity
        ref={ref}
        style={[
          styles.base,
          sizeStyles[size],
          variantStyles[variant],
          style,
        ]}
        {...props}
      >
        {typeof children === 'string' ? (
          <Text style={[styles.text, textVariantStyles[variant]]}>{children}</Text>
        ) : (
          children
        )}
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
  },
  text: {
    fontSize: 14,
  },
});

Button.displayName = 'Button';

export { Button };
