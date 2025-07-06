import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';

interface ProgressProps extends ViewProps {
  value?: number;
}

const Progress = React.forwardRef<View, ProgressProps>(({ value = 0, style, ...props }, ref) => (
  <View ref={ref} style={[styles.track, style]} {...props}>
    <View style={[styles.bar, { width: `${Math.max(0, Math.min(value, 100))}%` }]} />
  </View>
));

const styles = StyleSheet.create({
  track: { height: 8, width: '100%', backgroundColor: '#eee', borderRadius: 4, overflow: 'hidden' },
  bar: { height: '100%', backgroundColor: '#000' },
});

Progress.displayName = 'Progress';

export { Progress };
