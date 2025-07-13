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
  eventId: string;
  sessionId: string;
  ratingProfileSetup: number;
  ratingInterestsHelpful: number;
  ratingSocialUsefulness: number;
  metMatchInPerson: boolean;
  openToOtherEventTypes: boolean;
  matchExperienceFeedback: string;
  generalFeedback?: string;
  createdAt: string;
}

export interface ContactShare {
  id: string;
  sharerSessionId: string;
  receiverSessionId: string;
  matchId: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  instagram?: string;
  createdAt: string;
}

// Analytics interfaces
export interface AnalyticsData {
  profiles: EventProfile[];
  likes: Like[];
  messages: Message[];
  stats: AnalyticsStats;
}

export interface AnalyticsStats {
  totalProfiles: number;
  totalLikes: number;
  mutualMatches: number;
  totalMessages: number;
  averageAge: number;
}

// Event Profile interface
export interface EventProfile {
  id: string;
  eventId: string;
  sessionId: string;
  firstName: string;
  email: string;
  age: number;
  genderIdentity: string;
  interestedIn: string;
  profileColor: string;
  profilePhotoUrl: string;
  isVisible: boolean;
  bio?: string;
  height?: number;
  interests?: string[];
  createdAt: string;
}

// Database version of EventProfile (snake_case)
export interface DbEventProfile {
  id: string;
  event_id: string;
  session_id: string;
  first_name: string;
  email: string;
  age: number;
  gender_identity: string;
  interested_in: string;
  profile_color: string;
  profile_photo_url: string;
  is_visible: boolean;
  bio?: string;
  height?: number;
  interests?: string[];
  created_date: string;
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
  event_id: string;
  session_id: string;
  rating_profile_setup: number;
  rating_interests_helpful: number;
  rating_social_usefulness: number;
  met_match_in_person: boolean;
  open_to_other_event_types: boolean;
  match_experience_feedback: string;
  general_feedback?: string;
  created_date: string;
}

export interface DbContactShare {
  id: string;
  sharer_session_id: string;
  receiver_session_id: string;
  match_id: string;
  full_name: string;
  phone_number: string;
  email?: string;
  instagram?: string;
  created_date: string;
}

// Form interfaces
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

export interface FeedbackFormData {
  ratingProfileSetup: string;
  ratingInterestsHelpful: string;
  ratingSocialUsefulness: string;
  metMatchInPerson: string;
  openToOtherEventTypes: string;
  matchExperienceFeedback: string;
  generalFeedback: string;
}

export interface FeedbackFormErrors {
  ratingProfileSetup?: string;
  ratingInterestsHelpful?: string;
  ratingSocialUsefulness?: string;
  metMatchInPerson?: string;
  openToOtherEventTypes?: string;
  matchExperienceFeedback?: string;
  generalFeedback?: string;
}

export interface EventFormData {
  name: string;
  code: string;
  location: string;
  description: string;
  organizerEmail: string;
  startsAt: string;
  expiresAt: string;
}

export interface EventFormErrors {
  name?: string;
  code?: string;
  location?: string;
  description?: string;
  organizerEmail?: string;
  startsAt?: string;
  expiresAt?: string;
}

// Component prop interfaces
export interface EventCardProps {
  event: Event;
  isDownloading: boolean;
  onAnalytics: (event: Event) => void;
  onFeedbacks: (event: Event) => void;
  onEdit: (event: Event) => void;
  onDownload: (event: Event) => void;
  onDelete: (event: Event) => void;
}

export interface ProfileCardProps {
  profile: EventProfile;
  onLike: (profile: EventProfile) => void;
  onViewDetail: (profile: EventProfile) => void;
  isLiked: boolean;
  showLikeButton?: boolean;
}

export interface MatchCardProps {
  match: Match;
  onOpenChat: (match: Match) => void;
  onViewProfile: (match: Match) => void;
  unreadCount?: number;
}

export interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
  senderName: string;
}

export interface ProfileFiltersProps {
  filters: ProfileFilters;
  onFiltersChange: (filters: ProfileFilters) => void;
  onClose: () => void;
}

export interface ProfileFilters {
  ageMin: number;
  ageMax: number;
  gender: string;
  interests: string[];
}

export interface QRScannerProps {
  onScan: (value: string) => void;
  onClose: () => void;
  onSwitchToManual?: () => void;
}

export interface ChatModalProps {
  match: Match;
  onClose: () => void;
}

export interface ContactShareModalProps {
  matchName: string;
  onConfirm: (contactInfo: ContactInfo) => void;
  onCancel: () => void;
}

export interface ContactInfo {
  name: string;
  phone: string;
}

export interface ProfileDetailModalProps {
  profile: EventProfile | null;
  isVisible: boolean;
  onClose: () => void;
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
  title: string;
  message: string;
}

// Navigation interfaces
export interface RootStackParamList {
  Home: undefined;
  Join: { code?: string };
  Consent: undefined;
  Discovery: undefined;
  Matches: undefined;
  Profile: undefined;
  Admin: undefined;
}

// Step interfaces for multi-step forms
export type Step = 'manual' | 'processing' | 'complete' | 'error';

export interface DropdownOption {
  label: string;
  value: string;
}

// Error handling interfaces
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: string;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: AppError;
}

// API response interfaces
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Toast notification interfaces
export interface ToastConfig {
  type: 'success' | 'error' | 'warning' | 'info';
  text1: string;
  text2?: string;
  duration?: number;
}

// File upload interfaces
export interface FileUploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

export interface ImagePickerResult {
  uri: string;
  width: number;
  height: number;
  type: string;
  size?: number;
}

// Session management interfaces
export interface SessionData {
  sessionId: string;
  eventId: string;
  eventCode: string;
  profileColor: string;
  profilePhotoUrl?: string;
}

// Notification interfaces
export interface NotificationData {
  id: string;
  type: 'like' | 'match' | 'message' | 'system';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

// Permission interfaces
export interface PermissionStatus {
  granted: boolean;
  canAskAgain: boolean;
  status: 'granted' | 'denied' | 'undetermined';
}

// Camera interfaces
export interface CameraPermissionResult {
  status: 'granted' | 'denied' | 'undetermined';
  granted: boolean;
  canAskAgain: boolean;
}

// Deep linking interfaces
export interface DeepLinkData {
  route: string;
  params: Record<string, string>;
}

// App state interfaces
export interface AppStateData {
  isActive: boolean;
  isBackground: boolean;
  lastActiveTime: string;
}

// Storage interfaces
export interface StorageData {
  key: string;
  value: string;
  timestamp: string;
}

// Validation interfaces
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FieldValidation {
  field: string;
  isValid: boolean;
  error?: string;
}

// Configuration interfaces
export interface AppConfig {
  apiUrl: string;
  environment: 'development' | 'staging' | 'production';
  version: string;
  buildNumber: string;
}

// Theme interfaces
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
}

export interface Theme {
  colors: ThemeColors;
  spacing: Record<string, number>;
  borderRadius: Record<string, number>;
  typography: Record<string, object>;
} 