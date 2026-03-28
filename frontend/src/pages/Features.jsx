import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
  .f-body { margin:0; background:#050117; font-family:'Space Grotesk',sans-serif; color:#f1f5f9; }

  .f-glass {
    background: rgba(15,7,40,0.55);
    backdrop-filter: blur(28px) saturate(180%);
    border: 1px solid rgba(168,85,247,0.18);
    box-shadow: 0 8px 40px rgba(0,0,0,0.5), inset 0 0 30px rgba(168,85,247,0.04);
  }
  .f-glass-light {
    background: rgba(255,255,255,0.04);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.08);
  }
  .f-glow-purple { box-shadow: 0 0 40px rgba(168,85,247,0.35), 0 0 80px rgba(168,85,247,0.15); }
  .f-glow-pink { box-shadow: 0 0 40px rgba(236,72,153,0.35), 0 0 80px rgba(236,72,153,0.15); }
  .f-glow-blue { box-shadow: 0 0 40px rgba(59,130,246,0.35), 0 0 80px rgba(59,130,246,0.15); }

  .f-gradient-text {
    background: linear-gradient(135deg,#e879f9 0%,#a78bfa 45%,#60a5fa 100%);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }
  .f-gradient-text-alt {
    background: linear-gradient(135deg,#f472b6 0%,#c084fc 50%,#818cf8 100%);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }

  .f-reveal { opacity:0; transform:translateY(40px) scale(0.97); transition: opacity 0.7s cubic-bezier(.2,.8,.2,1), transform 0.7s cubic-bezier(.2,.8,.2,1); }
  .f-visible { opacity:1; transform:translateY(0) scale(1); }

  .f-feature-card {
    background: rgba(15,7,40,0.55);
    backdrop-filter: blur(28px);
    border: 1px solid rgba(168,85,247,0.15);
    border-radius: 28px;
    transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  }
  .f-feature-card:hover {
    transform: translateY(-8px) scale(1.01);
    border-color: rgba(168,85,247,0.45);
    box-shadow: 0 30px 80px rgba(0,0,0,0.5), 0 0 50px rgba(168,85,247,0.2);
  }

  .f-stat-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 20px;
    transition: background 0.3s, border-color 0.3s;
  }
  .f-stat-card:hover { background: rgba(168,85,247,0.08); border-color: rgba(168,85,247,0.3); }

  .f-terminal {
    background: #040919;
    border: 1px solid rgba(99,102,241,0.3);
    border-radius: 16px;
    font-family: 'JetBrains Mono', monospace;
  }
  .f-bar-fill { transition: width 1.5s cubic-bezier(.2,.8,.2,1); }

  @keyframes f-pulse { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.6;transform:scale(0.95);} }
  @keyframes f-float { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-12px);} }
  @keyframes f-spin-slow { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
  @keyframes f-scan { 0%{top:-2px;opacity:0;} 10%,90%{opacity:1;} 100%{top:100%;opacity:0;} }
  .f-scan-line { position:absolute; left:0; width:100%; height:1px; background:linear-gradient(90deg,transparent,rgba(168,85,247,0.8),transparent); animation:f-scan 4s linear infinite; }

  .f-tag { display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase; }
  .f-nav-btn { border:none;cursor:pointer;font-family:inherit; }
`;

const FEATURES = [
  {
    icon: '🧠',
    tag: 'Deep Intelligence',
    tagColor: 'rgba(168,85,247,0.15)',
    tagTextColor: '#c084fc',
    title: 'LLM-Powered Root Cause Analysis',
    desc: 'Our Diagnosis Agent doesn\'t just flag anomalies — it traces overspending to the exact Git commit, API key, or developer session responsible. Powered by LLM reasoning chains for human-readable explanations.',
    stats: [{ label: 'Diagnosis Speed', val: '< 1.1s' }, { label: 'Accuracy', val: '98.2%' }, { label: 'Blind Spots', val: '0' }],
    terminal: [
      { color: '#6366f1', text: '> Anomaly detected: EC2 spend +340%' },
      { color: '#94a3b8', text: '> Tracing causality graph...' },
      { color: '#a78bfa', text: '> Commit: a1b2c3d — j.doe@corp.com' },
      { color: '#4ade80', text: '> Root Cause: unoptimized SQL scaling event' },
      { color: '#f59e0b', text: '> Action: Terraform patch generated ✓' },
    ],
    glowClass: 'f-glow-purple',
    borderHover: '#a855f7',
    accentColor: '#a855f7',
  },
  {
    icon: '⚡',
    tag: 'Zero-Touch Action',
    tagColor: 'rgba(59,130,246,0.15)',
    tagTextColor: '#60a5fa',
    title: 'Self-Healing Infrastructure Engine',
    desc: 'The Action Agent deploys remediation IaC patches directly through secure AWS, Azure, and GCP hooks. No tickets. No email chains. The system autonomously terminates idle clusters and right-sizes overprovisioned compute in sub-second latency.',
    stats: [{ label: 'Avg Resolution', val: '< 0.4s' }, { label: 'Cloud Providers', val: '3+' }, { label: 'Human Effort', val: 'Zero' }],
    terminal: [
      { color: '#6366f1', text: '> Executing remediation: RDS-prod-07' },
      { color: '#94a3b8', text: '> Auth: arn:aws:iam::auto-cost-agent' },
      { color: '#60a5fa', text: '> Patch: terraform apply -auto-approve' },
      { color: '#4ade80', text: '> Status: TERMINATED (Saved ₹12,400/day)' },
    ],
    glowClass: 'f-glow-blue',
    borderHover: '#3b82f6',
    accentColor: '#3b82f6',
  },
  {
    icon: '⚖️',
    tag: 'Enterprise Safety',
    tagColor: 'rgba(236,72,153,0.15)',
    tagTextColor: '#f472b6',
    title: 'Human-in-the-Loop Approval Workflow',
    desc: 'High-risk remediations — like production service shutdowns or vendor SLA claims worth over ₹50k — are escalated to FinOps Leads or CTOs. The AI pre-generates the complete rationale, impact analysis, and a one-click approval package.',
    stats: [{ label: 'Risk Threshold', val: '₹50k+' }, { label: 'Approval SLA', val: '< 4 hrs' }, { label: 'Audit Trail', val: '100%' }],
    terminal: [
      { color: '#f59e0b', text: '⚠  HIGH-IMPACT ACTION QUEUED' },
      { color: '#94a3b8', text: '> Service: Vendor: Salesforce Inc.' },
      { color: '#f472b6', text: '> Risk: Production CRM. Requires CTO.' },
      { color: '#94a3b8', text: '> Awaiting: cto@enterprise.com approval' },
      { color: '#a78bfa', text: '> Audit log entry created ✓' },
    ],
    glowClass: 'f-glow-pink',
    borderHover: '#ec4899',
    accentColor: '#ec4899',
  },
];

const PIPELINE_AGENTS = [
  { n: 'Data Agent', icon: '🗄️', desc: 'Multi-cloud + ERP ingestion', color: '#6366f1' },
  { n: 'Anomaly Agent', icon: '🔍', desc: 'ML baseline deviation detection', color: '#8b5cf6' },
  { n: 'Diagnosis Agent', icon: '🧠', desc: 'LLM root cause chaining', color: '#a855f7' },
  { n: 'Decision Agent', icon: '⚖️', desc: 'ROI validation + risk score', color: '#d946ef' },
  { n: 'Action Agent', icon: '⚡', desc: 'IaC execution or escalation', color: '#ec4899' },
];

export default function FeaturesPage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const sectionRefs = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.1,
      color: Math.random() > 0.5 ? '168,85,247' : Math.random() > 0.5 ? '236,72,153' : '99,102,241',
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
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const dx = a.x - b.x, dy = a.y - b.y, dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(168,85,247,${0.12 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('f-visible'); } });
    }, { threshold: 0.1 });
    document.querySelectorAll('.f-reveal').forEach(el => obs.observe(el));

    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); obs.disconnect(); };
  }, []);

  return (
    <div className="f-body" style={{ background: '#050117', minHeight: '100vh', overflowX: 'hidden', color: '#f1f5f9' }}>
      <style>{STYLES}</style>

      {/* Canvas particle layer */}
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />

      {/* Hero BG Image */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'url(/features_hero_bg.png)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        opacity: 0.18,
      }} />
      {/* Dark overlay gradient */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: 'radial-gradient(ellipse at 50% 0%, rgba(168,85,247,0.25) 0%, transparent 60%), radial-gradient(ellipse at 100% 100%, rgba(236,72,153,0.15) 0%, transparent 50%), radial-gradient(ellipse at 0% 100%, rgba(99,102,241,0.15) 0%, transparent 50%)',
      }} />

      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* NAV */}
        <nav style={{
          position: 'fixed', top: 0, width: '100%', zIndex: 50,
          background: 'rgba(5,1,23,0.7)', backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(168,85,247,0.12)',
        }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
              <span style={{ fontSize: 28, filter: 'drop-shadow(0 0 12px rgba(168,85,247,0.8))' }}>🛡️</span>
              AutoCost Guardian AI
            </div>
            <div style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
              <a href="/features" style={{ color: '#fff', fontWeight: 700, textDecoration: 'none', borderBottom: '2px solid #a855f7', paddingBottom: 3 }}>Features</a>
              <a href="/architecture" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 500 }}>Architecture</a>
              <a href="/impact" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 500 }}>Impact</a>
            </div>
            <button className="f-nav-btn" onClick={() => navigate('/dashboard')} style={{
              background: 'linear-gradient(135deg,#a855f7,#ec4899)',
              color: '#fff', padding: '12px 28px', borderRadius: 999, fontWeight: 700, fontSize: 14,
              boxShadow: '0 0 30px rgba(168,85,247,0.4)',
            }}>
              Launch Dashboard →
            </button>
          </div>
        </nav>

        {/* HERO */}
        <section style={{ paddingTop: 160, paddingBottom: 80, textAlign: 'center', padding: '180px 40px 100px' }}>
          <div className="f-reveal" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px', borderRadius: 999, background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.35)', color: '#c084fc', fontSize: 11, fontWeight: 700, letterSpacing: '.18em', marginBottom: 40 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#a855f7', display: 'inline-block', animation: 'f-pulse 2s infinite' }} />
            AUTONOMOUS AI FEATURE SUITE
          </div>
          <h1 className="f-reveal" style={{ fontSize: 'clamp(52px,8vw,96px)', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-0.04em', marginBottom: 32, color: '#fff' }}>
            Enterprise AI.<br />
            <span className="f-gradient-text">Zero Human Delay.</span>
          </h1>
          <p className="f-reveal" style={{ fontSize: 20, color: '#94a3b8', maxWidth: 680, margin: '0 auto 60px', lineHeight: 1.7 }}>
            Five specialized AI agents working in continuous harmony — ingesting telemetry, detecting variance, tracing root cause, validating business impact, and executing remediations at machine speed.
          </p>

          {/* Quick Stats Row */}
          <div className="f-reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, maxWidth: 900, margin: '0 auto 80px' }}>
            {[
              { val: '₹1.3M+', label: 'Annual Recovery', color: '#c084fc' },
              { val: '< 2s', label: 'Detection Latency', color: '#60a5fa' },
              { val: '5', label: 'Specialized Agents', color: '#f472b6' },
              { val: '100%', label: 'Audit Coverage', color: '#34d399' },
            ].map((s, i) => (
              <div key={i} className="f-stat-card" style={{ padding: '28px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: s.color, letterSpacing: '-0.03em', fontFamily: "'JetBrains Mono',monospace" }}>{s.val}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 8, textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* PIPELINE VISUAL */}
        <section style={{ padding: '0px 40px 100px', maxWidth: 1280, margin: '0 auto' }}>
          <div className="f-reveal f-glass" style={{ borderRadius: 32, padding: '48px 40px', position: 'relative', overflow: 'hidden' }}>
            <div className="f-scan-line" />
            <h2 style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, letterSpacing: '.2em', color: '#6366f1', textTransform: 'uppercase', marginBottom: 40 }}>
              Continuous Agent Pipeline
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, flexWrap: 'wrap' }}>
              {PIPELINE_AGENTS.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
                    width: 160, padding: '24px 16px',
                    background: `rgba(${a.color === '#6366f1' ? '99,102,241' : a.color === '#8b5cf6' ? '139,92,246' : a.color === '#a855f7' ? '168,85,247' : a.color === '#d946ef' ? '217,70,239' : '236,72,153'},0.1)`,
                    border: `1px solid ${a.color}33`,
                    borderRadius: 20,
                  }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>{a.icon}</div>
                    <div style={{ fontWeight: 800, fontSize: 13, color: '#fff', marginBottom: 4 }}>{a.n}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{a.desc}</div>
                  </div>
                  {i < PIPELINE_AGENTS.length - 1 && (
                    <div style={{ width: 40, height: 2, background: `linear-gradient(90deg,${a.color},${PIPELINE_AGENTS[i+1].color})`, position: 'relative', flexShrink: 0 }}>
                      <div style={{ position: 'absolute', right: -5, top: '50%', transform: 'translateY(-50%)', width: 0, height: 0, borderLeft: `8px solid ${PIPELINE_AGENTS[i+1].color}`, borderTop: '5px solid transparent', borderBottom: '5px solid transparent' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURE DEEP DIVES */}
        {FEATURES.map((f, i) => (
          <section key={i} style={{ padding: '40px 40px 100px', maxWidth: 1280, margin: '0 auto' }}>
            <div className={`f-reveal f-feature-card`} style={{ display: 'grid', gridTemplateColumns: i % 2 === 0 ? '1fr 1fr' : '1fr 1fr', gap: 0, overflow: 'hidden' }}>
              {/* Content side */}
              <div style={{ order: i % 2 === 0 ? 0 : 1, padding: '60px 56px' }}>
                <span className="f-tag" style={{ background: f.tagColor, color: f.tagTextColor, border: `1px solid ${f.accentColor}33`, marginBottom: 24, display: 'inline-flex' }}>
                  {f.tag}
                </span>
                <div style={{ fontSize: 52, marginBottom: 16 }}>{f.icon}</div>
                <h2 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 20, color: '#fff', lineHeight: 1.1 }}>{f.title}</h2>
                <p style={{ fontSize: 16, color: '#94a3b8', lineHeight: 1.75, marginBottom: 40 }}>{f.desc}</p>

                {/* Mini stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 40 }}>
                  {f.stats.map((s, j) => (
                    <div key={j} style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${f.accentColor}22`, borderRadius: 14, padding: '16px 12px', textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: f.accentColor, fontFamily: "'JetBrains Mono',monospace" }}>{s.val}</div>
                      <div style={{ fontSize: 10, color: '#475569', marginTop: 4, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 600 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Terminal side */}
              <div style={{ order: i % 2 === 0 ? 1 : 0, background: 'rgba(4,9,25,0.8)', padding: '60px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderLeft: i % 2 === 0 ? `1px solid ${f.accentColor}22` : 'none', borderRight: i % 2 !== 0 ? `1px solid ${f.accentColor}22` : 'none' }}>
                <div className="f-terminal" style={{ padding: '28px 24px' }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 20, alignItems: 'center' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56' }} />
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f' }} />
                    <span style={{ marginLeft: 12, fontSize: 11, color: '#475569', fontFamily: "'JetBrains Mono',monospace" }}>autocost-agent — zsh</span>
                  </div>
                  {f.terminal.map((line, k) => (
                    <div key={k} style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: line.color, marginBottom: 8, lineHeight: 1.5 }}>
                      {line.text}
                    </div>
                  ))}
                  <div style={{ display: 'inline-block', width: 8, height: 16, background: f.accentColor, opacity: 0.8, animation: 'f-pulse 1s infinite', verticalAlign: 'middle', marginTop: 6 }} />
                </div>

                {/* Metric bar chart */}
                <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { label: 'Speed', pct: 97, color: f.accentColor },
                    { label: 'Accuracy', pct: 98, color: '#34d399' },
                    { label: 'Cost Reduction', pct: 85, color: '#60a5fa' },
                  ].map((bar, k) => (
                    <div key={k}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em' }}>
                        <span>{bar.label}</span><span style={{ color: bar.color }}>{bar.pct}%</span>
                      </div>
                      <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${bar.pct}%`, background: `linear-gradient(90deg,${bar.color}88,${bar.color})`, borderRadius: 99, boxShadow: `0 0 10px ${bar.color}` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* CTA */}
        <section style={{ padding: '60px 40px 140px', textAlign: 'center' }}>
          <div className="f-reveal" style={{ maxWidth: 800, margin: '0 auto' }}>
            <h2 style={{ fontSize: 56, fontWeight: 900, letterSpacing: '-0.03em', color: '#fff', marginBottom: 24, lineHeight: 1 }}>
              Ready to see it<br /><span className="f-gradient-text-alt">working live?</span>
            </h2>
            <p style={{ fontSize: 18, color: '#64748b', marginBottom: 48 }}>Launch the dashboard and watch the 5-agent pipeline run autonomously on real enterprise data.</p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/dashboard')} style={{
                background: 'linear-gradient(135deg,#a855f7,#ec4899)',
                color: '#fff', padding: '18px 48px', borderRadius: 16, fontWeight: 900, fontSize: 18,
                border: 'none', cursor: 'pointer', boxShadow: '0 0 50px rgba(168,85,247,0.5)',
                fontFamily: 'inherit', letterSpacing: '-0.01em',
              }}>
                Launch Dashboard →
              </button>
              <button onClick={() => navigate('/architecture')} style={{
                background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '18px 48px', borderRadius: 16,
                fontWeight: 700, fontSize: 18, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontFamily: 'inherit',
              }}>
                View Architecture
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
