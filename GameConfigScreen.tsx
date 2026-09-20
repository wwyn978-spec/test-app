import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { GameProfile, GameProtocol, VpnTelemetry } from '../types/vpn';
import { GAME_PROFILES } from '../data/gameProfiles';

interface GameConfigScreenProps {
  telemetry: VpnTelemetry;
  onSelectGame: (game: GameProfile) => void;
  onUpdateTuning: (options: {
    mtu?: number;
    splitTunnel?: boolean;
    wifiLock?: boolean;
    wakeLock?: boolean;
    fastDns?: string;
  }) => void;
  onStartVpn: (game: GameProfile) => void;
  onStopVpn: () => void;
}

export const GameConfigScreen: React.FC<GameConfigScreenProps> = ({
  telemetry,
  onSelectGame,
  onUpdateTuning,
  onStartVpn,
  onStopVpn,
}) => {
  const [customTitle, setCustomTitle] = useState(telemetry.activeGame.gameTitle);
  const [customPackage, setCustomPackage] = useState(telemetry.activeGame.packageName);
  const [customPorts, setCustomPorts] = useState(telemetry.activeGame.ports.join(', '));
  const [selectedMtu, setSelectedMtu] = useState<number>(telemetry.mtu);
  const [selectedDscp, setSelectedDscp] = useState<number>(telemetry.dscpTag);
  const [selectedProtocol, setSelectedProtocol] = useState<GameProtocol>(
    telemetry.activeGame.protocol
  );
  const [selectedDns, setSelectedDns] = useState<string>(telemetry.fastDns);
  const [splitTunnel, setSplitTunnel] = useState<boolean>(telemetry.splitTunnelActive);
  const [wifiLock, setWifiLock] = useState<boolean>(telemetry.wifiLockActive);
  const [wakeLock, setWakeLock] = useState<boolean>(telemetry.wakeLockActive);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const MTU_PRESETS = [1280, 1350, 1380, 1400, 1420, 1500];
  const DSCP_PRESETS = [
    { label: 'Expedited Forwarding (EF - 0x2E)', value: 0x2e, desc: 'Recommended: Highest network priority' },
    { label: 'CS5 Class (0x28)', value: 0x28, desc: 'Interactive Gaming Priority' },
    { label: 'Best Effort (0x00)', value: 0x00, desc: 'Default Android Routing' },
  ];
  const DNS_PRESETS = [
    { label: '1.1.1.1 (Cloudflare Gaming Fast)', value: '1.1.1.1 (Cloudflare Gaming)' },
    { label: '8.8.8.8 (Google Low-Jitter DNS)', value: '8.8.8.8 (Google Gaming)' },
    { label: '9.9.9.9 (Quad9 Anti-Poisoning)', value: '9.9.9.9 (Quad9 Gaming)' },
  ];

  const handleApplyPreset = (profile: GameProfile) => {
    setCustomTitle(profile.gameTitle);
    setCustomPackage(profile.packageName);
    setCustomPorts(profile.ports.join(', '));
    setSelectedMtu(profile.recommendedMtu);
    setSelectedDscp(profile.dscpTag);
    setSelectedProtocol(profile.protocol);
    onSelectGame(profile);
    onUpdateTuning({ mtu: profile.recommendedMtu });
    showSaveBanner();
  };

  const handleSaveCustomProfile = () => {
    const parsedPorts = customPorts
      .split(',')
      .map((p) => parseInt(p.trim(), 10))
      .filter((n) => !isNaN(n));

    const updatedProfile: GameProfile = {
      ...telemetry.activeGame,
      gameTitle: customTitle || 'Custom Gaming App',
      packageName: customPackage || 'com.example.game',
      ports: parsedPorts.length > 0 ? parsedPorts : [7000, 8000],
      recommendedMtu: selectedMtu,
      dscpTag: selectedDscp,
      protocol: selectedProtocol,
    };

    onSelectGame(updatedProfile);
    onUpdateTuning({
      mtu: selectedMtu,
      splitTunnel,
      wifiLock,
      wakeLock,
      fastDns: selectedDns,
    });
    showSaveBanner();
  };

  const showSaveBanner = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Title & Architecture Note */}
      <View style={styles.headerBox}>
        <View style={styles.headerTagRow}>
          <Ionicons name="options" size={16} color="#00F0FF" />
          <Text style={styles.headerTag}>TARGET GAMING APP CONFIGURATION</Text>
        </View>
        <Text style={styles.headerTitle}>RealGameVpnService Tuning Studio</Text>
        <Text style={styles.headerDesc}>
          Applies package isolation, MTU anti-fragmentation, and DSCP QoS tagging to the
          active VPN service tunnel.
        </Text>
      </View>

      {/* Save Success Banner */}
      {savedSuccess && (
        <View style={styles.successBanner}>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          <Text style={styles.successText}>
            Optimization parameters applied to RealGameVpnService!
          </Text>
        </View>
      )}

      {/* Target Game Selector Carousel */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SELECT TARGET GAMING PROFILE</Text>
        <Text style={styles.sectionSubtitle}>
          Pre-tuned for competitive esports mobile titles
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.profilesScroll}
        >
          {GAME_PROFILES.map((profile) => {
            const isSelected = profile.id === telemetry.activeGame.id;
            return (
              <TouchableOpacity
                key={profile.id}
                activeOpacity={0.8}
                onPress={() => handleApplyPreset(profile)}
                style={[styles.profileCard, isSelected && styles.profileCardActive]}
              >
                <View style={styles.profileIconCircle}>
                  <Ionicons name={profile.icon as any} size={18} color="#00F0FF" />
                </View>
                <Text style={styles.profileCardTitle} numberOfLines={1}>
                  {profile.gameTitle}
                </Text>
                <Text style={styles.profileGenre}>{profile.genre}</Text>
                <View style={styles.profileMtuBadge}>
                  <Text style={styles.profileMtuText}>MTU {profile.recommendedMtu}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Target Game Fields */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>TARGET APPLICATION METADATA</Text>
        <Text style={styles.sectionSubtitle}>
          Mapped to Android Intent extras (EXTRA_GAME_TITLE &amp; EXTRA_GAME_PACKAGE)
        </Text>

        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>GAME TITLE</Text>
            <TextInput
              style={styles.textInput}
              value={customTitle}
              onChangeText={setCustomTitle}
              placeholder="e.g. Call of Duty: Mobile"
              placeholderTextColor="#475569"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>ANDROID PACKAGE NAME (FOR SPLIT TUNNELING)</Text>
            <TextInput
              style={[styles.textInput, { fontFamily: 'monospace' }]}
              value={customPackage}
              onChangeText={setCustomPackage}
              placeholder="e.g. com.activision.callofduty.shooter"
              placeholderTextColor="#475569"
              autoCapitalize="none"
            />
            <Text style={styles.inputHelper}>
              RealGameVpnService uses Builder.addAllowedApplication(pkg) to isolate only this
              package.
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>ACCELERATED UDP GAME PORTS</Text>
            <TextInput
              style={[styles.textInput, { fontFamily: 'monospace' }]}
              value={customPorts}
              onChangeText={setCustomPorts}
              placeholder="e.g. 7500, 7501, 8000, 10000"
              placeholderTextColor="#475569"
            />
          </View>
        </View>
      </View>

      {/* MTU Size Tuning Selector */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>VIRTUAL TUN INTERFACE MTU SIZE</Text>
          <View style={styles.mtuHighlightBadge}>
            <Text style={styles.mtuHighlightText}>{selectedMtu} BYTES</Text>
          </View>
        </View>
        <Text style={styles.sectionSubtitle}>
          Default 1380 bytes avoids double IP fragmentation on 4G LTE/5G carrier towers
        </Text>

        <View style={styles.mtuGrid}>
          {MTU_PRESETS.map((mtu) => {
            const isSelected = selectedMtu === mtu;
            const isRecommended = mtu === 1380;
            return (
              <TouchableOpacity
                key={mtu}
                activeOpacity={0.8}
                onPress={() => setSelectedMtu(mtu)}
                style={[styles.mtuButton, isSelected && styles.mtuButtonActive]}
              >
                <Text style={[styles.mtuBtnText, isSelected && styles.mtuBtnTextActive]}>
                  {mtu}
                </Text>
                {isRecommended && (
                  <Text style={styles.mtuRecommendedLabel}>OPTIMAL</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.explanationBox}>
          <Ionicons name="information-circle-outline" size={16} color="#00F0FF" />
          <Text style={styles.explanationText}>
            Standard 1500-byte packets get fragmented by mobile carrier VPN encapsulation,
            causing sudden 120ms ping spikes. Sizing MTU to 1360–1380 bytes ensures UDP packets
            travel in one un-fragmented packet.
          </Text>
        </View>
      </View>

      {/* DSCP Quality of Service (QoS) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>IP QUALITY OF SERVICE (DSCP TAG)</Text>
        <Text style={styles.sectionSubtitle}>
          Sets socket.trafficClass on protected UDP forwarding socket
        </Text>

        <View style={styles.dscpList}>
          {DSCP_PRESETS.map((item) => {
            const isSelected = selectedDscp === item.value;
            return (
              <TouchableOpacity
                key={item.value}
                activeOpacity={0.8}
                onPress={() => setSelectedDscp(item.value)}
                style={[styles.dscpCard, isSelected && styles.dscpCardActive]}
              >
                <View style={styles.dscpRadio}>
                  {isSelected && <View style={styles.dscpRadioInner} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.dscpTitle, isSelected && styles.dscpTitleActive]}>
                    {item.label}
                  </Text>
                  <Text style={styles.dscpDesc}>{item.desc}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Gaming DNS Provider */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>GAMING FAST-PATH DNS</Text>
        <Text style={styles.sectionSubtitle}>
          Applied via VpnService.Builder.addDnsServer()
        </Text>

        <View style={styles.dscpList}>
          {DNS_PRESETS.map((dns) => {
            const isSelected = selectedDns === dns.value;
            return (
              <TouchableOpacity
                key={dns.value}
                activeOpacity={0.8}
                onPress={() => setSelectedDns(dns.value)}
                style={[styles.dscpCard, isSelected && styles.dscpCardActive]}
              >
                <View style={styles.dscpRadio}>
                  {isSelected && <View style={styles.dscpRadioInner} />}
                </View>
                <Text style={[styles.dscpTitle, isSelected && styles.dscpTitleActive]}>
                  {dns.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Save Button */}
      <View style={styles.actionsFooter}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleSaveCustomProfile}
          style={styles.saveButton}
        >
          <Ionicons name="save-outline" size={18} color="#070B14" />
          <Text style={styles.saveButtonText}>SAVE &amp; APPLY CONFIGURATION</Text>
        </TouchableOpacity>

        {telemetry.isConnected ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onStopVpn}
            style={styles.stopButton}
          >
            <Ionicons name="power" size={16} color="#EF4444" />
            <Text style={styles.stopButtonText}>STOP REALGAME VPN</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              handleSaveCustomProfile();
              onStartVpn(telemetry.activeGame);
            }}
            style={styles.startButton}
          >
            <Ionicons name="flash" size={16} color="#00F0FF" />
            <Text style={styles.startButtonText}>LAUNCH VPN TUNNEL WITH CONFIG</Text>
          </TouchableOpacity>
        )}
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
  headerTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  headerTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00F0FF',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  headerDesc: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    lineHeight: 16,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#052E2B',
    borderWidth: 1,
    borderColor: '#10B981',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    gap: 8,
  },
  successText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
  section: {
    marginTop: 18,
    paddingHorizontal: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  profilesScroll: {
    gap: 10,
    paddingVertical: 4,
  },
  profileCard: {
    width: 140,
    backgroundColor: '#0D1526',
    borderWidth: 1,
    borderColor: '#1C2943',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  profileCardActive: {
    borderColor: '#00F0FF',
    backgroundColor: '#00F0FF12',
  },
  profileIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#12203B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  profileCardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  profileGenre: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  profileMtuBadge: {
    backgroundColor: '#16233B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 8,
  },
  profileMtuText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#00F0FF',
  },
  formCard: {
    backgroundColor: '#0D1526',
    borderWidth: 1,
    borderColor: '#1C2943',
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  textInput: {
    backgroundColor: '#080D18',
    borderWidth: 1,
    borderColor: '#223252',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 12,
  },
  inputHelper: {
    fontSize: 9,
    color: '#475569',
    marginTop: 2,
  },
  mtuHighlightBadge: {
    backgroundColor: '#00F0FF22',
    borderWidth: 1,
    borderColor: '#00F0FF66',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mtuHighlightText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#00F0FF',
  },
  mtuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mtuButton: {
    flex: 1,
    minWidth: 90,
    backgroundColor: '#0D1526',
    borderWidth: 1,
    borderColor: '#1C2943',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  mtuButtonActive: {
    backgroundColor: '#00F0FF15',
    borderColor: '#00F0FF',
  },
  mtuBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#94A3B8',
  },
  mtuBtnTextActive: {
    color: '#00F0FF',
  },
  mtuRecommendedLabel: {
    fontSize: 7,
    fontWeight: '900',
    color: '#10B981',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  explanationBox: {
    flexDirection: 'row',
    backgroundColor: '#0A1222',
    borderWidth: 1,
    borderColor: '#17253D',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    gap: 8,
  },
  explanationText: {
    flex: 1,
    fontSize: 10,
    color: '#94A3B8',
    lineHeight: 14,
  },
  dscpList: {
    gap: 8,
  },
  dscpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1526',
    borderWidth: 1,
    borderColor: '#1C2943',
    borderRadius: 10,
    padding: 12,
    gap: 12,
  },
  dscpCardActive: {
    borderColor: '#00F0FF',
    backgroundColor: '#00F0FF10',
  },
  dscpRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#3B4E73',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dscpRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00F0FF',
  },
  dscpTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#E2E8F0',
  },
  dscpTitleActive: {
    color: '#00F0FF',
  },
  dscpDesc: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  actionsFooter: {
    paddingHorizontal: 16,
    marginTop: 24,
    gap: 10,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00F0FF',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  saveButtonText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#070B14',
    letterSpacing: 0.8,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00F0FF15',
    borderWidth: 1,
    borderColor: '#00F0FF55',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  startButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00F0FF',
    letterSpacing: 0.8,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7F1D1D20',
    borderWidth: 1,
    borderColor: '#EF444455',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  stopButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EF4444',
    letterSpacing: 0.8,
  },
});
