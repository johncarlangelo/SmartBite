# Frontend Architecture

## Overview

The SmartBite frontend is built with Next.js 14 using the App Router, TypeScript, and Tailwind CSS. The architecture follows a component-based approach with a focus on user experience and performance.

## File Structure

```
app/
├── page.tsx              # Main application page
├── layout.tsx            # Root layout
├── globals.css           # Global styles
├── api/
│   ├── analyze-image/
│   │   └── route.ts      # Image analysis API endpoint
│   └── check-cache/
│       └── route.ts      # Cache check API endpoint
├── components/
│   └── AnimatedList.tsx  # Reusable animated list component
lib/
├── db.ts                 # Database service
├── utils.ts              # Utility functions
```

## Main Page Component (`app/page.tsx`)

The main page component is a single-file React component that handles all UI logic and state management.

### State Management

The component uses React hooks for state management:

```typescript
const [selectedImage, setSelectedImage] = useState<string | null>(null)
const [fileObj, setFileObj] = useState<File | null>(null)
const [result, setResult] = useState<AnalysisResult | null>(null)
const [error, setError] = useState<string | null>(null)
const [isAnalyzing, setIsAnalyzing] = useState(false)
const [offline, setOffline] = useState(true)
const [darkMode, setDarkMode] = useState(true)
const [progress, setProgress] = useState(0)
const [analysisStage, setAnalysisStage] = useState('')
const [savedSuccess, setSavedSuccess] = useState(false)
const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([])
const [showHistory, setShowHistory] = useState(false)
const [unreadCount, setUnreadCount] = useState(0)
const [isFromHistory, setIsFromHistory] = useState(false)
const [isFromCache, setIsFromCache] = useState(false)
```

### Key Functions

#### Image Handling
- `onFilesSelected()`: Processes selected files and validates file types
- `handleFileInput()`: Handles file input changes
- `handleDrop()`: Handles drag and drop events
- `handleDragOver()`: Prevents default drag over behavior

#### Analysis Workflow
- `checkCache()`: Checks if image has been previously analyzed
- `analyzeImage()`: Main analysis function that orchestrates the process
- `saveAnalysis()`: Saves analysis to user history
- `loadSavedAnalysis()`: Loads a saved analysis from history

#### UI Functions
- `toggleTheme()`: Switches between dark and light mode
- `handleOpenHistory()`: Opens the history modal
- `handleCloseHistory()`: Closes the history modal
- `deleteSavedAnalysis()`: Removes an analysis from history

### Components

#### Animated Components
- `AnimatedHistoryItem`: Animates history items when they come into view
- `AnimatedSection`: Animates result sections when they come into view

#### UI Sections
1. **Header**: Contains title, history button, and theme toggle
2. **Upload Panel**: Handles image upload and analysis initiation
3. **Results Panel**: Displays analysis results with animated sections
4. **History Modal**: Shows saved analyses with load/delete functionality
5. **Footer**: Contains project information

## Styling

### Tailwind CSS
The application uses Tailwind CSS for styling with a utility-first approach:

- Responsive design with grid and flexbox
- Dark/light mode support with conditional classes
- Glassmorphism effects with backdrop blur
- Gradient backgrounds
- Animated transitions and hover effects

### Theme Management
Dark/light mode is implemented with:
- State variable to track current theme
- localStorage persistence
- Conditional CSS classes based on theme state
- Theme toggle button in header

### Custom Animations
- Motion animations for result sections
- Progress bar animations
- Loading indicators
- History item animations

## Performance Optimizations

### Memoization
- `useMemo` for static values like header text
- `useCallback` for event handlers to prevent unnecessary re-renders

### Lazy Loading
- Animation libraries loaded only when needed
- Conditional rendering of components based on state

### Code Splitting
- Components split into logical sections
- Animation components separated for reusability

## Accessibility

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Proper focus management
- Semantic HTML elements

### Screen Reader Support
- Proper heading hierarchy
- ARIA labels for icons
- Descriptive text for interactive elements

### Color Contrast
- Sufficient contrast for text in both light and dark modes
- Colorblind-friendly color schemes

## Responsive Design

### Breakpoints
- Mobile-first design approach
- Responsive grid layouts
- Adaptive component sizing
- Touch-friendly interface elements

### Device Support
- Works on mobile, tablet, and desktop
- Orientation changes handled gracefully
- Touch and mouse interactions supported

## Error Handling

### User-Friendly Messages
- Clear error messages for different failure scenarios
- Visual indication of errors
- Recovery options (upload another image)

### Debug Information
- Console logging for development
- Error boundaries for catastrophic failures
- Detailed error messages in development mode

## Data Persistence

### localStorage
- Theme preference
- Saved analyses
- Unread count for history

### Server-Side Caching
- SQLite database for analysis results
- Automatic cache checking before analysis
- Instant retrieval of cached results

## Future Improvements

1. **Component Splitting**: Break down the large page component into smaller, more manageable components
2. **State Management**: Implement a more robust state management solution like Zustand or Redux for complex state
3. **Testing**: Add unit and integration tests for components and functions
4. **Internationalization**: Add support for multiple languages
5. **Performance Monitoring**: Implement performance tracking and optimization