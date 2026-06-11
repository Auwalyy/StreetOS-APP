import { ScrollView, View, Text, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { analyticsService, scoreService, advisorService } from '../../../services/services';
import { transactionService } from '../../../services/transaction.service';
import { useAuthStore } from '../../../store/authStore';
import { useOfflineStore } from '../../../store/offlineStore';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { formatNaira } from '../../../utils/currency';

function SummaryCard({ emoji, label, value, color }: { emoji: string; label: string; value: string; color: string }) {
  return (
    <View style={[styles.summaryCard, { borderLeftColor: color }]}>
      <Text style={styles.summaryEmoji}>{emoji}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function ScoreGauge({ score, label, color }: { score: number; label: string; color: string }) {
  const band =
    score >= 90 ? 'Excellent' : score >= 75 ? 'Good' : score >= 60 ? 'Fair' : score >= 40 ? 'Needs Work' : 'Critical';
  return (
    <View style={styles.gaugeWrap}>
      <View style={[styles.gaugeCircle, { borderColor: color }]}>
        <Text style={[styles.gaugeScore, { color }]}>{score}</Text>
        <Text style={styles.gaugeMax}>/100</Text>
      </View>
      <Text style={styles.gaugeLabel}>{label}</Text>
      <Text style={[styles.gaugeBand, { color }]}>{band}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const pendingCount = useOfflineStore((s) => s.getPendingCount());

  const { data: summary, refetch: refetchSummary, isRefetching } = useQuery({
    queryKey: ['summary', 'daily'],
    queryFn: () => transactionService.getSummary('daily'),
  });

  const { data: healthData } = useQuery({
    queryKey: ['health-score'],
    queryFn: () => scoreService.getHealth(),
  });

  const { data: briefingData } = useQuery({
    queryKey: ['daily-briefing'],
    queryFn: () => advisorService.getDailyBriefing(),
  });

  const { data: recentData } = useQuery({
    queryKey: ['transactions', 'recent'],
    queryFn: () => transactionService.list({ limit: 5 }),
  });

  const s = summary?.data?.data || {};
  const health = healthData?.data?.data;
  const briefing = briefingData?.data?.data;
  const recent = recentData?.data?.data?.transactions || [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetchSummary} tintColor={Colors.primary[500]} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning 👋</Text>
          <Text style={styles.name}>{user?.businessName || user?.firstName}</Text>
        </View>
        <View style={styles.headerActions}>
          {pendingCount > 0 && (
            <View style={styles.syncBadge}>
              <Text style={styles.syncText}>{pendingCount} pending</Text>
            </View>
          )}
          <TouchableOpacity onPress={() => router.push('/(app)/notifications')} style={styles.notifBtn}>
            <Text style={{ fontSize: 22 }}>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* AI Briefing */}
      {briefing?.message && (
        <TouchableOpacity style={styles.briefingCard}>
          <Text style={styles.briefingEmoji}>🤖</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.briefingTitle}>AI Advisor</Text>
            <Text style={styles.briefingText} numberOfLines={3}>{briefing.message}</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Summary Cards */}
      <Text style={styles.sectionTitle}>Today's Summary</Text>
      <View style={styles.summaryRow}>
        <SummaryCard emoji="💰" label="Revenue" value={formatNaira(s.totalRevenue || 0)} color={Colors.success} />
        <SummaryCard emoji="📈" label="Profit" value={formatNaira(s.totalProfit || 0)} color={Colors.primary[400]} />
        <SummaryCard emoji="🧾" label="Sales" value={String(s.salesCount || 0)} color={Colors.info} />
        <SummaryCard emoji="📦" label="Items Sold" value={String(s.itemsSold || 0)} color={Colors.accent[500]} />
      </View>

      {/* Health & Credit Scores */}
      <Text style={styles.sectionTitle}>Business Scores</Text>
      <View style={styles.scoresRow}>
        <TouchableOpacity style={styles.scoreCard} onPress={() => router.push('/(app)/health-score')}>
          <ScoreGauge score={health?.score || 0} label="Health Score" color={Colors.success} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.scoreCard} onPress={() => router.push('/(app)/credit-score')}>
          <ScoreGauge
            score={health ? Math.round((health.score / 100) * 850) : 0}
            label="Credit Score"
            color={Colors.primary[400]}
          />
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {[
          { emoji: '🎤', label: 'Voice Sale', route: '/(app)/voice' },
          { emoji: '📒', label: 'Add Debt', route: '/(app)/(tabs)/debt' },
          { emoji: '📦', label: 'Inventory', route: '/(app)/(tabs)/inventory' },
          { emoji: '📊', label: 'Analytics', route: '/(app)/(tabs)/transactions' },
          { emoji: '🪪', label: 'Passport', route: '/(app)/passport' },
          { emoji: '👥', label: 'Customers', route: '/(app)/customers/index' },
        ].map((a) => (
          <TouchableOpacity key={a.label} style={styles.actionBtn} onPress={() => router.push(a.route as any)}>
            <Text style={styles.actionEmoji}>{a.emoji}</Text>
            <Text style={styles.actionLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Transactions */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/transactions')}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      {recent.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No transactions yet. Tap 🎤 to record your first sale!</Text>
        </View>
      ) : (
        recent.map((t: any) => (
          <View key={t._id} style={styles.txItem}>
            <View style={styles.txLeft}>
              <Text style={styles.txEmoji}>{t.type === 'sale' ? '💰' : t.type === 'expense' ? '💸' : '📥'}</Text>
              <View>
                <Text style={styles.txName}>{t.productName || t.type}</Text>
                <Text style={styles.txDate}>{new Date(t.createdAt).toLocaleDateString()}</Text>
              </View>
            </View>
            <Text style={[styles.txAmount, { color: t.type === 'expense' ? Colors.error : Colors.success }]}>
              {t.type === 'expense' ? '-' : '+'}{formatNaira(t.amount)}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { padding: 20, paddingTop: 56, paddingBottom: 32, gap: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  greeting: { fontSize: Typography.fontSize.base, color: Colors.gray[500] },
  name: { fontSize: Typography.fontSize['2xl'], fontWeight: Typography.fontWeight.extrabold, color: Colors.gray[900] },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  syncBadge: { backgroundColor: Colors.warning, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  syncText: { fontSize: Typography.fontSize.xs, fontWeight: Typography.fontWeight.bold, color: Colors.white },
  notifBtn: { padding: 8 },
  briefingCard: {
    flexDirection: 'row', backgroundColor: Colors.primary[100], borderRadius: 16,
    padding: 16, gap: 12, marginBottom: 16, alignItems: 'flex-start',
  },
  briefingEmoji: { fontSize: 28 },
  briefingTitle: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.bold, color: Colors.primary[500] },
  briefingText: { fontSize: Typography.fontSize.sm, color: Colors.primary[400], lineHeight: 20, marginTop: 2 },
  sectionTitle: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold, color: Colors.gray[800], marginTop: 8, marginBottom: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  seeAll: { fontSize: Typography.fontSize.sm, color: Colors.primary[400], fontWeight: Typography.fontWeight.semibold },
  summaryRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginBottom: 8 },
  summaryCard: {
    flex: 1, minWidth: '44%', backgroundColor: Colors.white, borderRadius: 14,
    padding: 14, borderLeftWidth: 4, gap: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  summaryEmoji: { fontSize: 24 },
  summaryValue: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.extrabold, color: Colors.gray[900] },
  summaryLabel: { fontSize: Typography.fontSize.xs, color: Colors.gray[500] },
  scoresRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  scoreCard: {
    flex: 1, backgroundColor: Colors.white, borderRadius: 16, padding: 16, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  gaugeWrap: { alignItems: 'center', gap: 6 },
  gaugeCircle: {
    width: 72, height: 72, borderRadius: 36, borderWidth: 6,
    alignItems: 'center', justifyContent: 'center', flexDirection: 'row',
  },
  gaugeScore: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.extrabold },
  gaugeMax: { fontSize: Typography.fontSize.xs, color: Colors.gray[400], marginTop: 6 },
  gaugeLabel: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.semibold, color: Colors.gray[700] },
  gaugeBand: { fontSize: Typography.fontSize.xs, fontWeight: Typography.fontWeight.bold },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  actionBtn: {
    width: '30%', backgroundColor: Colors.white, borderRadius: 14, padding: 14,
    alignItems: 'center', gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  actionEmoji: { fontSize: 28 },
  actionLabel: { fontSize: Typography.fontSize.xs, fontWeight: Typography.fontWeight.semibold, color: Colors.gray[700], textAlign: 'center' },
  empty: { backgroundColor: Colors.white, borderRadius: 14, padding: 24, alignItems: 'center' },
  emptyText: { fontSize: Typography.fontSize.base, color: Colors.gray[400], textAlign: 'center', lineHeight: 22 },
  txItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: 12, padding: 14, marginBottom: 8,
  },
  txLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  txEmoji: { fontSize: 24 },
  txName: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.semibold, color: Colors.gray[800] },
  txDate: { fontSize: Typography.fontSize.xs, color: Colors.gray[400], marginTop: 2 },
  txAmount: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold },
});
