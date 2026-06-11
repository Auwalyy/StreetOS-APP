import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { customerService } from '../../../services/services';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { formatNaira } from '../../../utils/currency';

function CustomerCard({ item }: { item: any }) {
  const trustColor = item.trustScore >= 70 ? Colors.success : item.trustScore >= 40 ? Colors.warning : Colors.error;
  const initials = item.name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: '/(app)/customers/[id]', params: { id: item._id } })}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={[styles.trustBadge, { backgroundColor: trustColor + '20' }]}>
            <Text style={[styles.trustText, { color: trustColor }]}>Trust {item.trustScore || 0}%</Text>
          </View>
        </View>
        <Text style={styles.phone}>{item.phone || 'No phone'}</Text>
        <View style={styles.statsRow}>
          <Text style={styles.stat}>💰 {formatNaira(item.totalPurchases || 0, true)}</Text>
          {item.totalDebt > 0 && <Text style={[styles.stat, { color: Colors.error }]}>Owes {formatNaira(item.totalDebt, true)}</Text>}
          <Text style={styles.stat}>🧾 {item.transactionCount || 0} txns</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function CustomersScreen() {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customerService.list({ limit: 100 }),
  });

  // sendPaginated → { success, data: [], pagination }
  const allCustomers: any[] = Array.isArray(data?.data?.data) ? data.data.data : [];
  const customers = allCustomers.filter((c: any) =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Customers</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput} value={search} onChangeText={setSearch}
          placeholder="Search customers..." placeholderTextColor={Colors.gray[400]}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary[500]} size="large" />
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => <CustomerCard item={item} />}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 40 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>👥</Text>
              <Text style={styles.emptyText}>No customers yet. They'll appear when you record transactions.</Text>
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
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
    marginHorizontal: 16, borderRadius: 12, paddingHorizontal: 14, marginBottom: 4,
    borderWidth: 1.5, borderColor: Colors.gray[200],
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: Typography.fontSize.base, color: Colors.gray[800] },
  card: {
    flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 14,
    padding: 14, gap: 12, alignItems: 'flex-start',
  },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.primary[500], alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.bold, color: Colors.white },
  cardBody: { flex: 1, gap: 4 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold, color: Colors.gray[900] },
  trustBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  trustText: { fontSize: Typography.fontSize.xs, fontWeight: Typography.fontWeight.bold },
  phone: { fontSize: Typography.fontSize.sm, color: Colors.gray[500] },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 2 },
  stat: { fontSize: Typography.fontSize.xs, color: Colors.gray[600], fontWeight: Typography.fontWeight.medium },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { color: Colors.gray[400], fontSize: Typography.fontSize.base, textAlign: 'center', paddingHorizontal: 32 },
});
