import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../../services/services';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

const TYPE_EMOJI: Record<string, string> = {
  debt_reminder: '📒', low_stock: '📦', health_score: '📊',
  transaction: '💰', system: '⚙️', advisor: '🤖',
};

function NotifItem({ item, onRead }: { item: any; onRead: (id: string) => void }) {
  return (
    <TouchableOpacity
      style={[styles.notifCard, !item.readAt && styles.notifUnread]}
      onPress={() => !item.readAt && onRead(item._id)}
    >
      <Text style={styles.notifEmoji}>{TYPE_EMOJI[item.type] || '🔔'}</Text>
      <View style={styles.notifBody}>
        <View style={styles.notifTop}>
          <Text style={styles.notifTitle} numberOfLines={1}>{item.title}</Text>
          {!item.readAt && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notifMsg} numberOfLines={2}>{item.body}</Text>
        <Text style={styles.notifTime}>{new Date(item.createdAt).toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.list({ limit: 50 }),
  });

  const { mutate: markRead } = useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const { mutate: markAllRead } = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = data?.data?.data?.notifications || [];
  const unreadCount = notifications.filter((n: any) => !n.readAt).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={() => markAllRead()}>
            <Text style={styles.markAll}>Mark all read</Text>
          </TouchableOpacity>
        ) : <View style={{ width: 80 }} />}
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color={Colors.primary[500]} size="large" />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => <NotifItem item={item} onRead={markRead} />}
          contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: 40 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🔔</Text>
              <Text style={styles.emptyText}>No notifications yet.</Text>
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
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16,
  },
  back: { fontSize: Typography.fontSize.md, color: Colors.primary[500], fontWeight: Typography.fontWeight.semibold },
  title: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.extrabold, color: Colors.gray[900] },
  markAll: { fontSize: Typography.fontSize.sm, color: Colors.primary[400], fontWeight: Typography.fontWeight.semibold },
  notifCard: {
    flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 14,
    padding: 14, gap: 12, alignItems: 'flex-start',
  },
  notifUnread: { borderLeftWidth: 3, borderLeftColor: Colors.primary[500] },
  notifEmoji: { fontSize: 24, marginTop: 2 },
  notifBody: { flex: 1, gap: 4 },
  notifTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  notifTitle: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.bold, color: Colors.gray[900], flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary[500] },
  notifMsg: { fontSize: Typography.fontSize.sm, color: Colors.gray[600], lineHeight: 20 },
  notifTime: { fontSize: Typography.fontSize.xs, color: Colors.gray[400] },
  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { color: Colors.gray[400], fontSize: Typography.fontSize.base },
});
