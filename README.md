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
    %% Styling Configuration
    classDef default fill:#1e293b,stroke:#a855f7,stroke-width:1px,color:#fff;
    classDef agent fill:#0f172a,stroke:#6366f1,stroke-width:2px,color:#fff,font-weight:bold;
    classDef action fill:#022c22,stroke:#10b981,stroke-width:1px,color:#6ee7b7;
    classDef human fill:#450a0a,stroke:#ef4444,stroke-width:1px,color:#fca5a5;
    
    START([🔁 2-Second Telemetry Loop]) --> DA

    subgraph ORCHESTRATION ["5-Agent Sequential Pipeline"]
        DA[🗄️ Data Agent] -->|Raw Enterprise Telemetry| AA
        
        AA[🔍 Anomaly Agent] -->|Detected Deviations| RCA
        
        RCA[🧠 Root Cause Agent] -->|Enriched Context| DE
        
        DE[⚖️ Decision Agent] -->|Strategic Action Plan| ACT
        
        ACT[⚡ Action Agent] -->|Executes Resolution| LOGS[(Immutable Audit Log)]
    end

    %% Intelligent Routing Detail
    RCA -.->|Low Complexity Tasks| L8B(Llama-3-8B \n Cost: $0)
    RCA -.->|High Complexity Tasks| G15(Gemini-1.5-Pro \n Intense Reasoning)
    L8B -.-> DE
    G15 -.-> DE

    %% Execution Logic Detail
    ACT -.->|Safe Actions| AUTO[Autonomous Execution:\nShutdown & Config Fixes]:::action
    ACT -.->|High Risk| HITL[Human Workflow:\nCFO Approval Dashboard]:::human
    
    %% Error Recovery (Autonomy Depth)
    AUTO -.->|Graceful Degradation\nCloud API Rate Limits| HITL
    
    class DA,AA,RCA,DE,ACT agent;
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

## ✨ Features & Presentation

- **🎨 Masterclass UI & Glassmorphism:** The platform features an ultra-premium, dark-themed interface built using advanced CSS glassmorphism, responsive canvas animations, and a cohesive `Aegis.AutoCost` neon visual identity.
- **🚀 Immersive Marketing Suite:** Includes 4 standalone landing pages (`/`, `/features`, `/architecture`, `/impact`) equipped with live dashboard mockups, animated particle networks, and scroll-triggered reveals for hackathon pitches.
- **🔴 Live Telemetry Engine:** Rejects the monolithic chatbot pattern. The dashboard operates on an asynchronous 2-second polling loop, reacting dynamically to agent resolutions.
- **🧪 Scenario Simulator (Phase 3 Ready):** Let judges inject ANY custom enterprise scenario and watch the agents respond live via the `/simulator` tool.
- **💬 CFO AI Chat:** Ask natural language questions like *"What's my biggest cost leak?"* backed directly by live anomaly streams—with zero LLM API latency.
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

*The application will boot on `http://localhost:5173` showcasing the Masterclass Landing Page.*

---
*AutoCost Guardian AI — The standard for autonomous cost engineering.*
