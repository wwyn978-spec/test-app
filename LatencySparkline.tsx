import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface LatencySparklineProps {
  currentLatency: number;
  jitter: number;
  packetLoss: number;
  isConnected: boolean;
}

export const LatencySparkline: React.FC<LatencySparklineProps> = ({
  currentLatency,
  jitter,
  packetLoss,
  isConnected,
}) => {
  const [history, setHistory] = useState<number[]>([
    22, 23, 21, 24, 22, 21, 20, 22, 23, 22, 21, 22, 24, 23, 22, 21,
  ]);

  useEffect(() => {
    if (!isConnected) return;
    setHistory((prev) => {
      const next = [...prev.slice(1), currentLatency];
      return next;
    });
  }, [currentLatency, isConnected]);

  const maxVal = Math.max(...history, 50);
  const minVal = Math.min(...history);
  const avgVal = Math.round(history.reduce((a, b) => a + b, 0) / history.length);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Text style={styles.cardTitle}>LIVE JITTER &amp; PING OSCILLATION</Text>
          <Text style={styles.cardSubtitle}>RFC 3550 Real-Time Packet Arrival</Text>
        </View>
        <View style={styles.jitterBadge}>
          <Text style={styles.jitterLabel}>JITTER</Text>
          <Text style={styles.jitterValue}>±{jitter}ms</Text>
        </View>
      </View>

      {/* Sparkline Visualizer */}
      <View style={styles.graphContainer}>
        {history.map((val, idx) => {
          // Normalize height between 15% and 100%
          const barHeightPercent = Math.max(15, Math.min(100, (val / maxVal) * 100));
          const isLatest = idx === history.length - 1;
          const barColor = isConnected
            ? val < 25
              ? '#10B981'
              : val < 45
              ? '#00F0FF'
              : '#F59E0B'
            : '#334155';

          return (
            <View key={idx} style={styles.barColumn}>
              <View
                style={[
                  styles.barFill,
                  {
                    height: `${barHeightPercent}%`,
                    backgroundColor: barColor,
                    opacity: isLatest ? 1 : 0.65,
                  },
                ]}
              />
            </View>
          );
        })}
      </View>

      {/* Stats Summary Bar */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>MIN PING</Text>
          <Text style={styles.statValue}>{isConnected ? `${minVal} ms` : '--'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>AVG PING</Text>
          <Text style={[styles.statValue, { color: '#00F0FF' }]}>
            {isConnected ? `${avgVal} ms` : '--'}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>LOSS RATE</Text>
          <Text
            style={[
              styles.statValue,
              { color: packetLoss > 0 ? '#EF4444' : '#10B981' },
            ]}
          >
            {isConnected ? `${packetLoss.toFixed(1)}%` : '--'}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>STATUS</Text>
          <Text style={[styles.statValue, { color: '#10B981' }]}>
            {isConnected ? 'OPTIMAL' : 'OFFLINE'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0D1424',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
  cardSubtitle: {
    fontSize: 10,
    color: '#475569',
    marginTop: 2,
  },
  jitterBadge: {
    backgroundColor: '#00F0FF15',
    borderWidth: 1,
    borderColor: '#00F0FF44',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignItems: 'flex-end',
  },
  jitterLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  jitterValue: {
    fontSize: 12,
    fontWeight: '900',
    color: '#00F0FF',
    fontVariant: ['tabular-nums'],
  },
  graphContainer: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#172033',
    marginBottom: 10,
    gap: 3,
  },
  barColumn: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barFill: {
    width: '100%',
    minWidth: 4,
    borderRadius: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#E2E8F0',
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  divider: {
    width: 1,
    height: 18,
    backgroundColor: '#1E293B',
  },
});
