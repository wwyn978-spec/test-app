import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';

interface ReactorButtonProps {
  isConnected: boolean;
  isConnecting: boolean;
  latencyMs: number;
  gameTitle: string;
  onPress: () => void;
}

export const ReactorButton: React.FC<ReactorButtonProps> = ({
  isConnected,
  isConnecting,
  latencyMs,
  gameTitle,
  onPress,
}) => {
  const pulseScale = useSharedValue(1);
  const ringRotate = useSharedValue(0);
  const glowOpacity = useSharedValue(0.4);

  useEffect(() => {
    if (isConnected) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.06, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1000 }),
          withTiming(0.4, { duration: 1000 })
        ),
        -1,
        true
      );
    } else if (isConnecting) {
      pulseScale.value = withRepeat(
        withTiming(1.08, { duration: 600, easing: Easing.linear }),
        -1,
        true
      );
      glowOpacity.value = 0.9;
    } else {
      cancelAnimation(pulseScale);
      pulseScale.value = withTiming(1, { duration: 300 });
      cancelAnimation(glowOpacity);
      glowOpacity.value = withTiming(0.3, { duration: 300 });
    }
  }, [isConnected, isConnecting]);

  const animatedRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: glowOpacity.value,
  }));

  const outerColor = isConnected ? '#10B981' : isConnecting ? '#F59E0B' : '#00F0FF';
  const innerBg = isConnected ? '#062822' : isConnecting ? '#2B1E05' : '#0B132B';

  return (
    <View style={styles.wrapper}>
      {/* Outer Glow Halo */}
      <Animated.View
        style={[
          styles.glowRing,
          { borderColor: outerColor, shadowColor: outerColor },
          animatedRingStyle,
        ]}
      />

      {/* Secondary Pulse Ring */}
      <View
        style={[
          styles.middleRing,
          {
            borderColor: isConnected ? '#10B98133' : '#00F0FF22',
          },
        ]}
      />

      {/* Main Touch Target Reactor */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        disabled={isConnecting}
        style={[
          styles.coreButton,
          {
            backgroundColor: innerBg,
            borderColor: outerColor,
            shadowColor: outerColor,
          },
        ]}
      >
        {isConnecting ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#F59E0B" />
            <Text style={styles.connectingText}>CONNECTING...</Text>
            <Text style={styles.subtext}>Acquiring locks</Text>
          </View>
        ) : isConnected ? (
          <View style={styles.centerContent}>
            <View style={styles.pingRow}>
              <Text style={styles.pingValue}>{latencyMs}</Text>
              <Text style={styles.pingUnit}>ms</Text>
            </View>
            <View style={styles.boostedPill}>
              <Ionicons name="flash" size={11} color="#10B981" />
              <Text style={styles.boostedText}>FASTTRACK ACTIVE</Text>
            </View>
            <Text style={styles.tapToStop}>TAP TO DISCONNECT</Text>
          </View>
        ) : (
          <View style={styles.centerContent}>
            <View style={styles.powerIconCircle}>
              <Ionicons name="power" size={32} color="#00F0FF" />
            </View>
            <Text style={styles.idleTitle}>BOOST GAME</Text>
            <Text style={styles.idleSubtext}>Tap to Route TUN0</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 18,
    position: 'relative',
    height: 210,
  },
  glowRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 18,
  },
  middleRing: {
    position: 'absolute',
    width: 176,
    height: 176,
    borderRadius: 88,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  coreButton: {
    width: 154,
    height: 154,
    borderRadius: 77,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  powerIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#00F0FF15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  idleTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
  idleSubtext: {
    fontSize: 10,
    color: '#00F0FFAA',
    marginTop: 2,
    fontWeight: '600',
  },
  connectingText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F59E0B',
    marginTop: 8,
    letterSpacing: 1,
  },
  subtext: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  pingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  pingValue: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  pingUnit: {
    fontSize: 14,
    fontWeight: '800',
    color: '#10B981',
    marginLeft: 2,
  },
  boostedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B98122',
    borderWidth: 1,
    borderColor: '#10B98155',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
    marginTop: 4,
  },
  boostedText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.8,
  },
  tapToStop: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 6,
    fontWeight: '600',
  },
});
