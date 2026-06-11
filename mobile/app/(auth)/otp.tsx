import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

export default function OTPScreen() {
  const { phone, mode } = useLocalSearchParams<{ phone: string; mode: string }>();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<TextInput[]>([]);
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    const timer = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (val: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    if (val && index < 5) inputRefs.current[index + 1]?.focus();
    if (!val && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      Toast.show({ type: 'error', text1: 'Enter the 6-digit code' });
      return;
    }
    setLoading(true);
    try {
      const { data } = await authService.verifyOTP(phone, code);
      setAuth(data.data.user, data.data.accessToken, data.data.refreshToken);
      router.replace('/(app)/(tabs)/');
    } catch (e: any) {
      Toast.show({ type: 'error', text1: e.response?.data?.message || 'Invalid OTP' });
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    try {
      await authService.resendOTP(phone);
      setCountdown(60);
      Toast.show({ type: 'success', text1: 'OTP resent!' });
    } catch {
      Toast.show({ type: 'error', text1: 'Could not resend OTP' });
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.emoji}>📱</Text>
        <Text style={styles.title}>Verify Your Number</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to{'\n'}
          <Text style={styles.phone}>{phone}</Text>
        </Text>

        <View style={styles.otpRow}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={(r) => { if (r) inputRefs.current[i] = r; }}
              style={[styles.otpInput, digit && styles.otpInputFilled]}
              value={digit}
              onChangeText={(v) => handleChange(v.replace(/\D/g, '').slice(-1), i)}
              keyboardType="number-pad"
              maxLength={1}
              autoFocus={i === 0}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleVerify} disabled={loading}>
          {loading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.btnText}>Verify</Text>}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResend} disabled={countdown > 0}>
          <Text style={[styles.resend, countdown > 0 && styles.resendDisabled]}>
            {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend Code'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white, paddingHorizontal: 24 },
  back: { paddingTop: 56, paddingBottom: 8 },
  backText: { fontSize: Typography.fontSize.md, color: Colors.primary[500], fontWeight: Typography.fontWeight.semibold },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
  emoji: { fontSize: 64 },
  title: { fontSize: Typography.fontSize['2xl'], fontWeight: Typography.fontWeight.extrabold, color: Colors.gray[900] },
  subtitle: { fontSize: Typography.fontSize.base, color: Colors.gray[500], textAlign: 'center', lineHeight: 22 },
  phone: { color: Colors.primary[500], fontWeight: Typography.fontWeight.bold },
  otpRow: { flexDirection: 'row', gap: 12, marginVertical: 8 },
  otpInput: {
    width: 48, height: 56, borderRadius: 12, borderWidth: 2,
    borderColor: Colors.gray[200], textAlign: 'center',
    fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.bold,
    backgroundColor: Colors.bg.secondary,
  },
  otpInputFilled: { borderColor: Colors.primary[500], backgroundColor: Colors.primary[100] },
  btn: {
    backgroundColor: Colors.primary[500], borderRadius: 16,
    paddingVertical: 16, width: '100%', alignItems: 'center',
  },
  btnText: { color: Colors.white, fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold },
  resend: { fontSize: Typography.fontSize.base, color: Colors.primary[500], fontWeight: Typography.fontWeight.semibold },
  resendDisabled: { color: Colors.gray[400] },
});
