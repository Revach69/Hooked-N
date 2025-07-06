import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Layout({ children, currentPageName }: { children: React.ReactNode; currentPageName?: string }) {
  return (
    <View style={styles.container}>
      {currentPageName ? (
        <View style={styles.header}>
          <Text style={styles.headerText}>{currentPageName}</Text>
        </View>
      ) : null}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#eee',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  headerText: { fontSize: 18, fontWeight: 'bold' },
  content: { flex: 1 },
});
