# AI Recommendations Engine - Feature Documentation

## 🎯 Overview

The AI Recommendations Engine is an intelligent feature that leverages Ollama AI to provide personalized dish suggestions based on user behavior, preferences, and context. This feature enhances user engagement by making SmartBite a proactive food companion rather than just a reactive analysis tool.

## ✨ Features

### 1. **You Might Also Like** (Similar Dishes)
**Purpose**: Suggest dishes based on user's analysis history and taste patterns.

**How it works**:
- Analyzes recent and saved analyses from localStorage
- Identifies preferred cuisines (most frequently analyzed)
- Calculates average calorie range preferences
- Uses Ollama AI to generate 6 personalized recommendations
- Each recommendation includes a match score (70-95%)

**User Experience**:
- Automatically shows when user has analyzed at least one dish
- Updates dynamically as user analyzes more dishes
- Diverse suggestions (not all from same cuisine)

### 2. **Healthier Alternatives**
**Purpose**: Suggest healthier versions or alternatives to the currently analyzed dish.

**How it works**:
- Takes the current dish's full analysis (nutrition, ingredients, cuisine)
- Requests AI to find dishes with:
  - 15-30% fewer calories
  - Better macronutrient balance
  - Healthier cooking methods (grilled vs fried)
  - More vegetables/lean proteins
- Generates 4 healthier alternatives

**User Experience**:
- Only available when a dish is currently analyzed
- Each suggestion explains what makes it healthier
- Maintains satisfaction while improving nutrition

### 3. **Seasonal Picks**
**Purpose**: Recommend dishes perfect for the current season.

**How it works**:
- Detects current month automatically
- Maps month to season (Winter, Spring, Summer, Fall)
- Identifies seasonal ingredients for that season
- Generates 5 dishes featuring seasonal produce
- Considers weather-appropriate comfort levels

**Seasonal Mappings**:
- **Winter** (Dec-Feb): Root vegetables, squash, citrus, warming spices
- **Spring** (Mar-May): Asparagus, peas, strawberries, fresh herbs
- **Summer** (Jun-Aug): Tomatoes, berries, corn, stone fruits
- **Fall** (Sep-Nov): Pumpkin, apples, mushrooms, sweet potatoes

**User Experience**:
- Always available (no prerequisites)
- Changes automatically with seasons
- Evocative descriptions of seasonal appeal

### 4. **Perfect Pairings**
**Purpose**: Suggest complementary items to enhance the current dish.

**How it works**:
- Analyzes current dish's flavor profile and cuisine
- Generates 5 pairings:
  - 2 side dishes
  - 2 beverages (wine, tea, cocktail, juice)
  - 1 dessert
- Explains pairing rationale (complements/contrasts)
- Respects cuisine traditions

**User Experience**:
- Only available when a dish is currently analyzed
- Helps complete a full meal experience
- Specific pairing explanations

## 🏗️ Architecture

### Backend Components

#### 1. **API Route**: `/app/api/recommendations/route.ts`
**Responsibilities**:
- Accept recommendation requests with type and context
- Generate AI prompts based on recommendation type
- Call Ollama API with structured prompts
- Parse and validate AI responses
- Return formatted recommendations

**Request Schema**:
```typescript
{
  type: 'similar' | 'healthier' | 'seasonal' | 'pairing',
  currentDish?: DishAnalysis,
  recentDishes?: DishAnalysis[],
  month?: number,
  offline?: boolean
}
```

**Response Schema**:
```typescript
{
  success: true,
  type: string,
  recommendations: [
    {
      dishName: string,
      cuisineType: string,
      description: string,
      reason: string,
      estimatedCalories: number,
      estimatedPrepTime: number,
      isHealthier?: boolean,
      matchScore?: number
    }
  ]
}
```

#### 2. **Database Extension**: `lib/db.ts`
**New Methods**:
- `getRecentAnalyses(limit)`: Fetch most recent analyses
- `getAnalysesByCuisine(cuisineType)`: Get analyses by cuisine
- `getAnalysesByCalorieRange(min, max)`: Filter by calorie range

**Purpose**: Support pattern recognition and recommendation generation

### Frontend Components

#### 3. **AIRecommendations Component**: `components/AIRecommendations.tsx`
**Features**:
- Four category tabs with animated selection
- Loading states with spinner and messages
- Error handling with clear messaging
- Empty states for missing prerequisites
- Beautiful card-based recommendation display
- Refresh functionality

**Props**:
```typescript
{
  currentDish?: DishAnalysis,
  darkMode: boolean,
  offline?: boolean
}
```

