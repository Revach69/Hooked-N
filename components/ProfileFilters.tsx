import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import { Picker } from '@react-native-picker/picker';
import { Button } from './ui/button';

export interface Filters {
  age_min: number;
  age_max: number;
  gender: string;
  interests: string[];
}

interface Props {
  filters: Filters;
  onFiltersChange: (f: Filters) => void;
  onClose: () => void;
}

const MAIN_INTERESTS = [
  'music', 'tech', 'food', 'books', 'travel', 'art',
  'fitness', 'nature', 'movies', 'business', 'photography', 'dancing',
];

const ADDITIONAL_INTERESTS = [
  'yoga', 'gaming', 'comedy', 'startups', 'fashion', 'spirituality',
  'volunteering', 'crypto', 'cocktails', 'politics', 'hiking', 'design',
  'podcasts', 'pets', 'wellness',
];

export default function ProfileFilters({ filters, onFiltersChange, onClose }: Props) {
  const [localFilters, setLocalFilters] = useState<Filters>(filters);
  const [showMore, setShowMore] = useState(false);

  const toggleInterest = (interest: string) => {
    setLocalFilters(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const reset = { age_min: 18, age_max: 99, gender: 'all', interests: [] as string[] };
    setLocalFilters(reset);
    onFiltersChange(reset);
    onClose();
  };

  return (
    <Modal visible onRequestClose={onClose} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView>
            <Text style={styles.heading}>Age Range</Text>
            <Text style={styles.label}>Min: {localFilters.age_min}</Text>
            <Slider
              value={localFilters.age_min}
              onValueChange={v => setLocalFilters(p => ({ ...p, age_min: Math.min(v, p.age_max - 1) }))}
              minimumValue={18}
              maximumValue={99}
              step={1}
            />
            <Text style={styles.label}>Max: {localFilters.age_max}</Text>
            <Slider
              value={localFilters.age_max}
              onValueChange={v => setLocalFilters(p => ({ ...p, age_max: Math.max(v, p.age_min + 1) }))}
              minimumValue={18}
              maximumValue={99}
              step={1}
            />

            <Text style={[styles.heading, { marginTop: 16 }]}>Gender</Text>
            <Picker
              selectedValue={localFilters.gender}
              onValueChange={v => setLocalFilters(p => ({ ...p, gender: v }))}
            >
              <Picker.Item label="All" value="all" />
              <Picker.Item label="Men" value="man" />
              <Picker.Item label="Women" value="woman" />
              <Picker.Item label="Non-binary" value="non-binary" />
            </Picker>

            <Text style={[styles.heading, { marginTop: 16 }]}>Interests</Text>
            <View style={styles.interestsWrap}>
              {MAIN_INTERESTS.map(int => (
                <TouchableOpacity
                  key={int}
                  onPress={() => toggleInterest(int)}
                  style={[styles.interest, localFilters.interests.includes(int) && styles.interestActive]}
                >
                  <Text style={styles.interestText}>{int}</Text>
                </TouchableOpacity>
              ))}
              {showMore && ADDITIONAL_INTERESTS.map(int => (
                <TouchableOpacity
                  key={int}
                  onPress={() => toggleInterest(int)}
                  style={[styles.interest, localFilters.interests.includes(int) && styles.interestActive]}
                >
                  <Text style={styles.interestText}>{int}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity onPress={() => setShowMore(!showMore)} style={styles.showMoreBtn}>
              <Text style={styles.showMoreText}>{showMore ? 'Show Less' : 'Show More'}</Text>
            </TouchableOpacity>
          </ScrollView>
          <View style={styles.actions}>
            <Button onPress={handleReset} variant="outline" style={styles.actionBtn}>Reset</Button>
            <Button onPress={handleApply} style={styles.actionBtn}>Apply</Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 },
  container: { backgroundColor: '#fff', borderRadius: 12, padding: 16, maxHeight: '90%' },
  heading: { fontWeight: '600', marginBottom: 8, fontSize: 16 },
  label: { fontSize: 14, marginBottom: 4 },
  interestsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  interest: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12, borderWidth: 1, borderColor: '#ddd', margin: 2 },
  interestActive: { backgroundColor: '#ede9fe', borderColor: '#a78bfa' },
  interestText: { fontSize: 12 },
  showMoreBtn: { alignSelf: 'center', marginTop: 8 },
  showMoreText: { color: '#6b7280' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  actionBtn: { flex: 1, marginHorizontal: 4 },
});
