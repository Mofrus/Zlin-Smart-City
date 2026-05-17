namespace ZlinSmartCity.Api.Models;

public class TransitVehicle
{
    public string Id { get; set; } = string.Empty;
    public string Line { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public int DelayMinutes { get; set; }
    public string Destination { get; set; } = string.Empty;
}

public class ChargingStation
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public int TotalSpots { get; set; }
    public int OccupiedSpots { get; set; }
    public string ConnectorType { get; set; } = "Type 2";
}

public class EmergencyAlert
{
    public string Id { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Severity { get; set; } = "Warning"; // Critical, Warning, Info
    public DateTime CreatedAt { get; set; }
}
