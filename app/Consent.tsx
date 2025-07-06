import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Layout from './Layout';

export default function Consent() {
  return (
    <Layout currentPageName="Consent">
      <View style={styles.center}>
        <Text>Consent Screen</Text>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
