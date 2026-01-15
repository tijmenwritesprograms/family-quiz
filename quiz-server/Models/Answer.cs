namespace QuizServer.Models;

/// <summary>
/// Represents an answer given by a player to a question
/// </summary>
public class Answer
{
    public required string QuestionId { get; set; }
    public required string PlayerId { get; set; }
    public required string PlayerName { get; set; }
    public required string Text { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
