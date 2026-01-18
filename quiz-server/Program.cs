using Microsoft.AspNetCore.Mvc;
using QuizServer.Hubs;
using QuizServer.Models;
using QuizServer.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddSignalR();
builder.Services.AddSingleton<IGameService, GameService>();

// Add CORS for Vue frontend
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.SetIsOriginAllowed(origin =>
              {
                  // Allow any localhost origin (for development)
                  var uri = new Uri(origin);
                  return uri.Host == "localhost" || uri.Host == "127.0.0.1";
              })
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Required for SignalR
    });
});

builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();



// REST API Endpoints

// Create a new game
app.MapPost("/api/games", (IGameService gameService, CreateGameRequest request) =>
{
    var game = gameService.CreateGame(request.PlayerName);
    return Results.Ok(new
    {
        gameCode = game.GameCode,
        player = game.Players.First()
    });
});

// Join an existing game
app.MapPost("/api/games/{gameCode}/join", (string gameCode, JoinGameRequest request, IGameService gameService) =>
{
    try
    {
        var game = gameService.JoinGame(gameCode, request.PlayerName);
        var player = game.Players.Last();
        return Results.Ok(new
        {
            gameCode = game.GameCode,
            player = player
        });
    }
    catch (InvalidOperationException ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
});

// Reconnect to an existing game
app.MapPost("/api/games/{gameCode}/reconnect", (string gameCode, ReconnectRequest request, IGameService gameService) =>
{
    try
    {
        var game = gameService.GetGame(gameCode);
        if (game == null)
        {
            return Results.NotFound(new { error = "Game not found" });
        }

        var player = game.Players.FirstOrDefault(p => p.Id == request.PlayerId);
        if (player == null)
        {
            return Results.NotFound(new { error = "Player not found in this game" });
        }

        return Results.Ok(new
        {
            gameCode = game.GameCode,
            player = player,
            gameState = "lobby" // Can be extended to return actual game state
        });
    }
    catch (InvalidOperationException ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
});

// Get game details
app.MapGet("/api/games/{gameCode}", (string gameCode, IGameService gameService) =>
{
    var game = gameService.GetGame(gameCode);
    if (game == null)
    {
        return Results.NotFound();
    }
    return Results.Ok(game);
});

// Submit answers
app.MapPost("/api/games/{gameCode}/answers", (string gameCode, string playerId, List<Answer> answers, IGameService gameService) =>
{
    try
    {
        gameService.AddAnswers(gameCode, playerId, answers);
        return Results.Ok();
    }
    catch (InvalidOperationException ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
});

// Get answers for a question
app.MapGet("/api/games/{gameCode}/questions/{questionId}/answers", 
    (string gameCode, string questionId, IGameService gameService) =>
{
    var answers = gameService.GetAnswersForQuestion(gameCode, questionId);
    return Results.Ok(answers);
});

// SignalR Hub
app.MapHub<GameHub>("/hubs/game");

app.Run();

// Request DTOs
record CreateGameRequest(string PlayerName);
record JoinGameRequest(string PlayerName);
record ReconnectRequest(string PlayerId);