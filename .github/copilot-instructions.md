# Family Quiz - Copilot Instructions

## Project Overview
This is a full-stack multiplayer quiz application with a Vue 3 frontend and ASP.NET Core backend. The goal is a learning-focused development experience with clear explanations for Vue.js and SignalR concepts.

## Application Description
**Family Quiz** is a real-time multiplayer matching game where players answer personal questions and then match answers to players:

**User Journeys:**

1. **Create Game Flow:**
   - Player clicks "Create Game" on home screen
   - Navigates to Create Game Screen to select questions
   - After selecting questions, game code is generated
   - Host immediately starts answering questions (no waiting)
   - Other players can join and see host answering in real-time

2. **Join Game Flow:**
   - Player enters game code on home screen
   - Immediately starts answering questions (no lobby waiting)
   - Sees other players in the game in real-time

3. **Game Phases:**
   - **Home**: Entry point for create/join
   - **Create Game**: Question selection (host only)
   - **Answering**: All players answer independently at their own pace
   - **Matching**: Players match answers to players
   - **Results**: Final scores and leaderboard

**Key Features:**
- Real-time player presence during answering phase
- No "Start Game" button - immediate gameplay
- Progress tracking for all players
- SignalR for real-time updates
- REST API for state management
- Session persistence (localStorage) for reconnection

## Development Philosophy

### For Vue.js and SignalR (Learning Focus)
- **Explain thoroughly**: Since you're learning Vue.js and SignalR, provide detailed explanations
- **Step-by-step**: Build components and integrations incrementally with clear reasoning
- **Idiomatic patterns**: Show Vue 3 Composition API and SignalR best practices
- **Why and how**: Explain both the purpose and implementation

### For C#/.NET/Minimal APIs (Experienced)
- **Be concise**: You're already familiar with C#, .NET, and Minimal APIs
- **Show the code**: Focus on implementation without lengthy explanations
- **Highlight specifics**: Only explain SignalR-specific server patterns or unique approaches

## Vue.js Standards (Learning Focus)

### Component Development Process
When creating Vue components:
1. **Explain component purpose**: What problem does it solve?
2. **Show structure**: Walk through `<script setup>`, template, and styles
3. **Explain reactivity**: How reactive state works and why we use `ref`/`computed`
4. **Props and events**: How parent-child communication works
5. **Composables**: When and why to extract logic into composables
6. **Usage examples**: Show how to use the component

### TypeScript in Vue
- Use strict type checking
- Define interfaces for props, events, and data structures
- Leverage Vue's type utilities (`Ref`, `Computed`, `PropType`)
- Avoid `any` types; be explicit
- Use generics for reusable logic

### Composition API Patterns
- Prefer `<script setup>` syntax (more concise)
- Use `ref` for reactive primitives, `reactive` for objects
- Extract reusable logic into composables (e.g., `useGame`, `useSignalR`)
- Keep components focused on UI, logic in composables
- Use `computed` for derived state
- Lifecycle hooks: `onMounted`, `onUnmounted`, `watch`

### Code Style
- Use TypeScript interfaces for structure definitions
- Add JSDoc comments for complex functions
- Keep components single-responsibility
- Use descriptive variable and function names
- Prefer composition over large components

## SignalR Integration (Learning Focus)

### When to Use SignalR vs REST
**Use SignalR for:**
- Real-time player presence updates
- Live progress broadcasting
- Match phase submissions
- Score updates
- Phase transition notifications

**Use REST API for:**
- Game creation with question selection
- Player joining
- Answer submission
- Game state queries
- Non-real-time operations

### SignalR Client Patterns (Explain These)
When implementing SignalR in Vue:
1. **Connection management**: Creating and maintaining the connection
2. **Group membership**: Joining/leaving game rooms
3. **Event handling**: Listening to server events with `.on()`
4. **Invoking methods**: Calling server methods with `.invoke()`
5. **Reconnection**: Handling disconnects and reconnects
6. **Cleanup**: Proper disposal in `onUnmounted`

### SignalR Composable Pattern
Create a `useSignalR` composable for:
- Connection lifecycle management
- Event subscription/unsubscription
- Automatic reconnection
- Connection state tracking
- Error handling

Example structure to explain:
```typescript
export function useSignalR(gameCode: Ref<string>) {
  const connection = ref<HubConnection | null>(null)
  const isConnected = ref(false)
  
  const connect = async () => { /* explain connection setup */ }
  const disconnect = async () => { /* explain cleanup */ }
  const joinGame = async () => { /* explain group joining */ }
  
  return { connection, isConnected, connect, disconnect, joinGame }
}
```

## Project Structure

