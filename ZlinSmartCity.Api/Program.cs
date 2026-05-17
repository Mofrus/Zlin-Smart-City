using Microsoft.AspNetCore.Mvc;
using System.Collections.Concurrent;
using ZlinSmartCity.Api.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var parkingLots = new ConcurrentDictionary<string, ParkingLot>();
var trafficEvents = new ConcurrentDictionary<string, TrafficEvent>();
var transitVehicles = new ConcurrentDictionary<string, TransitVehicle>();
var chargingStations = new ConcurrentDictionary<string, ChargingStation>();
var busStops = new ConcurrentDictionary<string, BusStop>();
var landmarks = new ConcurrentDictionary<string, Landmark>();
var alerts = new ConcurrentList<EmergencyAlert>();

builder.Services.AddSingleton(parkingLots);
builder.Services.AddSingleton(trafficEvents);
builder.Services.AddSingleton(transitVehicles);
builder.Services.AddSingleton(chargingStations);
builder.Services.AddSingleton(busStops);
builder.Services.AddSingleton(landmarks);
builder.Services.AddSingleton(alerts);
builder.Services.AddHostedService<DataSimulationService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();

// Initialize Landmarks
var initialLandmarks = new[]
{
    new Landmark { Id = "l-bata", Name = "Bata's Skyscraper", Latitude = 49.2235, Longitude = 17.6595, Icon = "🏢", Description = "The 21st building, once the tallest in Europe.", FunFact = "It has a working office inside an elevator!" },
    new Landmark { Id = "l-zoo", Name = "Zlín Zoo", Latitude = 49.2718, Longitude = 17.7145, Icon = "🦒", Description = "One of the most beautiful zoos in the Czech Republic.", FunFact = "You can pet rays in the Yucatan pavilion." },
    new Landmark { Id = "l-uni", Name = "UTB University", Latitude = 49.2255, Longitude = 17.6668, Icon = "🎓", Description = "Tomas Bata University, Center of Zlín education.", FunFact = "Named after the founder of the local shoe empire." }
};
foreach (var l in initialLandmarks) landmarks.TryAdd(l.Id, l);

// Initialize Parking Lots
var initialParking = new[]
{
    new ParkingLot { Id = "velke-kino", Name = "Velké kino", TotalCapacity = 150, FreeSpaces = 45, Latitude = 49.2223, Longitude = 17.6651, LastUpdated = DateTime.UtcNow },
    new ParkingLot { Id = "nad-trznici", Name = "Nad Tržnicí", TotalCapacity = 80, FreeSpaces = 12, Latitude = 49.2245, Longitude = 17.6621, LastUpdated = DateTime.UtcNow },
    new ParkingLot { Id = "bartosova", Name = "Bartošova", TotalCapacity = 45, FreeSpaces = 5, Latitude = 49.2265, Longitude = 17.6680, LastUpdated = DateTime.UtcNow },
    new ParkingLot { Id = "obchodni-dum", Name = "Obchodní dům", TotalCapacity = 200, FreeSpaces = 80, Latitude = 49.2235, Longitude = 17.6635, LastUpdated = DateTime.UtcNow },
    new ParkingLot { Id = "malenovice", Name = "Malenovice (Centro)", TotalCapacity = 500, FreeSpaces = 300, Latitude = 49.2105, Longitude = 17.5955, LastUpdated = DateTime.UtcNow },
    new ParkingLot { Id = "jizni-svahy", Name = "Jižní Svahy (Billa)", TotalCapacity = 60, FreeSpaces = 10, Latitude = 49.2385, Longitude = 17.6585, LastUpdated = DateTime.UtcNow },
    new ParkingLot { Id = "utb-u13", Name = "UTB Knihovna", TotalCapacity = 30, FreeSpaces = 2, Latitude = 49.2255, Longitude = 17.6665, LastUpdated = DateTime.UtcNow },
    new ParkingLot { Id = "namesti-miru", Name = "Náměstí Míru", TotalCapacity = 40, FreeSpaces = 8, Latitude = 49.2260, Longitude = 17.6660, LastUpdated = DateTime.UtcNow },
    new ParkingLot { Id = "gajdosova", Name = "Gajdošova", TotalCapacity = 120, FreeSpaces = 45, Latitude = 49.2285, Longitude = 17.6750, LastUpdated = DateTime.UtcNow },
    new ParkingLot { Id = "kvitkova", Name = "Kvítková", TotalCapacity = 35, FreeSpaces = 4, Latitude = 49.2270, Longitude = 17.6710, LastUpdated = DateTime.UtcNow },
    new ParkingLot { Id = "zimni-stadion", Name = "Zimní Stadion", TotalCapacity = 100, FreeSpaces = 20, Latitude = 49.2200, Longitude = 17.6580, LastUpdated = DateTime.UtcNow }
};
foreach (var lot in initialParking) parkingLots.TryAdd(lot.Id, lot);

