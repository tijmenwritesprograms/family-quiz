using Microsoft.AspNetCore.SignalR;
using QuizServer.Models;
using QuizServer.Services;

namespace QuizServer.Hubs;

/// <summary>
/// SignalR hub for real-time game communication
/// </summary>
public class GameHub : Hub
{
    private readonly IGameService _gameService;
    private readonly ILogger<GameHub> _logger;

    public GameHub(IGameService gameService, ILogger<GameHub> logger)
    {
        _gameService = gameService;
        _logger = logger;
    }

    /// <summary>
    /// Join a game lobby
    /// </summary>
    public async Task JoinGameLobby(string gameCode, string playerId)
    {
        try
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"game_{gameCode}");
            
            var player = _gameService.GetPlayer(gameCode, playerId);
            if (player != null)
            {
                player.ConnectionId = Context.ConnectionId;
                
                // Notify others in the game
                await Clients.OthersInGroup($"game_{gameCode}")
                    .SendAsync("PlayerJoined", player.Name);
                
                _logger.LogInformation($"Player {player.Name} joined game {gameCode}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error joining game lobby: {gameCode}");
            throw;
        }
    }

    /// <summary>
    /// Leave a game lobby
    /// </summary>
    public async Task LeaveGameLobby(string gameCode, string playerId)
    {
        try
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"game_{gameCode}");
            
            var player = _gameService.GetPlayer(gameCode, playerId);
            if (player != null)
            {
                await Clients.OthersInGroup($"game_{gameCode}")
                    .SendAsync("PlayerLeft", player.Name);
                
                _logger.LogInformation($"Player {player.Name} left game {gameCode}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error leaving game lobby: {gameCode}");
        }
    }

    /// <summary>
    /// Start the game (host only)
    /// </summary>
    public async Task StartGame(string gameCode, string playerId)
    {
        try
        {
            var game = _gameService.GetGame(gameCode);
            if (game == null)
            {
                throw new InvalidOperationException("Game not found");
            }

            var player = game.Players.FirstOrDefault(p => p.Id == playerId);
            if (player == null || !player.IsHost)
            {
                throw new UnauthorizedAccessException("Only the host can start the game");
            }

            game.CurrentPhase = GamePhase.Answering;
            game.StartedAt = DateTime.UtcNow;

            // Notify all players in the game
            await Clients.Group($"game_{gameCode}")
                .SendAsync("GameStarted");
            
            _logger.LogInformation($"Game {gameCode} started by {player.Name}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error starting game: {gameCode}");
            throw;
        }
    }

    /// <summary>
    /// Broadcast player progress during matching
    /// </summary>
    public async Task BroadcastProgress(string gameCode, string playerId, int questionsCompleted, int totalQuestions)
    {
        try
        {
            var player = _gameService.GetPlayer(gameCode, playerId);
            if (player != null)
            {
                await Clients.OthersInGroup($"game_{gameCode}")
                    .SendAsync("PlayerProgress", new
                    {
                        PlayerName = player.Name,
                        QuestionsCompleted = questionsCompleted,
                        TotalQuestions = totalQuestions
                    });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error broadcasting progress for player {playerId}");
        }
    }

    /// <summary>
    /// Handle disconnection
    /// </summary>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        try
        {
            // Find and handle the disconnected player
            // TODO: Implement cleanup logic
            _logger.LogInformation($"Connection {Context.ConnectionId} disconnected");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error handling disconnection");
        }
        
        await base.OnDisconnectedAsync(exception);
    }
}
