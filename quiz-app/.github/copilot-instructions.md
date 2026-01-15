# Vue 3 + Vite Project Copilot Instructions

## Project Overview
This is a Vue 3 application built with Vite and TypeScript. The goal is a learning-focused development experience with clear, step-by-step component building.

## Application Description
This is a **Quiz App** where players can play a matching game based on personal answers:

**Core Features:**
1. **Question Creation**: Players can create "favorite" questions (e.g., "What's your favorite movie?")
2. **Answer Phase**: Each player answers questions for themselves
3. **Quiz/Matching Phase**: Players must match answers to the correct players who gave them
4. **Multiplayer**: Eventually will connect to a server via WebSocket for real-time multiplayer gameplay

**Technical Notes:**
- This is the front-end Vue application
- Will need WebSocket integration for server communication (future feature)
- Focus on building reusable components for questions, answers, and quiz gameplay

## Development Philosophy
- **Learning First**: Go slow, explain each step, build one component at a time
- **Idiomatic TypeScript**: Use modern, type-safe patterns and best practices
- **Vue 3 Composition API**: Leverage the modern Vue 3 Composition API with `<script setup>` syntax
- **Single File Components**: Use `.vue` files with modern structure and conventions

## TypeScript Standards
- Use strict type checking
- Prefer composition functions for reusable logic
- Use generics where appropriate for type safety
- Avoid `any` types; use explicit types
- Leverage Vue's type utilities (`Ref`, `Computed`, `PropType`, etc.)

## Component Development Process
When creating components:
1. Explain the component's purpose clearly
2. Show the component structure step-by-step
3. Explain props, events, and reactive state
4. Provide usage examples
5. Discuss how it fits into the overall app

## Code Style
- Use `<script setup>` syntax for components
- Use TypeScript interfaces for prop types
- Prefer composition functions for shared logic
- Keep components focused and single-responsibility
- Use descriptive variable and function names
- Add JSDoc comments for complex logic

## Project Structure
```
src/
├── components/        # Reusable Vue components
├── views/            # Page-level components
├── composables/      # Reusable composition functions
├── types/            # TypeScript type definitions
├── assets/           # Static assets
└── App.vue           # Root component
```

## Build Tool
- **Vite**: Fast development server and optimized builds
- **npm scripts**: Use `npm run dev`, `npm run build`, `npm run preview`

## When Adding Features
- Explain the "why" before the "how"
- Build components incrementally
- Test each component as it's created
- Document component APIs clearly
- Keep commits/changes atomic and focused
