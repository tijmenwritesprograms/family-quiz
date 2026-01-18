<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import HomeScreen from './components/HomeScreen.vue'
import LobbyScreen from './components/LobbyScreen.vue'
import QuestionFlow from './components/QuestionFlow.vue'
import QuestionMatch from './components/QuestionMatch.vue'
import type { Question, Answer, MatchAttempt } from './types/quiz'
import { samplePlayers, sampleQuestions, generateSampleAnswers } from './data/sampleData'
import { useGame } from './composables/useGame'

// Game phase tracking
type GamePhase = 'home' | 'lobby' | 'answering' | 'matching' | 'results'
const currentPhase = ref<GamePhase>('home')

// Use the game composable for API calls
const { 
  gameCode, 
  currentPlayerId,
  currentPlayerName,
  isHost, 
  isLoading,
  isReconnecting,
  error: gameError,
  players,
  createGame,
  joinGame,
  leaveGame,
  attemptReconnect,
  handleAutoReconnect,
  fetchGameDetails
} = useGame()

// Use sample data
const questions = sampleQuestions
const allAnswers = ref<Answer[]>(generateSampleAnswers())

// Current player info
const currentPlayer = ref({
  id: '',
  name: ''
})

// Track which question we're matching
const currentMatchQuestionIndex = ref(0)

// Store match results
const allMatchResults = ref<MatchAttempt[]>([])

// Store all submitted answers after completing the flow
const completedAnswers = ref<Answer[]>([])

/**
 * Handle creating a new game
 */
const handleCreateGame = async (playerName: string) => {
  try {
    const response = await createGame(playerName)
    
    // Set player info
    currentPlayer.value = {
      id: response.hostPlayerId,
      name: playerName
    }
    
    currentPhase.value = 'lobby'
    
    console.log('Game created with code:', response.gameCode)
  } catch (err) {
    // Error already handled in composable
    console.error('Failed to create game:', err)
  }
}

/**
 * Handle joining an existing game
 */
const handleJoinGame = async (payload: { gameCode: string; playerName: string }) => {
  try {
    const response = await joinGame(payload.gameCode, payload.playerName)
    
    // Set player info
    currentPlayer.value = {
      id: response.player.id,
      name: response.player.name
    }
    
    currentPhase.value = 'lobby'
    
    console.log('Joined game:', response.gameCode, 'as', response.player.name)
  } catch (err) {
    // Error already handled in composable
    console.error('Failed to join game:', err)
  }
}

/**
 * Start the game (host only)
 */
const startGame = () => {
  currentPhase.value = 'answering'
  // TODO: Notify server to start game for all players
}

/**
 * Handle leaving the current game
 */
const handleLeaveGame = () => {
  leaveGame()
  currentPhase.value = 'home'
}

/**
 * Handle automatic reconnection on app load
 */
onMounted(async () => {
  const reconnected = await handleAutoReconnect()
  if (reconnected) {
    // Successfully reconnected, navigate to lobby
    currentPhase.value = 'lobby'
    console.log('[App] Reconnected successfully, showing lobby')
  }
})

/**
 * Poll game details when in lobby to get updated player list
 */
let lobbyPollInterval: ReturnType<typeof setInterval> | null = null

watch(currentPhase, async (newPhase) => {
  // Clear any existing polling
  if (lobbyPollInterval) {
    clearInterval(lobbyPollInterval)
    lobbyPollInterval = null
  }

  // Start polling when entering lobby
  if (newPhase === 'lobby' && gameCode.value) {
    // Fetch immediately
    await fetchGameDetails()
    
    // Then poll every 2 seconds
    lobbyPollInterval = setInterval(async () => {
      await fetchGameDetails()
    }, 2000)
  }
})

// Clean up polling on unmount
onUnmounted(() => {
  if (lobbyPollInterval) {
    clearInterval(lobbyPollInterval)
  }
})

// Get current question for matching
const getCurrentMatchQuestion = () => questions[currentMatchQuestionIndex.value]

// Get answers for current question
const getCurrentQuestionAnswers = () => {
  const question = getCurrentMatchQuestion()
  return allAnswers.value.filter(a => a.questionId === question.id)
}

// Handle when the question flow is complete
const handleFlowComplete = (answers: Answer[]) => {
  completedAnswers.value = answers
  currentPhase.value = 'matching'
  console.log('All answers submitted:', answers)
}

// Handle match submission
const handleMatchSubmit = (attempts: MatchAttempt[]) => {
  allMatchResults.value.push(...attempts)
  console.log('Match results:', attempts)
  
  // Move to next question or finish
  if (currentMatchQuestionIndex.value < questions.length - 1) {
    setTimeout(() => {
      currentMatchQuestionIndex.value++
    }, 1500)
  } else {
    setTimeout(() => {
      currentPhase.value = 'results'
    }, 1500)
  }
}

// Reset to start over
const resetFlow = () => {
  completedAnswers.value = []
  currentPhase.value = 'home'
  currentMatchQuestionIndex.value = 0
  allMatchResults.value = []
  gameCode.value = ''
  isHost.value = false
  currentPlayer.value = { id: '', name: '' }
}

