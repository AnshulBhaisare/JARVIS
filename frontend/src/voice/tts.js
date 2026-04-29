/**
 * Text-to-Speech using Web Speech API.
 * Speaks the given text aloud and returns a Promise that resolves when done.
 */
export const speak = (text, options = {}) => {
  return new Promise((resolve) => {
    if (!window.speechSynthesis || !text) { resolve(); return }
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang    = options.lang  || 'en-IN'
    utterance.rate    = options.rate  || 0.95
    utterance.pitch   = options.pitch || 1.0
    utterance.volume  = options.volume || 1.0

    // Prefer a natural-sounding voice
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(v =>
      v.lang === 'en-IN' || v.name.includes('Google') || v.name.includes('Microsoft')
    )
    if (preferred) utterance.voice = preferred

    utterance.onend   = resolve
    utterance.onerror = resolve
    window.speechSynthesis.speak(utterance)
  })
}

export const stopSpeaking = () => {
  if (window.speechSynthesis) window.speechSynthesis.cancel()
}
