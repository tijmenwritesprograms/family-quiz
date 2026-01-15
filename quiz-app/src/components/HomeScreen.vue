<script setup lang="ts">
import { ref } from 'vue'

/**
 * Emits for the HomeScreen component
 */
interface Emits {
  (e: 'create-game', playerName: string): void
  (e: 'join-game', payload: { gameCode: string; playerName: string }): void
}

const emit = defineEmits<Emits>()

// View state: 'menu' | 'create' | 'join'
const currentView = ref<'menu' | 'create' | 'join'>('menu')

// Form data
const playerName = ref('')
const gameCode = ref('')

// Validation errors
const nameError = ref('')
const codeError = ref('')

/**
 * Navigate to create game view
 */
const goToCreate = () => {
  currentView.value = 'create'
  nameError.value = ''
}

/**
 * Navigate to join game view
 */
const goToJoin = () => {
  currentView.value = 'join'
  nameError.value = ''
  codeError.value = ''
}

/**
 * Go back to main menu
 */
const goBack = () => {
  currentView.value = 'menu'
  playerName.value = ''
  gameCode.value = ''
  nameError.value = ''
  codeError.value = ''
}

/**
 * Validate player name
 */
const validateName = (): boolean => {
  if (!playerName.value.trim()) {
    nameError.value = 'Please enter your name'
    return false
  }
  if (playerName.value.trim().length < 2) {
    nameError.value = 'Name must be at least 2 characters'
    return false
  }
  if (playerName.value.trim().length > 20) {
    nameError.value = 'Name must be less than 20 characters'
    return false
  }
  nameError.value = ''
  return true
}

/**
 * Validate game code
 */
const validateCode = (): boolean => {
  if (!gameCode.value.trim()) {
    codeError.value = 'Please enter a game code'
    return false
  }
  if (gameCode.value.trim().length !== 6) {
    codeError.value = 'Game code must be 6 characters'
    return false
  }
  codeError.value = ''
  return true
}

/**
 * Handle create game submission
 */
const handleCreateGame = () => {
  if (validateName()) {
    emit('create-game', playerName.value.trim())
  }
}

/**
 * Handle join game submission
 */
const handleJoinGame = () => {
  const isNameValid = validateName()
  const isCodeValid = validateCode()
  
  if (isNameValid && isCodeValid) {
    emit('join-game', {
      gameCode: gameCode.value.trim().toUpperCase(),
      playerName: playerName.value.trim()
    })
  }
}
</script>

