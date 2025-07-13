
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Event } from '../../api/entities';
import { X, Save, Loader2 } from 'lucide-react-native';
import toast from '../../lib/toast';
import { format } from 'date-fns';

interface EventData {
  id: string | number;
  name?: string;
  code?: string;
  location?: string;
  description?: string;
  organizer_email?: string;
  starts_at?: string;
  expires_at?: string;
}

interface FormData {
  name: string;
  code: string;
  location: string;
  description: string;
  organizer_email: string;
  starts_at: string;
  expires_at: string;
}

export interface EventFormModalProps {
  event?: EventData | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EventFormModal: React.FC<EventFormModalProps> = ({ event, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    code: '',
    location: '',
    description: '',
    organizer_email: '',
    starts_at: '',
    expires_at: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  useEffect(() => {
    if (isOpen) {
      if (event) {
        setFormData({
          name: event.name || '',
          code: (event.code || '').toUpperCase(), // Normalize existing code to uppercase
          location: event.location || '',
          description: event.description || '',
          organizer_email: event.organizer_email || '',
          starts_at: event.starts_at ? format(new Date(event.starts_at), "yyyy-MM-dd'T'HH:mm") : '',
          expires_at: event.expires_at ? format(new Date(event.expires_at), "yyyy-MM-dd'T'HH:mm") : '',
        });
      } else {
        setFormData({
          name: '', code: '', location: '', description: '', organizer_email: '',
          starts_at: '', expires_at: '',
        });
      }
      setFormErrors({});
    }
  }, [event, isOpen]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    let processedValue = value;
    if (field === 'code') {
      processedValue = value.toUpperCase(); // Ensure code is always uppercase
    }
    setFormData(prev => ({ ...prev, [field]: processedValue }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.starts_at) {
      errors.starts_at = "Start date is required.";
    }
    if (!formData.expires_at) {
      errors.expires_at = "End date is required.";
    }
    
    if (formData.starts_at && formData.expires_at) {
      if (new Date(formData.expires_at) <= new Date(formData.starts_at)) {
        errors.expires_at = "End date must be after the start date.";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // formData.code is already uppercased via handleInputChange or useEffect
      const payload = {
        ...formData,
        starts_at: formData.starts_at ? new Date(formData.starts_at).toISOString() : null,
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
      };

      if (event) {
        await Event.update(String(event.id), payload);
        toast.success(`Event "${payload.name}" updated successfully.`);
      } else {
        await Event.create(payload);
        toast.success(`Event "${payload.name}" created successfully.`);
      }
      onSuccess();
    } catch (error) {
      console.error('Error submitting event form:', error);
      toast.error('Failed to save event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent style={styles.content}>
        <DialogHeader style={styles.header}>
          <View style={styles.headerRow}>
            <DialogTitle style={styles.title}>{event ? 'Edit Event' : 'Create New Event'}</DialogTitle>
            <Button variant="ghost" size="icon" onPress={onClose}>
              <X size={16} />
            </Button>
          </View>
        </DialogHeader>

        <ScrollView style={styles.form}>
          <View style={styles.field}>
            <Label>Event Name</Label>
            <Input
              value={formData.name}
              onChangeText={(t) => handleInputChange('name', t)}
            />
          </View>
            
          <View style={styles.field}>
            <Label>Access Code *</Label>
            <Input
              value={formData.code}
              onChangeText={(t) => handleInputChange('code', t)}
              placeholder="e.g., PARTY2024"
              style={formErrors.code ? styles.errorInput : undefined}
            />
            {formErrors.code ? <Text style={styles.error}>{formErrors.code}</Text> : null}
          </View>

          <View style={styles.field}>
            <Label>Starts At</Label>
            <Input
              value={formData.starts_at}
              onChangeText={(t) => handleInputChange('starts_at', t)}
              placeholder="YYYY-MM-DD HH:mm"
            />
            {formErrors.starts_at ? <Text style={styles.error}>{formErrors.starts_at}</Text> : null}
          </View>

          <View style={styles.field}>
            <Label>Expires At</Label>
            <Input
              value={formData.expires_at}
              onChangeText={(t) => handleInputChange('expires_at', t)}
              placeholder="YYYY-MM-DD HH:mm"
            />
            {formErrors.expires_at ? <Text style={styles.error}>{formErrors.expires_at}</Text> : null}
          </View>
            
          <View style={styles.field}>
            <Label>Location</Label>
            <Input value={formData.location} onChangeText={(t) => handleInputChange('location', t)} />
          </View>

          <View style={styles.field}>
            <Label>Description</Label>
            <Textarea value={formData.description} onChangeText={(t) => handleInputChange('description', t)} />
          </View>

          <View style={styles.field}>
            <Label>Organizer Email</Label>
            <Input value={formData.organizer_email} onChangeText={(t) => handleInputChange('organizer_email', t)} />
          </View>

          <View style={styles.buttonRow}>
            <Button variant="outline" onPress={onClose} style={styles.flex1}>
              Cancel
            </Button>
            <Button onPress={handleSubmit} disabled={isSubmitting} style={styles.flex1}>
              {isSubmitting ? <Loader2 size={16} /> : <Save size={16} style={{ marginRight: 4 }} />}
              <Text>{event ? 'Save Changes' : 'Create Event'}</Text>
            </Button>
          </View>
        </ScrollView>
      </DialogContent>
    </Dialog>
  );
};

const styles = StyleSheet.create({
  content: { maxHeight: '90%', width: '100%' },
  header: { padding: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: 'bold' },
  form: { padding: 16 },
  field: { marginBottom: 12 },
  error: { color: '#dc2626', fontSize: 12, marginTop: 4 },
  errorInput: { borderColor: '#dc2626' },
  buttonRow: { flexDirection: 'row', gap: 8, paddingTop: 8 },
  flex1: { flex: 1 },
});

export default EventFormModal;
