import { ref } from 'vue'
import { gameService } from '../services/gameService'
import { clientIdentityService } from '../services/clientIdentityService'
import type { Player } from '../types/quiz'

/**
 * Composable for managing game session state and API calls
 * Includes automatic reconnection on mount if session exists
 */
export function useGame() {
  const gameCode = ref<string>('')
  const currentPlayerId = ref<string>('')
  const currentPlayerName = ref<string>('')
  const isHost = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isReconnecting = ref(false)
  const players = ref<Player[]>([])

  /**
   * Create a new game session
   */
  const createGame = async (playerName: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await gameService.createGame(playerName)
      
      gameCode.value = response.gameCode
      currentPlayerId.value = response.player.id
      currentPlayerName.value = response.player.name
      isHost.value = true

      // Store session for reconnection
      clientIdentityService.storeSession({
        playerId: response.player.id,
        playerName: response.player.name,
        gameCode: response.gameCode,
        isHost: true
      })

      return response
    } catch (err) {
      error.value = 'Failed to create game. Please try again.'
      console.error('Create game error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Join an existing game session
   */
  const joinGame = async (code: string, playerName: string) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await gameService.joinGame(code, playerName)
      
      gameCode.value = response.gameCode
      currentPlayerId.value = response.player.id
      currentPlayerName.value = response.player.name
      isHost.value = false

      // Store session for reconnection
      clientIdentityService.storeSession({
        playerId: response.player.id,
        playerName: response.player.name,
        gameCode: response.gameCode,
        isHost: false
      })

      return response
    } catch (err) {
      error.value = 'Failed to join game. Check the game code and try again.'
      console.error('Join game error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Attempt to reconnect using stored session
   */
  const attemptReconnect = async () => {
    const session = clientIdentityService.getSession()
    
    if (!session) {
      console.log('[useGame] No stored session found')
      return false
    }

    isReconnecting.value = true
    isLoading.value = true
    error.value = null

    try {
      console.log('[useGame] Attempting to reconnect to game:', session.gameCode)
      
      const response = await gameService.reconnect(session.gameCode, session.playerId)
      
      // Restore session state
      gameCode.value = response.gameCode
      currentPlayerId.value = response.player.id
      currentPlayerName.value = response.player.name
      isHost.value = session.isHost

      console.log('[useGame] Successfully reconnected to game')
      return true
    } catch (err) {
      console.error('[useGame] Reconnection failed:', err)
      error.value = 'Failed to reconnect to previous game'
      
      // Clear invalid session
      clientIdentityService.clearSession()
      return false
    } finally {
      isReconnecting.value = false
      isLoading.value = false
    }
  }

  /**
   * Leave the current game and clear session
   */
  const leaveGame = () => {
    gameCode.value = ''
    currentPlayerId.value = ''
    currentPlayerName.value = ''
    isHost.value = false
    clientIdentityService.clearSession()
    console.log('[useGame] Left game, session cleared')
  }

  /**
   * Check for stored session on mount and attempt reconnection
   */
  const handleAutoReconnect = async () => {
    if (clientIdentityService.hasActiveSession()) {
      console.log('[useGame] Found stored session, attempting reconnection...')
      return await attemptReconnect()
    }
    return false
  }

  /**
   * Fetch current game details (players, status, etc.)
   */
  const fetchGameDetails = async () => {
    if (!gameCode.value) {
      console.warn('[useGame] Cannot fetch game details without game code')
      return
    }

    try {
      const details = await gameService.getGameDetails(gameCode.value)
      players.value = details.players
      console.log('[useGame] Game details updated:', details.players.length, 'players')
    } catch (err) {
      console.error('[useGame] Failed to fetch game details:', err)
      // Don't set error state here - this is background polling
    }
  }

  return {
    // State
    gameCode,
    currentPlayerId,
    currentPlayerName,
    isHost,
    isLoading,
    isReconnecting,
    error,
    players,
    
    // Actions
    createGame,
    joinGame,
    attemptReconnect,
    leaveGame,
    handleAutoReconnect,
    fetchGameDetails,
    
    // Utilities
    hasStoredSession: () => clientIdentityService.hasActiveSession()
  }
}
