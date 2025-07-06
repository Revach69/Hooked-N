import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';

const Textarea = React.forwardRef<TextInput, TextInputProps>(({ style, ...props }, ref) => (
  <TextInput ref={ref} style={[styles.textarea, style]} multiline {...props} />
));

const styles = StyleSheet.create({
  textarea: {
    minHeight: 60,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});

Textarea.displayName = 'Textarea';

export { Textarea };
