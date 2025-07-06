import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Layout from './Layout';

export default function Join() {
  return (
    <Layout currentPageName="Join">
      <View style={styles.center}>
        <Text>Join Screen</Text>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
