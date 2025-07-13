// Core data interfaces
export interface UserProfile {
  id: string;
  firstName: string;
  lastName?: string;
  profilePhotoUrl?: string;
  genderIdentity: string;
  interestedIn: string;
  age: number;
  interests: string[];
  isVisible: boolean;
  createdAt: string;
  profileColor: string;
  email?: string;
  bio?: string;
  height?: number;
}

export interface Event {
  id: string;
  name: string;
  code?: string;
  location?: string;
  startsAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface Match {
  id: string;
  sessionId: string;
  firstName: string;
  profilePhotoUrl?: string;
  profileColor: string;
  age: number;
  interests: string[];
  bio?: string;
  isMutual: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  senderSessionId: string;
  receiverSessionId: string;
  content: string;
  matchId: string;
  isRead: boolean;
  createdAt: string;
}

export interface Like {
  id: string;
  likerSessionId: string;
  likedSessionId: string;
  eventId: string;
  isMutual: boolean;
  likerNotifiedOfMatch: boolean;
  likedNotifiedOfMatch: boolean;
  createdAt: string;
}

export interface EventFeedback {
  id: string;
  sessionId: string;
  eventId: string;
  ratingProfileSetup: string;
  ratingInterestsHelpful: string;
  ratingSocialUsefulness: string;
  metMatchInPerson: string;
  openToOtherEventTypes: string;
  matchExperienceFeedback: string;
  generalFeedback: string;
  createdAt: string;
}

export interface ContactShare {
  id: string;
  senderSessionId: string;
  receiverSessionId: string;
  fullName: string;
  phoneNumber?: string;
  email?: string;
  instagram?: string;
  createdAt: string;
}

// Database mapping interfaces (snake_case for API compatibility)
export interface DbUserProfile {
  id: string;
  first_name: string;
  last_name?: string;
  profile_photo_url?: string;
  gender_identity: string;
  interested_in: string;
  age: number;
  interests: string[];
  is_visible: boolean;
  created_date: string;
  profile_color: string;
  email?: string;
  bio?: string;
  height?: number;
}

export interface DbEvent {
  id: string;
  name: string;
  code?: string;
  location?: string;
  starts_at?: string;
  expires_at?: string;
  created_date: string;
}

export interface DbMatch {
  id: string;
  session_id: string;
  first_name: string;
  profile_photo_url?: string;
  profile_color: string;
  age: number;
  interests: string[];
  bio?: string;
  is_mutual: boolean;
  created_date: string;
}

export interface DbMessage {
  id: string;
  sender_session_id: string;
  receiver_session_id: string;
  content: string;
  match_id: string;
  is_read: boolean;
  created_date: string;
}

export interface DbLike {
  id: string;
  liker_session_id: string;
  liked_session_id: string;
  event_id: string;
  is_mutual: boolean;
  liker_notified_of_match: boolean;
  liked_notified_of_match: boolean;
  created_date: string;
}

export interface DbEventFeedback {
  id: string;
  session_id: string;
  event_id: string;
  rating_profile_setup: string;
  rating_interests_helpful: string;
  rating_social_usefulness: string;
  met_match_in_person: string;
  open_to_other_event_types: string;
  match_experience_feedback: string;
  general_feedback: string;
  created_date: string;
}

export interface DbContactShare {
  id: string;
  sender_session_id: string;
  receiver_session_id: string;
  full_name: string;
  phone_number?: string;
  email?: string;
  instagram?: string;
  created_date: string;
}

// Utility types
export type Step = 'manual' | 'processing' | 'error';

export interface DropdownOption {
  label: string;
  value: string;
}

export interface FormData {
  firstName: string;
  email: string;
  age: string;
  genderIdentity: string;
  interestedIn: string;
  profilePhotoUrl: string;
}

export interface FormErrors {
  firstName?: string;
  email?: string;
  age?: string;
  genderIdentity?: string;
  interestedIn?: string;
  profilePhotoUrl?: string;
}

// Navigation types
export type RootStackParamList = {
  Home: undefined;
  Consent: undefined;
  Discovery: undefined;
  Matches: undefined;
  join: undefined;
  admin: undefined;
  Profile: undefined;
};

// Component prop types
export interface ModalProps {
  visible: boolean;
  onClose: () => void;
}

export interface EventCardProps {
  event: Event;
  isDownloading: boolean;
  onAnalytics: (event: Event) => void;
  onFeedbacks: (event: Event) => void;
  onEdit: (event: Event) => void;
  onDownload: (event: Event) => void;
  onDelete: (event: Event) => void;
}

export interface ChatModalProps {
  match: Match;
  onClose: () => void;
}

export interface ProfileDetailModalProps {
  profile: UserProfile;
  onClose: () => void;
  onLike: () => void;
  isLiked: boolean;
}

export interface ContactShareModalProps {
  matchName: string;
  onConfirm: (info: { fullName: string; phoneNumber: string; email?: string; instagram?: string }) => void;
  onCancel: () => void;
}

export interface FeedbackSurveyModalProps {
  event: Event;
  sessionId: string;
  onClose: () => void;
}

export interface EventFormModalProps {
  event?: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface EventAnalyticsModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

export interface FeedbackInsightsModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
}

export interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  eventName: string;
}

export interface QRCodeGeneratorProps {
  url: string;
  fileName: string;
}

export interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  onSwitchToManual: () => void;
}

export interface EventCodeEntryProps {
  onSubmit: (code: string) => void;
  onClose: () => void;
}

export interface ProfileFiltersProps {
  filters: {
    ageMin: number;
    ageMax: number;
    gender: string;
    interests: string[];
  };
  onFiltersChange: (filters: any) => void;
  onClose: () => void;
}

export interface ImagePreviewModalProps {
  profile: UserProfile;
  onClose: () => void;
}

export interface FirstTimeGuideModalProps {
  onClose: () => void;
}

export interface MatchNotificationToastProps {
  visible: boolean;
  matchName: string;
  onDismiss: () => void;
  onSeeMatches: () => void;
}

export interface MessageNotificationToastProps {
  visible: boolean;
  senderName: string;
  onDismiss: () => void;
  onView: () => void;
} 