import { useState } from 'react';

export default function Settings() {
  const [autoApprove, setAutoApprove] = useState(true);
  const [threshold, setThreshold] = useState(200);
  const [usageLimit, setUsageLimit] = useState(2);
  const [saved, setSaved] = useState(false);

  function handleSave(e) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div>
      <div className="page-header">
        <h2>⚙️ Settings</h2>
        <p>Configure agent thresholds, approval modes, and detection parameters</p>
      </div>

      {saved && <div className="alert alert-success">✅ Settings saved successfully.</div>}

      {/* AUTO-APPROVE TOGGLE */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="card-title">🤖 Autonomous Action Mode</div>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 20 }}>
          When enabled, the Decision Agent will automatically execute all corrective actions
          without requiring manual confirmation per-instance.
        </p>
        <div className="toggle-group">
          <label className="toggle">
            <input
              type="checkbox"
              checked={autoApprove}
              onChange={e => setAutoApprove(e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
          <span style={{ fontSize: 14, color: autoApprove ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600 }}>
            {autoApprove ? '⚡ Auto-Approve ON' : '🧑‍💼 Manual Approval Required'}
          </span>
        </div>
        <div className="alert alert-info" style={{ marginTop: 18 }}>
          ℹ️ In manual mode, each remediation action requires a human to click "Fix" per instance on the Anomalies page.
        </div>
      </div>

      {/* DETECTION THRESHOLDS */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="card-title">🎛️ Detection Thresholds</div>
        </div>
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
                Cost Alert Threshold (₹)
              </label>
              <input
                type="number"
                value={threshold}
                onChange={e => setThreshold(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-glass)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  color: 'var(--text-primary)',
                  fontSize: 14,
                }}
              />
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 5 }}>
                Flag instances with cost above this value
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>
                Idle Usage Hours Limit
              </label>
              <input
                type="number"
                step="0.5"
                value={usageLimit}
                onChange={e => setUsageLimit(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-glass)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 14px',
                  color: 'var(--text-primary)',
                  fontSize: 14,
                }}
              />
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 5 }}>
                Instances with usage below this are flagged as idle
              </div>
            </div>
          </div>
          <div style={{ marginTop: 24 }}>
            <button className="btn btn-primary" type="submit">💾 Save Settings</button>
          </div>
        </form>
      </div>

      {/* AGENT PIPELINE INFO */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">🧠 Multi-Agent System Overview</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 16, marginTop: 8 }}>
          {[
            { icon: '📂', name: 'Data Agent',          desc: 'Loads & parses cost CSV' },
            { icon: '🔍', name: 'Anomaly Agent',       desc: 'Rule-based anomaly detection' },
            { icon: '🧐', name: 'Root Cause Agent',    desc: 'Generates natural explanations' },
            { icon: '🎯', name: 'Decision Agent',      desc: 'Chooses corrective action' },
            { icon: '⚡', name: 'Action Agent',        desc: 'Simulates & executes actions' },
            { icon: '📋', name: 'Audit Agent',         desc: 'Logs all decisions & savings' },
          ].map(a => (
            <div key={a.name} style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              padding: '18px 16px',
            }}>
              <div style={{ fontSize: 24, marginBottom: 10 }}>{a.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 5 }}>{a.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{a.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
