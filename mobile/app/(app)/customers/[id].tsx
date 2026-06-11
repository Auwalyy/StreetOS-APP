import { ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { customerService, debtService } from '../../../services/services';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { formatNaira } from '../../../utils/currency';

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customerService.getById(id),
  });

  const { data: debtData } = useQuery({
    queryKey: ['debts', 'customer', id],
    queryFn: () => debtService.list({ customerId: id }),
  });

  const customer = data?.data?.data;
  const debts: any[] = Array.isArray(debtData?.data?.data) ? debtData.data.data : [];
  const trustColor = (score: number) =>
    score >= 70 ? Colors.success : score >= 40 ? Colors.warning : Colors.error;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Customer</Text>
        <View style={{ width: 60 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color={Colors.primary[500]} size="large" />
      ) : customer ? (
        <>
          {/* Customer Header */}
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {customer.name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
              </Text>
            </View>
            <Text style={styles.name}>{customer.name}</Text>
            {customer.phone ? <Text style={styles.phone}>{customer.phone}</Text> : null}
            {customer.location ? <Text style={styles.location}>📍 {customer.location}</Text> : null}
            <View style={[styles.trustBadge, { backgroundColor: trustColor(customer.trustScore || 0) + '20' }]}>
              <Text style={[styles.trustText, { color: trustColor(customer.trustScore || 0) }]}>
                Trust Score: {customer.trustScore || 0}/100
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsCard}>
            {[
              { label: 'Total Purchases', value: formatNaira(customer.totalPurchases || 0), emoji: '💰' },
              { label: 'Outstanding Debt', value: formatNaira(customer.totalDebt || 0), emoji: '📒' },
              { label: 'Transactions', value: String(customer.transactionCount || 0), emoji: '🧾' },
              { label: 'Repayment Rate', value: `${Math.round((customer.debtRepaymentRate || 0) * 100)}%`, emoji: '✅' },
            ].map((s) => (
              <View key={s.label} style={styles.statBox}>
                <Text style={styles.statEmoji}>{s.emoji}</Text>
                <Text style={styles.statVal}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Debts */}
          {debts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Active Debts</Text>
              {debts.map((debt: any) => (
                <View key={debt._id} style={styles.debtRow}>
                  <View>
                    <Text style={styles.debtProduct}>{debt.productName || 'Goods'}</Text>
                    <Text style={styles.debtDue}>Due: {new Date(debt.dueDate).toLocaleDateString()}</Text>
                  </View>
                  <View style={styles.debtAmounts}>
                    <Text style={[styles.debtBalance, { color: Colors.error }]}>{formatNaira(debt.balance)}</Text>
                    <Text style={styles.debtStatus}>{debt.status}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.lastSeen}>
            Last transaction: {customer.lastTransactionAt
              ? new Date(customer.lastTransactionAt).toLocaleDateString()
              : 'Never'}
          </Text>
        </>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Customer not found.</Text>
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
  title: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.extrabold, color: Colors.gray[900] },
  profileCard: {
    backgroundColor: Colors.white, borderRadius: 16, padding: 24,
    alignItems: 'center', gap: 8,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.primary[500], alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.extrabold, color: Colors.white },
  name: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.bold, color: Colors.gray[900] },
  phone: { fontSize: Typography.fontSize.base, color: Colors.gray[500] },
  location: { fontSize: Typography.fontSize.sm, color: Colors.gray[500] },
  trustBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  trustText: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.bold },
  statsCard: {
    flexDirection: 'row', flexWrap: 'wrap', backgroundColor: Colors.white,
    borderRadius: 16, padding: 16, gap: 8,
  },
  statBox: { width: '47%', alignItems: 'center', gap: 4, padding: 8 },
  statEmoji: { fontSize: 24 },
  statVal: { fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.extrabold, color: Colors.gray[900] },
  statLabel: { fontSize: Typography.fontSize.xs, color: Colors.gray[400], textAlign: 'center' },
  section: { backgroundColor: Colors.white, borderRadius: 14, padding: 16, gap: 10 },
  sectionTitle: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.bold, color: Colors.gray[800] },
  debtRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  debtProduct: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.semibold, color: Colors.gray[800] },
  debtDue: { fontSize: Typography.fontSize.xs, color: Colors.gray[500] },
  debtAmounts: { alignItems: 'flex-end' },
  debtBalance: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold },
  debtStatus: { fontSize: Typography.fontSize.xs, color: Colors.gray[400], textTransform: 'capitalize' },
  lastSeen: { fontSize: Typography.fontSize.xs, color: Colors.gray[400], textAlign: 'center' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: Colors.gray[400], fontSize: Typography.fontSize.base },
});
