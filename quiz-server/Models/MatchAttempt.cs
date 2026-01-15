namespace QuizServer.Models;

/// <summary>
/// Represents a match attempt (player's guess)
/// </summary>
public class MatchAttempt
{
    public required string AnswerId { get; set; }
    public required string GuessedPlayerId { get; set; }
    public required string ActualPlayerId { get; set; }
    public bool IsCorrect { get; set; }
}