**Key Features**:
- Animated transitions between categories
- Staggered card animations
- Hover effects on cards
- Match scores and healthier badges
- Calorie and prep time indicators
- "Learn More" buttons (extensible)

#### 4. **Integration**: `app/analyze/page.tsx`
**Placement**:
1. **With Results**: Shows below "Recommended Dishes" section
   - Has access to current dish for healthier/pairing
   - All 4 categories available

2. **Without Results**: Shows in separate card
   - Only "Similar" and "Seasonal" categories available
   - Encourages user to analyze dishes

## 🎨 UI/UX Design

### Visual Design
- **Color-coded categories**: Each recommendation type has unique gradient
- **Icon system**: Sparkles, TrendingUp, Calendar, Wine icons
- **Card layout**: 3-column grid on desktop, responsive on mobile
- **Animations**: Smooth transitions, staggered reveals, hover effects

### User Flow
1. User uploads and analyzes a dish
2. Scrolls down to see AI Recommendations section
3. Sees "You Might Like" recommendations automatically loaded
4. Can switch between 4 categories using tabs
5. Each recommendation shows:
   - Dish name and cuisine
   - Description
   - Reason for recommendation
   - Calories and prep time
   - Match score or health indicator

### Interaction Patterns
- **Click category tab**: Load new recommendations
- **Click refresh**: Regenerate current category
- **Hover card**: Lift effect
- **Click "Learn More"**: (Future: Open detailed modal/page)

## 🔧 AI Prompt Engineering

### Prompt Design Principles
1. **Structured Output**: Always request JSON format
2. **Clear Schema**: Define exact response structure
3. **Context Provision**: Give AI relevant data (history, dish details)
4. **Specific Rules**: Guide AI with constraints (calorie ranges, diversity)
5. **Temperature Control**: 
   - 0.3 for analysis (accuracy)
   - 0.7 for recommendations (creativity)

### Example Prompt (Similar Dishes)
```
You are a food recommendation AI. Based on user's recent dish analyses, suggest 6 dishes they might enjoy.

Recent dishes: Pizza (Italian, 450 cal), Tacos (Mexican, 380 cal)
Preferred cuisines: Italian, Mexican, Asian
Average calorie range: 300-500 cal

STRICT JSON SCHEMA:
{
  "recommendations": [
    {
      "dishName": string,
      "cuisineType": string,
      "description": string (why user would like this),
      "reason": string (connection to their history),
      "estimatedCalories": number,
      "estimatedPrepTime": number,
      "matchScore": number (70-95)
    }
  ]
}

Rules:
- Suggest diverse dishes
- Consider calorie preferences
- Make descriptions appetizing
- Output ONLY valid JSON
```

## 📊 Data Flow

### Similar Dishes Flow
```
localStorage (recent/saved) 
  → Parse to DishAnalysis[] 
  → Extract patterns (cuisine frequency, avg calories)
  → Generate AI prompt with context
  → Call /api/recommendations
  → Ollama processes with creativity
  → Return 6 recommendations
  → Display with match scores
```

### Healthier Alternatives Flow
```
Current dish analysis
  → Extract full nutrition and ingredients
  → Generate health-focused prompt
  → Call /api/recommendations
  → Ollama finds healthier versions
  → Validate calorie reduction (15-30%)
  → Return 4 alternatives
  → Display with health badges
```

### Seasonal Picks Flow
```
Get current month
  → Map to season
  → Load seasonal ingredients
  → Generate season-specific prompt
  → Call /api/recommendations
  → Ollama suggests seasonal dishes
  → Return 5 recommendations
  → Display with seasonal context
```

### Pairing Recommendations Flow
```
Current dish analysis
  → Extract cuisine and flavor profile
  → Generate pairing-focused prompt
  → Call /api/recommendations
  → Ollama suggests: 2 sides, 2 drinks, 1 dessert
  → Explain pairing rationale
  → Return 5 pairings
  → Display with pairing explanations
```

## 🚀 Future Enhancements

### Phase 2 Features
1. **Dietary Filters**
   - Vegetarian/Vegan only
   - Gluten-free
   - Low-carb/Keto
   - Allergen exclusions

2. **Learning & Personalization**
   - Track which recommendations users save
   - Learn from dismissed recommendations
   - Build taste profile over time
   - Weighted preference scoring

3. **Social Features**
   - Share recommendations
   - Community favorites
   - Trending dishes in your area

4. **Advanced Pairings**
   - Wine temperature suggestions
   - Serving tips
   - Plating ideas
   - Meal planning integration

