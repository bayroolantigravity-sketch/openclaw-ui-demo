import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { motion } from '../motion/presets';

export function MotionHero() {
  const p = useSharedValue(0);
  const glow = useSharedValue(0);

  useEffect(() => {
    p.value = withTiming(1, { duration: 620, easing: Easing.out(Easing.exp) });
    glow.value = withDelay(
      200,
      withRepeat(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.quad) }), -1, true)
    );
  }, [glow, p]);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ translateY: interpolate(p.value, [0, 1], [22, 0]) }, { scale: interpolate(p.value, [0, 1], [0.94, 1]) }],
  }));

  const ctaStyle = useAnimatedStyle(() => ({
    opacity: interpolate(p.value, [0.35, 1], [0, 1]),
    transform: [{ translateY: interpolate(p.value, [0.35, 1], [16, 0]) }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(glow.value, [0, 1], [0.2, 0.45]),
    transform: [
      { translateX: interpolate(glow.value, [0, 1], [-8, 10]) },
      { scale: interpolate(glow.value, [0, 1], [1, 1.08]) },
    ],
  }));

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.glow, glowStyle]} />
      <Animated.Text style={[styles.title, titleStyle]}>21st Motion Pack</Animated.Text>
      <Animated.Text style={[styles.sub, titleStyle]}>Expo 52 • Reanimated • Cinematic interaction system</Animated.Text>
      <Animated.View style={[styles.chip, ctaStyle]}>
        <Text style={styles.chipText}>Depth • Flow • Impact</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 20, position: 'relative', overflow: 'hidden', borderRadius: 20, padding: 14, backgroundColor: '#0f1320', borderWidth: 1, borderColor: '#252e47' },
  glow: { position: 'absolute', width: 240, height: 120, right: -30, top: -10, borderRadius: 120, backgroundColor: '#4a68ff' },
  title: { color: '#fff', fontSize: 34, fontWeight: '900', letterSpacing: 0.2 },
  sub: { color: '#a1abc2', marginTop: 8, fontSize: 13 },
  chip: { marginTop: 14, alignSelf: 'flex-start', backgroundColor: '#1b2232', borderWidth: 1, borderColor: '#3a4770', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  chipText: { color: '#c8d1ff', fontWeight: '700', fontSize: 12 },
});
