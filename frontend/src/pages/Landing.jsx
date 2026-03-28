import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* ─────────────────────────────────────────
   GLOBAL STYLES  (scoped with l- prefix)
───────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');

  html.dark { background: #050117; }
  .l-body { margin:0; background:#050117; font-family:'Space Grotesk',sans-serif; color:#f1f5f9; overflow-x:hidden; }

  /* ── glass ──────────────────────────────── */
  .l-glass {
    background: rgba(15,7,40,0.5);
    backdrop-filter: blur(28px) saturate(180%);
    border: 1px solid rgba(168,85,247,0.15);
    box-shadow: 0 8px 40px rgba(0,0,0,0.5), inset 0 0 30px rgba(168,85,247,0.03);
  }
  .l-glass-light {
    background: rgba(255,255,255,0.03);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255,255,255,0.07);
  }

  /* ── text gradients ─────────────────────── */
  .l-grad-text {
    background: linear-gradient(135deg,#c0c1ff 0%,#a78bfa 50%,#4edea3 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  }
  .l-grad-text-hero {
    background: linear-gradient(135deg,#e879f9 0%,#a78bfa 40%,#60a5fa 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
  }

  /* ── scroll reveal ──────────────────────── */
  .l-reveal { opacity:0; transform:translateY(36px); transition:opacity .8s cubic-bezier(.2,.8,.2,1),transform .8s cubic-bezier(.2,.8,.2,1); }
  .l-visible { opacity:1; transform:translateY(0); }
  .l-delay-1 { transition-delay:.1s; }
  .l-delay-2 { transition-delay:.2s; }
  .l-delay-3 { transition-delay:.3s; }
  .l-delay-4 { transition-delay:.4s; }

  /* ── keyframes ──────────────────────────── */
  @keyframes l-pulse { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:.5;transform:scale(.9);} }
  @keyframes l-float { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-14px);} }
  @keyframes l-slide-in { from{opacity:0;transform:translateX(20px);} to{opacity:1;transform:translateX(0);} }
  @keyframes l-bar-expand { from{width:0;} to{width:var(--w);} }
  @keyframes l-blink { 0%,100%{opacity:1;} 50%{opacity:0;} }
  @keyframes l-spin { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
  @keyframes l-tick-up { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }
  @keyframes l-shimmer { 0%{background-position:-200% 0;} 100%{background-position:200% 0;} }
  @keyframes l-ping { 0%{transform:scale(1);opacity:.8;} 75%,100%{transform:scale(2);opacity:0;} }

  .l-float-anim { animation:l-float 6s ease-in-out infinite; }
  .l-blink-caret { animation:l-blink 1s step-end infinite; }

  /* ── floating nav pill ──────────────────── */
  .l-nav-wrapper {
    position: fixed; top: 24px; left: 0; width: 100%; z-index: 100;
    display: flex; justify-content: center; pointer-events: none;
  }
  .l-nav-pill {
    pointer-events: auto;
    width: calc(100% - 48px); max-width: 1200px;
    background: rgba(10,5,20,0.5);
    backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 20px;
    padding: 12px 24px;
    display: flex; align-items: center; justify-content: space-between;
    transition: all 0.4s cubic-bezier(0.2,0.8,0.2,1);
    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.1);
  }
  .l-nav-pill:hover {
    background: rgba(20,10,35,0.65);
    border-color: rgba(168,85,247,0.3);
    box-shadow: 0 30px 60px -10px rgba(99,102,241,0.25), inset 0 1px 1px rgba(255,255,255,0.15);
  }
  .l-nav a {
    color: #94a3b8; font-size: 14px; font-weight: 600; text-decoration: none;
    letter-spacing: 0.02em; padding: 8px 16px; border-radius: 12px;
    transition: all 0.2s; position: relative;
  }
  .l-nav a:hover {
    color: #fff; background: rgba(255,255,255,0.05); text-shadow: 0 0 10px rgba(255,255,255,0.3);
  }

  /* ── buttons ────────────────────────────── */
  .l-btn-primary {
    background: linear-gradient(135deg,#7c3aed,#6366f1);
    color:#fff; border:none; cursor:pointer; font-family:inherit;
    border-radius:14px; font-weight:800; letter-spacing:-.01em;
    transition:transform .2s,box-shadow .2s;
    box-shadow:0 0 40px rgba(99,102,241,.45);
  }
  .l-btn-primary:hover { transform:scale(1.04); box-shadow:0 0 60px rgba(99,102,241,.7); }
  .l-btn-secondary {
    background:rgba(255,255,255,.05); color:#fff; border:1px solid rgba(255,255,255,.12);
    cursor:pointer; font-family:inherit; border-radius:14px; font-weight:700;
    transition:background .2s;
  }
  .l-btn-secondary:hover { background:rgba(255,255,255,.09); }

  /* ── hero mockup ─────────────────────────── */
  .l-mockup-shell {
    background:rgba(10,5,30,.85);
    border:1px solid rgba(168,85,247,.25);
    border-radius:24px;
    box-shadow:0 0 80px rgba(99,102,241,.25), 0 40px 100px rgba(0,0,0,.6), inset 0 0 40px rgba(168,85,247,.05);
    overflow:hidden;
  }
  .l-shimmer-bar {
    background: linear-gradient(90deg,rgba(255,255,255,.03) 0%,rgba(168,85,247,.12) 50%,rgba(255,255,255,.03) 100%);
    background-size:200% 100%;
    animation:l-shimmer 2.5s linear infinite;
    border-radius:6px;
  }

  /* ── problem cards ────────────────────────── */
  .l-prob-card {
    border-radius:24px;
    transition:transform .3s,border-color .3s,box-shadow .3s;
    border-top-width:3px; border-top-style:solid;
  }
  .l-prob-card:hover { transform:translateY(-8px); box-shadow:0 30px 60px rgba(0,0,0,.5); }

  /* ── pipeline node ────────────────────────── */
  .l-pipe-node {
    background:rgba(15,7,40,.7);
    border:1px solid rgba(99,102,241,.25);
    border-radius:20px;
    transition:transform .3s,border-color .3s,box-shadow .3s;
  }
  .l-pipe-node:hover { transform:translateY(-6px) scale(1.05); border-color:rgba(99,102,241,.6); box-shadow:0 0 40px rgba(99,102,241,.2); }

  /* ── stat ─────────────────────────────────── */
  .l-stat { transition:transform .2s; }
  .l-stat:hover { transform:translateY(-4px); }

  /* ── scenario card ───────────────────────── */
  .l-scene-card {
    background:rgba(15,7,40,.5); border:1px solid rgba(255,255,255,.07);
    border-radius:28px; overflow:hidden;
    transition:transform .3s,border-color .3s;
  }
  .l-scene-card:hover { transform:translateY(-6px); box-shadow:0 30px 60px rgba(0,0,0,.5); }

  /* ── section divider ─────────────────────── */
  .l-divider { height:1px; background:linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent); }
`;

/* ─────────────────────────────────────────
   LIVE DASHBOARD MOCKUP  (fully animated)
───────────────────────────────────────── */
function LiveMockup() {
  const [anomalyCount, setAnomalyCount] = useState(3);
  const [savings, setSavings] = useState(42800);
  const [log, setLog] = useState([
    { color: '#6366f1', text: '> Agent loop started...' },
    { color: '#4edea3', text: '> Data Agent: telemetry loaded' },
    { color: '#a78bfa', text: '> Anomaly detected: EC2 +340%' },
  ]);
  const [bar1, setBar1] = useState(65);
  const [bar2, setBar2] = useState(45);
  const [agentStep, setAgentStep] = useState(0);
  const [metricTick, setMetricTick] = useState(false);

  const LOG_POOL = [
    { color: '#f59e0b', text: '> Root Cause: commit a1b2c3d' },
    { color: '#4edea3', text: '> Action executed: EC2 terminated' },
    { color: '#6366f1', text: '> Scanning vendor subs...' },
    { color: '#f472b6', text: '> HITL Queue: CTO approval needed' },
    { color: '#4ade80', text: '> Saved ₹12,400 today' },
    { color: '#a78bfa', text: '> Anomaly Agent: spike resolved' },
    { color: '#60a5fa', text: '> SLA breach detected: Azure' },
    { color: '#34d399', text: '> Credit claim filed: ₹43,200' },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      // Update log
      const newLine = LOG_POOL[Math.floor(Math.random() * LOG_POOL.length)];
      setLog(prev => [...prev.slice(-4), newLine]);

      // Animate bars
      setBar1(prev => Math.min(95, Math.max(20, prev + (Math.random() - 0.45) * 15)));
      setBar2(prev => Math.min(85, Math.max(15, prev + (Math.random() - 0.5) * 12)));

      // Cycle agent step
      setAgentStep(prev => (prev + 1) % 5);

      // Update metrics
      setMetricTick(t => !t);
      setSavings(prev => prev + Math.floor(Math.random() * 800 + 200));
      if (Math.random() > 0.7) setAnomalyCount(prev => Math.max(0, prev + (Math.random() > 0.5 ? 1 : -1)));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const agents = ['DATA', 'ANOMALY', 'DIAGNOSIS', 'DECISION', 'ACTION'];
  const agentColors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];

  return (
    <div className="l-float-anim" style={{ width: '100%' }}>
      <div className="l-mockup-shell">
        {/* Title bar */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,.06)', background:'rgba(0,0,0,.3)' }}>
          <div style={{ display:'flex', gap:7 }}>
            <div style={{ width:12,height:12,borderRadius:'50%',background:'#ff5f56' }} />
            <div style={{ width:12,height:12,borderRadius:'50%',background:'#ffbd2e' }} />
            <div style={{ width:12,height:12,borderRadius:'50%',background:'#27c93f' }} />
          </div>
          <div style={{ fontSize:11, color:'#475569', fontFamily:"'JetBrains Mono',monospace" }}>autocost-guardian — live</div>
          <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(78,222,163,.1)', border:'1px solid rgba(78,222,163,.25)', borderRadius:999, padding:'4px 10px', fontSize:10, fontWeight:800, color:'#4edea3', letterSpacing:'.08em' }}>
            <span style={{ width:6,height:6,borderRadius:'50%',background:'#4edea3',animation:'l-pulse 1.5s infinite',display:'inline-block' }} />
            LIVE
          </div>
        </div>

        <div style={{ padding:'18px 20px', display:'flex', flexDirection:'column', gap:14 }}>
          {/* Top metric row */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
            {[
              { label:'Total Saved', val:`₹${(savings/1000).toFixed(1)}k`, color:'#4edea3', icon:'💰' },
              { label:'Anomalies', val:anomalyCount, color:'#f59e0b', icon:'⚠️' },
              { label:'Agents Active', val:'5/5', color:'#6366f1', icon:'🤖' },
            ].map((m, i) => (
              <div key={i} style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.06)', borderRadius:12, padding:'10px 12px' }}>
                <div style={{ fontSize:9, color:'#475569', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:4, display:'flex', justifyContent:'space-between' }}>
                  <span>{m.label}</span><span>{m.icon}</span>
                </div>
                <div key={metricTick + i} style={{ fontSize:18, fontWeight:800, color:m.color, fontFamily:"'JetBrains Mono',monospace", animation:'l-tick-up .4s ease' }}>
                  {m.val}
                </div>
              </div>
            ))}
          </div>

          {/* Agent pipeline steps */}
          <div style={{ display:'flex', gap:4, alignItems:'center' }}>
            {agents.map((a, i) => (
              <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
                <div style={{
                  width:'100%', height:7, borderRadius:4,
                  background: i <= agentStep ? agentColors[i] : 'rgba(255,255,255,.07)',
                  boxShadow: i === agentStep ? `0 0 12px ${agentColors[i]}` : 'none',
                  transition:'background .5s,box-shadow .5s',
                }} />
                <div style={{ fontSize:7, color: i === agentStep ? agentColors[i] : '#334155', fontWeight:700, letterSpacing:'.06em', transition:'color .5s' }}>{a}</div>
              </div>
            ))}
          </div>

          {/* Chart bars */}
          <div style={{ background:'rgba(0,0,0,.3)', borderRadius:12, padding:'12px 14px', border:'1px solid rgba(255,255,255,.05)' }}>
            <div style={{ fontSize:9, color:'#475569', letterSpacing:'.1em', textTransform:'uppercase', marginBottom:10 }}>Cloud Spend Telemetry</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {[
                { label:'AWS EC2', pct:bar1, color:'#f59e0b' },
                { label:'Azure VMs', pct:bar2, color:'#6366f1' },
                { label:'GCP Compute', pct:38, color:'#34d399' },
              ].map((bar, i) => (
                <div key={i}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:9, marginBottom:4, color:'#64748b' }}>
                    <span>{bar.label}</span><span style={{ color:bar.color }}>{Math.round(bar.pct)}%</span>
                  </div>
                  <div style={{ height:5, background:'rgba(255,255,255,.05)', borderRadius:99, overflow:'hidden' }}>
                    <div style={{
                      height:'100%', width:`${bar.pct}%`, borderRadius:99,
                      background:`linear-gradient(90deg,${bar.color}88,${bar.color})`,
                      boxShadow:`0 0 8px ${bar.color}`,
                      transition:'width 1.6s cubic-bezier(.2,.8,.2,1)',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live terminal log */}
          <div style={{ background:'#040919', borderRadius:10, padding:'10px 14px', border:'1px solid rgba(99,102,241,.2)', fontFamily:"'JetBrains Mono',monospace", minHeight:90 }}>
            {log.map((l, i) => (
              <div key={i} style={{ fontSize:10, color:l.color, marginBottom:3, opacity: i === log.length-1 ? 1 : 0.5+i*0.15, animation: i === log.length-1 ? 'l-slide-in .4s ease' : 'none' }}>
                {l.text}
              </div>
            ))}
            <span style={{ fontSize:10, color:'#6366f1' }}>█</span>
          </div>

          {/* Anomaly ping badge */}
          {anomalyCount > 0 && (
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(245,158,11,.08)', border:'1px solid rgba(245,158,11,.25)', borderRadius:10, padding:'8px 14px' }}>
              <div style={{ position:'relative', width:10, height:10, flexShrink:0 }}>
                <div style={{ width:10,height:10,borderRadius:'50%',background:'#f59e0b',position:'absolute' }} />
                <div style={{ width:10,height:10,borderRadius:'50%',background:'#f59e0b',position:'absolute',animation:'l-ping 1.5s infinite',opacity:.6 }} />
              </div>
              <span style={{ fontSize:11, color:'#fbbf24', fontWeight:700 }}>{anomalyCount} anomalie{anomalyCount>1?'s':''} detected — agents remediating...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN LANDING PAGE
───────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  /* Canvas: particle network (same as Features page) */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 110 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.6 + 0.3,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.5 + 0.1,
      color: ['168,85,247', '99,102,241', '236,72,153', '78,222,163'][Math.floor(Math.random() * 4)],
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
        ctx.fill();
      });
      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(168,85,247,${0.1 * (1 - dist / 130)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    /* Scroll reveal observer */
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('l-visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.l-reveal').forEach(el => obs.observe(el));

    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); obs.disconnect(); };
  }, []);

  return (
    <div className="l-body">
      <style>{STYLES}</style>

      {/* ── Layered background ── */}
      <canvas ref={canvasRef} style={{ position:'fixed', inset:0, zIndex:0, pointerEvents:'none' }} />
      <div style={{ position:'fixed', inset:0, zIndex:0, backgroundImage:'url(/landing_hero_bg.png)', backgroundSize:'cover', backgroundPosition:'center', opacity:0.18 }} />
      <div style={{
        position:'fixed', inset:0, zIndex:0,
        background:'radial-gradient(ellipse at 30% 20%, rgba(124,58,237,.28) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(236,72,153,.15) 0%, transparent 45%), radial-gradient(ellipse at 60% 50%, rgba(99,102,241,.12) 0%, transparent 40%)',
      }} />

      <div style={{ position:'relative', zIndex:10 }}>
        {/* ━━━━ BRAND NEW FLOATING NAV PILL ━━━━ */}
        <div className="l-nav-wrapper">
          <nav className="l-nav l-nav-pill">
            <div onClick={() => navigate('/')} style={{ cursor:'pointer', display:'flex', alignItems:'center', gap:14 }}>
              {/* Core Engine Isometric Logo */}
              <div style={{ position:'relative', width:38, height:38, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <div style={{ position:'absolute', inset:-2, background:'conic-gradient(from 180deg at 50% 50%, #6366f1 0deg, #a855f7 180deg, #ec4899 360deg)', borderRadius:'12px', filter:'blur(8px)', opacity:0.8, animation:'l-spin 3s linear infinite' }} />
                <div style={{ position:'relative', width:36, height:36, background:'linear-gradient(135deg, #0f0728, #050117)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(255,255,255,0.15)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" fill="url(#coreGrad)"/>
                    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <defs>
                      <linearGradient id="coreGrad" x1="12" y1="2" x2="12" y2="12" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#e879f9"/>
                        <stop offset="1" stopColor="#a855f7"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              
              <div style={{ display:'flex', flexDirection:'column' }}>
                <div style={{ fontSize:19, fontWeight:900, color:'#fff', letterSpacing:'-.04em', lineHeight:1 }}>
                  AutoCost Guardian
                </div>
                <div style={{ fontSize:8.5, color:'#818cf8', fontWeight:700, letterSpacing:'.24em', textTransform:'uppercase', marginTop:3, fontFamily:"'JetBrains Mono',monospace" }}>
                  Autonomous Intelligence
                </div>
              </div>
            </div>

            {/* Central Nav Links */}
            <div style={{ display:'flex', gap:6, alignItems:'center', background:'rgba(0,0,0,0.4)', borderRadius:'14px', padding:'6px', border:'1px solid rgba(255,255,255,0.03)', boxShadow:'inset 0 4px 12px rgba(0,0,0,0.5)' }}>
              <a href="/features">Features</a>
              <a href="/architecture">Architecture</a>
              <a href="/impact">Impact</a>
            </div>

            {/* CTA */}
            <button className="l-btn-primary" onClick={() => navigate('/dashboard')} style={{ padding:'12px 24px', fontSize:14, borderRadius:'12px', display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ width:6, height:6, background:'#fff', borderRadius:'50%', animation:'l-pulse 1.5s infinite', boxShadow:'0 0 10px #fff' }} />
              Live System Deploy
            </button>
          </nav>
        </div>

        {/* ━━━━ HERO ━━━━ */}
        <section style={{ padding:'170px 40px 100px', maxWidth:1280, margin:'0 auto' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'center' }}>

            {/* Left copy */}
            <div className="l-reveal">
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'7px 18px', borderRadius:999, background:'rgba(99,102,241,.1)', border:'1px solid rgba(99,102,241,.3)', color:'#a78bfa', fontSize:11, fontWeight:700, letterSpacing:'.18em', marginBottom:36, fontFamily:"'JetBrains Mono',monospace" }}>
                <span style={{ width:8,height:8,borderRadius:'50%',background:'#6366f1',display:'inline-block',animation:'l-pulse 2s infinite' }} />
                AUTONOMOUS PROTOCOL ENGAGED
              </div>

              <h1 style={{ fontSize:'clamp(52px,7vw,88px)', fontWeight:900, letterSpacing:'-.04em', lineHeight:.88, marginBottom:28, color:'#fff' }}>
                Kill Cloud<br />
                <span className="l-grad-text-hero">Waste.</span>
              </h1>

              <p style={{ fontSize:18, color:'#94a3b8', maxWidth:520, lineHeight:1.75, marginBottom:44 }}>
                Next-generation autonomous agents that monitor, diagnose, and execute remediation on enterprise spend in real-time — with zero human lag.
              </p>

              <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:56 }}>
                <button className="l-btn-primary" onClick={() => navigate('/dashboard')} style={{ padding:'17px 42px', fontSize:17 }}>
                  Launch Dashboard →
                </button>
                <button className="l-btn-secondary" onClick={() => navigate('/pipeline')} style={{ padding:'17px 34px', fontSize:17, display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:13 }}>▶</span> Watch Pipeline
                </button>
              </div>

              {/* Hero stats */}
              <div style={{ display:'flex', gap:40, paddingTop:32, borderTop:'1px solid rgba(255,255,255,.06)' }}>
                {[
                  { val:'₹1.3M+', label:'Avg. Annual Recovery', color:'#c0c1ff' },
                  { val:'5 Agents', label:'Multi-Agent Core', color:'#4edea3' },
                  { val:'< 2s', label:'Reaction Latency', color:'#d0bcff' },
                ].map((s, i) => (
                  <div key={i} className="l-stat">
                    <div style={{ fontSize:28, fontWeight:900, color:s.color, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'-.03em' }}>{s.val}</div>
                    <div style={{ fontSize:10, color:'#475569', marginTop:4, textTransform:'uppercase', letterSpacing:'.12em', fontWeight:700 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: LIVE ANIMATED MOCKUP */}
            <div className="l-reveal l-delay-2" style={{ position:'relative' }}>
              {/* Glow halo behind card */}
              <div style={{ position:'absolute', inset:'-30px', background:'radial-gradient(ellipse at 50% 50%, rgba(99,102,241,.3) 0%, transparent 70%)', filter:'blur(40px)', zIndex:0 }} />
              <div style={{ position:'relative', zIndex:1 }}>
                <LiveMockup />
              </div>
              {/* Floating badge top-right */}
              <div style={{ position:'absolute', top:-42, right:10, zIndex:2, display:'flex', alignItems:'center', gap:8, padding:'10px 20px', borderRadius:999, background:'rgba(10,5,20,0.6)', border:'1px solid rgba(168,85,247,0.4)', fontSize:11, fontWeight:900, color:'#fff', backdropFilter:'blur(20px)', letterSpacing:'.06em', boxShadow:'0 10px 30px rgba(168,85,247,0.3)', transform:'translateZ(30px)' }}>
                <span style={{ animation:'l-ping .8s ease infinite', display:'inline-block', width:8, height:8, borderRadius:'50%', background:'#e879f9', boxShadow:'0 0 10px #e879f9' }} />
                LIVE AGENTS ACTIVE
              </div>
            </div>
          </div>
        </section>

        {/* ━━━━ PROBLEMS ━━━━ */}
        <section style={{ padding:'80px 40px 100px' }}>
          <div style={{ maxWidth:1280, margin:'0 auto' }}>
            <div className="l-reveal" style={{ textAlign:'center', marginBottom:72 }}>
              <h2 style={{ fontSize:'clamp(40px,6vw,72px)', fontWeight:900, letterSpacing:'-.03em', color:'#fff', marginBottom:16 }}>
                Bleeding Millions <span style={{ color:'#334155' }}>in Silence.</span>
              </h2>
              <div style={{ height:3, width:120, background:'linear-gradient(90deg,#6366f1,transparent)', margin:'0 auto', borderRadius:99 }} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:20 }}>
              {[
                { icon:'💸', title:'Idle Instances', desc:'Ghost compute nodes consuming enterprise budget with zero workload utilization.', color:'#ef4444', bg:'rgba(239,68,68,.08)' },
                { icon:'🔁', title:'Double Billing', desc:'Uncaught overlaps across fragmented multi-cloud accounts and SaaS vendors.', color:'#f59e0b', bg:'rgba(245,158,11,.08)' },
                { icon:'⚠️', title:'SLA Violations', desc:'Missed service credits for vendor downtime that manual audits never catch.', color:'#ef4444', bg:'rgba(239,68,68,.08)' },
                { icon:'📒', title:'Shadow Spending', desc:'Untracked IT expenditures lacking mapping to approved project codes.', color:'#6366f1', bg:'rgba(99,102,241,.08)' },
              ].map((item, i) => (
                <div key={i} className={`l-reveal l-delay-${i+1} l-prob-card l-glass`} style={{ padding:36, borderTopColor:item.color, background:item.bg }}>
                  <div style={{ fontSize:38, marginBottom:20 }}>{item.icon}</div>
                  <h3 style={{ fontSize:20, fontWeight:800, color:'#fff', marginBottom:12 }}>{item.title}</h3>
                  <p style={{ fontSize:14, color:'#64748b', lineHeight:1.7 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="l-divider" style={{ maxWidth:1280, margin:'0 auto 0' }} />

        {/* ━━━━ PIPELINE ━━━━ */}
        <section style={{ padding:'100px 40px', background:'rgba(255,255,255,.02)' }}>
          <div style={{ maxWidth:1280, margin:'0 auto' }}>
            <div className="l-reveal" style={{ textAlign:'center', marginBottom:72 }}>
              <h2 style={{ fontSize:'clamp(36px,5vw,62px)', fontWeight:900, letterSpacing:'-.03em', color:'#fff', marginBottom:12 }}>Autonomous Intelligence Chain</h2>
              <p style={{ color:'#64748b', fontSize:17 }}>Five specialized agents operating in a continuous execution loop.</p>
            </div>

            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'center', gap:0, position:'relative' }}>
              {/* Connector line */}
              <div style={{ position:'absolute', top:40, left:'10%', right:'10%', height:2, background:'linear-gradient(90deg,#6366f1,#a855f7,#ec4899)', opacity:.2, zIndex:0 }} />

              {[
                { icon:'🗄️', name:'Data Agent', desc:'Unified multi-cloud + ERP telemetry ingestion.' },
                { icon:'🔍', name:'Anomaly Agent', desc:'ML baseline deviation detection.' },
                { icon:'🧠', name:'RCA Agent', desc:'LLM causal chain reasoning.' },
                { icon:'⚖️', name:'Decision Agent', desc:'ROI validation + risk scoring.' },
                { icon:'⚡', name:'Action Agent', desc:'IaC remediation or HITL escalation.' },
              ].map((a, i) => (
                <div key={i} className={`l-reveal l-delay-${i+1}`} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', gap:16, position:'relative', zIndex:1 }}>
                  <div className="l-pipe-node" style={{ width:80, height:80, display:'flex', alignItems:'center', justifyContent:'center', fontSize:32 }}>
                    {a.icon}
                  </div>
                  <div style={{ fontSize:14, fontWeight:800, color:'#fff' }}>{a.name}</div>
                  <div style={{ fontSize:12, color:'#475569', maxWidth:140, lineHeight:1.5 }}>{a.desc}</div>
                </div>
              ))}
            </div>

            {/* HITL badges */}
            <div style={{ marginTop:64, display:'flex', justifyContent:'center', gap:20, flexWrap:'wrap' }}>
              {[
                { icon:'⚡', label:'Auto-Resolved', sub:'Safe optimizations deployed instantly.', color:'#4edea3', border:'rgba(78,222,163,.3)' },
                { icon:'🔒', label:'Human-in-Loop', sub:'High-impact changes routed for approval.', color:'#f59e0b', border:'rgba(245,158,11,.3)' },
              ].map((b, i) => (
                <div key={i} className="l-reveal l-glass" style={{ display:'flex', alignItems:'center', gap:16, padding:'20px 32px', borderRadius:20, border:`1px solid ${b.border}` }}>
                  <span style={{ fontSize:26, color:b.color }}>{b.icon}</span>
                  <div>
                    <div style={{ fontWeight:800, color:'#fff', fontSize:16 }}>{b.label}</div>
                    <div style={{ fontSize:12, color:'#475569' }}>{b.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ━━━━ SCENARIOS ━━━━ */}
        <section style={{ padding:'100px 40px' }}>
          <div style={{ maxWidth:1280, margin:'0 auto' }}>
            <div className="l-reveal" style={{ textAlign:'center', marginBottom:72 }}>
              <h2 style={{ fontSize:'clamp(36px,5vw,62px)', fontWeight:900, letterSpacing:'-.03em', color:'#fff', marginBottom:12 }}>Enterprise Master Scenarios</h2>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:24 }}>
              {[
                { tag:'VENDOR LEAK', tagColor:'#f59e0b', border:'rgba(245,158,11,.35)', title:'Duplicate SaaS Detection', desc:'Redundant enterprise CRM subs across isolated departments.', times:['0.4s','1.1s','INSTANT'], timeColors:['#6366f1','#f59e0b','#4ade80'], saving:'₹42k Monthly Recurring', savingColor:'#4edea3', footerBg:'rgba(99,102,241,.05)' },
                { tag:'COMPUTE SPIKE', tagColor:'#ef4444', border:'rgba(239,68,68,.35)', title:'Runaway SQL Scaling', desc:'Unoptimized queries triggering aggressive AWS auto-scaling events.', times:['0.2s','0.8s','AWAITING CTO'], timeColors:['#6366f1','#f59e0b','#64748b'], saving:'₹120k Projected Spill Stopped', savingColor:'#f59e0b', footerBg:'rgba(239,68,68,.05)' },
                { tag:'SLA AUDIT', tagColor:'#4ade80', border:'rgba(74,222,128,.35)', title:'Zero-Claim Recovery', desc:'AI filed Azure credits after detecting undocumented regional lag.', times:['0.5s','2.0s','AUTOMATIC'], timeColors:['#6366f1','#f59e0b','#4ade80'], saving:'₹115k Net Recovery', savingColor:'#4ade80', footerBg:'rgba(74,222,128,.05)' },
              ].map((s, i) => (
                <div key={i} className={`l-reveal l-delay-${i+1} l-scene-card`} style={{ border:`1px solid ${s.border}` }}>
                  <div style={{ padding:'36px 32px', flex:1 }}>
                    <div style={{ fontSize:10, fontWeight:800, letterSpacing:'.18em', color:s.tagColor, marginBottom:20 }}>{s.tag}</div>
                    <h3 style={{ fontSize:24, fontWeight:900, color:'#fff', marginBottom:12, letterSpacing:'-.01em' }}>{s.title}</h3>
                    <p style={{ fontSize:14, color:'#64748b', lineHeight:1.65, marginBottom:28 }}>{s.desc}</p>
                    <div style={{ display:'flex', flexDirection:'column', gap:8, fontFamily:"'JetBrains Mono',monospace", fontSize:12 }}>
                      {['DETECTED','DIAGNOSED','RESOLVED'].map((stage, j) => (
                        <div key={j} style={{ color:s.timeColors[j] }}>{stage} • {s.times[j]}</div>
                      ))}
                    </div>
                  </div>
                  <div style={{ background:s.footerBg, padding:'18px 32px', borderTop:'1px solid rgba(255,255,255,.04)' }}>
                    <div style={{ fontSize:12, color:s.savingColor, fontWeight:800, fontFamily:"'JetBrains Mono',monospace" }}>
                      {i===1?'PROTECTED: ':'SAVINGS: '}{s.saving}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ━━━━ IMPACT NUMBERS ━━━━ */}
        <section style={{ padding:'100px 40px 120px' }}>
          <div style={{ maxWidth:1280, margin:'0 auto', textAlign:'center' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:40 }}>
              {[
                { val:'₹1,300k', label:'Annual Savings Recouped', grad:true },
                { val:'< 2s', label:'Average Detection Time', grad:false },
                { val:'5', label:'Specialized Agents', grad:true },
                { val:'100%', label:'Audit Trail Coverage', grad:false },
              ].map((s, i) => (
                <div key={i} className={`l-reveal l-delay-${i+1}`}>
                  <div style={{ fontSize:'clamp(40px,5vw,68px)', fontWeight:900, letterSpacing:'-.03em', ...(s.grad ? {} : { color:'#fff' }), ...(s.grad ? { background:'linear-gradient(135deg,#c0c1ff,#a78bfa,#4edea3)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' } : {}) }}>
                    {s.val}
                  </div>
                  <div style={{ fontSize:10, color:'#475569', marginTop:10, textTransform:'uppercase', letterSpacing:'.18em', fontWeight:700 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ━━━━ CTA FOOTER ━━━━ */}
        <footer style={{ padding:'60px 40px 80px', borderTop:'1px solid rgba(255,255,255,.05)' }}>
          <div style={{ maxWidth:900, margin:'0 auto', textAlign:'center' }}>
            <div className="l-reveal">
              <h2 style={{ fontSize:'clamp(44px,6vw,82px)', fontWeight:900, letterSpacing:'-.04em', color:'#fff', lineHeight:1, marginBottom:48 }}>
                Scale Intelligence,<br />
                <span style={{ background:'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Not Costs.</span>
              </h2>
              <button className="l-btn-primary" onClick={() => navigate('/dashboard')} style={{ padding:'20px 60px', fontSize:20 }}>
                Launch Dashboard Today
              </button>
            </div>
            <div style={{ height:1, background:'linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent)', margin:'60px 0 40px' }} />
            <div className="l-reveal" style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                {/* Footer Core Logo */}
                <div style={{ position:'relative', width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <div style={{ position:'relative', width:28, height:28, background:'linear-gradient(135deg, #0f0728, #050117)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid rgba(255,255,255,0.2)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#e879f9"/>
                      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <div style={{ fontSize:22, fontWeight:900, color:'#fff', letterSpacing:'-.02em' }}>
                  AutoCost Guardian <span style={{ color:'#a855f7' }}>AI</span>
                </div>
              </div>
              
              <p style={{ color:'#94a3b8', fontSize:14, fontWeight:500 }}>The standard for autonomous cost engineering. Built for ET AI Hackathon 2026.</p>
              
              <div style={{ color:'#64748b', fontSize:11, letterSpacing:'.3em', textTransform:'uppercase', marginTop:16, fontWeight:600 }}>
                © 2026 AUTOCOST GUARDIAN. ALL RIGHTS RESERVED.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
