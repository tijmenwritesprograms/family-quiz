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

**Phase 1: Home & Lobby**
- Players create or join games via game codes
- Host controls game start
- Real-time player list updates

**Phase 2: Answering**
- Each player answers questions independently
- Asynchronous operation (no real-time requirements)
- Progress tracking per player

**Phase 3: Matching**
- Players match answers to other players
- Real-time scoring and progress updates
- Simultaneous participation

**Phase 4: Results**
- Final score calculation
- Leaderboard display
- Option to play again

### 3.2 User Journey

```
Start → Home Screen → Create/Join → Lobby (wait) → Answer Questions
    → Match Answers → View Results → Home Screen
```

---

## 4. Data Models

### 4.1 Core Entities

**Player**
- Unique identifier
- Display name
- Connection state
- Role (host/participant)

**Game Session**
- Game code (6-character identifier)
- Current phase
- Host player reference
- List of players
- List of questions
- Configuration settings

**Question**
- Unique identifier
- Question text
- Category (favorite/preference/other)
- Order in game

**Answer**
- Question reference
- Player reference
- Answer text
- Timestamp

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
- Game creation and configuration
- Player joining
- Question submission
- Answer submission
- Game state queries

**Characteristics:**
- Standard HTTP methods (GET, POST, PUT, DELETE)
- Request/response pattern
- Stateless
- Cacheable
- HTTP status codes for error handling

### 5.2 SignalR (Real-Time Operations)

**Purpose:** Bidirectional real-time communication for lobby updates, game state changes, and interactive matching phase.

**Use Cases:**
- Lobby updates (player joins/leaves)
- Game start notification
- Real-time match submissions
- Progress broadcasting
- Score updates
- Host actions

**Characteristics:**
- Persistent connection
- Server push capability
- Group-based messaging (per game)
- Connection lifecycle management

---

## 6. API Design

### 6.1 REST Endpoints

**Game Management:**
- Create game
- Join game with code
- Get game details
- Get game status
- Update game settings (host only)

**Question Management:**
- Get questions for game
- Submit custom questions (future)

**Answer Management:**
- Submit player answers
- Get answers for matching phase

**Game Control:**
- Start game (host only)
- End game
- Restart game

### 6.2 SignalR Hub Methods

**Lobby Operations:**
- Join game lobby
- Leave game lobby
- Start game signal
- Player joined notification
- Player left notification

**Game Operations:**
- Submit match attempt
- Broadcast player progress
- Request game state sync
- Answer submission notification

**Lifecycle:**
- Connection established
- Connection lost (cleanup)
- Reconnection handling

---

## 7. Frontend Architecture

### 7.1 Component Structure

**Core Components:**
- HomeScreen: Game creation and joining
- QuestionFlow: Guided question answering with navigation
- QuestionAnswer: Individual question display and input
- QuestionMatch: Matching interface with answer selection
- Results display components

**Component Communication:**
- Props for parent-to-child data flow
- Events for child-to-parent communication
- Reactive state management for local component state

### 7.2 State Management

**Application State:**
- Current game phase
- Player information
- Game code and session details
- Question and answer data
- Match results

**Connection State:**
- SignalR connection status
- Reconnection handling
- Network error management

---

## 8. Backend Architecture

### 8.1 Service Layer

**Game Service:**
- Game lifecycle management
- Player management
- Question distribution
- Answer validation and storage
- Match scoring logic

**State Management:**
- Game session storage and retrieval
- Player tracking
- Connection mapping
- Data consistency

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

**Host Privileges:**
- Verify host status before privileged operations
- Game start/stop permissions
- Configuration changes

### 9.2 Data Validation

**Input Validation:**
- Game code format validation
- Player name sanitization
- Answer length restrictions
- Rate limiting

**Game State Validation:**
- Phase transition rules
- Player count limits
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
- ✅ Home screen and lobby UI
- 🔄 ASP.NET Core backend setup

### Phase 2: Connectivity
- REST API implementation
- SignalR hub implementation
- Client-server integration
- Basic error handling

### Phase 3: Real-Time Features
- Lobby synchronization
- Real-time matching
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

- Time to create/join game < 30 seconds
- Average game duration: 10-15 minutes
- Player retention through full game > 90%
- Reconnection success rate > 95%

---

## Appendix

### A. Glossary

- **Game Code:** 6-character unique identifier for a game session
- **Host:** Player who created the game and controls game flow
- **Match Phase:** Game phase where players guess answer-to-player mappings
- **Game Session:** Complete game instance from creation to completion

### B. References

- Vue 3 Documentation: https://vuejs.org
- ASP.NET Core SignalR: https://learn.microsoft.com/signalr
- TypeScript Documentation: https://www.typescriptlang.org

---

**Document History:**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | January 2026 | Development Team | Initial design document |

---

**Approval:**

This document serves as the technical blueprint for the Quiz Match application and should be reviewed and refined as the project evolves.
