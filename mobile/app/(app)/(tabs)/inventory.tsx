import { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
  Modal, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { inventoryService } from '../../../services/services';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { formatNaira } from '../../../utils/currency';

function InventoryCard({ item, onAdjust }: { item: any; onAdjust: (item: any) => void }) {
  const isLow = item.quantity <= item.lowStockThreshold;
  return (
    <View style={[styles.card, isLow && styles.cardLow]}>
      <View style={styles.cardTop}>
        <View>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemCategory}>{item.category || 'General'}</Text>
        </View>
        {isLow && <View style={styles.lowBadge}><Text style={styles.lowText}>Low Stock</Text></View>}
      </View>
      <View style={styles.cardStats}>
        <View style={styles.stat}>
          <Text style={styles.statVal}>{item.quantity}</Text>
          <Text style={styles.statLabel}>{item.unit || 'units'}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statVal}>{formatNaira(item.sellingPrice, true)}</Text>
          <Text style={styles.statLabel}>Sell Price</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statVal}>{formatNaira(item.costPrice * item.quantity, true)}</Text>
          <Text style={styles.statLabel}>Stock Value</Text>
        </View>
        <TouchableOpacity style={styles.adjustBtn} onPress={() => onAdjust(item)}>
          <Text style={styles.adjustText}>Adjust</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function AddItemModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: '', category: '', quantity: '', unit: 'pieces',
    costPrice: '', sellingPrice: '', lowStockThreshold: '5',
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const { mutate, isPending } = useMutation({
    mutationFn: () => inventoryService.create({
      ...form,
      quantity: parseFloat(form.quantity),
      costPrice: parseFloat(form.costPrice),
      sellingPrice: parseFloat(form.sellingPrice),
      lowStockThreshold: parseInt(form.lowStockThreshold),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['inventory'] });
      Toast.show({ type: 'success', text1: 'Item added!' });
      onClose();
    },
    onError: (e: any) => Toast.show({ type: 'error', text1: e.response?.data?.message || 'Failed' }),
  });

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="formSheet">
      <View style={styles.modal}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Add Inventory Item</Text>
          <TouchableOpacity onPress={onClose}><Text style={styles.modalClose}>✕</Text></TouchableOpacity>
        </View>
        {[
          { label: 'Item Name *', key: 'name', placeholder: 'Rice, Tomatoes...' },
          { label: 'Category', key: 'category', placeholder: 'Food, Electronics...' },
          { label: 'Quantity *', key: 'quantity', placeholder: '100', keyboard: 'numeric' as any },
          { label: 'Unit', key: 'unit', placeholder: 'bags, pieces, litres...' },
          { label: 'Cost Price (₦)', key: 'costPrice', placeholder: '5000', keyboard: 'numeric' as any },
          { label: 'Selling Price (₦)', key: 'sellingPrice', placeholder: '7000', keyboard: 'numeric' as any },
          { label: 'Low Stock Alert At', key: 'lowStockThreshold', placeholder: '5', keyboard: 'numeric' as any },
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
          {isPending ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.btnText}>Add Item</Text>}
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

export default function InventoryScreen() {
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => inventoryService.list(),
  });

  const items = (data?.data?.data?.items || []).filter((i: any) =>
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventory</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput} value={search} onChangeText={setSearch}
          placeholder="Search items..." placeholderTextColor={Colors.gray[400]}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary[500]} size="large" />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i._id}
          renderItem={({ item }) => <InventoryCard item={item} onAdjust={() => {}} />}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>📦</Text>
              <Text style={styles.emptyText}>No inventory items yet.</Text>
            </View>
          }
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary[500]} />}
        />
      )}

      <AddItemModal visible={showAdd} onClose={() => setShowAdd(false)} />
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
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white,
    marginHorizontal: 16, borderRadius: 12, paddingHorizontal: 14, marginBottom: 4,
    borderWidth: 1.5, borderColor: Colors.gray[200],
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: Typography.fontSize.base, color: Colors.gray[800] },
  card: {
    backgroundColor: Colors.white, borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardLow: { borderLeftWidth: 4, borderLeftColor: Colors.warning },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  itemName: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold, color: Colors.gray[900] },
  itemCategory: { fontSize: Typography.fontSize.xs, color: Colors.gray[400], marginTop: 2 },
  lowBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  lowText: { fontSize: Typography.fontSize.xs, color: Colors.warning, fontWeight: Typography.fontWeight.bold },
  cardStats: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stat: { alignItems: 'center' },
  statVal: { fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.extrabold, color: Colors.gray[800] },
  statLabel: { fontSize: Typography.fontSize.xs, color: Colors.gray[400], marginTop: 2 },
  adjustBtn: { backgroundColor: Colors.primary[100], paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10 },
  adjustText: { fontSize: Typography.fontSize.sm, color: Colors.primary[500], fontWeight: Typography.fontWeight.semibold },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { color: Colors.gray[400], fontSize: Typography.fontSize.base },
  modal: { flex: 1, padding: 24, gap: 14, backgroundColor: Colors.white },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12 },
  modalTitle: { fontSize: Typography.fontSize.xl, fontWeight: Typography.fontWeight.bold, color: Colors.gray[900] },
  modalClose: { fontSize: 20, color: Colors.gray[500] },
  inputWrap: { gap: 6 },
  label: { fontSize: Typography.fontSize.sm, fontWeight: Typography.fontWeight.semibold, color: Colors.gray[700] },
  input: {
    borderWidth: 1.5, borderColor: Colors.gray[200], borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: Typography.fontSize.base, backgroundColor: Colors.bg.secondary,
  },
  btn: { backgroundColor: Colors.primary[500], borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: Colors.white, fontSize: Typography.fontSize.md, fontWeight: Typography.fontWeight.bold },
});
