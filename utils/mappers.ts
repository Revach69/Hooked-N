import { 
  UserProfile, 
  Event, 
  Match, 
  Message, 
  Like, 
  EventFeedback, 
  ContactShare,
  EventProfile,
  DbUserProfile,
  DbEvent,
  DbMatch,
  DbMessage,
  DbLike,
  DbEventFeedback,
  DbContactShare,
  DbEventProfile
} from '../types';

// Database to Frontend mappings
export const mapDbToUserProfile = (dbData: DbUserProfile): UserProfile => ({
  id: dbData.id,
  firstName: dbData.first_name,
  lastName: dbData.last_name,
  profilePhotoUrl: dbData.profile_photo_url,
  genderIdentity: dbData.gender_identity,
  interestedIn: dbData.interested_in,
  age: dbData.age,
  interests: dbData.interests,
  isVisible: dbData.is_visible,
  createdAt: dbData.created_date,
  profileColor: dbData.profile_color,
  email: dbData.email,
  bio: dbData.bio,
  height: dbData.height,
});

export const mapDbToEvent = (dbData: DbEvent): Event => ({
  id: dbData.id,
  name: dbData.name,
  code: dbData.code,
  location: dbData.location,
  startsAt: dbData.starts_at,
  expiresAt: dbData.expires_at,
  createdAt: dbData.created_date,
});

export const mapDbToMatch = (dbData: DbMatch): Match => ({
  id: dbData.id,
  sessionId: dbData.session_id,
  firstName: dbData.first_name,
  profilePhotoUrl: dbData.profile_photo_url,
  profileColor: dbData.profile_color,
  age: dbData.age,
  interests: dbData.interests,
  bio: dbData.bio,
  isMutual: dbData.is_mutual,
  createdAt: dbData.created_date,
});

export const mapDbToMessage = (dbData: DbMessage): Message => ({
  id: dbData.id,
  senderSessionId: dbData.sender_session_id,
  receiverSessionId: dbData.receiver_session_id,
  content: dbData.content,
  matchId: dbData.match_id,
  isRead: dbData.is_read,
  createdAt: dbData.created_date,
});

export const mapDbToLike = (dbData: DbLike): Like => ({
  id: dbData.id,
  likerSessionId: dbData.liker_session_id,
  likedSessionId: dbData.liked_session_id,
  eventId: dbData.event_id,
  isMutual: dbData.is_mutual,
  likerNotifiedOfMatch: dbData.liker_notified_of_match,
  likedNotifiedOfMatch: dbData.liked_notified_of_match,
  createdAt: dbData.created_date,
});

export const mapDbToEventFeedback = (dbData: DbEventFeedback): EventFeedback => ({
  id: dbData.id,
  sessionId: dbData.session_id,
  eventId: dbData.event_id,
  ratingProfileSetup: dbData.rating_profile_setup,
  ratingInterestsHelpful: dbData.rating_interests_helpful,
  ratingSocialUsefulness: dbData.rating_social_usefulness,
  metMatchInPerson: dbData.met_match_in_person,
  openToOtherEventTypes: dbData.open_to_other_event_types,
  matchExperienceFeedback: dbData.match_experience_feedback,
  generalFeedback: dbData.general_feedback,
  createdAt: dbData.created_date,
});

export const mapDbToContactShare = (dbData: DbContactShare): ContactShare => ({
  id: dbData.id,
  sharerSessionId: dbData.sharer_session_id,
  receiverSessionId: dbData.receiver_session_id,
  matchId: dbData.match_id,
  fullName: dbData.full_name,
  phoneNumber: dbData.phone_number,
  email: dbData.email,
  instagram: dbData.instagram,
  createdAt: dbData.created_date,
});

export const mapDbToEventProfile = (dbData: DbEventProfile): EventProfile => ({
  id: dbData.id,
  eventId: dbData.event_id,
  sessionId: dbData.session_id,
  firstName: dbData.first_name,
  email: dbData.email,
  age: dbData.age,
  genderIdentity: dbData.gender_identity,
  interestedIn: dbData.interested_in,
  profileColor: dbData.profile_color,
  profilePhotoUrl: dbData.profile_photo_url,
  isVisible: dbData.is_visible,
  bio: dbData.bio,
  height: dbData.height,
  interests: dbData.interests,
  createdAt: dbData.created_date,
});

