# API Documentation

## Overview

SmartBite exposes two primary API endpoints for image analysis and caching functionality. All APIs are implemented as Next.js API routes.

## Endpoints

### 1. Check Cache (`/api/check-cache`)

Determines if an image has been previously analyzed and returns cached results if available.

#### Endpoint
```
POST /api/check-cache
```

#### Request
```
Content-Type: multipart/form-data

Form Data:
- image: File (required) - The image to check for cached analysis
```

#### Responses

**200 - Cache Hit**
```json
{
  "cached": true,
  "analysis": {
    "dishName": "Vegetable Stir Fry",
    "cuisineType": "Asian",
    "ingredients": ["broccoli", "carrots", "bell peppers", "soy sauce"],
    "nutrition": {
      "calories": 150,
      "protein_g": 5,
      "carbs_g": 20,
      "fat_g": 8
    },
    "recipe": {
      "servings": 2,
      "prepMinutes": 15,
      "cookMinutes": 10,
      "steps": ["Chop vegetables", "Heat oil in wok", "Stir fry vegetables"]
    }
  },
  "id": "abc123",
  "createdAt": "2023-05-01T12:00:00Z"
}
```

**200 - Cache Miss**
```json
{
  "cached": false,
  "imageHash": "a1b2c3d4e5f6..."
}
```

**400 - Bad Request**
```json
{
  "error": "No image file provided"
}
```

**500 - Server Error**
```json
{
  "error": "Failed to check cache",
  "details": "Error message"
}
```

### 2. Analyze Image (`/api/analyze-image`)

Processes an image using the LLaVA AI model and optionally caches the results.

#### Endpoint
```
POST /api/analyze-image
```

#### Request
```
Content-Type: multipart/form-data

Form Data:
- image: File (required) - The image to analyze
- offline: String (optional) - "true" for offline mode, "false" for online mode
- imageHash: String (optional) - SHA-256 hash for caching results
```

#### Responses

**200 - Success**
```json
{
  "dishName": "Vegetable Stir Fry",
  "cuisineType": "Asian",
  "ingredients": ["broccoli", "carrots", "bell peppers", "soy sauce"],
  "nutrition": {
    "calories": 150,
    "protein_g": 5,
    "carbs_g": 20,
    "fat_g": 8
  },
  "recipe": {
    "servings": 2,
    "prepMinutes": 15,
    "cookMinutes": 10,
    "steps": ["Chop vegetables", "Heat oil in wok", "Stir fry vegetables"]
  }
}
```

**400 - Bad Request**
```json
{
  "error": "No image file provided"
}
```

**415 - Unsupported Media Type**
```json
{
  "error": "Unsupported file type. Use PNG or JPG/JPEG."
}
```

**422 - Not Food**
```json
{
  "error": "This image does not appear to be a dish/meal. Please upload a food photo.",
  "isFood": false,
  "confidenceFood": 0.3
}
```

**500 - Server Error**
```json
{
  "error": "Failed to analyze image",
  "details": "Error message"
}
```

## Data Models

### AnalysisResult
```typescript
type Nutrition = {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

type AnalysisResult = {
  dishName: string
  cuisineType: string
  ingredients: string[]
  nutrition: Nutrition
  recipe: {
    servings: number
    prepMinutes: number
    cookMinutes: number
    steps: string[]
  }
  isFood?: boolean
  confidenceFood?: number
}
```

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "error": "Human-readable error message",
  "details": "Technical details (optional)"
}
```

HTTP status codes:
- 200: Success
- 400: Bad Request
- 415: Unsupported Media Type
- 422: Unprocessable Entity (image is not food)
- 500: Internal Server Error

## Rate Limiting

Currently, there is no rate limiting implemented. In production, consider implementing rate limiting to prevent abuse.

## Authentication

The API does not require authentication as it's designed for local use with the Ollama service.

## Environment Variables

The API uses the following environment variables:

- `OLLAMA_BASE_URL`: Base URL for the Ollama service (default: http://localhost:11434)
- `OLLAMA_VISION_MODEL`: Model to use for offline analysis (default: llava:7b)
- `OLLAMA_ONLINE_MODEL`: Model to use for online analysis (default: llava:7b)