// Initialize Bus Stops
var initialStops = new[]
{
    new BusStop { Id = "stop-prace", Name = "Náměstí Práce", Latitude = 49.2230, Longitude = 17.6620 },
    new BusStop { Id = "stop-skolni", Name = "Školní", Latitude = 49.2260, Longitude = 17.6680 },
    new BusStop { Id = "stop-centro", Name = "Malenovice Centro", Latitude = 49.2100, Longitude = 17.5950 }
};
foreach (var s in initialStops) busStops.TryAdd(s.Id, s);

// Initialize Charging Stations
var initialChargers = new[]
{
    new ChargingStation { Id = "ev-1", Name = "Obchodni Dum EV", Latitude = 49.2236, Longitude = 17.6636, TotalSpots = 4, OccupiedSpots = 1, ConnectorType = "CCS / Type 2" },
    new ChargingStation { Id = "ev-2", Name = "Malenovice Centro EV", Latitude = 49.2106, Longitude = 17.5956, TotalSpots = 8, OccupiedSpots = 3, ConnectorType = "Tesla Supercharger" },
    new ChargingStation { Id = "ev-3", Name = "Namesti Miru EV", Latitude = 49.2261, Longitude = 17.6661, TotalSpots = 2, OccupiedSpots = 2, ConnectorType = "Type 2" }
};
foreach (var ev in initialChargers) chargingStations.TryAdd(ev.Id, ev);

// Initialize Transit Vehicles
var initialVehicles = new[]
{
    new TransitVehicle { Id = "bus-1", Line = "1", Latitude = 49.2230, Longitude = 17.6620, Destination = "Paseky", DelayMinutes = 0 },
    new TransitVehicle { Id = "trolley-2", Line = "2", Latitude = 49.2260, Longitude = 17.6680, Destination = "Bartošova čtvrť", DelayMinutes = 2 },
    new TransitVehicle { Id = "bus-8", Line = "8", Latitude = 49.2100, Longitude = 17.5950, Destination = "Jižní Svahy", DelayMinutes = 5 }
};
foreach (var v in initialVehicles) transitVehicles.TryAdd(v.Id, v);

app.MapGet("/api/city/all", () => new {
    parking = parkingLots.Values,
    traffic = trafficEvents.Values,
    transit = transitVehicles.Values,
    ev = chargingStations.Values,
    stops = busStops.Values,
    landmarks = landmarks.Values,
    alerts = alerts.Items.OrderByDescending(a => a.CreatedAt).Take(3)
});

app.MapPost("/api/parking/update", ([FromBody] ParkingUpdate update) => {
    if (parkingLots.TryGetValue(update.ParkingLotId, out var lot)) {
        lot.FreeSpaces = update.FreeSpaces;
        lot.LastUpdated = DateTime.UtcNow;
        return Results.Ok(lot);
    }
    return Results.NotFound();
});

app.MapPost("/api/stops/update", ([FromBody] BusStop update) => {
    if (busStops.TryGetValue(update.Id, out var stop)) {
        stop.NextDepartures = update.NextDepartures;
        return Results.Ok(stop);
    }
    return Results.NotFound();
});

app.MapPost("/api/traffic/update", ([FromBody] TrafficEvent trafficEvent) => {
    trafficEvent.Id = Guid.NewGuid().ToString();
    trafficEvent.CreatedAt = DateTime.UtcNow;
    trafficEvents.TryAdd(trafficEvent.Id, trafficEvent);
    foreach (var ev in trafficEvents.Values.Where(e => e.CreatedAt < DateTime.UtcNow.AddMinutes(-10)).ToList())
        trafficEvents.TryRemove(ev.Id, out _);
    return Results.Ok(trafficEvent);
});

app.MapPost("/api/transit/update", ([FromBody] TransitVehicle vehicle) => {
    transitVehicles.AddOrUpdate(vehicle.Id, vehicle, (id, old) => vehicle);
    return Results.Ok(vehicle);
});

app.MapPost("/api/ev/update", ([FromBody] ChargingStation ev) => {
    if (chargingStations.TryGetValue(ev.Id, out var existing)) {
        existing.OccupiedSpots = ev.OccupiedSpots;
        return Results.Ok(existing);
    }
    return Results.NotFound();
});

app.MapPost("/api/alerts", ([FromBody] EmergencyAlert alert) => {
    alert.Id = Guid.NewGuid().ToString();
    alert.CreatedAt = DateTime.UtcNow;
    alerts.Add(alert);
    if (alerts.Count > 10) alerts.Items.RemoveAt(0);
    return Results.Ok(alert);
});