5. **Recommendation History**
   - Save favorite recommendations
   - "Try later" list
   - Recommendation feedback (liked/disliked)

6. **Contextual Recommendations**
   - Time of day (breakfast suggestions in morning)
   - Weather-based (comfort food on rainy days)
   - Occasion-based (party foods, date night)
   - Budget-conscious options

### Technical Improvements
1. **Caching Layer**
   - Cache recommendations by pattern hash
   - Reduce API calls for similar requests
   - Faster response times

2. **Recommendation Score Refinement**
   - Machine learning for better match scores
   - A/B testing different prompts
   - User feedback loop

3. **Performance Optimization**
   - Preload "Similar" recommendations
   - Background fetch for other categories
   - Debounced refresh

## 📝 Testing Recommendations

### Manual Testing Scenarios

#### Test 1: Similar Dishes
1. Analyze 3-5 different dishes
2. Navigate to AI Recommendations
3. Verify "Similar" category loads automatically
4. Check that recommendations:
   - Include diverse cuisines
   - Have match scores 70-95%
   - Reference user's history in reasons

#### Test 2: Healthier Alternatives
1. Analyze a high-calorie dish (e.g., burger, pizza)
2. Switch to "Healthier Alternatives" tab
3. Verify all suggestions:
   - Have lower calories (15-30% reduction)
   - Include health improvement explanation
   - Show healthier badge
   - Are still appetizing

#### Test 3: Seasonal Picks
1. Navigate to AI Recommendations (with or without dish)
2. Switch to "Seasonal Picks" tab
3. Verify recommendations:
   - Match current season (Fall - October)
   - Mention seasonal ingredients
   - Have seasonal themes in descriptions

#### Test 4: Perfect Pairings
1. Analyze a main dish
2. Switch to "Perfect Pairings" tab
3. Verify recommendations include:
   - 2 side dishes
   - 2 beverages
   - 1 dessert
   - Specific pairing explanations

#### Test 5: Empty States
1. Clear all localStorage data
2. Go to analyze page without analyzing a dish
3. Check "Similar" shows appropriate message
4. Verify "Seasonal" still works
5. Check "Healthier" and "Pairing" show dish requirement message

#### Test 6: Loading States
1. Click any category tab
2. Observe loading spinner and message
3. Verify smooth transition to results

#### Test 7: Error Handling
1. Stop Ollama service
2. Try to load recommendations
3. Verify error message displays clearly
4. Restart Ollama
5. Click refresh to recover

### API Testing
```bash
# Test Similar Dishes
curl -X POST http://localhost:3000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "type": "similar",
    "recentDishes": [
      {
        "dishName": "Pizza",
        "cuisineType": "Italian",
        "ingredients": ["flour", "cheese", "tomato"],
        "nutrition": {"calories": 450, "protein_g": 20, "carbs_g": 50, "fat_g": 15}
      }
    ],
    "offline": true
  }'

# Test Healthier Alternatives
curl -X POST http://localhost:3000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "type": "healthier",
    "currentDish": {
      "dishName": "Cheeseburger",
      "cuisineType": "American",
      "ingredients": ["beef", "cheese", "bread", "lettuce"],
      "nutrition": {"calories": 550, "protein_g": 30, "carbs_g": 45, "fat_g": 25}
    },
    "offline": true
  }'
```

## 🐛 Known Limitations

1. **AI Dependency**: Requires Ollama to be running
2. **Response Time**: Can take 3-10 seconds depending on model
3. **Accuracy**: AI recommendations are estimates, not guaranteed
4. **History Required**: Similar dishes needs at least 1 analyzed dish
5. **No Persistence**: Recommendations not saved, generated fresh each time
6. **Language**: Currently English only

## 💡 Best Practices

### For Users
- Analyze diverse dishes to get better "Similar" recommendations
- Try all 4 categories to discover different suggestions
- Use refresh if recommendations don't appeal
- Save dishes you want to try from recommendations

### For Developers
- Monitor Ollama response times
- Implement timeout handling (30s recommended)
- Cache common seasonal recommendations
- Log failed recommendations for debugging
- Test with various dish types
- Validate AI responses strictly

## 📚 Related Documentation
- [API Documentation](./api-documentation.md)
- [Frontend Architecture](./frontend-architecture.md)
- [Database Schema](./database-schema.md)
- [System Overview](./system-overview.md)

---

**Created**: October 26, 2025
**Version**: 1.0.0
**Author**: SmartBite Development Team
