# Quiz Match - System Design Document

**Version:** 1.0  
**Date:** January 2026  
**Status:** In Development

---

## 1. Executive Summary

Quiz Match is a multiplayer web-based quiz application where players answer personal "favorite" questions about themselves, then compete to match other players' answers to the correct person. The application consists of a Vue 3 frontend and an ASP.NET Core backend, leveraging both REST APIs for asynchronous operations and SignalR for real-time interactions.

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────┐
│   Vue 3 Client  │
│   (Frontend)    │
│                 │
│  - Home Screen  │
│  - Game Lobby   │
│  - Answer Phase │
│  - Match Phase  │
│  - Results      │
└────────┬────────┘
         │
         │ HTTP/REST + WebSocket/SignalR
         │
┌────────┴────────┐
│  ASP.NET Core   │
│    Backend      │
│                 │
│  - Minimal APIs │
│  - SignalR Hub  │
│  - Game Service │
└────────┬────────┘
         │
┌────────┴────────┐
│   Data Store    │
│  (In-Memory or  │
│   Persistent)   │
└─────────────────┘
```

### 2.2 Technology Stack

**Frontend:**
- Vue 3 with Composition API
- TypeScript
- Vite (build tool)
- SignalR Client Library

**Backend:**
- ASP.NET Core (Minimal APIs)
- SignalR
- C# with .NET 8+

**Data Storage:**
- Phase 1: In-memory (ConcurrentDictionary)
- Phase 2: Persistent storage (SQL Server/PostgreSQL or Redis)

---

## 3. Game Flow

### 3.1 Game Phases

**Phase 1: Home**
- Players can create a new game or join an existing game via game code

**Phase 2: Create Game Screen (Host Only)**
- Host selects and adds questions to the game
- Host can customize question selection
- Upon completion, game code is generated

**Phase 3: Answering**
- Players answer questions independently as soon as they join
- No waiting for all players - answering begins immediately
- Asynchronous operation (no real-time requirements)
- Players can join at any time and start answering
- Progress tracking per player

**Phase 4: Matching**
- Players match answers to other players
- Real-time scoring and progress updates
- Simultaneous participation

**Phase 5: Results**
- Final score calculation
- Leaderboard display
- Option to play again

### 3.2 User Journeys

#### 3.2.1 Create Game Journey

```
Home Screen → Click "Create Game" 
    → Create Game Screen (select questions)
    → Game Code Generated 
    → Immediately Start Answering Questions
    → (Continue to Match Answers → View Results)
```

**Detailed Flow:**
1. **Home Screen**: User clicks "Create Game" button
2. **Create Game Screen**: 
   - User sees available questions
   - User selects/adds questions to the game
   - User can customize question order or settings
   - User clicks "Create Game" to finalize
3. **Game Code Display**:
   - System generates unique 6-character game code
   - Code is displayed to user for sharing
4. **Immediate Answering**:
   - User is automatically transitioned to answering phase
   - No "Start Game" action required
   - User begins answering selected questions
5. **Real-Time Updates**:
   - Other players can join using the game code
   - Host sees players joining in real-time while answering
   - All players answer independently at their own pace

#### 3.2.2 Join Game Journey

```
Home Screen → Enter Game Code → Click "Join Game"
    → Immediately Start Answering Questions
    → (Continue to Match Answers → View Results)
