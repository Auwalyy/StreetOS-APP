import { Tabs, router } from 'expo-router';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import { Colors } from '../../../constants/colors';

function VoiceFAB() {
  return (
    <TouchableOpacity
      onPress={() => router.push('/(app)/voice')}
      style={styles.fab}
      activeOpacity={0.8}
    >
      <Text style={styles.fabIcon}>🎤</Text>
    </TouchableOpacity>
  );
}

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
      <Text style={styles.tabEmoji}>{emoji}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary[500],
        tabBarInactiveTintColor: Colors.gray[400],
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Sales',
          tabBarIcon: ({ focused }) => <TabIcon emoji="💰" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="voice-tab"
        options={{
          title: '',
          tabBarButton: () => <VoiceFAB />,
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Stock',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📦" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
        }}
      />
      {/* debt tab accessible via quick actions, not in bottom nav to keep 5 items */}
      <Tabs.Screen name="debt" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    height: 72,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabIcon: { alignItems: 'center', justifyContent: 'center', padding: 4, borderRadius: 8 },
  tabIconActive: { backgroundColor: Colors.primary[100] },
  tabEmoji: { fontSize: 22 },
  fab: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.accent[500],
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    shadowColor: Colors.accent[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: { fontSize: 26 },
});
