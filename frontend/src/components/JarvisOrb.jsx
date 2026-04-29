const ORB_CONFIG = {
  idle:       { icon: '🤖', label: 'STANDBY',    color: 'idle' },
  listening:  { icon: '🎙️', label: 'LISTENING',  color: 'listening' },
  processing: { icon: '⚡', label: 'PROCESSING', color: 'processing' },
  responding: { icon: '💬', label: 'RESPONDING', color: 'responding' },
  error:      { icon: '⚠️', label: 'ERROR',      color: 'error' },
}

const JarvisOrb = ({ status, transcript, currentCommand, onOrbClick }) => {
  const cfg = ORB_CONFIG[status] || ORB_CONFIG.idle

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      {/* Orb */}
      <div className="orb-wrapper" onClick={onOrbClick}>
        <div className="orb-ring" />
        <div className="orb-ring" />
        <div className="orb-ring" />

        <div className="orb-core">
          <div className={`orb-inner ${cfg.color}`}>
            <span className="orb-icon">{cfg.icon}</span>
          </div>
          <span className="orb-label">{cfg.label}</span>
        </div>
      </div>

      {/* Live transcript */}
      {transcript && (
        <div className="transcript-live fade-in">
          "{transcript}"
        </div>
      )}

      {/* Last command */}
      {currentCommand && !transcript && (
        <div className="current-command-box fade-in">
          <div className="current-command-label">Last Command</div>
          {currentCommand}
        </div>
      )}

      {/* Idle hint */}
      {!transcript && !currentCommand && status === 'idle' && (
        <div style={{ color: 'var(--text-dim)', fontSize: '0.78rem', textAlign: 'center', lineHeight: 1.6 }}>
          Say <span style={{ color: 'var(--cyan)', fontWeight: 600 }}>"Jarvis"</span> to wake me up<br />
          or click the mic button below
        </div>
      )}
    </div>
  )
}

export default JarvisOrb
