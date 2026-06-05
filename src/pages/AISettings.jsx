/**
 * QUANTUM COMPLIANCE OS™ — AISettings.jsx
 * Run 16: Built-In AI Agents + Open-Source AI Provider Options
 * =============================================================
 * Unified AI settings page: Provider settings, Agent registry,
 * Agent chat panel, Safety summary, and 4P3X API Config Guard extension.
 *
 * SAFETY:
 * - Mock/Demo AI is always active by default and fallback
 * - No real AI API calls in Run 16 (all providers return mock responses)
 * - Blocked secrets never saved, logged, or displayed back
 * - All agents are advisory-only with human review required
 * - AI cannot delete records, certify compliance, or fabricate evidence
 * - Kyzel Kreates™ / 4P3X Intelligent AI™ ownership preserved
 *
 * DISCLAIMER:
 * AI outputs are advisory and require qualified human review.
 * Quantum-readiness guidance does not guarantee legal, regulatory,
 * or security compliance. External AI providers may process submitted
 * prompts according to their own policies.
 *
 * Powered by 4P3X Intelligent AI™ — Created by Kyzel Kreates™
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import PageHeader  from '../components/PageHeader.jsx';
import SectionCard from '../components/SectionCard.jsx';
import { getState, subscribe } from '../core/storage.js';
import {
  AI_PROVIDER_ID, AI_PROVIDER_ORDER, AI_PROVIDERS,
  AI_AGENT_ID, AI_AGENT_ORDER, AI_AGENTS,
  AI_CONFIDENCE,
  getDefaultAISettings, getAISettings, getAIProviders, getActiveAIProvider,
  getAIProviderStatus, getAISafetySummary, getAIAgents,
  detectBlockedAISecrets, validateAIProviderConfig, maskAIProviderConfig,
  saveAIProviderConfig, setActiveAIProvider,
  runAIAgent, buildAgentContext,
} from '../core/aiAgents.js';

// ─── Micro components ─────────────────────────────────────────────────────────
function Pill({ status, label, colour }) {
  const MAP = {
    active:          { bg:'rgba(16,185,129,0.12)',  fg:'#10b981', bd:'rgba(16,185,129,0.3)' },
    configured:      { bg:'rgba(0,212,255,0.1)',    fg:'#00d4ff', bd:'rgba(0,212,255,0.3)' },
    'not-configured':{ bg:'rgba(107,114,128,0.1)',  fg:'#6b7280', bd:'rgba(107,114,128,0.25)' },
    advisory:        { bg:'rgba(245,158,11,0.1)',   fg:'#f59e0b', bd:'rgba(245,158,11,0.3)' },
    safe:            { bg:'rgba(16,185,129,0.1)',   fg:'#10b981', bd:'rgba(16,185,129,0.3)' },
    mock:            { bg:'rgba(16,185,129,0.1)',   fg:'#10b981', bd:'rgba(16,185,129,0.3)' },
    low:             { bg:'rgba(239,68,68,0.08)',   fg:'#ef4444', bd:'rgba(239,68,68,0.25)' },
    medium:          { bg:'rgba(245,158,11,0.1)',   fg:'#f59e0b', bd:'rgba(245,158,11,0.3)' },
    high:            { bg:'rgba(16,185,129,0.12)',  fg:'#10b981', bd:'rgba(16,185,129,0.3)' },
  };
  const c = MAP[status] || MAP['not-configured'];
  return (
    <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:999,
      background:c.bg, color: colour || c.fg, border:`1px solid ${c.bd}`,
      textTransform:'uppercase', letterSpacing:'0.04em' }}>
      {label || status}
    </span>
  );
}

function WarnBox({ children, colour='#f59e0b' }) {
  return (
    <div style={{ padding:'7px 11px', marginBottom:8,
      background:`${colour}0A`, border:`1px solid ${colour}30`,
      borderRadius:'var(--radius-sm)', fontSize:11, color:'var(--text-muted)', lineHeight:1.7 }}>
      ⚠ {children}
    </div>
  );
}

function BlockedBox({ reason }) {
  return <div style={{ padding:'7px 11px', marginBottom:8, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'var(--radius-sm)', fontSize:11, color:'#ef4444', fontWeight:600 }}>🚫 {reason}</div>;
}

function ResultBox({ result }) {
  if (!result) return null;
  const col = result.success ? '#10b981' : '#ef4444';
  return (
    <div style={{ padding:'7px 11px', marginBottom:8, background:`${col}0A`, border:`1px solid ${col}30`, borderRadius:'var(--radius-sm)', fontSize:12, color:col, fontWeight:600 }}>
      {result.success ? '✅' : '❌'} {result.message}
      {result.warnings?.map((w,i) => <div key={i} style={{ fontWeight:400, color:'#f59e0b', marginTop:3 }}>⚠ {w}</div>)}
    </div>
  );
}

function AIField({ label, fieldKey, value, onChange, type='text', placeholder='', hint='', mono=false }) {
  const [blocked, setBlocked] = useState(null);
  function handle(e) {
    const v = e.target.value;
    const d = detectBlockedAISecrets(v);
    if (d.blocked) { setBlocked(d.reason); return; }
    setBlocked(null);
    onChange(fieldKey, v);
  }
  return (
    <div style={{ marginBottom:10 }}>
      <label style={{ display:'block', fontSize:11, color:'var(--text-muted)', marginBottom:3, fontWeight:600 }}>{label}</label>
      <input type={type} value={value||''} onChange={handle} className="form-input"
        style={{ width:'100%', fontSize:12, fontFamily: mono ? 'monospace' : 'inherit' }}
        placeholder={placeholder} autoComplete="off" autoCorrect="off" spellCheck={false} />
      {blocked && <BlockedBox reason={blocked} />}
      {hint && !blocked && <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:2 }}>{hint}</div>}
    </div>
  );
}

function ConfidenceBadge({ level }) {
  const col = level === AI_CONFIDENCE.HIGH ? '#10b981' : level === AI_CONFIDENCE.MEDIUM ? '#f59e0b' : '#ef4444';
  return <span style={{ fontSize:10, fontWeight:700, color:col }}>● {level?.toUpperCase() || 'MEDIUM'} confidence</span>;
}

// ─── Agent Chat Panel ─────────────────────────────────────────────────────────
function AgentChatPanel({ agent, onClose }) {
  const [messages, setMessages]   = useState([]);
  const [input,    setInput]      = useState('');
  const [loading,  setLoading]    = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  function send() {
    if (!input.trim()) return;
    const userMsg = { role:'user', content: input.trim(), createdAt: new Date().toISOString() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);
    setTimeout(() => {
      const state   = getState();
      const context = {
        productMode:   state.settings?.productMode || 'demo',
        currentClient: null,
        evidenceItems: [],
        reports:       [],
      };
      const response = runAIAgent(agent.id, userMsg.content, context);
      setMessages((m) => [...m, response]);
      setLoading(false);
    }, 600);
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ width:'100%', maxWidth:680, background:'var(--bg-elevated)', borderRadius:'var(--radius-xl)',
        border:'1px solid var(--border-default)', display:'flex', flexDirection:'column', maxHeight:'85vh' }}>
        {/* Header */}
        <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border-muted)', display:'flex', gap:10, alignItems:'center' }}>
          <span style={{ fontSize:22 }}>{agent.icon}</span>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, fontWeight:800, color:'var(--text-primary)' }}>{agent.displayName}</div>
            <div style={{ fontSize:11, color:'var(--text-muted)' }}>{agent.title} · Advisory only · Human review required</div>
          </div>
          <Pill status="advisory" label="Advisory" />
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-muted)', fontSize:18, cursor:'pointer', padding:'0 4px' }}>✕</button>
        </div>

        {/* Messages */}
        <div style={{ flex:1, overflowY:'auto', padding:'14px 18px', display:'flex', flexDirection:'column', gap:10 }}>
          {messages.length === 0 && (
            <div style={{ textAlign:'center', color:'var(--text-muted)', fontSize:12, paddingTop:24 }}>
              <div style={{ fontSize:32, marginBottom:8 }}>{agent.icon}</div>
              <strong style={{ color:'var(--text-secondary)' }}>{agent.displayName}</strong><br />
              {agent.purpose}<br /><br />
              <span style={{ fontSize:10, color:'var(--text-muted)' }}>Advisory only · Human review required · Mock AI active</span>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} style={{ alignSelf: msg.role==='user' ? 'flex-end' : 'flex-start',
              maxWidth:'85%', padding:'10px 14px', borderRadius:'var(--radius-lg)',
              background: msg.role==='user' ? 'rgba(0,212,255,0.1)' : 'var(--bg-secondary)',
              border:`1px solid ${msg.role==='user' ? 'rgba(0,212,255,0.2)' : 'var(--border-muted)'}`,
              fontSize:12, lineHeight:1.65, color:'var(--text-secondary)', whiteSpace:'pre-wrap' }}>
              {msg.content}
              {msg.confidence && (
                <div style={{ marginTop:6, display:'flex', gap:8, flexWrap:'wrap' }}>
                  <ConfidenceBadge level={msg.confidence} />
                  {msg.requiresHumanReview && <span style={{ fontSize:10, color:'#f59e0b', fontWeight:700 }}>👤 Human review required</span>}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf:'flex-start', padding:'10px 14px', borderRadius:'var(--radius-lg)',
              background:'var(--bg-secondary)', border:'1px solid var(--border-muted)', fontSize:12, color:'var(--text-muted)' }}>
              Generating advisory AI response…
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div style={{ padding:'12px 18px', borderTop:'1px solid var(--border-muted)', display:'flex', gap:8 }}>
          <input value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder={`Ask ${agent.displayName}…`}
            style={{ flex:1, padding:'8px 12px', borderRadius:'var(--radius-md)', fontSize:12,
              background:'var(--bg-tertiary)', border:'1px solid var(--border-muted)', color:'var(--text-primary)' }}
          />
          <button onClick={send} disabled={loading || !input.trim()} className="btn btn-primary" style={{ fontSize:12, flexShrink:0 }}>
            Send
          </button>
        </div>
        <div style={{ padding:'6px 18px 10px', fontSize:10, color:'var(--text-muted)', textAlign:'center' }}>
          Advisory only · Mock AI active in Run 16 · Human consultant review required
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main AISettings component
// ─────────────────────────────────────────────────────────────────────────────
export default function AISettings() {
  const [mainState,   setMainState]   = useState(() => getState());
  const [globalMsg,   setGlobalMsg]   = useState('');
  const [saveResults, setSaveResults] = useState({});
  const [editStates,  setEditStates]  = useState({});
  const [activeAgent, setActiveAgent] = useState(null);

  useEffect(() => { return subscribe(setMainState); }, []);

  const aiSettings   = mainState?.aiSettings  || getDefaultAISettings();
  const providers    = getAIProviders();
  const activeProvId = aiSettings.activeProvider || AI_PROVIDER_ID.MOCK;
  const provStatus   = getAIProviderStatus();
  const safety       = getAISafetySummary();

  function showMsg(msg, t=3000) { setGlobalMsg(msg); setTimeout(()=>setGlobalMsg(''), t); }

  function handleSave(providerId) {
    const edit = editStates[providerId];
    if (!edit) return;
    const res = saveAIProviderConfig(providerId, edit);
    setSaveResults((p) => ({ ...p, [providerId]: res }));
    if (res.saved) { showMsg(`✅ ${providerId} config saved.`); setEditStates((p) => { const n={...p}; delete n[providerId]; return n; }); }
    else { showMsg(`❌ Save failed: ${res.errors.join('; ')}`); }
  }

  function handleSetActive(providerId) {
    const res = setActiveAIProvider(providerId);
    showMsg(res.success ? `✅ Active provider set to ${providerId}.` : `❌ ${res.message}`);
  }

  function startEdit(providerId) {
    const p = providers[providerId];
    setEditStates((prev) => ({ ...prev, [providerId]: { ...AI_PROVIDERS[providerId].publicConfig, ...(p?.publicConfig || {}), apiKey: '' } }));
  }

  function cancelEdit(providerId) {
    setEditStates((prev) => { const n={...prev}; delete n[providerId]; return n; });
    setSaveResults((p) => { const n={...p}; delete n[providerId]; return n; });
  }

  const handleField = useCallback((providerId) => (key, val) => {
    setEditStates((prev) => ({ ...prev, [providerId]: { ...(prev[providerId]||{}), [key]: val } }));
  }, []);

  return (
    <div>
      <PageHeader title="AI Agents & Provider Settings" subtitle="Quantum Compliance OS™ · Powered by 4P3X Intelligent AI™" />

      {globalMsg && (
        <div style={{ marginBottom:14, padding:'8px 14px', borderRadius:'var(--radius-md)', fontSize:13, fontWeight:600,
          background: globalMsg.startsWith('✅') ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.08)',
          border:`1px solid ${globalMsg.startsWith('✅') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: globalMsg.startsWith('✅') ? '#10b981' : '#ef4444' }}>
          {globalMsg}
        </div>
      )}

      {/* ── Active AI Status Banner ───────────────────────────────────────── */}
      <div style={{ marginBottom:18, padding:'12px 18px', display:'flex', gap:14, alignItems:'center', flexWrap:'wrap',
        background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:'var(--radius-md)' }}>
        <span style={{ fontSize:28 }}>🤖</span>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, fontWeight:800, color:'#10b981', marginBottom:3 }}>
            {AI_PROVIDERS[activeProvId]?.icon} {AI_PROVIDERS[activeProvId]?.name} · Active
          </div>
          <div style={{ fontSize:12, color:'var(--text-muted)' }}>
            {activeProvId === AI_PROVIDER_ID.MOCK
              ? 'Demo / Mock AI is active. Safe local responses without external API calls. All providers fall back to mock in this run.'
              : state.settings?.workspaceMode !== 'demo'
                ? `${AI_PROVIDERS[activeProvId]?.name} is set as active. Note: All providers return mock/advisory responses in this run — real SDK calls in a future run. AI guidance is advisory only.`
                : `${AI_PROVIDERS[activeProvId]?.name} is set as active. Note: All providers return mock responses in this run — real SDK calls in a future run.`}
          </div>
        </div>
        <Pill status="safe" label="Safe mode" />
        <Pill status="advisory" label="Advisory only" />
      </div>

      {/* ── Section 1: AI Status Overview ────────────────────────────────── */}
      <SectionCard title="AI Status Overview" icon="🤖">
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(170px,1fr))', gap:8, marginBottom:10 }}>
          {[
            ['Active Provider',    `${AI_PROVIDERS[activeProvId]?.icon} ${AI_PROVIDERS[activeProvId]?.name}`,    'var(--accent)'],
            ['Safe Mode',          safety.safeModeEnabled ? '✅ Enabled' : '❌ Disabled',                         '#10b981'],
            ['Human Review',       safety.humanReviewRequired ? '✅ Required' : '—',                              '#10b981'],
            ['Direct Mutation',    safety.allowDirectRecordMutation ? '⚠ Allowed' : '🔒 Blocked',               safety.allowDirectRecordMutation ? '#ef4444' : '#10b981'],
            ['Evidence Fabrication',safety.allowEvidenceFabrication ? '⚠ Allowed' : '🔒 Blocked',              safety.allowEvidenceFabrication ? '#ef4444' : '#10b981'],
            ['Legal Final Advice', safety.allowLegalFinalAdvice ? '⚠ Allowed' : '🔒 Blocked',                   safety.allowLegalFinalAdvice ? '#ef4444' : '#10b981'],
            ['Configured Providers',`${provStatus.configuredCount} / ${provStatus.totalProviders}`,              'var(--accent)'],
            ['Agents Available',   `${AI_AGENT_ORDER.length} agents`,                                            'var(--accent)'],
            ['All Advisory Only',  safety.allAgentsAdvisoryOnly ? '✅ Yes' : '❌ No',                            '#10b981'],
            ['Require Human Review',safety.allRequireHumanReview ? '✅ All agents' : '❌ Some missing',          '#10b981'],
          ].map(([label, value, colour]) => (
            <div key={label} style={{ background:'var(--bg-tertiary)', borderRadius:'var(--radius-md)', padding:'9px 12px' }}>
              <div style={{ fontSize:10, color:'var(--text-muted)', marginBottom:3 }}>{label}</div>
              <div style={{ fontSize:12, fontWeight:700, color: colour }}>{value}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize:11, color:'var(--text-muted)', lineHeight:1.7, padding:'7px 10px',
          background:'rgba(0,212,255,0.04)', border:'1px solid rgba(0,212,255,0.1)', borderRadius:'var(--radius-sm)' }}>
          <strong style={{ color:'var(--accent)' }}>Run 16 note:</strong>{' '}
          {state.settings?.workspaceMode !== 'demo' && (
            <div style={{ padding: '8px 12px', marginBottom: 8, background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 'var(--radius-sm)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              💾 <strong style={{ color: 'var(--accent)' }}>Product Mode active</strong> — Demo AI outputs are hidden.
              Connect an approved AI API or local model endpoint (Ollama, LM Studio, OpenRouter, Groq, etc.)
              via the provider settings below to generate live AI guidance.
              AI guidance is advisory only — human consultant review required.
            </div>
          )}
          All AI providers return mock/advisory responses in this run. Real SDK calls (OpenAI, Ollama, Groq, etc.)
          are implemented in a future run when the provider API layer is connected.
          Demo / Mock AI is always active as the default and fallback.
        </div>
      </SectionCard>

      {/* ── Section 2: AI Providers ───────────────────────────────────────── */}
      <SectionCard title="AI Provider Settings" icon="⚙">
        <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:14, lineHeight:1.7 }}>
          Configure AI providers for advisory agent responses. Mock/Demo AI is always active by default.
          External providers may process submitted prompts according to their own policies — do not send
          confidential data unless your organisation has approved that provider.
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {AI_PROVIDER_ORDER.map((providerId) => {
            const p       = providers[providerId];
            const base    = AI_PROVIDERS[providerId];
            const isMock  = providerId === AI_PROVIDER_ID.MOCK;
            const isActive= activeProvId === providerId;
            const editing = editStates[providerId];
            const saveRes = saveResults[providerId];

            return (
              <div key={providerId} style={{
                background: isActive ? 'rgba(16,185,129,0.04)' : 'var(--bg-tertiary)',
                border:`1px solid ${isActive ? 'rgba(16,185,129,0.25)' : 'var(--border-muted)'}`,
                borderRadius:'var(--radius-md)', padding:'12px 16px',
              }}>
                {/* Header row */}
                <div style={{ display:'flex', gap:10, alignItems:'flex-start', flexWrap:'wrap', marginBottom:8 }}>
                  <span style={{ fontSize:22, flexShrink:0 }}>{base.icon}</span>
                  <div style={{ flex:1, minWidth:160 }}>
                    <div style={{ display:'flex', gap:6, alignItems:'center', flexWrap:'wrap', marginBottom:3 }}>
                      <span style={{ fontSize:13, fontWeight:700 }}>{base.name}</span>
                      {isActive && <Pill status="active" label="Active" />}
                      {p.configured && !isActive && <Pill status="configured" label="Configured" />}
                      {!p.configured && !isMock && <Pill status="not-configured" label="Not configured" />}
                      {isMock && <Pill status="mock" label="Default" />}
                    </div>
                    <div style={{ fontSize:11, color:'var(--text-muted)', lineHeight:1.6 }}>{base.description}</div>
                    {base.setupNote && <div style={{ fontSize:11, color:'var(--accent)', marginTop:3 }}>ℹ {base.setupNote}</div>}
                  </div>
                </div>

                {base.warningNote && !isMock && <WarnBox>{base.warningNote}</WarnBox>}

                {/* Edit form */}
                {!isMock && editing && (
                  <div style={{ marginTop:8 }}>
                    {base.type === 'local-api' || base.type === 'custom-api' ? (
                      <>
                        <AIField label="Base URL / Server URL" fieldKey="baseUrl"   value={editing.baseUrl}   onChange={handleField(providerId)} placeholder={base.baseUrl || 'http://localhost:…'} />
                        <AIField label="Model Name"            fieldKey="modelName" value={editing.modelName} onChange={handleField(providerId)} placeholder={base.modelName || 'e.g. llama3.1'} />
                      </>
                    ) : (
                      <>
                        <AIField label="Base URL"   fieldKey="baseUrl"   value={editing.baseUrl}   onChange={handleField(providerId)} placeholder={base.baseUrl || 'https://…'} />
                        <AIField label="Model Name" fieldKey="modelName" value={editing.modelName} onChange={handleField(providerId)} placeholder={base.modelName || 'e.g. gpt-4o-mini'} />
                        {base.requiresApiKey && (
                          <AIField label="API Key (stored locally, masked)"
                            fieldKey="apiKey" value={editing.apiKey || ''} onChange={handleField(providerId)}
                            type="password" placeholder="Paste your API key…" mono
                            hint="Stored locally and masked. Only use keys intended for this frontend/demo environment. Production deployments should proxy AI calls through a backend." />
                        )}
                      </>
                    )}
                    <ResultBox result={saveRes} />
                    <div style={{ display:'flex', gap:8, marginTop:8 }}>
                      <button onClick={() => handleSave(providerId)} className="btn btn-primary" style={{ fontSize:12 }}>Save Config</button>
                      <button onClick={() => cancelEdit(providerId)} style={{ fontSize:12, padding:'5px 14px', borderRadius:'var(--radius-md)', background:'var(--bg-elevated)', border:'1px solid var(--border-muted)', color:'var(--text-muted)', cursor:'pointer' }}>Cancel</button>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                {!editing && !isMock && (
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:6 }}>
                    <button onClick={() => startEdit(providerId)} style={{ fontSize:11, padding:'4px 12px', borderRadius:'var(--radius-md)', background:'var(--bg-elevated)', border:'1px solid var(--border-muted)', color:'var(--text-muted)', cursor:'pointer' }}>
                      {p.configured ? 'Edit Config' : 'Configure'}
                    </button>
                    {!isActive && (
                      <button onClick={() => handleSetActive(providerId)} style={{ fontSize:11, padding:'4px 12px', borderRadius:'var(--radius-md)', background:'rgba(0,212,255,0.06)', border:'1px solid rgba(0,212,255,0.2)', color:'var(--accent)', cursor:'pointer', fontWeight:600 }}>
                        Set as Active
                      </button>
                    )}
                  </div>
                )}

                {/* Masked config display */}
                {!editing && p.configured && p.maskedConfig && Object.keys(p.maskedConfig).length > 0 && (
                  <div style={{ marginTop:8 }}>
                    {Object.entries(p.maskedConfig).filter(([,v]) => v).map(([k,v]) => (
                      <div key={k} style={{ display:'flex', gap:10, padding:'4px 0', borderBottom:'1px solid var(--border-muted)', fontSize:11 }}>
                        <span style={{ color:'var(--text-muted)', minWidth:120 }}>{k}</span>
                        <code style={{ fontFamily:'monospace', color:'var(--text-secondary)' }}>{v}</code>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop:14, fontSize:11, color:'var(--text-muted)', lineHeight:1.7,
          padding:'8px 12px', background:'var(--bg-tertiary)', borderRadius:'var(--radius-sm)' }}>
          <strong>Run 16 note:</strong> Real provider API calls (OpenAI, Ollama, Groq, etc.) are not active in Run 16.
          Config can be saved and validated (shape check + secret blocking). All providers return mock advisory responses.
          Connect real provider SDK in a future run to enable live AI responses.
        </div>
      </SectionCard>

      {/* ── Section 3: AI Agent Registry ─────────────────────────────────── */}
      <SectionCard title="4P3X Intelligent AI™ Advisory Agents" icon="🧠">
        <div style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)', marginBottom:4 }}>
          AI assistance for quantum-readiness, compliance evidence, consultant reporting, onboarding,
          backend setup, and white-label configuration.
        </div>
        <WarnBox colour="#00d4ff">
          Advisory only. Human review required for all agent outputs.
          Agents cannot certify compliance, fabricate evidence, or perform destructive actions.
        </WarnBox>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:12, marginTop:12 }}>
          {AI_AGENT_ORDER.map((agentId) => {
            const a = AI_AGENTS[agentId];
            return (
              <div key={agentId} style={{
                background:'var(--bg-tertiary)', border:'1px solid var(--border-muted)',
                borderRadius:'var(--radius-lg)', padding:'14px 16px',
              }}>
                <div style={{ display:'flex', gap:8, alignItems:'flex-start', marginBottom:8 }}>
                  <span style={{ fontSize:22, flexShrink:0 }}>{a.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:800, color: a.colour, marginBottom:1 }}>{a.displayName}</div>
                    <div style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)' }}>{a.title}</div>
                  </div>
                </div>

                <div style={{ fontSize:11, color:'var(--text-muted)', lineHeight:1.6, marginBottom:8 }}>{a.purpose}</div>

                <div style={{ display:'flex', gap:5, flexWrap:'wrap', marginBottom:10 }}>
                  <Pill status="advisory" label="Advisory only" />
                  <Pill status="safe" label="Human review" />
                  <span style={{ fontSize:10, fontWeight:600, padding:'2px 7px', borderRadius:999,
                    background:'rgba(0,212,255,0.06)', border:'1px solid rgba(0,212,255,0.15)', color:'var(--accent)' }}>
                    {a.category}
                  </span>
                </div>

                <div style={{ marginBottom:8 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'#10b981', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.04em' }}>✅ Allowed</div>
                  {a.allowedActions.map((act, i) => (
                    <div key={i} style={{ display:'flex', gap:6, fontSize:11, color:'var(--text-muted)', marginBottom:2 }}>
                      <span style={{ color:'#10b981', flexShrink:0 }}>•</span>{act}
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom:12 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'#ef4444', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.04em' }}>🚫 Forbidden</div>
                  {a.forbiddenActions.map((act, i) => (
                    <div key={i} style={{ display:'flex', gap:6, fontSize:11, color:'var(--text-muted)', marginBottom:2 }}>
                      <span style={{ color:'#ef4444', flexShrink:0 }}>•</span>{act}
                    </div>
                  ))}
                </div>

                <div style={{ marginBottom:10 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'var(--text-muted)', marginBottom:3, textTransform:'uppercase', letterSpacing:'0.04em' }}>Context access</div>
                  <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                    {a.defaultContext.map((ctx) => (
                      <span key={ctx} style={{ fontSize:9, fontWeight:600, padding:'1px 6px', borderRadius:999,
                        background:'rgba(139,92,246,0.08)', border:'1px solid rgba(139,92,246,0.2)', color:'#a78bfa' }}>
                        {ctx}
                      </span>
                    ))}
                  </div>
                </div>

                <button onClick={() => setActiveAgent(a)} className="btn btn-primary" style={{ fontSize:12, width:'100%' }}>
                  {a.icon} Ask {a.displayName}
                </button>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* ── Section 4: AI Safety Summary ─────────────────────────────────── */}
      <SectionCard title="AI Safety Summary" icon="🛡">
        <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:14, lineHeight:1.7 }}>
          All AI guardrails are enforced by the 4P3X API Config Guard™ and agent guardrail system.
          The following rules apply to all agents in all modes.
        </div>

        {[
          ['Advisory only — all agents',                '✅ Enforced',    '#10b981'],
          ['Human review required — all agents',        '✅ Enforced',    '#10b981'],
          ['No legal/compliance certainty claims',      '✅ Enforced',    '#10b981'],
          ['No security guarantee claims',              '✅ Enforced',    '#10b981'],
          ['Evidence fabrication blocked',              '✅ Enforced',    '#10b981'],
          ['Record deletion blocked',                   '✅ Enforced',    '#10b981'],
          ['Direct record mutation blocked',            '✅ Enforced',    '#10b981'],
          ['Backend secrets never included in prompts', '✅ Enforced',    '#10b981'],
          ['Service role key detection',                '✅ Active',      '#10b981'],
          ['JWT/private key detection',                 '✅ Active',      '#10b981'],
          ['Final compliance decision blocked',         '✅ Enforced',    '#10b981'],
          ['Mock AI always available as fallback',      '✅ Enforced',    '#10b981'],
        ].map(([label, value, colour]) => (
          <div key={label} style={{ display:'flex', gap:10, padding:'7px 0', borderBottom:'1px solid var(--border-muted)', fontSize:12 }}>
            <span style={{ flex:1, color:'var(--text-secondary)' }}>{label}</span>
            <span style={{ fontWeight:700, color:colour }}>{value}</span>
          </div>
        ))}

        <div style={{ marginTop:12, padding:'10px 14px', background:'rgba(212,175,55,0.06)',
          border:'1px solid rgba(212,175,55,0.2)', borderRadius:'var(--radius-md)' }}>
          <div style={{ fontSize:13, fontWeight:700, color:'#D4AF37', marginBottom:4 }}>4P3X AI Config Guard™ — AI Extension</div>
          <div style={{ fontSize:11, color:'var(--text-muted)', lineHeight:1.7 }}>
            Blocked from AI provider config: SUPABASE_SERVICE_ROLE_KEY · OPENAI_API_KEY (if backend-only) · DATABASE_URL ·
            JWT_SECRET · PRIVATE_KEY · WEBHOOK_SECRET · AWS_SECRET_ACCESS_KEY · Firebase Admin SDK private key ·
            Stripe secret keys · Admin tokens of any kind.
            <br />
            <strong>Allowed in frontend AI config:</strong> Public API keys intended for client-side use, with user warned that
            production deployments should proxy AI calls through a backend.
          </div>
        </div>
      </SectionCard>

      {/* Footer */}
      <div style={{ marginTop:24, padding:'12px 16px', textAlign:'center', fontSize:11,
        color:'var(--text-muted)', borderTop:'1px solid var(--border-muted)', lineHeight:1.8 }}>
        Quantum Compliance OS™ · Run 16 — Built-In AI Agents + Open-Source AI Provider Options ·
        Powered by 4P3X Intelligent AI™ · Created by Kyzel Kreates™ ·
        All agents advisory only · Human review required · Mock AI active in Run 16 ·
        No real provider SDK installed yet.
      </div>

      {/* Agent chat modal */}
      {activeAgent && <AgentChatPanel agent={activeAgent} onClose={() => setActiveAgent(null)} />}
    </div>
  );
}
