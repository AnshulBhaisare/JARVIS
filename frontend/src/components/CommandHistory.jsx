import { clearHistory } from '../services/api'

const formatTime = (iso) => {
  try {
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  } catch { return '' }
}

const TOOL_ICONS = {
  'browser.':  '🌐',
  'system.':   '🖥️',
  'clipboard.':'📋',
  'file.':     '📁',
  'ai.':       '🧠',
  'notes.':    '📝',
  'weather.':  '🌤️',
  'media.':    '🎵',
}

const getIcon = (tool = '') => {
  const match = Object.keys(TOOL_ICONS).find(k => tool.startsWith(k))
  return match ? TOOL_ICONS[match] : '⚡'
}

const CommandHistory = ({ history, onClearHistory }) => {
  const handleClear = async () => {
    try { await clearHistory(); onClearHistory() } catch (e) { console.error(e) }
  }

  return (
    <>
      <div className="panel-header">
        <span><span className="panel-title-accent">▸</span> Command Log</span>
        {history.length > 0 && (
          <button className="clear-btn" onClick={handleClear}>CLEAR</button>
        )}
      </div>
      <div className="panel-body">
        {history.length === 0 ? (
          <div className="history-empty">
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>📭</div>
            No commands yet.<br />Say "Jarvis" to begin.
          </div>
        ) : (
          history.map(item => (
            <div key={item.id} className="history-item fade-in">
              <div className="history-cmd">
                {getIcon(item.tool_used)} {item.user_command}
              </div>
              {item.tool_used && (
                <div className="history-tool">{item.tool_used}</div>
              )}
              <div className="history-time">{formatTime(item.created_at)}</div>
            </div>
          ))
        )}
      </div>
    </>
  )
}

export default CommandHistory
