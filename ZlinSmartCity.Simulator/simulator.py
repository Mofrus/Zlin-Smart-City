try:
    import requests
except ImportError:
    print("Error: 'requests' library not found.")
    exit(1)

import random
import time
from datetime import datetime

BASE_URL = "http://localhost:5214/api"

PARKING_LOTS = ["velke-kino", "nad-trznici", "bartosova", "obchodni-dum", "malenovice", "jizni-svahy", "utb-u13"]

# 🛣️ REAL ZLIN ROAD SEGMENTS (Traced Coordinates)
ROAD_SEGMENTS = [
    {
        "name": "trida Tomase Bati (Center)",
        "path": [[49.2235, 17.6580], [49.2240, 17.6620], [49.2245, 17.6660], [49.2250, 17.6700]]
    },
    {
        "name": "Stefanikova Street",
        "path": [[49.2260, 17.6750], [49.2265, 17.6710], [49.2270, 17.6670], [49.2275, 17.6630]]
    },
    {
        "name": "Okruzni (Jizni Svahy)",
        "path": [[49.2380, 17.6550], [49.2360, 17.6570], [49.2340, 17.6590], [49.2320, 17.6610]]
    },
    {
        "name": "J.A. Bati Area",
        "path": [[49.2220, 17.6550], [49.2225, 17.6580], [49.2230, 17.6610], [49.2235, 17.6640]]
    }
]

TRAFFIC_DESCS = {
    0: ["Heavy traffic jam", "Slow moving traffic", "Gridlock reported"],
    1: ["Police speed check", "Routine patrol", "Traffic control"],
    2: ["Road construction", "Lane closure", "Utility repairs"],
    3: ["Vehicle collision", "Minor accident", "Broken down car"]
}

TRANSIT_LINES = [
    {"id": "bus-1", "line": "1", "dest": "Prluky"},
    {"id": "bus-2", "line": "2", "dest": "Bartosova ctvrt"},
    {"id": "bus-4", "line": "4", "dest": "Vrsava"},
    {"id": "bus-8", "line": "8", "dest": "Jizni Svahy"}
]

def run_simulator():
    print("🚀 Smart City Simulator v4 (Realistic Paths) Started")
    for bus in TRANSIT_LINES:
        bus["lat"], bus["lng"] = 49.224, 17.665

    while True:
        timestamp = datetime.now().strftime("%H:%M:%S")
        hour = datetime.now().hour
        is_rush = (7 <= hour <= 9) or (15 <= hour <= 17)
        
        # 1. Update Parking
        for lot_id in PARKING_LOTS:
            try: requests.post(f"{BASE_URL}/parking/update", json={"parkingLotId": lot_id, "freeSpaces": random.randint(5, 45)}, timeout=2)
            except: pass

        # 2. Update Transit
        for bus in TRANSIT_LINES:
            bus["lat"] += random.uniform(-0.0003, 0.0003)
            bus["lng"] += random.uniform(-0.0003, 0.0003)
            try: requests.post(f"{BASE_URL}/transit/update", json={
                "id": bus["id"], "line": bus["line"], "destination": bus["dest"],
                "latitude": bus["lat"], "longitude": bus["lng"], "delayMinutes": random.randint(0, 5)
            }, timeout=2)
            except: pass

        # 3. Traffic with Realistic Road Paths
        if random.random() < (0.6 if is_rush else 0.3):
            road = random.choice(ROAD_SEGMENTS)
            t_type = random.choice([0, 1, 2, 3])
            
            payload = {
                "type": t_type,
                "latitude": road["path"][0][0],
                "longitude": road["path"][0][1],
                "description": f"{random.choice(TRAFFIC_DESCS[t_type])} on {road['name']}",
                "severity": random.randint(2, 5) if is_rush else random.randint(1, 3),
                "path": road["path"] if t_type == 0 else [] # Only Jams show lines
            }
            try:
                requests.post(f"{BASE_URL}/traffic/update", json=payload, timeout=2)
                if payload["severity"] >= 4:
                    requests.post(f"{BASE_URL}/alerts", json={"message": f"🚨 {payload['description']}!", "severity": "Critical"}, timeout=2)
            except: pass

        # 4. Bus Stops & EV
        for ev_id in ["ev-1", "ev-2", "ev-3"]:
            try: requests.post(f"{BASE_URL}/ev/update", json={"id": ev_id, "occupiedSpots": random.randint(0, 2)}, timeout=2)
            except: pass

        print(f"[{timestamp}] State synced.")
        time.sleep(5)

if __name__ == '__main__':
    run_simulator()
