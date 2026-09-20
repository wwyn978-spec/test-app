import {
  DiagnosticLog,
  GameProfile,
  GamingServerNode,
  PacketLogEntry,
  VpnTelemetry,
} from '../types/vpn';
import { GAME_PROFILES } from '../data/gameProfiles';
import { GAMING_SERVERS } from '../data/gamingNodes';

type TelemetryListener = (telemetry: VpnTelemetry) => void;
type PacketListener = (packet: PacketLogEntry) => void;
type LogListener = (log: DiagnosticLog) => void;

class VpnSimulationManager {
  private telemetryListeners: Set<TelemetryListener> = new Set();
  private packetListeners: Set<PacketListener> = new Set();
  private logListeners: Set<LogListener> = new Set();

  private telemetry: VpnTelemetry = {
    isConnected: false,
    isConnecting: false,
    activeGame: GAME_PROFILES[0],
    activeServer: GAMING_SERVERS[0],
    currentLatencyMs: 22,
    currentJitterMs: 0.8,
    packetLossRate: 0.0,
    packetsRouted: 0,
    bytesTransferred: 0,
    downloadSpeedKbps: 0,
    uploadSpeedKbps: 0,
    uptimeSeconds: 0,
    wifiLockActive: true,
    wakeLockActive: true,
    splitTunnelActive: true,
    mtu: GAME_PROFILES[0].recommendedMtu,
    dscpTag: GAME_PROFILES[0].dscpTag,
    fastDns: '1.1.1.1 (Cloudflare Gaming)',
  };

