import httpClient from './httpClient'
import type { Player, Question } from '../types/quiz'

/**
 * Game Session API responses
 */
interface CreateGameResponse {
  gameCode: string
  player: {
    id: string
    name: string
  }
}

interface JoinGameResponse {
  gameCode: string
  player: {
    id: string
    name: string
  }
}

interface ReconnectResponse {
  gameCode: string
  player: {
    id: string
    name: string
  }
  gameState: string
}

interface GameDetailsResponse {
  gameCode: string
  players: Player[]
  questions: Question[]
  status: string
}

/**
 * Service for managing game sessions
 */
export const gameService = {
  /**
   * Create a new game session
   */
  async createGame(hostName: string): Promise<CreateGameResponse> {
    const response = await httpClient.post<CreateGameResponse>('/games', {
      playerName: hostName
    })
    return response.data
  },

  /**
   * Join an existing game session
   */
  async joinGame(gameCode: string, playerName: string): Promise<JoinGameResponse> {
    const response = await httpClient.post<JoinGameResponse>(`/games/${gameCode}/join`, {
      playerName
    })
    return response.data
  },

  /**
   * Reconnect to a game with existing player ID
   * This allows players to rejoin after browser refresh
   */
  async reconnect(gameCode: string, playerId: string): Promise<ReconnectResponse> {
    const response = await httpClient.post<ReconnectResponse>(`/games/${gameCode}/reconnect`, {
      playerId
    })
    return response.data
  },

  /**
   * Verify if a game code is valid
   */
  async verifyGameCode(gameCode: string): Promise<boolean> {
    try {
      await httpClient.get(`/games/${gameCode}`)
      return true
    } catch {
      return false
    }
  },

  /**
   * Get current game details including all players
   */
  async getGameDetails(gameCode: string): Promise<GameDetailsResponse> {
    const response = await httpClient.get<GameDetailsResponse>(`/games/${gameCode}`)
    return response.data
  }
}
