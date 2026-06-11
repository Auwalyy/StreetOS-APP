import axios from 'axios';
import { config } from '../config/env';
import { logger } from '../utils/logger';

export const callAIService = async (endpoint: string, data: Record<string, unknown>) => {
  try {
    const response = await axios.post(`${config.aiService.url}${endpoint}`, data, {
      timeout: 30000,
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error) {
    logger.error(`AI service call failed: ${endpoint}`, error);
    throw new Error('AI service temporarily unavailable');
  }
};

export const processVoiceAudio = async (audioBuffer: Buffer, language: string) => {
  const base64Audio = audioBuffer.toString('base64');
  return callAIService('/voice/process', { audio: base64Audio, language });
};

export const getDailyBriefing = async (userId: string, language: string) => {
  return callAIService('/advisor/briefing', { userId, language });
};

export const chatWithAdvisor = async (userId: string, message: string, language: string) => {
  return callAIService('/advisor/chat', { userId, message, language });
};

export const calculateHealthScore = async (userId: string) => {
  return callAIService('/scoring/health', { userId });
};

export const calculateCreditScore = async (userId: string) => {
  return callAIService('/scoring/credit', { userId });
};

export const getMarketIntelligence = async (region: string, productCategory?: string) => {
  return callAIService('/market/intelligence', { region, productCategory });
};
