import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, BarChart, Bar,
} from 'recharts';

const API = axios.create({ baseURL: 'http://localhost:8000' });

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#0c1322', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 10, padding: '12px 16px', fontSize: 13,
    }}>
      <div style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <span>{p.name}:</span>
          <strong>₹{parseFloat(p.value).toLocaleString()}</strong>
        </div>
      ))}
    </div>
  );
};

export default function Forecast() {
  const [forecast, setForecast] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await API.get('/forecast');
      setForecast(res.data.forecast || []);
      setSummary(res.data.summary);
    } catch {
      setError('Cannot reach backend. Ensure FastAPI is running on port 8000.');
    } finally {
      setLoading(false);
    }
  }

  const domainData = [
    { domain: 'Cloud Resources', saved: 3270, color: '#6366f1' },
    { domain: 'Vendor / Spend', saved: 5000, color: '#f59e0b' },
    { domain: 'SLA Penalties', saved: 10000, color: '#ef4444' },
    { domain: 'FinOps Recon.', saved: 0, color: '#3b82f6' },
  ];

  return (
    <div>
      <div className="page-header">
        <h2>📈 Predictive Cost Forecast</h2>
        <p>30-day AI-powered projection — showing cost trajectory with and without AutoCost Guardian</p>
      </div>

      {error && <div className="alert alert-danger">⚠️ {error}</div>}

      {/* Summary KPIs */}
      {summary && (
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          <div className="kpi-card red">
            <div className="kpi-icon">📊</div>
            <div className="kpi-label">Spend Without Action</div>
            <div className="kpi-value" style={{ fontSize: 22 }}>₹{summary.total_without_intervention?.toLocaleString()}</div>
            <div className="kpi-sub">30-day projection</div>
          </div>
          <div className="kpi-card green">
            <div className="kpi-icon">🛡️</div>
            <div className="kpi-label">Spend With AutoCost</div>
            <div className="kpi-value" style={{ fontSize: 22 }}>₹{summary.total_with_autocost?.toLocaleString()}</div>
            <div className="kpi-sub">30-day optimized</div>
          </div>
          <div className="kpi-card amber">
            <div className="kpi-icon">💰</div>
            <div className="kpi-label">30-Day Savings</div>
            <div className="kpi-value" style={{ fontSize: 22, color: '#10b981' }}>₹{summary.total_saved_30d?.toLocaleString()}</div>
            <div className="kpi-sub">Prevented waste</div>
          </div>
          <div className="kpi-card blue">
            <div className="kpi-icon">📅</div>
            <div className="kpi-label">Annual Projection</div>
            <div className="kpi-value" style={{ fontSize: 22, color: '#6366f1' }}>₹{summary.projected_annual_savings?.toLocaleString()}</div>
            <div className="kpi-sub">Estimated yearly savings</div>
          </div>
        </div>
      )}

      {/* Main Area Chart */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">💹 30-Day Cost Trajectory</div>
          <button className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 14px' }} onClick={load}>
            🔄 Refresh
          </button>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60 }}><span className="spinner" style={{ width: 32, height: 32 }} /></div>
        ) : (
          <ResponsiveContainer width="100%" height={340}>
            <AreaChart data={forecast} margin={{ top: 10, right: 10 }}>
              <defs>
                <linearGradient id="gRed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 11 }} tickLine={false} interval={4} />
              <YAxis tick={{ fill: '#475569', fontSize: 11 }} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 13 }}>{value}</span>}
              />
              <Area
                type="monotone" dataKey="without_autocost" name="Without AutoCost"
                stroke="#ef4444" fill="url(#gRed)" strokeWidth={2}
              />
              <Area
                type="monotone" dataKey="with_autocost" name="With AutoCost Guardian"
                stroke="#10b981" fill="url(#gGreen)" strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Cumulative Savings Chart */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">📈 Cumulative Savings Over 30 Days</div>
          </div>
          {!loading && (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={forecast}>
                <defs>
                  <linearGradient id="gPurple" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} interval={6} />
                <YAxis tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(1)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone" dataKey="cumulative_saved" name="Cumulative Saved"
                  stroke="#6366f1" fill="url(#gPurple)" strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Domain Savings Breakdown */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">🥧 Savings by Domain</div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={domainData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#475569', fontSize: 11 }} tickLine={false} tickFormatter={v => `₹${v.toLocaleString()}`} />
              <YAxis type="category" dataKey="domain" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} width={100} />
              <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Savings']} />
              {domainData.map((d, i) => (
                <Bar key={d.domain} dataKey="saved" fill={d.color} radius={[0, 6, 6, 0]} maxBarSize={32} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ROI Statement */}
      {summary && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(16,185,129,0.07))',
          border: '1px solid rgba(99,102,241,0.25)', borderRadius: 18, padding: '24px 32px',
          display: 'flex', alignItems: 'center', gap: 24,
        }}>
          <div style={{ fontSize: 48 }}>🎯</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>
              AutoCost Guardian delivers <span style={{ color: '#10b981' }}>₹{summary.projected_annual_savings?.toLocaleString()}</span> in annual savings
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              Monitoring {' '}<strong style={{ color: '#f1f5f9' }}>4 enterprise domains</strong> with{' '}
              <strong style={{ color: '#f1f5f9' }}>zero manual intervention</strong> required for auto-executable actions.
              High-impact decisions escalate automatically to enterprise approval workflows.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
