export const LANGUAGES = {
  en:  { label: 'English',         nativeLabel: 'English',    flag: '🇬🇧' },
  ha:  { label: 'Hausa',           nativeLabel: 'Hausa',      flag: '🇳🇬' },
  yo:  { label: 'Yoruba',          nativeLabel: 'Yorùbá',     flag: '🇳🇬' },
  ig:  { label: 'Igbo',            nativeLabel: 'Igbo',       flag: '🇳🇬' },
  pcm: { label: 'Nigerian Pidgin', nativeLabel: 'Naija',      flag: '🇳🇬' },
} as const;

export type LanguageCode = keyof typeof LANGUAGES;
