import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export function SuccessPulse() {
  const p = useSharedValue(0);

  useEffect(() => {
    p.value = withRepeat(withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.sin) }), -1, false);
  }, [p]);

  const ring = useAnimatedStyle(() => ({
    opacity: interpolate(p.value, [0, 1], [0.35, 0]),
    transform: [{ scale: interpolate(p.value, [0, 1], [1, 1.9]) }],
  }));

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.ring, ring]} />
      <View style={styles.dot}><Text style={styles.tick}>✓</Text></View>
      <Text style={styles.text}>Interaction quality active</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 14, alignItems: 'center' },
  ring: { position: 'absolute', width: 34, height: 34, borderRadius: 18, backgroundColor: '#3fe38c' },
  dot: { width: 34, height: 34, borderRadius: 18, backgroundColor: '#27c06c', justifyContent: 'center', alignItems: 'center' },
  tick: { color: '#0b2214', fontWeight: '900' },
  text: { color: '#8e95a5', marginTop: 8, fontSize: 12 },
});
