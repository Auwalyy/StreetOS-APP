import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import Toast from 'react-native-toast-message';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleLogin = async () => {
    if (!phone || !password) {
      Toast.show({ type: 'error', text1: 'Enter your phone and password' });
      return;
    }
    setLoading(true);
    try {
      const { data } = await authService.login(phone, password);
      setAuth(data.data.user, data.data.accessToken, data.data.refreshToken);
      // Register FCM token for push notifications
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status === 'granted') {
          const token = await Notifications.getExpoPushTokenAsync();
          await authService.updateFCMToken(token.data);
        }
      } catch { /* non-critical */ }
      router.replace('/(app)/(tabs)/');
    } catch (e: any) {
      Toast.show({ type: 'error', text1: e.response?.data?.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>S</Text>
          </View>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your StreetOS account</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputWrap}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input} value={phone} onChangeText={setPhone}
              placeholder="+2348012345678" keyboardType="phone-pad" autoCapitalize="none"
            />
          </View>

          <View style={styles.inputWrap}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input} value={password} onChangeText={setPassword}
              placeholder="Your password" secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.btnText}>Sign In</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.link}>
            <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkBold}>Register</Text></Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white, paddingHorizontal: 24 },
  header: { alignItems: 'center', paddingTop: 80, paddingBottom: 40, gap: 12 },
  logoBox: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: Colors.primary[500], alignItems: 'center', justifyContent: 'center',
  },
  logoText: { fontSize: 36, fontWeight: '800', color: Colors.white },
  title: { fontSize: Typography.fontSize['3xl'], fontWeight: Typography.fontWeight.extrabold, color: Colors.gray[900] },
  subtitle: { fontSize: Typography.fontSize.base, color: Colors.gray[500] },
  form: { gap: 16 },
  inputWrap: { gap: 6 },
  label: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.semibold, color: Colors.gray[700] },
  input: {
    borderWidth: 1.5, borderColor: Colors.gray[200], borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14, fontSize: Typography.fontSize.base,
    backgroundColor: Colors.bg.secondary,
  },
  btn: {
    backgroundColor: Colors.primary[500], borderRadius: 16,
    paddingVertical: 16, alignItems: 'center', marginTop: 8,
  },
  btnText: { color: Colors.white, fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold },
  link: { alignItems: 'center' },
  linkText: { fontSize: Typography.fontSize.base, color: Colors.gray[500] },
  linkBold: { color: Colors.primary[500], fontWeight: Typography.fontWeight.bold },
});
