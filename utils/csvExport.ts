import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { EventProfile, Like, Message, EventFeedback } from '../api/entities';
import toast from '../lib/toast';

// --- CSV Helper Functions ---
interface CSVHeader { key: string; displayName: string }
interface EventEntity {
  id: string | number
  name: string
  code?: string
  location?: string
  starts_at?: string
  expires_at?: string
}

export const convertToCSV = (dataArray: Record<string, any>[], headers: CSVHeader[]): string => {
  const headerRow = headers.map(h => h.displayName).join(',');
  const dataRows = dataArray.map(obj =>
    headers.map(header => {
      let value = obj[header.key];
      if (value === null || value === undefined) return '';
      if (Array.isArray(value)) value = value.join(';');
      const stringValue = String(value);
      // Escape double quotes by doubling them and wrap field in quotes
      return `"${stringValue.replace(/"/g, '""')}"`;
    }).join(',')
  );
  return [headerRow, ...dataRows].join('\r\n');
};

export const downloadCSV = async (csvContent: string, fileName: string): Promise<void> => {
  const path = FileSystem.documentDirectory + fileName;
  await FileSystem.writeAsStringAsync(path, csvContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  await Sharing.shareAsync(path);
};

export const downloadEventData = async (event: EventEntity): Promise<void> => {
  toast({ type: 'info', text1: `Preparing data export for "${event.name}"...` });
  let feedbackExported = false;
  let feedbackCount = 0;

  try {
    // Filter data specifically for this event
    const [profiles, likes, messages] = await Promise.all([
      EventProfile.filter({ event_id: event.id }),
      Like.filter({ event_id: event.id }),
      Message.filter({ event_id: event.id })
    ]);

    const safeEventName = event.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const timestamp = new Date().toISOString().slice(0, 16).replace(/[T:]/g, '_');

    // Profiles CSV
    const profileHeaders = [
        { key: 'session_id', displayName: 'Session ID' },
        { key: 'first_name', displayName: 'First Name' },
        { key: 'age', displayName: 'Age' },
        { key: 'gender_identity', displayName: 'Gender Identity' },
        { key: 'interested_in', displayName: 'Interested In' },
        { key: 'interests', displayName: 'Interests' },
        { key: 'email', displayName: 'Email' },
        { key: 'is_visible', displayName: 'Is Visible' },
        { key: 'created_date', displayName: 'Created Date' },
    ];
    downloadCSV(convertToCSV(profiles, profileHeaders), `${safeEventName}_profiles_${timestamp}.csv`);

    // Small delay to prevent browser blocking multiple downloads
    await new Promise(resolve => setTimeout(resolve, 500));

    // Likes CSV
    const likeHeaders = [
        { key: 'liker_session_id', displayName: 'Liker Session ID' },
        { key: 'liked_session_id', displayName: 'Liked Session ID' },
        { key: 'is_mutual', displayName: 'Is Mutual Match' },
        { key: 'liker_notified_of_match', displayName: 'Liker Notified' },
        { key: 'liked_notified_of_match', displayName: 'Liked User Notified' },
        { key: 'created_date', displayName: 'Created Date' },
    ];
    downloadCSV(convertToCSV(likes, likeHeaders), `${safeEventName}_likes_${timestamp}.csv`);

    await new Promise(resolve => setTimeout(resolve, 500));

    // Messages CSV
    const messageHeaders = [
        { key: 'sender_session_id', displayName: 'Sender Session ID' },
        { key: 'receiver_session_id', displayName: 'Receiver Session ID' },
        { key: 'content', displayName: 'Message Content' },
        { key: 'match_id', displayName: 'Match ID' },
        { key: 'is_read', displayName: 'Is Read' },
        { key: 'created_date', displayName: 'Created Date' },
    ];
    downloadCSV(convertToCSV(messages, messageHeaders), `${safeEventName}_messages_${timestamp}.csv`);

    // Optional: Feedback CSV
    try {
      const feedbacks = await EventFeedback.filter({ event_id: event.id });
      if (feedbacks && feedbacks.length > 0) {
        const feedbackHeaders = [
          { key: 'session_id', displayName: 'Session ID' },
          { key: 'rating_profile_setup', displayName: 'Rating: Profile Setup' },
          { key: 'rating_interests_helpful', displayName: 'Rating: Interests Helpful' },
          { key: 'rating_social_usefulness', displayName: 'Rating: Social Usefulness' },
          { key: 'met_match_in_person', displayName: 'Met Match In Person' },
          { key: 'open_to_other_event_types', displayName: 'Open to Other Event Types' },
          { key: 'match_experience_feedback', displayName: 'Match Experience Feedback' },
          { key: 'general_feedback', displayName: 'General Feedback' },
          { key: 'created_date', displayName: 'Created Date' },
        ];
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay before next download
        downloadCSV(convertToCSV(feedbacks, feedbackHeaders), `${safeEventName}_feedbacks_${timestamp}.csv`);
        feedbackExported = true;
        feedbackCount = feedbacks.length;
      }
    } catch (feedbackError) {
      console.warn(`Error downloading feedback data for event ${event.id}:`, feedbackError);
      // Do not re-throw, allow main download to complete if other parts succeeded
    }

    let successMessage = `Successfully downloaded ${profiles.length} profiles, ${likes.length} likes, and ${messages.length} messages for "${event.name}".`;
    if (feedbackExported) {
      successMessage += ` (${feedbackCount} feedback responses also exported).`;
    } else {
      successMessage += ` (No feedback data found or feedback export skipped).`;
    }
      toast({ type: 'success', text1: successMessage });

  } catch (error) {
    console.error(`Error downloading data for event ${event.id}:`, error);
      toast({ type: 'error', text1: 'Failed to download event data. Please try again.' });
  }
}; 