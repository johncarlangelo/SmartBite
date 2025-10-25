# Recommended Dishes Component Guide

## Overview
The `RecommendedDishes` component displays AI-powered dish recommendations based on the analyzed recipe's ingredients. It features smooth hover animations and a responsive two-column grid layout.

## Features

### 🎯 Smart Recommendations
- Analyzes main ingredients from the current recipe
- Matches against a database of related dishes
- Returns 4-8 contextually relevant recommendations
- Fallback to general recommendations if no matches found

### 🎨 Visual Design
- **Dark theme compatible** - Adapts to SmartBite's theme toggle
- **Two-column responsive grid** - Optimized for desktop and mobile
- **Rounded corners** (`rounded-xl`) with subtle shadows
- **Gradient backgrounds** - `from-slate-800/80 to-slate-900/80` (dark mode)

### ✨ Hover Animation
Each card features a smooth expansion animation on hover:

#### Default State
- Shows dish name and description
- Fixed minimum height: `140px`

#### Hover State (Expanded)
- Smoothly expands to `180px` height
- Reveals additional information:
  - **Calories** with sun icon (e.g., "180 kcal")
  - **Cuisine type** with globe icon (e.g., "American")
- Animation duration: `0.4s` with `ease-in-out`
- Content fades in with `opacity: 0 → 1`
- Slides up with `translateY: -10px → 0`

### 🔒 Layout Stability
- **No layout shifts** - Cards use fixed `minHeight` property
- **Column integrity** - Right column cards don't move when left column is hovered
- **Grid stability** - Only the hovered card expands vertically
- **Smooth transitions** - All changes animated with `transition-all duration-500`

## Implementation Details

### Props
```typescript
type RecommendedDishesProps = {
    ingredients: string[]  // Array of ingredients from current recipe
    darkMode: boolean      // Theme toggle state
}
```

### Card Structure
Each recommendation card contains:
```typescript
type RecommendedDish = {
    name: string        // Dish name (e.g., "Hash Browns")
    description: string // Short description (always visible)
    calories: number    // Approximate calories
    cuisine: string     // Cuisine/category type
}
```

### Animation States
```typescript
// Hover state tracking
const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

// On hover: setHoveredIndex(index)
// On hover end: setHoveredIndex(null)
```

## Usage

### In analyze page:
```tsx
import RecommendedDishes from '@/components/RecommendedDishes'

// Inside results section
{result && (
  <AnimatedSection delay={0.4}>
    <RecommendedDishes 
      ingredients={result.ingredients} 
      darkMode={darkMode}
    />
  </AnimatedSection>
)}
```

## Ingredient Matching Logic

The component uses a smart matching algorithm:

1. **Extract main ingredients** - Takes first 3 ingredients from recipe
2. **Lowercase comparison** - Case-insensitive matching
3. **Database lookup** - Checks against predefined dish database
4. **Deduplication** - Removes duplicate recommendations
5. **Limit results** - Returns up to 8 unique dishes

### Example Database Entry
```typescript
'potato': [
  { 
    name: 'Hash Browns', 
    description: 'Crispy shredded potato patties, perfect for breakfast.',
    calories: 180, 
    cuisine: 'American' 
  },
  // ... more potato-based dishes
]
```

## Styling Classes

### Dark Mode Card
```css
bg-gradient-to-br from-slate-800/80 to-slate-900/80
border border-slate-700/50
shadow-md hover:shadow-xl
```

### Light Mode Card
```css
bg-gradient-to-br from-white to-gray-50
border border-gray-200
shadow-md hover:shadow-xl
```

## Animation Timings

| Element | Duration | Ease | Delay |
|---------|----------|------|-------|
| Card entry | 0.3s | default | index * 0.05s |
| Height expansion | 0.5s | ease-in-out | 0s |
| Content reveal | 0.4s | ease-in-out | 0s |
| Opacity fade | 0.4s | ease-in-out | 0s |

## Responsive Behavior

- **Mobile** (`sm`): Single column grid
- **Desktop** (`md`+): Two-column grid with `gap-4`

## Icons Used

- ⭐ Star icon - Section header
- ☀️ Sun icon - Calories indicator
- 🌐 Globe icon - Cuisine type indicator

## Future Enhancements

1. **AI Integration** - Connect to actual recommendation API
2. **Click interaction** - Navigate to recommended dish recipe
3. **Favoriting** - Save favorite recommendations
4. **More filters** - Filter by calories, cuisine type, etc.
5. **Image thumbnails** - Add dish images to cards
6. **Ingredient substitutions** - Suggest alternatives based on available ingredients

## Performance Notes

- Uses `motion.div` for smooth animations
- State-driven hover detection prevents multiple re-renders
- Fixed heights prevent layout recalculation
- Memoization-ready for larger datasets
