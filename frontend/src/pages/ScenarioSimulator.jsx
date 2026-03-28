import { useState } from 'react';
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8000' });

const SUGGESTED_SCENARIOS = [
  {
    label: '🚨 Cloud Spend Spike +40%',
    domain: 'Resource',
    service_name: 'EC2 Auto-Scaling Group',
    instance_id: 'asg-prod-west-01',
    cost: 45000,
    usage_hours: 720,
    status: 'active',
    description: 'Cloud infra costs jumped 40% MoM. Is it traffic or a misconfiguration?',
  },
  {
    label: '🔁 Duplicate Vendor Detected',
    domain: 'Spend',
    service_name: 'Vendor: Zendesk',
    instance_id: 'INV-ZD-991-DUP',
    cost: 8500,
    usage_hours: 0,
    status: 'pending',
    description: 'Two vendor invoices for the same support platform found in procurement.',
  },
  {
    label: '⚠️ SLA Breach in 3 Days',
    domain: 'SLA',
    service_name: 'Payments Delivery Pipeline',
    instance_id: 'sla-pay-pipeline',
    cost: 0,
    usage_hours: 420,
    status: 'warning',
    description: 'Delivery team is trending toward missing a contractual SLA this sprint.',
  },
  {
    label: '📒 Unreconciled Invoice >₹50k',
    domain: 'FinOps',
    service_name: 'Azure Billing API',
    instance_id: 'REC-AZURE-APR-26',
    cost: 61000,
    usage_hours: 0,
    status: 'unreconciled',
    description: 'Billing cycle has an unreconciled transaction. Close requires finance approval.',
  },
  {
    label: '💡 Idle RDS Database',
    domain: 'Resource',
    service_name: 'RDS (PostgreSQL)',
    instance_id: 'db-legacy-uat-99',
    cost: 3200,
    usage_hours: 0.3,
    status: 'idle',
    description: 'A database from a decommissioned UAT environment is still running and billing.',
  },
];

const AGENT_STEPS = [
  { id: 1, name: 'Data Agent', icon: '🗄️', color: '#6366f1', desc: 'Ingesting record into the live domain pipeline...' },
  { id: 2, name: 'Anomaly Agent', icon: '🔍', color: '#f59e0b', desc: 'Scanning against enterprise baseline policies...' },
  { id: 3, name: 'Root Cause Agent', icon: '🧠', color: '#3b82f6', desc: 'Diagnosing the root cause of the anomaly...' },
  { id: 4, name: 'Decision Agent', icon: '⚖️', color: '#8b5cf6', desc: 'Formulating remediation strategy & risk assessment...' },
  { id: 5, name: 'Action Agent', icon: '⚡', color: '#10b981', desc: 'Preparing execution or routing to approval queue...' },
];

