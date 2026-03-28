# AutoCost Guardian AI — Architecture Document
**ET AI Hackathon 2026 | Track 3: Cost Intelligence & Autonomous Action**
*Prepared by Team AutoCost Guardian AI | March 2026*

---

## Page 1 — System Architecture & Agent Pipeline

### 1. System Overview

AutoCost Guardian AI is a **5-agent sequential orchestration platform** that transforms static cost dashboards into an actively remediating enterprise intelligence system. The system continuously observes live enterprise data, reasons about anomalies using specialized agents, and either autonomously fixes issues or routes them through enterprise approval workflows — all with a full audit trail.

> **Core Design Philosophy:** No single LLM prompt. No monolithic chatbot. Every decision is the result of a structured pipeline where domain-specific agents exchange verified context before any action is taken.

---

### 2. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     AUTOCOST GUARDIAN AI PLATFORM                       │
│                                                                         │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐                │
│  │  Cloud Infra │   │ Vendor/Spend │   │  SLA/Latency │  ... (data)    │
│  │  (EC2, RDS)  │   │ Invoice APIs │   │  Metrics     │                │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘                │
│         └──────────────────┴──────────────────-┘                        │
│                             │                                           │
│                     ┌───────▼────────┐                                  │
│                     │  DATA AGENT    │  ← Polls every 2s               │
│                     │  (Observation) │                                  │
│                     └───────┬────────┘                                  │
│                             │ Structured records (domain-tagged JSON)   │
│                     ┌───────▼────────┐                                  │
│                     │ ANOMALY AGENT  │  ← Pattern matcher               │
│                     │  (Detection)   │    Idle costs, vendor dups,      │
│                     └───────┬────────┘    SLA breach prediction         │
│                             │ Flagged anomalies + anomaly_type          │
│                     ┌───────▼────────┐                                  │
│                     │  ROOT CAUSE    │  ← Context enrichment            │
│                     │    AGENT       │    Why did this happen?          │
│                     └───────┬────────┘    (not just what happened)      │
│                             │ Root cause + domain context               │
│                     ┌───────▼────────┐                                  │
│                     │ DECISION AGENT │  ← Strategy + risk assessment   │
│                     │  (Strategist)  │    Calculates savings %, sets   │
│                     └───────┬────────┘    approval_required flag        │
│                             │                                           │
│             ┌───────────────┴───────────────┐                          │
│             ▼                               ▼                          │
│    ┌────────────────┐              ┌─────────────────┐                  │
│    │  AUTO-EXECUTE  │              │ ENTERPRISE QUEUE│                  │
│    │  ACTION AGENT  │              │ (Approval Flow) │                  │
│    │ (Low-risk fix) │              │ (High-impact)   │                  │
│    └────────┬───────┘              └────────┬────────┘                  │
│             └──────────────┬────────────────┘                          │
│                     ┌──────▼──────┐                                     │
│                     │ AUDIT AGENT │  ← Immutable compliance log        │
│                     └─────────────┘                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 3. Full Agentic Pipeline Flowchart

