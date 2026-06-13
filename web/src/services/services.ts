import api from './api';

export const authService = {
  register: (data: {
    phone: string; password: string; firstName: string; lastName: string;
    businessName?: string; businessType?: string; language?: string;
  }) => api.post('/auth/register', data),
  login: (phone: string, password: string) => api.post('/auth/login', { phone, password }),
  verifyOTP: (phone: string, otp: string) => api.post('/auth/verify-otp', { phone, otp }),
  resendOTP: (phone: string) => api.post('/auth/resend-otp', { phone }),
  refreshToken: (refreshToken: string) => api.post('/auth/refresh-token', { refreshToken }),
  logout: (refreshToken: string) => api.post('/auth/logout', { refreshToken }),
  getMe: () => api.get('/auth/me'),
};

export const transactionService = {
  list: (params?: Record<string, unknown>) => api.get('/transactions', { params }),
  create: (data: Record<string, unknown>) => api.post('/transactions', data),
  getById: (id: string) => api.get(`/transactions/${id}`),
  getSummary: (period: string) => api.get('/transactions/summary', { params: { period } }),
};

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

export const analyticsService = {
  getCashflow: (period: string) => api.get('/analytics/cashflow', { params: { period } }),
  getProfitLoss: (from?: string, to?: string) => api.get('/analytics/profit-loss', { params: { from, to } }),
  getTopProducts: (limit = 10) => api.get('/analytics/top-products', { params: { limit } }),
  getRevenueTrends: () => api.get('/analytics/revenue-trends'),
  getDebtSummary: () => api.get('/analytics/debt-summary'),
};

export const scoreService = {
  getHealth: () => api.get('/scores/health'),
  getCredit: () => api.get('/scores/credit'),
  refresh: () => api.post('/scores/refresh'),
};

export const advisorService = {
  chat: (message: string) => api.post('/advisor/chat', { message }),
  getDailyBriefing: () => api.get('/advisor/daily-briefing'),
  getMarketIntelligence: (region?: string) =>
    api.get('/advisor/market-intelligence', { params: { region } }),
};

export const customerService = {
  list: (params?: Record<string, unknown>) => api.get('/customers', { params }),
  getById: (id: string) => api.get(`/customers/${id}`),
};

export const passportService = {
  get: () => api.get('/passport'),
  generatePDF: () => api.post('/passport/generate-pdf'),
  share: () => api.post('/passport/share'),
};
