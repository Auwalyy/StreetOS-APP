import NetInfo from '@react-native-community/netinfo';
import { useOfflineStore } from '../store/offlineStore';
import { transactionService } from './transaction.service';

export const syncService = {
  async syncPendingTransactions(): Promise<void> {
    const store = useOfflineStore.getState();
    const pending = store.pendingTransactions.filter((t) => !t.synced);
    if (pending.length === 0) return;

    store.setSyncStatus('syncing');
    try {
      const results = await transactionService.sync(pending);
      const synced: string[] = results.data?.data
        ?.filter((r: { status: string; id: string }) => r.status === 'synced')
        .map((r: { id: string }) => r.id) || [];

      synced.forEach((id) => store.markSynced(id));
      store.setLastSyncedAt(new Date().toISOString());
      store.setSyncStatus('idle');
    } catch {
      store.setSyncStatus('error');
    }
  },

  startListener(): () => void {
    return NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable) {
        syncService.syncPendingTransactions();
      }
    });
  },
};
