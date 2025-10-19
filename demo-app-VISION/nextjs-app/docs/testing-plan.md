# Semantic Caching Testing Plan

## Overview

This document outlines the testing plan for the semantic caching feature in the SmartBite application. The plan covers functional testing, edge cases, and error handling scenarios.

## Test Scenarios

### 1. Exact Match Caching

**Objective**: Verify that identical images are recognized and cached correctly.

**Steps**:
1. Upload an image of a dish (e.g., "Chicken Caesar Salad")
2. Allow the system to analyze and cache the result
3. Upload the exact same image again
4. Verify that the result is loaded from cache (indicated by cache message)
5. Confirm that the analysis time is significantly reduced

**Expected Results**:
- Cache indicator shows "Loaded from cache! Analysis retrieved instantly."
- Analysis time is under 1 second
- Results are identical to the original analysis

### 2. Semantic Match Caching

**Objective**: Verify that different images of the same dish are recognized and cached correctly.

**Steps**:
1. Upload an image of a dish (e.g., "Chicken Caesar Salad" - image 1)
2. Allow the system to analyze and cache the result
3. Upload a different image of the same dish (e.g., "Chicken Caesar Salad" - image 2)
4. Verify that the result is loaded from semantic cache
5. Confirm that the analysis time is significantly reduced

**Expected Results**:
- Cache indicator shows "Semantic match found! Similar dish detected: Chicken Caesar Salad"
- Analysis time is under 3 seconds (slightly longer than exact match due to dish name extraction)
- Results are consistent with the original analysis

### 3. No Cache Match

**Objective**: Verify that new dishes are properly analyzed when no cache match exists.

**Steps**:
1. Upload an image of a dish that has never been analyzed before
2. Verify that the system performs full analysis
3. Confirm that the result is cached for future use

**Expected Results**:
- No cache indicator is displayed
- Full analysis process occurs (20+ seconds)
- Result is stored in the database with both image hash and dish name

### 4. Database Schema Verification

**Objective**: Verify that the database schema correctly stores dish names.

**Steps**:
1. Check the database schema to ensure `dishName` field exists
2. Upload a new dish and verify it's stored with the correct dish name
3. Query the database directly to confirm dish name storage

**Expected Results**:
- Database table includes `dishName` column
- All new entries include the correct dish name
- Semantic matching queries work correctly

### 5. Error Handling

**Objective**: Verify that the system gracefully handles errors during caching.

**Steps**:
1. Simulate database connection failure during cache check
2. Simulate AI service failure during semantic matching
3. Upload an image and verify the system falls back to full analysis

**Expected Results**:
- System continues with full analysis when cache check fails
- Appropriate error messages are logged
- User experience is not disrupted

## Edge Cases

### 1. Similar Dish Names

**Scenario**: Dishes with similar names (e.g., "Chicken Salad" vs "Chicken Caesar Salad")

**Expected Behavior**: 
- System should distinguish between similar but different dishes
- Each dish should maintain its own cached analysis

### 2. Special Characters in Dish Names

**Scenario**: Dish names with special characters, numbers, or unicode

**Expected Behavior**:
- Database storage and retrieval works correctly
- Semantic matching handles special characters appropriately

### 3. Very Long Dish Names

**Scenario**: Dish names that exceed typical length limits

**Expected Behavior**:
- Database storage accommodates long dish names
- No truncation or data loss occurs

### 4. Empty or Invalid Dish Names

**Scenario**: AI returns empty or invalid dish names

**Expected Behavior**:
- System falls back to full analysis
- No database errors occur

## Performance Testing

### 1. Cache Lookup Time

**Objective**: Measure the performance improvement of caching.

**Metrics**:
- Exact match cache lookup: < 100ms
- Semantic match cache lookup: < 500ms
- Full analysis: ~20 seconds

### 2. Database Query Performance

**Objective**: Ensure database queries remain performant with large datasets.

**Metrics**:
- Database size: Up to 10,000 entries
- Query response time: < 100ms for both exact and semantic matches

## Integration Testing

### 1. Frontend Integration

**Objective**: Verify frontend correctly displays cache information.

**Tests**:
- Cache indicators display correctly for exact matches
- Cache indicators display correctly for semantic matches
- UI remains responsive during cache operations

### 2. API Integration

**Objective**: Verify API endpoints work correctly with caching.

**Tests**:
- `/api/check-cache` returns correct response format
- `/api/analyze-image` properly stores dish names
- Error responses are handled gracefully

## Manual Testing Procedure

### Test 1: Exact Match Caching
1. Start the application with `npm run dev`
2. Navigate to the application in browser
3. Upload a food image (note the dish name)
4. Wait for analysis to complete
5. Upload the exact same image again
6. Observe cache indicator and response time

### Test 2: Semantic Match Caching
1. Upload a food image (e.g., "Spaghetti Bolognese" - image 1)
2. Wait for analysis to complete
3. Upload a different image of the same dish (e.g., "Spaghetti Bolognese" - image 2)
4. Observe semantic cache indicator and response time
5. Compare results between the two analyses

### Test 3: No Cache Match
1. Upload a food image that hasn't been analyzed before
2. Verify full analysis occurs
3. Upload the same image again to confirm caching works

## Automated Testing

### Unit Tests
- Database service methods
- Cache check API endpoint
- Analysis API endpoint

### Integration Tests
- End-to-end cache workflow
- Error handling scenarios
- Database operations

## Validation Criteria

### Success Criteria
- [ ] Exact match caching works correctly
- [ ] Semantic match caching works correctly
- [ ] System falls back to full analysis when needed
- [ ] Database schema correctly stores dish names
- [ ] Frontend displays appropriate cache indicators
- [ ] Error handling works properly
- [ ] Performance meets requirements

### Failure Criteria
- Cache returns incorrect analysis results
- System crashes during cache operations
- Database errors occur during normal operation
- User experience is degraded by caching implementation

## Rollback Plan

If issues are discovered during testing:

1. Revert database schema changes
2. Restore original API implementations
3. Remove semantic caching frontend components
4. Document issues and create bug reports
5. Plan fixes for next release

## Test Environment

- Node.js version: 18+
- Ollama with LLaVA model
- SQLite database
- Modern web browser (Chrome, Firefox, Safari)