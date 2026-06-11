import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import api from '../../services/api';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

export default function AdminUsersScreen() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: () => api.get('/admin/users', { params: { search: search || undefined, limit: 50 } }),
  });

  const { mutate: toggleStatus } = useMutation({
    mutationFn: (id: string) => api.put(`/admin/users/${id}/toggle-status`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      Toast.show({ type: 'success', text1: 'User status updated' });
    },
  });

  const users: any[] = Array.isArray(data?.data?.data) ? data.data.data : [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Users</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput} value={search} onChangeText={setSearch}
          placeholder="Search by name or phone..." placeholderTextColor={Colors.gray[400]}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary[500]} size="large" />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(u) => u._id}
          contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: 40 }}
          onRefresh={refetch}
          refreshing={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardLeft}>
                <View style={[styles.avatar, { backgroundColor: item.isActive ? Colors.primary[500] : Colors.gray[400] }]}>
                  <Text style={styles.avatarText}>{item.firstName?.[0]}{item.lastName?.[0]}</Text>
                </View>
                <View>
                  <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
                  <Text style={styles.phone}>{item.phone}</Text>
                  <Text style={styles.role}>{item.role} · {item.businessType || '—'}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.statusBtn, { backgroundColor: item.isActive ? '#FEE2E2' : '#D1FAE5' }]}
                onPress={() => toggleStatus(item._id)}
              >
                <Text style={[styles.statusText, { color: item.isActive ? Colors.error : Colors.success }]}>
                  {item.isActive ? 'Suspend' : 'Activate'}
                </Text>
              </TouchableOpacity>
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
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
    marginHorizontal: 16, borderRadius: 12, paddingHorizontal: 14, marginBottom: 4,
    borderWidth: 1.5, borderColor: Colors.gray[200],
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: Typography.fontSize.base, color: Colors.gray[800] },
  card: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: 14, padding: 14,
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Colors.white, fontWeight: Typography.fontWeight.bold, fontSize: Typography.fontSize.base },
  name: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.semibold, color: Colors.gray[900] },
  phone: { fontSize: Typography.fontSize.xs, color: Colors.gray[500] },
  role: { fontSize: Typography.fontSize.xs, color: Colors.gray[400], textTransform: 'capitalize' },
  statusBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  statusText: { fontSize: Typography.fontSize.xs, fontWeight: Typography.fontWeight.bold },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: Colors.gray[400], fontSize: Typography.fontSize.base },
});