// Calculate total score
const calculateTotalScore = () => {
  const correct = allMatchResults.value.filter(m => m.isCorrect).length
  const total = allMatchResults.value.length
  return { correct, total }
}
</script>

<template>
  <div class="app">
    <!-- Reconnecting Overlay -->
    <div v-if="isReconnecting" class="reconnecting-overlay">
      <div class="reconnecting-message">
        <p>Reconnecting to your game...</p>
      </div>
    </div>

    <!-- Home Screen -->
    <div v-if="currentPhase === 'home' && !isReconnecting" class="home-container">
      <HomeScreen
        @create-game="handleCreateGame"
        @join-game="handleJoinGame"
      />
    </div>

    <!-- Game Lobby -->
    <LobbyScreen
      v-else-if="currentPhase === 'lobby'"
      :game-code="gameCode"
      :player-name="currentPlayer.name"
      :is-host="isHost"
      :players="players"
      @start-game="startGame"
      @leave-game="handleLeaveGame"
    />

    <!-- Game Phases -->
    <div v-else>
      <header class="app-header">
        <h1>Quiz App</h1>
        <div class="game-info">
          <span class="game-code-badge">Game: {{ gameCode }}</span>
          <span class="player-badge">{{ currentPlayer.name }}</span>
        </div>
        <p class="subtitle">
          <span v-if="currentPhase === 'answering'">Answer each question about yourself</span>
          <span v-else-if="currentPhase === 'matching'">Match answers to players</span>
          <span v-else>Final Results</span>
        </p>
      </header>

      <main class="app-main">
        <!-- Answering Phase -->
        <QuestionFlow
          v-if="currentPhase === 'answering'"
          :questions="questions"
          :player-id="currentPlayer.id"
          :player-name="currentPlayer.name"
          @complete="handleFlowComplete"
        />

        <!-- Matching Phase -->
        <div v-else-if="currentPhase === 'matching'" class="matching-section">
          <div class="progress-info">
            Question {{ currentMatchQuestionIndex + 1 }} of {{ questions.length }}
          </div>
          
          <QuestionMatch
            :key="getCurrentMatchQuestion().id"
            :question="getCurrentMatchQuestion()"
            :answers="getCurrentQuestionAnswers()"
            :players="samplePlayers"
            :current-player-id="currentPlayer.id"
            @submit="handleMatchSubmit"
          />
        </div>

        <!-- Results Phase -->
        <div v-else class="completion-section">
          <div class="completion-card">
            <h2>🎉 Quiz Complete!</h2>
            <p>Great job, {{ currentPlayer.name }}!</p>
            
            <div class="final-score">
              <div class="score-display">
                <span class="score-number">{{ calculateTotalScore().correct }}</span>
                <span class="score-divider">/</span>
                <span class="score-total">{{ calculateTotalScore().total }}</span>
              </div>
              <div class="score-label">Correct Matches</div>
              <div class="score-percentage">
                {{ Math.round((calculateTotalScore().correct / calculateTotalScore().total) * 100) }}%
              </div>
            </div>

            <button 
              type="button"
              class="reset-button"
              @click="resetFlow"
            >
              Back to Home
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f5f5f5, #e9e9e9);
  padding: 2rem;
}

.home-container {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-header {
  text-align: center;
  margin-bottom: 2rem;
}

.app-header h1 {
  color: #2c3e50;
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.game-info {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 0.75rem 0;
}

.game-code-badge, .player-badge {
  padding: 0.375rem 0.875rem;
  background: white;
  border-radius: 16px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #666;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.game-code-badge {
  color: #42b883;
}

.subtitle {
  margin: 0.5rem 0 0 0;
  color: #666;
  font-size: 1rem;
}

.app-main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.matching-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.progress-info {
  text-align: center;
  font-size: 0.875rem;
  font-weight: 500;
  color: #666;
  padding: 0.5rem;
  background: white;
  border-radius: 8px;
  max-width: 800px;
  margin: 0 auto;
}

.completion-section {
  display: flex;
  justify-content: center;
}

.completion-card {
  max-width: 600px;
  width: 100%;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.completion-card h2 {
  color: #2c3e50;
  margin: 0 0 1rem 0;
  font-size: 1.75rem;
}

.completion-card > p {
  color: #666;
  margin: 0 0 2rem 0;
}

.final-score {
  margin: 2rem 0;
  padding: 2rem;
  background: linear-gradient(135deg, #f5f5f5, #e9e9e9);
  border-radius: 12px;
}

.score-display {
  font-size: 4rem;
  font-weight: 700;
  color: #42b883;
  margin-bottom: 0.5rem;
}

.score-number {
  color: #42b883;
}

.score-divider {
  color: #ccc;
  margin: 0 0.5rem;
}

.score-total {
  color: #666;
}

.score-label {
  font-size: 1.125rem;
  color: #666;
  margin-bottom: 1rem;
}

.score-percentage {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
}

.reset-button {
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 500;
  color: white;
  background: #42b883;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.reset-button:hover {
  background: #35a372;
}

/* Reconnecting Overlay Styles */
.reconnecting-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.reconnecting-message {
  background: white;
  padding: 2rem 3rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.reconnecting-message p {
  margin: 0;
  font-size: 1.25rem;
  color: #2c3e50;
}


.reset-button:hover {
  background: #35a372;
}
</style>

