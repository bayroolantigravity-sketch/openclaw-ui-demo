import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { motion } from '../motion/presets';

export function MotionHero() {
  const p = useSharedValue(0);

  useEffect(() => {
    p.value = withTiming(1, { duration: motion.duration.slow, easing: Easing.out(Easing.cubic) });
  }, [p]);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ translateY: interpolate(p.value, [0, 1], [14, 0]) }, { scale: interpolate(p.value, [0, 1], [0.96, 1]) }],
  }));

  const ctaStyle = useAnimatedStyle(() => ({
    opacity: interpolate(p.value, [0.2, 1], [0, 1]),
    transform: [{ translateY: interpolate(p.value, [0.2, 1], [12, 0]) }],
  }));

  return (
    <View style={styles.wrap}>
      <Animated.Text style={[styles.title, titleStyle]}>21st Motion Pack</Animated.Text>
      <Animated.Text style={[styles.sub, titleStyle]}>Expo 52 • Reanimated • Premium micro-interactions</Animated.Text>
      <Animated.View style={[styles.chip, ctaStyle]}>
        <Text style={styles.chipText}>Smooth by default</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 18 },
  title: { color: '#fff', fontSize: 32, fontWeight: '800' },
  sub: { color: '#8e95a5', marginTop: 8, fontSize: 13 },
  chip: { marginTop: 14, alignSelf: 'flex-start', backgroundColor: '#1b2232', borderWidth: 1, borderColor: '#2a344b', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7 },
  chipText: { color: '#b8c3ff', fontWeight: '600', fontSize: 12 },
});
