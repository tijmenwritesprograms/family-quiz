<script setup lang="ts">
import type { Player } from '../types/quiz'

/**
 * LobbyScreen Component
 * 
 * Displays the game lobby where players wait before the game starts.
 * Shows the game code, list of players, and controls for starting or leaving the game.
 */

interface Props {
  gameCode: string
  playerName: string
  isHost: boolean
  players: Player[]
}

interface Emits {
  (e: 'start-game'): void
  (e: 'leave-game'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleStartGame = () => {
  emit('start-game')
}

const handleLeaveGame = () => {
  emit('leave-game')
}
</script>

<template>
  <div class="lobby-container">
    <div class="lobby-card">
      <h2>Game Lobby</h2>
      
      <div class="game-code-display">
        <label>Game Code</label>
        <div class="code">{{ gameCode }}</div>
        <p class="code-instruction">Share this code with other players</p>
      </div>

      <div class="player-info">
        <h3>Players ({{ players.length }})</h3>
        <div class="player-list">
          <div 
            v-for="player in players" 
            :key="player.id"
            class="player-item"
            :class="{ 'is-current-player': player.name === playerName }"
          >
            <span class="player-name">{{ player.name }}</span>
            <span v-if="player.name === playerName && isHost" class="host-badge">Host</span>
            <span v-else-if="player.name === playerName" class="you-badge">You</span>
          </div>
          <p v-if="players.length === 0" class="no-players-message">
            Waiting for players to join...
          </p>
        </div>
      </div>

      <div class="lobby-actions">
        <button
          v-if="isHost"
          type="button"
          class="start-button"
          @click="handleStartGame"
        >
          Start Game
        </button>
        <p v-else class="waiting-text">
          Waiting for host to start the game...
        </p>
      </div>

      <button
        type="button"
        class="leave-button"
        @click="handleLeaveGame"
      >
        Leave Game
      </button>
    </div>
  </div>
</template>

<style scoped>
.lobby-container {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lobby-card {
  max-width: 500px;
  width: 100%;
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.lobby-card h2 {
  margin: 0 0 2rem 0;
  color: #2c3e50;
  text-align: center;
  font-size: 1.75rem;
}

.game-code-display {
  text-align: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f5f5f5, #e9e9e9);
  border-radius: 12px;
}

.game-code-display label {
  display: block;
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.game-code-display .code {
  font-size: 2.5rem;
  font-weight: 700;
  color: #42b883;
  letter-spacing: 0.2em;
  font-family: 'Courier New', monospace;
}

.code-instruction {
  margin: 0.5rem 0 0 0;
  font-size: 0.875rem;
  color: #999;
}

.player-info {
  margin-bottom: 2rem;
}

.player-info h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.125rem;
}

.player-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.player-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  background: #f9f9f9;
  border-radius: 8px;
  border-left: 4px solid #42b883;
  transition: all 0.2s;
}

.player-item.is-current-player {
  background: #e8f5e9;
  border-left-color: #2e7d32;
}

.player-name {
  font-weight: 600;
  color: #2c3e50;
}

.host-badge {
  padding: 0.25rem 0.75rem;
  background: #42b883;
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.you-badge {
  padding: 0.25rem 0.75rem;
  background: #2196f3;
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.no-players-message {
  text-align: center;
  color: #999;
  font-style: italic;
  margin: 1rem 0;
  padding: 1rem;
}

.lobby-actions {
  margin-bottom: 1rem;
}

.start-button {
  width: 100%;
  padding: 1rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  background: #42b883;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.start-button:hover {
  background: #35a372;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.3);
}

.waiting-text {
  text-align: center;
  color: #666;
  font-style: italic;
  margin: 0;
  padding: 1rem;
}

.leave-button {
  width: 100%;
  padding: 0.75rem;
  font-size: 0.95rem;
  color: #e74c3c;
  background: transparent;
  border: 2px solid #e74c3c;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.leave-button:hover {
  background: #e74c3c;
  color: white;
}
</style>
