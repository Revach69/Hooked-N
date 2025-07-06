import React, { useState, useEffect } from "react";
import { View, Text, Button, ActivityIndicator } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Event } from "../api/entities";
import { createPageUrl } from "../utils";

export default function JoinPage() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    handleEventJoin();
  }, []);

  const handleEventJoin = async () => {
    try {
      const eventCode = (route.params as any)?.code;

      if (!eventCode) {
        setError("No event code provided in the URL.");
        setIsLoading(false);
        return;
      }

      // Validate the event code
      const events = await Event.filter({ code: eventCode.toUpperCase() });
      
      if (events.length === 0) {
        setError("Invalid event code.");
        setIsLoading(false);
        return;
      }

      const foundEvent = events[0];
      const nowUTC = new Date().toISOString(); // Current UTC time as ISO string

      if (!foundEvent.starts_at || !foundEvent.expires_at) {
          setError("This event is not configured correctly. Please contact the organizer.");
          setIsLoading(false);
          return;
      }
      
      // Check if event is active using UTC time comparison
      const isActive = foundEvent.starts_at <= nowUTC && nowUTC < foundEvent.expires_at;
      
      if (nowUTC < foundEvent.starts_at) {
        setError("This event hasn't started yet. Try again soon!");
        setIsLoading(false);
        return;
      }
      
      if (nowUTC >= foundEvent.expires_at) {
        setError("This event has ended.");
        setIsLoading(false);
        return;
      }

      // Store event data in localStorage for the session
      localStorage.setItem('currentEventId', foundEvent.id);
      localStorage.setItem('currentEventCode', foundEvent.code);

      // Check if user already has a session for this event
      const existingSessionId = localStorage.getItem('currentSessionId');
      
      if (existingSessionId) {
        // User might be returning - verify their profile still exists
        try {
          const { EventProfile } = await import('../api/entities');
          const existingProfiles = await EventProfile.filter({
            session_id: existingSessionId,
            event_id: foundEvent.id
          });
          
          if (existingProfiles.length > 0) {
            // User has an existing profile, redirect to Discovery
            navigation.navigate("Discovery");
            return;
          }
        } catch (profileError) {
          console.warn("Error checking existing profile:", profileError);
          // Continue to consent page if profile check fails
        }
      }

      // New user or no existing profile - redirect to consent/profile creation
      navigation.navigate("Consent");

    } catch (error) {
      console.error("Error processing event join:", error);
      setError("Unable to process event access. Please try again.");
      setIsLoading(false);
    }
  };

  const handleRetryJoin = () => {
    // Navigate back to home to restart the flow cleanly
    navigation.navigate("Home");
  };

  const handleGoHome = () => {
    navigation.navigate("Home");
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Joining Event...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}>
        <Text style={{ marginBottom: 12 }}>{error}</Text>
        <Button title="Return to Home" onPress={handleGoHome} />
      </View>
    );
  }

  // This should not be reached due to redirects, but just in case
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}>
      <Text>Processing...</Text>
    </View>
  );
}