import React, { useEffect } from 'react';
import { Pressable, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { motion } from '../motion/presets';

type MotionCardProps = {
  index?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  onPress?: () => void;
};

export function MotionCard({ index = 0, style, children, onPress }: MotionCardProps) {
  const appear = useSharedValue(0);
  const pressed = useSharedValue(0);

  useEffect(() => {
    const delay = index * 45;
    appear.value = withTiming(1, { duration: motion.duration.base + delay });
  }, [appear, index]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(appear.value, [0, 1], [motion.easing.cardEnterY, 0]);
    const opacity = appear.value;
    const scale = interpolate(pressed.value, [0, 1], [1, motion.easing.pressScale]);

    return {
      opacity,
      transform: [{ translateY }, { scale }],
    };
  });

  return (
    <Pressable
      onPressIn={() => {
        pressed.value = withSpring(1, motion.spring);
      }}
      onPressOut={() => {
        pressed.value = withSpring(0, motion.spring);
      }}
      onPress={async () => {
        await Haptics.selectionAsync();
        onPress?.();
      }}
    >
      <Animated.View style={[styles.card, style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#14161b',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#23262f',
  },
});
