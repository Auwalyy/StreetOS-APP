import { ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { scoreService } from '../../services/services';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

const COMPONENT_LABELS: Record<string, string> = {
  revenueConsistency: 'Revenue Consistency',
  inventoryManagement: 'Inventory Management',
  debtCollection: 'Debt Collection',
  customerRetention: 'Customer Retention',
  businessGrowth: 'Business Growth',
};

function ScoreBar({ label, value }: { label: string; value: number }) {
  const pct = Math.min(Math.round(value * 100), 100);
  const color = pct >= 75 ? Colors.success : pct >= 50 ? Colors.warning : Colors.error;
  return (
    <View style={styles.barWrap}>
      <View style={styles.barLabelRow}>
        <Text style={styles.barLabel}>{label}</Text>
        <Text style={[styles.barPct, { color }]}>{pct}%</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
    </View>
  );
}

export default function HealthScoreScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ['health-score'],
    queryFn: () => scoreService.getHealth(),
  });

  const health = data?.data?.data;

  const bandColor = (score: number) => {
    if (score >= 90) return Colors.success;
    if (score >= 75) return Colors.primary[400];
    if (score >= 60) return Colors.warning;
    return Colors.error;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Business Health Score</Text>
        <View style={{ width: 60 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color={Colors.primary[500]} size="large" />
      ) : health ? (
        <>
          {/* Big Score */}
          <View style={[styles.scoreCircleWrap, { borderColor: bandColor(health.score) }]}>
            <Text style={[styles.scoreNum, { color: bandColor(health.score) }]}>{health.score}</Text>
            <Text style={styles.scoreMax}>/100</Text>
            <Text style={[styles.scoreBand, { color: bandColor(health.score) }]}>
              {health.band?.replace('_', ' ').toUpperCase()}
            </Text>
          </View>

          {/* Narrative */}
          {health.narrative && (
            <View style={styles.narrativeCard}>
              <Text style={styles.narrativeEmoji}>🤖</Text>
              <Text style={styles.narrativeText}>{health.narrative}</Text>
            </View>
          )}

          {/* Component Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Score Breakdown</Text>
            {Object.entries(health.components || {}).map(([key, val]) => (
              <ScoreBar key={key} label={COMPONENT_LABELS[key] || key} value={val as number} />
            ))}
          </View>

          {/* Strengths */}
          {health.strengths?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💪 Strengths</Text>
              {health.strengths.map((s: string, i: number) => (
                <View key={i} style={[styles.listItem, styles.strengthItem]}>
                  <Text style={styles.listText}>{s}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Weaknesses */}
          {health.weaknesses?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚠️ Areas to Improve</Text>
              {health.weaknesses.map((w: string, i: number) => (
                <View key={i} style={[styles.listItem, styles.weaknessItem]}>
                  <Text style={styles.listText}>{w}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Recommendations */}
          {health.recommendations?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💡 Recommendations</Text>
              {health.recommendations.map((r: string, i: number) => (
                <View key={i} style={styles.listItem}>
                  <Text style={styles.listNum}>{i + 1}.</Text>
                  <Text style={[styles.listText, { flex: 1 }]}>{r}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.calcAt}>
            Last calculated: {new Date(health.calculatedAt).toLocaleString()}
          </Text>
        </>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>📊</Text>
          <Text style={styles.emptyText}>No health score yet. Keep recording transactions to get your score!</Text>
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
  scoreCircleWrap: {
    alignSelf: 'center', width: 160, height: 160, borderRadius: 80, borderWidth: 8,
    alignItems: 'center', justifyContent: 'center', gap: 2,
    backgroundColor: Colors.white,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
  },
  scoreNum: { fontSize: Typography.fontSize['4xl'], fontWeight: Typography.fontWeight.extrabold },
  scoreMax: { fontSize: Typography.fontSize.sm, color: Colors.gray[400] },
  scoreBand: { fontSize: Typography.fontSize.xs, fontWeight: Typography.fontWeight.bold, letterSpacing: 1 },
  narrativeCard: {
    flexDirection: 'row', backgroundColor: Colors.primary[100], borderRadius: 14,
    padding: 16, gap: 12, alignItems: 'flex-start',
  },
  narrativeEmoji: { fontSize: 24 },
  narrativeText: { flex: 1, fontSize: Typography.fontSize.base, color: Colors.primary[500], lineHeight: 22 },
  section: { backgroundColor: Colors.white, borderRadius: 14, padding: 16, gap: 12 },
  sectionTitle: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold, color: Colors.gray[800] },
  barWrap: { gap: 6 },
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  barLabel: { fontSize: Typography.fontSize.sm, color: Colors.gray[600] },
  barPct: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.bold },
  barTrack: { height: 8, backgroundColor: Colors.gray[100], borderRadius: 4 },
  barFill: { height: 8, borderRadius: 4 },
  listItem: { flexDirection: 'row', gap: 10, padding: 10, borderRadius: 10, backgroundColor: Colors.bg.secondary },
  strengthItem: { backgroundColor: '#D1FAE5' },
  weaknessItem: { backgroundColor: '#FEF3C7' },
  listNum: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.bold, color: Colors.gray[500] },
  listText: { fontSize: Typography.fontSize.base, color: Colors.gray[700], lineHeight: 22 },
  calcAt: { fontSize: Typography.fontSize.xs, color: Colors.gray[400], textAlign: 'center' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 16 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: Typography.fontSize.base, color: Colors.gray[500], textAlign: 'center', lineHeight: 24, paddingHorizontal: 16 },
});