```

**Detailed Flow:**
1. **Home Screen**: User enters game code and clicks "Join Game"
2. **Validation**: System verifies game exists and is in "created" state
3. **Immediate Answering**:
   - User is immediately shown the questions
   - No lobby waiting period
   - User begins answering at their own pace
4. **Real-Time Presence**:
   - Other players see new player has joined
   - All players continue answering independently

**Note:** The lobby concept is effectively removed - players transition directly from joining to answering. The "waiting room" functionality is replaced with an active answering phase where players can see who else is in the game.

---

## 4. Data Models

### 4.1 Core Entities

**Player**
- Unique identifier
- Display name
- Connection state
- Role (host/participant)
- Answer progress tracking

**Game Session**
- Game code (6-character identifier)
- Current phase (created, answering, matching, completed)
- Host player reference
- List of players
- List of selected questions
- Configuration settings
- Created timestamp

**Question**
- Unique identifier
- Question text
- Category (favorite/preference/other)
- Order in game
- Available for selection

**Answer**
- Question reference
- Player reference
- Answer text
- Timestamp
- Submission status

**Match Attempt**
- Answer reference
- Guessing player reference
- Guessed player reference
- Actual player reference
- Correctness flag

---

## 5. Communication Patterns

### 5.1 REST API (Asynchronous Operations)

**Purpose:** State-changing operations and data retrieval where real-time updates are not critical.

**Use Cases:**
- Game creation with question selection
- Player joining (immediate access to questions)
- Question retrieval for create game screen
- Answer submission
- Game state queries
- Player progress tracking

**Characteristics:**
- Standard HTTP methods (GET, POST, PUT, DELETE)
- Request/response pattern
- Stateless
- Cacheable
- HTTP status codes for error handling

### 5.2 SignalR (Real-Time Operations)

**Purpose:** Bidirectional real-time communication for player presence updates, game state changes, and interactive matching phase.

**Use Cases:**
- Player join/leave notifications (during answering phase)
- Real-time player list updates
- Answer progress broadcasting
- Transition to matching phase notification
- Real-time match submissions
- Score updates

**Characteristics:**
- Persistent connection
- Server push capability
- Group-based messaging (per game)
- Connection lifecycle management

---

## 6. API Design

### 6.1 REST Endpoints

**Game Management:**
- `POST /api/games` - Create game with selected questions (returns game code)
- `POST /api/games/{gameCode}/join` - Join game (immediate access to questions)
- `GET /api/games/{gameCode}` - Get game details and player list
- `GET /api/games/{gameCode}/status` - Get game status
- `PATCH /api/games/{gameCode}/phase` - Transition game phase (future use)

**Question Management:**
- `GET /api/questions` - Get available questions for selection
- `GET /api/games/{gameCode}/questions` - Get questions for a specific game
- `POST /api/questions` - Submit custom questions (future)

**Answer Management:**
- `POST /api/games/{gameCode}/answers` - Submit player answers
- `GET /api/games/{gameCode}/answers` - Get all answers for matching phase
- `GET /api/games/{gameCode}/players/{playerId}/progress` - Get answer progress

**Game Control:**
- `DELETE /api/games/{gameCode}` - End game (host only)
- `POST /api/games/{gameCode}/restart` - Restart game (future)

### 6.2 SignalR Hub Methods

**Player Presence:**
- `JoinGame(gameCode)` - Join game SignalR group
- `LeaveGame(gameCode)` - Leave game SignalR group
- `PlayerJoined` - Notification when new player joins
- `PlayerLeft` - Notification when player leaves
- `UpdatePlayerList` - Broadcast current player list

**Game Progress:**
- `AnswerSubmitted` - Notification when player submits answer
- `PlayerProgress(playerId, progress)` - Broadcast player answer progress
- `TransitionToMatchPhase` - Notification to move all players to matching
- `RequestGameStateSync` - Request current game state

**Matching Phase:**
- `SubmitMatchAttempt` - Submit match guess
- `BroadcastScore` - Update scores in real-time
- `MatchPhaseComplete` - All players finished matching

**Lifecycle:**
- `OnConnectedAsync` - Connection established
- `OnDisconnectedAsync` - Connection lost (cleanup)
- Reconnection handling with state preservation

---

## 7. Frontend Architecture

### 7.1 Component Structure

**Core Components:**
- `HomeScreen` - Game creation and joining entry point
- `CreateGameScreen` - Question selection and game configuration (new)
- `QuestionFlow` - Guided question answering with navigation
- `QuestionAnswer` - Individual question display and input
- `QuestionMatch` - Matching interface with answer selection
- `PlayerProgress` - Display of player answering progress (new)
- Results display components

**Component Communication:**
- Props for parent-to-child data flow
- Events for child-to-parent communication
- Reactive state management for local component state
- SignalR event handling for real-time updates

### 7.2 State Management

**Application State:**
- Current game phase (home, create, answering, matching, results)
- Player information (ID, name, role)
- Game code and session details
- Selected questions (for create game screen)
- Question and answer data
- Player progress tracking
- Match results

**Connection State:**
- SignalR connection status
- Reconnection handling
- Network error management
- Player presence tracking

---

## 8. Backend Architecture

### 8.1 Service Layer

**Game Service:**
- Game lifecycle management (create with questions, join, complete)
- Player management and presence tracking
- Question selection and distribution
- Answer validation and storage
- Match scoring logic
- Progress tracking for all players
- Phase transition logic

**State Management:**
- Game session storage and retrieval
- Player tracking and connection mapping
- Answer progress tracking
- Data consistency and validation

### 8.2 Hub Architecture

**Game Hub:**
- Manages real-time connections
- Group management (per game)
- Broadcasts game events
- Handles connection lifecycle

---

## 9. Security Considerations

### 9.1 Authentication & Authorization

**Player Identity:**
- Token-based player identification
- Session validation
- Game access control
- Player reconnection with stored session

**Host Privileges:**
- Verify host status before privileged operations
- Question selection rights (during game creation)
- Game deletion permissions
- Configuration changes (future)

### 9.2 Data Validation

**Input Validation:**
- Game code format validation
- Player name sanitization
- Answer length restrictions
- Question selection limits
- Rate limiting for API calls

**Game State Validation:**
- Phase transition rules (created → answering → matching → completed)
- Player count limits
- Join validation (game must be in "created" or "answering" state)
- Timeout handling

---

## 10. Scalability & Performance

### 10.1 Connection Management

**SignalR Scaling:**
- Connection pooling
- Group optimization
- Backplane for multi-server deployments

**State Distribution:**
- Centralized session storage
- Cache strategy for frequently accessed data

### 10.2 Resource Management

**Game Cleanup:**
- Automatic removal of inactive games
- Connection timeout handling
- Memory management for in-memory storage

---

## 11. Error Handling & Recovery

### 11.1 Connection Resilience

**Client-Side:**
- Automatic reconnection
- State resynchronization
- User feedback during disruptions

**Server-Side:**
- Graceful disconnection handling
- Player status tracking
- Game state preservation

### 11.2 Error Communication

**REST APIs:**
- Standard HTTP status codes
- Structured error responses
- Client-friendly error messages

**SignalR:**
- Return result objects with success/failure
- Error event broadcasting
- Fallback mechanisms

---

## 12. Future Enhancements

### 12.1 Planned Features

**Game Customization:**
- Custom question creation
- Question categories
- Configurable game rules
- Time limits

**Social Features:**
- Player profiles
- Game history
- Leaderboards
- Friend system

**Advanced Gameplay:**
- Multiple game modes
- Team play
- Bonus rounds
- Achievements

### 12.2 Technical Improvements

**Infrastructure:**
- Persistent database integration
- Redis for session management
- CDN for static assets
- Monitoring and analytics

**User Experience:**
- Mobile-responsive design
- Progressive Web App (PWA)
- Offline capabilities
- Accessibility improvements

---

## 13. Development Phases

### Phase 1: Core Foundation (Current)
- ✅ Vue 3 frontend structure
- ✅ Basic game flow components
- ✅ Home screen UI
- ✅ Question answering flow
- 🔄 Create game screen with question selection
- 🔄 ASP.NET Core backend setup

### Phase 2: Connectivity
- REST API implementation for game creation with questions
- REST API for immediate join and answer access
- SignalR hub implementation for player presence
- Client-server integration
- Basic error handling and reconnection

### Phase 3: Real-Time Features
- Player presence synchronization during answering
- Real-time progress broadcasting
- Real-time matching phase
- Score broadcasting
- Connection resilience

### Phase 4: Production Readiness
- Persistent storage
- Security hardening
- Performance optimization
- Testing and deployment

---

## 14. Technical Constraints & Assumptions

### 14.1 Constraints

**Game Limits:**
- Maximum 8 players per game
- Game session timeout: 30 minutes
- Maximum 20 questions per game

**Performance:**
- Sub-second response times for REST APIs
- Real-time updates within 100ms
- Support for 100 concurrent games

### 14.2 Assumptions

**User Behavior:**
- Players have stable internet connections
- Players complete games in reasonable timeframes
- Minimal malicious activity

**Environment:**
- Modern web browsers (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- WebSocket support available

---

## 15. Success Metrics

### 15.1 Technical Metrics

- API response time < 200ms
- SignalR message delivery < 100ms
- Connection success rate > 99%
- Game completion rate > 80%

### 15.2 User Experience Metrics

- Time to create game (including question selection) < 60 seconds
- Time to join game and start answering < 15 seconds
- Average game duration: 10-15 minutes
- Player retention through full game > 90%
- Reconnection success rate > 95%
- Immediate transition to answering phase (no waiting)

---

## Appendix

### A. Glossary

- **Game Code:** 6-character unique identifier for a game session
- **Host:** Player who created the game and selected the questions
- **Create Game Screen:** Interface where host selects questions before game code is generated
- **Answering Phase:** Game phase where players answer questions independently (begins immediately after joining)
- **Match Phase:** Game phase where players guess answer-to-player mappings
- **Game Session:** Complete game instance from creation to completion
- **Player Presence:** Real-time tracking of players currently in the game
- **Progress Tracking:** Monitoring how many questions each player has answered

### B. References

- Vue 3 Documentation: https://vuejs.org
- ASP.NET Core SignalR: https://learn.microsoft.com/signalr
- TypeScript Documentation: https://www.typescriptlang.org

---

**Document History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 2026 | Development Team | Initial design document |
| 1.1 | January 2026 | Development Team | Updated user journeys: Added create game screen with question selection, removed lobby waiting phase, immediate answering upon joining |

---

**Approval:**

This document serves as the technical blueprint for the Quiz Match application and should be reviewed and refined as the project evolves.