export default function ScenarioSimulator() {
  const [selected, setSelected] = useState(null);
  const [custom, setCustom] = useState({
    domain: 'Resource', service_name: '', instance_id: '', cost: '', usage_hours: '', status: 'idle',
  });
  const [mode, setMode] = useState('preset'); // 'preset' | 'custom'
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [log, setLog] = useState([]);

  function addLog(msg, color = '#94a3b8') {
    setLog(prev => [...prev, { msg, color, time: new Date().toLocaleTimeString() }]);
  }

  async function runScenario() {
    const scenario = mode === 'preset' ? selected : {
      ...custom,
      cost: parseFloat(custom.cost) || 0,
      usage_hours: parseFloat(custom.usage_hours) || 0,
    };
    if (!scenario) return;

    setRunning(true);
    setResult(null);
    setError('');
    setCurrentStep(-1);
    setLog([]);

    addLog(`🚀 Injecting scenario: ${scenario.service_name} [${scenario.domain}]`, '#6366f1');

    try {
      // Animate through agent steps before calling API
      for (let i = 0; i < AGENT_STEPS.length; i++) {
        setCurrentStep(i);
        addLog(`${AGENT_STEPS[i].icon} ${AGENT_STEPS[i].name}: ${AGENT_STEPS[i].desc}`, AGENT_STEPS[i].color);
        await new Promise(r => setTimeout(r, 700));
      }

      const res = await API.post('/scenario/test', scenario);
      setResult(res.data);
      setCurrentStep(-1);

      if (res.data.is_anomaly) {
        addLog(`🚨 Anomaly detected: ${res.data.anomaly_type?.replace(/_/g, ' ')}`, '#ef4444');
        addLog(`🧠 Root cause: ${res.data.root_cause?.slice(0, 80)}...`, '#3b82f6');
        addLog(`⚖️ Recommended action: ${res.data.recommended_action}`, '#8b5cf6');
        if (res.data.approval_required) {
          addLog('🔒 High-impact action routed to Enterprise Approval Queue', '#f59e0b');
        } else {
          addLog('⚡ Low-risk action — queued for Autonomous Execution', '#10b981');
        }
        addLog(`💰 Potential savings: ₹${(res.data.savings || 0).toLocaleString()}`, '#10b981');
      } else {
        addLog('✅ No anomaly detected. System is operating within baseline parameters.', '#10b981');
      }
    } catch (e) {
      setError('Backend unreachable on port 8000. Ensure main.py is running.');
      addLog('❌ Backend error — cannot reach FastAPI', '#ef4444');
    } finally {
      setRunning(false);
    }
  }

  const activeScenario = mode === 'preset' ? selected : (custom.service_name ? custom : null);

  return (
    <div>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(245,158,11,0.06))',
        border: '1px solid rgba(99,102,241,0.2)', borderRadius: 20, padding: '28px 32px', marginBottom: 28,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -30, right: 60, width: 180, height: 180, background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 13, color: '#6366f1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
            🧪 PHASE 3 READY
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 900, color: '#f1f5f9', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
            Live Scenario Simulator
          </h2>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
            Inject any enterprise cost scenario and watch the 5-agent pipeline reason through it in real time.
            Built to handle judges' surprise scenarios during Phase 3 live judging.
          </p>
        </div>
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: 20 }}>⚠️ {error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
        {/* LEFT: Scenario selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Mode tabs */}
          <div style={{ display: 'flex', gap: 8 }}>
            {['preset', 'custom'].map(m => (
              <button key={m} onClick={() => { setMode(m); setResult(null); setLog([]); }} style={{
                padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13,
                background: mode === m ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                color: mode === m ? '#fff' : '#64748b',
                transition: 'all 0.2s',
              }}>
                {m === 'preset' ? '📋 Preset Scenarios' : '✏️ Custom Scenario'}
              </button>
            ))}
          </div>

          {mode === 'preset' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 12, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                Select a scenario to inject →
              </div>
              {SUGGESTED_SCENARIOS.map((s, i) => (
                <div key={i} onClick={() => setSelected(s)} style={{
                  padding: '16px 20px', borderRadius: 14, cursor: 'pointer',
                  background: selected?.instance_id === s.instance_id
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.08))'
                    : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${selected?.instance_id === s.instance_id ? '#6366f1' : 'rgba(255,255,255,0.08)'}`,
                  transition: 'all 0.2s',
                  transform: selected?.instance_id === s.instance_id ? 'translateX(4px)' : 'translateX(0)',
                }}>
                  <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 14, marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: '#475569' }}>{s.description}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>Build Your Own Scenario</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { key: 'service_name', label: 'Service Name', placeholder: 'e.g. AWS Lambda, Vendor: Oracle' },
                  { key: 'instance_id', label: 'Instance / Invoice ID', placeholder: 'e.g. i-abc123 or INV-X-DUP' },
                  { key: 'cost', label: 'Cost (₹)', placeholder: 'e.g. 12500' },
                  { key: 'usage_hours', label: 'Usage Hours / Latency (ms)', placeholder: 'e.g. 0.5 (idle) or 450 (high latency)' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>{f.label}</label>
                    <input
                      value={custom[f.key]}
                      onChange={e => setCustom(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      style={{
                        width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f1f5f9',
                        fontSize: 13, boxSizing: 'border-box', outline: 'none',
                      }}
                    />
                  </div>
                ))}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Domain</label>
                    <select value={custom.domain} onChange={e => setCustom(p => ({ ...p, domain: e.target.value }))} style={{
                      width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f1f5f9', fontSize: 13,
                    }}>
                      {['Resource', 'Spend', 'SLA', 'FinOps'].map(d => <option key={d} value={d} style={{ background: '#0f172a' }}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Status</label>
                    <select value={custom.status} onChange={e => setCustom(p => ({ ...p, status: e.target.value }))} style={{
                      width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f1f5f9', fontSize: 13,
                    }}>
                      {['idle', 'active', 'paid', 'pending', 'warning', 'healthy', 'unreconciled', 'reconciled'].map(s => (
                        <option key={s} value={s} style={{ background: '#0f172a' }}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={runScenario}
            disabled={running || !activeScenario}
            className="btn btn-primary"
            style={{ padding: '14px', fontSize: 15, fontWeight: 800, gap: 10, justifyContent: 'center', opacity: !activeScenario ? 0.4 : 1 }}
          >
            {running ? <><span className="spinner" /> Running 5-Agent Pipeline…</> : '▶ Inject & Run Scenario'}
          </button>
        </div>

        {/* RIGHT: Pipeline live view + result */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Live pipeline agent nodes */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 16 }}>🔗 Agent Reasoning Pipeline</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {AGENT_STEPS.map((agent, idx) => {
                const isActive = currentStep === idx;
                const isDone = result !== null || (currentStep > idx);
                const isWaiting = currentStep < idx && !result;
                return (
                  <div key={agent.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                    borderRadius: 12,
                    background: isActive ? `${agent.color}15` : isDone ? `${agent.color}08` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isActive ? agent.color : isDone ? `${agent.color}30` : 'rgba(255,255,255,0.06)'}`,
                    transition: 'all 0.3s',
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isActive ? agent.color : isDone ? `${agent.color}30` : 'rgba(255,255,255,0.06)',
                      fontSize: 18, flexShrink: 0,
                      boxShadow: isActive ? `0 0 16px ${agent.color}60` : 'none',
                      animation: isActive ? 'pulse 1s infinite' : 'none',
                    }}>
                      {agent.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? agent.color : isDone ? '#f1f5f9' : '#334155' }}>{agent.name}</div>
                      <div style={{ fontSize: 11, color: isActive ? `${agent.color}cc` : '#334155' }}>
                        {isActive ? agent.desc : isDone ? '✓ Complete' : 'Waiting...'}
                      </div>
                    </div>
                    <div style={{ fontSize: 18 }}>
                      {isActive ? '⚙️' : isDone ? '✅' : '⏳'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Agent log stream */}
          {log.length > 0 && (
            <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '16px 20px', fontFamily: 'monospace' }}>
              <div style={{ fontSize: 11, color: '#475569', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>📟 Agent Log Stream</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
                {log.map((l, i) => (
                  <div key={i} style={{ fontSize: 12, color: l.color, animation: 'fadeIn 0.3s ease' }}>
                    <span style={{ color: '#334155', marginRight: 8 }}>{l.time}</span>{l.msg}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Result card */}
          {result && (
            <div style={{
              background: result.is_anomaly
                ? 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(239,68,68,0.05))'
                : 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.05))',
              border: `1px solid ${result.is_anomaly ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
              borderRadius: 16, padding: '24px', animation: 'fadeIn 0.4s ease',
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: result.is_anomaly ? '#f87171' : '#10b981', marginBottom: 12 }}>
                {result.is_anomaly ? '🚨 Anomaly Confirmed — Action Required' : '✅ System Healthy — No Action Needed'}
              </div>
              {result.is_anomaly && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                      { label: 'Anomaly Type', value: result.anomaly_type?.replace(/_/g, ' ') || '—', color: '#ef4444' },
                      { label: 'Recommended Action', value: result.recommended_action || '—', color: '#8b5cf6' },
                      { label: 'Potential Savings', value: `₹${(result.savings || 0).toLocaleString()}`, color: '#10b981' },
                      { label: 'Approval Required', value: result.approval_required ? '🔒 Yes' : '⚡ No — Auto', color: result.approval_required ? '#f59e0b' : '#10b981' },
                    ].map(item => (
                      <div key={item.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 14px' }}>
                        <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{item.label}</div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>🧠 Root Cause Analysis</div>
                    <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>{result.root_cause || 'Classified anomaly — agent rationale recorded to audit log.'}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
