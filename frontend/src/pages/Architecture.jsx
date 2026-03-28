import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
  .a-body { margin:0; background:#020c1a; font-family:'Space Grotesk',sans-serif; color:#e0f2fe; }

  .a-glass {
    background: rgba(8,25,45,0.6);
    backdrop-filter: blur(24px) saturate(160%);
    border: 1px solid rgba(6,182,212,0.15);
    box-shadow: 0 8px 40px rgba(0,0,0,0.5), inset 0 0 30px rgba(6,182,212,0.04);
    border-radius: 28px;
  }
  .a-glass-light {
    background: rgba(255,255,255,0.03);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(6,182,212,0.1);
    border-radius: 20px;
  }

  .a-gradient-text {
    background: linear-gradient(135deg,#22d3ee 0%,#38bdf8 50%,#818cf8 100%);
    -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
  }

  .a-reveal { opacity:0; transform:translateY(40px); transition: opacity 0.8s cubic-bezier(.2,.8,.2,1), transform 0.8s cubic-bezier(.2,.8,.2,1); }
  .a-visible { opacity:1; transform:translateY(0); }

  .a-node {
    background: rgba(8,25,45,0.8);
    border: 1px solid rgba(6,182,212,0.3);
    border-radius: 22px;
    transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s;
    cursor: default;
    position: relative;
    overflow: hidden;
  }
  .a-node:hover {
    transform: translateY(-6px) scale(1.03);
    border-color: rgba(6,182,212,0.7);
    box-shadow: 0 0 50px rgba(6,182,212,0.25), 0 20px 60px rgba(0,0,0,0.5);
  }

  @keyframes a-pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
  @keyframes a-float { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }
  @keyframes a-scan { 0%{top:-2px;opacity:0;} 15%,85%{opacity:1;} 100%{top:100%;opacity:0;} }
  @keyframes a-flow { 0%{stroke-dashoffset:100;} 100%{stroke-dashoffset:0;} }
  @keyframes a-spin { from{transform:rotate(0deg);}to{transform:rotate(360deg);} }

  .a-status-dot {
    width:10px;height:10px;border-radius:50%;display:inline-block;
    animation:a-pulse 2s infinite;
  }
  .a-scan-line {
    position:absolute;left:0;width:100%;height:2px;
    background: linear-gradient(90deg,transparent,rgba(34,211,238,0.9),transparent);
    animation:a-scan 3s linear infinite;
    pointer-events:none;
  }
  .a-tag { display:inline-flex;align-items:center;gap:6px;padding:5px 14px;border-radius:999px;font-size:10px;font-weight:700;letter-spacing:.15em;text-transform:uppercase; }
`;

const AGENTS = [
  { n: 'Data Agent', icon: '🗄️', color: '#6366f1', desc: 'Pulls telemetry from AWS Cost Explorer, Azure Monitor, GCP Billing, and ERP APIs at 30-second intervals.', badge: 'INGESTION', inputs: ['AWS APIs', 'Azure Monitor', 'GCP Billing', 'ERP/SAP'], latency: '< 0.1s' },
  { n: 'Anomaly Agent', icon: '🔍', color: '#8b5cf6', desc: 'Runs ML baseline models (Isolation Forest + Z-score) to detect deviations across 150+ cost metrics.', badge: 'DETECTION', inputs: ['Spend Variance', 'Service Thresholds', 'SLA Triggers'], latency: '< 0.3s' },
  { n: 'RCA Agent', icon: '🧠', color: '#a855f7', desc: 'Employs LLM chain-of-thought reasoning to trace anomalies to exact commits, keys, or actors in the environment.', badge: 'DIAGNOSIS', inputs: ['Git Commits', 'IAM Logs', 'API Traces'], latency: '< 1.1s' },
  { n: 'Decision Agent', icon: '⚖️', color: '#d946ef', desc: 'Validates ROI of proposed action and classifies risk as Low (Auto) or High (Human Approval Required).', badge: 'STRATEGY', inputs: ['Impact ₹', 'Risk Score', 'Compliance'], latency: '< 0.2s' },
  { n: 'Action Agent', icon: '⚡', color: '#ec4899', desc: 'Executes Terraform patches or Boto3 calls for auto-approved items. Routes high-risk plans to enterprise dashboards.', badge: 'EXECUTION', inputs: ['IaC Hooks', 'Cloud APIs', 'Approval Queue'], latency: '< 0.4s' },
];

export default function ArchitecturePage() {
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

    const draw = () => {
      t += 0.005;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Moving grid
      ctx.save();
      ctx.strokeStyle = 'rgba(6,182,212,0.08)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      const off = (t * 20) % gridSize;
      for (let x = -gridSize + (off % gridSize); x < canvas.width + gridSize; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = -gridSize + (off % gridSize); y < canvas.height + gridSize; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }
      ctx.restore();

      // Orbiting glow orbs
      const cx = canvas.width / 2, cy = canvas.height / 2;
      [{ r: 300, speed: 0.3, color: '6,182,212', size: 4 }, { r: 500, speed: -0.15, color: '56,189,248', size: 3 }].forEach(o => {
        const x = cx + Math.cos(t * o.speed) * o.r;
        const y = cy + Math.sin(t * o.speed) * o.r;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, o.size * 8);
        grad.addColorStop(0, `rgba(${o.color},0.5)`);
        grad.addColorStop(1, `rgba(${o.color},0)`);
        ctx.beginPath(); ctx.arc(x, y, o.size * 8, 0, Math.PI * 2);
        ctx.fillStyle = grad; ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };
    draw();

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('a-visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.a-reveal').forEach(el => obs.observe(el));

    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); obs.disconnect(); };
  }, []);

  return (
    <div className="a-body" style={{ background: '#020c1a', minHeight: '100vh', overflowX: 'hidden' }}>
      <style>{STYLES}</style>

      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'url(/architecture_hero_bg.png)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        opacity: 0.12,
      }} />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: 'radial-gradient(ellipse at 50% 0%, rgba(6,182,212,0.2) 0%, transparent 55%), radial-gradient(ellipse at 0% 100%, rgba(14,165,233,0.12) 0%, transparent 40%), radial-gradient(ellipse at 100% 100%, rgba(56,189,248,0.1) 0%, transparent 40%)',
      }} />

      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* NAV */}
        <nav style={{
          position: 'fixed', top: 0, width: '100%', zIndex: 50,
          background: 'rgba(2,12,26,0.75)', backdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(6,182,212,0.1)',
        }}>
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '18px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
              <span style={{ fontSize: 28, filter: 'drop-shadow(0 0 12px rgba(6,182,212,0.9))' }}>🛡️</span>
              AutoCost Guardian AI
            </div>
            <div style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
              <a href="/features" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 500 }}>Features</a>
              <a href="/architecture" style={{ color: '#fff', fontWeight: 700, textDecoration: 'none', borderBottom: '2px solid #22d3ee', paddingBottom: 3 }}>Architecture</a>
              <a href="/impact" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 500 }}>Impact</a>
            </div>
            <button onClick={() => navigate('/dashboard')} style={{
              background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.4)',
              color: '#22d3ee', padding: '12px 28px', borderRadius: 999,
              fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              System Dashboard →
            </button>
          </div>
        </nav>

        {/* HERO */}
        <section style={{ padding: '180px 40px 80px', textAlign: 'center', maxWidth: 1000, margin: '0 auto' }}>
          <div className="a-reveal" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px', borderRadius: 999, background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)', color: '#22d3ee', fontSize: 11, fontWeight: 700, letterSpacing: '.18em', marginBottom: 40 }}>
            <span className="a-status-dot" style={{ background: '#22d3ee' }} />
            SYSTEM ARCHITECTURE v2.0
          </div>
          <h1 className="a-reveal" style={{ fontSize: 'clamp(52px,8vw,96px)', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-0.04em', marginBottom: 28, color: '#fff' }}>
            Nervous System<br />
            <span className="a-gradient-text">For Cloud Spend.</span>
          </h1>
          <p className="a-reveal" style={{ fontSize: 20, color: '#7dd3fc', maxWidth: 700, margin: '0 auto 60px', lineHeight: 1.7 }}>
            A fully decoupled, multi-agent architecture built on FastAPI — ingesting raw infrastructure telemetry from 3 clouds and 2 ERP systems into a continuous intelligence loop.
          </p>

          {/* Architecture Quick Stats */}
          <div className="a-reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, maxWidth: 900, margin: '0 auto' }}>
            {[
              { val: 'FastAPI', label: 'Orchestration Core', color: '#22d3ee' },
              { val: '< 2s', label: 'End-to-End Loop', color: '#38bdf8' },
              { val: '3+', label: 'Cloud Providers', color: '#818cf8' },
              { val: '5', label: 'Autonomous Agents', color: '#e879f9' },
            ].map((s, i) => (
              <div key={i} className="a-glass-light" style={{ padding: '24px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: s.color, fontFamily: "'JetBrains Mono',monospace", letterSpacing: '-0.02em' }}>{s.val}</div>
                <div style={{ fontSize: 10, color: '#475569', marginTop: 6, textTransform: 'uppercase', letterSpacing: '.1em', fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* DATA SOURCES */}
        <section style={{ padding: '20px 40px 60px', maxWidth: 1280, margin: '0 auto' }}>
          <div className="a-reveal" style={{ textAlign: 'center', marginBottom: 32, fontSize: 12, fontWeight: 700, letterSpacing: '.2em', color: '#22d3ee', textTransform: 'uppercase' }}>
            ─── Data Ingestion Sources ───
          </div>
          <div className="a-reveal" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
            {[
              { icon: '☁️', name: 'AWS', sub: 'Cost Explorer API', color: '#f59e0b' },
              { icon: '🔷', name: 'Azure', sub: 'Monitor + Billing API', color: '#3b82f6' },
              { icon: '🟢', name: 'GCP', sub: 'Cloud Billing API', color: '#10b981' },
              { icon: '💼', name: 'SAP ERP', sub: 'Procurement Ledger', color: '#a855f7' },
              { icon: '☁️', name: 'Salesforce', sub: 'SaaS Subscription Data', color: '#06b6d4' },
            ].map((src, i) => (
              <div key={i} className="a-node" style={{ padding: '20px 16px', textAlign: 'center', animationDelay: `${i * 0.1}s` }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{src.icon}</div>
                <div style={{ fontWeight: 800, color: src.color, fontSize: 15 }}>{src.name}</div>
                <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>{src.sub}</div>
              </div>
            ))}
          </div>

          {/* Arrow down */}
          <div style={{ textAlign: 'center', margin: '30px 0' }}>
            <div style={{ display: 'inline-block', position: 'relative' }}>
              <div style={{ width: 2, height: 60, background: 'linear-gradient(180deg,#22d3ee,transparent)', margin: '0 auto' }} />
              <div style={{ width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '12px solid #22d3ee', margin: '0 auto' }} />
            </div>
          </div>
        </section>

        {/* AGENT PIPELINE - DETAILED */}
        <section style={{ padding: '0px 40px 60px', maxWidth: 1280, margin: '0 auto' }}>
          <div className="a-reveal a-glass" style={{ position: 'relative', overflow: 'hidden', padding: '48px 48px 60px' }}>
            <div className="a-scan-line" />
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h2 style={{ fontSize: 38, fontWeight: 900, letterSpacing: '-0.02em', color: '#fff', marginBottom: 12 }}>
                Agentic Orchestration Core
              </h2>
              <p style={{ color: '#7dd3fc', fontSize: 15 }}>FastAPI backend managing the 5-agent continuous execution loop</p>
            </div>

            {/* Agent cards row */}
            <div style={{ display: 'flex', gap: 0, alignItems: 'stretch', marginBottom: 48 }}>
              {AGENTS.map((agent, i) => (
                <div key={i} style={{ display: 'flex', flex: 1, alignItems: 'stretch' }}>
                  <div className="a-node" style={{ flex: 1, padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: 12, borderRadius: 0, borderRight: i < AGENTS.length - 1 ? '1px solid rgba(6,182,212,0.1)' : 'none', borderRadius: i === 0 ? '20px 0 0 20px' : i === AGENTS.length - 1 ? '0 20px 20px 0' : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 26 }}>{agent.icon}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.15em', color: agent.color, background: `${agent.color}18`, border: `1px solid ${agent.color}33`, padding: '3px 8px', borderRadius: 999 }}>{agent.badge}</span>
                    </div>
                    <div style={{ fontWeight: 800, color: '#fff', fontSize: 13 }}>{agent.n}</div>
                    <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5, flex: 1 }}>{agent.desc}</div>
                    <div style={{ fontSize: 11, color: agent.color, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}>
                      Latency: {agent.latency}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {agent.inputs.map((inp, j) => (
                        <div key={j} style={{ fontSize: 10, color: '#475569', background: 'rgba(255,255,255,0.03)', padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.04)' }}>
                          {inp}
                        </div>
                      ))}
                    </div>
                  </div>
                  {i < AGENTS.length - 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', width: 0, position: 'relative' }}>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Code block */}
            <div style={{ background: '#00060f', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 16, padding: '28px 32px', fontFamily: "'JetBrains Mono',monospace", fontSize: 13 }}>
              <div style={{ color: '#22d3ee', marginBottom: 16, fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase' }}>// Core Orchestration Loop — main.py</div>
              {[
                { c: '#64748b', t: 'async def autonomous_monitoring_loop():' },
                { c: '#64748b', t: '    while True:' },
                { c: '#7dd3fc', t: '        data    = await data_agent.load_cost_data()' },
                { c: '#a78bfa', t: '        anomalies = anomaly_agent.detect(data)     # ML Isolation Forest' },
                { c: '#f472b6', t: '        for spike in anomalies:' },
                { c: '#c084fc', t: '            root_cause = rca_agent.diagnose(spike)  # LLM chain-of-thought' },
                { c: '#34d399', t: '            plan = decision_agent.evaluate(root_cause)' },
                { c: '#60a5fa', t: '            if plan.risk == "LOW":  await action_agent.execute(plan)' },
                { c: '#f59e0b', t: '            else:                   await hitl_queue.escalate(plan)' },
                { c: '#64748b', t: '        await asyncio.sleep(30)  # 30s telemetry cycle' },
              ].map((line, i) => (
                <div key={i} style={{ color: line.c, marginBottom: 4, lineHeight: 1.6 }}>{line.t}</div>
              ))}
            </div>
          </div>
        </section>

        {/* OUTPUT LAYER */}
        <section style={{ padding: '0px 40px 80px', maxWidth: 1280, margin: '0 auto' }}>
          {/* Arrow down */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ display: 'inline-block' }}>
              <div style={{ width: 2, height: 60, background: 'linear-gradient(180deg,transparent,#22d3ee)', margin: '0 auto' }} />
              <div style={{ width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '12px solid #22d3ee', margin: '0 auto' }} />
            </div>
          </div>

          <div className="a-reveal" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="a-glass" style={{ padding: '40px', borderColor: 'rgba(52,211,153,0.35)', boxShadow: '0 0 40px rgba(52,211,153,0.12)' }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>⚡</div>
                <div>
                  <div style={{ fontWeight: 800, color: '#fff', fontSize: 20, marginBottom: 8 }}>Automated Execution Path</div>
                  <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.65 }}>Low-risk optimizations — idle EC2 shutdowns, rightsizing, duplicate subscription cancellations — are deployed instantly through Terraform scripts and AWS Boto3 API calls. Zero human intervention.</p>
                </div>
              </div>
              <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
                {['EC2 Idle Shutdown', 'RDS Rightsizing', 'Subscription Cancel'].map((tag, i) => (
                  <div key={i} style={{ fontSize: 10, fontWeight: 700, color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', padding: '5px 12px', borderRadius: 999, letterSpacing: '.06em' }}>{tag}</div>
                ))}
              </div>
            </div>

            <div className="a-glass" style={{ padding: '40px', borderColor: 'rgba(245,158,11,0.35)', boxShadow: '0 0 40px rgba(245,158,11,0.08)' }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🔒</div>
                <div>
                  <div style={{ fontWeight: 800, color: '#fff', fontSize: 20, marginBottom: 8 }}>Human-in-Loop Approval</div>
                  <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.65 }}>High-impact actions (&gt;₹50k exposure) trigger an enterprise approval workflow. The AI generates a complete case — impact model, risk score, and one-click approval button — routed to the CTO or FinOps Lead.</p>
                </div>
              </div>
              <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
                {['SLA Claims', 'Vendor Cancellation', 'Prod Service Stop'].map((tag, i) => (
                  <div key={i} style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', padding: '5px 12px', borderRadius: 999, letterSpacing: '.06em' }}>{tag}</div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '40px 40px 140px', textAlign: 'center' }}>
          <div className="a-reveal" style={{ maxWidth: 700, margin: '0 auto' }}>
            <h2 style={{ fontSize: 52, fontWeight: 900, letterSpacing: '-0.03em', color: '#fff', marginBottom: 20, lineHeight: 1 }}>
              See the <span className="a-gradient-text">pipeline running</span> live.
            </h2>
            <p style={{ fontSize: 17, color: '#475569', marginBottom: 44 }}>Open the live dashboard and watch all 5 agents execute in real-time against production-scale enterprise cost data.</p>
            <button onClick={() => navigate('/dashboard')} style={{
              background: 'linear-gradient(135deg,#22d3ee,#38bdf8,#818cf8)',
              color: '#020c1a', padding: '18px 52px', borderRadius: 16, fontWeight: 900, fontSize: 18,
              border: 'none', cursor: 'pointer', boxShadow: '0 0 50px rgba(34,211,238,0.4)',
              fontFamily: 'inherit', letterSpacing: '-0.01em',
            }}>
              Launch Dashboard →
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
