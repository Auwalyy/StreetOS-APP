import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

export interface OfflineTransaction {
  localId: string;
  type: string;
  amount: number;
  quantity?: number;
  productName?: string;
  customerName?: string;
  paymentMethod: string;
  source: string;
  createdAt: string;
  synced: boolean;
}

interface OfflineState {
  pendingTransactions: OfflineTransaction[];
  pendingDebtPayments: { localId: string; debtId: string; amount: number; method: string; synced: boolean }[];
  lastSyncedAt: string | null;
  syncStatus: 'idle' | 'syncing' | 'error';
  addPendingTransaction: (data: Omit<OfflineTransaction, 'localId' | 'synced' | 'createdAt'>) => void;
  markSynced: (localId: string) => void;
  setSyncStatus: (status: 'idle' | 'syncing' | 'error') => void;
  setLastSyncedAt: (date: string) => void;
  getPendingCount: () => number;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      pendingTransactions: [],
      pendingDebtPayments: [],
      lastSyncedAt: null,
      syncStatus: 'idle',

      addPendingTransaction: (data) =>
        set((state) => ({
          pendingTransactions: [
            ...state.pendingTransactions,
            { ...data, localId: uuidv4(), synced: false, createdAt: new Date().toISOString() },
          ],
        })),

      markSynced: (localId) =>
        set((state) => ({
          pendingTransactions: state.pendingTransactions.filter((t) => t.localId !== localId),
        })),

      setSyncStatus: (status) => set({ syncStatus: status }),
      setLastSyncedAt: (date) => set({ lastSyncedAt: date }),
      getPendingCount: () => get().pendingTransactions.filter((t) => !t.synced).length,
    }),
    {
      name: 'offline-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