```
quiz-app/                          # Vue 3 Frontend
├── src/
│   ├── components/                # Vue components
│   │   ├── HomeScreen.vue         # Create/join entry
│   │   ├── CreateGameScreen.vue   # Question selection (NEW)
│   │   ├── LobbyScreen.vue        # Player list during answering
│   │   ├── QuestionFlow.vue       # Answer questions flow
│   │   ├── QuestionMatch.vue      # Matching phase
│   │   └── ...
│   ├── composables/               # Reusable Vue logic
│   │   ├── useGame.ts             # Game state management
│   │   ├── useSignalR.ts          # SignalR connection (FUTURE)
│   │   └── ...
│   ├── services/                  # API communication
│   │   ├── httpClient.ts          # Axios instance
│   │   ├── gameService.ts         # REST API calls
│   │   ├── clientIdentityService.ts # Session persistence
│   │   └── ...
│   ├── types/                     # TypeScript definitions
│   │   └── quiz.ts                # Shared types
│   └── App.vue                    # Root component

quiz-server/                       # ASP.NET Core Backend (Concise)
├── Program.cs                     # Minimal APIs setup
├── Hubs/
│   └── GameHub.cs                 # SignalR hub
├── Services/
│   ├── GameService.cs             # Game logic
│   └── IGameService.cs
└── Models/
    └── ...                        # Game entities
```

## Communication Architecture

### REST API Pattern (HTTP Client)
```typescript
// Explain: Centralized HTTP client with interceptors
httpClient.ts → gameService.ts → useGame.ts → Components
```

**Key Concepts to Explain:**
- Axios instance configuration
- Request/response interceptors
- Error handling patterns
- Base URL from environment variables (Aspire)

### SignalR Pattern (Real-Time)
```typescript
// Explain: Persistent connection for real-time updates
SignalR Hub → useSignalR.ts → Components
```

**Key Concepts to Explain:**
- Hub connection setup with HubConnectionBuilder
- Event subscription with `.on()` and cleanup
- Server method invocation with `.invoke()`
- Group management for game rooms
- Reconnection strategies

## Best Practices

### Vue.js Best Practices (Explain)
- **Component composition**: Break down UI into small, reusable components
- **State management**: Use composables for shared state, not Vuex/Pinia for this scale
- **Prop drilling**: Avoid by using composables for cross-component state
- **Event naming**: Use kebab-case (e.g., `@start-game`)
- **Reactive dependencies**: Watch only what you need, avoid over-watching

### SignalR Best Practices (Explain)
- **Single connection per game**: Don't create multiple connections
- **Group-based messaging**: Use groups for game rooms, not individual connections
- **Error boundaries**: Handle connection failures gracefully
- **Cleanup**: Always dispose connections in `onUnmounted`
- **Reconnection**: Implement automatic reconnection with exponential backoff

### API Integration Best Practices (Explain for Vue parts)
- **Service layer**: Separate API calls from components
- **Composables**: Encapsulate stateful logic (game state, connection)
- **Error handling**: Centralized in HTTP client, user-friendly in components
- **Loading states**: Always show loading/error states to users
- **Type safety**: Define response types for all API calls

## Session Persistence (Explain)

**LocalStorage Pattern:**
- Store player ID, game code, and session data
- Auto-reconnect on page refresh
- Session expiry (7 days default)
- Clear on logout/leave game

**Implementation in Vue:**
```typescript
// Explain: How localStorage works in browser
// Explain: Why we store session data
// Explain: Auto-reconnection flow
```

## When Adding Features

### For Vue.js/SignalR Features:
1. **Explain the concept first**: What are we building and why?
2. **Show the pattern**: Demonstrate Vue/SignalR best practices
3. **Build incrementally**: One piece at a time with explanations
4. **Test as you go**: Verify each step works
5. **Explain gotchas**: Common mistakes and how to avoid them

### For C#/.NET Features:
1. **Show the implementation**: Provide working code
2. **Highlight SignalR specifics**: Only explain SignalR server patterns if unique
3. **Reference design doc**: Point to DESIGN.md for architecture decisions

## Reference Documents

- **DESIGN.md**: Complete system architecture and design decisions
- **Vue 3 Docs**: https://vuejs.org
- **SignalR Client Docs**: https://learn.microsoft.com/aspnet/core/signalr/javascript-client
- **TypeScript Docs**: https://www.typescriptlang.org

## Key Learning Areas

Focus explanations on:
1. ✅ **Vue 3 Composition API**: How reactive state, composables, and lifecycle work
2. ✅ **SignalR Client**: Connection management, events, groups, reconnection
3. ✅ **Vue + SignalR Integration**: How to combine real-time with reactive state
4. ✅ **Component patterns**: When to use props vs composables vs events
5. ⏭️ **C#/.NET**: Show code, minimal explanation (you're already experienced)

## Development Workflow

1. **Read DESIGN.md first**: Understand the architecture
2. **Build Vue components**: Explain Vue patterns thoroughly
3. **Add SignalR**: Explain real-time integration step-by-step
4. **Backend endpoints**: Provide C# code without lengthy explanations
5. **Test integration**: Verify Vue ↔ SignalR ↔ .NET flow works

---

**Remember**: This is a learning project for Vue.js and SignalR. Take time to explain these concepts clearly. C#/.NET can be more straightforward since that's familiar territory.
