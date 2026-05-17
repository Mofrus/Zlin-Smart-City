# 🏙️ Zlín Smart City Hub

A high-performance, real-time "Smart City" monitoring dashboard for Zlín, Czech Republic. This full-stack project integrates live data simulation, predictive AI, and interactive mapping to provide a comprehensive urban management interface.

---

## 🚀 Professional Technical Stack

- **Frontend:** React 18, TypeScript, Vite, Leaflet (Map Engine), Recharts (Analytics), Axios.
- **Backend:** .NET 9 API, ASP.NET Core Minimal APIs, Concurrent Collections (In-memory real-time store).
- **Simulator:** Python 3.13, Requests, Randomization Engine (Simulating City Dynamics).
- **Styling:** CSS3 (Variables, Perspective 3D, Flexbox/Grid), Multi-theme support.

---

## 🌟 Key Features

### 1. 🔮 Intelligent Analytics & Predictive AI
- **Live Parking Monitoring:** Real-time occupancy tracking for 11+ parking lots in Zlín.
- **Predictive AI Tags:** Frontend logic analyzes data trends to forecast if a lot is "Filling up" or "Opening up".
- **Historical Reporting:** Generate and export detailed CSV reports for Week/Month/Year periods with instant historical data simulation.

### 2. 🚥 Dynamic Traffic & Public Transport
- **Waze-style Traffic Layer:** Visualizes traffic jams as colored polylines directly on the map.
- **Live Transit (DSZO):** Real-time bus positions with line numbers, destinations, and delay tracking.
- **Interactive Departure Boards:** Clickable bus stops show a "Digital Signage" popup with the next 3 scheduled arrivals.

### 3. 🚨 City Safety & Infrastructure
- **Emergency Alert System:** High-visibility banner for critical city events (accidents, severe jams).
- **EV Charging Network:** Track availability of electric vehicle charging points with connector type details.

### 4. 🏙️ Immersive UI/UX
- **3D Landmark "Fly-To":** Quick-jump buttons to Zlín landmarks (Bata's Skyscraper, Zlín Zoo) with smooth 1.5s camera transitions and perspective shifts.
- **Auto-Theme Engine:** Automatically switches between Light and Dark modes based on the user's local time (Sunrise/Sunset logic).
- **Personalization:** "Favorite" system to pin important locations to the top of the sidebar.

---

## 🛠️ System Architecture

1.  **The API (.NET):** Acts as the central "City Brain". It manages the state of all city systems and exposes a unified `/api/city/all` endpoint for maximum frontend performance.
2.  **The Simulator (Python):** Generates urban complexity. It simulates "Rush Hours", creates accidents, moves buses, and updates parking levels every 5 seconds.
3.  **The Dashboard (React):** A high-fps, fully responsive dashboard that visualizes the city state using Leaflet and Recharts.

---

## 💻 How to Run Locally

### Prerequisites
- .NET 9 SDK
- Node.js (v18+)
- Python 3.x

### ⚡ Quick Start (Recommended)
Run the entire stack with a single command from the project root (requires **Git Bash** on Windows):

```bash
chmod +x start-all.sh
./start-all.sh
```

---

### 🛠️ Manual Setup
If you prefer to run components individually:

1. **Start the API:**
   ```bash
   cd ZlinSmartCity.Api
   dotnet run
   ```
2. **Start the Dashboard:**
   ```bash
   cd ZlinSmartCity.Web
   npm install
   npm run dev
   ```
3. **Start the Simulator:**
   ```bash
   cd ZlinSmartCity.Simulator
   pip install -r requirements.txt
   python simulator.py
   ```

---

## 👨‍💻 Portfolio Insights
This project demonstrates proficiency in:
- **Full-stack coordination** across multiple languages (.NET, Python, TypeScript).
- **Asynchronous real-time data handling** and state management.
- **Advanced UI/UX patterns** including 3D transformations and dynamic mapping.
- **Software Engineering standards** like concurrent programming and clean API design.

---
*Created by [Your Name] as a showcase of Smart City infrastructure visualization.*
