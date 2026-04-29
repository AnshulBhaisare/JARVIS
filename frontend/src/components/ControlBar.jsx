import { useState } from 'react'

const ControlBar = ({ status, isListening, onStartListening, onStopListening, onTextSubmit }) => {
  const [text, setText] = useState('')
  const isProcessing = status === 'processing'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!text.trim() || isProcessing) return
    onTextSubmit(text.trim())
    setText('')
  }

  const toggleMic = () => {
    if (isListening) onStopListening()
    else onStartListening()
  }

  return (
    <div className="control-bar">
      {/* Mic button */}
      <button
        className={`mic-btn ${isListening ? 'active' : ''}`}
        onClick={toggleMic}
        disabled={isProcessing}
        title={isListening ? 'Stop listening' : 'Start listening'}
      >
        {isListening ? '🔴' : '🎙️'}
      </button>

      {/* Text input */}
      <form className="text-input-wrapper" onSubmit={handleSubmit}>
        <input
          className="text-input"
          type="text"
          placeholder={isProcessing ? 'Processing...' : 'Type a command or ask anything...'}
          value={text}
          onChange={e => setText(e.target.value)}
          disabled={isProcessing}
        />
        <button className="send-btn" type="submit" disabled={isProcessing || !text.trim()}>
          ➤
        </button>
      </form>

      {/* Wake word hint */}
      <div className="wakeword-badge">
        SAY "JARVIS"
      </div>
    </div>
  )
}

export default ControlBar
