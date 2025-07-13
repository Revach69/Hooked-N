import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Label } from './ui/label';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
}

export default function FormField({
  label,
  error,
  required = false,
  helperText,
  style,
  ...inputProps
}: FormFieldProps) {
  return (
    <View style={styles.container}>
      <Label style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Label>
      
      <TextInput
        style={[
          styles.input,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor="#9ca3af"
        {...inputProps}
      />
      
      {helperText && !error && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  helperText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 4,
  },
}); 