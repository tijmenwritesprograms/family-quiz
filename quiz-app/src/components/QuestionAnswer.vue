<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Question, Answer } from '../types/quiz'

/**
 * Props for the QuestionAnswer component
 */
interface Props {
  question: Question
  playerId: string
  playerName: string
  existingAnswer?: string // Optional: pre-fill if editing
}

/**
 * Emits for the QuestionAnswer component
 */
interface Emits {
  (e: 'submit', answer: Answer): void
}

// Define props and emits using the new Vue 3 syntax
const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Reactive state for the answer text
const answerText = ref(props.existingAnswer || '')

// Watch for changes to existingAnswer prop (when navigating between questions)
watch(() => props.existingAnswer, (newValue) => {
  answerText.value = newValue || ''
})

/**
 * Handle the submit action
 * Creates an Answer object and emits it to the parent
 */
const handleSubmit = () => {
  // Validate that answer is not empty
  if (!answerText.value.trim()) {
    return
  }

  // Create the answer object
  const answer: Answer = {
    questionId: props.question.id,
    playerId: props.playerId,
    playerName: props.playerName,
    text: answerText.value.trim(),
    timestamp: new Date()
  }

  // Emit to parent component
  emit('submit', answer)

  // Clear the input after submission
  answerText.value = ''
}
</script>

<template>
  <div class="question-answer">
    <!-- Question Display -->
    <div class="question-section">
      <h2 class="question-text">{{ question.text }}</h2>
      <span v-if="question.category" class="question-category">
        {{ question.category }}
      </span>
    </div>

    <!-- Answer Input -->
    <div class="answer-section">
      <label for="answer-input" class="answer-label">
        Your answer, {{ playerName }}:
      </label>
      
      <textarea
        id="answer-input"
        v-model="answerText"
        class="answer-input"
        placeholder="Type your answer here..."
        rows="3"
        @keydown.ctrl.enter="handleSubmit"
      />

      <div class="actions">
        <button 
          type="button"
          class="submit-button"
          :disabled="!answerText.trim()"
          @click="handleSubmit"
        >
          Submit Answer
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.question-answer {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.question-section {
  margin-bottom: 2rem;
  text-align: center;
}

.question-text {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.question-category {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: #42b883;
  color: white;
  border-radius: 16px;
  font-size: 0.875rem;
  text-transform: capitalize;
}

.answer-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.answer-label {
  font-size: 1rem;
  font-weight: 500;
  color: #2c3e50;
}

.answer-input {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.3s;
}

.answer-input:focus {
  outline: none;
  border-color: #42b883;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.submit-button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: white;
  background: #42b883;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.submit-button:hover:not(:disabled) {
  background: #35a372;
}

.submit-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
