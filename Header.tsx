import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { VpnTelemetry } from '../types/vpn';

interface HeaderProps {
  telemetry: VpnTelemetry;
  onOpenLogs?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ telemetry, onOpenLogs }) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        <View style={styles.logoBadge}>
          <Ionicons name="game-controller" size={20} color="#00F0FF" />
        </View>
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.title}>RealGame</Text>
            <View style={styles.vpnBadge}>
              <Text style={styles.vpnBadgeText}>VPN</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Ultra Low-Latency Booster</Text>
        </View>
      </View>

      <View style={styles.rightRow}>
        {/* Hardware Locks Pill */}
        <View style={styles.hardwareLocksRow}>
          <View
            style={[
              styles.lockIconBadge,
              telemetry.wifiLockActive && telemetry.isConnected && styles.lockIconActive,
            ]}
          >
            <Ionicons
              name="wifi"
              size={12}
              color={telemetry.wifiLockActive && telemetry.isConnected ? '#00F0FF' : '#526075'}
            />
          </View>
          <View
            style={[
              styles.lockIconBadge,
              telemetry.wakeLockActive && telemetry.isConnected && styles.lockIconActiveEmerald,
            ]}
          >
            <Ionicons
              name="hardware-chip-outline"
              size={12}
              color={telemetry.wakeLockActive && telemetry.isConnected ? '#10B981' : '#526075'}
            />
          </View>
        </View>

        {/* Status Indicator */}
        <View
          style={[
            styles.statusPill,
            telemetry.isConnected
              ? styles.statusConnected
              : telemetry.isConnecting
              ? styles.statusConnecting
              : styles.statusDisconnected,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              telemetry.isConnected
                ? styles.dotConnected
                : telemetry.isConnecting
                ? styles.dotConnecting
                : styles.dotDisconnected,
            ]}
          />
          <Text style={styles.statusText}>
            {telemetry.isConnected
              ? 'TUN0 ACTIVE'
              : telemetry.isConnecting
              ? 'ROUTING...'
              : 'STANDBY'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: '#090D16',
    borderBottomWidth: 1,
    borderBottomColor: '#172033',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#0D1E36',
    borderWidth: 1,
    borderColor: '#00F0FF55',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  vpnBadge: {
    backgroundColor: '#00F0FF22',
    borderWidth: 1,
    borderColor: '#00F0FF',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  vpnBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#00F0FF',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hardwareLocksRow: {
    flexDirection: 'row',
    gap: 4,
  },
  lockIconBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#111726',
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIconActive: {
    backgroundColor: '#00F0FF15',
    borderColor: '#00F0FF66',
  },
  lockIconActiveEmerald: {
    backgroundColor: '#10B98115',
    borderColor: '#10B98166',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
  },
  statusConnected: {
    backgroundColor: '#052E2B',
    borderColor: '#10B981',
  },
  statusConnecting: {
    backgroundColor: '#3B2904',
    borderColor: '#F59E0B',
  },
  statusDisconnected: {
    backgroundColor: '#161D2B',
    borderColor: '#334155',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotConnected: {
    backgroundColor: '#10B981',
  },
  dotConnecting: {
    backgroundColor: '#F59E0B',
  },
  dotDisconnected: {
    backgroundColor: '#64748B',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#E2E8F0',
    letterSpacing: 0.8,
  },
});
