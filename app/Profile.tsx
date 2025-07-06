import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Layout from './Layout';

export default function Profile() {
  return (
    <Layout currentPageName="Profile">
      <View style={styles.center}>
        <Text>Profile Screen</Text>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
