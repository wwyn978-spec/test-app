import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { GameProfile, GamingServerNode, VpnTelemetry } from '../types/vpn';
import { ReactorButton } from '../components/ReactorButton';
import { LatencySparkline } from '../components/LatencySparkline';
import { GAME_PROFILES } from '../data/gameProfiles';
import { GAMING_SERVERS } from '../data/gamingNodes';

interface DashboardScreenProps {
  telemetry: VpnTelemetry;
  onToggleVpn: () => void;
  onSelectGame: (game: GameProfile) => void;
  onSelectServer: (server: GamingServerNode) => void;
  onUpdateTuning: (options: {
    wifiLock?: boolean;
    wakeLock?: boolean;
    splitTunnel?: boolean;
  }) => void;
  onNavigateToConfig: () => void;
  onNavigateToRouting: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  telemetry,
  onToggleVpn,
  onSelectGame,
  onSelectServer,
  onUpdateTuning,
  onNavigateToConfig,
  onNavigateToRouting,
}) => {
  const [showGameModal, setShowGameModal] = useState(false);
  const [showServerModal, setShowServerModal] = useState(false);

  const formatUptime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Telemetry Grid */}
      <View style={styles.telemetryGrid}>
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Ionicons name="speedometer-outline" size={13} color="#00F0FF" />
            <Text style={styles.metricLabel}>PACKETS ROUTED</Text>
          </View>
          <Text style={styles.metricValue}>
            {telemetry.isConnected ? telemetry.packetsRouted.toLocaleString() : '--'}
          </Text>
          <Text style={styles.metricSub}>
            {telemetry.isConnected ? `${telemetry.downloadSpeedKbps} Kb/s UDP` : 'Standby'}
          </Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Ionicons name="swap-vertical-outline" size={13} color="#10B981" />
            <Text style={styles.metricLabel}>DATA VOLUME</Text>
          </View>
          <Text style={styles.metricValue}>
            {telemetry.isConnected ? formatBytes(telemetry.bytesTransferred) : '--'}
          </Text>
          <Text style={styles.metricSub}>
            {telemetry.isConnected ? 'tun0 payload' : '0 B/s'}
          </Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Ionicons name="time-outline" size={13} color="#F59E0B" />
            <Text style={styles.metricLabel}>MATCH TIME</Text>
          </View>
          <Text style={styles.metricValue}>
            {telemetry.isConnected ? formatUptime(telemetry.uptimeSeconds) : '00:00'}
          </Text>
          <Text style={styles.metricSub}>
            {telemetry.isConnected ? 'Low-Jitter Active' : 'Disconnected'}
          </Text>
        </View>
      </View>

      {/* Main Reactor Booster Button */}
      <ReactorButton
        isConnected={telemetry.isConnected}
        isConnecting={telemetry.isConnecting}
        latencyMs={telemetry.currentLatencyMs}
        gameTitle={telemetry.activeGame.gameTitle}
        onPress={onToggleVpn}
      />

      {/* Active Target Game Selector Card */}
      <View style={styles.targetCard}>
        <View style={styles.targetHeader}>
          <View style={styles.targetLeft}>
            <View style={styles.gameIconBadge}>
              <Ionicons
                name={telemetry.activeGame.icon as any}
                size={20}
                color="#00F0FF"
              />
            </View>
            <View>
              <View style={styles.gameTitleRow}>
                <Text style={styles.targetCardTitle}>TARGET GAMING APP</Text>
                <View style={styles.packageBadge}>
                  <Text style={styles.packageBadgeText}>SPLIT TUNNEL</Text>
                </View>
              </View>
              <Text style={styles.gameName}>{telemetry.activeGame.gameTitle}</Text>
              <Text style={styles.gamePackage} numberOfLines={1}>
                {telemetry.activeGame.packageName}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowGameModal(true)}
            style={styles.switchButton}
          >
            <Ionicons name="swap-horizontal" size={14} color="#00F0FF" />
            <Text style={styles.switchText}>CHANGE</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.targetFooter}>
          <View style={styles.tuningTag}>
            <Text style={styles.tuningTagLabel}>MTU:</Text>
            <Text style={styles.tuningTagValue}>{telemetry.mtu} bytes</Text>
          </View>
          <View style={styles.tuningTag}>
            <Text style={styles.tuningTagLabel}>PORTS:</Text>
            <Text style={styles.tuningTagValue}>
              {telemetry.activeGame.ports.slice(0, 3).join(', ')}...
            </Text>
          </View>
          <View style={styles.tuningTag}>
            <Text style={styles.tuningTagLabel}>QOS DSCP:</Text>
            <Text style={styles.tuningTagValue}>
              0x{telemetry.dscpTag.toString(16).toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* Latency & Jitter History Graph */}
      <LatencySparkline
        currentLatency={telemetry.currentLatencyMs}
        jitter={telemetry.currentJitterMs}
        packetLoss={telemetry.packetLossRate}
        isConnected={telemetry.isConnected}
      />

      {/* Active Gaming Server Relay Node Card */}
      <View style={styles.serverCard}>
        <View style={styles.serverCardContent}>
          <View style={styles.serverInfoLeft}>
            <Text style={styles.serverFlag}>{telemetry.activeServer.flag}</Text>
            <View>
              <View style={styles.serverTitleRow}>
                <Text style={styles.serverName}>{telemetry.activeServer.name}</Text>
                <View style={styles.pingTag}>
                  <View style={styles.pingTagDot} />
                  <Text style={styles.pingTagText}>
                    {telemetry.activeServer.basePingMs}ms
                  </Text>
                </View>
              </View>
              <Text style={styles.serverRegion}>{telemetry.activeServer.region}</Text>
              <Text style={styles.serverHost} numberOfLines={1}>
                {telemetry.activeServer.host}:{telemetry.activeServer.port}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowServerModal(true)}
            style={styles.switchServerButton}
          >
            <Ionicons name="globe-outline" size={14} color="#FFFFFF" />
            <Text style={styles.switchServerText}>SELECT NODE</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Hardware Latency Safeguards Toggles */}
      <View style={styles.safeguardsCard}>
        <Text style={styles.safeguardsTitle}>ANDROID LATENCY SAFEGUARDS</Text>

        <View style={styles.safeguardRow}>
          <View style={styles.safeguardLeft}>
            <View style={styles.safeguardIconBg}>
              <Ionicons name="wifi" size={16} color="#00F0FF" />
            </View>
            <View style={styles.safeguardTextGroup}>
              <Text style={styles.safeguardName}>Wi-Fi Low-Latency Lock</Text>
              <Text style={styles.safeguardDesc}>
                WIFI_MODE_FULL_LOW_LATENCY disables beacon sleep
              </Text>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onUpdateTuning({ wifiLock: !telemetry.wifiLockActive })}
            style={[
              styles.toggleSwitch,
              telemetry.wifiLockActive && styles.toggleSwitchActive,
            ]}
          >
            <View
              style={[
                styles.toggleKnob,
                telemetry.wifiLockActive && styles.toggleKnobActive,
              ]}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.safeguardDivider} />

        <View style={styles.safeguardRow}>
          <View style={styles.safeguardLeft}>
            <View style={styles.safeguardIconBg}>
              <Ionicons name="hardware-chip-outline" size={16} color="#10B981" />
            </View>
            <View style={styles.safeguardTextGroup}>
              <Text style={styles.safeguardName}>Match CPU WakeLock</Text>
              <Text style={styles.safeguardDesc}>
                PARTIAL_WAKE_LOCK eliminates core throttling spikes
              </Text>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onUpdateTuning({ wakeLock: !telemetry.wakeLockActive })}
            style={[
              styles.toggleSwitch,
              telemetry.wakeLockActive && styles.toggleSwitchActiveEmerald,
            ]}
          >
            <View
              style={[
                styles.toggleKnob,
                telemetry.wakeLockActive && styles.toggleKnobActive,
              ]}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.safeguardDivider} />

        <View style={styles.safeguardRow}>
          <View style={styles.safeguardLeft}>
            <View style={styles.safeguardIconBg}>
              <Ionicons name="git-branch-outline" size={16} color="#A855F7" />
            </View>
            <View style={styles.safeguardTextGroup}>
              <Text style={styles.safeguardName}>Strict Split Tunneling</Text>
              <Text style={styles.safeguardDesc}>
                Routes ONLY target game package through tun0
              </Text>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onUpdateTuning({ splitTunnel: !telemetry.splitTunnelActive })}
            style={[
              styles.toggleSwitch,
              telemetry.splitTunnelActive && styles.toggleSwitchActivePurple,
            ]}
          >
            <View
              style={[
                styles.toggleKnob,
                telemetry.splitTunnelActive && styles.toggleKnobActive,
              ]}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Action Navigation Buttons */}
      <View style={styles.quickNavRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onNavigateToConfig}
          style={styles.quickNavBtn}
        >
          <Ionicons name="options-outline" size={16} color="#00F0FF" />
          <Text style={styles.quickNavText}>ADVANCED GAME TUNING</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onNavigateToRouting}
          style={styles.quickNavBtn}
        >
          <Ionicons name="analytics-outline" size={16} color="#10B981" />
          <Text style={styles.quickNavText}>PING MATRIX BENCHMARK</Text>
        </TouchableOpacity>
      </View>

      {/* Modal: Game Profile Selector */}
      <Modal visible={showGameModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>SELECT TARGET GAME</Text>
                <Text style={styles.modalSubtitle}>
                  RealGameVpnService binds package split-tunneling
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowGameModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={GAME_PROFILES}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingVertical: 8 }}
              renderItem={({ item }) => {
                const isSelected = item.id === telemetry.activeGame.id;
                return (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      onSelectGame(item);
                      setShowGameModal(false);
                    }}
                    style={[styles.gameListItem, isSelected && styles.gameListItemSelected]}
                  >
                    <View style={styles.gameListLeft}>
                      <View style={styles.gameListIcon}>
                        <Ionicons name={item.icon as any} size={20} color="#00F0FF" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.gameListTitle}>{item.gameTitle}</Text>
                        <Text style={styles.gameListGenre}>{item.genre}</Text>
                        <Text style={styles.gameListPkg}>{item.packageName}</Text>
                      </View>
                    </View>
                    <View style={styles.gameListRight}>
                      <Text style={styles.gameListMtu}>MTU {item.recommendedMtu}</Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={18} color="#00F0FF" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Modal: Gaming Server Node Selector */}
      <Modal visible={showServerModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>GAMING RELAY NODES</Text>
                <Text style={styles.modalSubtitle}>
                  Ultra-low jitter direct gaming peering clusters
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowServerModal(false)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={GAMING_SERVERS}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingVertical: 8 }}
              renderItem={({ item }) => {
                const isSelected = item.id === telemetry.activeServer.id;
                return (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => {
                      onSelectServer(item);
                      setShowServerModal(false);
                    }}
                    style={[styles.serverListItem, isSelected && styles.serverListItemSelected]}
                  >
                    <View style={styles.serverListLeft}>
                      <Text style={styles.serverListFlag}>{item.flag}</Text>
                      <View>
                        <Text style={styles.serverListTitle}>{item.name}</Text>
                        <Text style={styles.serverListRegion}>{item.region}</Text>
                        <Text style={styles.serverListHost}>{item.host}</Text>
                      </View>
                    </View>
                    <View style={styles.serverListRight}>
                      <View style={styles.serverPingBadge}>
                        <Text style={styles.serverPingValue}>{item.basePingMs}ms</Text>
                      </View>
                      <Text style={styles.serverLoadText}>{item.loadPercent}% load</Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070B14',
  },
  content: {
    paddingBottom: 24,
  },
  telemetryGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#0D1424',
    borderWidth: 1,
    borderColor: '#19243B',
    borderRadius: 10,
    padding: 10,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  metricSub: {
    fontSize: 9,
    color: '#475569',
    marginTop: 2,
  },
  targetCard: {
    backgroundColor: '#0C1324',
    borderWidth: 1,
    borderColor: '#1D2A45',
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 14,
  },
  targetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  targetLeft: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
  },
  gameIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#0F223D',
    borderWidth: 1,
    borderColor: '#00F0FF44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  targetCardTitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
  },
  packageBadge: {
    backgroundColor: '#10B98122',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  packageBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#10B981',
  },
  gameName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  gamePackage: {
    fontSize: 11,
    color: '#00F0FF',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00F0FF15',
    borderWidth: 1,
    borderColor: '#00F0FF55',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  switchText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00F0FF',
    letterSpacing: 0.6,
  },
  targetFooter: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#172238',
  },
  tuningTag: {
    flexDirection: 'row',
    backgroundColor: '#111A2E',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 4,
  },
  tuningTagLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
  },
  tuningTagValue: {
    fontSize: 9,
    fontWeight: '800',
    color: '#CBD5E1',
  },
  serverCard: {
    backgroundColor: '#0C1324',
    borderWidth: 1,
    borderColor: '#1D2A45',
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 14,
  },
  serverCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serverInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  serverFlag: {
    fontSize: 26,
  },
  serverTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  serverName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  pingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B98122',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    gap: 4,
  },
  pingTagDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  pingTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#10B981',
  },
  serverRegion: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  serverHost: {
    fontSize: 10,
    color: '#475569',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  switchServerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#19253D',
    borderWidth: 1,
    borderColor: '#2A3C61',
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 6,
    gap: 5,
  },
  switchServerText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#E2E8F0',
    letterSpacing: 0.6,
  },
  safeguardsCard: {
    backgroundColor: '#0C1324',
    borderWidth: 1,
    borderColor: '#1D2A45',
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
  },
  safeguardsTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  safeguardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  safeguardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 10,
  },
  safeguardIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#131D33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeguardTextGroup: {
    flex: 1,
  },
  safeguardName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#E2E8F0',
  },
  safeguardDesc: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1F293D',
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: '#00F0FF',
  },
  toggleSwitchActiveEmerald: {
    backgroundColor: '#10B981',
  },
  toggleSwitchActivePurple: {
    backgroundColor: '#A855F7',
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#94A3B8',
  },
  toggleKnobActive: {
    backgroundColor: '#070B14',
    alignSelf: 'flex-end',
  },
  safeguardDivider: {
    height: 1,
    backgroundColor: '#172238',
    marginVertical: 10,
  },
  quickNavRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  quickNavBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F182D',
    borderWidth: 1,
    borderColor: '#1F2F4E',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  quickNavText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#CBD5E1',
    letterSpacing: 0.6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0A1020',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: '#1E2C4A',
    maxHeight: '80%',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#172238',
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1A253D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0E162B',
    borderWidth: 1,
    borderColor: '#1A2644',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  gameListItemSelected: {
    borderColor: '#00F0FF',
    backgroundColor: '#00F0FF10',
  },
  gameListLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 8,
  },
  gameListIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#14223D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameListTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  gameListGenre: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  gameListPkg: {
    fontSize: 9,
    color: '#00F0FF',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  gameListRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  gameListMtu: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  serverListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0E162B',
    borderWidth: 1,
    borderColor: '#1A2644',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  serverListItemSelected: {
    borderColor: '#10B981',
    backgroundColor: '#10B98110',
  },
  serverListLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  serverListFlag: {
    fontSize: 24,
  },
  serverListTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  serverListRegion: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  serverListHost: {
    fontSize: 9,
    color: '#64748B',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  serverListRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  serverPingBadge: {
    backgroundColor: '#10B98122',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  serverPingValue: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
  },
  serverLoadText: {
    fontSize: 9,
    color: '#64748B',
  },
});
