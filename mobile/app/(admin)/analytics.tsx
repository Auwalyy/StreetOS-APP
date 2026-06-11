import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import api from '../../services/api';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

export default function AdminAnalyticsScreen() {
  const qc = useQueryClient();

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get('/admin/dashboard'),
  });

  const { data: fraudData, isLoading: fraudLoading } = useQuery({
    queryKey: ['admin-fraud-alerts'],
    queryFn: () => api.get('/admin/fraud-alerts', { params: { limit: 20 } }),
  });

  const { mutate: resolveAlert } = useMutation({
    mutationFn: (id: string) => api.put(`/admin/fraud-alerts/${id}/resolve`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-fraud-alerts'] });
      Toast.show({ type: 'success', text1: 'Alert resolved' });
    },
  });

  const stats = statsData?.data?.data || {};
  const fraudAlerts: any[] = Array.isArray(fraudData?.data?.data) ? fraudData.data.data : [];

  const SEVERITY_COLOR: Record<string, string> = {
    low: Colors.info, medium: Colors.warning, high: Colors.error, critical: '#7C3AED',
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Platform Analytics</Text>
        <View style={{ width: 60 }} />
      </View>

      {statsLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary[500]} size="large" />
      ) : (
        <View style={styles.statsGrid}>
          {[
            { label: 'Total Users', value: stats.totalUsers || 0, emoji: '👥' },
            { label: 'Active Users', value: stats.activeUsers || 0, emoji: '✅' },
            { label: 'Transactions', value: stats.totalTransactions || 0, emoji: '💰' },
            { label: 'Fraud Alerts', value: stats.fraudAlerts || 0, emoji: '🚨' },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statEmoji}>{s.emoji}</Text>
              <Text style={styles.statVal}>{s.value.toLocaleString()}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.sectionTitle}>🚨 Fraud Alerts</Text>
      {fraudLoading ? (
        <ActivityIndicator color={Colors.primary[500]} />
      ) : fraudAlerts.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No unresolved fraud alerts.</Text>
        </View>
      ) : (
        fraudAlerts.map((alert) => (
          <View key={alert._id} style={[styles.alertCard, { borderLeftColor: SEVERITY_COLOR[alert.severity] || Colors.warning }]}>
            <View style={styles.alertTop}>
              <Text style={styles.alertType}>{alert.alertType?.replace(/_/g, ' ')}</Text>
              <View style={[styles.severityBadge, { backgroundColor: (SEVERITY_COLOR[alert.severity] || Colors.warning) + '20' }]}>
                <Text style={[styles.severityText, { color: SEVERITY_COLOR[alert.severity] || Colors.warning }]}>
                  {alert.severity?.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.alertDesc}>{alert.description}</Text>
            <View style={styles.alertFooter}>
              <Text style={styles.alertDate}>{new Date(alert.createdAt).toLocaleString()}</Text>
              <TouchableOpacity style={styles.resolveBtn} onPress={() => resolveAlert(alert._id)}>
                <Text style={styles.resolveBtnText}>Resolve</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { padding: 20, paddingTop: 56, paddingBottom: 48, gap: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  back: { fontSize: Typography.fontSize.md, color: Colors.primary[500], fontWeight: Typography.fontWeight.semibold },
  title: { fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.extrabold, color: Colors.gray[900] },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    width: '47%', backgroundColor: Colors.white, borderRadius: 14, padding: 16,
    alignItems: 'center', gap: 6,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  statEmoji: { fontSize: 28 },
  statVal: { fontSize: Typography.fontSize['2xl'], fontWeight: Typography.fontWeight.extrabold, color: Colors.gray[900] },
  statLabel: { fontSize: Typography.fontSize.xs, color: Colors.gray[500], textAlign: 'center' },
  sectionTitle: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold, color: Colors.gray[800] },
  alertCard: {
    backgroundColor: Colors.white, borderRadius: 14, padding: 16,
    borderLeftWidth: 4, gap: 8,
  },
  alertTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  alertType: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.bold, color: Colors.gray[900], textTransform: 'capitalize' },
  severityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  severityText: { fontSize: Typography.fontSize.xs, fontWeight: Typography.fontWeight.extrabold },
  alertDesc: { fontSize: Typography.fontSize.sm, color: Colors.gray[600], lineHeight: 20 },
  alertFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  alertDate: { fontSize: Typography.fontSize.xs, color: Colors.gray[400] },
  resolveBtn: { backgroundColor: Colors.primary[100], paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  resolveBtnText: { fontSize: Typography.fontSize.sm, color: Colors.primary[500], fontWeight: Typography.fontWeight.semibold },
  empty: { backgroundColor: Colors.white, borderRadius: 14, padding: 24, alignItems: 'center' },
  emptyText: { color: Colors.gray[400], fontSize: Typography.fontSize.base },
});