```mermaid
flowchart TD
    START([🔁 Autonomous Loop\nEvery 2 Seconds]) --> DA

    subgraph OBSERVE["🗄️ STAGE 1 — Data Agent"]
        DA[Load Cost Data\nAll 4 Enterprise Domains]
        DA --> DA2{Is data\nstale > 2s?}
        DA2 -- Yes --> DA3[Apply live volatility\nEC2 cost drift / SLA jitter\nFinOps accrual]
        DA2 -- No --> AA
        DA3 --> AA
    end

    subgraph DETECT["🔍 STAGE 2 — Anomaly Agent"]
        AA[Scan each record\nagainst baseline policies]
        AA --> AA2{Anomaly\nDetected?}
        AA2 -- No --> END1([✅ All Clear\nNo Action])
        AA2 -- Yes --> AA3[Tag with anomaly_type:\nIDLE_HIGH_COST\nDUPLICATE_VENDOR\nCLOUD_SPEND_SPIKE\nSLA_BREACH_PREDICTION\nRECONCILIATION_DISCREPANCY]
        AA3 --> RCA
    end

    subgraph DIAGNOSE["🧠 STAGE 3 — Root Cause Agent"]
        RCA[Enrich anomaly\nwith root cause context]
        RCA --> RCA2{Classify\nRoot Cause}
        RCA2 -- Idle resource --> RC1[Instance idle, generating waste]
        RCA2 -- Auto-scaling error --> RC2[40% spike diagnosed:\nMisconfigured rule, NOT traffic]
        RCA2 -- Vendor overlap --> RC3[Duplicate entity detected\nin procurement dataset]
        RCA2 -- SLA trajectory --> RC4[Delivery team trending to miss\ncontract SLA within 3 days]
        RC1 & RC2 & RC3 & RC4 --> DE
    end

    subgraph DECIDE["⚖️ STAGE 4 — Decision Agent"]
        DE[Formulate action plan\nCalculate savings %]
        DE --> DE2{Risk Level?}
        DE2 -- Low Risk --> AUTO[Set approval_required = False\nAuto-Executable action]
        DE2 -- High Risk --> REVIEW[Set approval_required = True\nRoute to Enterprise Workflow]
        AUTO & REVIEW --> ACT
    end

    subgraph EXECUTE["⚡ STAGE 5 — Action Agent + Audit"]
        ACT{Approval\nRequired?}
        ACT -- No --> AE[Execute Autonomously:\nShutdown Instance\nRevert Auto-Scaling Rule]
        ACT -- Yes --> HM[CFO Dashboard:\nApprove / Reject UI]
        HM -- Approved --> AE
        HM -- Rejected --> LOG2[Log Rejection\nto Audit Trail]
        AE --> LOG[Write to Immutable\nAudit Log\nTimestamp + Savings]
        LOG --> LOOP([🔁 Loop Continues])
        LOG2 --> LOOP
    end
```

---

## Page 2 — Scenario Walkthroughs & Enterprise Design

### 4. Hackathon Scenario Execution Flows

#### Scenario A — Duplicate Vendor Detection

```mermaid
sequenceDiagram
    participant DS as Data Stream
    participant AA as Anomaly Agent
    participant RC as Root Cause Agent
    participant DE as Decision Agent
    participant CFO as CFO Dashboard
    participant AUD as Audit Agent

    DS->>AA: Feed vendor invoice records
    Note over AA: Detects "Salesforce" + "Sales-Force Inc."<br/>Same amount, overlapping service
    AA->>RC: Flag: DUPLICATE_VENDOR
    RC->>RC: Enrich: "Overlapping entity names,<br/>duplicate service agreement"
    RC->>DE: Pass enriched context
    DE->>DE: Action = "Consolidate Vendors Priority 1"<br/>savings_pct = 100%<br/>approval_required = True
    DE->>CFO: Route to Enterprise Approval Queue
    CFO->>DE: Human Approves Consolidation
    DE->>AUD: Log: Action Approved, ₹5,000 Saved
```

#### Scenario B — Cloud Spend Spike (40% MoM)

```mermaid
sequenceDiagram
    participant DS as Cloud Metrics
    participant AA as Anomaly Agent
    participant RC as Root Cause Agent
    participant DE as Decision Agent
    participant EX as Action Agent
    participant AUD as Audit Agent

    DS->>AA: EC2 cost spike detected (+40% MoM)
    Note over AA: Status = active, cost > threshold<br/>Flags CLOUD_SPEND_SPIKE
    AA->>RC: Anomaly passed with cost data
    RC->>RC: Diagnose: "Not seasonal traffic.<br/>Misconfigured auto-scaling rule."
    RC->>DE: Enriched + confirmed root cause
    DE->>DE: Action = "Revert Auto-Scaling Rule"<br/>savings_pct = 40%<br/>approval_required = False
    DE->>EX: Autonomous execution triggered
    EX->>EX: Apply corrective auto-scaling config
    EX->>AUD: Log: ₹28,000 avoided, Rule Reverted
```

