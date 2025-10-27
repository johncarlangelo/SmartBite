# Recipe Modal Feature

## Overview
The Recipe Modal provides detailed recipe information when users click "Learn More" on AI-recommended dishes. It uses a hybrid approach combining AI-generated recipes with external search options.

## Architecture Decision

### Approach: On-Demand Generation + Caching
- **Generate on Click**: Recipe details are generated only when the user clicks "Learn More"
- **Cache in State**: Once generated, the recipe is cached in the modal's state
- **No Re-generation**: Closing and reopening the modal for the same dish uses cached data

### Why This Approach?
1. **Efficiency**: Don't generate unused recipes (user may not click all buttons)
2. **Speed**: Only one recipe generation at a time, no parallel processing overhead
3. **Resource Usage**: Reduces API calls to Ollama
4. **User Experience**: Fast initial load, instant subsequent opens

## Components

### 1. Recipe Generation API (`/app/api/generate-recipe/route.ts`)
- **Method**: POST
- **Input**: `{ dishName: string, cuisineType: string }`
- **Output**: Detailed recipe with ingredients, instructions, nutrition, tips
- **Model**: Uses `llama3.2:3b` (fast text generation)
- **Timeout**: 120 seconds with AbortController
- **Format**: Strict JSON schema for consistent parsing

### 2. Recipe Modal Component (`/components/RecipeModal.tsx`)
**Features**:
- Two-tab interface:
  - **AI Recipe Tab**: Shows generated recipe details
  - **Find Online Tab**: External search links (Google, YouTube, AllRecipes)
- Loading animation while generating
- Error handling with retry option
- Responsive design with glassmorphism
- Close on backdrop click or X button

**State Management**:
```typescript
const [recipe, setRecipe] = useState<Recipe | null>(null)
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
```

**Caching Logic**:
- First open: `recipe === null` → Trigger generation
- Subsequent opens: `recipe !== null` → Use cached data
- Cache persists until modal unmounts

### 3. Integration in AIRecommendations (`/components/AIRecommendations.tsx`)
**State**:
```typescript
const [selectedDish, setSelectedDish] = useState<{name: string, cuisine: string} | null>(null)
```

**Button Handler**:
```typescript
<button onClick={() => setSelectedDish({ 
  name: rec.dishName, 
  cuisine: rec.cuisineType 
})}>
  Learn More
</button>
```

**Modal**:
```typescript
<RecipeModal
  isOpen={selectedDish !== null}
  onClose={() => setSelectedDish(null)}
  dishName={selectedDish?.name || ''}
  cuisineType={selectedDish?.cuisine || ''}
/>
```

## User Flow

1. User views AI recommendations (3 categories pre-loaded)
2. User clicks "Learn More" on a recommended dish
3. Modal opens with loading animation
4. API generates detailed recipe using llama3.2:3b (~5-10 seconds)
5. Recipe displays with ingredients, instructions, nutrition, tips
6. User can switch to "Find Online" tab for external search links
7. User closes modal
8. If user reopens same dish, cached recipe displays instantly

## Benefits

### Performance
- Fast initial load (no pre-generation overhead)
- Instant category switching (recipes generated on-demand)
- Efficient resource usage (only generate what's needed)

### User Experience
- Professional loading states with animations
- Hybrid approach: AI details + external options
- Smooth transitions and interactions
- Error handling with retry functionality

### Maintainability
- Clear separation of concerns (API, Modal, Integration)
- Type-safe TypeScript interfaces
- Consistent error handling patterns
- Well-documented code structure

## Technical Details

### API Request Format
```json
{
  "dishName": "Grilled Salmon Bowl",
  "cuisineType": "Modern Fusion"
}
```

### API Response Format
```json
{
  "success": true,
  "recipe": {
    "dishName": "Grilled Salmon Bowl",
    "cuisineType": "Modern Fusion",
    "description": "...",
    "prepTime": "15 minutes",
    "cookTime": "20 minutes",
    "servings": 2,
    "difficulty": "Medium",
    "ingredients": [...],
    "instructions": [...],
    "nutrition": {...},
    "tips": [...]
  }
}
```

### Error Handling
- **Timeout**: 120s abort with friendly message
- **API Errors**: Display error with retry button
- **Network Issues**: Graceful degradation to external search
- **JSON Parse Errors**: Fallback error handling

## Future Enhancements

### Potential Improvements
1. **Persistent Caching**: Store recipes in localStorage/database
2. **Favorite Recipes**: Allow users to save recipes
3. **Share Functionality**: Export or share recipe details
4. **Print Layout**: Optimized print view for recipes
5. **Ingredient Substitutions**: AI-suggested alternatives
6. **Nutrition Calculator**: Adjust for serving sizes

### Performance Optimizations
1. **Background Pre-fetch**: Pre-generate for likely clicks
2. **Service Worker**: Offline recipe viewing
3. **Compression**: Reduce recipe JSON payload size
4. **Streaming**: Stream recipe generation in real-time

## Testing Checklist

- [ ] Click "Learn More" on each recommendation type
- [ ] Verify loading animation appears
- [ ] Check recipe generates with all sections
- [ ] Test caching (close and reopen modal)
- [ ] Switch between AI Recipe and Find Online tabs
- [ ] Click external search links
- [ ] Test error handling (stop Ollama, trigger timeout)
- [ ] Verify responsive design on mobile
- [ ] Test keyboard navigation (Esc to close)
- [ ] Check backdrop click closes modal

## Summary

The Recipe Modal feature completes the AI Recommendations Engine by providing detailed, actionable information about recommended dishes. The on-demand generation approach balances performance, user experience, and resource efficiency, while the hybrid AI + external search design gives users flexibility in how they explore recipes.
