import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';

function Skeleton({ style, ...props }: ViewProps) {
  return <View style={[styles.skeleton, style]} {...props} />;
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#e5e5e5',
    borderRadius: 4,
  height: 20,
  },
});

Skeleton.displayName = 'Skeleton';

export { Skeleton };
