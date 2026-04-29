const ResponsePanel = ({ response, status }) => {
  if (!response && status === 'idle') {
    return (
      <>
        <div className="panel-header">
          <span><span className="panel-title-accent">▸</span> Response</span>
        </div>
        <div className="panel-body">
          <div className="response-empty">
            <div className="response-empty-icon">🤖</div>
            <div>Awaiting your command…</div>
          </div>
        </div>
      </>
    )
  }

  if (status === 'processing') {
    return (
      <>
        <div className="panel-header">
          <span><span className="panel-title-accent">▸</span> Response</span>
        </div>
        <div className="panel-body">
          <div className="response-empty">
            <div className="response-empty-icon" style={{ animation: 'orb-pulse 0.6s infinite alternate' }}>⚡</div>
            <div>Processing your request…</div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="panel-header">
        <span><span className="panel-title-accent">▸</span> Response</span>
        {response?.tool && (
          <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>
            {response.requires_confirmation ? '⚠️ CONFIRM' : '✓ EXECUTED'}
          </span>
        )}
      </div>
      <div className="panel-body">
        {response && (
          <div className="fade-in">
            {response.tool && (
              <div className="response-tool-badge">{response.tool}</div>
            )}
            {response.response_text && (
              <div className="response-spoken">{response.response_text}</div>
            )}
            {response.extra_data && (
              <div className="response-extra">{response.extra_data}</div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default ResponsePanel
