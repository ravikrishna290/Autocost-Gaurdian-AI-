import { useEffect, useState, useRef } from 'react';
import { fetchData, detectIssues, fixAll, toggleRealtime, getRealtimeStatus } from '../api';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, RadarChart,
  Radar, PolarGrid, PolarAngleAxis,
} from 'recharts';

const DOMAIN_COLORS  = { Resource: '#6366f1', Spend: '#f59e0b', SLA: '#ef4444', FinOps: '#3b82f6' };
const DOMAIN_ICONS   = { Resource: '☁️', Spend: '💸', SLA: '⚠️', FinOps: '📒' };
const DOMAIN_GRADIENT= { Resource: '#6366f1', Spend: '#f59e0b', SLA: '#ef4444', FinOps: '#3b82f6' };

/* ── ANIMATED NUMBER ── */
function AnimNum({ value, prefix = '', decimals = 0, color }) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const target = parseFloat(value) || 0;
    const start = prev.current;
    const dur = 900;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = p < 0.5 ? 2*p*p : -1+(4-2*p)*p;
      setDisplay(start + (target - start) * eased);
      if (p < 1) requestAnimationFrame(tick);
      else { prev.current = target; }
    };
    requestAnimationFrame(tick);
  }, [value]);
  const formatted = decimals > 0
    ? display.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    : Math.round(display).toLocaleString();
  return <span style={color ? { color } : {}}>{prefix}{formatted}</span>;
}

/* ── DOMAIN RING ── */
function DomainRing({ label, count, total, color, icon, savings }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const r = 34; const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div style={{
      background: `linear-gradient(135deg, ${color}11, ${color}06)`,
      border: `1px solid ${color}30`, borderRadius: 18,
      padding: '20px 16px', textAlign: 'center',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'default',
      position: 'relative', overflow: 'hidden',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow=`0 12px 32px ${color}25`; }}
      onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}
    >
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, background: `${color}08`, borderRadius: '50%' }} />
      <svg width="84" height="84" viewBox="0 0 84 84" style={{ marginBottom: 8 }}>
        <circle cx="42" cy="42" r={r} fill="none" stroke={`${color}18`} strokeWidth="6" />
        <circle cx="42" cy="42" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          transform="rotate(-90 42 42)" style={{ transition: 'stroke-dasharray 1s ease' }}
        />
        <text x="42" y="38" textAnchor="middle" fill={color} fontSize="13" fontWeight="800">{icon}</text>
        <text x="42" y="54" textAnchor="middle" fill={color} fontSize="11" fontWeight="700">{count}</text>
      </svg>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f5f9', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 11, color: '#475569' }}>{count} monitored</div>
      {savings > 0 && (
        <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600, marginTop: 4 }}>
          ₹{savings.toLocaleString()} at risk
        </div>
      )}
    </div>
  );
}

