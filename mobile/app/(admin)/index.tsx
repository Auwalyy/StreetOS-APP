import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

const ADMIN_MODULES = [
  { emoji: '👥', label: 'User Management', route: '/(admin)/users', roles: ['admin', 'super_admin'] },
  { emoji: '💳', label: 'Loan Management', route: '/(admin)/loans', roles: ['admin', 'super_admin', 'loan_officer'] },
  { emoji: '📊', label: 'Platform Analytics', route: '/(admin)/analytics', roles: ['admin', 'super_admin'] },
];

export default function AdminIndexScreen() {
  const user = useAuthStore((s) => s.user);

  const accessible = ADMIN_MODULES.filter((m) => user && m.roles.includes(user.role));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(app)/(tabs)/')}>
          <Text style={styles.back}>← App</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Admin Panel</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>{user?.role?.replace('_', ' ').toUpperCase()}</Text>
      </View>

      <View style={styles.grid}>
        {accessible.map((m) => (
          <TouchableOpacity key={m.label} style={styles.moduleCard} onPress={() => router.push(m.route as any)}>
            <Text style={styles.moduleEmoji}>{m.emoji}</Text>
            <Text style={styles.moduleLabel}>{m.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { padding: 20, paddingTop: 56, paddingBottom: 48, gap: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  back: { fontSize: Typography.fontSize.md, color: Colors.primary[500], fontWeight: Typography.fontWeight.semibold },
  title: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.extrabold, color: Colors.gray[900] },
  badge: {
    alignSelf: 'center', backgroundColor: Colors.primary[100],
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12,
  },
  badgeText: { fontSize: Typography.fontSize.xs, fontWeight: Typography.fontWeight.extrabold, color: Colors.primary[500] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  moduleCard: {
    width: '47%', backgroundColor: Colors.white, borderRadius: 16, padding: 20,
    alignItems: 'center', gap: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  moduleEmoji: { fontSize: 40 },
  moduleLabel: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.semibold, color: Colors.gray[800], textAlign: 'center' },
});