#### Scenario C — SLA Penalty Prevention (3 Days Remaining)

```mermaid
sequenceDiagram
    participant DS as Delivery Pipeline
    participant AA as Anomaly Agent
    participant RC as Root Cause Agent
    participant DE as Decision Agent
    participant MGR as Manager (CFO Dashboard)
    participant AUD as Audit Agent

    DS->>AA: Delivery latency trending up, SLA at risk
    Note over AA: status = warning<br/>trajectory = 3 days to breach
    AA->>RC: Flag: SLA_BREACH_PREDICTION
    RC->>RC: "Service team trending to miss contract SLA<br/>due to bottlenecked task reprioritization"
    RC->>DE: Contextual shortfall projection
    DE->>DE: Action = "Escalate Recovery Plan to Manager"<br/>savings_pct = 100% of penalty<br/>approval_required = True
    DE->>MGR: Route specific reprioritization plan
    MGR->>DE: Approves resource reassignment
    DE->>AUD: Log: ₹50,000 SLA Penalty Avoided
```

---

### 5. Technology Stack & Integration Map

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React (Vite) + Recharts | Live dashboard, KPI tiles, anomaly feed, approval workflows |
| **API Layer** | FastAPI (Python) | RESTful endpoints for detect, forecast, approve/reject, AI chat |
| **Agent Layer** | Custom Python Agents | 5-stage pipeline: Data → Anomaly → Root Cause → Decision → Action |
| **Agentic Pattern** | Sequential + HITL Orchestration | Agents pass structured context; no brute-force LLM chaining |
| **Real-time Loop** | `asyncio` + 2s polling | Backend data mutation + Frontend `setInterval` fetching |
| **AI Intelligence** | Rule-based + NLP intent matching | CFO AI Chat queries live anomaly data for answers |
| **Audit & Compliance** | In-memory log + API endpoint | Every action is serialized with timestamp, domain, and savings |

---

### 6. Error Recovery & Graceful Degradation

```mermaid
flowchart LR
    A[Agent Pipeline Call] --> B{Backend\nReachable?}
    B -- No --> C[Frontend shows\n⚠️ Backend Offline Banner]
    B -- Yes --> D{Agent Step\nSucceeds?}
    D -- No --> E[Step is skipped\nDefaults to 'Flag for Review']
    D -- Yes --> F[Pass to next agent]
    F --> G{Action\nSafe?}
    G -- Uncertain --> H[Force approval_required = True\nRoute to Human]
    G -- Safe --> I[Execute Autonomously]
    C --> J[(No State Mutation\nSystem Idles Safely)]
```

> **Key Enterprise Principle:** If any agent step fails or returns an unclassified result, the system **defaults to the safest path** — flagging the record for human review rather than executing a destructive or incorrect action. No silent failures.

---

### 7. Evaluation Rubric Alignment Summary

| Rubric Dimension | Weight | How AutoCost Guardian Satisfies It |
| :--- | :---: | :--- |
| **Autonomy Depth** | 30% | Low-risk actions execute without any human. System recovers silently from agent failures by defaulting to human queue. |
| **Multi-Agent Design** | 20% | 5 cleanly separated specialist agents. Context passed as structured JSON, not raw text. Sequential orchestration with a clear master controller (`main.py`). |
| **Technical Creativity** | 20% | Live 2-second telemetry loop, in-browser CFO AI Chat backed by live agent data, domain-specific reasoning chains. |
| **Enterprise Readiness** | 20% | Human-in-the-Loop approval workflow, immutable audit trail, graceful degradation on failures. |
| **Impact Quantification** | 10% | ₹1,300,000 annualized ROI with per-scenario math. Before/after cost state visible on live dashboard. |
