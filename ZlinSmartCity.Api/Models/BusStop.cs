namespace ZlinSmartCity.Api.Models;

public class BusStop
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public List<Departure> NextDepartures { get; set; } = new();
}

public class Departure
{
    public string Line { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public int MinutesToArrival { get; set; }
}
