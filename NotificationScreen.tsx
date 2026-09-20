import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { VpnTelemetry } from '../types/vpn';
import { NotificationSimulator } from '../components/NotificationSimulator';

interface NotificationScreenProps {
  telemetry: VpnTelemetry;
  onDisconnect: () => void;
  onOptimizeRoute?: () => void;
}

interface PermissionInfo {
  name: string;
  category: string;
  status: 'GRANTED' | 'ACTIVE';
  importance: 'CRITICAL' | 'REQUIRED' | 'OPTIMIZATION';
  explanation: string;
}

const ANDROID_PERMISSIONS_MATRIX: PermissionInfo[] = [
  {
    name: 'android.permission.INTERNET',
    category: 'Network Socket Layer',
    status: 'GRANTED',
    importance: 'CRITICAL',
    explanation:
      'Enables RealGameVpnService to bind raw protected UDP sockets (protect(socket)) and route bidirectional gaming state.',
  },
  {
    name: 'android.permission.ACCESS_NETWORK_STATE',
    category: 'Connectivity Telemetry',
    status: 'GRANTED',
    importance: 'CRITICAL',
    explanation:
      'Monitors default network transitions between Wi-Fi and 5G cellular to auto-rebind the TUN interface with zero timeout.',
  },
  {
    name: 'android.permission.ACCESS_WIFI_STATE',
    category: 'Wi-Fi Monitoring',
    status: 'ACTIVE',
    importance: 'OPTIMIZATION',
    explanation:
      'Inspects RSSI signal strength, channel frequency (5GHz vs 2.4GHz), and link speed to calculate predicted packet jitter.',
  },
  {
    name: 'android.permission.CHANGE_WIFI_STATE',
    category: 'Wi-Fi Hardware Control',
    status: 'ACTIVE',
    importance: 'CRITICAL',
    explanation:
      'Allows creating WifiManager.WIFI_MODE_FULL_LOW_LATENCY lock. Forces modern Wi-Fi chipsets out of power-saving sleep during matches.',
  },
  {
    name: 'android.permission.FOREGROUND_SERVICE',
    category: 'Service Lifecycle',
    status: 'ACTIVE',
    importance: 'CRITICAL',
    explanation:
      'Mandatory Android background execution permission. Prevents Android Low Memory Killer (LMK) from terminating RealGameVpnService mid-game.',
  },
  {
    name: 'android.permission.FOREGROUND_SERVICE_SPECIAL_USE',
    category: 'Android 14+ / API 34 Policy',
    status: 'ACTIVE',
    importance: 'REQUIRED',
    explanation:
      'Google Play requirement for API 34+. Categorizes RealGameVpnService with PROPERTY_SPECIAL_USE_FGS_SUBTYPE for low-latency packet routing.',
  },
  {
    name: 'android.permission.POST_NOTIFICATIONS',
    category: 'Android 13+ / API 33 Runtime',
    status: 'ACTIVE',
    importance: 'REQUIRED',
    explanation:
      'Required to display ongoing status bar HUD with real-time ping (ms), packet throughput, and instant match disconnect controls.',
  },
  {
    name: 'android.permission.WAKE_LOCK',
    category: 'Power Management',
    status: 'ACTIVE',
    importance: 'CRITICAL',
    explanation:
      'Acquires PowerManager.PARTIAL_WAKE_LOCK ("RealGameVpn::CpuMatchLock"). Prevents CPU core suspension and micro-stutter packet drops.',
  },
  {
    name: 'android.permission.BIND_VPN_SERVICE',
    category: 'Android Security Sandbox',
    status: 'GRANTED',
    importance: 'CRITICAL',
    explanation:
      'Security boundary in AndroidManifest ensuring ONLY the Android OS framework can bind and interact with RealGameVpnService.',
  },
];

