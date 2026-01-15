import type { Player, Question, Answer } from '../types/quiz'

/**
 * Sample players for testing
 */
export const samplePlayers: Player[] = [
  { id: 'player1', name: 'Alex' },
  { id: 'player2', name: 'Jordan' },
  { id: 'player3', name: 'Casey' },
  { id: 'player4', name: 'Morgan' }
]

/**
 * Sample questions
 */
export const sampleQuestions: Question[] = [
  {
    id: 'q1',
    text: "What's your favorite movie?",
    category: 'favorite'
  },
  {
    id: 'q2',
    text: "What's your favorite food?",
    category: 'favorite'
  },
  {
    id: 'q3',
    text: "What's your favorite vacation spot?",
    category: 'favorite'
  },
  {
    id: 'q4',
    text: "What's your favorite hobby?",
    category: 'favorite'
  }
]

/**
 * Generate sample answers for all players for all questions
 */
export const generateSampleAnswers = (): Answer[] => {
  const answers: Answer[] = []
  
  // Question 1: Favorite movie
  answers.push(
    {
      questionId: 'q1',
      playerId: 'player1',
      playerName: 'Alex',
      text: 'The Shawshank Redemption',
      timestamp: new Date()
    },
    {
      questionId: 'q1',
      playerId: 'player2',
      playerName: 'Jordan',
      text: 'Inception',
      timestamp: new Date()
    },
    {
      questionId: 'q1',
      playerId: 'player3',
      playerName: 'Casey',
      text: 'The Matrix',
      timestamp: new Date()
    },
    {
      questionId: 'q1',
      playerId: 'player4',
      playerName: 'Morgan',
      text: 'Interstellar',
      timestamp: new Date()
    }
  )

  // Question 2: Favorite food
  answers.push(
    {
      questionId: 'q2',
      playerId: 'player1',
      playerName: 'Alex',
      text: 'Pizza with extra cheese',
      timestamp: new Date()
    },
    {
      questionId: 'q2',
      playerId: 'player2',
      playerName: 'Jordan',
      text: 'Sushi',
      timestamp: new Date()
    },
    {
      questionId: 'q2',
      playerId: 'player3',
      playerName: 'Casey',
      text: 'Tacos',
      timestamp: new Date()
    },
    {
      questionId: 'q2',
      playerId: 'player4',
      playerName: 'Morgan',
      text: 'Pasta carbonara',
      timestamp: new Date()
    }
  )

  // Question 3: Favorite vacation spot
  answers.push(
    {
      questionId: 'q3',
      playerId: 'player1',
      playerName: 'Alex',
      text: 'Tokyo, Japan',
      timestamp: new Date()
    },
    {
      questionId: 'q3',
      playerId: 'player2',
      playerName: 'Jordan',
      text: 'Paris, France',
      timestamp: new Date()
    },
    {
      questionId: 'q3',
      playerId: 'player3',
      playerName: 'Casey',
      text: 'Bali, Indonesia',
      timestamp: new Date()
    },
    {
      questionId: 'q3',
      playerId: 'player4',
      playerName: 'Morgan',
      text: 'New York City, USA',
      timestamp: new Date()
    }
  )

  // Question 4: Favorite hobby
  answers.push(
    {
      questionId: 'q4',
      playerId: 'player1',
      playerName: 'Alex',
      text: 'Playing guitar',
      timestamp: new Date()
    },
    {
      questionId: 'q4',
      playerId: 'player2',
      playerName: 'Jordan',
      text: 'Photography',
      timestamp: new Date()
    },
    {
      questionId: 'q4',
      playerId: 'player3',
      playerName: 'Casey',
      text: 'Rock climbing',
      timestamp: new Date()
    },
    {
      questionId: 'q4',
      playerId: 'player4',
      playerName: 'Morgan',
      text: 'Reading sci-fi novels',
      timestamp: new Date()
    }
  )

  return answers
}
