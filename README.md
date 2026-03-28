<div align="center">

# 🛡️ AutoCost Guardian AI

**A real-time, 5-agent enterprise cost intelligence platform that autonomously detects, diagnoses, and remediates cloud cost leakage — with full audit trails and enterprise approval workflows.**

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Hackathon Submission](https://img.shields.io/badge/ET_AI_Hackathon_2026-Track_3-6366f1?style=for-the-badge&logo=hackaday&logoColor=white)

</div>

---

## 🎯 The Problem: Enterprises Bleed Millions in Silence

Traditional dashboards *show* you the problem. AutoCost Guardian AI **fixes** it.
Enterprises lose massive amounts of capital daily due to invisible cost leaks:
*   💸 **Idle Cloud Instances:** Servers running 24/7 with 0% utilization.
*   🔁 **Duplicate Vendor Invoices:** Same vendor, different entity names passing through procurement.
*   ⚠️ **SLA Breach Blindspots:** Catching a latency trajectory *after* the financial penalty is drafted.

---

## 🚀 The Solution: Autonomous Agentic Remediation

AutoCost Guardian AI is built on a **5-Agent Sequential Pipeline Orchestration**. It continuously evaluates operations data, identifies cost leaks, reasons about their root causes, formulates optimization strategies, and executes fixes directly into infrastructure or routes them to enterprise review queues.

> **Core Design Philosophy:** No single LLM prompt fallback. Every decision is the result of a structured pipeline where domain-specific agents exchange verified context before any state mutation occurs.

---

## 🧠 System Architecture

AutoCost Guardian maps directly over your enterprise data streams (Cloud APIs, Vendor Invoices, SLA Metrics):

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
        AA2 -- Yes --> AA3[Tag with anomaly_type:\nIDLE_HIGH_COST\nDUPLICATE_VENDOR\nCLOUD_SPEND_SPIKE\nSLA_BREACH_PREDICTION]
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

## 🏆 Hackathon Scenarios Handled (Track 3)

The platform has been specifically trained and evaluated on the following real-world scenarios:

| Scenario Handled | The Intelligence (Detection) | The Agentic Action | Guardrail |
| :--- | :--- | :--- | :--- |
| **Duplicate Vendor Detection** | Agent catches identical payments to "Salesforce" & "Sales-Force Inc." | Formulates a Phase-1 Consolidation Plan. | 🔒 Requires CFO Approval |
| **Cloud Spend Spike (+40%)** | Diagnoses spike as a misconfigured auto-scaling rule rather than seasonal traffic peak. | System reverts auto-scaling rule to baseline. | ⚡ Auto-Executed |
| **SLA Penalty Prevention** | Projects task bottleneck will breach delivery SLA within 3 days. | Generates recovery plan to reprioritize QA delivery tasks. | 🔒 Requires Manager Approval |

---

## 📊 Quantified Business Impact (Annualized Model)

By taking operations from passive observation to active autonomous remediation, AutoCost Guardian provides hard capital return on investment:

| Action Domain | Monthly Saving | Annual ROI | Verification Method |
| :--- | :--- | :--- | :--- |
| **Cloud Resource Optimization** | ₹30,000 | ₹360,000 | Autonomous Downscaling / Idle Shutdown |
| **Vendor Spend Consolidation** | ₹13,333 | ₹160,000 | Human-Approved Discrepancy Pauses |
| **SLA Penalty Avoidance** | ₹50,000 | ₹600,000 | Workflow Rerouting |
| **FinOps Cycle Reduction**| ₹15,000 | ₹180,000 | Automated Reconciliation vs manual labor |
| **TOTAL PROJECTED VALUE** | **₹108,333** | **₹1,300,000** | **System Dashboard Audit Trail** |

---

## ✨ Features

- **🔴 Live Telemetry Engine:** Rejects the monolithic chatbot pattern. The dashboard operates on an asynchronous 2-second polling loop, reacting dynamically to agent resolutions.
- **🧪 Scenario Simulator (Phase 3 Ready):** Let judges inject ANY custom enterprise scenario and watch the agents respond live via the `/simulator` tool.
- **💬 CFO AI Chat:** Ask natural language questions like *"What's my biggest cost leak?"* backed directly by live anomaly streams.
- **🏢 Executive Reporting:** Instantly export C-suite ready financial impact overviews.
- **🛡️ Graceful Degradation:** If any agent step fails, the action defaults to `approval_required: True`, safely placing it in the enterprise review queue. No silent or destructive failures.

---

## ⚡ Quick Start & Run

### 1. Start Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### 2. Start Frontend (React + Vite)
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```

*The dashboard will be available at `http://localhost:5173`*

---
*Built autonomously to reshape enterprise cloud efficiency.*
