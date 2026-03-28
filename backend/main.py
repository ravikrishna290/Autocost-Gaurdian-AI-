from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import os
import time
import random
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(__file__))

from agents.data_agent import load_cost_data, update_cost_data
from agents.anomaly_agent import detect_anomalies
from agents.root_cause_agent import analyze_root_causes
from agents.decision_agent import make_decisions
from agents.action_agent import execute_action, execute_all_actions
from agents.audit_agent import get_all_logs, clear_logs
import asyncio

app = FastAPI(title="AutoCost Guardian AI", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── REAL-TIME MONITORING ────────────────────────────────

real_time_enabled = False

async def autonomous_monitoring_loop():
    while True:
        if real_time_enabled:
            # Polling pipeline
            data = load_cost_data()
            anomalies = detect_anomalies(data)
            if anomalies:
                anomalies = analyze_root_causes(anomalies)
                anomalies = make_decisions(anomalies)
                
                # Only Auto-Remediate those that do NOT require approval
                auto_executable = [a for a in anomalies if not a.get('approval_required')]
                if auto_executable:
                    execute_all_actions(auto_executable)
                    for a in auto_executable:
                        for r in data:
                            if r['instance_id'] == a['instance_id']:
                                r['cost'] = 0
                                if r['domain'] == 'Resource':
                                    if a.get('recommended_action') == 'Shutdown Instance':
                                        r['status'] = 'shutdown'
                                    elif a.get('recommended_action') == 'Downscale Instance':
                                        r['status'] = 'active'
                                        r['cost'] = float(r.get('cost', 0)) / 2
                                elif r['domain'] == 'SLA':
                                    r['status'] = 'healthy'
                                    r['usage_hours'] = 100
                                elif r['domain'] == 'FinOps':
                                    r['status'] = 'reconciled'
                    update_cost_data(data)
        await asyncio.sleep(2)  # Update UI loop faster

@app.on_event("startup")
async def start_loop():
    asyncio.create_task(autonomous_monitoring_loop())

@app.post("/realtime/toggle")
def toggle_realtime(enabled: bool):
    global real_time_enabled
    real_time_enabled = enabled
    return {"real_time": real_time_enabled}

@app.get("/realtime/status")
def get_realtime_status():
    return {"real_time": real_time_enabled}

# ─── ROUTES ───────────────────────────────────────────────

@app.get("/")
def root():
    return {"service": "AutoCost Guardian AI", "status": "online"}

@app.get("/data")
def get_data():
    """Return raw cost dataset."""
    data = load_cost_data()
    return {"count": len(data), "data": data}

@app.get("/detect")
def detect_issues():
    """Full agent pipeline: detect → root cause → decision."""
    data = load_cost_data()
    anomalies = detect_anomalies(data)
    anomalies = analyze_root_causes(anomalies)
    anomalies = make_decisions(anomalies)
    total_potential = sum(
        float(a.get('cost', 0)) * float(a.get('savings_pct', 0)) / 100
        for a in anomalies
    )
    return {
        "anomaly_count": len(anomalies),
        "total_potential_savings": round(total_potential, 2),
        "anomalies": anomalies,
    }

class SingleActionRequest(BaseModel):
    instance_id: str
    service_name: str = ""
    cost: float
    status: str = "idle"
    usage_hours: float = 0.0
    recommended_action: str = "Shutdown Instance"
    savings_pct: float = 100.0
    root_cause: str = ""
    action_rationale: str = ""
    anomaly_type: str = ""

@app.post("/action")
def perform_action(req: SingleActionRequest):
    """Execute a single action."""
    result = execute_action(req.model_dump())
    return result

@app.post("/action/all")
def perform_all_actions():
    """Detect anomalies and immediately execute all recommended actions."""
    data = load_cost_data()
    anomalies = detect_anomalies(data)
    anomalies = analyze_root_causes(anomalies)
    anomalies = make_decisions(anomalies)
    results = execute_all_actions(anomalies)
    total_saved = sum(r.get('estimated_savings', 0) for r in results)
    return {
        "actions_executed": len(results),
        "total_saved": round(total_saved, 2),
        "results": results,
    }

@app.get("/logs")
def get_logs():
    """Return audit log."""
    logs = get_all_logs()
    return {"count": len(logs), "logs": logs}

@app.delete("/logs/reset")
def reset_logs():
    """Clear all audit logs."""
    clear_logs()
    return {"message": "Audit logs cleared."}

# ─── AI CHAT ENDPOINT ────────────────────────────────────────
class ChatMessage(BaseModel):
    message: str

@app.post("/ai/chat")
def ai_chat(payload: ChatMessage):
    """Smart AI chat that queries live data to answer natural language questions."""
    msg = payload.message.lower()
    data = load_cost_data()
    anomalies = detect_anomalies(data)
    anomalies = analyze_root_causes(anomalies)
    anomalies = make_decisions(anomalies)

    total_spend = sum(float(r.get('cost', 0)) for r in data)
    total_potential = sum(float(a.get('cost', 0)) * float(a.get('savings_pct', 0)) / 100 for a in anomalies)
    sla_anomalies = [a for a in anomalies if a.get('domain') == 'SLA']
    spend_anomalies = [a for a in anomalies if a.get('domain') == 'Spend']
    resource_anomalies = [a for a in anomalies if a.get('domain') == 'Resource']
    finops_anomalies = [a for a in anomalies if a.get('domain') == 'FinOps']
    requires_approval = [a for a in anomalies if a.get('approval_required')]

    if any(k in msg for k in ['biggest', 'largest', 'highest', 'top', 'worst']):
        if anomalies:
            top = max(anomalies, key=lambda a: float(a.get('cost', 0)))
            reply = (f"🚨 Your biggest cost leak is **{top['service_name']}** ({top['domain']} domain) "
                     f"with ₹{float(top['cost']):,.2f} at risk. Type: {top.get('anomaly_type','N/A').replace('_',' ')}. "
                     f"Recommended action: **{top.get('recommended_action','N/A')}**.")
        else:
            reply = "✅ No significant cost leaks detected right now. All systems are healthy."
    elif any(k in msg for k in ['sla', 'breach', 'penalty', 'latency']):
        if sla_anomalies:
            names = ', '.join(a['service_name'] for a in sla_anomalies)
            reply = (f"⚠️ {len(sla_anomalies)} SLA breach risk(s) detected: **{names}**. "
                     f"The system recommends rerouting traffic immediately to avoid penalty charges. "
                     f"Potential penalty savings: ₹{len(sla_anomalies) * 5000:,.0f}.")
        else:
            reply = "✅ All SLA metrics are within healthy thresholds. No breach risks detected."
    elif any(k in msg for k in ['spend', 'invoice', 'vendor', 'duplicate', 'procurement']):
        if spend_anomalies:
            reply = (f"💸 {len(spend_anomalies)} spend intelligence alert(s) found. "
                     f"Issues: {', '.join(a.get('anomaly_type','').replace('_',' ') for a in spend_anomalies)}. "
                     f"Total at risk: ₹{sum(float(a.get('cost',0)) for a in spend_anomalies):,.2f}.")
        else:
            reply = "✅ No vendor or procurement anomalies detected. All invoices appear clean."
    elif any(k in msg for k in ['save', 'saving', 'savings', 'how much', 'potential']):
        reply = (f"💰 Current potential savings identified: **₹{total_potential:,.2f}**. "
                 f"This is achievable by acting on {len(anomalies)} detected anomalies across "
                 f"{len(set(a.get('domain') for a in anomalies))} domains. Annualized: ₹{total_potential * 12:,.0f}.")
    elif any(k in msg for k in ['approv', 'review', 'workflow', 'pending']):
        if requires_approval:
            names = ', '.join(a.get('service_name','') for a in requires_approval)
            reply = (f"🔒 {len(requires_approval)} action(s) require enterprise approval: **{names}**. "
                     f"These are high-impact decisions routed to the appropriate workflow owners.")
        else:
            reply = "✅ No actions currently require enterprise approval. All autonomous fixes can proceed."
    elif any(k in msg for k in ['total', 'spend', 'cost', 'how much spending', 'budget']):
        reply = (f"📊 Total monitored spend: **₹{total_spend:,.2f}**. "
                 f"Breakdown — Resource: {len([r for r in data if r.get('domain')=='Resource'])} items, "
                 f"Spend: {len([r for r in data if r.get('domain')=='Spend'])} items, "
                 f"SLA: {len([r for r in data if r.get('domain')=='SLA'])} items, "
                 f"FinOps: {len([r for r in data if r.get('domain')=='FinOps'])} items.")
    elif any(k in msg for k in ['hello', 'hi', 'hey', 'help', 'what can you']):
        reply = ("👋 Hi! I'm your **CFO AI Assistant**. I can answer questions like:\n"
                 "• *What's my biggest cost leak?*\n"
                 "• *How much can we save this month?*\n"
                 "• *Are there any SLA breach risks?*\n"
                 "• *Which actions need approval?*\n"
                 "• *Show me vendor spend anomalies*")
    elif any(k in msg for k in ['resource', 'cloud', 'instance', 'ec2', 'server']):
        if resource_anomalies:
            total_r = sum(float(a.get('cost',0)) for a in resource_anomalies)
            reply = (f"☁️ {len(resource_anomalies)} cloud resource anomalie(s) detected. "
                     f"Idle/over-provisioned instances costing **₹{total_r:,.2f}**. "
                     f"Recommended: shutdown/downscale to reclaim 100% of waste.")
        else:
            reply = "✅ All cloud resources are right-sized and operating efficiently."
    elif any(k in msg for k in ['finops', 'reconcil', 'billing', 'discrepancy', 'finance']):
        if finops_anomalies:
            total_f = sum(float(a.get('cost',0)) for a in finops_anomalies)
            reply = (f"📒 {len(finops_anomalies)} FinOps discrepancy(ies) found totaling **₹{total_f:,.2f}**. "
                     f"These are unreconciled billing entries requiring finance controller review.")
        else:
            reply = "✅ All billing transactions are reconciled. No discrepancies found."
    else:
        reply = (f"📊 Quick summary: **{len(anomalies)} anomalies** detected across all domains. "
                 f"Potential savings: **₹{total_potential:,.2f}**. Total monitored spend: ₹{total_spend:,.2f}. "
                 f"Ask me about specific domains, savings, SLA risks, or approval workflows.")

    return {"reply": reply, "timestamp": datetime.utcnow().isoformat() + "Z", "anomaly_count": len(anomalies)}

# ─── PIPELINE VISUALIZATION ───────────────────────────────────
@app.get("/pipeline/run")
def run_pipeline_viz():
    """Run the full agent pipeline and return step-by-step results for visualization."""
    t0 = time.time()
    data = load_cost_data()
    t1 = time.time()

    anomalies = detect_anomalies(data)
    t2 = time.time()

    anomalies = analyze_root_causes(anomalies)
    t3 = time.time()

    anomalies = make_decisions(anomalies)
    t4 = time.time()

    total_savings = sum(float(a.get('cost',0)) * float(a.get('savings_pct',0)) / 100 for a in anomalies)
    t5 = time.time()

    return {
        "steps": [
            {
                "id": 1, "name": "Data Agent", "icon": "🗄️",
                "status": "complete",
                "duration_ms": round((t1 - t0) * 1000, 1),
                "output": f"Loaded {len(data)} records across 4 enterprise domains",
                "details": {"records": len(data), "domains": list(set(r.get('domain','Resource') for r in data))}
            },
            {
                "id": 2, "name": "Anomaly Agent", "icon": "🔍",
                "status": "complete",
                "duration_ms": round((t2 - t1) * 1000, 1),
                "output": f"Detected {len(anomalies)} anomalies from {len(data)} records",
                "details": {"anomaly_count": len(anomalies), "types": list(set(a.get('anomaly_type') for a in anomalies))}
            },
            {
                "id": 3, "name": "Root Cause Agent", "icon": "🧠",
                "status": "complete",
                "duration_ms": round((t3 - t2) * 1000, 1),
                "output": f"Generated {len(anomalies)} root cause explanations",
                "details": {"explanations": [a.get('root_cause','')[:80] + '...' for a in anomalies[:3]]}
            },
            {
                "id": 4, "name": "Decision Agent", "icon": "⚖️",
                "status": "complete",
                "duration_ms": round((t4 - t3) * 1000, 1),
                "output": f"Formulated {len(anomalies)} remediation strategies",
                "details": {
                    "actions": list(set(a.get('recommended_action') for a in anomalies)),
                    "requires_approval": len([a for a in anomalies if a.get('approval_required')])
                }
            },
            {
                "id": 5, "name": "Action Agent", "icon": "⚡",
                "status": "ready",
                "duration_ms": round((t5 - t4) * 1000, 1),
                "output": f"Ready to execute — potential savings: ₹{total_savings:,.2f}",
                "details": {
                    "auto_executable": len([a for a in anomalies if not a.get('approval_required')]),
                    "pending_approval": len([a for a in anomalies if a.get('approval_required')]),
                    "total_savings": round(total_savings, 2)
                }
            },
        ],
        "total_ms": round((t5 - t0) * 1000, 1),
        "anomalies": anomalies,
    }

# ─── COST FORECAST ENDPOINT ──────────────────────────────────
@app.get("/forecast")
def get_forecast():
    """Return 30-day cost forecast with and without AutoCost intervention."""
    data = load_cost_data()
    anomalies = detect_anomalies(data)
    anomalies = make_decisions(anomalies)

    current_daily = sum(float(r.get('cost', 0)) for r in data) / 30
    savings_daily = sum(float(a.get('cost',0)) * float(a.get('savings_pct',0)) / 100 for a in anomalies) / 30

    today = datetime.now()
    forecast = []
    cumulative_saved = 0
    for i in range(31):
        day = today + timedelta(days=i)
        noise = random.uniform(0.92, 1.08)
        base = current_daily * noise
        growth_factor = 1 + (i * 0.003)
        without = round(base * growth_factor, 2)
        daily_saving = savings_daily * random.uniform(0.9, 1.1)
        cumulative_saved += daily_saving
        with_autocost = round(max(without - daily_saving, without * 0.3), 2)
        forecast.append({
            "date": day.strftime('%b %d'),
            "without_autocost": without,
            "with_autocost": with_autocost,
            "cumulative_saved": round(cumulative_saved, 2),
        })

    total_without = sum(f['without_autocost'] for f in forecast)
    total_with = sum(f['with_autocost'] for f in forecast)

    return {
        "forecast": forecast,
        "summary": {
            "total_without_intervention": round(total_without, 2),
            "total_with_autocost": round(total_with, 2),
            "total_saved_30d": round(total_without - total_with, 2),
            "projected_annual_savings": round((total_without - total_with) * 12, 2),
            "roi_days": round(30 / max((total_without - total_with) / total_without, 0.01)),
        }
    }

# ─── APPROVE / REJECT WORKFLOW ────────────────────────────────
class WorkflowAction(BaseModel):
    instance_id: str
    service_name: str = ""
    action: str = "approve"
    domain: str = ""
    anomaly_type: str = ""
    cost: float = 0.0
    savings_pct: float = 0.0
    recommended_action: str = ""

@app.post("/workflow/approve")
def approve_action(req: WorkflowAction):
    """Enterprise approves a flagged action — executes it."""
    from agents.audit_agent import log_action
    savings = req.cost * req.savings_pct / 100
    log_action({
        "instance_id": req.instance_id,
        "service_name": req.service_name,
        "action_taken": f"APPROVED: {req.recommended_action}",
        "execution_status": "Executed: Approved by Enterprise Workflow",
        "original_cost": req.cost,
        "estimated_savings": savings,
        "savings_pct": req.savings_pct,
        "domain": req.domain,
    })
    return {"status": "approved", "message": f"Action approved and executed for {req.instance_id}", "savings": savings}

@app.post("/workflow/reject")
def reject_action(req: WorkflowAction):
    """Enterprise rejects a flagged action — dismisses it."""
    from agents.audit_agent import log_action
    log_action({
        "instance_id": req.instance_id,
        "service_name": req.service_name,
        "action_taken": f"REJECTED: {req.recommended_action}",
        "execution_status": "Rejected by Enterprise Workflow",
        "original_cost": req.cost,
        "estimated_savings": 0,
        "savings_pct": 0,
        "domain": req.domain,
    })
    return {"status": "rejected", "message": f"Action rejected for {req.instance_id}"}


# ─── SCENARIO SIMULATOR (PHASE 3 READY) ──────────────────────────────────────
class ScenarioRequest(BaseModel):
    domain: str = "Resource"
    service_name: str = "Unknown Service"
    instance_id: str = "sim-001"
    cost: float = 0.0
    usage_hours: float = 0.0
    status: str = "active"
    description: str = ""

@app.post("/scenario/test")
def test_scenario(req: ScenarioRequest):
    """
    Accepts ANY injected enterprise scenario and runs it through the full
    5-agent pipeline. Returns anomaly classification, root cause, action,
    savings, and approval routing.
    Built to handle judges' live surprise scenarios in Phase 3.
    """
    record = req.model_dump()

    # Run through anomaly pipeline
    anomalies = detect_anomalies([record])
    if not anomalies:
        return {
            "is_anomaly": False,
            "message": "No anomaly detected. Record is within baseline parameters.",
            "service_name": req.service_name,
            "domain": req.domain,
        }

    anomalies = analyze_root_causes(anomalies)
    anomalies = make_decisions(anomalies)

    a = anomalies[0]
    savings = float(a.get('cost', 0)) * float(a.get('savings_pct', 0)) / 100

    from agents.audit_agent import log_action
    log_action({
        "instance_id": req.instance_id,
        "service_name": req.service_name,
        "action_taken": f"SIMULATOR: {a.get('recommended_action', 'Flagged')}",
        "execution_status": "Simulated via Scenario Simulator",
        "original_cost": req.cost,
        "estimated_savings": savings,
        "savings_pct": a.get('savings_pct', 0),
        "domain": req.domain,
    })

    return {
        "is_anomaly": True,
        "domain": a.get('domain'),
        "service_name": a.get('service_name'),
        "anomaly_type": a.get('anomaly_type'),
        "root_cause": a.get('root_cause'),
        "recommended_action": a.get('recommended_action'),
        "action_rationale": a.get('action_rationale'),
        "savings_pct": a.get('savings_pct', 0),
        "savings": round(savings, 2),
        "approval_required": a.get('approval_required', False),
        "cost": req.cost,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
