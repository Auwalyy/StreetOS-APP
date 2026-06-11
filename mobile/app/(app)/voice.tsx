import { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { useVoice } from '../../hooks/useVoice';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { formatNaira } from '../../utils/currency';

function WaveformBars({ isRecording }: { isRecording: boolean }) {
  const bars = Array.from({ length: 7 }, (_, i) => useRef(new Animated.Value(0.3)).current);

  useEffect(() => {
    if (!isRecording) {
      bars.forEach((b) => Animated.timing(b, { toValue: 0.3, duration: 200, useNativeDriver: true }).start());
      return;
    }
    const animations = bars.map((bar, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 80),
          Animated.timing(bar, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(bar, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ])
      )
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, [isRecording]);

  return (
    <View style={styles.waveform}>
      {bars.map((bar, i) => (
        <Animated.View
          key={i}
          style={[styles.bar, { transform: [{ scaleY: bar }] }]}
        />
      ))}
    </View>
  );
}

export default function VoiceScreen() {
  const { state, transcript, result, error, startRecording, stopRecording, reset } = useVoice();
  const qc = useQueryClient();

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (state === 'recording') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [state]);

  const handleDone = () => {
    qc.invalidateQueries({ queryKey: ['transactions'] });
    qc.invalidateQueries({ queryKey: ['summary'] });
    reset();
    router.back();
  };

  const tx = (result as any)?.transaction;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { reset(); router.back(); }}>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Voice Transaction</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* State: idle or recording */}
        {(state === 'idle' || state === 'recording') && (
          <>
            <Text style={styles.instruction}>
              {state === 'idle'
                ? 'Tap the mic and speak your transaction'
                : 'Listening... speak clearly'}
            </Text>
            <Text style={styles.example}>
              {'"I sold 3 bags of rice for 45,000 naira"'}
            </Text>

            <WaveformBars isRecording={state === 'recording'} />

            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={[styles.micBtn, state === 'recording' && styles.micBtnActive]}
                onPress={state === 'idle' ? startRecording : stopRecording}
                activeOpacity={0.8}
              >
                <Text style={styles.micEmoji}>🎤</Text>
              </TouchableOpacity>
            </Animated.View>

            <Text style={styles.micHint}>
              {state === 'idle' ? 'Tap to start' : 'Tap to stop'}
            </Text>

            <View style={styles.langRow}>
              {['English', 'Hausa', 'Yoruba', 'Igbo', 'Pidgin'].map((l) => (
                <View key={l} style={styles.langChip}>
                  <Text style={styles.langText}>{l}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* State: processing */}
        {state === 'processing' && (
          <View style={styles.processingWrap}>
            <ActivityIndicator size="large" color={Colors.primary[500]} />
            <Text style={styles.processingText}>Processing your voice...</Text>
            <Text style={styles.processingSubText}>Transcribing and extracting transaction details</Text>
          </View>
        )}

        {/* State: success */}
        {state === 'success' && tx && (
          <View style={styles.resultWrap}>
            <Text style={styles.successEmoji}>✅</Text>
            <Text style={styles.successTitle}>Transaction Recorded!</Text>

            {transcript ? (
              <View style={styles.transcriptBox}>
                <Text style={styles.transcriptLabel}>You said:</Text>
                <Text style={styles.transcriptText}>"{transcript}"</Text>
              </View>
            ) : null}

            <View style={styles.resultCard}>
              {[
                { label: 'Type', value: tx.type?.toUpperCase() },
                { label: 'Product', value: tx.productName },
                { label: 'Quantity', value: tx.quantity ? String(tx.quantity) : null },
                { label: 'Amount', value: tx.amount ? formatNaira(tx.amount) : null },
                { label: 'Customer', value: tx.customerName },
                { label: 'Payment', value: tx.paymentMethod },
              ]
                .filter((r) => r.value)
                .map((row) => (
                  <View key={row.label} style={styles.resultRow}>
                    <Text style={styles.resultLabel}>{row.label}</Text>
                    <Text style={styles.resultValue}>{row.value}</Text>
                  </View>
                ))}
            </View>

            {(result as any)?.confidence && (
              <Text style={styles.confidence}>
                AI Confidence: {Math.round((result as any).confidence * 100)}%
              </Text>
            )}

            <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={reset} style={styles.recordAgain}>
              <Text style={styles.recordAgainText}>Record Another</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* State: success (offline) */}
        {state === 'success' && !tx && transcript && (
          <View style={styles.resultWrap}>
            <Text style={styles.successEmoji}>📶</Text>
            <Text style={styles.successTitle}>Saved Offline</Text>
            <Text style={styles.processingSubText}>{transcript}</Text>
            <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* State: error */}
        {state === 'error' && (
          <View style={styles.resultWrap}>
            <Text style={styles.successEmoji}>❌</Text>
            <Text style={styles.successTitle}>Something went wrong</Text>
            <Text style={styles.processingSubText}>{error}</Text>
            <TouchableOpacity style={styles.doneBtn} onPress={reset}>
              <Text style={styles.doneBtnText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary[500] },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
  },
  closeBtn: { fontSize: 20, color: Colors.white, width: 32 },
  headerTitle: { fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.bold, color: Colors.white },
  content: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 24, paddingBottom: 48, gap: 20 },
  instruction: {
    fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.bold,
    color: Colors.white, textAlign: 'center', marginTop: 20,
  },
  example: {
    fontSize: Typography.fontSize.base, color: Colors.primary[200],
    textAlign: 'center', fontStyle: 'italic', paddingHorizontal: 16,
  },
  waveform: { flexDirection: 'row', alignItems: 'center', height: 60, gap: 6, marginVertical: 8 },
  bar: { width: 6, height: 40, borderRadius: 3, backgroundColor: Colors.accent[400] },
  micBtn: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.accent[500], alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.accent[500], shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5, shadowRadius: 16, elevation: 12,
  },
  micBtnActive: { backgroundColor: Colors.error },
  micEmoji: { fontSize: 44 },
  micHint: { fontSize: Typography.fontSize.base, color: Colors.primary[200], fontWeight: Typography.fontWeight.medium },
  langRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  langChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)' },
  langText: { fontSize: Typography.fontSize.xs, color: Colors.white, fontWeight: Typography.fontWeight.medium },
  processingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 60 },
  processingText: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.bold, color: Colors.white },
  processingSubText: { fontSize: Typography.fontSize.base, color: Colors.primary[200], textAlign: 'center' },
  resultWrap: { width: '100%', alignItems: 'center', gap: 16 },
  successEmoji: { fontSize: 64, marginTop: 16 },
  successTitle: { fontSize: Typography.fontSize['2xl'], fontWeight: Typography.fontWeight.extrabold, color: Colors.white },
  transcriptBox: {
    backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14,
    padding: 16, width: '100%',
  },
  transcriptLabel: { fontSize: Typography.fontSize.xs, color: Colors.primary[200], marginBottom: 4 },
  transcriptText: { fontSize: Typography.fontSize.base, color: Colors.white, fontStyle: 'italic' },
  resultCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, width: '100%', gap: 10 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultLabel: { fontSize: Typography.fontSize.sm, color: Colors.gray[500] },
  resultValue: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.semibold, color: Colors.gray[900] },
  confidence: { fontSize: Typography.fontSize.sm, color: Colors.primary[200] },
  doneBtn: {
    backgroundColor: Colors.white, borderRadius: 16,
    paddingVertical: 14, paddingHorizontal: 48,
  },
  doneBtnText: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold, color: Colors.primary[500] },
  recordAgain: { paddingVertical: 8 },
  recordAgainText: { fontSize: Typography.fontSize.base, color: Colors.primary[200], fontWeight: Typography.fontWeight.medium },
});
