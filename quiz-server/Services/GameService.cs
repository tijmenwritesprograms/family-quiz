using System.Collections.Concurrent;
using QuizServer.Models;

namespace QuizServer.Services;

/// <summary>
/// In-memory game management service
/// </summary>
public class GameService : IGameService
{
    private readonly ConcurrentDictionary<string, GameSession> _games = new();
    private readonly ILogger<GameService> _logger;

    public GameService(ILogger<GameService> logger)
    {
        _logger = logger;
    }

    public GameSession? GetGame(string gameCode)
    {
        _games.TryGetValue(gameCode, out var game);
        return game;
    }

    public Player? GetPlayer(string gameCode, string playerId)
    {
        var game = GetGame(gameCode);
        return game?.Players.FirstOrDefault(p => p.Id == playerId);
    }

    public GameSession CreateGame(string hostPlayerName)
    {
        var gameCode = GenerateGameCode();
        var hostPlayer = new Player
        {
            Id = Guid.NewGuid().ToString(),
            Name = hostPlayerName,
            IsHost = true
        };

        var game = new GameSession
        {
            GameCode = gameCode,
            Players = new List<Player> { hostPlayer },
            Questions = GenerateDefaultQuestions()
        };

        _games[gameCode] = game;
        _logger.LogInformation($"Game created: {gameCode} by {hostPlayerName}");

        return game;
    }

    public GameSession JoinGame(string gameCode, string playerName)
    {
        var game = GetGame(gameCode);
        if (game == null)
        {
            throw new InvalidOperationException($"Game {gameCode} not found");
        }

        if (game.CurrentPhase != GamePhase.Lobby)
        {
            throw new InvalidOperationException("Cannot join game that has already started");
        }

        var player = new Player
        {
            Id = Guid.NewGuid().ToString(),
            Name = playerName,
            IsHost = false
        };

        game.Players.Add(player);
        _logger.LogInformation($"Player {playerName} joined game {gameCode}");

        return game;
    }

    public void AddAnswers(string gameCode, string playerId, List<Answer> answers)
    {
        var game = GetGame(gameCode);
        if (game == null)
        {
            throw new InvalidOperationException($"Game {gameCode} not found");
        }

        // Remove existing answers from this player for these questions
        game.Answers.RemoveAll(a => a.PlayerId == playerId && 
            answers.Any(newA => newA.QuestionId == a.QuestionId));

        game.Answers.AddRange(answers);
        _logger.LogInformation($"Added {answers.Count} answers for player {playerId} in game {gameCode}");
    }

    public List<Answer> GetAnswersForQuestion(string gameCode, string questionId)
    {
        var game = GetGame(gameCode);
        if (game == null)
        {
            return new List<Answer>();
        }

        return game.Answers.Where(a => a.QuestionId == questionId).ToList();
    }

    public void UpdateGamePhase(string gameCode, GamePhase phase)
    {
        var game = GetGame(gameCode);
        if (game != null)
        {
            game.CurrentPhase = phase;
            _logger.LogInformation($"Game {gameCode} phase updated to {phase}");
        }
    }

    private string GenerateGameCode()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed confusing chars
        var random = new Random();
        var code = new string(Enumerable.Repeat(chars, 6)
            .Select(s => s[random.Next(s.Length)]).ToArray());

        // Ensure uniqueness
        if (_games.ContainsKey(code))
        {
            return GenerateGameCode();
        }

        return code;
    }

    private List<Question> GenerateDefaultQuestions()
    {
        return new List<Question>
        {
            new() { Id = "q1", Text = "What's your favorite movie?", Category = QuestionCategory.Favorite },
            new() { Id = "q2", Text = "What's your favorite food?", Category = QuestionCategory.Favorite },
            new() { Id = "q3", Text = "What's your favorite vacation spot?", Category = QuestionCategory.Favorite },
            new() { Id = "q4", Text = "What's your favorite hobby?", Category = QuestionCategory.Favorite }
        };
    }
}
