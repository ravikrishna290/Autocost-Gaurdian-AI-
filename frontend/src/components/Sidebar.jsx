import { NavLink } from 'react-router-dom';

const coreNav = [
  { to: '/',          icon: '📊', label: 'Dashboard' },
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
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">🛡️</div>
        <h1>AutoCost<br />Guardian AI</h1>
        <p>Enterprise Cost Intelligence</p>
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
