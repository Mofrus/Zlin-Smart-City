# Zlín Smart City Simulator

This Python script simulates live parking data for the Zlín Smart City dashboard.

## Requirements

- Python 3.x
- `requests` library

## Installation

```bash
pip install -r requirements.txt
```

## Running the Simulator

1. Ensure the .NET API is running (usually on `http://localhost:5214`).
2. Run the simulator:

```bash
python simulator.py
```

The simulator will auto-detect if the API is reachable on `localhost` or `127.0.0.1` and update parking lot data every 10 seconds.
