import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DiagnosticLog } from '../types/vpn';
import { copyToClipboard } from '../utils/clipboard';

interface LogsScreenProps {
  logs: DiagnosticLog[];
  onClearLogs?: () => void;
}

export const LogsScreen: React.FC<LogsScreenProps> = ({ logs, onClearLogs }) => {
  const [levelFilter, setLevelFilter] = useState<'ALL' | 'INFO' | 'DEBUG' | 'WARN'>('ALL');
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);

  const filteredLogs = logs.filter((log) => {
    if (levelFilter !== 'ALL' && log.level !== levelFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        log.message.toLowerCase().includes(q) ||
        log.tag.toLowerCase().includes(q) ||
        log.timestamp.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCopyLogs = async () => {
    const text = filteredLogs
      .map((l) => `${l.timestamp} [${l.level}] ${l.tag}: ${l.message}`)
      .join('\n');
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerBox}>
        <View style={styles.tagRow}>
          <Ionicons name="terminal" size={16} color="#00F0FF" />
          <Text style={styles.tagText}>REAL-TIME LOGCAT DIAGNOSTIC CONSOLE</Text>
        </View>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Tunnel Event Telemetry</Text>
          <View style={styles.actionsGroup}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleCopyLogs}
              style={[styles.smallBtn, copied && styles.smallBtnDone]}
            >
              <Ionicons
                name={copied ? 'checkmark' : 'copy-outline'}
                size={12}
                color={copied ? '#10B981' : '#CBD5E1'}
              />
              <Text style={[styles.smallBtnText, copied && { color: '#10B981' }]}>
                {copied ? 'COPIED' : 'COPY'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Filter and Search Bar */}
      <View style={styles.controlsBar}>
        <View style={styles.filterGroup}>
          {(['ALL', 'INFO', 'DEBUG', 'WARN'] as const).map((lvl) => (
            <TouchableOpacity
              key={lvl}
              onPress={() => setLevelFilter(lvl)}
              style={[
                styles.filterBtn,
                levelFilter === lvl && styles.filterBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.filterBtnText,
                  levelFilter === lvl && styles.filterBtnTextActive,
                ]}
              >
                {lvl}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={13} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Filter logs..."
            placeholderTextColor="#475569"
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Logs Scrolling List */}
      <ScrollView
        style={styles.logsList}
        contentContainerStyle={styles.logsContent}
      >
        {filteredLogs.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No logs match current filter</Text>
          </View>
        ) : (
          filteredLogs.map((log) => {
            const isInfo = log.level === 'INFO';
            const isWarn = log.level === 'WARN';
            const isError = log.level === 'ERROR';

            const levelColor = isError
              ? '#EF4444'
              : isWarn
              ? '#F59E0B'
              : isInfo
              ? '#10B981'
              : '#00F0FF';

            return (
              <View key={log.id} style={styles.logRow}>
                <View style={styles.logMeta}>
                  <Text style={styles.logTime}>{log.timestamp}</Text>
                  <View
                    style={[
                      styles.logLevelBadge,
                      { borderColor: `${levelColor}44`, backgroundColor: `${levelColor}15` },
                    ]}
                  >
                    <Text style={[styles.logLevelText, { color: levelColor }]}>
                      {log.level}
                    </Text>
                  </View>
                  <Text style={styles.logTag}>{log.tag}:</Text>
                </View>
                <Text style={styles.logMessage}>{log.message}</Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070B14',
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
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  actionsGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  smallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151F33',
    borderWidth: 1,
    borderColor: '#223252',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  smallBtnDone: {
    borderColor: '#10B981',
    backgroundColor: '#10B98120',
  },
  smallBtnText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#CBD5E1',
    letterSpacing: 0.5,
  },
  controlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#090E1A',
    borderBottomWidth: 1,
    borderBottomColor: '#141D30',
    gap: 10,
  },
  filterGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  filterBtn: {
    backgroundColor: '#101726',
    borderWidth: 1,
    borderColor: '#1D2A42',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 5,
  },
  filterBtnActive: {
    backgroundColor: '#00F0FF15',
    borderColor: '#00F0FF',
  },
  filterBtnText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
  },
  filterBtnTextActive: {
    color: '#00F0FF',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D1424',
    borderWidth: 1,
    borderColor: '#1A253D',
    borderRadius: 6,
    paddingHorizontal: 8,
    height: 28,
    gap: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 10,
    color: '#FFFFFF',
    fontFamily: 'monospace',
  },
  logsList: {
    flex: 1,
    backgroundColor: '#060911',
  },
  logsContent: {
    padding: 12,
  },
  emptyBox: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 11,
    color: '#475569',
  },
  logRow: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#0E1626',
  },
  logMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  logTime: {
    fontSize: 9,
    color: '#475569',
    fontFamily: 'monospace',
  },
  logLevelBadge: {
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  logLevelText: {
    fontSize: 8,
    fontWeight: '900',
  },
  logTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  logMessage: {
    fontSize: 11,
    color: '#E2E8F0',
    fontFamily: 'monospace',
    lineHeight: 15,
  },
});
