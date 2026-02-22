import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MotionBottomSheet } from '../components/MotionBottomSheet';
import { SuccessPulse } from '../components/SuccessPulse';

type RootStackParamList = {
  Home: undefined;
  Detail: { title: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

export default function DetailScreen({ route }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{route.params.title}</Text>
      <Text style={styles.subtitle}>Clean cinematic transitions + spring touch feedback</Text>

      <Pressable style={styles.button} onPress={() => setOpen(true)}>
        <Text style={styles.buttonText}>Open Motion Sheet</Text>
      </Pressable>

      <SuccessPulse />

      <MotionBottomSheet visible={open} onClose={() => setOpen(false)}>
        <Text style={styles.sheetTitle}>Bottom Sheet</Text>
        <Text style={styles.sheetText}>Backdrop fade + spring slide-up. 21st-style motion feel.</Text>
        <Pressable style={[styles.button, { marginTop: 16 }]} onPress={() => setOpen(false)}>
          <Text style={styles.buttonText}>Close</Text>
        </Pressable>
      </MotionBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0d12',
    paddingHorizontal: 18,
    paddingTop: 70,
  },
  title: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '700',
  },
  subtitle: {
    color: '#8e95a5',
    marginTop: 8,
  },
  button: {
    marginTop: 22,
    backgroundColor: '#2f6df6',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  sheetTitle: {
    color: '#fff',
    fontSize: 21,
    fontWeight: '700',
  },
  sheetText: {
    color: '#98a0b2',
    marginTop: 8,
  },
});
