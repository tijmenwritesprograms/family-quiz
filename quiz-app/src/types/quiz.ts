/**
 * Represents a question in the quiz
 */
export interface Question {
  id: string
  text: string
  category?: 'favorite' | 'preference' | 'other'
}

/**
 * Represents an answer given by a player to a question
 */
export interface Answer {
  questionId: string
  playerId: string
  playerName: string
  text: string
  timestamp: Date
}

/**
 * Represents a player in the game
 */
export interface Player {
  id: string
  name: string
}

/**
 * Represents a match attempt (player's guess)
 */
export interface MatchAttempt {
  answerId: string
  guessedPlayerId: string
  actualPlayerId: string
  isCorrect: boolean
}

/**
 * Represents the state of matching for a question
 */
export interface QuestionMatchState {
  questionId: string
  matches: Map<string, string> // answerId -> guessedPlayerId
  submitted: boolean
}
