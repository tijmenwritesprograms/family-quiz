using QuizServer.Models;

namespace QuizServer.Services;

/// <summary>
/// Interface for game management service
/// </summary>
public interface IGameService
{
    GameSession? GetGame(string gameCode);
    Player? GetPlayer(string gameCode, string playerId);
    GameSession CreateGame(string hostPlayerName);
    GameSession JoinGame(string gameCode, string playerName);
    void AddAnswers(string gameCode, string playerId, List<Answer> answers);
    List<Answer> GetAnswersForQuestion(string gameCode, string questionId);
    void UpdateGamePhase(string gameCode, GamePhase phase);
}
