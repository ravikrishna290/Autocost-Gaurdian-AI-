import random
from agents.audit_agent import log_action

def execute_action(anomaly: dict) -> dict:
    action = anomaly.get('recommended_action', 'Flag for Review')
    cost = float(anomaly.get('cost', 0))
    savings_pct = float(anomaly.get('savings_pct', 0))
    # For SLA, cost is currently 0, so let's mock a penalty savings
    if anomaly.get('domain') == 'SLA':
        savings = 5000.00 # arbitrary penalty avoided
    else:
        savings = round(cost * savings_pct / 100, 2)

    exec_status = 'Pending Manual Review'

    # Simulated Autonomy Depth — Error Recovery & Fallback Logic
    try:
        if action == 'Shutdown Instance':
            if random.random() < 0.10: # 10% chance to simulate API limit/failure
                raise Exception("Cloud API Rate Limit Reached")
            exec_status = 'Executed: Instance Shutdown'
        elif action == 'Downscale Instance':
            exec_status = 'Executed: Instance Downscaled'
        elif action == 'Suspend Payment':
            exec_status = 'Executed: Payment Suspended'
        elif action == 'Reroute Traffic':
            exec_status = 'Executed: Traffic Rerouted to Backup'
        elif action == 'Revert Auto-Scaling Rule':
            exec_status = 'Executed: Scaling Rule Reverted'
        elif 'Flag for Review' in action:
            exec_status = 'Pending Enterprise Approval'
    except Exception as e:
        # Graceful Degradation: Do not fail the pipeline. Route to human.
        action = f"FALLBACK: Routed to Manual Review"
        exec_status = f"Execution Blocked ({str(e)}) — Escalating safely."
        savings = 0.0

    result = {
        'instance_id': anomaly.get('instance_id'),
        'service_name': anomaly.get('service_name'),
        'action_taken': action,
        'execution_status': exec_status,
        'original_cost': cost,
        'estimated_savings': savings,
        'savings_pct': savings_pct,
    }

    log_action({**anomaly, **result})
    return result


def execute_all_actions(anomalies: list) -> list:
    return [execute_action(a) for a in anomalies if not a.get('approval_required', False)]
