namespace QuizServer.Models;

/// <summary>
/// Represents a game session
/// </summary>
public class GameSession
{
    public required string GameCode { get; set; }
    public GamePhase CurrentPhase { get; set; } = GamePhase.Lobby;
    public List<Player> Players { get; set; } = new();
    public List<Question> Questions { get; set; } = new();
    public List<Answer> Answers { get; set; } = new();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? StartedAt { get; set; }
}

public enum GamePhase
{
    Lobby,
    Answering,
    Matching,
    Results
}
