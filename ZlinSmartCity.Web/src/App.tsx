import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, Polyline } from 'react-leaflet';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import './App.css';
import L from 'leaflet';

// Fix for default marker icon
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({ iconUrl: markerIcon, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

interface ParkingLot { id: string; name: string; totalCapacity: number; freeSpaces: number; latitude: number; longitude: number; lastUpdated: string; }
interface HistoryData { time: string; free: number; }
interface TrafficEvent { id: string; type: number; latitude: number; longitude: number; path?: [number, number][]; description: string; severity: number; }
interface TransitVehicle { id: string; line: string; latitude: number; longitude: number; delayMinutes: number; destination: string; }
interface EVStation { id: string; name: string; latitude: number; longitude: number; totalSpots: number; occupiedSpots: number; connectorType: string; }
interface BusStop { id: string; name: string; latitude: number; longitude: number; nextDepartures: Departure[]; }
interface Departure { line: string; destination: string; minutesToArrival: number; }
interface Landmark { id: string; name: string; latitude: number; longitude: number; description: string; icon: string; funFact: string; }
interface Alert { id: string; message: string; severity: string; }

function ChangeView({ center, zoom, pitch }: { center: [number, number], zoom: number, pitch?: boolean }) {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => { map.invalidateSize(); }, 100);
    map.flyTo(center, zoom, { duration: 1.5 });
    const container = map.getContainer();
    if (pitch) {
      container.style.transform = "perspective(1000px) rotateX(15deg)";
      container.style.transition = "transform 1.5s ease-in-out";
    } else {
      container.style.transform = "none";
    }
  }, [center, zoom, map, pitch]);
  return null;
}

