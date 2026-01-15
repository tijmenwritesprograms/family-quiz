<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Question, Answer, Player, MatchAttempt } from '../types/quiz'

/**
 * Props for the QuestionMatch component
 */
interface Props {
  question: Question
  answers: Answer[] // All answers for this question from all players
  players: Player[] // List of all players
  currentPlayerId: string // The player doing the matching
}

/**
 * Emits for the QuestionMatch component
 */
interface Emits {
  (e: 'submit', attempts: MatchAttempt[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Store matches: answerId -> selected playerId
const matches = ref<Record<string, string>>({})

// Track if results have been submitted
const isSubmitted = ref(false)

// Store match results after submission
const matchResults = ref<MatchAttempt[]>([])

// Get answers excluding the current player's answer (they shouldn't match their own)
const answersToMatch = computed(() => {
  return props.answers.filter(a => a.playerId !== props.currentPlayerId)
})

// Get players excluding the current player
const playersToMatch = computed(() => {
  return props.players.filter(p => p.id !== props.currentPlayerId)
})

// Check if all answers have been matched
const allMatched = computed(() => {
  return answersToMatch.value.every(answer => matches.value[answer.playerId])
})

// Calculate score
const score = computed(() => {
  if (!isSubmitted.value) return null
  const correct = matchResults.value.filter(m => m.isCorrect).length
  const total = matchResults.value.length
  return { correct, total }
})

/**
 * Select a player for a specific answer
 */
const selectPlayer = (answerId: string, playerId: string) => {
  if (isSubmitted.value) return
  
  // If this player is already matched to another answer, swap them
  const existingMatch = Object.entries(matches.value).find(
    ([_, selectedPlayerId]) => selectedPlayerId === playerId
  )
  
  if (existingMatch) {
    const [existingAnswerId] = existingMatch
    matches.value[existingAnswerId] = matches.value[answerId] || ''
  }
  
  matches.value[answerId] = playerId
}

/**
 * Clear a match
 */
const clearMatch = (answerId: string) => {
  if (isSubmitted.value) return
  delete matches.value[answerId]
}

/**
 * Check if a player is already selected
 */
const isPlayerSelected = (playerId: string) => {
  return Object.values(matches.value).includes(playerId)
}

/**
 * Get the selected player for an answer
 */
const getSelectedPlayer = (answerId: string) => {
  const playerId = matches.value[answerId]
  return props.players.find(p => p.id === playerId)
}

/**
 * Submit the matches and check results
 */
const submitMatches = () => {
  const attempts: MatchAttempt[] = answersToMatch.value.map(answer => {
    const guessedPlayerId = matches.value[answer.playerId] || ''
    return {
      answerId: answer.playerId,
      guessedPlayerId,
      actualPlayerId: answer.playerId,
      isCorrect: guessedPlayerId === answer.playerId
    }
  })
  
  matchResults.value = attempts
  isSubmitted.value = true
  emit('submit', attempts)
}

/**
 * Reset to try again
 */
const reset = () => {
  matches.value = {}
  isSubmitted.value = false
  matchResults.value = []
}
</script>

<template>
  <div class="question-match">
    <!-- Question Header -->
    <div class="question-header">
      <h2 class="question-text">{{ question.text }}</h2>
      <p class="instruction">Match each answer to the player who said it</p>
    </div>

    <!-- Score Display (after submission) -->
    <div v-if="isSubmitted && score" class="score-banner" :class="{ perfect: score.correct === score.total }">
      <span class="score-text">
        {{ score.correct }} / {{ score.total }} correct
        <span v-if="score.correct === score.total"> 🎉 Perfect!</span>
      </span>
    </div>

    <!-- Answers to Match -->
    <div class="answers-grid">
      <div
        v-for="answer in answersToMatch"
        :key="answer.playerId"
        class="answer-card"
        :class="{
          matched: matches[answer.playerId],
          correct: isSubmitted && matchResults.find(m => m.answerId === answer.playerId)?.isCorrect,
          incorrect: isSubmitted && !matchResults.find(m => m.answerId === answer.playerId)?.isCorrect
        }"
      >
        <div class="answer-content">
          <div class="answer-text">{{ answer.text }}</div>
          
          <!-- Player Selection -->
          <div v-if="!isSubmitted" class="player-selector">
            <select
              :value="matches[answer.playerId] || ''"
              class="player-dropdown"
              @change="selectPlayer(answer.playerId, ($event.target as HTMLSelectElement).value)"
            >
              <option value="" disabled>Select player...</option>
              <option
                v-for="player in playersToMatch"
                :key="player.id"
                :value="player.id"
                :disabled="isPlayerSelected(player.id) && matches[answer.playerId] !== player.id"
              >
                {{ player.name }}
                {{ isPlayerSelected(player.id) && matches[answer.playerId] !== player.id ? '(selected)' : '' }}
              </option>
            </select>
            
            <button
              v-if="matches[answer.playerId]"
              type="button"
              class="clear-button"
              @click="clearMatch(answer.playerId)"
            >
              ✕
            </button>
          </div>

          <!-- Result Display (after submission) -->
          <div v-else class="result-display">
            <div class="guessed-player">
              You guessed: <strong>{{ getSelectedPlayer(answer.playerId)?.name || 'No guess' }}</strong>
            </div>
            <div class="actual-player">
              Actually: <strong>{{ answer.playerName }}</strong>
              <span v-if="matchResults.find(m => m.answerId === answer.playerId)?.isCorrect" class="correct-icon">✓</span>
              <span v-else class="incorrect-icon">✗</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="actions">
      <button
        v-if="!isSubmitted"
        type="button"
        class="submit-button"
        :disabled="!allMatched"
        @click="submitMatches"
      >
        Check Answers
      </button>
      
      <button
        v-else
        type="button"
        class="reset-button"
        @click="reset"
      >
        Try Again
      </button>
    </div>
  </div>
</template>

<style scoped>
.question-match {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.question-header {
  text-align: center;
  margin-bottom: 2rem;
}

.question-text {
  font-size: 1.75rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.instruction {
  color: #666;
  font-size: 1rem;
  margin: 0;
}

.score-banner {
  padding: 1rem;
  background: #42b883;
  color: white;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.score-banner.perfect {
  background: linear-gradient(135deg, #42b883, #35a372);
  animation: pulse 0.5s ease;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.answers-grid {
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
}

.answer-card {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s;
}

.answer-card.matched {
  border-color: #42b883;
  background: #f8fffe;
}

.answer-card.correct {
  border-color: #42b883;
  background: #e8f5e9;
}

.answer-card.incorrect {
  border-color: #e74c3c;
  background: #ffebee;
}

.answer-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.answer-text {
  font-size: 1.125rem;
  color: #2c3e50;
  font-weight: 500;
  padding: 0.75rem;
  background: #f9f9f9;
  border-radius: 8px;
  border-left: 4px solid #42b883;
}

.player-selector {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.player-dropdown {
  flex: 1;
  padding: 0.75rem;
  font-size: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s;
}

.player-dropdown:hover {
  border-color: #42b883;
}

.player-dropdown:focus {
  outline: none;
  border-color: #42b883;
}

.clear-button {
  padding: 0.75rem 1rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
}

.clear-button:hover {
  background: #c0392b;
}

.result-display {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f9f9f9;
  border-radius: 8px;
}

.guessed-player, .actual-player {
  font-size: 0.95rem;
  color: #666;
}

.correct-icon {
  color: #42b883;
  font-weight: bold;
  margin-left: 0.5rem;
}

.incorrect-icon {
  color: #e74c3c;
  font-weight: bold;
  margin-left: 0.5rem;
}

.actions {
  display: flex;
  justify-content: center;
}

.submit-button, .reset-button {
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-button {
  background: #42b883;
  color: white;
}

.submit-button:hover:not(:disabled) {
  background: #35a372;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.3);
}

.submit-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.reset-button {
  background: #3498db;
  color: white;
}

.reset-button:hover {
  background: #2980b9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}
</style>
