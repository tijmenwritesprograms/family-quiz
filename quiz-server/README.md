# Quiz Server

ASP.NET Core backend for the Quiz Match application.

## Project Structure

`
QuizServer/
 Hubs/                  # SignalR hubs for real-time communication
    GameHub.cs        # Main game hub
 Models/               # Data models
    Answer.cs
    GameSession.cs
    MatchAttempt.cs
    Player.cs
    Question.cs
 Services/            # Business logic
    IGameService.cs
    GameService.cs   # In-memory game management
 Data/                # Data storage (future)
 Program.cs           # Application entry point & API endpoints

## Technology Stack

- .NET 10
- ASP.NET Core Minimal APIs
- SignalR for real-time communication
- In-memory storage (ConcurrentDictionary)

## API Endpoints

### REST Endpoints (Async Operations)

**POST /api/games**
- Create a new game
- Body: { "playerName": "string" }
- Returns: { "gameCode": "string", "player": {...} }

**POST /api/games/{gameCode}/join**
- Join an existing game
- Body: { "playerName": "string" }
- Returns: { "gameCode": "string", "player": {...} }

**GET /api/games/{gameCode}**
- Get game details
- Returns: Full game session object

**POST /api/games/{gameCode}/answers**
- Submit player answers
- Body: Array of Answer objects
- Query: playerId

**GET /api/games/{gameCode}/questions/{questionId}/answers**
- Get all answers for a specific question
- Returns: Array of Answer objects

### SignalR Hub (/hubs/game)

**Methods:**
- JoinGameLobby(gameCode, playerId) - Join real-time lobby
- LeaveGameLobby(gameCode, playerId) - Leave lobby
- StartGame(gameCode, playerId) - Start game (host only)
- BroadcastProgress(gameCode, playerId, completed, total) - Share progress

**Events (Client receives):**
- PlayerJoined - Another player joined
- PlayerLeft - Player disconnected
- GameStarted - Game beginning
- PlayerProgress - Real-time progress updates

## Running the Server

### Development
`ash
cd quiz-server
dotnet run
`

Server runs on: https://localhost:5001 (or http://localhost:5000)

### Build
`ash
dotnet build
`

### Test API
`ash
# Create a game
curl -X POST http://localhost:5000/api/games -H "Content-Type: application/json" -d "{\"playerName\":\"Alex\"}"

# Join a game
curl -X POST http://localhost:5000/api/games/ABC123/join -H "Content-Type: application/json" -d "{\"playerName\":\"Jordan\"}"
`

## CORS Configuration

Configured to allow requests from http://localhost:5173 (Vite dev server).

Update in Program.cs for production deployment.

## Default Questions

The server generates 4 default questions:
1. What's your favorite movie?
2. What's your favorite food?
3. What's your favorite vacation spot?
4. What's your favorite hobby?

## Future Enhancements

- [ ] Persistent database (SQL Server/PostgreSQL)
- [ ] Redis for session management
- [ ] Authentication/Authorization
- [ ] Rate limiting
- [ ] Game cleanup/expiration
- [ ] Custom question creation
- [ ] Player statistics

## Development Notes

- Uses in-memory storage - games are lost on restart
- No authentication - suitable for development only
- Single-server deployment (no backplane configured)
