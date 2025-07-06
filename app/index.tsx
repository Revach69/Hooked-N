import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './Home';
import Consent from './Consent';
import Discovery from './Discovery';
import Matches from './Matches';
import Admin from './admin';
import Join from './join';
import Profile from './Profile';

const Stack = createNativeStackNavigator();

export default function Pages() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Consent" component={Consent} />
        <Stack.Screen name="Discovery" component={Discovery} />
        <Stack.Screen name="Matches" component={Matches} />
        <Stack.Screen name="Admin" component={Admin} />
        <Stack.Screen name="Join" component={Join} />
        <Stack.Screen name="Profile" component={Profile} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
