# System Overview

## Introduction

SmartBite is an AI-powered food analysis application that uses a sophisticated 3-stage AI pipeline to identify dishes, analyze nutrition, generate recipes, and provide intelligent recommendations. The system combines modern web technologies with local AI processing (Ollama) to deliver a seamless, privacy-focused experience.

## AI Model Pipeline (3-Stage Architecture)

### Stage 1: Vision Analysis (llava:7b)
**Purpose:** Image recognition ONLY  
**Task:** Identify the dish from an uploaded image  
**Output:**
- Dish name (e.g., "Spaghetti Carbonara")
- Cuisine type (e.g., "Italian", "Thai", "American")
- Food validation & confidence score

**Why llava:7b?** Optimized for visual understanding, fast at identifying food items.

### Stage 2: Detailed Content Generation (llama3.2:3b)
**Purpose:** Generate ALL detailed text content  
**Input:** Dish name + cuisine type from Stage 1  
**Output:**
- **Nutrition Facts:** Calories, protein, carbs, fat
- **Ingredients:** 8-12 specific ingredients
- **Recipe:** Servings, prep/cook time, detailed steps
- **Dietary Tags:** High protein, gluten status, dairy status, vegan, keto, halal
- **Health Scores:** Overall health (0-100), macro balance (0-100), diet friendliness (0-100)

**Why llama3.2?** Optimized for text generation and reasoning, produces detailed accurate content with intelligent dietary analysis.

### Stage 3: Recommendations (llama3.2:3b)
**Purpose:** Intelligent food suggestions  
**Input:** Analysis results + user history  
**Output:** 4-6 recommendations (similar dishes, healthier alternatives, seasonal suggestions, pairings)

**Why llama3.2?** Excellent at reasoning and creative suggestions.

## Key Features

1. **Image Upload and Preview**
   - Drag-and-drop interface for PNG, JPG, JPEG files
   - Real-time image preview using FileReader API
   - File type validation and error handling

2. **AI Image Analysis**
   - **Stage 1 (Vision):** llava:7b identifies dish name & cuisine type
   - **Stage 2 (Text):** llama3.2:3b generates nutrition, ingredients, recipe
   - **Stage 3 (Recommendations):** llama3.2:3b creates personalized suggestions
   - Structured JSON output with validation

3. **Duplicate Detection and Caching**
   - SHA-256 image hashing for duplicate identification
   - Server-side SQLite database for persistent caching
   - Instant retrieval of previously analyzed images

4. **User Interface**
   - Responsive design with glassmorphism aesthetic
   - Dark/light mode toggle
   - History tracking of saved analyses
   - Animated transitions and loading states

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with utility-first approach
- **UI Components**: Lucide React icons, Motion for animations
- **State Management**: React hooks (useState, useEffect, etc.)

### Backend
- **Runtime**: Node.js
- **API**: Next.js API routes
- **Database**: SQLite with better-sqlite3
- **Caching**: SHA-256 image hashing

### AI Processing
- **Runtime**: Ollama for local LLM execution
- **Vision Model**: LLaVA 7B for image analysis
- **Communication**: HTTP API calls to Ollama service

## Architecture Diagram

```mermaid
graph TB
    A[User Interface] --> B{Frontend}
    B --> C[Image Upload]
    B --> D[Cache Check API]
    B --> E[Analysis API]
    B --> F[History Management]
    
    D --> G[SHA-256 Hashing]
    D --> H[(SQLite Database)]
    
    E --> I[Ollama Service]
    I --> J[LLaVA Model]
    
    H --> E
    G --> H
    
    C --> D
    C --> E
    
    F --> H
```

## Data Flow

1. **Image Upload**: User uploads a food image through the UI
2. **Cache Check**: System generates SHA-256 hash and checks database for existing analysis
3. **Cache Hit**: If found, immediately display cached results
4. **Cache Miss**: Send image to Ollama for analysis
5. **AI Processing**: Ollama processes image and returns structured data
6. **Result Display**: Show analysis results to user
7. **Caching**: Store results in database with image hash
8. **History**: Save to user history (localStorage)

## Security Considerations

- All image processing happens locally (no external services)
- User data stored in browser localStorage (client-side only)
- Cached results stored server-side in SQLite database
- No personal information collected or stored

## Performance Optimization

- Duplicate detection prevents redundant AI processing
- Server-side caching provides instant results for known images
- Client-side history for quick access to previously viewed results
- Progress indicators during AI processing