function App() {
  const [activeTab, setActiveTab] = useState<'map' | 'analytics'>('map');
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [trafficEvents, setTrafficEvents] = useState<TrafficEvent[]>([]);
  const [transit, setTransit] = useState<TransitVehicle[]>([]);
  const [evStations, setEvStations] = useState<EVStation[]>([]);
  const [busStops, setBusStops] = useState<BusStop[]>([]);
  const [landmarks, setLandmarks] = useState<Landmark[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  const [showTraffic, setShowTraffic] = useState(true);
  const [showTransit, setShowTransit] = useState(true);
  const [showEV, setShowEV] = useState(true);
  const [showStops, setShowStops] = useState(true);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [showParking, setShowParking] = useState(true);
  
  const [history, setHistory] = useState<Record<string, HistoryData[]>>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mapTheme, setMapTheme] = useState<'light' | 'dark'>(() => (new Date().getHours() >= 20 || new Date().getHours() < 7) ? 'dark' : 'light');
  const [mapFocus, setMapFocus] = useState<{center: [number, number], zoom: number, pitch: boolean}>({ center: [49.224, 17.665], zoom: 14, pitch: false });
  const [favorites, setFavorites] = useState<string[]>(() => JSON.parse(localStorage.getItem('parking_favorites') || '[]'));

  useEffect(() => { localStorage.setItem('parking_favorites', JSON.stringify(favorites)); }, [favorites]);

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:5214/api/city/all');
      const { parking, traffic, transit: trans, ev, stops, landmarks: lands, alerts: newAlerts } = res.data;
      setParkingLots(parking); setTrafficEvents(traffic); setTransit(trans); setEvStations(ev); setBusStops(stops); setLandmarks(lands); setAlerts(newAlerts);
      const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setHistory(prev => {
        const next = { ...prev };
        parking.forEach((lot: ParkingLot) => {
          if (!next[lot.id]) next[lot.id] = [];
          next[lot.id] = [...next[lot.id].slice(-19), { time: ts, free: lot.freeSpaces }];
        });
        return next;
      });
      setLoading(false);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); const interval = setInterval(fetchData, 5000); return () => clearInterval(interval); }, []);

  const generateHistoricalData = (lot: ParkingLot, points: number) => {
    const data: HistoryData[] = [];
    const now = new Date();
    for (let i = points; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 1000 * 60 * 15);
      data.push({ time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), free: Math.floor(Math.random() * lot.totalCapacity) });
    }
    return data;
  };

  const handleTimeSkip = () => {
    setGenerating(true);
    setTimeout(() => {
      setHistory(prev => {
        const next = { ...prev };
        parkingLots.forEach(lot => {
          const randomData = generateHistoricalData(lot, 10);
          next[lot.id] = [...(next[lot.id] || []), ...randomData].slice(-50);
        });
        return next;
      });
      setGenerating(false);
    }, 1000);
  };

  const handleDownload = (period: 'week' | 'month' | 'year') => {
    const pointsNeeded = period === 'week' ? 672 : period === 'month' ? 2880 : 35040;
    const currentPoints = history[parkingLots[0]?.id]?.length || 0;
    if (currentPoints < pointsNeeded) {
      if (window.confirm(`Not enough data for a ${period} report. Generate simulated data?`)) {
        setGenerating(true);
        setTimeout(() => {
          const bulk: Record<string, HistoryData[]> = {};
          parkingLots.forEach(lot => { bulk[lot.id] = generateHistoricalData(lot, pointsNeeded); });
          setHistory(bulk);
          setGenerating(false);
          const csvRows = ["Lot,Time,Free Spaces"];
          parkingLots.forEach(lot => { bulk[lot.id].forEach(p => csvRows.push(`${lot.name},${p.time},${p.free}`)); });
          downloadCSV(csvRows, period);
        }, 2000);
      }
      return;
    }
    const csvRows = ["Lot,Time,Free Spaces"];
    parkingLots.forEach(lot => { history[lot.id].forEach(p => csvRows.push(`${lot.name},${p.time},${p.free}`)); });
    downloadCSV(csvRows, period);
  };

  const downloadCSV = (rows: string[], period: string) => {
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `zlin_parking_${period}.csv`);
    a.click();
  };

  const getPrediction = (lotId: string) => {
    const data = history[lotId]; if (!data || data.length < 5) return null;
    const trend = data[data.length-1].free - data[data.length-5].free;
    if (trend < -5) return { text: "Filling up", color: "#ef4444" };
    if (trend > 5) return { text: "Opening up", color: "#22c55e" };
    return null;
  };

  const getMarkerIcon = (free: number, total: number) => {
    const ratio = free / total; const color = ratio > 0.4 ? '#22c55e' : ratio > 0.1 ? '#f59e0b' : '#ef4444';
    return L.divIcon({ className: 'custom-div-icon', html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.3);"></div>`, iconSize: [14, 14], iconAnchor: [7, 7] });
  };

  const getLandmarkIcon = (icon: string) => L.divIcon({ className: 'landmark-icon', html: `<div class="landmark-3d">${icon}</div>`, iconSize: [40, 40], iconAnchor: [20, 40] });
  const getTransitIcon = (line: string) => L.divIcon({ className: 'transit-icon', html: `<div style="background: #3b82f6; color: white; border-radius: 4px; padding: 2px 6px; font-weight: 700; font-size: 11px; border: 1px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">🚌 ${line}</div>`, iconSize: [40, 20], iconAnchor: [20, 10] });
  const getStopIcon = () => L.divIcon({ className: 'stop-icon', html: `<div style="background: #1e293b; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border: 2px solid #3b82f6; font-size: 12px;">🚏</div>`, iconSize: [24, 24], iconAnchor: [12, 12] });
  const getTrafficIcon = (type: number) => L.divIcon({ className: 'traffic-icon', html: `<div style="background: white; border: 2px solid ${['#f59e0b', '#3b82f6', '#ef4444', '#7c3aed'][type]}; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-size: 14px;">${['🚗', '👮', '🚧', '💥'][type]}</div>`, iconSize: [28, 28], iconAnchor: [14, 14] });

  const filteredLots = parkingLots.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase())).sort((a, b) => (favorites.includes(b.id) ? 1 : 0) - (favorites.includes(a.id) ? 1 : 0));

  return (
    <div className={`dashboard ${mapTheme === 'light' ? 'light-theme' : ''}`}>
      {alerts.length > 0 && <div className={`emergency-banner ${alerts[0].severity.toLowerCase()}`}><span className="blink">🚨</span> {alerts[0].message}</div>}
      <header>
        <h1>Zlín Smart Hub</h1>
        <nav className="nav-tabs">
          <div className={`nav-tab ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}>Map View</div>
          <div className={`nav-tab ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>Analytics</div>
        </nav>
        <div className="header-actions">
          <button className={`layer-btn ${showLandmarks ? 'active' : ''}`} onClick={() => setShowLandmarks(!showLandmarks)}>🏙️ Icons</button>
          <button className={`layer-btn ${showParking ? 'active' : ''}`} onClick={() => setShowParking(!showParking)}>🅿️ Parking</button>
          <button className={`layer-btn ${showTraffic ? 'active' : ''}`} onClick={() => setShowTraffic(!showTraffic)}>🚥 Traffic</button>
          <button className={`layer-btn ${showTransit ? 'active' : ''}`} onClick={() => setShowTransit(!showTransit)}>🚌 Transit</button>
          <button className="theme-toggle" onClick={() => setMapTheme(mapTheme === 'light' ? 'dark' : 'light')}>{mapTheme === 'light' ? '🌙' : '☀️'}</button>
        </div>
      </header>
      <div className="main-content">
        <aside className="sidebar">
          <div className="global-stats">
            <div className="stat-item"><span className="stat-label">Occupancy</span><span className="stat-value">{(((parkingLots.reduce((acc,l)=>acc+l.totalCapacity,0)-parkingLots.reduce((acc,l)=>acc+l.freeSpaces,0))/parkingLots.reduce((acc,l)=>acc+l.totalCapacity,0))*100).toFixed(1)}%</span></div>
            <div className="stat-item"><span className="stat-label">Free Spots</span><span className="stat-value">{parkingLots.reduce((acc,l)=>acc+l.freeSpaces,0)}</span></div>
          </div>
          <div className="search-box"><input type="text" placeholder="Filter parking..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} /></div>
          <h2>Landmarks</h2>
          <div className="landmarks-quick-jump">
            {landmarks.map(l => (
              <button key={l.id} className="jump-btn" onClick={() => { setActiveTab('map'); setMapFocus({ center: [l.latitude, l.longitude], zoom: 18, pitch: true }); }}>{l.icon} {l.name.split(' ')[0]}</button>
            ))}
          </div>
          <h2>Parking Lots</h2>
          {filteredLots.map(lot => {
            const pred = getPrediction(lot.id);
            return (
              <div key={lot.id} className={`parking-card ${mapFocus.center[0] === lot.latitude ? 'active' : ''}`} onClick={() => { setActiveTab('map'); setMapFocus({ center: [lot.latitude, lot.longitude], zoom: 17, pitch: false }); }}>
                <div className="parking-card-header"><div className="parking-name">{lot.name}</div><button className={`fav-btn ${favorites.includes(lot.id) ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); setFavorites(prev => prev.includes(lot.id) ? prev.filter(f => f !== lot.id) : [...prev, lot.id]); }}>{favorites.includes(lot.id) ? '⭐' : '☆'}</button></div>
                <div className="capacity-text">{lot.freeSpaces} / {lot.totalCapacity} free</div>
                <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${(lot.freeSpaces / lot.totalCapacity) * 100}%`, backgroundColor: lot.freeSpaces/lot.totalCapacity > 0.4 ? '#22c55e' : lot.freeSpaces/lot.totalCapacity > 0.1 ? '#f59e0b' : '#ef4444' }}></div></div>
                {pred && <div className="prediction-tag" style={{color: pred.color}}>{pred.text}</div>}
              </div>
            );
          })}
        </aside>
        <main className="view-content" style={{ overflow: 'hidden' }}>
          {activeTab === 'map' ? (
            <MapContainer center={mapFocus.center} zoom={mapFocus.zoom} style={{height: '100%'}} maxBounds={L.latLngBounds([49.18, 17.55], [49.28, 17.75])}>
              <ChangeView center={mapFocus.center} zoom={mapFocus.zoom} pitch={mapFocus.pitch} />
              <TileLayer url={mapTheme === 'light' ? 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png' : 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'} />
              {showLandmarks && landmarks.map(l => (
                <Marker key={l.id} position={[l.latitude, l.longitude]} icon={getLandmarkIcon(l.icon)}>
                  <Popup><div className="landmark-popup"><h3>{l.name}</h3><p>{l.description}</p><div className="fun-fact"><strong>💡 Fact:</strong> {l.funFact}</div></div></Popup>
                </Marker>
              ))}
              {showParking && parkingLots.map(lot => (
                <Marker key={lot.id} position={[lot.latitude, lot.longitude]} icon={getMarkerIcon(lot.freeSpaces, lot.totalCapacity)}>
                  <Tooltip permanent direction="top" offset={[0, -5]}><div className="custom-marker-label">{lot.freeSpaces}</div></Tooltip>
                </Marker>
              ))}
              {showTraffic && trafficEvents.map(event => (
                <div key={event.id}>
                  {event.type === 0 && event.path && event.path.length > 0 && (
                    <Polyline 
                      positions={event.path as [number, number][]} 
                      pathOptions={{ color: event.severity > 3 ? '#ef4444' : '#f59e0b', weight: 6, opacity: 0.8 }} 
                    />
                  )}
                  <Marker position={[event.latitude, event.longitude]} icon={getTrafficIcon(event.type)}>
                    <Popup><strong>{['Jam', 'Police', 'Work', 'Crash'][event.type]}</strong><br/>{event.description}</Popup>
                  </Marker>
                </div>
              ))}
              {showTransit && transit.map(bus => (<Marker key={bus.id} position={[bus.latitude, bus.longitude]} icon={getTransitIcon(bus.line)}><Popup><strong>Line {bus.line}</strong> to {bus.destination}<br/>Delay: {bus.delayMinutes} min</Popup></Marker>))}
              {showStops && busStops.map(stop => (<Marker key={stop.id} position={[stop.latitude, stop.longitude]} icon={getStopIcon()}><Popup><div className="stop-popup"><strong>🚏 {stop.name}</strong><div className="departure-list">{stop.nextDepartures.map((d, i) => (<div key={i} className="departure-item"><span>Line {d.line} → {d.destination}</span><strong>{d.minutesToArrival}m</strong></div>))}</div></div></Popup></Marker>))}
            </MapContainer>
          ) : (
            <div className="analytics-container">
              <div className="analytics-controls">
                <div className="control-group">
                  <button className="action-btn skip-btn" onClick={handleTimeSkip} disabled={generating}>{generating ? '⌛ Generating...' : '⏩ Skip Time'}</button>
                </div>
                <div className="control-group">
                  <span className="control-label">Reports:</span>
                  <button className="action-btn" onClick={() => handleDownload('week')}>Week</button>
                  <button className="action-btn" onClick={() => handleDownload('month')}>Month</button>
                </div>
              </div>

              <div className="analytics-top-section">
                <div className="traffic-analytics chart-card">
                  <h2>Traffic Incidents</h2>
                  <div className="traffic-grid">
                    {trafficEvents.length === 0 ? <p className="no-data">All clear.</p> : 
                      trafficEvents.map(e => (
                        <div key={e.id} className="traffic-mini-card">
                          <span className="mini-icon">{['🚗', '👮', '🚧', '💥'][e.type]}</span>
                          <div className="mini-info"><strong>{['Jam', 'Police', 'Work', 'Crash'][e.type]}</strong><p>{e.description}</p></div>
                        </div>
                      ))
                    }
                  </div>
                </div>

                <div className="city-log-container chart-card">
                  <div className="city-log-header"><h2>City Activity Log</h2></div>
                  <div className="log-feed">
                    {alerts.length === 0 ? <p className="no-data">System nominal.</p> : 
                      alerts.map(a => (
                        <div key={a.id} className={`log-item ${a.severity.toLowerCase()}`}>
                          <div className="log-icon">{a.severity === 'Critical' ? '🚨' : '⚠️'}</div>
                          <div className="log-content"><strong>{a.severity}</strong><p>{a.message}</p></div>
                          <div className="log-time">{new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>

              {filteredLots.map(lot => (
                <div key={lot.id} className="chart-card">
                  <div className="chart-card-header"><div><h3>{lot.name}</h3>{getPrediction(lot.id) && <small style={{color: getPrediction(lot.id)!.color}}>{getPrediction(lot.id)!.text}</small>}</div>{favorites.includes(lot.id) && '⭐'}</div>
                  <div style={{height: '200px'}}><ResponsiveContainer><LineChart data={history[lot.id] || []}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey="time" hide /><YAxis domain={[0, lot.totalCapacity]} stroke="#94a3b8" fontSize={12} /><RechartsTooltip contentStyle={{background: '#1e293b', border: 'none'}} /><Line type="monotone" dataKey="free" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} /></LineChart></ResponsiveContainer></div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
export default App;
