import { useState } from 'react';
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8000' });

export default function ExecutiveReport() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function generateReport() {
    setLoading(true);
    setError('');
    try {
      const [detectRes, forecastRes] = await Promise.all([
        API.get('/detect'),
        API.get('/forecast'),
      ]);
      const anomalies = detectRes.data.anomalies || [];
      const summary = forecastRes.data.summary || {};
      const totalPotential = detectRes.data.total_potential_savings;

      const byDomain = {};
      for (const a of anomalies) {
        const d = a.domain || 'Resource';
        if (!byDomain[d]) byDomain[d] = { count: 0, savings: 0 };
        byDomain[d].count++;
        byDomain[d].savings += (parseFloat(a.cost) * parseFloat(a.savings_pct)) / 100;
      }

      setReport({ anomalies, summary, totalPotential, byDomain, generatedAt: new Date() });
    } catch {
      setError('Cannot reach backend. Ensure FastAPI is running on port 8000.');
    } finally {
      setLoading(false);
    }
  }

  function printReport() {
    window.print();
  }

  const domainColors = { Resource: '#6366f1', Spend: '#f59e0b', SLA: '#ef4444', FinOps: '#3b82f6' };
  const domainIcons = { Resource: '☁️', Spend: '💸', SLA: '⚠️', FinOps: '📒' };

  return (
    <div>
      <div className="page-header">
        <h2>🏢 Executive Impact Report</h2>
        <p>Auto-generate a board-room ready cost intelligence summary</p>
      </div>

      {error && <div className="alert alert-danger">⚠️ {error}</div>}

      {!report && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>📋</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>
            Generate Your Executive Intelligence Report
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
            The AI will compile findings from all agents into a comprehensive executive summary —
            ready to present to your CFO, CTO, or board.
          </p>
          <button className="btn btn-primary" style={{ fontSize: 16, padding: '16px 40px' }} onClick={generateReport} disabled={loading}>
            {loading ? <><span className="spinner" /> Analyzing Enterprise Data…</> : '⚡ Generate Executive Report'}
          </button>
        </div>
      )}

      {report && (
        <div id="executive-report">
          {/* Report Header */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(16,185,129,0.08))',
            border: '1px solid rgba(99,102,241,0.25)',
            borderRadius: 20, padding: '32px 40px', marginBottom: 32,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 11, color: '#6366f1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                  CONFIDENTIAL — EXECUTIVE BRIEFING
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.02em', marginBottom: 6 }}>
                  AutoCost Guardian AI
                </div>
                <div style={{ fontSize: 16, color: '#94a3b8' }}>Enterprise Cost Intelligence Report</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                  Generated: {report.generatedAt.toLocaleString()} • All data sourced from live operational systems
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Total Identified Savings</div>
                <div style={{ fontSize: 42, fontWeight: 900, color: '#10b981', letterSpacing: '-0.03em' }}>
                  ₹{parseFloat(report.totalPotential).toLocaleString()}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Immediately actionable</div>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>📌 Executive Summary</div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
              AutoCost Guardian AI conducted a comprehensive analysis of <strong style={{ color: '#f1f5f9' }}>{report.anomalies.length} operational anomalies</strong> across{' '}
              <strong style={{ color: '#f1f5f9' }}>{Object.keys(report.byDomain).length} enterprise domains</strong>. The analysis identified{' '}
              <strong style={{ color: '#10b981' }}>₹{parseFloat(report.totalPotential).toLocaleString()} in immediately recoverable costs</strong>,
              with an annualized projection of <strong style={{ color: '#6366f1' }}>₹{parseFloat(report.summary.projected_annual_savings || report.totalPotential * 12).toLocaleString()}</strong>.{' '}
              The system autonomously remediated {report.anomalies.filter(a => !a.approval_required).length} issues and escalated{' '}
              {report.anomalies.filter(a => a.approval_required).length} high-impact actions to enterprise approval workflows.
            </p>
          </div>

          {/* Domain Breakdown */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 20 }}>🗂️ Findings by Domain</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              {Object.entries(report.byDomain).map(([domain, stats]) => (
                <div key={domain} style={{
                  background: `${domainColors[domain]}11`,
                  border: `1px solid ${domainColors[domain]}33`,
                  borderRadius: 14, padding: '20px',
                }}>
                  <div style={{ fontSize: 24, marginBottom: 8 }}>{domainIcons[domain]}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: domainColors[domain], marginBottom: 4 }}>{domain}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9' }}>₹{stats.savings.toLocaleString()}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{stats.count} anomaly(ies) found</div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Recommendations */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>⚡ Top Recommended Actions</div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th><th>Domain</th><th>Asset</th><th>Issue</th><th>Action</th>
                  <th>Savings (₹)</th><th>Requires Approval</th>
                </tr>
              </thead>
              <tbody>
                {report.anomalies.map((a, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td><span className="badge badge-active" style={{ fontSize: 11 }}>{a.domain}</span></td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{a.instance_id}</td>
                    <td style={{ fontSize: 12 }}>{a.anomaly_type?.replace(/_/g, ' ')}</td>
                    <td style={{ fontSize: 12  }}>{a.recommended_action}</td>
                    <td style={{ fontWeight: 700, color: '#10b981' }}>
                      ₹{((parseFloat(a.cost) * parseFloat(a.savings_pct)) / 100).toLocaleString()}
                    </td>
                    <td>
                      {a.approval_required
                        ? <span className="badge badge-review">🔒 Yes</span>
                        : <span className="badge badge-active">✓ Auto</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 30-Day Forecast Summary */}
          {report.summary.projected_annual_savings && (
            <div style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(99,102,241,0.08))',
              border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: 16, padding: '24px 32px', marginBottom: 24,
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24,
            }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>30-Day Savings</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#10b981' }}>₹{report.summary.total_saved_30d?.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Annual Projection</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#6366f1' }}>₹{report.summary.projected_annual_savings?.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Anomalies Resolved</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#f1f5f9' }}>{report.anomalies.filter(a => !a.approval_required).length} / {report.anomalies.length}</div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-primary" onClick={printReport}>🖨️ Print / Save as PDF</button>
            <button className="btn btn-ghost" onClick={() => setReport(null)}>🔄 Regenerate Report</button>
          </div>
        </div>
      )}
    </div>
  );
}
