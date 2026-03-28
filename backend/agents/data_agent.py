import random
import time
from datetime import datetime, timedelta

# In-memory data store for live simulation
_live_data = None
_last_update = 0

def generate_initial_data():
    now = datetime.now()
    data = []
    
    # 1. Resource Optimization Data
    resources = [
        {"domain": "Resource", "service_name": "EC2", "instance_id": "i-11111111", "cost": 1850.00, "usage_hours": 0.5, "status": "idle"},
        {"domain": "Resource", "service_name": "RDS", "instance_id": "db-22222222", "cost": 1420.50, "usage_hours": 1.0, "status": "idle"},
        {"domain": "Resource", "service_name": "EC2", "instance_id": "i-33333333", "cost": 87.50, "usage_hours": 350.0, "status": "active"},
    ]
    
    # 2. Spend Intelligence Data (Invoices/Vendors)
    spend = [
        {"domain": "Spend", "service_name": "Vendor: Salesforce", "instance_id": "INV-SF-001", "cost": 5000.00, "usage_hours": 0, "status": "paid"},
        {"domain": "Spend", "service_name": "Vendor: Sales-Force Inc.", "instance_id": "INV-SF-001-DUP", "cost": 5000.00, "usage_hours": 0, "status": "pending"},
        {"domain": "Spend", "service_name": "Vendor: Datadog", "instance_id": "INV-DD-092", "cost": 12000.00, "usage_hours": 0, "status": "paid"},
    ]

    # 3. SLA & Penalty Prevention (API Traffic / Latency)
    sla = [
        {"domain": "SLA", "service_name": "API Gateway (Payment)", "instance_id": "route-pay-1", "cost": 0.0, "usage_hours": 50, "status": "healthy", "metric": "latency_ms"},
        {"domain": "SLA", "service_name": "Delivery Pipeline (QA)", "instance_id": "route-qa-deploy", "cost": 0.0, "usage_hours": 280, "status": "warning", "metric": "latency_ms"},
    ]

    # 4. Financial Operations (Reconciliation)
    finops = [
        {"domain": "FinOps", "service_name": "AWS Billing API", "instance_id": "REC-FEB-26", "cost": 45000.00, "usage_hours": 0, "status": "reconciled"},
        {"domain": "FinOps", "service_name": "AWS Billing API", "instance_id": "REC-MAR-26", "cost": 52000.00, "usage_hours": 0, "status": "unreconciled"},
    ]

    for idx, item in enumerate(resources + spend + sla + finops):
        item["timestamp"] = (now - timedelta(hours=len(resources + spend + sla + finops) - idx)).isoformat()
        data.append(item)
        
    return data

def load_cost_data():
    global _live_data, _last_update
    if _live_data is None:
        _live_data = generate_initial_data()
    
    current_time = time.time()
    if current_time - _last_update > 2:
        # Simulate real-time dynamic changes
        for r in _live_data:
            if r['domain'] == 'Resource':
                if r['status'] != 'shutdown':
                    r['cost'] = max(0.0, float(r.get('cost', 0)) + random.uniform(-20, 150))
                    if random.random() < 0.1:
                        r['status'] = 'idle'
                        r['usage_hours'] = 0.5
            elif r['domain'] == 'Spend':
                if random.random() < 0.3:
                    r['cost'] = float(r.get('cost', 0)) + random.uniform(-50, 300)
            elif r['domain'] == 'SLA':
                curr_lat = r.get('usage_hours', 50)
                r['usage_hours'] = max(10, curr_lat + random.uniform(-40, 120))
                r['status'] = 'healthy' if r['usage_hours'] < 300 else 'warning'
                # Simulate penalty cost starting to accrue if latency is high
                if r['usage_hours'] > 300:
                    r['cost'] = float(r.get('cost', 0)) + 50.0
            elif r['domain'] == 'FinOps':
                if r['status'] == 'unreconciled':
                    r['cost'] = float(r.get('cost', 0)) + random.uniform(50, 500)

        _last_update = current_time

    return _live_data

def update_cost_data(updated_records):
    global _live_data
    if _live_data is None: return
    record_map = {r['instance_id']: r for r in updated_records}
    for i, r in enumerate(_live_data):
        if r['instance_id'] in record_map:
            _live_data[i] = record_map[r['instance_id']]

