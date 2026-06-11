import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionService } from '../services/transaction.service';

export const useTransactions = (params?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['transactions', params],
    queryFn: () => transactionService.list(params).then((r) => r.data.data),
  });

export const useTransactionSummary = (period: string) =>
  useQuery({
    queryKey: ['transactions-summary', period],
    queryFn: () => transactionService.getSummary(period).then((r) => r.data.data),
  });

export const useCreateTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => transactionService.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  });
};
