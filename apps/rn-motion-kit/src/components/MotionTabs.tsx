import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { motion } from '../motion/presets';

const TABS = ['Overview', 'Insights', 'Actions'];

export function MotionTabs() {
  const [active, setActive] = useState(0);
  const x = useSharedValue(0);

  const onPress = (index: number) => {
    setActive(index);
    x.value = withSpring(index, motion.springSoft);
  };

  const indicator = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value * 102 }],
  }));

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.indicator, indicator]} />
      {TABS.map((tab, idx) => (
        <Pressable key={tab} style={styles.tab} onPress={() => onPress(idx)}>
          <Text style={[styles.text, active === idx && styles.textActive]}>{tab}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 44, borderRadius: 12, backgroundColor: '#121623', borderWidth: 1, borderColor: '#252a38', marginBottom: 14, flexDirection: 'row', padding: 4 },
  tab: { width: 102, justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  text: { color: '#8e95a5', fontWeight: '600', fontSize: 12 },
  textActive: { color: '#f4f7ff' },
  indicator: { position: 'absolute', top: 4, left: 4, width: 102, height: 34, borderRadius: 9, backgroundColor: '#2a3248' },
});
