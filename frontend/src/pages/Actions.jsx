import { useState } from 'react';
import { fixAll } from '../api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts';

export default function Actions() {
  const [results, setResults] = useState([]);
  const [totalSaved, setTotalSaved] = useState(0);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState('');
  const [ran, setRan] = useState(false);

  async function handleFixAll() {
    setExecuting(true);
    setError('');
    try {
      const res = await fixAll();
      setResults(res.results || []);
      setTotalSaved(res.total_saved || 0);
      setRan(true);
    } catch {
      setError('Backend unreachable. Please start FastAPI server.');
    } finally {
      setExecuting(false);
    }
  }

  const chartData = results.map(r => ({
    id: r.instance_id?.slice(-6),
    savings: r.estimated_savings,
  }));

  return (
    <div>
      <div className="page-header">
        <h2>⚡ Actions & Savings</h2>
        <p>Execute all recommended actions and measure the impact in real-time</p>
      </div>

      {error && <div className="alert alert-danger">⚠️ {error}</div>}

      {/* HERO SAVINGS */}
      {totalSaved > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(16,185,129,.15) 0%, rgba(6,185,100,.05) 100%)',
          border: '1px solid rgba(16,185,129,.3)',
          borderRadius: 'var(--radius-xl)',
          padding: '36px',
          marginBottom: 28,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 14, color: 'var(--success)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>
            Total Estimated Cost Savings
          </div>
          <div style={{ fontSize: 56, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>
            ₹{totalSaved.toLocaleString()}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
            {results.length} actions executed across your cloud fleet
          </div>
        </div>
      )}

      <div className="toolbar">
        <button className="btn btn-success" onClick={handleFixAll} disabled={executing}>
          {executing
            ? <><span className="spinner" /> Executing Actions…</>
            : '⚡ Detect & Fix All Issues'}
        </button>
        {results.length > 0 && (
          <span className="badge badge-active">{results.length} actions executed</span>
        )}
      </div>

      {ran && results.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <h3>No Actionable Anomalies</h3>
          <p>All resources are within healthy cost parameters.</p>
        </div>
      )}

      {results.length > 0 && (
        <>
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">
              <div className="card-title">💰 Savings per Instance (₹)</div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <XAxis dataKey="id" />
                <YAxis />
                <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Savings']} />
                <Bar dataKey="savings" fill="#10b981" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">📋 Execution Results</div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Instance/ID</th>
                  <th>Domain & Service</th>
                  <th>Action Taken</th>
                  <th>Status</th>
                  <th>Original Cost (₹)</th>
                  <th>Savings (₹)</th>
                  <th>Savings %</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.instance_id}</td>
                    <td>
                      <div style={{fontWeight: 600, fontSize: 12, color: 'var(--text-muted)'}}>{r.domain || 'Resource'}</div>
                      {r.service_name}
                    </td>
                    <td>{r.action_taken}</td>
                    <td>
                      {r.execution_status?.includes('Executed') ? (
                         <span className="badge badge-active">{r.execution_status}</span>
                      ) : r.execution_status?.includes('Pending') ? (
                         <span className="badge badge-review">⚙️ {r.execution_status}</span>
                      ) : (
                         <span className="badge badge-idle">{r.execution_status}</span>
                      )}
                    </td>
                    <td>₹{parseFloat(r.original_cost).toLocaleString()}</td>
                    <td style={{ color: r.estimated_savings > 0 ? 'var(--success)' : 'inherit', fontWeight: 700 }}>
                      ₹{parseFloat(r.estimated_savings).toLocaleString()}
                    </td>
                    <td style={{ color: 'var(--warning)' }}>{r.savings_pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
