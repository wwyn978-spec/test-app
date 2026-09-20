import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Header } from './src/components/Header';
import { BottomNavBar, TabKey } from './src/components/BottomNavBar';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { GameConfigScreen } from './src/screens/GameConfigScreen';
import { RoutingScreen } from './src/screens/RoutingScreen';
import { NotificationScreen } from './src/screens/NotificationScreen';
import { SourceCodeScreen } from './src/screens/SourceCodeScreen';
import { LogsScreen } from './src/screens/LogsScreen';

import { vpnService } from './src/services/vpnSimulationService';
import { DiagnosticLog, GameProfile, GamingServerNode, PacketLogEntry, VpnTelemetry } from './src/types/vpn';

export default function App() {
  // Preload icon fonts for web & native
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [telemetry, setTelemetry] = useState<VpnTelemetry>(vpnService.getTelemetry());
  const [packets, setPackets] = useState<PacketLogEntry[]>(vpnService.getPackets());
  const [logs, setLogs] = useState<DiagnosticLog[]>(vpnService.getLogs());

  useEffect(() => {
    const unsubTelemetry = vpnService.subscribeTelemetry((t) => setTelemetry(t));
    const unsubPackets = vpnService.subscribePackets(() => setPackets(vpnService.getPackets()));
    const unsubLogs = vpnService.subscribeLogs(() => setLogs(vpnService.getLogs()));

    return () => {
      unsubTelemetry();
      unsubPackets();
      unsubLogs();
    };
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  const handleToggleVpn = () => {
    if (telemetry.isConnected || telemetry.isConnecting) {
      vpnService.stopVpn();
    } else {
      vpnService.startVpn();
    }
  };

  const handleSelectGame = (game: GameProfile) => {
    vpnService.selectGame(game);
  };

  const handleSelectServer = (server: GamingServerNode) => {
    vpnService.selectServer(server);
  };

  const handleUpdateTuning = (options: {
    mtu?: number;
    splitTunnel?: boolean;
    wifiLock?: boolean;
    wakeLock?: boolean;
    fastDns?: string;
  }) => {
    vpnService.updateTuning(options);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <StatusBar style="light" backgroundColor="#090D16" />

        {/* Global Gaming Status Header */}
        <Header
          telemetry={telemetry}
          onOpenLogs={() => setActiveTab('logs')}
        />

        {/* Main Screen Body */}
        <View style={styles.screenContainer}>
          {activeTab === 'dashboard' && (
            <DashboardScreen
              telemetry={telemetry}
              onToggleVpn={handleToggleVpn}
              onSelectGame={handleSelectGame}
              onSelectServer={handleSelectServer}
              onUpdateTuning={handleUpdateTuning}
              onNavigateToConfig={() => setActiveTab('tuning')}
              onNavigateToRouting={() => setActiveTab('routing')}
            />
          )}

          {activeTab === 'tuning' && (
            <GameConfigScreen
              telemetry={telemetry}
              onSelectGame={handleSelectGame}
              onUpdateTuning={handleUpdateTuning}
              onStartVpn={(game) => vpnService.startVpn(game)}
              onStopVpn={() => vpnService.stopVpn()}
            />
          )}

          {activeTab === 'routing' && (
            <RoutingScreen
              telemetry={telemetry}
              packets={packets}
              onSelectServer={handleSelectServer}
            />
          )}

          {activeTab === 'notification' && (
            <NotificationScreen
              telemetry={telemetry}
              onDisconnect={() => vpnService.stopVpn()}
              onOptimizeRoute={() => vpnService.runPingBenchmark()}
            />
          )}

          {activeTab === 'code' && <SourceCodeScreen />}

          {activeTab === 'logs' && <LogsScreen logs={logs} />}
        </View>

        {/* Bottom Cyberpunk Navigation Bar */}
        <BottomNavBar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isConnected={telemetry.isConnected}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#070B14',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: '#070B14',
  },
});
