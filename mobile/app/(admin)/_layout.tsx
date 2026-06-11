import { useEffect } from 'react';
import { Stack, router } from 'expo-router';
import { useAuthStore } from '../../store/authStore';

export default function AdminLayout() {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user || !['admin', 'super_admin', 'loan_officer'].includes(user.role)) {
      router.replace('/(app)/(tabs)/');
    }
  }, [user]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="users" />
      <Stack.Screen name="loans" />
      <Stack.Screen name="analytics" />
    </Stack>
  );
}
