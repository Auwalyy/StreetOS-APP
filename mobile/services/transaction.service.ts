import api from './api';

export const transactionService = {
  list: (params?: Record<string, unknown>) => api.get('/transactions', { params }),
  create: (data: Record<string, unknown>) => api.post('/transactions', data),
  getById: (id: string) => api.get(`/transactions/${id}`),
  sync: (transactions: unknown[]) => api.post('/transactions/sync', { transactions }),
  getSummary: (period: string) => api.get('/transactions/summary', { params: { period } }),

  createVoice: (audioUri: string, language: string, location?: { lat: number; lng: number }) => {
    const form = new FormData();
    form.append('audio', { uri: audioUri, name: 'audio.m4a', type: 'audio/m4a' } as unknown as Blob);
    form.append('language', language);
    if (location) form.append('location', JSON.stringify(location));
    return api.post('/transactions/voice', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
