import { useEffect, useState } from 'react';
import { fetchLogs, resetLogs } from '../api';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetchLogs();
      setLogs((res.logs || []).reverse());
    } catch {
      setError('Cannot fetch logs. Is FastAPI running?');
    } finally {
      setLoading(false);
    }
  }

  async function handleClear() {
    setClearing(true);
    try {
      await resetLogs();
      setLogs([]);
    } catch {
      setError('Failed to clear logs.');
    } finally {
      setClearing(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>📋 Audit Logs</h2>
        <p>Immutable record of every action taken by the AI agents</p>
      </div>

      {error && <div className="alert alert-danger">⚠️ {error}</div>}

      <div className="toolbar">
        <button className="btn btn-ghost" onClick={load} disabled={loading}>
          🔄 Refresh
        </button>
        <button className="btn btn-danger" onClick={handleClear} disabled={clearing || logs.length === 0}>
          {clearing ? <><span className="spinner" /> Clearing…</> : '🗑️ Clear Logs'}
        </button>
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>
          {logs.length} entries
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <span className="spinner" style={{ width: 28, height: 28 }} />
        </div>
      ) : logs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No Audit Logs Yet</h3>
          <p>Actions executed by the AI will appear here.</p>
        </div>
      ) : (
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Logged At</th>
                <th>Instance</th>
                <th>Service</th>
                <th>Intelligence Route</th>
                <th>Action Taken</th>
                <th>Execution Status</th>
                <th>Original Cost</th>
                <th>Savings (₹)</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr key={i}>
                  <td style={{ fontSize: 12 }}>{new Date(log.logged_at).toLocaleString()}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{log.instance_id}</td>
                  <td>{log.service_name}</td>
                  <td>
                    {log.model_used ? (
                      <div>
                        <span className={`badge ${log.model_used.includes('Gemini') ? 'badge-active' : 'badge-review'}`} style={{ marginBottom: 4 }}>
                          🧠 {log.model_used}
                        </span>
                        <div style={{ fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.3, maxWidth: 160, fontFamily: 'monospace' }}>
                          {log.routing_rationale}
                        </div>
                      </div>
                    ) : (
                      <span className="badge badge-idle">System Default</span>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{log.action_taken}</div>
                    {log.execution_status?.includes('FALLBACK') && (
                       <div style={{ fontSize: 9, color: 'var(--warning)', marginTop: 4 }}>Graceful Degradation Triggered</div>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${log.execution_status?.includes('Executed') ? 'badge-active' : log.execution_status?.includes('Blocked') ? 'badge-idle' : 'badge-review'}`}>
                      {log.execution_status}
                    </span>
                  </td>
                  <td>₹{parseFloat(log.original_cost || log.cost || 0).toLocaleString()}</td>
                  <td style={{ color: 'var(--success)', fontWeight: 700 }}>
                    ₹{parseFloat(log.estimated_savings || 0).toLocaleString()}
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
