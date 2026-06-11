import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { formatNaira } from '../../utils/currency';

export default function AdminLoansScreen() {
  // Loan officers view users with their credit scores / loan eligibility
  const { data, isLoading } = useQuery({
    queryKey: ['admin-loan-users'],
    queryFn: () => api.get('/admin/users', { params: { limit: 50 } }),
  });

  const users: any[] = Array.isArray(data?.data?.data) ? data.data.data : [];

  const ELIGIBILITY_COLOR = {
    eligible: Colors.success,
    conditional: Colors.warning,
    ineligible: Colors.error,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Loan Management</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoEmoji}>💳</Text>
        <Text style={styles.infoText}>
          Review trader credit scores and loan eligibility. Scores are calculated automatically from transaction history.
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary[500]} size="large" />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(u) => u._id}
          contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: 40 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View>
                  <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
                  <Text style={styles.business}>{item.businessName || 'No business name'}</Text>
                  <Text style={styles.phone}>{item.phone}</Text>
                </View>
                <View style={[styles.kycBadge, {
                  backgroundColor: item.kycStatus === 'verified' ? Colors.success + '20' : Colors.warning + '20',
                }]}>
                  <Text style={[styles.kycText, {
                    color: item.kycStatus === 'verified' ? Colors.success : Colors.warning,
                  }]}>
                    KYC: {item.kycStatus?.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No users found.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12,
  },
  back: { fontSize: Typography.fontSize.md, color: Colors.primary[500], fontWeight: Typography.fontWeight.semibold },
  title: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.extrabold, color: Colors.gray[900] },
  infoCard: {
    flexDirection: 'row', backgroundColor: Colors.primary[100], borderRadius: 14,
    padding: 14, gap: 10, marginHorizontal: 16, marginBottom: 4, alignItems: 'flex-start',
  },
  infoEmoji: { fontSize: 22 },
  infoText: { flex: 1, fontSize: Typography.fontSize.sm, color: Colors.primary[500], lineHeight: 20 },
  card: { backgroundColor: Colors.white, borderRadius: 14, padding: 14 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.bold, color: Colors.gray[900] },
  business: { fontSize: Typography.fontSize.sm, color: Colors.gray[600], marginTop: 2 },
  phone: { fontSize: Typography.fontSize.xs, color: Colors.gray[400], marginTop: 2 },
  kycBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  kycText: { fontSize: Typography.fontSize.xs, fontWeight: Typography.fontWeight.extrabold },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: Colors.gray[400], fontSize: Typography.fontSize.base },
});
