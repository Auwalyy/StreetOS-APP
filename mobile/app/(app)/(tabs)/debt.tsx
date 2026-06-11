import { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
  Modal, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { debtService } from '../../../services/services';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { formatNaira } from '../../../utils/currency';

const STATUS_COLOR: Record<string, string> = {
  pending: Colors.warning, partial: Colors.info, settled: Colors.success,
  overdue: Colors.error, disputed: Colors.gray[500],
};

function DebtCard({ item, onPayment }: { item: any; onPayment: (item: any) => void }) {
  const isOverdue = item.status === 'pending' && new Date(item.dueDate) < new Date();
  const status = isOverdue ? 'overdue' : item.status;
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.customerName}>{item.customerName}</Text>
          {item.productName ? <Text style={styles.productName}>{item.productName}</Text> : null}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[status] + '20' }]}>
          <Text style={[styles.statusText, { color: STATUS_COLOR[status] }]}>{status}</Text>
        </View>
      </View>
      <View style={styles.amounts}>
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>Total</Text>
          <Text style={styles.amountVal}>{formatNaira(item.amount)}</Text>
        </View>
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>Paid</Text>
          <Text style={[styles.amountVal, { color: Colors.success }]}>{formatNaira(item.amountPaid)}</Text>
        </View>
        <View style={styles.amountItem}>
          <Text style={styles.amountLabel}>Balance</Text>
          <Text style={[styles.amountVal, { color: Colors.error }]}>{formatNaira(item.balance)}</Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.dueDate}>Due: {new Date(item.dueDate).toLocaleDateString()}</Text>
        {item.status !== 'settled' && (
          <TouchableOpacity style={styles.payBtn} onPress={() => onPayment(item)}>
            <Text style={styles.payBtnText}>Record Payment</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function AddDebtModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ customerName: '', amount: '', productName: '', dueDate: '' });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const { mutate, isPending } = useMutation({
    mutationFn: () => debtService.create({
      ...form, amount: parseFloat(form.amount),
      dueDate: new Date(form.dueDate).toISOString(),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['debts'] });
      Toast.show({ type: 'success', text1: 'Debt recorded!' });
      onClose();
    },
    onError: (e: any) => Toast.show({ type: 'error', text1: e.response?.data?.message || 'Failed' }),
  });

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet">
      <View style={styles.modal}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Record Debt</Text>
          <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
        </View>
        {[
          { label: 'Customer Name *', key: 'customerName', placeholder: 'Musa, Aisha...' },
          { label: 'Amount (₦) *', key: 'amount', placeholder: '20000', keyboard: 'numeric' as any },
          { label: 'Product / Description', key: 'productName', placeholder: 'Rice, Shoes...' },
          { label: 'Due Date *', key: 'dueDate', placeholder: '2024-12-31' },
        ].map((f) => (
          <View key={f.key} style={styles.inputWrap}>
            <Text style={styles.label}>{f.label}</Text>
            <TextInput
              style={styles.input} value={(form as any)[f.key]}
              onChangeText={(v) => set(f.key, v)} placeholder={f.placeholder}
              keyboardType={f.keyboard || 'default'}
            />
          </View>
        ))}
        <TouchableOpacity style={styles.btn} onPress={() => mutate()} disabled={isPending}>
          {isPending ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.btnText}>Save Debt</Text>}
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

function PaymentModal({ debt, onClose }: { debt: any; onClose: () => void }) {
  const qc = useQueryClient();
  const [amount, setAmount] = useState('');
  const { mutate, isPending } = useMutation({
    mutationFn: () => debtService.recordPayment(debt._id, parseFloat(amount)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['debts'] });
      Toast.show({ type: 'success', text1: 'Payment recorded!' });
      onClose();
    },
    onError: (e: any) => Toast.show({ type: 'error', text1: e.response?.data?.message || 'Failed' }),
  });

  return (
    <Modal visible={!!debt} animationType="slide" presentationStyle="formSheet">
      <View style={styles.modal}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Record Payment</Text>
          <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
        </View>
        <Text style={styles.payInfo}>
          Balance: <Text style={{ color: Colors.error, fontWeight: '700' }}>{formatNaira(debt?.balance || 0)}</Text>
        </Text>
        <View style={styles.inputWrap}>
          <Text style={styles.label}>Payment Amount (₦) *</Text>
          <TextInput
            style={styles.input} value={amount} onChangeText={setAmount}
            placeholder="Enter amount" keyboardType="numeric" autoFocus
          />
        </View>
        <TouchableOpacity style={styles.btn} onPress={() => mutate()} disabled={isPending}>
          {isPending ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.btnText}>Record Payment</Text>}
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

