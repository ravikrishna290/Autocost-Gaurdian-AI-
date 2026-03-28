def make_decisions(anomalies: list) -> list:
    for r in anomalies:
        atype = r.get('anomaly_type', '')
        usage = float(r.get('usage_hours', 0))

        if atype == 'IDLE_HIGH_COST':
            r['recommended_action'] = 'Shutdown Instance'
            r['action_rationale'] = 'Instance is idle — shutting down eliminates 100% of cost.'
            r['savings_pct'] = 100
            r['approval_required'] = False
        elif atype == 'CLOUD_SPEND_SPIKE':
            r['recommended_action'] = 'Revert Auto-Scaling Rule'
            r['action_rationale'] = 'Fixing provisioning error (auto-scaling) recovers 40% spike.'
            r['savings_pct'] = 40
            r['approval_required'] = False
        elif atype == 'DUPLICATE_VENDOR':
            r['recommended_action'] = 'Consolidate Vendors (Priority 1)'
            r['action_rationale'] = 'Agent identified duplicate entities. Consolidation saves 100% of overlapping invoice.'
            r['savings_pct'] = 100
            r['approval_required'] = True
        elif atype == 'VENDOR_RATE_SPIKE':
            r['recommended_action'] = 'Flag for Review (Vendor Auth)'
            r['action_rationale'] = 'Rate exceeds benchmark — requires enterprise approval to renegotiate or warn vendor.'
            r['savings_pct'] = 0
            r['approval_required'] = True
        elif atype == 'SLA_BREACH_PREDICTION':
            r['recommended_action'] = 'Escalate Recovery Plan to Manager'
            r['action_rationale'] = 'Projected SLA shortfall requires manager approval to reassign resources to critical path.'
            r['savings_pct'] = 100 # Saving the penalty amount
            r['approval_required'] = True
        elif atype == 'RECONCILIATION_DISCREPANCY':
            r['recommended_action'] = 'Flag for Review (FinOps)'
            r['action_rationale'] = 'Unreconciled transaction >$50k — requires finance controller approval to close.'
            r['savings_pct'] = 0
            r['approval_required'] = True
        else:
            r['recommended_action'] = 'Flag for Review'
            r['action_rationale'] = 'Unclassified — needs human review before action.'
            r['savings_pct'] = 0
            r['approval_required'] = True

    return anomalies
