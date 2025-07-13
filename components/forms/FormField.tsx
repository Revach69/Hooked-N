import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string;
  required?: boolean;
  dark?: boolean;
}

export default function FormField({ 
  label, 
  error, 
  required = false, 
  dark = false,
  style,
  ...textInputProps 
}: FormFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={[
        styles.label,
        dark && styles.labelDark,
        required && styles.required
      ]}>
        {label}
        {required && <Text style={styles.requiredMark}> *</Text>}
      </Text>
      
      <TextInput
        style={[
          styles.input,
          dark && styles.inputDark,
          error && styles.inputError,
          style
        ]}
        placeholderTextColor={dark ? '#9ca3af' : '#6b7280'}
        {...textInputProps}
      />
      
      {error && (
        <Text style={[
          styles.errorText,
          dark && styles.errorTextDark
        ]}>
          {error}
        </Text>
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
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  labelDark: {
    color: '#f9fafb',
  },
  required: {
    fontWeight: '700',
  },
  requiredMark: {
    color: '#ef4444',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    fontSize: 16,
    color: '#374151',
    minHeight: 48,
  },
  inputDark: {
    backgroundColor: '#374151',
    borderColor: '#4b5563',
    color: '#f9fafb',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginTop: 4,
  },
  errorTextDark: {
    color: '#f87171',
  },
}); 