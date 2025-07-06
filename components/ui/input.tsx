import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';

const Input = React.forwardRef<TextInput, TextInputProps>(({ style, ...props }, ref) => (
  <TextInput ref={ref} style={[styles.input, style]} {...props} />
));

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});

Input.displayName = 'Input';

export { Input };
