import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Layout from './Layout';

export default function Admin() {
  return (
    <Layout currentPageName="Admin">
      <View style={styles.center}>
        <Text>Admin Screen</Text>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