export default function DebtScreen() {
  const [showAdd, setShowAdd] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('pending');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['debts', statusFilter],
    queryFn: () => debtService.list({ status: statusFilter }),
  });

  const debts = data?.data?.data?.debts || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Debt Book</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        {['pending', 'partial', 'overdue', 'settled'].map((s) => (
          <TouchableOpacity key={s} onPress={() => setStatusFilter(s)}
            style={[styles.filterBtn, statusFilter === s && styles.filterBtnActive]}>
            <Text style={[styles.filterText, statusFilter === s && styles.filterTextActive]}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary[500]} size="large" />
      ) : (
        <FlatList
          data={debts}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => <DebtCard item={item} onPayment={setSelectedDebt} />}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📒</Text>
              <Text style={styles.emptyText}>No debts found.</Text>
            </View>
          }
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary[500]} />}
        />
      )}

      <AddDebtModal visible={showAdd} onClose={() => setShowAdd(false)} />
      {selectedDebt && <PaymentModal debt={selectedDebt} onClose={() => setSelectedDebt(null)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg.primary },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12,
  },
  title: { fontSize: Typography.fontSize['2xl'], fontWeight: Typography.fontWeight.extrabold, color: Colors.gray[900] },
  addBtn: { backgroundColor: Colors.primary[500], paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: Colors.white, fontWeight: Typography.fontWeight.bold, fontSize: Typography.fontSize.sm },
  filters: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 4 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: Colors.gray[100] },
  filterBtnActive: { backgroundColor: Colors.primary[500] },
  filterText: { fontSize: Typography.fontSize.sm, color: Colors.gray[600], fontWeight: Typography.fontWeight.medium },
  filterTextActive: { color: Colors.white, fontWeight: Typography.fontWeight.bold },
  card: {
    backgroundColor: Colors.white, borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  customerName: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold, color: Colors.gray[900] },
  productName: { fontSize: Typography.fontSize.sm, color: Colors.gray[500], marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: Typography.fontSize.xs, fontWeight: Typography.fontWeight.bold, textTransform: 'capitalize' },
  amounts: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  amountItem: { alignItems: 'center' },
  amountLabel: { fontSize: Typography.fontSize.xs, color: Colors.gray[400] },
  amountVal: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.extrabold, color: Colors.gray[800] },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dueDate: { fontSize: Typography.fontSize.xs, color: Colors.gray[500] },
  payBtn: { backgroundColor: Colors.primary[500], paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  payBtnText: { fontSize: Typography.fontSize.sm, color: Colors.white, fontWeight: Typography.fontWeight.semibold },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { color: Colors.gray[400], fontSize: Typography.fontSize.base },
  modal: { flex: 1, padding: 24, gap: 14, backgroundColor: Colors.white },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12 },
  modalTitle: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.bold, color: Colors.gray[900] },
  modalClose: { fontSize: 20, color: Colors.gray[500] },
  payInfo: { fontSize: Typography.fontSize.base, color: Colors.gray[700] },
  inputWrap: { gap: 6 },
  label: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.semibold, color: Colors.gray[700] },
  input: {
    borderWidth: 1.5, borderColor: Colors.gray[200], borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: Typography.fontSize.base, backgroundColor: Colors.bg.secondary,
  },
  btn: { backgroundColor: Colors.primary[500], borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: Colors.white, fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold },
});
