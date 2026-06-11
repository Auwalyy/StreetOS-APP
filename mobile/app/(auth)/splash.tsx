import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

export default function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start(() => {
      setTimeout(() => router.replace('/(auth)/onboarding'), 1500);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoWrap, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>S</Text>
        </View>
        <Text style={styles.appName}>StreetOS</Text>
        <Text style={styles.tagline}>The AI OS for Africa's Informal Economy</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary[500], alignItems: 'center', justifyContent: 'center' },
  logoWrap: { alignItems: 'center', gap: 16 },
  logoBox: {
    width: 88, height: 88, borderRadius: 24,
    backgroundColor: Colors.accent[500], alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontSize: 48, fontWeight: '800', color: Colors.white },
  appName: {
    fontSize: Typography.fontSize['4xl'], fontWeight: Typography.fontWeight.extrabold,
    color: Colors.white, letterSpacing: 1,
  },
  tagline: { fontSize: Typography.fontSize.sm, color: Colors.primary[200], textAlign: 'center', paddingHorizontal: 32 },
});
