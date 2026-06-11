import { ScrollView, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Share } from 'react-native';
import { router } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { passportService } from '../../services/services';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { formatNaira } from '../../utils/currency';

function PassportRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function PassportScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ['passport'],
    queryFn: () => passportService.get(),
  });

  const { mutate: sharePassport, isPending: isSharing } = useMutation({
    mutationFn: () => passportService.share(),
    onSuccess: async (res) => {
      const link = res.data?.data?.shareableLink;
      if (link) {
        await Share.share({ message: `View my StreetOS Business Passport: ${link}` });
      }
    },
    onError: () => Toast.show({ type: 'error', text1: 'Could not generate share link' }),
  });

  const passport = data?.data?.data;

  const verificationColor = {
    basic: Colors.warning, standard: Colors.info, verified: Colors.success,
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Business Passport</Text>
        <View style={{ width: 60 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color={Colors.primary[500]} size="large" />
      ) : passport ? (
        <>
          {/* Passport Card */}
          <View style={styles.passportCard}>
            <View style={styles.passportTop}>
              <View>
                <Text style={styles.passportId}>{passport.passportId}</Text>
                <Text style={styles.passportTagline}>Business Identity Passport</Text>
              </View>
              <View style={[styles.verBadge, {
                backgroundColor: (verificationColor[passport.verificationLevel as keyof typeof verificationColor] || Colors.gray[400]) + '20',
              }]}>
                <Text style={[styles.verText, {
                  color: verificationColor[passport.verificationLevel as keyof typeof verificationColor] || Colors.gray[400],
                }]}>
                  {passport.verificationLevel?.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.passportBody}>
              <PassportRow label="Business Name" value={passport.businessName || '—'} />
              <PassportRow label="Owner" value={passport.ownerName || '—'} />
              <PassportRow label="Type" value={passport.businessType || '—'} />
              <PassportRow label="Location" value={passport.location || '—'} />
              <PassportRow label="Registered" value={passport.registeredAt ? new Date(passport.registeredAt).toLocaleDateString() : '—'} />
            </View>
          </View>

          {/* Scores */}
          <View style={styles.scoresRow}>
            {[
              { label: 'Health', value: passport.healthScore, max: 100, color: Colors.success },
              { label: 'Credit', value: passport.creditScore, max: 850, color: Colors.primary[400] },
              { label: 'Trust', value: passport.trustScore, max: 100, color: Colors.info },
            ].map((s) => (
              <View key={s.label} style={styles.scoreBox}>
                <Text style={[styles.scoreVal, { color: s.color }]}>{s.value || 0}</Text>
                <Text style={styles.scoreMax}>/{s.max}</Text>
                <Text style={styles.scoreLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Revenue Trend */}
          {passport.monthlyRevenue?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Revenue Trend (Last 6 Months)</Text>
              <View style={styles.trendRow}>
                {passport.monthlyRevenue.slice(-6).map((m: any) => (
                  <View key={m.month} style={styles.trendItem}>
                    <Text style={styles.trendAmount}>{formatNaira(m.amount, true)}</Text>
                    <Text style={styles.trendMonth}>{m.month?.slice(5)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Actions */}
          <TouchableOpacity style={styles.shareBtn} onPress={() => sharePassport()} disabled={isSharing}>
            {isSharing ? <ActivityIndicator color={Colors.white} /> : (
              <>
                <Text style={styles.shareBtnEmoji}>🔗</Text>
                <Text style={styles.shareBtnText}>Share Passport</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.pdfBtn} onPress={() => passportService.generatePDF()}>
            <Text style={styles.pdfBtnEmoji}>📄</Text>
            <Text style={styles.pdfBtnText}>Download PDF</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🪪</Text>
          <Text style={styles.emptyText}>
            Your Business Passport will be generated after you complete your profile and record transactions.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  content: { padding: 20, paddingTop: 56, paddingBottom: 48, gap: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  back: { fontSize: Typography.fontSize.md, color: Colors.primary[500], fontWeight: Typography.fontWeight.semibold },
  title: { fontSize: Typography.fontSize.lg, fontWeight: Typography.fontWeight.bold, color: Colors.gray[900] },
  passportCard: {
    backgroundColor: Colors.primary[500], borderRadius: 20, padding: 20,
    shadowColor: Colors.primary[500], shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  passportTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  passportId: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.extrabold, color: Colors.white, letterSpacing: 2 },
  passportTagline: { fontSize: Typography.fontSize.xs, color: Colors.primary[200], marginTop: 2 },
  verBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  verText: { fontSize: Typography.fontSize.xs, fontWeight: Typography.fontWeight.extrabold, letterSpacing: 1 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 16 },
  passportBody: { gap: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontSize: Typography.fontSize.sm, color: Colors.primary[200] },
  rowValue: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.semibold, color: Colors.white },
  scoresRow: {
    flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 16, padding: 16,
    justifyContent: 'space-around',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  scoreBox: { alignItems: 'center', gap: 4 },
  scoreVal: { fontSize: Typography.fontSize['2xl'], fontWeight: Typography.fontWeight.extrabold },
  scoreMax: { fontSize: Typography.fontSize.xs, color: Colors.gray[400], marginTop: -4 },
  scoreLabel: { fontSize: Typography.fontSize.xs, color: Colors.gray[500], fontWeight: Typography.fontWeight.medium },
  section: { backgroundColor: Colors.white, borderRadius: 14, padding: 16, gap: 12 },
  sectionTitle: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.bold, color: Colors.gray[800] },
  trendRow: { flexDirection: 'row', justifyContent: 'space-between' },
  trendItem: { alignItems: 'center', gap: 4 },
  trendAmount: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.bold, color: Colors.primary[500] },
  trendMonth: { fontSize: Typography.fontSize.xs, color: Colors.gray[400] },
  shareBtn: {
    flexDirection: 'row', backgroundColor: Colors.primary[500], borderRadius: 16,
    paddingVertical: 16, alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  shareBtnEmoji: { fontSize: 20 },
  shareBtnText: { color: Colors.white, fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold },
  pdfBtn: {
    flexDirection: 'row', backgroundColor: Colors.white, borderRadius: 16,
    paddingVertical: 14, alignItems: 'center', justifyContent: 'center', gap: 8,
    borderWidth: 1.5, borderColor: Colors.gray[200],
  },
  pdfBtnEmoji: { fontSize: 20 },
  pdfBtnText: { color: Colors.gray[700], fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.semibold },
  empty: { alignItems: 'center', paddingTop: 60, gap: 16 },
  emptyEmoji: { fontSize: 64 },
  emptyText: { fontSize: Typography.fontSize.base, color: Colors.gray[500], textAlign: 'center', lineHeight: 24, paddingHorizontal: 16 },
});
