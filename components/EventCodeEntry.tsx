import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity } from 'react-native';

interface EventCodeEntryProps {
  onSubmit: (code: string) => void;
  onClose: () => void;
}

export default function EventCodeEntry({ onSubmit, onClose }: EventCodeEntryProps) {
  const [code, setCode] = useState('');

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>Enter Event Code</Text>
        <TextInput
          value={code}
          onChangeText={text => setCode(text.toUpperCase())}
          placeholder="e.g., WED2025"
          style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 16 }}
          autoCapitalize="characters"
        />
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <TouchableOpacity onPress={onClose} style={{ marginRight: 12 }}>
            <Text>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onSubmit(code)} disabled={!code.trim()}>
            <Text>Join</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
