import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewProps, TextProps, TouchableOpacityProps } from 'react-native';

const ToastProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => <>{children}</>;

const ToastViewport: React.FC = () => <View style={styles.viewport} />;

interface ToastProps extends ViewProps {
  variant?: 'default' | 'destructive';
}

const variantStyles = StyleSheet.create({
  default: { backgroundColor: '#333' },
  destructive: { backgroundColor: '#dc2626' },
});

const Toast = React.forwardRef<View, ToastProps>(
  ({ style, variant = 'default', children, ...props }, ref) => (
    <View
      ref={ref}
      style={[styles.toast, variantStyles[variant], style]}
      {...props}
    >
      {children}
    </View>
  )
);

const ToastAction = React.forwardRef<TouchableOpacity, TouchableOpacityProps>(({
  children,
  ...props
}, ref) => (
  <TouchableOpacity ref={ref} {...props}>
    {typeof children === 'string' ? <Text>{children}</Text> : children}
  </TouchableOpacity>
));

const ToastClose = React.forwardRef<TouchableOpacity, TouchableOpacityProps>((props, ref) => (
  <TouchableOpacity ref={ref} {...props}>
    <Text style={styles.close}>×</Text>
  </TouchableOpacity>
));

const ToastTitle = React.forwardRef<Text, TextProps>(({ style, ...props }, ref) => (
  <Text ref={ref} style={[styles.title, style]} {...props} />
));

const ToastDescription = React.forwardRef<Text, TextProps>(({ style, ...props }, ref) => (
  <Text ref={ref} style={[styles.description, style]} {...props} />
));

const styles = StyleSheet.create({
  viewport: { position: 'absolute', top: 0, width: '100%' },
  toast: { padding: 16, backgroundColor: '#333', borderRadius: 4, marginBottom: 8 },
  title: { fontWeight: 'bold', color: '#fff' },
  description: { color: '#fff' },
  close: { color: '#fff', fontSize: 12 },
});

ToastProvider.displayName = 'ToastProvider';
ToastViewport.displayName = 'ToastViewport';
Toast.displayName = 'Toast';
ToastTitle.displayName = 'ToastTitle';
ToastDescription.displayName = 'ToastDescription';
ToastClose.displayName = 'ToastClose';
ToastAction.displayName = 'ToastAction';

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
};
