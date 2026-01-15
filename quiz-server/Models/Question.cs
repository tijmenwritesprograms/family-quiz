namespace QuizServer.Models;

/// <summary>
/// Represents a question in the quiz
/// </summary>
public class Question
{
    public required string Id { get; set; }
    public required string Text { get; set; }
    public QuestionCategory Category { get; set; } = QuestionCategory.Favorite;
}

public enum QuestionCategory
{
    Favorite,
    Preference,
    Other
}
