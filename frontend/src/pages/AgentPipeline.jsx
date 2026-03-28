import { useState } from 'react';
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8000' });

const AGENT_COLORS = ['#6366f1', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981'];

export default function AgentPipeline() {
  const [steps, setSteps] = useState([]);
  const [running, setRunning] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [totalMs, setTotalMs] = useState(null);
  const [finalSavings, setFinalSavings] = useState(null);
  const [error, setError] = useState('');
  const [anomalies, setAnomalies] = useState([]);

  async function runPipeline() {
    setRunning(true);
    setError('');
    setSteps([]);
    setActiveStep(-1);
    setTotalMs(null);
    setFinalSavings(null);

    try {
      const res = await API.get('/pipeline/run');
      const { steps: s, total_ms, anomalies: a } = res.data;
      setAnomalies(a || []);
      setTotalMs(total_ms);

      // Animate steps appearing one by one
      for (let i = 0; i < s.length; i++) {
        setActiveStep(i);
        setSteps(s.slice(0, i + 1));
        await new Promise(r => setTimeout(r, 600));
      }
      setActiveStep(-1);
      const lastStep = s[s.length - 1];
      setFinalSavings(lastStep?.details?.total_savings || 0);
    } catch {
      setError('Cannot reach backend. Ensure FastAPI is running on port 8000.');
    } finally {
      setRunning(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>🧠 Agent Reasoning Chain</h2>
        <p>Watch the AI agents think, analyze, and decide — step by step in real time</p>
      </div>

      {error && <div className="alert alert-danger">⚠️ {error}</div>}

      <div className="toolbar">
        <button className="btn btn-primary" onClick={runPipeline} disabled={running}>
          {running ? <><span className="spinner" /> Running Pipeline…</> : '▶ Run Agent Pipeline'}
        </button>
        {totalMs !== null && (
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            ⏱ Pipeline completed in <strong style={{ color: 'var(--success)' }}>{totalMs}ms</strong>
          </span>
        )}
      </div>

      {/* Pipeline Diagram */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">🔗 Multi-Agent Execution Pipeline</div>
          {running && <span style={{ fontSize: 12, color: '#f59e0b', fontWeight: 600, animation: 'pulse 1s infinite' }}>● Processing…</span>}
        </div>

        {/* Horizontal connector */}
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, overflowX: 'auto', paddingBottom: 8 }}>
          {[
            { id: 1, name: 'Data Agent', icon: '🗄️', color: AGENT_COLORS[0] },
            { id: 2, name: 'Anomaly Agent', icon: '🔍', color: AGENT_COLORS[1] },
            { id: 3, name: 'Root Cause Agent', icon: '🧠', color: AGENT_COLORS[2] },
            { id: 4, name: 'Decision Agent', icon: '⚖️', color: AGENT_COLORS[3] },
            { id: 5, name: 'Action Agent', icon: '⚡', color: AGENT_COLORS[4] },
          ].map((agent, idx) => {
            const step = steps.find(s => s.id === agent.id);
            const isActive = activeStep === idx;
            const isDone = !!step;
            return (
              <div key={agent.id} style={{ display: 'flex', alignItems: 'center', flex: '1 0 160px' }}>
                {/* Agent node */}
                <div style={{
                  flex: 1,
                  background: isDone
                    ? `linear-gradient(135deg, ${agent.color}22, ${agent.color}11)`
                    : 'rgba(255,255,255,0.03)',
                  border: `2px solid ${isDone ? agent.color : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 16,
                  padding: '20px 12px',
                  textAlign: 'center',
                  transition: 'all 0.4s ease',
                  position: 'relative',
                  boxShadow: isDone ? `0 0 24px ${agent.color}33` : 'none',
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                }}>
                  {isActive && (
                    <div style={{
                      position: 'absolute', inset: -2, borderRadius: 16,
                      border: `2px solid ${agent.color}`,
                      animation: 'spin 1.2s linear infinite',
                    }} />
                  )}
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{agent.icon}</div>
                  <div style={{
                    fontSize: 12, fontWeight: 700, color: isDone ? agent.color : 'var(--text-muted)',
                    marginBottom: 4,
                  }}>{agent.name}</div>
                  {step && (
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{step.duration_ms}ms</div>
                  )}
                  {isDone && (
                    <div style={{
                      position: 'absolute', top: -8, right: -8,
                      width: 20, height: 20, background: '#10b981',
                      borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, color: '#fff', fontWeight: 700,
                    }}>✓</div>
                  )}
                </div>
                {/* Connector arrow */}
                {idx < 4 && (
                  <div style={{
                    width: 32, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{
                      height: 2, flex: 1,
                      background: steps.length > idx + 1
                        ? `linear-gradient(90deg, ${AGENT_COLORS[idx]}, ${AGENT_COLORS[idx+1]})`
                        : 'rgba(255,255,255,0.1)',
                      transition: 'background 0.5s',
                      position: 'relative',
                    }}>
                      <div style={{
                        position: 'absolute', right: -6, top: -5,
                        color: steps.length > idx + 1 ? AGENT_COLORS[idx + 1] : 'rgba(255,255,255,0.2)',
                        fontSize: 14, transition: 'color 0.5s',
                      }}>▶</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Results */}
      {steps.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {steps.map((step, idx) => (
            <div key={step.id} style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${AGENT_COLORS[idx]}44`,
              borderLeft: `3px solid ${AGENT_COLORS[idx]}`,
              borderRadius: 12,
              padding: '20px 24px',
              animation: 'fadeIn 0.4s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 22 }}>{step.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, color: AGENT_COLORS[idx], fontSize: 15 }}>
                    Step {step.id}: {step.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Executed in {step.duration_ms}ms •
                    <span style={{ marginLeft: 6, color: step.status === 'complete' ? '#10b981' : '#f59e0b' }}>
                      {step.status === 'complete' ? '✓ Complete' : '⚡ Ready to Execute'}
                    </span>
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>
                📤 <strong>Output:</strong> {step.output}
              </div>
              {step.details && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {Object.entries(step.details).map(([k, v]) => (
                    <div key={k} style={{
                      background: `${AGENT_COLORS[idx]}11`, border: `1px solid ${AGENT_COLORS[idx]}33`,
                      borderRadius: 8, padding: '6px 12px',
                    }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.replace(/_/g, ' ')}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: AGENT_COLORS[idx], marginTop: 2 }}>
                        {Array.isArray(v) ? v.join(', ') : String(v)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Final Summary Banner */}
      {finalSavings !== null && (
        <div style={{
          marginTop: 24,
          background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(99,102,241,0.08))',
          border: '1px solid rgba(16,185,129,0.3)',
          borderRadius: 18, padding: '28px 32px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          animation: 'fadeIn 0.4s ease',
        }}>
          <div>
            <div style={{ fontSize: 12, color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
              Pipeline Complete — Potential Savings Identified
            </div>
            <div style={{ fontSize: 48, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>
              ₹{parseFloat(finalSavings).toLocaleString()}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              {anomalies.length} anomalies processed across {new Set(anomalies.map(a=>a.domain)).size} enterprise domains
            </div>
          </div>
          <div style={{ fontSize: 64, opacity: 0.4 }}>⚡</div>
        </div>
      )}

      {steps.length === 0 && !running && (
        <div className="empty-state">
          <div className="empty-icon">🧬</div>
          <h3>Run the Pipeline to See AI Reasoning</h3>
          <p>Click "Run Agent Pipeline" to watch each agent execute and see real results</p>
        </div>
      )}
    </div>
  );
}
