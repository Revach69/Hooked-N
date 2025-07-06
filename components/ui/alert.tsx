import React from 'react';
import { View, Text, StyleSheet, ViewProps, TextProps } from 'react-native';

interface AlertProps extends ViewProps {
  variant?: 'default' | 'destructive';
}

const variantStyles = StyleSheet.create({
  default: { backgroundColor: '#f1f5f9', borderColor: '#cbd5e1' },
  destructive: { backgroundColor: '#fee2e2', borderColor: '#fecaca' },
});

const Alert = React.forwardRef<View, AlertProps>(
  ({ style, variant = 'default', children, ...props }, ref) => (
    <View
      ref={ref}
      style={[styles.base, variantStyles[variant], style]}
      {...props}
    >
      {children}
    </View>
  )
);

const AlertTitle = React.forwardRef<Text, TextProps>(({ style, ...props }, ref) => (
  <Text ref={ref} style={[styles.title, style]} {...props} />
));

const AlertDescription = React.forwardRef<Text, TextProps>(
  ({ style, ...props }, ref) => (
    <Text ref={ref} style={[styles.description, style]} {...props} />
  )
);

const styles = StyleSheet.create({
  base: {
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
  },
  title: { fontWeight: 'bold', marginBottom: 4 },
  description: { fontSize: 12 },
});

Alert.displayName = 'Alert';
AlertTitle.displayName = 'AlertTitle';
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
