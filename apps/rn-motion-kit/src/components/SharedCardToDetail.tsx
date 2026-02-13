import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { motion } from '../motion/presets';

export function SharedCardToDetail({ title, onPress }: { title: string; onPress: () => void }) {
  const scale = useSharedValue(1);

  const rStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => (scale.value = withSpring(0.985, motion.spring))}
      onPressOut={() => (scale.value = withSpring(1, motion.spring))}
      onPress={onPress}
    >
      <Animated.View style={[styles.card, rStyle]}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.meta}>Continuity card → detail transition</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, backgroundColor: '#171b28', borderWidth: 1, borderColor: '#2a3248', padding: 16, marginBottom: 12 },
  title: { color: '#fff', fontWeight: '700', fontSize: 16 },
  meta: { color: '#97a0b8', marginTop: 6, fontSize: 12 },
});
