import { useEffect } from 'react';
import { syncService } from '../services/sync.service';
import { useOfflineStore } from '../store/offlineStore';

export const useOfflineSync = () => {
  const { syncStatus, pendingTransactions, lastSyncedAt } = useOfflineStore();
  const pendingCount = pendingTransactions.filter((t) => !t.synced).length;

  useEffect(() => {
    const unsubscribe = syncService.startListener();
    return unsubscribe;
  }, []);

  const syncNow = () => syncService.syncPendingTransactions();

  return { syncStatus, pendingCount, lastSyncedAt, syncNow };
};
