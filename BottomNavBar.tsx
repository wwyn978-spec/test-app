import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export type TabKey = 'dashboard' | 'tuning' | 'routing' | 'notification' | 'code' | 'logs';

interface BottomNavBarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  isConnected: boolean;
}

interface NavItem {
  key: TabKey;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Booster', icon: 'flash' },
  { key: 'tuning', label: 'Game Config', icon: 'game-controller' },
  { key: 'routing', label: 'Routing', icon: 'git-network' },
  { key: 'notification', label: 'Android HUD', icon: 'notifications' },
  { key: 'code', label: 'Manifest & KT', icon: 'code-slash' },
  { key: 'logs', label: 'Logcat', icon: 'terminal' },
];

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  isConnected,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.navRow}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.7}
              onPress={() => onSelectTab(item.key)}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={item.icon}
                  size={19}
                  color={isActive ? '#00F0FF' : '#526075'}
                />
                {item.key === 'dashboard' && isConnected && (
                  <View style={styles.activeDot} />
                )}
              </View>
              <Text
                style={[styles.tabLabel, isActive && styles.tabLabelActive]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#070A12',
    borderTopWidth: 1,
    borderTopColor: '#172033',
    paddingBottom: 8,
    paddingTop: 6,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 8,
    minWidth: 54,
  },
  tabButtonActive: {
    backgroundColor: '#00F0FF10',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 2,
  },
  activeDot: {
    position: 'absolute',
    top: -2,
    right: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#00F0FF',
    fontWeight: '800',
  },
});
