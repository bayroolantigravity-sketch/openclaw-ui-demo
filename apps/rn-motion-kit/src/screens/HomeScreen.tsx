import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MotionCard } from '../components/MotionCard';

type RootStackParamList = {
  Home: undefined;
  Detail: { title: string };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const items = ['Signal IQ', 'Wallet Watch', 'Whale Radar', 'Risk Board'];

export default function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>21st-style Motion</Text>
      <Text style={styles.subtitle}>Expo 52 + Reanimated</Text>

      <View style={{ marginTop: 18 }}>
        {items.map((item, index) => (
          <MotionCard
            key={item}
            index={index}
            onPress={() => navigation.push('Detail', { title: item })}
          >
            <Text style={styles.cardTitle}>{item}</Text>
            <Text style={styles.cardMeta}>Tap to open detail</Text>
          </MotionCard>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0d12',
    paddingHorizontal: 18,
    paddingTop: 64,
  },
  title: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '700',
  },
  subtitle: {
    color: '#8e95a5',
    marginTop: 6,
    fontSize: 14,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  cardMeta: {
    color: '#8e95a5',
    marginTop: 6,
  },
});
