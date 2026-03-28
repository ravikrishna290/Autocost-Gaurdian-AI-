import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8000' });

const QUICK_PROMPTS = [
  "What's my biggest cost leak?",
  "How much can we save this month?",
  "Are there any SLA breach risks?",
  "Show me vendor spend anomalies",
  "Which actions need approval?",
  "Summarize total spending by domain",
];

function formatReply(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/•/g, '<br/>•')
    .replace(/\n/g, '<br/>');
}

export default function AiChat() {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: "👋 Hi! I'm your **CFO AI Assistant**, powered by AutoCost Guardian. I have live access to all your enterprise cost, SLA, and vendor data.\n\nAsk me anything about your costs, anomalies, or savings opportunities!",
      ts: new Date().toLocaleTimeString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(msg) {
    const text = msg || input.trim();
    if (!text) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text, ts: new Date().toLocaleTimeString() }]);
    setLoading(true);
    try {
      const res = await API.post('/ai/chat', { message: text });
      setMessages(prev => [...prev, {
        role: 'ai',
        text: res.data.reply,
        ts: new Date().toLocaleTimeString(),
        badge: res.data.anomaly_count > 0 ? `${res.data.anomaly_count} anomalies live` : null,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: '⚠️ Cannot reach backend. Please ensure the FastAPI server is running.',
        ts: new Date().toLocaleTimeString(),
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 0, paddingBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 48, height: 48,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, boxShadow: '0 0 24px rgba(99,102,241,0.5)',
          }}>🤖</div>
          <div>
            <h2 style={{ margin: 0 }}>CFO AI Assistant</h2>
            <p style={{ margin: 0 }}>Ask natural language questions about your enterprise costs</p>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, background: '#10b981', borderRadius: '50%', boxShadow: '0 0 6px #10b981', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600 }}>Live Data Connected</span>
          </div>
        </div>
      </div>

      {/* Quick Prompts */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {QUICK_PROMPTS.map(p => (
          <button key={p} onClick={() => send(p)} className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 14px' }}>
            {p}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
            gap: 12,
            alignItems: 'flex-start',
          }}>
            {m.role === 'ai' && (
              <div style={{
                width: 36, height: 36, minWidth: 36,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 16, boxShadow: '0 0 12px rgba(99,102,241,0.4)',
              }}>🤖</div>
            )}
            <div style={{ maxWidth: '72%' }}>
              <div style={{
                background: m.role === 'user'
                  ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                  : 'rgba(255,255,255,0.05)',
                border: m.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                padding: '14px 18px',
                color: '#f1f5f9',
                fontSize: 14,
                lineHeight: 1.65,
                boxShadow: m.role === 'user' ? '0 4px 20px rgba(99,102,241,0.35)' : 'none',
              }}
                dangerouslySetInnerHTML={{ __html: formatReply(m.text) }}
              />
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6, paddingLeft: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.ts}</span>
                {m.badge && (
                  <span style={{ fontSize: 10, background: 'rgba(239,68,68,0.15)', color: '#fca5a5', padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                    🔴 {m.badge}
                  </span>
                )}
              </div>
            </div>
            {m.role === 'user' && (
              <div style={{
                width: 36, height: 36, minWidth: 36, background: 'rgba(255,255,255,0.08)',
                borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
              }}>👤</div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <div style={{
              width: 36, height: 36, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
            }}>🤖</div>
            <div style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '4px 18px 18px 18px', padding: '16px 20px',
              display: 'flex', gap: 6, alignItems: 'center',
            }}>
              {[0,1,2].map(d => (
                <div key={d} style={{
                  width: 8, height: 8, background: '#6366f1', borderRadius: '50%',
                  animation: `pulse 1s ${d * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '16px 0 0',
        display: 'flex', gap: 12,
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask about costs, anomalies, savings, SLA risks..."
          disabled={loading}
          style={{
            flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12, padding: '14px 20px', color: '#f1f5f9', fontSize: 14,
            outline: 'none', transition: 'border-color 0.2s',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.5)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
        />
        <button
          className="btn btn-primary"
          onClick={() => send()}
          disabled={loading || !input.trim()}
          style={{ padding: '14px 24px' }}
        >
          {loading ? <span className="spinner" /> : '↑ Send'}
        </button>
      </div>
    </div>
  );
}
