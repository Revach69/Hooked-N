import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Layout from "./Layout";
import Home from "./Home";
import Consent from "./Consent";
import Discovery from "./Discovery";
import Matches from "./Matches";
import Admin from "./admin";
import JoinPage from "./join";
import Profile from "./Profile";

export type RootStackParamList = {
  Home: undefined;
  Consent: undefined;
  Discovery: undefined;
  Matches: undefined;
  admin: undefined;
  join: { code?: string } | undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Pages() {
  return (
    <NavigationContainer>
      <Layout>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Consent" component={Consent} />
          <Stack.Screen name="Discovery" component={Discovery} />
          <Stack.Screen name="Matches" component={Matches} />
          <Stack.Screen name="admin" component={Admin} />
          <Stack.Screen name="join" component={JoinPage} />
          <Stack.Screen name="Profile" component={Profile} />
        </Stack.Navigator>
      </Layout>
    </NavigationContainer>
  );
}
