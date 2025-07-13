import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, Pressable } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { DropdownOption } from '../../types';

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  dark?: boolean;
  disabled?: boolean;
}

export default function Dropdown({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  dark = false,
  disabled = false 
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find(option => option.value === value);

  const handleSelect = (selectedValue: string): void => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  const handleToggle = (): void => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.dropdown,
          dark && styles.dropdownDark,
          disabled && styles.dropdownDisabled
        ]}
        onPress={handleToggle}
        disabled={disabled}
      >
        <Text style={[
          value ? styles.dropdownText : styles.dropdownPlaceholder,
          dark && styles.dropdownTextDark,
          disabled && styles.dropdownTextDisabled
        ]}>
          {selected ? selected.label : placeholder}
        </Text>
        <ChevronDown 
          size={16} 
          color={dark ? '#fff' : '#6b7280'} 
          style={[styles.chevron, isOpen && styles.chevronRotated]}
        />
      </Pressable>

      <Modal 
        visible={isOpen} 
        transparent 
        animationType="fade" 
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          onPress={() => setIsOpen(false)}
          activeOpacity={1}
        >
          <View style={[
            styles.modalContent, 
            dark && styles.modalContentDark
          ]}>
            <FlatList
              data={options}
              keyExtractor={item => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    item.value === value && styles.optionSelected,
                    dark && styles.optionDark,
                    item.value === value && dark && styles.optionSelectedDark
                  ]}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text style={[
                    styles.optionText,
                    item.value === value && styles.optionTextSelected,
                    dark && styles.optionTextDark,
                    item.value === value && dark && styles.optionTextSelectedDark
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    minHeight: 48,
  },
  dropdownDark: {
    backgroundColor: '#374151',
    borderColor: '#4b5563',
  },
  dropdownDisabled: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
  dropdownText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  dropdownTextDark: {
    color: '#fff',
  },
  dropdownTextDisabled: {
    color: '#9ca3af',
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: '#9ca3af',
    flex: 1,
  },
  chevron: {
    marginLeft: 8,
  },
  chevronRotated: {
    transform: [{ rotate: '180deg' }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    maxHeight: 300,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalContentDark: {
    backgroundColor: '#374151',
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  optionSelected: {
    backgroundColor: '#eff6ff',
  },
  optionDark: {
    borderBottomColor: '#4b5563',
  },
  optionSelectedDark: {
    backgroundColor: '#1f2937',
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
  },
  optionTextSelected: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
  optionTextDark: {
    color: '#fff',
  },
  optionTextSelectedDark: {
    color: '#60a5fa',
    fontWeight: '600',
  },
}); 