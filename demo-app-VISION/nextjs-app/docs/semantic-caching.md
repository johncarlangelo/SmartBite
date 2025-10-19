# Semantic Caching Implementation

## Overview

This document explains the implementation of semantic caching in the SmartBite application. Semantic caching allows the system to recognize the same dish even when different images are used, providing consistent analysis results and improving user experience.

## How It Works

### 1. Database Schema Enhancement

The database schema was enhanced to include a `dishName` field alongside the existing `imageHash`:

```sql
CREATE TABLE IF NOT EXISTS analyses (
  id TEXT PRIMARY KEY,
  imageHash TEXT UNIQUE NOT NULL,
  dishName TEXT NOT NULL,
  analysis TEXT NOT NULL,
  createdAt TEXT NOT NULL
)
```

### 2. Two-Level Caching Strategy

The caching system implements a two-level approach:

1. **Exact Match**: First checks if the exact same image has been analyzed before using SHA-256 hashing
2. **Semantic Match**: If no exact match is found, performs a lightweight AI analysis to identify the dish name and searches for previously analyzed dishes with similar names

### 3. Cache Check Process

1. When an image is uploaded, the system first generates a SHA-256 hash
2. It checks the database for an exact match using the image hash
3. If no exact match is found, it performs a lightweight AI analysis to extract just the dish name
4. It then searches the database for semantic matches using the dish name
5. If a semantic match is found, it returns the cached analysis
6. If no matches are found, it performs a full analysis

### 4. Frontend Integration

The frontend now displays different cache indicators:
- Exact match: "Loaded from cache! Analysis retrieved instantly."
- Semantic match: "Semantic match found! Similar dish detected: [dish name]"

## Key Components

### Database Service (`lib/db.ts`)

- Added `dishName` field to the `AnalysisRecord` type
- Modified `saveAnalysis` method to accept and store dish name
- Added `findAnalysisByDishName` method for semantic matching

### Cache Check API (`app/api/check-cache/route.ts`)

- Implements two-level caching strategy
- Uses lightweight AI prompt to extract dish name for semantic matching
- Returns cache type information to frontend

### Analysis API (`app/api/analyze-image/route.ts`)

- Updated to pass dish name to the database service when saving results

### Frontend (`app/page.tsx`)

- Added state variables to track cache type and matched dish name
- Updated UI to display appropriate cache indicators
- Modified cache check function to handle new response format

## Benefits

1. **Improved User Experience**: Users get instant results for previously analyzed dishes
2. **Reduced AI Processing**: Eliminates redundant analysis of the same dishes
3. **Cross-Image Consistency**: Same dish recognition regardless of image differences
4. **Bandwidth Savings**: Reduced API calls to Ollama service

## Error Handling

The implementation includes robust error handling:
- If semantic matching fails, the system falls back to full analysis
- Cache check failures don't prevent image analysis
- Database errors are properly logged and handled

## Testing

To test the semantic caching:

1. Upload and analyze an image of a dish
2. Upload a different image of the same dish
3. Verify that the second analysis loads from semantic cache
4. Check that the analysis results are consistent between images

## Future Improvements

Potential enhancements for future versions:
- Implement fuzzy string matching algorithms for better semantic matching
- Add confidence scoring for semantic matches
- Implement user feedback mechanisms to improve matching accuracy
- Add support for multiple semantic matches with user selection