/* ── LIVE FEED ITEM ── */
function FeedItem({ anomaly, idx }) {
  const color = DOMAIN_COLORS[anomaly.domain] || '#6366f1';
  return (
    <div style={{
      display: 'flex', gap: 12, padding: '12px 0',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      animation: `fadeIn 0.3s ease ${idx * 0.08}s both`,
    }}>
      <div style={{
        width: 8, height: 8, background: color, borderRadius: '50%',
        marginTop: 5, flexShrink: 0, boxShadow: `0 0 8px ${color}`,
        animation: 'pulse 2s infinite',
      }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, color: '#f1f5f9', fontWeight: 600, marginBottom: 2 }}>
          {anomaly.service_name}
          <span style={{ marginLeft: 8, fontSize: 10, background: `${color}22`, color, padding: '2px 7px', borderRadius: 20, fontWeight: 700 }}>
            {anomaly.domain}
          </span>
        </div>
        <div style={{ fontSize: 11, color: '#475569' }}>
          {anomaly.anomaly_type?.replace(/_/g,' ')} • ₹{parseFloat(anomaly.cost).toLocaleString()}
        </div>
      </div>
      <div style={{ fontSize: 11, color: anomaly.approval_required ? '#f59e0b' : '#10b981', fontWeight: 600, alignSelf: 'center' }}>
        {anomaly.approval_required ? '🔒 Review' : '⚡ Auto'}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#0c1322', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px', fontSize: 13 }}>
      <div style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color }}>₹{parseFloat(p.value).toLocaleString()}</div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, totalCost: 0 });
  const [anomalyCount, setAnomalyCount] = useState(0);
  const [potentialSavings, setPotentialSavings] = useState(0);
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [domainStats, setDomainStats] = useState({});
  const [domainSavings, setDomainSavings] = useState({});
  const [radarData, setRadarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fixing, setFixing] = useState(false);
  const [savedAmount, setSavedAmount] = useState(null);
  const [error, setError] = useState('');
  const [realTime, setRealTime] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    loadAll();
    getRealtimeStatus().then(res => setRealTime(res.real_time)).catch(console.error);
  }, []);

  useEffect(() => {
    if (realTime) {
      timerRef.current = setInterval(() => loadAll(true), 5000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [realTime]);

  async function loadAll(silent = false) {
    if (!silent) setLoading(true);
    setError('');
    try {
      const [dataRes, detectRes] = await Promise.all([fetchData(), detectIssues()]);
      const rows = dataRes.data || [];
      const detected = detectRes.anomalies || [];
      const domains = { Resource: 0, Spend: 0, SLA: 0, FinOps: 0 };
      const dsav = { Resource: 0, Spend: 0, SLA: 0, FinOps: 0 };
      let totalCost = 0;

      rows.forEach(r => {
        const d = r.domain || 'Resource';
        domains[d] = (domains[d] || 0) + 1;
        totalCost += parseFloat(r.cost || 0);
      });

      detected.forEach(a => {
        const d = a.domain || 'Resource';
        dsav[d] = (dsav[d] || 0) + parseFloat(a.cost || 0) * parseFloat(a.savings_pct || 0) / 100;
      });

      const bySvc = {};
      rows.forEach(r => {
        const svc = r.service_name || 'Unknown';
        bySvc[svc] = (bySvc[svc] || 0) + parseFloat(r.cost || 0);
      });

      const sorted = Object.entries(bySvc).sort((a,b) => b[1]-a[1]);
      setBarData(sorted.map(([name,cost]) => ({ name, cost: +cost.toFixed(0) })));
      setPieData(Object.entries(domains).filter(([,v])=>v>0).map(([name,value]) => ({name,value})));
      setDomainStats(domains);
      setDomainSavings(dsav);
      setStats({ total: rows.length, totalCost });
      setAnomalyCount(detectRes.anomaly_count || 0);
      setPotentialSavings(detectRes.total_potential_savings || 0);
      setAnomalies(detected.slice(0,6));
      setLastUpdated(new Date().toLocaleTimeString());
      setRadarData([
        { subject: 'Resource', score: Math.max(0, 100 - (domains.Resource > 0 ? ((detected.filter(a=>a.domain==='Resource').length / domains.Resource)*100) : 0)) },
        { subject: 'Spend',    score: Math.max(0, 100 - (domains.Spend > 0    ? ((detected.filter(a=>a.domain==='Spend').length / domains.Spend)*100) : 0)) },
        { subject: 'SLA',      score: Math.max(0, 100 - (domains.SLA > 0      ? ((detected.filter(a=>a.domain==='SLA').length / domains.SLA)*100) : 0)) },
        { subject: 'FinOps',   score: Math.max(0, 100 - (domains.FinOps > 0   ? ((detected.filter(a=>a.domain==='FinOps').length / domains.FinOps)*100) : 0)) },
      ]);
    } catch {
      setError('Backend offline. Start the FastAPI server on port 8000.');
    } finally {
      setLoading(false);
    }
  }

  async function handleFixAll() {
    setFixing(true);
    try {
      const res = await fixAll();
      setSavedAmount(res.total_saved || 0);
      await loadAll();
    } catch {
      setError('Failed to execute actions.');
    } finally {
      setFixing(false);
    }
  }

  const autoFixable = anomalies.filter(a => !a.approval_required).length;
  const pendingApproval = anomalies.filter(a => a.approval_required).length;
  const savingsPct = stats.totalCost > 0 ? ((potentialSavings / stats.totalCost) * 100).toFixed(1) : 0;

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* ── HERO HEADER ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(16,185,129,0.06) 50%, rgba(239,68,68,0.05) 100%)',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: 24, padding: '28px 36px', marginBottom: 28,
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          borderRadius: 24,
        }} />
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: -40, right: 80, width: 200, height: 200, background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -40, left: 120, width: 160, height: 160, background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
              <div style={{
                width: 52, height: 52,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, boxShadow: '0 0 30px rgba(99,102,241,0.5)',
              }}>🛡️</div>
              <div>
                <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', margin: 0, color: '#f1f5f9' }}>
                  AutoCost Guardian AI
                </h2>
                <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
                  Enterprise Cost Intelligence & Autonomous Remediation Platform
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, background: '#10b981', borderRadius: '50%', boxShadow: '0 0 8px #10b981', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>All Agents Operational</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#475569' }}>Last sync: <strong style={{ color: '#94a3b8' }}>{lastUpdated || '—'}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#475569' }}>5 AI Agents Active</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              className="btn btn-ghost"
              onClick={() => loadAll()}
              disabled={loading}
              style={{ gap: 8 }}
            >
              {loading ? <span className="spinner" /> : '🔄'} Refresh
            </button>
            <button
              className="btn btn-success"
              onClick={handleFixAll}
              disabled={fixing || loading}
              style={{ gap: 8, fontSize: 14, padding: '10px 22px' }}
            >
              {fixing ? <><span className="spinner" /> Executing…</> : '⚡ Auto-Remediate All'}
            </button>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
              background: realTime ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${realTime ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: 12, padding: '8px 16px', transition: 'all 0.3s',
            }}>
              <div style={{ width: 8, height: 8, background: realTime ? '#10b981' : '#475569', borderRadius: '50%', boxShadow: realTime ? '0 0 8px #10b981' : 'none', animation: realTime ? 'pulse 1.5s infinite' : 'none' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: realTime ? '#10b981' : '#475569' }}>
                {realTime ? 'Live' : 'Paused'}
              </span>
              <input type="checkbox" checked={realTime} onChange={async e => { setRealTime(e.target.checked); await toggleRealtime(e.target.checked); }} style={{ display: 'none' }} />
            </label>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: 24 }}>⚠️ {error}</div>}
      {savedAmount !== null && (
        <div className="alert alert-success" style={{ marginBottom: 24, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}>
          ✅ Autonomous remediation complete! <strong>₹{parseFloat(savedAmount).toLocaleString()}</strong> recovered this run
        </div>
      )}

      {/* ── KPI ROW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Monitored Assets', value: stats.total, icon: '🗄️', color: '#6366f1', sub: 'All domains' },
          { label: 'Anomalies Found', value: anomalyCount, icon: '🚨', color: '#ef4444', sub: 'Requiring action' },
          { label: 'Total Spend', value: `₹${Math.round(stats.totalCost).toLocaleString()}`, icon: '💸', color: '#f59e0b', sub: 'Monitored spend', raw: true },
          { label: 'Potential Savings', value: `₹${Math.round(potentialSavings).toLocaleString()}`, icon: '💰', color: '#10b981', sub: `${savingsPct}% of spend`, raw: true },
          { label: 'Auto-Executable', value: autoFixable, icon: '⚡', color: '#8b5cf6', sub: 'Instant fix ready' },
          { label: 'Needs Approval', value: pendingApproval, icon: '🔒', color: '#3b82f6', sub: 'Enterprise review' },
        ].map((kpi, i) => (
          <div key={i} style={{
            background: `linear-gradient(135deg, ${kpi.color}12, ${kpi.color}06)`,
            border: `1px solid ${kpi.color}25`,
            borderRadius: 16, padding: '18px 16px',
            position: 'relative', overflow: 'hidden',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'default',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 10px 28px ${kpi.color}20`; }}
            onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='none'; }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: kpi.color, opacity: 0.7 }} />
            <div style={{ position: 'absolute', top: -15, right: -10, fontSize: 36, opacity: 0.1 }}>{kpi.icon}</div>
            <div style={{ fontSize: 18, marginBottom: 8 }}>{kpi.icon}</div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569', marginBottom: 6 }}>{kpi.label}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: kpi.color, letterSpacing: '-0.02em', lineHeight: 1 }}>
              {loading ? <span style={{ color: '#334155' }}>—</span> : (kpi.raw ? kpi.value : <AnimNum value={kpi.value} color={kpi.color} />)}
            </div>
            <div style={{ fontSize: 11, color: '#334155', marginTop: 4 }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* ── DOMAIN HEALTH RINGS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {Object.entries(DOMAIN_ICONS).map(([domain, icon]) => (
          <DomainRing
            key={domain}
            label={domain}
            count={domainStats[domain] || 0}
            total={stats.total}
            color={DOMAIN_COLORS[domain]}
            icon={icon}
            savings={Math.round(domainSavings[domain] || 0)}
          />
        ))}
      </div>

      {/* ── CHARTS ROW 1 ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Bar Chart */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '24px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 15 }}>📊 Cost by Service (₹)</div>
            <span style={{ fontSize: 11, color: '#475569', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: 20 }}>All domains</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData} margin={{ top: 5, right: 5 }}>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                  <stop offset="100%" stopColor="#818cf8" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fill: '#334155', fontSize: 10 }} tickLine={false} axisLine={false} interval={0} angle={-12} textAnchor="end" height={36} />
              <YAxis tick={{ fill: '#334155', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="cost" fill="url(#barGrad)" radius={[8,8,0,0]} maxBarSize={42} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '24px 20px' }}>
          <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 15, marginBottom: 18 }}>🥧 Domain Distribution</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="48%" outerRadius={72} innerRadius={36}
                dataKey="value" paddingAngle={3}>
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={DOMAIN_COLORS[entry.name] || '#6366f1'} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip formatter={(v, n) => [v + ' records', n]} />
              <Legend
                iconType="circle" iconSize={8}
                formatter={v => <span style={{ color: '#94a3b8', fontSize: 12 }}>{v}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Radar health */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '24px 20px' }}>
          <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 15, marginBottom: 18 }}>🎯 Domain Health Score</div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11 }} />
              <Radar name="Health %" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
              <Tooltip formatter={v => [`${Math.round(v)}%`, 'Health Score']} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── LIVE ANOMALY FEED + STATS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 20 }}>
        {/* Live feed */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 15 }}>🔴 Live Anomaly Feed</div>
            <span style={{ fontSize: 10, background: 'rgba(239,68,68,0.15)', color: '#f87171', padding: '3px 10px', borderRadius: 20, fontWeight: 700, animation: 'pulse 2s infinite' }}>
              {anomalyCount} ACTIVE
            </span>
          </div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" style={{ width: 28, height: 28 }} /></div>
          ) : anomalies.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">✅</div><h3>All Clear!</h3><p>No anomalies detected</p></div>
          ) : (
            <div>
              {anomalies.map((a, i) => <FeedItem key={i} anomaly={a} idx={i} />)}
              <div style={{ marginTop: 14, textAlign: 'center' }}>
                <a href="/anomalies" style={{ fontSize: 12, color: '#6366f1', textDecoration: 'none', fontWeight: 600 }}>
                  View all {anomalyCount} anomalies →
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Savings breakdown + agent status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Savings per domain */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '24px', flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 15, marginBottom: 16 }}>💰 Savings Opportunity by Domain</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {Object.entries(DOMAIN_ICONS).map(([domain, icon]) => {
                const sav = domainSavings[domain] || 0;
                const maxSav = Math.max(...Object.values(domainSavings), 1);
                const pct = Math.round((sav / maxSav) * 100);
                return (
                  <div key={domain}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{icon} {domain}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: sav > 0 ? '#10b981' : '#334155' }}>
                        ₹{Math.round(sav).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 6 }}>
                      <div style={{
                        height: '100%', width: `${pct}%`,
                        background: `linear-gradient(90deg, ${DOMAIN_COLORS[domain]}, ${DOMAIN_COLORS[domain]}88)`,
                        borderRadius: 6, transition: 'width 1s ease',
                        boxShadow: sav > 0 ? `0 0 8px ${DOMAIN_COLORS[domain]}44` : 'none',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Agent status panel */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '20px 24px' }}>
            <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 15, marginBottom: 14 }}>🤖 Agent Status</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10 }}>
              {[
                { name: 'Data', icon: '🗄️', color: '#6366f1' },
                { name: 'Anomaly', icon: '🔍', color: '#f59e0b' },
                { name: 'Root Cause', icon: '🧠', color: '#3b82f6' },
                { name: 'Decision', icon: '⚖️', color: '#8b5cf6' },
                { name: 'Action', icon: '⚡', color: '#10b981' },
              ].map(ag => (
                <div key={ag.name} style={{
                  textAlign: 'center', background: `${ag.color}0d`, border: `1px solid ${ag.color}25`,
                  borderRadius: 12, padding: '10px 6px',
                }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{ag.icon}</div>
                  <div style={{ fontSize: 10, color: ag.color, fontWeight: 700 }}>{ag.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 4 }}>
                    <div style={{ width: 5, height: 5, background: '#10b981', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                    <span style={{ fontSize: 9, color: '#10b981' }}>OK</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
