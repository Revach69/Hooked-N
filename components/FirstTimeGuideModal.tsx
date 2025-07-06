import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { X } from 'lucide-react-native';

interface Props {
  onClose: () => void;
}

const GUIDE_IMAGE_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/9f8621f07_HOOKED-tips.png';

const slides = [
  {
    key: 'discover',
    title: 'Discover Singles',
    text: 'Browse profiles at your event and find people you vibe with.',
    image: GUIDE_IMAGE_URL,
  },
  {
    key: 'match',
    title: 'Get Matches',
    text: 'Like someone and get notified when they like you back.',
    image: GUIDE_IMAGE_URL,
  },
  {
    key: 'share',
    title: 'Share Contacts',
    text: 'After the event you can exchange contact info with matches.',
    image: GUIDE_IMAGE_URL,
  },
];

export default function FirstTimeGuideModal({ onClose }: Props) {
  const [page, setPage] = useState(0);
  const { width } = Dimensions.get('window');
  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    setPage(Math.round(offsetX / width));
  };

  return (
    <Modal visible onRequestClose={onClose} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close guide" accessibilityRole="button">
            <X size={20} color="#fff" />
          </TouchableOpacity>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onMomentumScrollEnd}
          >
            {slides.map(slide => (
              <View key={slide.key} style={{ width }}>
                <Image source={{ uri: slide.image }} style={styles.image} resizeMode="contain" />
                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.text}>{slide.text}</Text>
              </View>
            ))}
          </ScrollView>
          <View style={styles.indicatorWrap}>
            {slides.map((_, i) => (
              <View key={i} style={[styles.indicator, page === i && styles.indicatorActive]} />
            ))}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.dismissBtn} accessibilityRole="button">
            <Text style={styles.dismissText}>{page === slides.length - 1 ? 'Got it' : 'Skip'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  closeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    padding: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 16,
  },
  image: {
    width: '100%',
    height: 300,
  },
  title: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  text: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  indicatorWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
    marginHorizontal: 4,
  },
  indicatorActive: {
    backgroundColor: '#9333ea',
  },
  dismissBtn: {
    alignSelf: 'center',
    marginVertical: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: '#9333ea',
    borderRadius: 8,
  },
  dismissText: {
    color: '#fff',
    fontWeight: '600',
  },
});
