import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Heart, X, Star } from 'lucide-react-native';
import toast from '../lib/toast';
import { EventFeedback } from '../api/entities';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface Props {
  event: any;
  sessionId: string;
  onClose: () => void;
}

type FormData = {
  rating_profile_setup: string;
  rating_interests_helpful: string;
  rating_social_usefulness: string;
  met_match_in_person: string;
  open_to_other_event_types: string;
  match_experience_feedback: string;
  general_feedback: string;
};

interface FormErrors {
  rating_profile_setup?: string;
  rating_interests_helpful?: string;
  rating_social_usefulness?: string;
  met_match_in_person?: string;
  open_to_other_event_types?: string;
  match_experience_feedback?: string;
}

export default function FeedbackSurveyModal({ event, sessionId, onClose }: Props) {
  const [formData, setFormData] = useState<FormData>({
    rating_profile_setup: '',
    rating_interests_helpful: '',
    rating_social_usefulness: '',
    met_match_in_person: '',
    open_to_other_event_types: '',
    match_experience_feedback: '',
    general_feedback: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = () => {
    const errors: FormErrors = {};
    if (!formData.rating_profile_setup) {
      errors.rating_profile_setup = 'Please rate the profile setup experience.';
    }
    if (!formData.rating_interests_helpful) {
      errors.rating_interests_helpful = 'Please rate how helpful interests were.';
    }
    if (!formData.rating_social_usefulness) {
      errors.rating_social_usefulness = 'Please rate the social interaction experience.';
    }
    if (!formData.met_match_in_person) {
      errors.met_match_in_person = 'Please let us know if you met someone in person.';
    }
    if (!formData.open_to_other_event_types) {
      errors.open_to_other_event_types = 'Please let us know about future event interest.';
    }
    if (!formData.match_experience_feedback.trim()) {
      errors.match_experience_feedback = 'Please share what we could improve.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({ type: 'error', text1: 'Please complete all required fields.' });
      return;
    }
    setIsSubmitting(true);
    try {
      await EventFeedback.create({
        event_id: event.id,
        session_id: sessionId,
        rating_profile_setup: parseInt(formData.rating_profile_setup, 10),
        rating_interests_helpful: parseInt(formData.rating_interests_helpful, 10),
        rating_social_usefulness: parseInt(formData.rating_social_usefulness, 10),
        met_match_in_person: formData.met_match_in_person === 'true',
        open_to_other_event_types: formData.open_to_other_event_types === 'true',
        match_experience_feedback: formData.match_experience_feedback.trim(),
        general_feedback: formData.general_feedback.trim() || null,
      });
      toast({ type: 'success', text1: 'Thanks for your feedback 💘' });
      onClose();
    } catch (err) {
      console.error('Error submitting feedback:', err);
      toast({ type: 'error', text1: 'Failed to submit feedback. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map(r => (
        <TouchableOpacity
          key={r}
          onPress={() => onChange(String(r))}
          accessibilityRole="button"
          style={styles.starButton}
        >
          <Star
            size={24}
            color={parseInt(value, 10) >= r ? '#facc15' : '#d1d5db'}
            fill={parseInt(value, 10) >= r ? '#facc15' : 'none'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <Modal visible onRequestClose={onClose} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.heartCircle}>
              <Heart size={24} color="#fff" />
            </View>
            <TouchableOpacity onPress={onClose} accessibilityRole="button" style={styles.closeBtn}>
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>Enjoyed Hooked at {event?.name}? 💘</Text>
          <Text style={styles.subtitle}>Help us make the next one even better — takes 1 minute!</Text>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
            <View style={styles.field}>
              <Label style={styles.label}>How easy was it to set up your profile? *</Label>
              <StarRating value={formData.rating_profile_setup} onChange={v => handleInputChange('rating_profile_setup', v)} />
              {formErrors.rating_profile_setup && <Text style={styles.error}>{formErrors.rating_profile_setup}</Text>}
            </View>
            <View style={styles.field}>
              <Label style={styles.label}>How helpful were profile interests in choosing who to like? *</Label>
              <StarRating value={formData.rating_interests_helpful} onChange={v => handleInputChange('rating_interests_helpful', v)} />
              {formErrors.rating_interests_helpful && <Text style={styles.error}>{formErrors.rating_interests_helpful}</Text>}
            </View>
            <View style={styles.field}>
              <Label style={styles.label}>How easy was it to interact with others? *</Label>
              <StarRating value={formData.rating_social_usefulness} onChange={v => handleInputChange('rating_social_usefulness', v)} />
              {formErrors.rating_social_usefulness && <Text style={styles.error}>{formErrors.rating_social_usefulness}</Text>}
            </View>
            <View style={styles.field}>
              <Label style={styles.label}>Did you meet up with a match? *</Label>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formData.met_match_in_person}
                  onValueChange={v => handleInputChange('met_match_in_person', String(v))}
                >
                  <Picker.Item label="Select an option" value="" />
                  <Picker.Item label="Yes" value="true" />
                  <Picker.Item label="No" value="false" />
                </Picker>
              </View>
              {formErrors.met_match_in_person && <Text style={styles.error}>{formErrors.met_match_in_person}</Text>}
            </View>
            <View style={styles.field}>
              <Label style={styles.label}>Would you use Hooked at other event types? *</Label>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formData.open_to_other_event_types}
                  onValueChange={v => handleInputChange('open_to_other_event_types', String(v))}
                >
                  <Picker.Item label="Select an option" value="" />
                  <Picker.Item label="Yes" value="true" />
                  <Picker.Item label="No" value="false" />
                </Picker>
              </View>
              {formErrors.open_to_other_event_types && <Text style={styles.error}>{formErrors.open_to_other_event_types}</Text>}
            </View>
            <View style={styles.field}>
              <Label style={styles.label}>What would you improve? *</Label>
              <Textarea
                value={formData.match_experience_feedback}
                onChangeText={t => handleInputChange('match_experience_feedback', t)}
                placeholder="Tell us what could make the experience better..."
                style={styles.textarea}
              />
              {formErrors.match_experience_feedback && <Text style={styles.error}>{formErrors.match_experience_feedback}</Text>}
            </View>
            <View style={styles.field}>
              <Label style={styles.label}>Other feedback?</Label>
              <Textarea
                value={formData.general_feedback}
                onChangeText={t => handleInputChange('general_feedback', t)}
                placeholder="Anything else you'd like to share..."
                style={styles.textarea}
              />
            </View>
            <Button onPress={handleSubmit} disabled={isSubmitting} style={styles.submitBtn}>
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  container: { backgroundColor: '#fff', borderRadius: 12, width: '100%', maxHeight: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  heartCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#ec4899', alignItems: 'center', justifyContent: 'center' },
  closeBtn: { padding: 8 },
  title: { fontSize: 20, fontWeight: '700', paddingHorizontal: 16 },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4, paddingHorizontal: 16, marginBottom: 16 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 24 },
  field: { marginBottom: 16 },
  label: { marginBottom: 8 },
  starRow: { flexDirection: 'row' },
  starButton: { padding: 4 },
  pickerWrapper: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 4 },
  textarea: { marginTop: 4 },
  error: { color: '#ef4444', marginTop: 4, fontSize: 12 },
  submitBtn: { marginTop: 8, borderRadius: 8 },
});
