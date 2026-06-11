import { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useCashflow, useProfitLoss, useTopProducts, useRevenueTrends } from '../../../hooks/useAnalytics';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { formatNaira } from '../../../utils/currency';

const PERIODS = ['daily', 'weekly', 'monthly'] as const;

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statVal, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function BarChart({ data }: { data: { label: string; value: number }[] }) {
  if (!data.length) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <View style={styles.chart}>
      {data.slice(-8).map((d, i) => (
        <View key={i} style={styles.barCol}>
          <View style={[styles.bar, { height: Math.max((d.value / max) * 100, 2) }]} />
          <Text style={styles.barLabel} numberOfLines={1}>{d.label}</Text>
        </View>
      ))}
    </View>
  );
}

export default function AnalyticsScreen() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');

  const { data: cashflowData, isLoading: cfLoading } = useCashflow(period);
  const { data: plData, isLoading: plLoading } = useProfitLoss();
  const { data: topProducts, isLoading: tpLoading } = useTopProducts(8);
  const { data: trendData, isLoading: trLoading } = useRevenueTrends();

  // cashflow is array of { _id: { period, type }, total, count }
  const cashflow: any[] = Array.isArray(cashflowData) ? cashflowData : [];
  const revenue = cashflow.filter((c) => c._id?.type === 'sale').reduce((s, c) => s + c.total, 0);
  const expenses = cashflow.filter((c) => ['expense', 'purchase'].includes(c._id?.type)).reduce((s, c) => s + c.total, 0);

  // profit-loss is { revenue, expenses, profit, breakdown }
  const pl = plData || {};

  // top products: [{ _id: name, totalRevenue, totalQty, count }]
  const products: any[] = Array.isArray(topProducts) ? topProducts : [];

  // revenue trends: [{ _id: "2024-01", revenue, transactions }]
  const trends: any[] = Array.isArray(trendData) ? trendData : [];
  const trendChartData = trends.map((t) => ({ label: t._id?.slice(5) || t._id, value: t.revenue || 0 }));

  const isLoading = cfLoading || plLoading || tpLoading || trLoading;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Analytics</Text>
        <TouchableOpacity onPress={() => router.push('/(app)/health-score')}>
          <Text style={styles.scoreLink}>Health Score →</Text>
        </TouchableOpacity>
      </View>

      {/* Period Selector */}
      <View style={styles.periods}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p} onPress={() => setPeriod(p)}
            style={[styles.periodBtn, period === p && styles.periodBtnActive]}
          >
            <Text style={[styles.periodText, period === p && styles.periodTextActive]}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color={Colors.primary[500]} size="large" />
      ) : (
        <>
          {/* Cashflow Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💰 Cashflow ({period})</Text>
            <View style={styles.statsRow}>
              <StatBox label="Revenue" value={formatNaira(revenue, true)} color={Colors.success} />
              <StatBox label="Expenses" value={formatNaira(expenses, true)} color={Colors.error} />
              <StatBox label="Net" value={formatNaira(revenue - expenses, true)} color={revenue - expenses >= 0 ? Colors.primary[400] : Colors.error} />
            </View>
          </View>

          {/* Profit & Loss */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📈 Profit & Loss (30 days)</Text>
            <View style={styles.statsRow}>
              <StatBox label="Revenue" value={formatNaira(pl.revenue || 0, true)} color={Colors.success} />
              <StatBox label="Costs" value={formatNaira(pl.expenses || 0, true)} color={Colors.error} />
              <StatBox label="Profit" value={formatNaira(pl.profit || 0, true)} color={(pl.profit || 0) >= 0 ? Colors.primary[400] : Colors.error} />
            </View>
          </View>

          {/* Revenue Trend Chart */}
          {trendChartData.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📊 Revenue Trend (12 months)</Text>
              <BarChart data={trendChartData} />
            </View>
          )}

          {/* Top Products */}
          {products.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🏆 Top Products (30 days)</Text>
              {products.map((p, i) => {
                const maxRevenue = products[0]?.totalRevenue || 1;
                const pct = (p.totalRevenue / maxRevenue) * 100;
                return (
                  <View key={i} style={styles.productRow}>
                    <View style={styles.productLeft}>
                      <Text style={styles.productRank}>#{i + 1}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.productName}>{p._id}</Text>
                        <View style={styles.productBarTrack}>
                          <View style={[styles.productBarFill, { width: `${pct}%` as any }]} />
                        </View>
                      </View>
                    </View>
                    <View style={styles.productRight}>
                      <Text style={styles.productRevenue}>{formatNaira(p.totalRevenue, true)}</Text>
                      <Text style={styles.productCount}>{p.count} sales</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}

          {products.length === 0 && trends.length === 0 && (
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📊</Text>
              <Text style={styles.emptyText}>Record more transactions to see your analytics.</Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { padding: 20, paddingTop: 56, paddingBottom: 48, gap: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { fontSize: Typography.fontSize['2xl'], fontWeight: Typography.fontWeight.extrabold, color: Colors.gray[900] },
  scoreLink: { fontSize: Typography.fontSize.sm, color: Colors.primary[400], fontWeight: Typography.fontWeight.semibold },
  periods: { flexDirection: 'row', gap: 8 },
  periodBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.gray[100] },
  periodBtnActive: { backgroundColor: Colors.primary[500] },
  periodText: { fontSize: Typography.fontSize.sm, color: Colors.gray[600], fontWeight: Typography.fontWeight.medium },
  periodTextActive: { color: Colors.white, fontWeight: Typography.fontWeight.bold },
  section: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, gap: 12 },
  sectionTitle: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.bold, color: Colors.gray[800] },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statBox: { alignItems: 'center', gap: 4 },
  statVal: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.extrabold },
  statLabel: { fontSize: Typography.fontSize.xs, color: Colors.gray[500] },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 120, paddingTop: 8 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  bar: { width: '100%', backgroundColor: Colors.primary[400], borderRadius: 4, minHeight: 2 },
  barLabel: { fontSize: 9, color: Colors.gray[400], textAlign: 'center' },
  productRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.gray[100],
  },
  productLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  productRank: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.bold, color: Colors.gray[400], width: 24 },
  productName: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.semibold, color: Colors.gray[800], marginBottom: 4 },
  productBarTrack: { height: 4, backgroundColor: Colors.gray[100], borderRadius: 2 },
  productBarFill: { height: 4, backgroundColor: Colors.primary[400], borderRadius: 2 },
  productRight: { alignItems: 'flex-end', gap: 2 },
  productRevenue: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.bold, color: Colors.primary[500] },
  productCount: { fontSize: Typography.fontSize.xs, color: Colors.gray[400] },
  empty: { alignItems: 'center', paddingTop: 40, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: Typography.fontSize.base, color: Colors.gray[400], textAlign: 'center' },
});
