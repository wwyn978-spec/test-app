import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { GamingServerNode, PacketLogEntry, VpnTelemetry } from '../types/vpn';
import { GAMING_SERVERS } from '../data/gamingNodes';
import { vpnService } from '../services/vpnSimulationService';

interface RoutingScreenProps {
  telemetry: VpnTelemetry;
  packets: PacketLogEntry[];
  onSelectServer: (server: GamingServerNode) => void;
}

export const RoutingScreen: React.FC<RoutingScreenProps> = ({
  telemetry,
  packets,
  onSelectServer,
}) => {
  const [benchmarking, setBenchmarking] = useState(false);
  const [servers, setServers] = useState<GamingServerNode[]>(GAMING_SERVERS);

  const handleRunBenchmark = async () => {
    setBenchmarking(true);
    const results = await vpnService.runPingBenchmark();
    setServers(
      GAMING_SERVERS.map((s) => ({
        ...s,
        currentPingMs: results[s.id] || s.currentPingMs,
      }))
    );
    setBenchmarking(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.headerBox}>
        <View style={styles.tagRow}>
          <Ionicons name="git-network" size={16} color="#00F0FF" />
          <Text style={styles.tagText}>UDP PACKET ROUTING &amp; MULTI-REGION TELEMETRY</Text>
        </View>
        <Text style={styles.title}>Packet Flow &amp; Edge Clusters</Text>
        <Text style={styles.subtitle}>
          Visualizes RealGameVpnService kernel TUN interface routing and low-latency peering.
        </Text>
      </View>

      {/* Visual Pipeline Architecture Card */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>VPN PACKET ROUTING PIPELINE</Text>
        <Text style={styles.sectionSubtitle}>
          From Android Game App socket down to the Edge Relay Node
        </Text>

        <View style={styles.pipelineCard}>
          {/* Step 1: Game App */}
          <View style={styles.pipelineNode}>
            <View style={styles.pipelineIconBox}>
              <Ionicons name="game-controller" size={18} color="#00F0FF" />
            </View>
            <View style={styles.pipelineDetails}>
              <Text style={styles.pipelineNodeTitle}>{telemetry.activeGame.gameTitle}</Text>
              <Text style={styles.pipelineNodeSub}>{telemetry.activeGame.packageName}</Text>
            </View>
            <View style={styles.pipelineStatusBadge}>
              <Text style={styles.pipelineStatusText}>SPLIT ISOLATED</Text>
            </View>
          </View>

          <View style={styles.pipelineArrow}>
            <View style={styles.arrowLine} />
            <Text style={styles.arrowLabel}>UDP Game Packets</Text>
            <Ionicons name="arrow-down" size={14} color="#00F0FF" />
          </View>

          {/* Step 2: tun0 Interface */}
          <View style={styles.pipelineNode}>
            <View style={[styles.pipelineIconBox, { borderColor: '#10B98155' }]}>
              <Ionicons name="shield-checkmark" size={18} color="#10B981" />
            </View>
            <View style={styles.pipelineDetails}>
              <Text style={styles.pipelineNodeTitle}>Virtual TUN Interface (tun0)</Text>
              <Text style={styles.pipelineNodeSub}>
                MTU: {telemetry.mtu}B | IP: 10.240.0.2/24 | DNS: 1.1.1.1
              </Text>
            </View>
            <View style={[styles.pipelineStatusBadge, { backgroundColor: '#10B98122' }]}>
              <Text style={[styles.pipelineStatusText, { color: '#10B981' }]}>
                {telemetry.isConnected ? 'ACTIVE' : 'STANDBY'}
              </Text>
            </View>
          </View>

          <View style={styles.pipelineArrow}>
            <View style={styles.arrowLine} />
            <Text style={styles.arrowLabel}>protect(DatagramSocket)</Text>
            <Ionicons name="arrow-down" size={14} color="#10B981" />
          </View>

          {/* Step 3: RealGame Booster Core */}
          <View style={styles.pipelineNode}>
            <View style={[styles.pipelineIconBox, { borderColor: '#A855F755' }]}>
              <Ionicons name="flash" size={18} color="#A855F7" />
            </View>
            <View style={styles.pipelineDetails}>
              <Text style={styles.pipelineNodeTitle}>RealGame Core Coroutine Loop</Text>
              <Text style={styles.pipelineNodeSub}>
                DSCP 0x{telemetry.dscpTag.toString(16).toUpperCase()} EF • Anti-Jitter Pacing
              </Text>
            </View>
            <View style={[styles.pipelineStatusBadge, { backgroundColor: '#A855F722' }]}>
              <Text style={[styles.pipelineStatusText, { color: '#A855F7' }]}>
                LOW JITTER
              </Text>
            </View>
          </View>

          <View style={styles.pipelineArrow}>
            <View style={styles.arrowLine} />
            <Text style={styles.arrowLabel}>Direct Peering BGP Route</Text>
            <Ionicons name="arrow-down" size={14} color="#A855F7" />
          </View>

          {/* Step 4: Relay Edge Node */}
          <View style={[styles.pipelineNode, { borderColor: '#00F0FF55' }]}>
            <View style={[styles.pipelineIconBox, { borderColor: '#00F0FF' }]}>
              <Text style={{ fontSize: 18 }}>{telemetry.activeServer.flag}</Text>
            </View>
            <View style={styles.pipelineDetails}>
              <Text style={styles.pipelineNodeTitle}>{telemetry.activeServer.name}</Text>
              <Text style={styles.pipelineNodeSub}>
                {telemetry.activeServer.host}:{telemetry.activeServer.port}
              </Text>
            </View>
            <View style={styles.pipelinePingBadge}>
              <Text style={styles.pipelinePingValue}>
                {telemetry.isConnected ? telemetry.currentLatencyMs : telemetry.activeServer.basePingMs}ms
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Multi-Region Gaming Cluster Ping Benchmark */}
      <View style={styles.section}>
        <View style={styles.benchmarkHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>GLOBAL GAMING CLUSTERS</Text>
            <Text style={styles.sectionSubtitle}>
              Simultaneous ICMP/UDP benchmark probes
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleRunBenchmark}
            disabled={benchmarking}
            style={styles.benchmarkBtn}
          >
            {benchmarking ? (
              <ActivityIndicator size="small" color="#00F0FF" />
            ) : (
              <>
                <Ionicons name="speedometer-outline" size={14} color="#00F0FF" />
                <Text style={styles.benchmarkBtnText}>PING ALL NODES</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.serversGrid}>
          {servers.map((server) => {
            const isSelected = server.id === telemetry.activeServer.id;
            const ping = server.currentPingMs;
            const pingColor = ping < 22 ? '#10B981' : ping < 30 ? '#00F0FF' : '#F59E0B';

            return (
              <TouchableOpacity
                key={server.id}
                activeOpacity={0.8}
                onPress={() => onSelectServer(server)}
                style={[styles.serverNodeCard, isSelected && styles.serverNodeCardActive]}
              >
                <View style={styles.serverNodeTop}>
                  <Text style={styles.serverNodeFlag}>{server.flag}</Text>
                  <View style={styles.serverNodePingBox}>
                    <Text style={[styles.serverNodePing, { color: pingColor }]}>
                      {ping}ms
                    </Text>
                  </View>
                </View>

                <Text style={styles.serverNodeName}>{server.name}</Text>
                <Text style={styles.serverNodeRegion}>{server.region}</Text>

                <View style={styles.serverNodeFooter}>
                  <Text style={styles.serverReliability}>
                    {server.reliability}% Uptime
                  </Text>
                  {isSelected && (
                    <View style={styles.activeCheckPill}>
                      <Ionicons name="checkmark" size={10} color="#00F0FF" />
                      <Text style={styles.activeCheckText}>ROUTED</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Live Routed Packet Stream */}
      <View style={styles.section}>
        <View style={styles.packetStreamHeader}>
          <Text style={styles.sectionTitle}>LIVE ROUTED UDP/TCP PACKET STREAM</Text>
          <Text style={styles.packetCountLabel}>
            {telemetry.packetsRouted.toLocaleString()} TOTAL PACKETS
          </Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          Real-time packet inspection from RealGameVpnService coroutine
        </Text>

        <View style={styles.packetTable}>
          <View style={styles.tableHeader}>
            <Text style={[styles.thCell, { flex: 1.2 }]}>TIMESTAMP</Text>
            <Text style={[styles.thCell, { flex: 0.9 }]}>PROTO</Text>
            <Text style={[styles.thCell, { flex: 1.2 }]}>PORT</Text>
            <Text style={[styles.thCell, { flex: 1 }]}>SIZE</Text>
            <Text style={[styles.thCell, { flex: 1 }]}>LATENCY</Text>
            <Text style={[styles.thCell, { flex: 1.2 }]}>STATUS</Text>
          </View>

          {packets.slice(0, 10).map((pkt) => {
            const isFast = pkt.status === 'FAST_TRACK';
            return (
              <View key={pkt.id} style={styles.tableRow}>
                <Text style={[styles.tdCell, { flex: 1.2, fontFamily: 'monospace' }]}>
                  {pkt.timestamp}
                </Text>
                <View style={[styles.tdCell, { flex: 0.9 }]}>
                  <View
                    style={[
                      styles.protoBadge,
                      pkt.protocol === 'UDP' ? styles.protoUdp : styles.protoTcp,
                    ]}
                  >
                    <Text style={styles.protoText}>{pkt.protocol}</Text>
                  </View>
                </View>
                <Text style={[styles.tdCell, { flex: 1.2, color: '#CBD5E1', fontFamily: 'monospace' }]}>
                  :{pkt.port}
                </Text>
                <Text style={[styles.tdCell, { flex: 1, color: '#94A3B8' }]}>
                  {pkt.sizeBytes} B
                </Text>
                <Text style={[styles.tdCell, { flex: 1, color: '#00F0FF', fontWeight: '800' }]}>
                  {pkt.latencyMs}ms
                </Text>
                <View style={[styles.tdCell, { flex: 1.2 }]}>
                  <View
                    style={[
                      styles.statusTag,
                      isFast ? styles.statusFast : styles.statusOptimized,
                    ]}
                  >
                    <Text style={[styles.statusTagText, isFast ? { color: '#10B981' } : { color: '#00F0FF' }]}>
                      {pkt.status}
                    </Text>
                  </View>
                </View>
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
    marginTop: 18,
    paddingHorizontal: 16,
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
    marginBottom: 10,
  },
  pipelineCard: {
    backgroundColor: '#0D1526',
    borderWidth: 1,
    borderColor: '#1C2943',
    borderRadius: 12,
    padding: 14,
  },
  pipelineNode: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#080E1C',
    borderWidth: 1,
    borderColor: '#1D2D4B',
    borderRadius: 10,
    padding: 10,
    gap: 10,
  },
  pipelineIconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#12203B',
    borderWidth: 1,
    borderColor: '#00F0FF44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pipelineDetails: {
    flex: 1,
  },
  pipelineNodeTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  pipelineNodeSub: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 1,
  },
  pipelineStatusBadge: {
    backgroundColor: '#00F0FF15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pipelineStatusText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#00F0FF',
  },
  pipelinePingBadge: {
    backgroundColor: '#10B98122',
    borderWidth: 1,
    borderColor: '#10B98166',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  pipelinePingValue: {
    fontSize: 12,
    fontWeight: '900',
    color: '#10B981',
  },
  pipelineArrow: {
    alignItems: 'center',
    paddingVertical: 4,
    gap: 2,
  },
  arrowLine: {
    width: 1,
    height: 6,
    backgroundColor: '#2A3C61',
  },
  arrowLabel: {
    fontSize: 8,
    color: '#64748B',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  benchmarkHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  benchmarkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00F0FF15',
    borderWidth: 1,
    borderColor: '#00F0FF55',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  benchmarkBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00F0FF',
    letterSpacing: 0.6,
  },
  serversGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serverNodeCard: {
    width: '48.5%',
    backgroundColor: '#0D1526',
    borderWidth: 1,
    borderColor: '#1C2943',
    borderRadius: 10,
    padding: 10,
  },
  serverNodeCardActive: {
    borderColor: '#00F0FF',
    backgroundColor: '#00F0FF0E',
  },
  serverNodeTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  serverNodeFlag: {
    fontSize: 18,
  },
  serverNodePingBox: {
    backgroundColor: '#080E1C',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  serverNodePing: {
    fontSize: 11,
    fontWeight: '800',
  },
  serverNodeName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  serverNodeRegion: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 1,
  },
  serverNodeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#172238',
  },
  serverReliability: {
    fontSize: 8,
    color: '#475569',
  },
  activeCheckPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  activeCheckText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#00F0FF',
  },
  packetStreamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packetCountLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#00F0FF',
  },
  packetTable: {
    backgroundColor: '#0D1526',
    borderWidth: 1,
    borderColor: '#1C2943',
    borderRadius: 10,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0A1020',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1C2943',
  },
  thCell: {
    fontSize: 8,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#131D33',
  },
  tdCell: {
    fontSize: 9,
    color: '#94A3B8',
  },
  protoBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    alignSelf: 'flex-start',
  },
  protoUdp: {
    backgroundColor: '#00F0FF20',
  },
  protoTcp: {
    backgroundColor: '#F59E0B20',
  },
  protoText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#E2E8F0',
  },
  statusTag: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    alignSelf: 'flex-start',
  },
  statusFast: {
    backgroundColor: '#10B98115',
  },
  statusOptimized: {
    backgroundColor: '#00F0FF15',
  },
  statusTagText: {
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
