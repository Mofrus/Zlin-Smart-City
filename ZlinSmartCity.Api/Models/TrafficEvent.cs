namespace ZlinSmartCity.Api.Models;

public enum TrafficEventType
{
    Jam,
    Police,
    Construction,
    Accident
}

public class TrafficEvent
{
    public string Id { get; set; } = string.Empty;
    public TrafficEventType Type { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public List<double[]> Path { get; set; } = new(); // List of [lat, lng] pairs for the road path
    public string Description { get; set; } = string.Empty;
    public int Severity { get; set; }
    public DateTime CreatedAt { get; set; }
}
