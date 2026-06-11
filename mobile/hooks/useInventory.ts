import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '../services/services';

export const useInventory = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['inventory', params],
    queryFn: () => inventoryService.list(params).then((r) => r.data.data),
  });

export const useLowStock = () =>
  useQuery({
    queryKey: ['inventory-low-stock'],
    queryFn: () => inventoryService.getLowStock().then((r) => r.data.data),
  });

export const useInventoryForecast = () =>
  useQuery({
    queryKey: ['inventory-forecast'],
    queryFn: () => inventoryService.getForecast().then((r) => r.data.data),
  });

export const useCreateInventoryItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => inventoryService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory'] }),
  });
};

export const useUpdateInventoryItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      inventoryService.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['inventory'] }),
  });
};
