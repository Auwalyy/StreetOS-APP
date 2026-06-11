import { useState, useRef, useCallback } from 'react';
import { voiceService } from '../services/voice.service';
import { transactionService } from '../services/transaction.service';
import { useOfflineStore } from '../store/offlineStore';
import { Audio } from 'expo-av';
import NetInfo from '@react-native-community/netinfo';
import { useAuthStore } from '../store/authStore';

type VoiceState = 'idle' | 'recording' | 'processing' | 'success' | 'error';

export const useVoice = () => {
  const [state, setState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const { user } = useAuthStore();
  const addPending = useOfflineStore((s) => s.addPendingTransaction);

  const startRecording = useCallback(async () => {
    const hasPermission = await voiceService.requestPermission();
    if (!hasPermission) {
      setError('Microphone permission denied');
      return;
    }
    setState('recording');
    setError(null);
    setTranscript('');
    setResult(null);
    recordingRef.current = await voiceService.startRecording();
  }, []);

  const stopRecording = useCallback(async () => {
    if (!recordingRef.current) return;
    setState('processing');

    try {
      const uri = await voiceService.stopRecording(recordingRef.current);
      recordingRef.current = null;

      const netState = await NetInfo.fetch();
      if (!netState.isConnected) {
        // Offline — store locally
        addPending({
          type: 'sale',
          amount: 0,
          source: 'voice',
          paymentMethod: 'cash',
        });
        setState('success');
        setTranscript('Saved offline. Will sync when connected.');
        return;
      }

      const language = user?.language || 'en';
      const response = await transactionService.createVoice(uri, language);
      const payload = response.data?.data;

      // Backend returns { transaction, confidence, inventoryUpdated }
      setTranscript(payload?.transaction?.voiceTranscript || '');
      setResult(payload);
      setState('success');
      await voiceService.deleteRecording(uri);
    } catch (err: unknown) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Voice processing failed');
    }
  }, [user, addPending]);

  const reset = useCallback(() => {
    setState('idle');
    setTranscript('');
    setResult(null);
    setError(null);
  }, []);

  return { state, transcript, result, error, startRecording, stopRecording, reset };
};
