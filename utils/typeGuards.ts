import { DocumentData } from 'firebase/firestore';
import { 
  DbEventProfile, 
  DbEvent, 
  DbMatch, 
  DbMessage, 
  DbLike, 
  DbEventFeedback, 
  DbContactShare 
} from '../types';

export function isDbEventProfile(data: DocumentData): data is DbEventProfile {
  return (
    typeof data.id === 'string' &&
    typeof data.event_id === 'string' &&
    typeof data.session_id === 'string' &&
    typeof data.first_name === 'string' &&
    typeof data.email === 'string' &&
    typeof data.age === 'number' &&
    typeof data.gender_identity === 'string' &&
    typeof data.interested_in === 'string' &&
    typeof data.profile_color === 'string' &&
    typeof data.profile_photo_url === 'string' &&
    typeof data.is_visible === 'boolean' &&
    typeof data.created_date === 'string'
  );
}

export function isDbEvent(data: DocumentData): data is DbEvent {
  return (
    typeof data.id === 'string' &&
    typeof data.name === 'string' &&
    typeof data.created_date === 'string'
  );
}

export function isDbMatch(data: DocumentData): data is DbMatch {
  return (
    typeof data.id === 'string' &&
    typeof data.session_id === 'string' &&
    typeof data.first_name === 'string' &&
    typeof data.profile_color === 'string' &&
    typeof data.age === 'number' &&
    Array.isArray(data.interests) &&
    typeof data.is_mutual === 'boolean' &&
    typeof data.created_date === 'string'
  );
}

export function isDbMessage(data: DocumentData): data is DbMessage {
  return (
    typeof data.id === 'string' &&
    typeof data.sender_session_id === 'string' &&
    typeof data.receiver_session_id === 'string' &&
    typeof data.content === 'string' &&
    typeof data.match_id === 'string' &&
    typeof data.is_read === 'boolean' &&
    typeof data.created_date === 'string'
  );
}

export function isDbLike(data: DocumentData): data is DbLike {
  return (
    typeof data.id === 'string' &&
    typeof data.liker_session_id === 'string' &&
    typeof data.liked_session_id === 'string' &&
    typeof data.event_id === 'string' &&
    typeof data.is_mutual === 'boolean' &&
    typeof data.liker_notified_of_match === 'boolean' &&
    typeof data.liked_notified_of_match === 'boolean' &&
    typeof data.created_date === 'string'
  );
}

export function isDbEventFeedback(data: DocumentData): data is DbEventFeedback {
  return (
    typeof data.id === 'string' &&
    typeof data.event_id === 'string' &&
    typeof data.session_id === 'string' &&
    typeof data.rating_profile_setup === 'number' &&
    typeof data.rating_interests_helpful === 'number' &&
    typeof data.rating_social_usefulness === 'number' &&
    typeof data.met_match_in_person === 'boolean' &&
    typeof data.open_to_other_event_types === 'boolean' &&
    typeof data.match_experience_feedback === 'string' &&
    typeof data.created_date === 'string'
  );
}

export function isDbContactShare(data: DocumentData): data is DbContactShare {
  return (
    typeof data.id === 'string' &&
    typeof data.sharer_session_id === 'string' &&
    typeof data.receiver_session_id === 'string' &&
    typeof data.match_id === 'string' &&
    typeof data.full_name === 'string' &&
    typeof data.phone_number === 'string' &&
    typeof data.created_date === 'string'
  );
}

// Array type guards
export function isDbEventProfileArray(data: DocumentData[]): data is DbEventProfile[] {
  return data.every(isDbEventProfile);
}

export function isDbEventArray(data: DocumentData[]): data is DbEvent[] {
  return data.every(isDbEvent);
}

export function isDbMatchArray(data: DocumentData[]): data is DbMatch[] {
  return data.every(isDbMatch);
}

export function isDbMessageArray(data: DocumentData[]): data is DbMessage[] {
  return data.every(isDbMessage);
}

export function isDbLikeArray(data: DocumentData[]): data is DbLike[] {
  return data.every(isDbLike);
}

export function isDbEventFeedbackArray(data: DocumentData[]): data is DbEventFeedback[] {
  return data.every(isDbEventFeedback);
}

export function isDbContactShareArray(data: DocumentData[]): data is DbContactShare[] {
  return data.every(isDbContactShare);
} 