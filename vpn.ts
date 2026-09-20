export type GameProtocol = 'UDP_FAST_TRACK' | 'HYBRID_TCP_UDP' | 'ANTI_JITTER_PACING';

export interface GameProfile {
  id: string;
  gameTitle: string;
  packageName: string;
  icon: string;
  genre: string;
  ports: number[];
  recommendedMtu: number;
  dscpTag: number; // e.g. 0x2E (Expedited Forwarding)
  defaultServerId: string;
  protocol: GameProtocol;
  description: string;
}

export interface GamingServerNode {
  id: string;
  name: string;
  region: string;
  country: string;
  flag: string;
  host: string;
  port: number;
  basePingMs: number;
  currentPingMs: number;
  loadPercent: number;
  reliability: number;
  coordinates: { x: number; y: number };
}

export interface VpnTelemetry {
  isConnected: boolean;
  isConnecting: boolean;
  activeGame: GameProfile;
  activeServer: GamingServerNode;
  currentLatencyMs: number;
  currentJitterMs: number;
  packetLossRate: number;
  packetsRouted: number;
  bytesTransferred: number;
  downloadSpeedKbps: number;
  uploadSpeedKbps: number;
  uptimeSeconds: number;
  wifiLockActive: boolean;
  wakeLockActive: boolean;
  splitTunnelActive: boolean;
  mtu: number;
  dscpTag: number;
  fastDns: string;
}

export interface PacketLogEntry {
  id: string;
  timestamp: string;
  protocol: 'UDP' | 'TCP' | 'ICMP';
  port: number;
  sizeBytes: number;
  latencyMs: number;
  status: 'FAST_TRACK' | 'OPTIMIZED' | 'BYPASSED' | 'DIRECT';
  destination: string;
}

export interface DiagnosticLog {
  id: string;
  timestamp: string;
  tag: string;
  level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  message: string;
}
