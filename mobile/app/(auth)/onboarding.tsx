import { useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    emoji: '🎤',
    title: 'Speak Your Sales',
    subtitle: 'Just say "I sold 3 bags of rice for 45,000 naira" — StreetOS records everything automatically.',
  },
  {
    id: '2',
    emoji: '📊',
    title: 'Know Your Business',
    subtitle: 'Get your Business Health Score, track debts, manage inventory — all in one place.',
  },
  {
    id: '3',
    emoji: '💳',
    title: 'Access Capital',
    subtitle: 'Build your digital financial identity and become eligible for loans and insurance.',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      router.replace('/(auth)/register');
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, i === currentIndex && styles.dotActive]} />
          ))}
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleNext}>
          <Text style={styles.btnText}>{currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}</Text>
        </TouchableOpacity>

        {currentIndex < slides.length - 1 && (
          <TouchableOpacity onPress={() => router.replace('/(auth)/register')}>
            <Text style={styles.skip}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  slide: {
    width, flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32, gap: 20,
  },
  emoji: { fontSize: 80 },
  title: {
    fontSize: Typography.fontSize['3xl'], fontWeight: Typography.fontWeight.extrabold,
    color: Colors.primary[500], textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.fontSize.md, color: Colors.gray[500],
    textAlign: 'center', lineHeight: Typography.lineHeight.md,
  },
  footer: { paddingHorizontal: 32, paddingBottom: 48, gap: 16, alignItems: 'center' },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.gray[200] },
  dotActive: { width: 24, backgroundColor: Colors.primary[500] },
  btn: {
    backgroundColor: Colors.primary[500], borderRadius: 16,
    paddingVertical: 16, width: '100%', alignItems: 'center',
  },
  btnText: { color: Colors.white, fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold },
  skip: { color: Colors.gray[400], fontSize: Typography.fontSize.base },
});
