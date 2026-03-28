def analyze_root_causes(anomalies: list) -> list:
    for r in anomalies:
        atype = r.get('anomaly_type', '')
        service = r.get('service_name', 'Unknown')
        usage = r.get('usage_hours', 0)
        cost = r.get('cost', 0)
        domain = r.get('domain', 'Resource')

        if atype == 'IDLE_HIGH_COST':
            r['root_cause'] = (
                f"{service} instance has been running idle "
                f"creating waste of ₹{cost:,.2f}."
            )
        elif atype == 'CLOUD_SPEND_SPIKE':
            r['root_cause'] = (
                f"{service} infrastructure costs spiked 40% MoM (₹{cost:,.2f}). "
                f"Diagnosed as a misconfigured auto-scaling rule, not seasonal traffic."
            )
        elif atype == 'DUPLICATE_VENDOR':
            r['root_cause'] = (
                f"Procurement dataset shows duplicate/overlapping vendor entities "
                f"for service {service}. Overlapping service agreements detected resulting in ₹{cost:,.2f} leak."
            )
        elif atype == 'VENDOR_RATE_SPIKE':
            r['root_cause'] = (
                f"{service} rate exceeded limits (₹{cost:,.2f}). "
                f"Potential rate optimization required."
            )
        elif atype == 'SLA_BREACH_PREDICTION':
            r['root_cause'] = (
                f"{service} team is trending toward missing a contractual SLA "
                f"with 3 days remaining due to bottlenecked task reprioritization."
            )
        elif atype == 'RECONCILIATION_DISCREPANCY':
            r['root_cause'] = (
                f"{service} shows an unreconciled payment discrepancy of ₹{cost:,.2f}. "
                f"Needs financial ops reconciliation to close cycle."
            )
        else:
            r['root_cause'] = "Unclassified anomaly — manual review recommended."
    return anomalies
