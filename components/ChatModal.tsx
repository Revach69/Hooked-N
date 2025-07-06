import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView } from 'react-native';
import { format } from 'date-fns';

interface MessageItem {
  id: string;
  content: string;
  sender_session_id: string;
  created_date: string;
}

interface ChatModalProps {
  match: any;
  onClose: () => void;
}

export default function ChatModal({ match, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const msg: MessageItem = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      sender_session_id: 'self',
      created_date: new Date().toISOString(),
    };
    setMessages(prev => [...prev, msg]);
    setNewMessage('');
  };

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <View style={{ flex: 1, padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
            {match.first_name}
          </Text>
          <FlatList
            data={messages}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={{ marginVertical: 4 }}>
                <Text>{item.content}</Text>
                <Text style={{ fontSize: 12, color: '#666' }}>
                  {format(new Date(item.created_date), 'HH:mm')}
                </Text>
              </View>
            )}
          />
        </View>
        <View style={{ flexDirection: 'row', padding: 16 }}>
          <TextInput
            value={newMessage}
            onChangeText={setNewMessage}
            style={{ flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 6 }}
            placeholder={`Message ${match.first_name}...`}
          />
          <TouchableOpacity onPress={sendMessage} style={{ paddingHorizontal: 16, justifyContent: 'center' }}>
            <Text>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
