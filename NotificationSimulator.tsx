import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { VpnTelemetry } from '../types/vpn';

interface NotificationSimulatorProps {
  telemetry: VpnTelemetry;
  onDisconnect: () => void;
  onOptimizeRoute?: () => void;
}

export const NotificationSimulator: React.FC<NotificationSimulatorProps> = ({
  telemetry,
  onDisconnect,
  onOptimizeRoute,
}) => {
  const isOnline = telemetry.isConnected;

  return (
    <View style={styles.container}>
      <View style={styles.headerInfo}>
        <View style={styles.badgeRow}>
          <Ionicons name="notifications" size={14} color="#00F0FF" />
          <Text style={styles.systemTag}>ANDROID SYSTEM FOREGROUND NOTIFICATION</Text>
        </View>
        <Text style={styles.channelMeta}>
          Channel: gaming_vpn_telemetry_channel | Type: specialUse
        </Text>
      </View>

      {/* Simulated Android Notification Shade Item */}
      <View style={styles.notificationCard}>
        {/* Top Header of Android Notification */}
        <View style={styles.notifTopRow}>
          <View style={styles.notifAppInfo}>
            <View style={styles.notifSmallIcon}>
              <Ionicons name="game-controller" size={12} color="#00F0FF" />
            </View>
            <Text style={styles.notifAppName}>RealGame VPN</Text>
            <Text style={styles.notifDot}>•</Text>
            <Text style={styles.notifTime}>now</Text>
          </View>
          <View style={styles.ongoingBadge}>
            <Text style={styles.ongoingText}>ONGOING</Text>
          </View>
        </View>

        {/* Content Title & Body */}
        <View style={styles.notifContent}>
          <Text style={styles.notifTitle}>
            {isOnline
              ? `RealGame • ${telemetry.activeGame.gameTitle}`
              : 'RealGame VPN • Service Standby'}
          </Text>

          <Text style={styles.notifBody}>
            {isOnline
              ? `${telemetry.currentLatencyMs}ms Ping (±${telemetry.currentJitterMs}ms) | ${telemetry.packetsRouted.toLocaleString()} pkts routed`
              : 'Tap to configure game profile and initiate low-latency VPN tunnel.'}
          </Text>

          {isOnline && (
            <View style={styles.statusChipsRow}>
              <View style={styles.chip}>
                <Ionicons name="flash" size={10} color="#10B981" />
                <Text style={styles.chipText}>MTU: {telemetry.mtu}</Text>
              </View>
              <View style={styles.chip}>
                <Ionicons name="shield-checkmark" size={10} color="#00F0FF" />
                <Text style={styles.chipText}>
                  DSCP: 0x{telemetry.dscpTag.toString(16).toUpperCase()}
                </Text>
              </View>
              <View style={styles.chip}>
                <Ionicons name="wifi" size={10} color="#F59E0B" />
                <Text style={styles.chipText}>Low-Latency Lock</Text>
              </View>
            </View>
          )}
        </View>

        {/* Android Notification Action Buttons */}
        {isOnline && (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onDisconnect}
              style={styles.actionButtonDanger}
            >
              <Ionicons name="close-circle-outline" size={14} color="#EF4444" />
              <Text style={styles.actionTextDanger}>DISCONNECT</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onOptimizeRoute}
              style={styles.actionButtonPrimary}
            >
              <Ionicons name="refresh-outline" size={14} color="#00F0FF" />
              <Text style={styles.actionTextPrimary}>BOOST ROUTE</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Text style={styles.android14Note}>
        Declared with android:foregroundServiceType="specialUse" and POST_NOTIFICATIONS
        permission for background match stability on Android 14/15.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0B111E',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1B253B',
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  headerInfo: {
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  systemTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00F0FF',
    letterSpacing: 0.8,
  },
  channelMeta: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  notificationCard: {
    backgroundColor: '#151D2F',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#22304C',
    padding: 12,
  },
  notifTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  notifAppInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notifSmallIcon: {
    width: 20,
    height: 20,
    borderRadius: 5,
    backgroundColor: '#0D213B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifAppName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  notifDot: {
    fontSize: 11,
    color: '#475569',
  },
  notifTime: {
    fontSize: 10,
    color: '#64748B',
  },
  ongoingBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ongoingText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  notifContent: {
    marginTop: 2,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  notifBody: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 16,
  },
  statusChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B1220',
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  chipText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#E2E8F0',
    fontVariant: ['tabular-nums'],
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#22304C',
  },
  actionButtonDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7F1D1D25',
    borderWidth: 1,
    borderColor: '#EF444444',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 5,
  },
  actionTextDanger: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EF4444',
    letterSpacing: 0.6,
  },
  actionButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00F0FF15',
    borderWidth: 1,
    borderColor: '#00F0FF44',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 5,
  },
  actionTextPrimary: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00F0FF',
    letterSpacing: 0.6,
  },
  android14Note: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 8,
    lineHeight: 13,
  },
});