<template>
  <div class="home-screen">
    <!-- Main Menu -->
    <div v-if="currentView === 'menu'" class="menu-view">
      <div class="logo-section">
        <h1 class="app-title">🎯 Quiz Match</h1>
        <p class="app-tagline">Match answers, guess players, have fun!</p>
      </div>

      <div class="menu-buttons">
        <button 
          type="button"
          class="menu-button create"
          @click="goToCreate"
        >
          <span class="button-icon">➕</span>
          <span class="button-text">Create New Game</span>
          <span class="button-subtitle">Start a new quiz session</span>
        </button>

        <button 
          type="button"
          class="menu-button join"
          @click="goToJoin"
        >
          <span class="button-icon">🔗</span>
          <span class="button-text">Join Game</span>
          <span class="button-subtitle">Enter an existing game code</span>
        </button>
      </div>

      <div class="info-section">
        <p class="info-text">
          Answer questions about yourself, then match others' answers to the right players!
        </p>
      </div>
    </div>

    <!-- Create Game View -->
    <div v-else-if="currentView === 'create'" class="form-view">
      <button type="button" class="back-button" @click="goBack">
        ← Back
      </button>

      <div class="form-header">
        <h2 class="form-title">Create New Game</h2>
        <p class="form-description">Enter your name to start a new quiz session</p>
      </div>

      <form class="game-form" @submit.prevent="handleCreateGame">
        <div class="form-group">
          <label for="create-name" class="form-label">Your Name</label>
          <input
            id="create-name"
            v-model="playerName"
            type="text"
            class="form-input"
            :class="{ error: nameError }"
            placeholder="Enter your name"
            maxlength="20"
            @input="nameError = ''"
          />
          <span v-if="nameError" class="error-message">{{ nameError }}</span>
        </div>

        <button 
          type="submit"
          class="submit-button"
        >
          Create Game
        </button>
      </form>

      <div class="form-info">
        <p>You'll receive a game code to share with other players</p>
      </div>
    </div>

    <!-- Join Game View -->
    <div v-else class="form-view">
      <button type="button" class="back-button" @click="goBack">
        ← Back
      </button>

      <div class="form-header">
        <h2 class="form-title">Join Game</h2>
        <p class="form-description">Enter the game code and your name</p>
      </div>

      <form class="game-form" @submit.prevent="handleJoinGame">
        <div class="form-group">
          <label for="game-code" class="form-label">Game Code</label>
          <input
            id="game-code"
            v-model="gameCode"
            type="text"
            class="form-input code-input"
            :class="{ error: codeError }"
            placeholder="ABCDEF"
            maxlength="6"
            @input="gameCode = gameCode.toUpperCase(); codeError = ''"
          />
          <span v-if="codeError" class="error-message">{{ codeError }}</span>
        </div>

        <div class="form-group">
          <label for="join-name" class="form-label">Your Name</label>
          <input
            id="join-name"
            v-model="playerName"
            type="text"
            class="form-input"
            :class="{ error: nameError }"
            placeholder="Enter your name"
            maxlength="20"
            @input="nameError = ''"
          />
          <span v-if="nameError" class="error-message">{{ nameError }}</span>
        </div>

        <button 
          type="submit"
          class="submit-button"
        >
          Join Game
        </button>
      </form>

      <div class="form-info">
        <p>Ask the host for the 6-character game code</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-screen {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.menu-view {
  max-width: 500px;
  width: 100%;
  text-align: center;
}

.logo-section {
  margin-bottom: 3rem;
}

.app-title {
  font-size: 3rem;
  font-weight: 800;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.app-tagline {
  font-size: 1.125rem;
  color: #666;
  margin: 0;
}

.menu-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.menu-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background: white;
  border: 3px solid #e0e0e0;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.menu-button:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.menu-button.create:hover {
  border-color: #42b883;
  background: linear-gradient(to bottom, white, #f0fdf7);
}

.menu-button.join:hover {
  border-color: #3498db;
  background: linear-gradient(to bottom, white, #f0f9ff);
}

.button-icon {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.button-text {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.button-subtitle {
  font-size: 0.875rem;
  color: #666;
}

.info-section {
  margin-top: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  border: 2px solid #f0f0f0;
}

.info-text {
  margin: 0;
  color: #666;
  font-size: 0.95rem;
  line-height: 1.6;
}

.form-view {
  max-width: 450px;
  width: 100%;
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.back-button {
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  color: #666;
  font-size: 0.95rem;
  cursor: pointer;
  transition: color 0.3s;
  margin-bottom: 1.5rem;
}

.back-button:hover {
  color: #42b883;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.form-description {
  color: #666;
  margin: 0;
  font-size: 0.95rem;
}

.game-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.95rem;
}

.form-input {
  padding: 0.875rem;
  font-size: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  transition: border-color 0.3s;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #42b883;
}

.form-input.error {
  border-color: #e74c3c;
}

.code-input {
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-align: center;
  font-size: 1.5rem;
}

.error-message {
  color: #e74c3c;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.submit-button {
  padding: 1rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  background: #42b883;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 0.5rem;
}

.submit-button:hover {
  background: #35a372;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.3);
}

.form-info {
  margin-top: 1.5rem;
  text-align: center;
}

.form-info p {
  margin: 0;
  color: #999;
  font-size: 0.875rem;
}
</style>
