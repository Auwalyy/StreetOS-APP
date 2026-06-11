import { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Modal, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { transactionService } from '../../../services/transaction.service';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { formatNaira } from '../../../utils/currency';

const TYPES = ['all', 'sale', 'purchase', 'expense', 'income'];

const TYPE_EMOJI: Record<string, string> = {
  sale: '💰', purchase: '🛒', expense: '💸', income: '📥', transfer: '↔️',
};

function TransactionItem({ item }: { item: any }) {
  const isSale = item.type === 'sale' || item.type === 'income';
  return (
    <View style={styles.txCard}>
      <View style={styles.txLeft}>
        <View style={[styles.txIcon, { backgroundColor: isSale ? Colors.primary[100] : '#FEE2E2' }]}>
          <Text style={{ fontSize: 20 }}>{TYPE_EMOJI[item.type] || '💳'}</Text>
        </View>
        <View>
          <Text style={styles.txName}>{item.productName || item.type}</Text>
          {item.customerName ? <Text style={styles.txSub}>{item.customerName}</Text> : null}
          <Text style={styles.txDate}>{new Date(item.createdAt).toLocaleString()}</Text>
        </View>
      </View>
      <View style={styles.txRight}>
        <Text style={[styles.txAmount, { color: isSale ? Colors.success : Colors.error }]}>
          {isSale ? '+' : '-'}{formatNaira(item.amount)}
        </Text>
        {item.source === 'voice' && <Text style={styles.sourceTag}>🎤 Voice</Text>}
      </View>
    </View>
  );
}

function AddTransactionModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({ type: 'sale', productName: '', amount: '', quantity: '', paymentMethod: 'cash' });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const { mutate, isPending } = useMutation({
    mutationFn: () => transactionService.create({
      ...form, amount: parseFloat(form.amount), quantity: parseFloat(form.quantity) || 1,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      Toast.show({ type: 'success', text1: 'Transaction saved!' });
      onClose();
    },
    onError: (e: any) => Toast.show({ type: 'error', text1: e.response?.data?.message || 'Failed' }),
  });

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet">
      <View style={styles.modal}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add Transaction</Text>
          <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
        </View>

        <View style={styles.chips}>
          {['sale', 'purchase', 'expense', 'income'].map((t) => (
            <TouchableOpacity key={t} onPress={() => set('type', t)}
              style={[styles.chip, form.type === t && styles.chipActive]}>
              <Text style={[styles.chipText, form.type === t && styles.chipTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {[
          { label: 'Product / Description', key: 'productName', placeholder: 'Rice, Transport...' },
          { label: 'Amount (₦) *', key: 'amount', placeholder: '5000', keyboard: 'numeric' as any },
          { label: 'Quantity', key: 'quantity', placeholder: '1', keyboard: 'numeric' as any },
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
          {isPending ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.btnText}>Save Transaction</Text>}
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

export default function TransactionsScreen() {
  const [filter, setFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['transactions', filter],
    queryFn: () => transactionService.list({ type: filter === 'all' ? undefined : filter, limit: 50 }),
  });

  const transactions = data?.data?.data?.transactions || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        {TYPES.map((t) => (
          <TouchableOpacity key={t} onPress={() => setFilter(t)}
            style={[styles.filterBtn, filter === t && styles.filterBtnActive]}>
            <Text style={[styles.filterText, filter === t && styles.filterTextActive]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary[500]} size="large" />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => <TransactionItem item={item} />}
          contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No transactions found.</Text>
            </View>
          }
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary[500]} />}
        />
      )}

      <AddTransactionModal visible={showAdd} onClose={() => setShowAdd(false)} />
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
  txCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.white, borderRadius: 14, padding: 14,
  },
  txLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  txIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  txName: { fontSize: Typography.fontSize.base, fontWeight: Typography.fontWeight.semibold, color: Colors.gray[800] },
  txSub: { fontSize: Typography.fontSize.xs, color: Colors.gray[500] },
  txDate: { fontSize: Typography.fontSize.xs, color: Colors.gray[400], marginTop: 2 },
  txRight: { alignItems: 'flex-end', gap: 4 },
  txAmount: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold },
  sourceTag: { fontSize: Typography.fontSize.xs, color: Colors.gray[400] },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { color: Colors.gray[400], fontSize: Typography.fontSize.base },
  modal: { flex: 1, padding: 24, gap: 14, backgroundColor: Colors.white },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12 },
  modalTitle: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.bold, color: Colors.gray[900] },
  modalClose: { fontSize: 20, color: Colors.gray[500] },
  chips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.gray[200] },
  chipActive: { backgroundColor: Colors.primary[500], borderColor: Colors.primary[500] },
  chipText: { fontSize: Typography.fontSize.sm, color: Colors.gray[600], textTransform: 'capitalize' },
  chipTextActive: { color: Colors.white, fontWeight: Typography.fontWeight.semibold },
  inputWrap: { gap: 6 },
  label: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.semibold, color: Colors.gray[700] },
  input: {
    borderWidth: 1.5, borderColor: Colors.gray[200], borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: Typography.fontSize.base,
    backgroundColor: Colors.bg.secondary,
  },
  btn: { backgroundColor: Colors.primary[500], borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: Colors.white, fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold },
});
