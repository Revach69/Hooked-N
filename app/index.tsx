import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from './Home';
import Consent from './Consent';
import Discovery from './Discovery';
import Matches from './Matches';
import Join from './Join';
import Admin from './admin';
import Profile from './Profile';
import Layout from './Layout';

export type RootStackParamList = {
  Home: undefined;
  Consent: undefined;
  Discovery: undefined;
  Matches: undefined;
  Join: undefined;
  admin: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home">
          {() => (
            <Layout currentPageName="Home">
              <Home />
            </Layout>
          )}
        </Stack.Screen>
        <Stack.Screen name="Consent">
          {() => (
            <Layout currentPageName="Consent">
              <Consent />
            </Layout>
          )}
        </Stack.Screen>
        <Stack.Screen name="Discovery">
          {() => (
            <Layout currentPageName="Discovery">
              <Discovery />
            </Layout>
          )}
        </Stack.Screen>
        <Stack.Screen name="Matches">
          {() => (
            <Layout currentPageName="Matches">
              <Matches />
            </Layout>
          )}
        </Stack.Screen>
        <Stack.Screen name="Join">
          {() => (
            <Layout currentPageName="Join">
              <Join />
            </Layout>
          )}
        </Stack.Screen>
        <Stack.Screen name="admin">
          {() => (
            <Layout currentPageName="admin">
              <Admin />
            </Layout>
          )}
        </Stack.Screen>
        <Stack.Screen name="Profile">
          {() => (
            <Layout currentPageName="Profile">
              <Profile />
            </Layout>
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
