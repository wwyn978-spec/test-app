import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { CodeViewer } from '../components/CodeViewer';

export const SourceCodeScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <View style={styles.tagRow}>
          <Ionicons name="code-slash" size={16} color="#00F0FF" />
          <Text style={styles.tagText}>NATIVE ANDROID SOURCE CODE INSPECTOR</Text>
        </View>
        <Text style={styles.title}>Manifest &amp; Kotlin VpnService</Text>
        <Text style={styles.subtitle}>
          Complete, production-ready code for AndroidManifest.xml, RealGameVpnService.kt,
          GameOptimizationConfig.kt, and MainActivity.kt.
        </Text>
      </View>

      <CodeViewer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070B14',
  },
  headerBox: {
    backgroundColor: '#0C1324',
    borderBottomWidth: 1,
    borderBottomColor: '#172238',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00F0FF',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    lineHeight: 16,
  },
});
