// Text-to-speech "vicar voice" using the browser Web Speech API. Gracefully
// degrades to a no-op where the API is unavailable.

export function ttsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function getVoices(): SpeechSynthesisVoice[] {
  if (!ttsSupported()) return [];
  return window.speechSynthesis.getVoices();
}

/**
 * Some browsers populate voices asynchronously. This resolves once voices are
 * available (or immediately if they already are).
 */
export function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!ttsSupported()) return resolve([]);
    const existing = window.speechSynthesis.getVoices();
    if (existing.length) return resolve(existing);
    const handler = () => {
      resolve(window.speechSynthesis.getVoices());
      window.speechSynthesis.removeEventListener('voiceschanged', handler);
    };
    window.speechSynthesis.addEventListener('voiceschanged', handler);
  });
}

export interface SpeakOptions {
  voiceName?: string | null;
  rate?: number;
  onEnd?: () => void;
}

export function speak(text: string, opts: SpeakOptions = {}): void {
  if (!ttsSupported() || !text.trim()) {
    opts.onEnd?.();
    return;
  }
  cancelSpeech();
  const utterance = new SpeechSynthesisUtterance(stripMarkup(text));
  utterance.rate = opts.rate ?? 0.95;
  utterance.pitch = 1;
  if (opts.voiceName) {
    const voice = getVoices().find((v) => v.name === opts.voiceName);
    if (voice) utterance.voice = voice;
  }
  if (opts.onEnd) utterance.onend = () => opts.onEnd?.();
  window.speechSynthesis.speak(utterance);
}

export function cancelSpeech(): void {
  if (ttsSupported()) window.speechSynthesis.cancel();
}

// Remove bracketed scaffold notes and collapse whitespace for nicer speech.
function stripMarkup(text: string): string {
  return text
    .replace(/\[[^\]]*\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
