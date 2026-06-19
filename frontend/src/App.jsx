import { useState, useCallback, useEffect } from 'react'
import JarvisOrb from './components/JarvisOrb'
import CommandHistory from './components/CommandHistory'
import ResponsePanel from './components/ResponsePanel'
import ControlBar from './components/ControlBar'
import { processCommand, getHistory } from './services/api'
import { speak } from './voice/tts'
import useVoiceRecognition from './hooks/useVoiceRecognition'
import './index.css'

const STATUS = { IDLE: 'idle', LISTENING: 'listening', PROCESSING: 'processing', RESPONDING: 'responding', ERROR: 'error' }

const isElectron = () => typeof window !== 'undefined' && !!window.electronAPI

function App() {
  const [status, setStatus]                 = useState(STATUS.IDLE)
  const [currentCommand, setCurrentCommand] = useState('')
  const [response, setResponse]             = useState(null)
  const [history, setHistory]               = useState([])
  const [pendingConfirm, setPendingConfirm] = useState(null)

  const loadHistory = async () => {
    try { setHistory(await getHistory()) } catch (e) { console.error(e) }
  }

  useEffect(() => { loadHistory() }, [])

  const executeElectronTool = async (tool, args) => {
    if (!isElectron()) return
    try { await window.electronAPI.executeTool(tool, args) } catch (e) { console.error('Electron tool error:', e) }
  }

  const handleCommand = useCallback(async (command) => {
    if (!command?.trim()) return
    setCurrentCommand(command)
    setStatus(STATUS.PROCESSING)
    setResponse(null)

    try {
      const result = await processCommand(command)

      if (result.requires_confirmation) {
        setPendingConfirm(result)
        setResponse(result)
        setStatus(STATUS.IDLE)
        speak(`This action requires your confirmation. Say confirm or cancel.`)
        return
      }

      // Execute system/browser tools via Electron IPC
      await executeElectronTool(result.tool, result.args)

      setResponse(result)
      setStatus(STATUS.RESPONDING)
      speak(result.response_text)
      await loadHistory()
      setTimeout(() => setStatus(STATUS.IDLE), 4000)
    } catch (err) {
      const msg = err.response?.data?.detail || 'Something went wrong. Please try again.'
      setResponse({ tool: 'error', response_text: msg })
      setStatus(STATUS.ERROR)
      speak(msg)
      setTimeout(() => setStatus(STATUS.IDLE), 3000)
    }
  }, [])

  const handleConfirm = async () => {
    if (!pendingConfirm) return
    const result = { ...pendingConfirm, requires_confirmation: false }
    setPendingConfirm(null)
    await executeElectronTool(result.tool, result.args)
    setStatus(STATUS.RESPONDING)
    speak(result.response_text)
    await loadHistory()
    setTimeout(() => setStatus(STATUS.IDLE), 4000)
  }

  const handleCancel = () => {
    setPendingConfirm(null)
    setResponse(null)
    speak('Action cancelled.')
  }

  const { isListening, transcript, startListening, stopListening } = useVoiceRecognition({
    onResult: handleCommand,
    onStart:  () => setStatus(STATUS.LISTENING),
    onEnd:    () => { if (status === STATUS.LISTENING) setStatus(STATUS.IDLE) },
  })

  return (
    <div className="app-container">
      <div className="bg-grid" />

      {/* Header */}
      <header className="app-header">
        <div className="header-logo"><span className="logo-j">J</span>ARVIS</div>
        <div className="header-status-text">
          {status === STATUS.IDLE        && 'Standing by...'}
          {status === STATUS.LISTENING   && 'Listening...'}
          {status === STATUS.PROCESSING  && 'Processing request...'}
          {status === STATUS.RESPONDING  && 'Responding...'}
          {status === STATUS.ERROR       && 'Error occurred'}
        </div>
        <div className="header-meta">
          <span className={`status-dot ${status}`} />
          <span>{isElectron() ? 'Desktop' : 'Web'}</span>
        </div>
      </header>

      {/* Main 3-column layout */}
      <main className="app-main">
        <aside className="panel history-panel">
          <CommandHistory history={history} onClearHistory={loadHistory} />
        </aside>

        <section className="center-panel">
          <JarvisOrb
            status={status}
            transcript={transcript}
            currentCommand={currentCommand}
            onOrbClick={() => isListening ? stopListening() : startListening()}
          />

          {pendingConfirm && (
            <div className="confirmation-bar fade-in">
              <p>⚠️ Confirm: <strong>{pendingConfirm.tool}</strong></p>
              <div className="confirmation-actions">
                <button className="btn-confirm" onClick={handleConfirm}>✓ Confirm</button>
                <button className="btn-cancel"  onClick={handleCancel}>✕ Cancel</button>
              </div>
            </div>
          )}
        </section>

        <aside className="panel response-panel">
          <ResponsePanel response={response} status={status} />
        </aside>
      </main>

      <ControlBar
        status={status}
        isListening={isListening}
        onStartListening={startListening}
        onStopListening={stopListening}
        onTextSubmit={handleCommand}
      />
    </div>
  )
}

export default App
