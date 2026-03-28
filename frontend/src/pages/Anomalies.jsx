import { useState } from 'react';
import { detectIssues, fixOne } from '../api';

const BADGE_MAP = {
  IDLE_HIGH_COST: 'badge-idle',
  SPIKE:          'badge-spike',
  DUPLICATE_INVOICE: 'badge-spike',
  VENDOR_RATE_SPIKE: 'badge-active',
  SLA_BREACH_RISK: 'badge-idle',
  RECONCILIATION_DISCREPANCY: 'badge-spike',
};

const ACTION_BADGE = {
  'Shutdown Instance':  'badge-shutdown',
  'Downscale Instance': 'badge-downscale',
  'Suspend Payment':    'badge-shutdown',
  'Reroute Traffic':    'badge-downscale',
};

export default function Anomalies() {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fixingId, setFixingId] = useState(null);
  const [done, setDone] = useState({});
  const [error, setError] = useState('');
  const [ran, setRan] = useState(false);

  async function handleDetect() {
    setLoading(true);
    setError('');
    try {
      const res = await detectIssues();
      setAnomalies(res.anomalies || []);
      setRan(true);
    } catch {
      setError('Could not reach backend. Ensure FastAPI is running on port 8000.');
    } finally {
      setLoading(false);
    }
  }

  async function handleFix(anomaly) {
    const id = anomaly.instance_id;
    setFixingId(id);
    try {
      const result = await fixOne(anomaly);
      setDone(prev => ({ ...prev, [id]: result }));
    } catch {
      setError('Action failed for ' + id);
    } finally {
      setFixingId(null);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>🔍 Anomaly Detection</h2>
        <p>AI-powered analysis of cost inefficiencies across all enterprise domains</p>
      </div>

      {error && <div className="alert alert-danger">⚠️ {error}</div>}

      <div className="toolbar">
        <button className="btn btn-primary" onClick={handleDetect} disabled={loading}>
          {loading ? <><span className="spinner"/> Analysing…</> : '🔍 Detect Issues'}
        </button>
        {anomalies.length > 0 && (
          <span className="badge badge-idle">{anomalies.length} anomalies found</span>
        )}
      </div>

      {ran && anomalies.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <h3>No Anomalies Detected</h3>
          <p>All enterprise resources are operating within normal cost and SLA boundaries.</p>
        </div>
      )}

      {anomalies.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">🚨 Detected Anomalies</div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {Object.keys(done).length} / {anomalies.length} resolved
            </span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Instance/ID</th>
                <th>Domain & Service</th>
                <th>Status</th>
                <th>Metric/Value</th>
                <th>Financial Impact</th>
                <th>Anomaly Type</th>
                <th>Root Cause</th>
                <th>Recommendation</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {anomalies.map(a => (
                <tr key={a.instance_id} style={done[a.instance_id] ? { opacity: 0.5 } : {}}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{a.instance_id}</td>
                  <td>
                    <div style={{fontWeight: 600, fontSize: 12, color: 'var(--text-muted)'}}>{a.domain}</div>
                    {a.service_name}
                  </td>
                  <td>
                    <span className={`badge ${a.status.includes('idle') || a.status.includes('warning') ? 'badge-idle' : 'badge-active'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td>{a.usage_hours}</td>
                  <td style={{ color: 'var(--danger)', fontWeight: 600 }}>₹{parseFloat(a.cost).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${BADGE_MAP[a.anomaly_type] || ''}`}>{a.anomaly_type.replace(/_/g, ' ')}</span>
                  </td>
                  <td style={{ fontSize: 12, maxWidth: 220, color: 'var(--text-secondary)' }}>{a.root_cause}</td>
                  <td>
                    <span className={`badge ${ACTION_BADGE[a.recommended_action] || 'badge-review'}`}>
                      {a.recommended_action}
                    </span>
                  </td>
                  <td>
                    {done[a.instance_id] ? (
                      <span style={{ color: 'var(--success)', fontSize: 12 }}>✅ Executed</span>
                    ) : (
                      a.approval_required ? (
                        <span style={{ color: 'var(--warning)', fontSize: 12, fontWeight: 600 }}>🔒 Workflow Review Required</span>
                      ) : (
                        <button
                          className="btn btn-success"
                          style={{ padding: '7px 14px', fontSize: 12 }}
                          onClick={() => handleFix(a)}
                          disabled={fixingId === a.instance_id}
                        >
                          {fixingId === a.instance_id ? <span className="spinner" /> : '⚡ Fix'}
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
