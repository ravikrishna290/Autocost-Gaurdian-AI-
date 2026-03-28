COST_THRESHOLD = 200  # ₹ threshold; anything above this with low usage is anomalous
USAGE_THRESHOLD = 2   # hours; usage below this is considered idle

def detect_anomalies(data: list) -> list:
    anomalies = []
    seen_invoices = set()
    
    for record in data:
        r = dict(record)
        domain = r.get('domain', 'Resource')
        cost = float(r.get('cost', 0))
        usage = float(r.get('usage_hours', 0))
        status = str(r.get('status', '')).strip().lower()

        is_anomaly = False
        anomaly_type = ""

        if domain == 'Resource':
            if status == 'idle' and cost > COST_THRESHOLD:
                is_anomaly = True
                anomaly_type = "IDLE_HIGH_COST"
            elif status == 'active' and cost > 800:
                is_anomaly = True
                anomaly_type = "CLOUD_SPEND_SPIKE"

        elif domain == 'Spend':
            # Sub-scenario: Duplicate vendor detection
            if status == 'pending' and 'DUP' in r.get('instance_id', ''):
                is_anomaly = True
                anomaly_type = "DUPLICATE_VENDOR"
            elif status == 'paid' and cost > 10000:
                is_anomaly = True
                anomaly_type = "VENDOR_RATE_SPIKE"

        elif domain == 'SLA':
            # Sub-scenario: SLA penalty prevention
            latency = usage
            if status == 'warning' or latency > 250:
                is_anomaly = True
                anomaly_type = "SLA_BREACH_PREDICTION"

        elif domain == 'FinOps':
            if status == 'unreconciled' and cost >= 45000:
                is_anomaly = True
                anomaly_type = "RECONCILIATION_DISCREPANCY"

        if is_anomaly:
            r['anomaly_type'] = anomaly_type
            anomalies.append(r)

    return anomalies
