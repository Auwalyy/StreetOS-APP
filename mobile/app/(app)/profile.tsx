import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

function ProfileRow({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <View style={styles.profileRow}>
      <Text style={styles.rowEmoji}>{emoji}</Text>
      <View>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </View>
  );
}

function MenuLink({ emoji, label, onPress }: { emoji: string; label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuEmoji}>{emoji}</Text>
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    router.replace('/(auth)/login');
  };

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity onPress={() => router.push('/(app)/settings')}>
          <Text style={styles.settings}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.fullName}>{user?.firstName} {user?.lastName}</Text>
        <Text style={styles.businessName}>{user?.businessName || 'No business name'}</Text>
        <View style={[styles.roleBadge, { backgroundColor: Colors.primary[100] }]}>
          <Text style={styles.roleText}>{user?.role?.replace('_', ' ').toUpperCase()}</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Info</Text>
        <ProfileRow emoji="📱" label="Phone" value={user?.phone || '—'} />
        <ProfileRow emoji="🏪" label="Business Type" value={user?.businessType?.replace('_', ' ') || '—'} />
        <ProfileRow emoji="🌐" label="Language" value={user?.language?.toUpperCase() || 'EN'} />
      </View>

      {/* Menu */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Links</Text>
        <MenuLink emoji="🪪" label="Business Passport" onPress={() => router.push('/(app)/passport')} />
        <MenuLink emoji="📊" label="Health Score" onPress={() => router.push('/(app)/health-score')} />
        <MenuLink emoji="💳" label="Credit Score" onPress={() => router.push('/(app)/credit-score')} />
        <MenuLink emoji="👥" label="My Customers" onPress={() => router.push('/(app)/customers/index')} />
        <MenuLink emoji="🔔" label="Notifications" onPress={() => router.push('/(app)/notifications')} />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { padding: 20, paddingTop: 56, paddingBottom: 48, gap: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  back: { fontSize: Typography.fontSize.md, color: Colors.primary[500], fontWeight: Typography.fontWeight.semibold },
  title: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.extrabold, color: Colors.gray[900] },
  settings: { fontSize: 22 },
  avatarSection: { alignItems: 'center', gap: 8 },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary[500], alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: Typography.fontSize['2xl'], fontWeight: Typography.fontWeight.extrabold, color: Colors.white },
  fullName: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.bold, color: Colors.gray[900] },
  businessName: { fontSize: Typography.fontSize.base, color: Colors.gray[500] },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  roleText: { fontSize: Typography.fontSize.xs, fontWeight: Typography.fontWeight.bold, color: Colors.primary[500] },
  section: { backgroundColor: Colors.white, borderRadius: 14, padding: 16, gap: 12 },
  sectionTitle: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.bold, color: Colors.gray[700] },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowEmoji: { fontSize: 20 },
  rowLabel: { fontSize: Typography.fontSize.xs, color: Colors.gray[400] },
  rowValue: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.medium, color: Colors.gray[800] },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  menuEmoji: { fontSize: 20 },
  menuLabel: { flex: 1, fontSize: Typography.fontSize.base, color: Colors.gray[800], fontWeight: Typography.fontWeight.medium },
  menuArrow: { fontSize: 20, color: Colors.gray[400] },
  logoutBtn: {
    backgroundColor: '#FEE2E2', borderRadius: 16, paddingVertical: 16, alignItems: 'center',
  },
  logoutText: { color: Colors.error, fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold },
});
