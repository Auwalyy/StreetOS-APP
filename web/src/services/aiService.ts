import axios from 'axios';

const AI_BASE = import.meta.env.VITE_AI_URL || 'http://localhost:8000';

const aiApi = axios.create({ baseURL: AI_BASE, timeout: 60000 });

export const aiService = {
  extractTransaction: (text: string, language = 'en') =>
    aiApi.post('/nlp/extract-transaction', { text, language }),
  extractDebt: (text: string, language = 'en') =>
    aiApi.post('/nlp/extract-debt', { text, language }),
  advisorChat: (message: string, userId?: string, language = 'en') =>
    aiApi.post('/advisor/chat', { message, user_id: userId, language }),
  getDailyBriefing: (userId: string, language = 'en') =>
    aiApi.post('/advisor/daily-briefing', { user_id: userId, language }),
  getMarketIntelligence: (region?: string, category?: string) =>
    aiApi.get('/market/intelligence', { params: { region, category } }),
  getCreditScore: (userId: string) =>
    aiApi.post('/scoring/credit', { user_id: userId }),
  getHealthScore: (userId: string) =>
    aiApi.post('/scoring/health', { user_id: userId }),
  detectFraud: (transactionId: string) =>
    aiApi.post('/fraud/analyze', { transaction_id: transactionId }),
  transcribeVoice: (audioBlob: Blob, language = 'en') => {
    const form = new FormData();
    form.append('audio', audioBlob, 'recording.webm');
    form.append('language', language);
    return aiApi.post('/voice/transcribe', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