app.Run();

public record ParkingUpdate(string ParkingLotId, int FreeSpaces);
public class ConcurrentList<T> {
    public List<T> Items { get; } = new List<T>();
    private readonly object _lock = new object();
    public void Add(T item) { lock(_lock) Items.Add(item); }
    public int Count { get { lock(_lock) return Items.Count; } }
}

public class DataSimulationService : BackgroundService
{
    private readonly ConcurrentDictionary<string, ParkingLot> _parkingLots;
    private readonly ConcurrentDictionary<string, ChargingStation> _chargingStations;
    private readonly ConcurrentDictionary<string, TransitVehicle> _transitVehicles;
    private readonly ConcurrentDictionary<string, TrafficEvent> _trafficEvents;
    private readonly ConcurrentList<EmergencyAlert> _alerts;
    private readonly Random _random = new Random();

    public DataSimulationService(
        ConcurrentDictionary<string, ParkingLot> parkingLots,
        ConcurrentDictionary<string, ChargingStation> chargingStations,
        ConcurrentDictionary<string, TransitVehicle> transitVehicles,
        ConcurrentDictionary<string, TrafficEvent> trafficEvents,
        ConcurrentList<EmergencyAlert> alerts)
    {
        _parkingLots = parkingLots;
        _chargingStations = chargingStations;
        _transitVehicles = transitVehicles;
        _trafficEvents = trafficEvents;
        _alerts = alerts;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            // Simulate Parking Updates
            foreach (var lot in _parkingLots.Values)
            {
                var change = _random.Next(-2, 3); // -2 to 2
                lot.FreeSpaces = Math.Clamp(lot.FreeSpaces + change, 0, lot.TotalCapacity);
                lot.LastUpdated = DateTime.UtcNow;
            }

            // Simulate EV Charging Station Updates
            foreach (var station in _chargingStations.Values)
            {
                if (_random.NextDouble() > 0.7) // 30% chance to change
                {
                    var change = _random.Next(-1, 2);
                    station.OccupiedSpots = Math.Clamp(station.OccupiedSpots + change, 0, station.TotalSpots);
                }
            }

            // Simulate Transit Vehicle Movement (very basic)
            foreach (var vehicle in _transitVehicles.Values)
            {
                vehicle.Latitude += (_random.NextDouble() - 0.5) * 0.0005;
                vehicle.Longitude += (_random.NextDouble() - 0.5) * 0.0005;
                if (_random.NextDouble() > 0.9)
                {
                    vehicle.DelayMinutes = Math.Clamp(vehicle.DelayMinutes + _random.Next(-1, 2), 0, 15);
                }
            }

            // Simulate Random Traffic Events
            if (_random.NextDouble() > 0.9) // 10% chance each 5s to add an event
            {
                var eventId = Guid.NewGuid().ToString();
                var types = Enum.GetValues<TrafficEventType>();
                var type = types[_random.Next(types.Length)];
                var descriptions = new[] { "Heavy traffic near center", "Police check at Malenovice", "Road work on Školní", "Minor accident" };
                
                var trafficEvent = new TrafficEvent
                {
                    Id = eventId,
                    Type = type,
                    Latitude = 49.22 + (_random.NextDouble() - 0.5) * 0.05,
                    Longitude = 17.66 + (_random.NextDouble() - 0.5) * 0.05,
                    Description = descriptions[_random.Next(descriptions.Length)],
                    Severity = _random.Next(1, 4),
                    CreatedAt = DateTime.UtcNow
                };
                _trafficEvents.TryAdd(eventId, trafficEvent);

                // Cleanup old events (older than 10 mins)
                foreach (var oldEvent in _trafficEvents.Values.Where(e => e.CreatedAt < DateTime.UtcNow.AddMinutes(-10)).ToList())
                    _trafficEvents.TryRemove(oldEvent.Id, out _);
            }

            // Simulate Random Emergency Alerts
            if (_random.NextDouble() > 0.95) // 5% chance each 5s
            {
                var severities = new[] { "Info", "Warning", "Critical" };
                var messages = new[] { "High pollution level detected", "Strong winds expected", "Water main break in Malenovice", "Public transport delay alert" };
                
                var alert = new EmergencyAlert
                {
                    Id = Guid.NewGuid().ToString(),
                    Severity = severities[_random.Next(severities.Length)],
                    Message = messages[_random.Next(messages.Length)],
                    CreatedAt = DateTime.UtcNow
                };
                _alerts.Add(alert);
                
                // Keep only last 10
                lock(_alerts) {
                    while (_alerts.Count > 10) _alerts.Items.RemoveAt(0);
                }
            }

            await Task.Delay(5000, stoppingToken); // Update every 5 seconds
        }
    }
}
