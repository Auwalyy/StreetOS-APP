import api from './api';

export const inventoryService = {
  list: (params?: Record<string, unknown>) => api.get('/inventory', { params }),
  create: (data: Record<string, unknown>) => api.post('/inventory', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/inventory/${id}`, data),
  delete: (id: string) => api.delete(`/inventory/${id}`),
  getLowStock: () => api.get('/inventory/alerts/low-stock'),
  getForecast: () => api.get('/inventory/forecast'),
};

export const debtService = {
  list: (params?: Record<string, unknown>) => api.get('/debts', { params }),
  create: (data: Record<string, unknown>) => api.post('/debts', data),
  recordPayment: (id: string, amount: number, method?: string) =>
    api.post(`/debts/${id}/payment`, { amount, method }),
  settle: (id: string) => api.post(`/debts/${id}/settle`),
  getSummary: () => api.get('/debts/summary'),
};

export const customerService = {
  list: (params?: Record<string, unknown>) => api.get('/customers', { params }),
  getById: (id: string) => api.get(`/customers/${id}`),
};

export const analyticsService = {
  getCashflow: (period: string) => api.get('/analytics/cashflow', { params: { period } }),
  getProfitLoss: (from?: string, to?: string) => api.get('/analytics/profit-loss', { params: { from, to } }),
  getTopProducts: (limit?: number) => api.get('/analytics/top-products', { params: { limit } }),
  getRevenueTrends: () => api.get('/analytics/revenue-trends'),
  getDebtSummary: () => api.get('/analytics/debt-summary'),
};

export const scoreService = {
  getHealth: () => api.get('/scores/health'),
  getHealthHistory: () => api.get('/scores/health/history'),
  getCredit: () => api.get('/scores/credit'),
  getCreditHistory: () => api.get('/scores/credit/history'),
  refresh: () => api.post('/scores/refresh'),
};

export const passportService = {
  get: () => api.get('/passport'),
  share: () => api.post('/passport/share'),
  generatePDF: () => api.post('/passport/generate-pdf'),
  verify: (passportId: string) => api.get(`/passport/verify/${passportId}`),
};

export const advisorService = {
  chat: (message: string) => api.post('/advisor/chat', { message }),
  getDailyBriefing: () => api.get('/advisor/daily-briefing'),
  getMarketIntelligence: (region?: string) =>
    api.get('/advisor/market-intelligence', { params: { region } }),
};

export const notificationService = {
  list: (params?: Record<string, unknown>) => api.get('/notifications', { params }),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};
