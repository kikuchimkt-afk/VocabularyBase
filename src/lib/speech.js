// Web Speech API utility for text-to-speech
// Falls back gracefully if not supported

export function speak(text, options = {}) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.warn('Web Speech API is not supported in this browser.');
    return null;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = options.lang || 'en-US';
  utterance.rate = options.rate || 0.9;
  utterance.pitch = options.pitch || 1;
  utterance.volume = options.volume || 1;

  // Try to select a high-quality voice
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    const langCode = utterance.lang.split('-')[0]; // 'en' or 'ja'
    
    // Prefer neural/enhanced voices
    const preferredVoice = voices.find(v => 
      v.lang.startsWith(langCode) && 
      (v.name.includes('Neural') || v.name.includes('Enhanced') || v.name.includes('Premium'))
    ) || voices.find(v => 
      v.lang.startsWith(langCode) && !v.localService
    ) || voices.find(v => 
      v.lang.startsWith(langCode)
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
  }

  return new Promise((resolve, reject) => {
    utterance.onend = () => resolve();
    utterance.onerror = (e) => {
      // Ignore 'interrupted' errors from cancel()
      if (e.error === 'interrupted') {
        resolve();
      } else {
        reject(e);
      }
    };
    window.speechSynthesis.speak(utterance);
  });
}

// Preload voices (needed on some browsers)
export function preloadVoices() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.getVoices();
    // Some browsers need the voiceschanged event
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
