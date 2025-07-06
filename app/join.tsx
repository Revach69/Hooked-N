import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Event } from '../api/entities';
import { Button } from '../components/ui/button';

export default function Join() {
  const navigation = useNavigation<any>();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateAndJoin = async () => {
    if (!code.trim()) {
      setError('Event code is required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const events = await Event.filter({ code: code.trim().toUpperCase() });
      if (events.length === 0) {
        setError('Invalid event code.');
        setLoading(false);
        return;
      }

      const foundEvent = events[0];
      const nowUTC = new Date().toISOString();

      if (!foundEvent.starts_at || !foundEvent.expires_at) {
        setError('This event is not configured correctly. Please contact the organizer.');
        setLoading(false);
        return;
      }

      if (nowUTC < foundEvent.starts_at) {
        setError("This event hasn't started yet. Try again soon!");
        setLoading(false);
        return;
      }

      if (nowUTC >= foundEvent.expires_at) {
        setError('This event has ended.');
        setLoading(false);
        return;
      }

      await AsyncStorage.setItem('currentEventId', foundEvent.id);
      await AsyncStorage.setItem('currentEventCode', foundEvent.code);

      const existingSessionId = await AsyncStorage.getItem('currentSessionId');
      if (existingSessionId) {
        try {
          const { EventProfile } = await import('../api/entities');
          const profiles = await EventProfile.filter({
            session_id: existingSessionId,
            event_id: foundEvent.id,
          });

          if (profiles.length > 0) {
            navigation.navigate('Discovery');
            return;
          }
        } catch (err) {
          console.warn('Error checking existing profile:', err);
        }
      }

      navigation.navigate('Consent');
    } catch (err) {
      console.error('Error processing event join:', err);
      setError('Unable to process event access. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputError = !!error && !code.trim();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Join Event</Text>
        <TextInput
          placeholder="Enter Code"
          value={code}
          onChangeText={(text) => setCode(text.toUpperCase())}
          autoCapitalize="characters"
          style={[styles.input, inputError && styles.inputError]}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          onPress={validateAndJoin}
          disabled={loading || !code.trim()}
          style={styles.button}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Join</Text>}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  content: { gap: 12 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inputError: { borderColor: '#f43f5e' },
  error: { color: '#f43f5e', marginTop: 4, textAlign: 'center' },
  button: { marginTop: 12 },
  buttonText: { color: '#fff' },
});
