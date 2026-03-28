import { NavLink, useNavigate } from 'react-router-dom';

const coreNav = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/anomalies', icon: '🔍', label: 'Anomaly Detection' },
  { to: '/actions',   icon: '⚡', label: 'Actions & Savings' },
  { to: '/data',      icon: '🗄️',  label: 'Raw Data' },
  { to: '/logs',      icon: '📋', label: 'Audit Logs' },
];

const aiNav = [
  { to: '/ai-chat',   icon: '🤖', label: 'CFO AI Assistant', hot: 'NEW' },
  { to: '/pipeline',  icon: '🧠', label: 'Agent Pipeline' },
  { to: '/simulator', icon: '🧪', label: 'Scenario Simulator', hot: 'LIVE' },
  { to: '/forecast',  icon: '📈', label: 'Cost Forecast' },
  { to: '/report',    icon: '🏢', label: 'Executive Report' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  return (
    <aside className="sidebar">
      <div className="sidebar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        {/* Animated Geometric Core Logo */}
        <div style={{ position:'relative', width:46, height:46, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:18 }}>
          <div style={{ position:'absolute', inset:-2, background:'conic-gradient(from 180deg at 50% 50%, #6366f1 0deg, #a855f7 180deg, #ec4899 360deg)', borderRadius:'14px', filter:'blur(10px)', opacity:0.8, animation:'spin 3s linear infinite' }} />
          <div style={{ position:'relative', width:42, height:42, background:'linear-gradient(135deg, #0f0728, #050117)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(255,255,255,0.15)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="url(#coreGradSide)"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="coreGradSide" x1="12" y1="2" x2="12" y2="12" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#e879f9"/>
                  <stop offset="1" stopColor="#a855f7"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
        
        <h1 style={{ fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1.2, letterSpacing: '-0.02em' }}>AutoCost<br />Guardian AI</h1>
        <p style={{ fontSize: 10, color: '#818cf8', fontWeight: 700, letterSpacing: '0.1em', marginTop: 6 }}>ENTERPRISE COST ENGINE</p>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Core Platform</div>
        {coreNav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}

        <div className="nav-section-label" style={{ marginTop: 16 }}>✨ AI Features</div>
        {aiNav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
            {item.hot && (
              <span style={{
                marginLeft: 'auto', fontSize: 9, fontWeight: 800,
                background: item.hot === 'LIVE'
                  ? 'linear-gradient(135deg, #10b981, #059669)'
                  : 'linear-gradient(135deg, #f59e0b, #ef4444)',
                color: '#fff', padding: '2px 6px', borderRadius: 20,
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>{item.hot}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="status-badge">
          <div className="status-dot" />
          <span>All Systems Operational</span>
        </div>
      </div>
    </aside>
  );
}
