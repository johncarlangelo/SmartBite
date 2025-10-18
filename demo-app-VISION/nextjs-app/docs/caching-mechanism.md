# Caching Mechanism

## Overview

SmartBite implements a sophisticated caching mechanism to provide instant results for previously analyzed images and reduce redundant AI processing. The system uses SHA-256 hashing for image identification and SQLite for persistent storage.

## How It Works

### 1. Image Hashing

When a user uploads an image, the system generates a SHA-256 hash of the image data:

```typescript
import { createHash } from 'crypto';

generateImageHash(buffer: ArrayBuffer): string {
  return createHash('sha256').update(Buffer.from(buffer)).digest('hex');
}
```

This hash serves as a unique identifier for the image content, ensuring that even if the same image is uploaded with a different filename, it will be recognized as a duplicate.

### 2. Cache Check Process

The caching workflow follows these steps:

1. User uploads an image
2. Frontend sends image to `/api/check-cache` endpoint
3. Server generates SHA-256 hash of the image
4. Server queries SQLite database for existing analysis with the same hash
5. If found, return cached results immediately
6. If not found, proceed with AI analysis

### 3. Database Storage

Results are stored in a SQLite database with the following schema:

```sql
CREATE TABLE IF NOT EXISTS analyses (
  id TEXT PRIMARY KEY,
  imageHash TEXT UNIQUE NOT NULL,
  analysis TEXT NOT NULL,
  createdAt TEXT NOT NULL
)
```

- **id**: Unique identifier for the analysis record
- **imageHash**: SHA-256 hash of the image content
- **analysis**: JSON string of the analysis results
- **createdAt**: Timestamp of when the analysis was performed

## API Endpoints

### Check Cache (`/api/check-cache`)

**Method**: POST
**Purpose**: Check if an image has been previously analyzed

**Request**:
```
Content-Type: multipart/form-data
Body: image file
```

**Responses**:
```javascript
// Cache hit
{
  "cached": true,
  "analysis": { /* analysis results */ },
  "id": "unique-id",
  "createdAt": "timestamp"
}

// Cache miss
{
  "cached": false,
  "imageHash": "sha256-hash"
}
```

### Analyze Image (`/api/analyze-image`)

**Method**: POST
**Purpose**: Process image with AI and optionally cache results

**Request**:
```
Content-Type: multipart/form-data
Body: image file, offline flag, imageHash (optional)
```

**Responses**:
```javascript
// Success
{
  /* analysis results */
}

// Error
{
  "error": "error message"
}
```

## Benefits

### Performance
- Instant results for previously analyzed images
- Eliminates 20+ second wait times for known images
- Reduces load on Ollama service

### Consistency
- Guaranteed identical results for the same image
- No variance in AI interpretation for duplicates
- Reliable user experience

### Resource Efficiency
- Reduced AI processing requirements
- Lower computational costs
- Decreased energy consumption

## Implementation Details

### Database Service (`lib/db.ts`)

The database service handles all interactions with the SQLite database:

```typescript
class DatabaseService {
  // Generate SHA-256 hash of image buffer
  generateImageHash(buffer: ArrayBuffer): string
  
  // Save analysis result with image hash
  saveAnalysis(imageHash: string, analysis: any): string
  
  // Find analysis by image hash
  findAnalysisByImageHash(imageHash: string): AnalysisRecord | null
  
  // Get analysis by ID
  getAnalysisById(id: string): AnalysisRecord | null
}
```

### Frontend Integration

The frontend automatically checks the cache before initiating AI analysis:

```typescript
const checkCache = async (file: File): Promise<{ cached: boolean; analysis?: any; imageHash?: string }> => {
  // Send to /api/check-cache endpoint
  // Return cached results or image hash for analysis
}

const analyzeImage = async () => {
  // Check cache first
  const cacheResult = await checkCache(fileObj)
  
  if (cacheResult.cached) {
    // Use cached results
    setResult(cacheResult.analysis)
  } else {
    // Proceed with AI analysis
    // Include imageHash in analysis request for caching
  }
}
```

## Future Improvements

1. **Cache Expiration**: Implement TTL for cached results to handle menu changes
2. **Distributed Caching**: Use Redis for multi-server deployments
3. **Image Preprocessing**: Normalize images before hashing to improve duplicate detection
4. **Analytics**: Track cache hit rates and popular dishes