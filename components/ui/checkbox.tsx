import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';

export interface CheckboxProps extends TouchableOpacityProps {
  checked?: boolean;
  // eslint-disable-next-line no-unused-vars
  onChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<React.ComponentRef<typeof TouchableOpacity>, CheckboxProps>(
  ({ checked = false, onChange, style, children, ...props }, ref) => (
    <TouchableOpacity
      ref={ref}
      onPress={() => onChange?.(!checked)}
      style={[styles.box, checked && styles.boxChecked, style]}
      {...props}
    >
      {checked && <Text style={styles.check}>✓</Text>}
      {children}
    </TouchableOpacity>
  )
);

const styles = StyleSheet.create({
  box: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: {
    backgroundColor: '#000',
  },
  check: {
    color: '#fff',
  },
});

Checkbox.displayName = 'Checkbox';

export { Checkbox };
