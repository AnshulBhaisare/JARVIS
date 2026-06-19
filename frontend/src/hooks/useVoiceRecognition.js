import { useState, useEffect, useRef, useCallback } from 'react'

const WAKE_WORDS = ['jarvis', 'hey jarvis', 'ok jarvis', 'hello jarvis']

/**
 * Hook wrapping Web Speech API for continuous voice recognition.
 * Detects wake word "Jarvis" then captures the actual command.
 */
const useVoiceRecognition = ({ onResult, onStart, onEnd }) => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript]   = useState('')
  const recognitionRef  = useRef(null)
  const awaitingCommand = useRef(false)
  const activeRef       = useRef(false)

  const buildRecognition = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return null

    const rec        = new SR()
    rec.lang         = 'en-IN'
    rec.continuous   = false
    rec.interimResults = true
    rec.maxAlternatives = 1
    return rec
  }, [])

  const listen = useCallback(() => {
    const rec = buildRecognition()
    if (!rec) return

    recognitionRef.current = rec

    rec.onstart = () => {
      setIsListening(true)
      setTranscript('')
    }

    rec.onresult = (event) => {
      const interim = Array.from(event.results)
        .map(r => r[0].transcript)
        .join('')
      setTranscript(interim)

      if (!event.results[event.results.length - 1].isFinal) return
      const final = interim.toLowerCase().trim()

      if (awaitingCommand.current) {
        // This IS the command after wake word
        awaitingCommand.current = false
        setTranscript('')
        if (final) onResult(final)
        onEnd()
      } else {
        // Check for wake word
        const hasWakeWord = WAKE_WORDS.some(w => final.includes(w))
        if (hasWakeWord) {
          // Strip wake word and check if command follows in same utterance
          let command = final
          WAKE_WORDS.forEach(w => { command = command.replace(w, '').trim() })
          if (command.length > 2) {
            setTranscript('')
            onResult(command)
            onEnd()
          } else {
            // Wake word only — now listen for command
            awaitingCommand.current = true
            onStart()
            // Restart to capture command
            // eslint-disable-next-line no-use-before-define
            setTimeout(() => { if (activeRef.current) listen() }, 300)
          }
        }
      }
    }

    rec.onerror = (e) => {
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        console.warn('Speech recognition error:', e.error)
      }
    }

    rec.onend = () => {
      setIsListening(false)
      // If still active and not awaiting command, auto-restart (continuous mode)
      if (activeRef.current && !awaitingCommand.current) {
        // eslint-disable-next-line no-use-before-define
        setTimeout(() => { if (activeRef.current) listen() }, 200)
      }
    }

    try { rec.start() } catch { /* already started */ }
  }, [buildRecognition, onResult, onStart, onEnd])

  const startListening = useCallback(() => {
    if (activeRef.current) return
    activeRef.current = true
    awaitingCommand.current = true  // manual trigger — next speech is command
    onStart()
    listen()
  }, [listen, onStart])

  const stopListening = useCallback(() => {
    activeRef.current = false
    awaitingCommand.current = false
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch { /* ignore */ }
    }
    setIsListening(false)
    setTranscript('')
    onEnd()
  }, [onEnd])

  // Start passive wake-word listener on mount
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    activeRef.current = true
    listen()
    return () => {
      activeRef.current = false
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch { /* ignore */ }
      }
    }
  }, [])  // eslint-disable-line

  return { isListening, transcript, startListening, stopListening }
}

export default useVoiceRecognition
