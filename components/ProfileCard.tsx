import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Heart, User } from 'lucide-react-native';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface ProfileCardProps {
  profile: {
    id: string;
    session_id: string;
    first_name: string;
    age: number;
    gender_identity: string;
    interested_in: string;
    profile_photo_url?: string;
    profile_color: string;
    bio?: string;
    interests?: string[];
  };
  onLike: () => void;
  onViewDetail: () => void;
  isLiked: boolean;
  showLikeButton?: boolean;
  showInterests?: boolean;
}

export default function ProfileCard({
  profile,
  onLike,
  onViewDetail,
  isLiked,
  showLikeButton = true,
  showInterests = true,
}: ProfileCardProps) {
  const handleImageError = () => {
    // Handle image error - could set a fallback state
  };

  return (
    <Card style={styles.card}>
      <CardContent style={styles.cardContent}>
        <TouchableOpacity onPress={onViewDetail} style={styles.profileSection}>
          <View style={styles.imageContainer}>
            {profile.profile_photo_url ? (
              <Image
                source={{ uri: profile.profile_photo_url }}
                style={styles.profileImage}
                onError={handleImageError}
              />
            ) : (
              <View style={[styles.fallbackImage, { backgroundColor: profile.profile_color }]}>
                <User size={32} color="#fff" />
              </View>
            )}
          </View>
          
          <View style={styles.profileInfo}>
            <View style={styles.nameAgeRow}>
              <Text style={styles.name}>{profile.first_name}</Text>
              <Text style={styles.age}>{profile.age}</Text>
            </View>
            
            <Text style={styles.gender}>{profile.gender_identity}</Text>
            
            {profile.bio && (
              <Text style={styles.bio} numberOfLines={2}>
                {profile.bio}
              </Text>
            )}
            
            {showInterests && profile.interests && profile.interests.length > 0 && (
              <View style={styles.interestsContainer}>
                {profile.interests.slice(0, 3).map((interest, index) => (
                  <Badge key={index} style={styles.interestBadge}>
                    <Text style={styles.interestText}>{interest}</Text>
                  </Badge>
                ))}
                {profile.interests.length > 3 && (
                  <Text style={styles.moreInterests}>+{profile.interests.length - 3} more</Text>
                )}
              </View>
            )}
          </View>
        </TouchableOpacity>
        
        {showLikeButton && (
          <TouchableOpacity
            onPress={onLike}
            style={[styles.likeButton, isLiked && styles.likedButton]}
            disabled={isLiked}
          >
            <Heart
              size={24}
              color={isLiked ? '#fff' : '#ec4899'}
              fill={isLiked ? '#fff' : 'none'}
            />
          </TouchableOpacity>
        )}
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    padding: 16,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  imageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  fallbackImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  nameAgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 8,
  },
  age: {
    fontSize: 16,
    color: '#6b7280',
  },
  gender: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 8,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  interestBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  interestText: {
    fontSize: 12,
    color: '#374151',
  },
  moreInterests: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  likeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ec4899',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  likedButton: {
    backgroundColor: '#ec4899',
    borderColor: '#ec4899',
  },
}); 