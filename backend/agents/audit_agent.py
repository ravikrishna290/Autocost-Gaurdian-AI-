import json
import os
from datetime import datetime

LOG_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'audit_log.json')

def log_action(record: dict):
    entry = {k: str(v) if not isinstance(v, (int, float, bool, type(None))) else v
             for k, v in record.items()}
    entry['logged_at'] = datetime.utcnow().isoformat() + 'Z'

    logs = _read_logs()
    logs.append(entry)
    with open(LOG_PATH, 'w') as f:
        json.dump(logs, f, indent=2)

def get_all_logs() -> list:
    return _read_logs()

def clear_logs():
    with open(LOG_PATH, 'w') as f:
        json.dump([], f)

def _read_logs() -> list:
    if not os.path.exists(LOG_PATH):
        return []
    try:
        with open(LOG_PATH, 'r') as f:
            return json.load(f)
    except Exception:
        return []
