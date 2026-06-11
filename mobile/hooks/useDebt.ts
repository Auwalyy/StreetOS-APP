import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debtService } from '../services/services';

export const useDebts = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['debts', params],
    queryFn: () => debtService.list(params).then((r) => r.data.data),
  });

export const useDebtSummary = () =>
  useQuery({
    queryKey: ['debt-summary'],
    queryFn: () => debtService.getSummary().then((r) => r.data.data),
  });

export const useCreateDebt = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => debtService.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['debts'] });
      qc.invalidateQueries({ queryKey: ['debt-summary'] });
    },
  });
};

export const useRecordPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, amount, method }: { id: string; amount: number; method?: string }) =>
      debtService.recordPayment(id, amount, method),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['debts'] }),
  });
};
