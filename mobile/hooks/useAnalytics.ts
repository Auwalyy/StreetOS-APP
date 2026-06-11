import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/services';

export const useCashflow = (period: 'daily' | 'weekly' | 'monthly' = 'monthly') =>
  useQuery({
    queryKey: ['cashflow', period],
    queryFn: () => analyticsService.getCashflow(period).then((r) => r.data.data),
  });

export const useProfitLoss = (from?: string, to?: string) =>
  useQuery({
    queryKey: ['profit-loss', from, to],
    queryFn: () => analyticsService.getProfitLoss(from, to).then((r) => r.data.data),
  });

export const useTopProducts = (limit = 10) =>
  useQuery({
    queryKey: ['top-products', limit],
    queryFn: () => analyticsService.getTopProducts(limit).then((r) => r.data.data),
  });

export const useRevenueTrends = () =>
  useQuery({
    queryKey: ['revenue-trends'],
    queryFn: () => analyticsService.getRevenueTrends().then((r) => r.data.data),
  });
