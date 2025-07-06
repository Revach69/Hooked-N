import React from 'react';
import { View, Text, StyleSheet, ViewProps, TextProps } from 'react-native';

export interface CardProps extends ViewProps {}

const Card = React.forwardRef<View, CardProps>(({ style, ...props }, ref) => (
  <View ref={ref} style={[styles.card, style]} {...props} />
));

const CardHeader = React.forwardRef<View, ViewProps>(({ style, ...props }, ref) => (
  <View ref={ref} style={[styles.header, style]} {...props} />
));

const CardTitle = React.forwardRef<Text, TextProps>(({ style, ...props }, ref) => (
  <Text ref={ref} style={[styles.title, style]} {...props} />
));

const CardDescription = React.forwardRef<Text, TextProps>(({ style, ...props }, ref) => (
  <Text ref={ref} style={[styles.description, style]} {...props} />
));

const CardContent = React.forwardRef<View, ViewProps>(({ style, ...props }, ref) => (
  <View ref={ref} style={[styles.content, style]} {...props} />
));

const CardFooter = React.forwardRef<View, ViewProps>(({ style, ...props }, ref) => (
  <View ref={ref} style={[styles.footer, style]} {...props} />
));

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
  header: { padding: 16 },
  title: { fontSize: 16, fontWeight: '600' },
  description: { fontSize: 12, color: '#666' },
  content: { padding: 16, paddingTop: 0 },
  footer: { padding: 16, paddingTop: 0, flexDirection: 'row', alignItems: 'center' },
});

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardTitle.displayName = 'CardTitle';
CardDescription.displayName = 'CardDescription';
CardContent.displayName = 'CardContent';
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
