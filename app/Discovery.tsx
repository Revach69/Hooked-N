import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Layout from './Layout';

export default function Discovery() {
  return (
    <Layout currentPageName="Discovery">
      <View style={styles.center}>
        <Text>Discovery Screen</Text>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