  private logs: DiagnosticLog[] = [
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString(),
      tag: 'RealGameVpnService',
      level: 'INFO',
      message: 'Service class loaded. AndroidManifest permissions verified.',
    },
    {
      id: 'init-2',
      timestamp: new Date().toLocaleTimeString(),
      tag: 'RealGameVpnService',
      level: 'DEBUG',
      message: 'Ready to bind android.net.VpnService. Awaiting user action.',
    },
  ];

  private packets: PacketLogEntry[] = [];
  private loopInterval: any = null;
  private uptimeInterval: any = null;
  private packetCounter = 0;

  constructor() {
    this.addInitialPackets();
  }

  private addInitialPackets() {
    const protocols: ('UDP' | 'TCP')[] = ['UDP', 'UDP', 'UDP', 'TCP'];
    const ports = [7500, 7501, 8000, 10012, 11000];
    for (let i = 0; i < 6; i++) {
      this.packets.push({
        id: `pkt-${i}`,
        timestamp: new Date(Date.now() - (6 - i) * 1500).toLocaleTimeString(),
        protocol: protocols[i % protocols.length],
        port: ports[i % ports.length],
        sizeBytes: 120 + Math.floor(Math.random() * 800),
        latencyMs: 18 + Math.floor(Math.random() * 12),
        status: i % 4 === 0 ? 'OPTIMIZED' : 'FAST_TRACK',
        destination: '147.75.80.12',
      });
    }
  }

  public getTelemetry(): VpnTelemetry {
    return { ...this.telemetry };
  }

  public getLogs(): DiagnosticLog[] {
    return [...this.logs];
  }

  public getPackets(): PacketLogEntry[] {
    return [...this.packets];
  }

  public subscribeTelemetry(listener: TelemetryListener): () => void {
    this.telemetryListeners.add(listener);
    listener(this.telemetry);
    return () => this.telemetryListeners.delete(listener);
  }

  public subscribePackets(listener: PacketListener): () => void {
    this.packetListeners.add(listener);
    return () => this.packetListeners.delete(listener);
  }

  public subscribeLogs(listener: LogListener): () => void {
    this.logListeners.add(listener);
    return () => this.logListeners.delete(listener);
  }

  private emitTelemetry() {
    for (const listener of this.telemetryListeners) {
      listener({ ...this.telemetry });
    }
  }

  private emitLog(level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR', tag: string, message: string) {
    const entry: DiagnosticLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      tag,
      level,
      message,
    };
    this.logs.unshift(entry);
    if (this.logs.length > 200) this.logs.pop();
    for (const listener of this.logListeners) {
      listener(entry);
    }
  }

  private emitPacket(packet: PacketLogEntry) {
    this.packets.unshift(packet);
    if (this.packets.length > 60) this.packets.pop();
    for (const listener of this.packetListeners) {
      listener(packet);
    }
  }

  public startVpn(
    targetGame?: GameProfile,
    targetServer?: GamingServerNode,
    customOptions?: {
      mtu?: number;
      splitTunnel?: boolean;
      wifiLock?: boolean;
      wakeLock?: boolean;
    }
  ): Promise<boolean> {
    if (this.telemetry.isConnected || this.telemetry.isConnecting) {
      return Promise.resolve(true);
    }

    const game = targetGame || this.telemetry.activeGame;
    const server = targetServer || this.telemetry.activeServer;

    this.telemetry.isConnecting = true;
    this.telemetry.activeGame = game;
    this.telemetry.activeServer = server;
    if (customOptions?.mtu) this.telemetry.mtu = customOptions.mtu;
    if (customOptions?.splitTunnel !== undefined) this.telemetry.splitTunnelActive = customOptions.splitTunnel;
    if (customOptions?.wifiLock !== undefined) this.telemetry.wifiLockActive = customOptions.wifiLock;
    if (customOptions?.wakeLock !== undefined) this.telemetry.wakeLockActive = customOptions.wakeLock;

    this.emitTelemetry();
    this.emitLog('INFO', 'RealGameVpnService', `ACTION_START_VPN received for target game: "${game.gameTitle}"`);
    this.emitLog('DEBUG', 'RealGameVpnService', `Target Package: ${game.packageName || 'Global Route'}`);

    return new Promise((resolve) => {
      // Step 1: Hardware Locks simulation
      setTimeout(() => {
        if (this.telemetry.wakeLockActive) {
          this.emitLog('DEBUG', 'PowerManager', 'Acquired PARTIAL_WAKE_LOCK ("RealGameVpn::CpuMatchLock")');
        }
        if (this.telemetry.wifiLockActive) {
          this.emitLog('DEBUG', 'WifiManager', 'Acquired WIFI_MODE_FULL_LOW_LATENCY lock. Power-save polling disabled.');
        }
      }, 300);

      // Step 2: Tun Interface and Split Tunneling
      setTimeout(() => {
        this.emitLog('INFO', 'VpnService.Builder', `Configuring tun0: MTU=${this.telemetry.mtu}, IP=10.240.0.2/24`);
        if (this.telemetry.splitTunnelActive && game.packageName) {
          this.emitLog('INFO', 'VpnService.Builder', `Split tunneling activated: addAllowedApplication("${game.packageName}")`);
        }
        this.emitLog('INFO', 'VpnService.Builder', `Assigned Gaming DNS: 1.1.1.1, DSCP=0x${game.dscpTag.toString(16).toUpperCase()}`);
      }, 700);

      // Step 3: Establish tunnel and launch coroutines
      setTimeout(() => {
        this.emitLog('INFO', 'RealGameVpnService', 'Virtual TUN interface established (fd=42). Tunnel handshake verified.');
        this.emitLog('INFO', 'NotificationManager', 'Foreground notification HUD published [Channel: gaming_vpn_telemetry_channel]');
        this.emitLog('DEBUG', 'Coroutines', 'Launched Dispatchers.IO: [packet-router, latency-telemetry, notification-updater]');

        this.telemetry.isConnected = true;
        this.telemetry.isConnecting = false;
        this.telemetry.currentLatencyMs = server.basePingMs;
        this.telemetry.currentJitterMs = 0.8;
        this.telemetry.packetLossRate = 0.0;
        this.telemetry.uptimeSeconds = 0;

        this.startBackgroundLoop();
        this.emitTelemetry();
        resolve(true);
      }, 1200);
    });
  }

  public stopVpn(): Promise<boolean> {
    if (!this.telemetry.isConnected && !this.telemetry.isConnecting) {
      return Promise.resolve(true);
    }

    this.emitLog('INFO', 'RealGameVpnService', 'ACTION_STOP_VPN dispatched. Initiating clean teardown...');

    return new Promise((resolve) => {
      this.stopBackgroundLoop();

      setTimeout(() => {
        this.emitLog('DEBUG', 'Coroutines', 'Cancelled vpnScope coroutines cleanly (Job cancellation).');
        this.emitLog('INFO', 'VpnService', 'Virtual TUN interface closed (fd=42).');
        if (this.telemetry.wifiLockActive) {
          this.emitLog('DEBUG', 'WifiManager', 'Released Wi-Fi Low Latency Lock.');
        }
        if (this.telemetry.wakeLockActive) {
          this.emitLog('DEBUG', 'PowerManager', 'Released CPU Partial WakeLock.');
        }
        this.emitLog('INFO', 'NotificationManager', 'Foreground notification dismissed.');
        this.emitLog('INFO', 'RealGameVpnService', `Service stopped. Total packets routed: ${this.telemetry.packetsRouted.toLocaleString()}`);

        this.telemetry.isConnected = false;
        this.telemetry.isConnecting = false;
        this.telemetry.downloadSpeedKbps = 0;
        this.telemetry.uploadSpeedKbps = 0;
        this.emitTelemetry();
        resolve(true);
      }, 600);
    });
  }

  public selectGame(game: GameProfile) {
    this.telemetry.activeGame = game;
    this.telemetry.mtu = game.recommendedMtu;
    this.telemetry.dscpTag = game.dscpTag;
    const matchingServer = GAMING_SERVERS.find((s) => s.id === game.defaultServerId);
    if (matchingServer) {
      this.telemetry.activeServer = matchingServer;
    }

    this.emitTelemetry();
    if (this.telemetry.isConnected) {
      this.emitLog('INFO', 'RealGameVpnService', `Hot-swapped target game config to: ${game.gameTitle} (${game.packageName})`);
      this.emitLog('DEBUG', 'VpnService.Builder', `Applied new MTU=${game.recommendedMtu}, DSCP=0x${game.dscpTag.toString(16).toUpperCase()}`);
    }
  }

  public selectServer(server: GamingServerNode) {
    this.telemetry.activeServer = server;
    if (this.telemetry.isConnected) {
      this.telemetry.currentLatencyMs = server.basePingMs;
      this.emitLog('INFO', 'RealGameVpnService', `Re-routing UDP tunnel to node: ${server.name} (${server.host}:${server.port})`);
    }
    this.emitTelemetry();
  }

  public updateTuning(options: {
    mtu?: number;
    splitTunnel?: boolean;
    wifiLock?: boolean;
    wakeLock?: boolean;
    fastDns?: string;
  }) {
    if (options.mtu !== undefined) this.telemetry.mtu = options.mtu;
    if (options.splitTunnel !== undefined) this.telemetry.splitTunnelActive = options.splitTunnel;
    if (options.wifiLock !== undefined) this.telemetry.wifiLockActive = options.wifiLock;
    if (options.wakeLock !== undefined) this.telemetry.wakeLockActive = options.wakeLock;
    if (options.fastDns !== undefined) this.telemetry.fastDns = options.fastDns;

    this.emitTelemetry();
    this.emitLog('DEBUG', 'RealGameVpnService', `Tuning updated: MTU=${this.telemetry.mtu}, SplitTunnel=${this.telemetry.splitTunnelActive}, WifiLock=${this.telemetry.wifiLockActive}`);
  }

  private startBackgroundLoop() {
    this.stopBackgroundLoop();

    // 1-second uptime counter
    this.uptimeInterval = setInterval(() => {
      this.telemetry.uptimeSeconds += 1;
      this.emitTelemetry();
    }, 1000);

    // 1.2-second telemetry & packet loop
    this.loopInterval = setInterval(() => {
      if (!this.telemetry.isConnected) return;

      const basePing = this.telemetry.activeServer.basePingMs;
      // Slight natural latency oscillation (±1-3 ms)
      const jitterDelta = (Math.random() - 0.45) * 2.5;
      const newLatency = Math.max(12, Math.round(basePing + jitterDelta));
      const newJitter = Number(Math.max(0.3, Math.abs(jitterDelta) * 0.7).toFixed(1));

      // Packet burst calculation
      const packetBurst = 45 + Math.floor(Math.random() * 65);
      const bytesBurst = packetBurst * (180 + Math.floor(Math.random() * 400));

      this.telemetry.currentLatencyMs = newLatency;
      this.telemetry.currentJitterMs = newJitter;
      this.telemetry.packetLossRate = Math.random() < 0.95 ? 0.0 : 0.1;
      this.telemetry.packetsRouted += packetBurst;
      this.telemetry.bytesTransferred += bytesBurst;
      this.telemetry.downloadSpeedKbps = Math.round((bytesBurst * 8) / 1024 * 1.8);
      this.telemetry.uploadSpeedKbps = Math.round((bytesBurst * 8) / 1024 * 0.6);

      // Generate a packet stream item
      this.packetCounter++;
      const gamePorts = this.telemetry.activeGame.ports;
      const port = gamePorts[Math.floor(Math.random() * gamePorts.length)];
      this.emitPacket({
        id: `pkt-${Date.now()}-${this.packetCounter}`,
        timestamp: new Date().toLocaleTimeString(),
        protocol: Math.random() < 0.85 ? 'UDP' : 'TCP',
        port,
        sizeBytes: 160 + Math.floor(Math.random() * 850),
        latencyMs: newLatency,
        status: newLatency < 25 ? 'FAST_TRACK' : 'OPTIMIZED',
        destination: this.telemetry.activeServer.host,
      });

      this.emitTelemetry();
    }, 1200);
  }

  private stopBackgroundLoop() {
    if (this.loopInterval) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }
    if (this.uptimeInterval) {
      clearInterval(this.uptimeInterval);
      this.uptimeInterval = null;
    }
  }

  public async runPingBenchmark(): Promise<{ [serverId: string]: number }> {
    const results: { [serverId: string]: number } = {};
    this.emitLog('INFO', 'Benchmark', 'Running multi-region gaming cluster ICMP/UDP latency benchmark...');

    for (const server of GAMING_SERVERS) {
      // Simulate real probe
      const variation = Math.round((Math.random() - 0.5) * 4);
      const ping = Math.max(10, server.basePingMs + variation);
      results[server.id] = ping;
      server.currentPingMs = ping;
    }

    this.emitLog('INFO', 'Benchmark', `Benchmark completed across ${GAMING_SERVERS.length} nodes.`);
    this.emitTelemetry();
    return results;
  }
}

export const vpnService = new VpnSimulationManager();
