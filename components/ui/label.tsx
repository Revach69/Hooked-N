import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

const Label = React.forwardRef<Text, TextProps>(({ style, ...props }, ref) => (
  <Text ref={ref} style={[styles.label, style]} {...props} />
));

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '500' },
});

Label.displayName = 'Label';

export { Label };
