import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { authService } from '../../services/auth.service';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

const BUSINESS_TYPES = ['trader', 'artisan', 'food_vendor', 'transport', 'other'];
const LANGUAGES = [
  { label: 'English', value: 'en' },
  { label: 'Hausa', value: 'ha' },
  { label: 'Yoruba', value: 'yo' },
  { label: 'Igbo', value: 'ig' },
  { label: 'Pidgin', value: 'pcm' },
];

export default function RegisterScreen() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', password: '',
    businessName: '', businessType: 'trader', language: 'en',
  });
  const [loading, setLoading] = useState(false);

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    if (!form.firstName || !form.lastName || !form.phone || !form.password) {
      Toast.show({ type: 'error', text1: 'Fill all required fields' });
      return;
    }
    if (form.password.length < 8) {
      Toast.show({ type: 'error', text1: 'Password must be at least 8 characters' });
      return;
    }
    setLoading(true);
    try {
      await authService.register(form);
      router.push({ pathname: '/(auth)/otp', params: { phone: form.phone, mode: 'register' } });
    } catch (e: any) {
      Toast.show({ type: 'error', text1: e.response?.data?.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join millions of African traders building their digital identity.</Text>

        <View style={styles.row}>
          <View style={[styles.inputWrap, { flex: 1 }]}>
            <Text style={styles.label}>First Name *</Text>
            <TextInput style={styles.input} value={form.firstName} onChangeText={(v) => set('firstName', v)} placeholder="Amina" />
          </View>
          <View style={[styles.inputWrap, { flex: 1 }]}>
            <Text style={styles.label}>Last Name *</Text>
            <TextInput style={styles.input} value={form.lastName} onChangeText={(v) => set('lastName', v)} placeholder="Musa" />
          </View>
        </View>

        <View style={styles.inputWrap}>
          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={styles.input} value={form.phone} onChangeText={(v) => set('phone', v)}
            placeholder="+2348012345678" keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputWrap}>
          <Text style={styles.label}>Password *</Text>
          <TextInput
            style={styles.input} value={form.password} onChangeText={(v) => set('password', v)}
            placeholder="Min. 8 characters" secureTextEntry
          />
        </View>

        <View style={styles.inputWrap}>
          <Text style={styles.label}>Business Name</Text>
          <TextInput
            style={styles.input} value={form.businessName} onChangeText={(v) => set('businessName', v)}
            placeholder="Amina Provisions"
          />
        </View>

        <View style={styles.inputWrap}>
          <Text style={styles.label}>Business Type</Text>
          <View style={styles.chips}>
            {BUSINESS_TYPES.map((t) => (
              <TouchableOpacity
                key={t} onPress={() => set('businessType', t)}
                style={[styles.chip, form.businessType === t && styles.chipActive]}
              >
                <Text style={[styles.chipText, form.businessType === t && styles.chipTextActive]}>
                  {t.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputWrap}>
          <Text style={styles.label}>Preferred Language</Text>
          <View style={styles.chips}>
            {LANGUAGES.map((l) => (
              <TouchableOpacity
                key={l.value} onPress={() => set('language', l.value)}
                style={[styles.chip, form.language === l.value && styles.chipActive]}
              >
                <Text style={[styles.chipText, form.language === l.value && styles.chipTextActive]}>
                  {l.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.btnText}>Create Account</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={styles.loginLink}>
          <Text style={styles.loginText}>Already have an account? <Text style={styles.loginBold}>Sign In</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  content: { padding: 24, paddingTop: 60, gap: 16 },
  title: { fontSize: Typography.fontSize['3xl'], fontWeight: Typography.fontWeight.extrabold, color: Colors.primary[500] },
  subtitle: { fontSize: Typography.fontSize.base, color: Colors.gray[500], marginBottom: 8 },
  row: { flexDirection: 'row', gap: 12 },
  inputWrap: { gap: 6 },
  label: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.semibold, color: Colors.gray[700] },
  input: {
    borderWidth: 1.5, borderColor: Colors.gray[200], borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: Typography.fontSize.base,
    backgroundColor: Colors.bg.secondary,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: Colors.gray[200], backgroundColor: Colors.bg.secondary,
  },
  chipActive: { backgroundColor: Colors.primary[500], borderColor: Colors.primary[500] },
  chipText: { fontSize: Typography.fontSize.sm, color: Colors.gray[600], textTransform: 'capitalize' },
  chipTextActive: { color: Colors.white, fontWeight: Typography.fontWeight.semibold },
  btn: {
    backgroundColor: Colors.primary[500], borderRadius: 16,
    paddingVertical: 16, alignItems: 'center', marginTop: 8,
  },
  btnText: { color: Colors.white, fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold },
  loginLink: { alignItems: 'center', paddingBottom: 24 },
  loginText: { fontSize: Typography.fontSize.base, color: Colors.gray[500] },
  loginBold: { color: Colors.primary[500], fontWeight: Typography.fontWeight.bold },
});
