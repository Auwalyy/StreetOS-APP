import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

const LANGUAGES = [
  { label: 'English', value: 'en' },
  { label: 'Hausa', value: 'ha' },
  { label: 'Yoruba', value: 'yo' },
  { label: 'Igbo', value: 'ig' },
  { label: 'Pidgin', value: 'pcm' },
];

export default function SettingsScreen() {
  const { user, updateUser } = useAuthStore();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Language */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌐 Language</Text>
        <View style={styles.chips}>
          {LANGUAGES.map((l) => (
            <TouchableOpacity
              key={l.value}
              style={[styles.chip, user?.language === l.value && styles.chipActive]}
              onPress={() => {
                updateUser({ language: l.value });
                Toast.show({ type: 'success', text1: `Language set to ${l.label}` });
              }}
            >
              <Text style={[styles.chipText, user?.language === l.value && styles.chipTextActive]}>
                {l.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔔 Notifications</Text>
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchLabel}>Push Notifications</Text>
            <Text style={styles.switchSub}>Sales, debts, low stock alerts</Text>
          </View>
          <Switch
            value={pushEnabled}
            onValueChange={setPushEnabled}
            trackColor={{ true: Colors.primary[400] }}
            thumbColor={Colors.white}
          />
        </View>
        <View style={styles.switchRow}>
          <View>
            <Text style={styles.switchLabel}>WhatsApp Reminders</Text>
            <Text style={styles.switchSub}>Debt due date reminders via WhatsApp</Text>
          </View>
          <Switch
            value={whatsappEnabled}
            onValueChange={setWhatsappEnabled}
            trackColor={{ true: Colors.primary[400] }}
            thumbColor={Colors.white}
          />
        </View>
      </View>

      {/* Account */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 Account</Text>
        {[
          { label: 'Edit Profile', emoji: '✏️', onPress: () => {} },
          { label: 'KYC Verification', emoji: '🪪', onPress: () => {} },
          { label: 'Change Password', emoji: '🔒', onPress: () => {} },
          { label: 'Privacy Policy', emoji: '📋', onPress: () => {} },
          { label: 'Terms of Service', emoji: '📄', onPress: () => {} },
        ].map((item) => (
          <TouchableOpacity key={item.label} style={styles.menuItem} onPress={item.onPress}>
            <Text style={styles.menuEmoji}>{item.emoji}</Text>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appName}>StreetOS AI</Text>
        <Text style={styles.appVersion}>Version 1.0.0</Text>
        <Text style={styles.appTagline}>The AI OS for Africa's Informal Economy</Text>
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
  section: { backgroundColor: Colors.white, borderRadius: 14, padding: 16, gap: 12 },
  sectionTitle: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.bold, color: Colors.gray[700] },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.gray[200], backgroundColor: Colors.bg.secondary },
  chipActive: { backgroundColor: Colors.primary[500], borderColor: Colors.primary[500] },
  chipText: { fontSize: Typography.fontSize.sm, color: Colors.gray[600] },
  chipTextActive: { color: Colors.white, fontWeight: Typography.fontWeight.semibold },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  switchLabel: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.medium, color: Colors.gray[800] },
  switchSub: { fontSize: Typography.fontSize.xs, color: Colors.gray[400], marginTop: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  menuEmoji: { fontSize: 18 },
  menuLabel: { flex: 1, fontSize: Typography.fontSize.base, color: Colors.gray[800] },
  menuArrow: { fontSize: 20, color: Colors.gray[400] },
  appInfo: { alignItems: 'center', gap: 4, paddingVertical: 8 },
  appName: { fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.bold, color: Colors.primary[500] },
  appVersion: { fontSize: Typography.fontSize.sm, color: Colors.gray[400] },
  appTagline: { fontSize: Typography.fontSize.xs, color: Colors.gray[400], textAlign: 'center' },
});
