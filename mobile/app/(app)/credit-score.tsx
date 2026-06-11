import { ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { scoreService } from '../../services/services';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { formatNaira } from '../../utils/currency';

const COMPONENT_LABELS: Record<string, string> = {
  transactionConsistency: 'Transaction Consistency',
  revenueLevel: 'Revenue Level',
  debtRepaymentBehavior: 'Debt Repayment',
  businessAge: 'Business Age',
  identityVerification: 'Identity Verification',
};

const ELIGIBILITY_CONFIG = {
  eligible: { color: Colors.success, emoji: '✅', label: 'Eligible for Loan' },
  conditional: { color: Colors.warning, emoji: '⚠️', label: 'Conditionally Eligible' },
  ineligible: { color: Colors.error, emoji: '❌', label: 'Not Yet Eligible' },
};

export default function CreditScoreScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ['credit-score'],
    queryFn: () => scoreService.getCredit(),
  });

  const credit = data?.data?.data;

  const scoreColor = (score: number) => {
    if (score >= 750) return Colors.success;
    if (score >= 670) return Colors.primary[400];
    if (score >= 580) return Colors.warning;
    return Colors.error;
  };

  const scorePercent = (score: number) => ((score - 300) / 550) * 100;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Credit Score</Text>
        <View style={{ width: 60 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color={Colors.primary[500]} size="large" />
      ) : credit ? (
        <>
          {/* Score Display */}
          <View style={styles.scoreCard}>
            <Text style={styles.scoreSub}>Your Business Credit Score</Text>
            <Text style={[styles.scoreNum, { color: scoreColor(credit.score) }]}>{credit.score}</Text>
            <Text style={styles.scoreRange}>300 — 850</Text>
            <View style={styles.scoreTrack}>
              <View style={[styles.scoreFill, {
                width: `${scorePercent(credit.score)}%` as any,
                backgroundColor: scoreColor(credit.score),
              }]} />
            </View>
            <Text style={styles.scoreBand}>
              {credit.score >= 750 ? 'Excellent' : credit.score >= 670 ? 'Good' : credit.score >= 580 ? 'Fair' : credit.score >= 500 ? 'Poor' : 'Very Poor'}
            </Text>
          </View>

          {/* Loan Eligibility */}
          {credit.loanEligibility && (() => {
            const cfg = ELIGIBILITY_CONFIG[credit.loanEligibility as keyof typeof ELIGIBILITY_CONFIG];
            return (
              <View style={[styles.eligibilityCard, { backgroundColor: cfg.color + '15', borderColor: cfg.color + '40' }]}>
                <Text style={styles.eligEmoji}>{cfg.emoji}</Text>
                <View>
                  <Text style={[styles.eligLabel, { color: cfg.color }]}>{cfg.label}</Text>
                  {credit.recommendedLoanRange?.max > 0 && (
                    <Text style={styles.eligRange}>
                      Up to {formatNaira(credit.recommendedLoanRange.max)}
                    </Text>
                  )}
                </View>
              </View>
            );
          })()}

          {/* Component Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Score Components</Text>
            {Object.entries(credit.components || {}).map(([key, val]) => {
              const pct = Math.round((val as number) * 100);
              const color = pct >= 75 ? Colors.success : pct >= 50 ? Colors.warning : Colors.error;
              return (
                <View key={key} style={styles.componentRow}>
                  <Text style={styles.compLabel}>{COMPONENT_LABELS[key] || key}</Text>
                  <View style={styles.compBarWrap}>
                    <View style={styles.compBarTrack}>
                      <View style={[styles.compBarFill, { width: `${pct}%` as any, backgroundColor: color }]} />
                    </View>
                    <Text style={[styles.compPct, { color }]}>{pct}%</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Improvement Tips */}
          {credit.improvements?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💡 How to Improve</Text>
              {credit.improvements.map((tip: string, i: number) => (
                <View key={i} style={styles.tipRow}>
                  <Text style={styles.tipNum}>{i + 1}</Text>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.calcAt}>
            Last calculated: {new Date(credit.calculatedAt).toLocaleString()}
          </Text>
        </>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>💳</Text>
          <Text style={styles.emptyText}>No credit score yet. Record more transactions to build your score!</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { padding: 20, paddingTop: 56, paddingBottom: 48, gap: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  back: { fontSize: Typography.fontSize.md, color: Colors.primary[500], fontWeight: Typography.fontWeight.semibold },
  title: { fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.bold, color: Colors.gray[900] },
  scoreCard: {
    backgroundColor: Colors.white, borderRadius: 20, padding: 24,
    alignItems: 'center', gap: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  scoreSub: { fontSize: Typography.fontSize.sm, color: Colors.gray[500] },
  scoreNum: { fontSize: 72, fontWeight: Typography.fontWeight.extrabold, lineHeight: 80 },
  scoreRange: { fontSize: Typography.fontSize.xs, color: Colors.gray[400] },
  scoreTrack: { width: '100%', height: 10, backgroundColor: Colors.gray[100], borderRadius: 5 },
  scoreFill: { height: 10, borderRadius: 5 },
  scoreBand: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.semibold, color: Colors.gray[600] },
  eligibilityCard: {
    flexDirection: 'row', borderRadius: 14, padding: 16, gap: 12,
    alignItems: 'center', borderWidth: 1,
  },
  eligEmoji: { fontSize: 32 },
  eligLabel: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold },
  eligRange: { fontSize: Typography.fontSize.sm, color: Colors.gray[500], marginTop: 2 },
  section: { backgroundColor: Colors.white, borderRadius: 14, padding: 16, gap: 12 },
  sectionTitle: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold, color: Colors.gray[800] },
  componentRow: { gap: 4 },
  compLabel: { fontSize: Typography.fontSize.sm, color: Colors.gray[600] },
  compBarWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  compBarTrack: { flex: 1, height: 8, backgroundColor: Colors.gray[100], borderRadius: 4 },
  compBarFill: { height: 8, borderRadius: 4 },
  compPct: { fontSize: Typography.fontSize.xs, fontWeight: Typography.fontWeight.bold, width: 32, textAlign: 'right' },
  tipRow: { flexDirection: 'row', gap: 12, backgroundColor: Colors.bg.secondary, borderRadius: 10, padding: 12 },
  tipNum: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.primary[500],
    textAlign: 'center', lineHeight: 24, color: Colors.white,
    fontSize: Typography.fontSize.xs, fontWeight: Typography.fontWeight.bold,
  },
  tipText: { flex: 1, fontSize: Typography.fontSize.base, color: Colors.gray[700], lineHeight: 22 },
  calcAt: { fontSize: Typography.fontSize.xs, color: Colors.gray[400], textAlign: 'center' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 16 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: Typography.fontSize.base, color: Colors.gray[500], textAlign: 'center', lineHeight: 24, paddingHorizontal: 16 },
});
