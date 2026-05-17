namespace ZlinSmartCity.Api.Models;

public class Landmark
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = "🏢";
    public string FunFact { get; set; } = string.Empty;
}
