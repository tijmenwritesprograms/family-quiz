namespace QuizServer.Models;

/// <summary>
/// Represents a player in the game
/// </summary>
public class Player
{
    public required string Id { get; set; }
    public required string Name { get; set; }
    public string? ConnectionId { get; set; }
    public bool IsHost { get; set; }
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
}
