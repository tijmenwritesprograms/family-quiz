<script setup lang="ts">
import { ref, computed } from 'vue'
import QuestionAnswer from './QuestionAnswer.vue'
import type { Question, Answer } from '../types/quiz'

/**
 * Props for the QuestionFlow component
 */
interface Props {
  questions: Question[]
  playerId: string
  playerName: string
}

/**
 * Emits for the QuestionFlow component
 */
interface Emits {
  (e: 'complete', answers: Answer[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Track current question index
const currentQuestionIndex = ref(0)

// Store all answers collected during the flow
const collectedAnswers = ref<Answer[]>([])

// Computed property for the current question
const currentQuestion = computed(() => {
  return props.questions[currentQuestionIndex.value]
})

// Computed property to check if we're on the last question
const isLastQuestion = computed(() => {
  return currentQuestionIndex.value === props.questions.length - 1
})

// Computed property to check if we're on the first question
const isFirstQuestion = computed(() => {
  return currentQuestionIndex.value === 0
})

// Computed property for progress
const progress = computed(() => {
  return {
    current: currentQuestionIndex.value + 1,
    total: props.questions.length,
    percentage: ((currentQuestionIndex.value + 1) / props.questions.length) * 100
  }
})

// Check if current question already has an answer
const existingAnswer = computed(() => {
  const answer = collectedAnswers.value.find(
    a => a.questionId === currentQuestion.value.id
  )
  return answer?.text
})

/**
 * Handle answer submission
 */
const handleAnswerSubmit = (answer: Answer) => {
  // Check if we already have an answer for this question
  const existingIndex = collectedAnswers.value.findIndex(
    a => a.questionId === answer.questionId
  )

  if (existingIndex !== -1) {
    // Update existing answer
    collectedAnswers.value[existingIndex] = answer
  } else {
    // Add new answer
    collectedAnswers.value.push(answer)
  }

  // Automatically move to next question if not the last one
  if (!isLastQuestion.value) {
    goToNext()
  } else {
    // If it's the last question, emit complete event
    emit('complete', collectedAnswers.value)
  }
}

/**
 * Navigate to next question
 */
const goToNext = () => {
  if (!isLastQuestion.value) {
    currentQuestionIndex.value++
  }
}

/**
 * Navigate to previous question
 */
const goToPrevious = () => {
  if (!isFirstQuestion.value) {
    currentQuestionIndex.value--
  }
}

/**
 * Check if current question has been answered
 */
const hasAnsweredCurrent = computed(() => {
  return collectedAnswers.value.some(
    a => a.questionId === currentQuestion.value.id
  )
})
</script>

<template>
  <div class="question-flow">
    <!-- Progress Indicator -->
    <div class="progress-section">
      <div class="progress-text">
        Question {{ progress.current }} of {{ progress.total }}
      </div>
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${progress.percentage}%` }"
        />
      </div>
    </div>

    <!-- Current Question -->
    <QuestionAnswer
      :question="currentQuestion"
      :player-id="playerId"
      :player-name="playerName"
      :existing-answer="existingAnswer"
      @submit="handleAnswerSubmit"
    />

    <!-- Navigation Controls -->
    <div class="navigation">
      <button
        type="button"
        class="nav-button prev"
        :disabled="isFirstQuestion"
        @click="goToPrevious"
      >
        ← Previous
      </button>

      <div class="nav-info">
        <span v-if="hasAnsweredCurrent" class="answered-badge">
          ✓ Answered
        </span>
      </div>

      <button
        v-if="!isLastQuestion"
        type="button"
        class="nav-button next"
        :disabled="!hasAnsweredCurrent"
        @click="goToNext"
      >
        Next →
      </button>
      <div v-else class="completion-hint">
        Submit your answer to complete
      </div>
    </div>
  </div>
</template>

<style scoped>
.question-flow {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.progress-section {
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

.progress-text {
  text-align: center;
  font-size: 0.875rem;
  font-weight: 500;
  color: #666;
  margin-bottom: 0.5rem;
}

.progress-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(to right, #42b883, #35a372);
  transition: width 0.3s ease;
}

.navigation {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.nav-button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  border: 2px solid #42b883;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background: white;
  color: #42b883;
}

.nav-button:hover:not(:disabled) {
  background: #42b883;
  color: white;
}

.nav-button:disabled {
  border-color: #ccc;
  color: #ccc;
  cursor: not-allowed;
}

.nav-info {
  flex: 1;
  text-align: center;
}

.answered-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #42b883;
  color: white;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.completion-hint {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #666;
  font-style: italic;
}
</style>
