import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
  .i-body { margin:0; background:#010e06; font-family:'Space Grotesk',sans-serif; color:#f0fdf4; }

  .i-glass {
    background: rgba(1,14,6,0.55);
    backdrop-filter: blur(28px) saturate(160%);
    border: 1px solid rgba(16,185,129,0.18);
    box-shadow: 0 8px 40px rgba(0,0,0,0.5), inset 0 0 30px rgba(16,185,129,0.04);
    border-radius: 28px;
  }
  .i-glass-light {
    background: rgba(255,255,255,0.025);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(16,185,129,0.08);
    border-radius: 20px;
  }

  .i-gradient-text {
    background: linear-gradient(135deg,#4ade80 0%,#34d399 50%,#06b6d4 100%);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }
  .i-gradient-text-neg {
    background: linear-gradient(135deg,#f87171 0%,#fb923c 100%);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }

  .i-reveal { opacity:0; transform:translateY(40px); transition: opacity 0.8s cubic-bezier(.2,.8,.2,1), transform 0.8s cubic-bezier(.2,.8,.2,1); }
  .i-visible { opacity:1; transform:translateY(0); }

  .i-card {
    background: rgba(1,14,6,0.6);
    border: 1px solid rgba(16,185,129,0.15);
    border-radius: 28px;
    transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s;
  }
  .i-card:hover {
    transform: translateY(-6px);
    border-color: rgba(16,185,129,0.5);
    box-shadow: 0 30px 80px rgba(0,0,0,0.5), 0 0 50px rgba(16,185,129,0.15);
  }

  @keyframes i-count { from{opacity:0;transform:scale(0.8);} to{opacity:1;transform:scale(1);} }
  @keyframes i-pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
  @keyframes i-breathe { 0%,100%{opacity:0.7;transform:scale(1);} 50%{opacity:1;transform:scale(1.03);} }
  @keyframes i-bar { from{width:0;} to{width:var(--target-w);} }

  .i-animated-num { animation:i-count 0.5s cubic-bezier(.2,.8,.2,1) forwards; }
  .i-bar-fill { animation: i-bar 1.8s cubic-bezier(.2,.8,.2,1) forwards; }

  .i-roi-bar-good { background: linear-gradient(90deg, #10b981, #34d399); box-shadow: 0 0 12px #10b981; }
  .i-roi-bar-bad { background: linear-gradient(90deg, #ef4444, #fb923c); box-shadow: 0 0 8px #ef444444; }
`;

const SCENARIOS = [
  { tag: 'VENDOR LEAK', label: 'Duplicate SaaS', saving: '₹42,000', period: '/Month', detection: '0.4s', resolution: 'Instant', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)' },
  { tag: 'COMPUTE SPIKE', label: 'Runaway SQL EC2', saving: '₹1,20,000', period: 'Protected', detection: '0.2s', resolution: 'Pending CTO', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)' },
  { tag: 'SLA RECOVERY', label: 'Azure Credit Claim', saving: '₹1,15,000', period: 'Recovered', detection: '0.5s', resolution: 'Automatic', color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.3)' },
];

const COMPARISON = [
  { metric: 'Detection Time', manual: '21 Days', ai: '< 2 Seconds', manualPct: 100, aiPct: 1 },
  { metric: 'Accuracy Rate', manual: '61%', ai: '98.2%', manualPct: 61, aiPct: 98 },
  { metric: 'Cloud Waste', manual: '22% of budget', ai: '< 3% of budget', manualPct: 88, aiPct: 12 },
  { metric: 'FTE Hours Required', manual: '1,500 hrs/yr', ai: '< 20 hrs/yr', manualPct: 100, aiPct: 2 },
];

function AnimatedNumber({ target, prefix = '', suffix = '' }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const duration = 1800;
        const step = (timestamp) => {
          if (!start) start = timestamp;
          const progress = Math.min((timestamp - start) / duration, 1);
          setVal(Math.floor(progress * target));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

export default function ImpactPage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId, t = 0;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    // Firefly particles
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.6 + 0.1,
    }));

    const draw = () => {
      t += 0.003;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Aurora waves
      [0, 0.4, 0.8].forEach((off, i) => {
        const g = ctx.createLinearGradient(0, canvas.height * 0.3, 0, canvas.height * 0.8);
        g.addColorStop(0, `rgba(16,185,129,${0.03 + i * 0.01})`);
        g.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        for (let x = 0; x <= canvas.width; x += 20) {
          const y = canvas.height * 0.6 + Math.sin((x / canvas.width) * Math.PI * 4 + t + off) * 80 + Math.cos(t * 0.5 + off) * 40;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fillStyle = g;
        ctx.fill();
      });

      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(52,211,153,${p.alpha})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('i-visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.i-reveal').forEach(el => obs.observe(el));

    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); obs.disconnect(); };
  }, []);

  return (
    <div className="i-body" style={{ background: '#010e06', minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{STYLES}</style>

      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'url(/impact_hero_bg.png)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        opacity: 0.15,
      }} />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: 'radial-gradient(ellipse at 50% 0%, rgba(16,185,129,0.2) 0%, transparent 55%), radial-gradient(ellipse at 100% 50%, rgba(6,182,212,0.1) 0%, transparent 40%)',
      }} />

      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* NAV */}
        <nav style={{
          position: 'fixed', top: 0, width: '100%', zIndex: 50,
          background: 'rgba(1,14,6,0.8)', backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(16,185,129,0.1)',
        }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
              <span style={{ fontSize: 28, filter: 'drop-shadow(0 0 12px rgba(16,185,129,0.9))' }}>🛡️</span>
              AutoCost Guardian AI
            </div>
            <div style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
              <a href="/features" style={{ color: '#4ade8088', textDecoration: 'none', fontWeight: 500 }}>Features</a>
              <a href="/architecture" style={{ color: '#4ade8088', textDecoration: 'none', fontWeight: 500 }}>Architecture</a>
              <a href="/impact" style={{ color: '#fff', fontWeight: 700, textDecoration: 'none', borderBottom: '2px solid #4ade80', paddingBottom: 3 }}>Impact</a>
            </div>
            <button onClick={() => navigate('/dashboard')} style={{
              background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)',
              color: '#4ade80', padding: '12px 28px', borderRadius: 999,
              fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Live Dashboard →
            </button>
          </div>
        </nav>

        {/* HERO */}
        <section style={{ padding: '180px 40px 80px', textAlign: 'center' }}>
          <div className="i-reveal" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px', borderRadius: 999, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#4ade80', fontSize: 11, fontWeight: 700, letterSpacing: '.18em', marginBottom: 40 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'i-pulse 2s infinite' }} />
            VERIFIED BUSINESS IMPACT · FY 2026
          </div>
          <div className="i-reveal" style={{ fontSize: 'clamp(80px,14vw,180px)', fontWeight: 900, letterSpacing: '-0.06em', lineHeight: 0.85, marginBottom: 16, color: '#fff' }}>
            <span className="i-gradient-text">
              <AnimatedNumber target={1300000} prefix="₹" />
            </span>
          </div>
          <h2 className="i-reveal" style={{ fontSize: 28, fontWeight: 700, color: '#4ade8099', letterSpacing: '-0.01em', marginBottom: 16 }}>
            Annualized Net Recovery
          </h2>
          <p className="i-reveal" style={{ fontSize: 18, color: '#166534', maxWidth: 600, margin: '0 auto 80px', lineHeight: 1.7 }}>
            Across cloud compute waste, duplicate vendor subscriptions, and unclaimed SLA credits — recovered fully autonomously.
          </p>
        </section>

        {/* BIG 4 NUMBERS */}
        <section style={{ padding: '0 40px 80px', maxWidth: 1280, margin: '0 auto' }}>
          <div className="i-reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
            {[
              { num: 1300000, prefix: '₹', suffix: '', label: 'Annual Savings', sub: 'Total recovered value', color: '#4ade80', glow: '#10b981' },
              { num: 2, prefix: '< ', suffix: 's', label: 'Detection Time', sub: 'Avg. anomaly detection', color: '#34d399', glow: '#10b981' },
              { num: 1500, prefix: '', suffix: '+', label: 'Hours Saved', sub: 'FTE time reclaimed', color: '#06b6d4', glow: '#06b6d4' },
              { num: 100, prefix: '', suffix: '%', label: 'Audit Coverage', sub: 'Zero blind spots', color: '#818cf8', glow: '#818cf8' },
            ].map((s, i) => (
              <div key={i} className="i-glass" style={{ padding: '40px 28px', textAlign: 'center', boxShadow: `0 0 40px ${s.glow}22` }}>
                <div style={{ fontSize: 48, fontWeight: 900, color: s.color, fontFamily: "'JetBrains Mono',monospace", letterSpacing: '-0.04em', lineHeight: 1 }}>
                  {s.prefix}<AnimatedNumber target={s.num} />{s.suffix}
                </div>
                <div style={{ fontWeight: 800, color: '#fff', fontSize: 15, marginTop: 14, marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: '#166534' }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </section>

        {/* COMPARISON TABLE */}
        <section style={{ padding: '0px 40px 80px', maxWidth: 1280, margin: '0 auto' }}>
          <div className="i-reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 48, fontWeight: 900, letterSpacing: '-0.03em', color: '#fff', marginBottom: 12 }}>
              Manual FinOps vs <span className="i-gradient-text">Autonomous AI</span>
            </h2>
            <p style={{ color: '#166534', fontSize: 16 }}>Side-by-side comparison across every critical performance dimension</p>
          </div>

          <div className="i-reveal i-glass" style={{ overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, background: 'rgba(0,0,0,0.3)', padding: '20px 32px', borderBottom: '1px solid rgba(16,185,129,0.1)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '.12em' }}>Metric</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '.12em', textAlign: 'center' }}>❌ Manual FinOps</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '.12em', textAlign: 'center' }}>✅ AutoCost Guardian AI</div>
            </div>

            {COMPARISON.map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, padding: '24px 32px', borderBottom: i < COMPARISON.length - 1 ? '1px solid rgba(16,185,129,0.06)' : 'none', background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                <div style={{ fontWeight: 700, color: '#94a3b8', fontSize: 15, display: 'flex', alignItems: 'center' }}>{row.metric}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 24 }}>
                  <div style={{ fontWeight: 800, color: '#f87171', fontSize: 18, fontFamily: "'JetBrains Mono',monospace" }}>{row.manual}</div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
                    <div className="i-roi-bar-bad" style={{ height: '100%', width: `${row.manualPct}%`, borderRadius: 99 }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 24 }}>
                  <div style={{ fontWeight: 800, color: '#4ade80', fontSize: 18, fontFamily: "'JetBrains Mono',monospace" }}>{row.ai}</div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 99, overflow: 'hidden' }}>
                    <div className="i-roi-bar-good" style={{ height: '100%', width: `${row.aiPct}%`, borderRadius: 99 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SCENARIO CARDS */}
        <section style={{ padding: '0 40px 80px', maxWidth: 1280, margin: '0 auto' }}>
          <div className="i-reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 42, fontWeight: 900, letterSpacing: '-0.03em', color: '#fff', marginBottom: 12 }}>
              Real Scenarios. <span className="i-gradient-text">Real Numbers.</span>
            </h2>
          </div>
          <div className="i-reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {SCENARIOS.map((s, i) => (
              <div key={i} className="i-card" style={{ background: s.bg, borderColor: s.border }}>
                <div style={{ padding: '36px 32px' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.18em', color: s.color, marginBottom: 20 }}>{s.tag}</div>
                  <h3 style={{ fontSize: 26, fontWeight: 900, color: '#fff', marginBottom: 16, letterSpacing: '-0.01em' }}>{s.label}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
                    <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 14, padding: '14px', textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Detection</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: "'JetBrains Mono',monospace" }}>{s.detection}</div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 14, padding: '14px', textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Resolution</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#94a3b8', fontFamily: "'JetBrains Mono',monospace" }}>{s.resolution}</div>
                    </div>
                  </div>
                  <div style={{ borderTop: `1px solid ${s.color}22`, paddingTop: 20 }}>
                    <div style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Value Recovered</div>
                    <div style={{ fontSize: 36, fontWeight: 900, color: s.color, fontFamily: "'JetBrains Mono',monospace", letterSpacing: '-0.03em' }}>{s.saving}</div>
                    <div style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{s.period}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '40px 40px 140px', textAlign: 'center' }}>
          <div className="i-reveal i-glass" style={{ maxWidth: 900, margin: '0 auto', padding: '80px 60px', textAlign: 'center' }}>
            <h2 style={{ fontSize: 56, fontWeight: 900, letterSpacing: '-0.03em', color: '#fff', marginBottom: 20, lineHeight: 1 }}>
              Stop losing ₹1,300,000<br /><span className="i-gradient-text">every year.</span>
            </h2>
            <p style={{ fontSize: 18, color: '#166534', marginBottom: 48 }}>
              Deploy the AutoCost Guardian AI platform and let our 5-agent pipeline autonomously recover your enterprise cloud spending in real time.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/dashboard')} style={{
                background: 'linear-gradient(135deg,#10b981,#34d399,#06b6d4)',
                color: '#010e06', padding: '20px 56px', borderRadius: 16, fontWeight: 900, fontSize: 20,
                border: 'none', cursor: 'pointer', boxShadow: '0 0 60px rgba(16,185,129,0.5)',
                fontFamily: 'inherit', letterSpacing: '-0.01em',
              }}>
                Launch Dashboard →
              </button>
              <button onClick={() => navigate('/features')} style={{
                background: 'rgba(255,255,255,0.04)', color: '#4ade80', padding: '20px 40px', borderRadius: 16,
                fontWeight: 700, fontSize: 18, border: '1px solid rgba(16,185,129,0.2)', cursor: 'pointer', fontFamily: 'inherit',
              }}>
                Explore Features
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
