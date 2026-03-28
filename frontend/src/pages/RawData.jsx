import { useEffect, useState } from 'react';
import { fetchData } from '../api';

export default function RawData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetchData();
      setData(res.data || []);
    } catch {
      setError('Cannot connect to backend. Is FastAPI running on port 8000?');
    } finally {
      setLoading(false);
    }
  }

  const filtered = filter === 'All' ? data : data.filter(r => (r.domain || 'Resource') === filter);

  return (
    <div>
      <div className="page-header">
        <h2>🗄️ Raw Enterprise Data</h2>
        <p>Complete dataset spanning Cloud, Vendor, SLA, and FinOps metrics</p>
      </div>

      {error && <div className="alert alert-danger">⚠️ {error}</div>}

      <div className="toolbar">
        {['All', 'Resource', 'Spend', 'SLA', 'FinOps'].map(f => (
          <button key={f} className={`btn ${filter === f ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(f)}>
            {f === 'All' ? '🌐 All Domains' : f}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>
          {filtered.length} records
        </span>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <span className="spinner" style={{ width: 28, height: 28 }} />
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Domain</th>
                <th>Service/Vendor</th>
                <th>Identifier</th>
                <th>Metric (Usage/Latency)</th>
                <th>Financials (₹)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i}>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(r.timestamp).toLocaleString()}</td>
                  <td><span className="badge badge-active">{r.domain || 'Resource'}</span></td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{r.service_name}</span>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.instance_id}</td>
                  <td>{r.usage_hours}</td>
                  <td style={{ fontWeight: 600 }}>₹{parseFloat(r.cost).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${r.status.includes('idle') || r.status.includes('warning') || r.status.includes('unreconciled') ? 'badge-idle' : 'badge-active'}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
