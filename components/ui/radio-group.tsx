import React from 'react';
import { View, TouchableOpacity, ViewStyle, Text, StyleSheet } from 'react-native';

interface RadioGroupProps {
  value: string;
  onValueChange?: (value: string) => void;
  children?: React.ReactNode;
  style?: ViewStyle;
}

const RadioGroup: React.FC<RadioGroupProps> = ({ value, onValueChange, children, style }) => (
  <View style={[styles.group, style]}>
    {React.Children.map(children, (child: any) =>
      React.cloneElement(child, {
        selected: child.props.value === value,
        onSelect: onValueChange,
      })
    )}
  </View>
);

interface RadioGroupItemProps {
  value: string;
  selected?: boolean;
  onSelect?: (value: string) => void;
  style?: ViewStyle;
  children?: React.ReactNode;
}

const RadioGroupItem: React.FC<RadioGroupItemProps> = ({ value, selected, onSelect, style, children }) => (
  <TouchableOpacity onPress={() => onSelect?.(value)} style={[styles.item, selected && styles.itemSelected, style]}>
    {selected && <View style={styles.inner} />}
    {typeof children === 'string' ? <Text>{children}</Text> : children}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  group: { gap: 8 },
  item: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemSelected: {
    borderColor: '#000',
  },
  inner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000',
  },
});

RadioGroup.displayName = 'RadioGroup';
RadioGroupItem.displayName = 'RadioGroupItem';

export { RadioGroup, RadioGroupItem };