export const NotificationScreen: React.FC<NotificationScreenProps> = ({
  telemetry,
  onDisconnect,
  onOptimizeRoute,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'CRITICAL' | 'HARDWARE'>('ALL');

  const filteredPermissions = ANDROID_PERMISSIONS_MATRIX.filter((item) => {
    if (selectedFilter === 'CRITICAL') return item.importance === 'CRITICAL';
    if (selectedFilter === 'HARDWARE')
      return item.name.includes('WIFI') || item.name.includes('WAKE');
    return true;
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.headerBox}>
        <View style={styles.tagRow}>
          <Ionicons name="notifications" size={16} color="#00F0FF" />
          <Text style={styles.tagText}>ANDROID FOREGROUND NOTIFICATION &amp; PERMISSIONS</Text>
        </View>
        <Text style={styles.title}>System Notification HUD</Text>
        <Text style={styles.subtitle}>
          Live preview of RealGameVpnService notification drawer widget and system permissions.
        </Text>
      </View>

      {/* Interactive Notification Preview */}
      <View style={{ marginTop: 14 }}>
        <NotificationSimulator
          telemetry={telemetry}
          onDisconnect={onDisconnect}
          onOptimizeRoute={onOptimizeRoute}
        />
      </View>

      {/* Permissions Breakdown Matrix */}
      <View style={styles.section}>
        <View style={styles.matrixHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>ANDROID MANIFEST PERMISSIONS MATRIX</Text>
            <Text style={styles.sectionSubtitle}>
              Required permissions declared in AndroidManifest.xml
            </Text>
          </View>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterPillsRow}>
          {(['ALL', 'CRITICAL', 'HARDWARE'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setSelectedFilter(filter)}
              style={[
                styles.filterPill,
                selectedFilter === filter && styles.filterPillActive,
              ]}
            >
              <Text
                style={[
                  styles.filterPillText,
                  selectedFilter === filter && styles.filterPillTextActive,
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.permissionsList}>
          {filteredPermissions.map((perm, index) => {
            const isCritical = perm.importance === 'CRITICAL';
            return (
              <View key={index} style={styles.permCard}>
                <View style={styles.permCardTop}>
                  <View style={styles.permLeft}>
                    <Text style={styles.permName}>{perm.name}</Text>
                    <Text style={styles.permCategory}>{perm.category}</Text>
                  </View>

                  <View
                    style={[
                      styles.importanceBadge,
                      isCritical ? styles.badgeCritical : styles.badgeRequired,
                    ]}
                  >
                    <Text
                      style={[
                        styles.importanceText,
                        isCritical ? { color: '#EF4444' } : { color: '#00F0FF' },
                      ]}
                    >
                      {perm.importance}
                    </Text>
                  </View>
                </View>

                <Text style={styles.permExplanation}>{perm.explanation}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070B14',
  },
  content: {
    paddingBottom: 30,
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
  section: {
    marginTop: 6,
    paddingHorizontal: 16,
  },
  matrixHeaderRow: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  sectionSubtitle: {
    fontSize: 10,
    color: '#475569',
    marginTop: 2,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterPill: {
    backgroundColor: '#0D1526',
    borderWidth: 1,
    borderColor: '#1C2943',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  filterPillActive: {
    backgroundColor: '#00F0FF15',
    borderColor: '#00F0FF',
  },
  filterPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  filterPillTextActive: {
    color: '#00F0FF',
  },
  permissionsList: {
    gap: 8,
  },
  permCard: {
    backgroundColor: '#0D1526',
    borderWidth: 1,
    borderColor: '#1C2943',
    borderRadius: 10,
    padding: 12,
  },
  permCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  permLeft: {
    flex: 1,
    paddingRight: 8,
  },
  permName: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  permCategory: {
    fontSize: 9,
    color: '#00F0FF',
    marginTop: 2,
    fontWeight: '700',
  },
  importanceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  badgeCritical: {
    backgroundColor: '#7F1D1D20',
    borderColor: '#EF444455',
  },
  badgeRequired: {
    backgroundColor: '#00F0FF15',
    borderColor: '#00F0FF55',
  },
  importanceText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  permExplanation: {
    fontSize: 10,
    color: '#94A3B8',
    lineHeight: 15,
  },
});
