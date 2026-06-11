import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

export const voiceService = {
  async requestPermission(): Promise<boolean> {
    const { status } = await Audio.requestPermissionsAsync();
    return status === 'granted';
  },

  async startRecording(): Promise<Audio.Recording> {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    return recording;
  },

  async stopRecording(recording: Audio.Recording): Promise<string> {
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    const uri = recording.getURI();
    if (!uri) throw new Error('No recording URI');
    return uri;
  },

  async getAudioDuration(uri: string): Promise<number> {
    const { sound } = await Audio.Sound.createAsync({ uri });
    const status = await sound.getStatusAsync();
    await sound.unloadAsync();
    return status.isLoaded ? (status.durationMillis || 0) : 0;
  },

  async deleteRecording(uri: string): Promise<void> {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  },
};
