namespace ZlinSmartCity.Api.Models;

public class ParkingLot
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int TotalCapacity { get; set; }
    public int FreeSpaces { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public DateTime LastUpdated { get; set; }
}