export const mapEventProfileToDb = (data: EventProfile): DbEventProfile => ({
  id: data.id,
  event_id: data.eventId,
  session_id: data.sessionId,
  first_name: data.firstName,
  email: data.email,
  age: data.age,
  gender_identity: data.genderIdentity,
  interested_in: data.interestedIn,
  profile_color: data.profileColor,
  profile_photo_url: data.profilePhotoUrl,
  is_visible: data.isVisible,
  bio: data.bio,
  height: data.height,
  interests: data.interests,
  created_date: data.createdAt,
});

// Frontend to Database mappings
export const mapUserProfileToDb = (data: UserProfile): DbUserProfile => ({
  id: data.id,
  first_name: data.firstName,
  last_name: data.lastName,
  profile_photo_url: data.profilePhotoUrl,
  gender_identity: data.genderIdentity,
  interested_in: data.interestedIn,
  age: data.age,
  interests: data.interests,
  is_visible: data.isVisible,
  created_date: data.createdAt,
  profile_color: data.profileColor,
  email: data.email,
  bio: data.bio,
  height: data.height,
});

export const mapEventToDb = (data: Event): DbEvent => ({
  id: data.id,
  name: data.name,
  code: data.code,
  location: data.location,
  starts_at: data.startsAt,
  expires_at: data.expiresAt,
  created_date: data.createdAt,
});

export const mapMatchToDb = (data: Match): DbMatch => ({
  id: data.id,
  session_id: data.sessionId,
  first_name: data.firstName,
  profile_photo_url: data.profilePhotoUrl,
  profile_color: data.profileColor,
  age: data.age,
  interests: data.interests,
  bio: data.bio,
  is_mutual: data.isMutual,
  created_date: data.createdAt,
});

export const mapMessageToDb = (data: Message): DbMessage => ({
  id: data.id,
  sender_session_id: data.senderSessionId,
  receiver_session_id: data.receiverSessionId,
  content: data.content,
  match_id: data.matchId,
  is_read: data.isRead,
  created_date: data.createdAt,
});

export const mapLikeToDb = (data: Like): DbLike => ({
  id: data.id,
  liker_session_id: data.likerSessionId,
  liked_session_id: data.likedSessionId,
  event_id: data.eventId,
  is_mutual: data.isMutual,
  liker_notified_of_match: data.likerNotifiedOfMatch,
  liked_notified_of_match: data.likedNotifiedOfMatch,
  created_date: data.createdAt,
});

export const mapEventFeedbackToDb = (data: EventFeedback): DbEventFeedback => ({
  id: data.id,
  session_id: data.sessionId,
  event_id: data.eventId,
  rating_profile_setup: data.ratingProfileSetup,
  rating_interests_helpful: data.ratingInterestsHelpful,
  rating_social_usefulness: data.ratingSocialUsefulness,
  met_match_in_person: data.metMatchInPerson,
  open_to_other_event_types: data.openToOtherEventTypes,
  match_experience_feedback: data.matchExperienceFeedback,
  general_feedback: data.generalFeedback,
  created_date: data.createdAt,
});

export const mapContactShareToDb = (data: ContactShare): DbContactShare => ({
  id: data.id,
  sharer_session_id: data.sharerSessionId,
  receiver_session_id: data.receiverSessionId,
  match_id: data.matchId,
  full_name: data.fullName,
  phone_number: data.phoneNumber,
  email: data.email,
  instagram: data.instagram,
  created_date: data.createdAt,
});

// Array mapping utilities
export const mapDbArrayToUserProfiles = (dbArray: DbUserProfile[]): UserProfile[] =>
  dbArray.map(mapDbToUserProfile);

export const mapDbArrayToEvents = (dbArray: DbEvent[]): Event[] =>
  dbArray.map(mapDbToEvent);

export const mapDbArrayToMatches = (dbArray: DbMatch[]): Match[] =>
  dbArray.map(mapDbToMatch);

export const mapDbArrayToMessages = (dbArray: DbMessage[]): Message[] =>
  dbArray.map(mapDbToMessage);

export const mapDbArrayToLikes = (dbArray: DbLike[]): Like[] =>
  dbArray.map(mapDbToLike);

export const mapDbArrayToEventFeedbacks = (dbArray: DbEventFeedback[]): EventFeedback[] =>
  dbArray.map(mapDbToEventFeedback);

export const mapDbArrayToContactShares = (dbArray: DbContactShare[]): ContactShare[] =>
  dbArray.map(mapDbToContactShare);

export const mapDbArrayToEventProfiles = (dbArray: DbEventProfile[]): EventProfile[] =>
  dbArray.map(mapDbToEventProfile); 