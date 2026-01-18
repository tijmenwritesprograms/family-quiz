/**
 * Service for managing client identity across sessions
 * Stores player information in localStorage to enable reconnection
 */

interface StoredPlayerSession {
  playerId: string
  playerName: string
  gameCode: string
  joinedAt: number // timestamp
  isHost: boolean
}

const STORAGE_KEY = 'quiz_player_session'
const SESSION_EXPIRY_DAYS = 7 // Sessions expire after 7 days

/**
 * Client Identity Service
 * Manages player session persistence across browser refreshes
 */
export const clientIdentityService = {
  /**
   * Store the current player session
   */
  storeSession(session: Omit<StoredPlayerSession, 'joinedAt'>): void {
    const sessionData: StoredPlayerSession = {
      ...session,
      joinedAt: Date.now()
    }
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData))
      console.log('[ClientIdentity] Session stored:', sessionData.gameCode)
    } catch (error) {
      console.error('[ClientIdentity] Failed to store session:', error)
    }
  },

  /**
   * Retrieve the stored player session if it exists and hasn't expired
   */
  getSession(): StoredPlayerSession | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        return null
      }

      const session: StoredPlayerSession = JSON.parse(stored)
      
      // Check if session has expired
      const expiryTime = SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000
      const isExpired = Date.now() - session.joinedAt > expiryTime
      
      if (isExpired) {
        console.log('[ClientIdentity] Session expired, clearing')
        this.clearSession()
        return null
      }

      console.log('[ClientIdentity] Session retrieved:', session.gameCode)
      return session
    } catch (error) {
      console.error('[ClientIdentity] Failed to retrieve session:', error)
      return null
    }
  },

  /**
   * Clear the stored session (e.g., when player leaves game)
   */
  clearSession(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
      console.log('[ClientIdentity] Session cleared')
    } catch (error) {
      console.error('[ClientIdentity] Failed to clear session:', error)
    }
  },

  /**
   * Check if there's an active session
   */
  hasActiveSession(): boolean {
    return this.getSession() !== null
  },

  /**
   * Update specific session fields without replacing the whole session
   */
  updateSession(updates: Partial<Omit<StoredPlayerSession, 'joinedAt'>>): void {
    const current = this.getSession()
    if (!current) {
      console.warn('[ClientIdentity] No session to update')
      return
    }

    this.storeSession({
      playerId: updates.playerId ?? current.playerId,
      playerName: updates.playerName ?? current.playerName,
      gameCode: updates.gameCode ?? current.gameCode,
      isHost: updates.isHost ?? current.isHost
    })
  }
}
