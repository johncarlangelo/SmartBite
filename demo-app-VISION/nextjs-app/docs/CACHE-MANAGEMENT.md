# Cache Management System

## Overview
Comprehensive cache management with automatic cleanup and manual clearing options for optimal storage handling.

---

## 🔄 Automatic Cache Cleaning

### 30-Day Expiry Policy
**File**: `/lib/imageCache.ts`

```typescript
static readonly CACHE_EXPIRY_DAYS = 30
```

**Features**:
- Entries older than 30 days are automatically filtered out
- Runs on every `getCache()` call to ensure clean data
- Silent cleanup - no user intervention needed
- Prevents indefinite storage growth

### Daily Cleanup Task
**Trigger**: On application load (analyze page mount)

```typescript
ImageCacheManager.autoCleanup()
```

**Behavior**:
- Checks `lastCacheCleanup` timestamp in localStorage
- Runs cleanup if more than 24 hours have passed
- Removes all entries older than 30 days
- Logs cleanup results to console
- Updates `lastCacheCleanup` timestamp

**Console Output**:
```
🔄 Running automatic cache cleanup...
✓ Automatic cleanup complete: 5 old entries removed
```

---

## 🗑️ Manual Cache Clearing

### 1. Header Quick Clear
**Location**: Analyze Page Header (top-right controls)

**Button**: 
- Icon: Database icon
- Color: Purple theme
- Tooltip: "Clear image cache to free up storage"

**Features**:
- Quick access from any page state
- Shows cache stats before clearing
- Confirmation dialog with entry count and size
- Success message after clearing

**Dialog**:
```
Clear image cache?

• Entries: 45
• Size: 234.56 KB

This will remove all cached analysis results.
You can still view recent and saved analyses.
```

### 2. Cache Stats Component
**Location**: Analyze Page (detailed stats section)

**File**: `/components/CacheStats.tsx`

#### Basic Options
1. **Clear Old (7+ days)**
   - Removes entries older than 7 days
   - Yellow button
   - Shows count before clearing

2. **Clear Old (14+ days)**
   - Removes entries older than 14 days
   - Dark yellow button
   - More conservative option

#### Advanced Options
3. **Clear by Cuisine**
   - Prompts for cuisine type (e.g., "Italian", "Chinese")
   - Searches and shows matching count
   - Clears all entries of that cuisine type

4. **Clear High Calories**
   - Prompts for calorie threshold
   - Finds entries above threshold
   - Useful for clearing unhealthy food cache

5. **Clear ALL Cache**
   - Red warning button
   - Removes all cached entries
   - Shows total cleared count

---

## 📊 Cache Statistics

### Displayed Metrics

#### Summary Cards
- **Total Cached**: Number of entries
- **Cache Size**: Storage used (KB/MB)
- **Avg Calories**: Average across all dishes
- **Cuisines**: Number of unique cuisine types

#### Detailed Stats (Show Details)

**Popular Dishes**:
```
Spaghetti Carbonara      5x
Chicken Teriyaki         3x
Caesar Salad            2x
```

**Cuisine Distribution**:
```
Italian   ████████████████░░░░  8
Asian     ██████████░░░░░░░░░░  5
American  ████████░░░░░░░░░░░░  4
```

**Cache Management Info**:
- Oldest Entry: Date + Time
- Newest Entry: Date + Time
- Auto-cleanup reminder: "Entries older than 30 days are automatically removed"

---

## 🔧 API Methods

### ImageCacheManager Methods

#### `autoCleanup()`
```typescript
ImageCacheManager.autoCleanup()
```
- Runs daily automatic cleanup
- Updates last cleanup timestamp
- Returns: void

#### `clearCache()`
```typescript
const cleared = ImageCacheManager.clearCache()
// Returns: number of entries cleared
```
- Removes ALL cache entries
- Returns count of cleared entries
- Logs action to console

#### `clearOldEntries(days: number)`
```typescript
const cleared = ImageCacheManager.clearOldEntries(7)
// Returns: number of entries cleared
```
- Removes entries older than specified days
- Returns count of cleared entries
- Logs action to console

#### `clearByCriteria(criteria)`
```typescript
const cleared = ImageCacheManager.clearByCriteria({
  olderThanDays: 14,
  cuisineType: "Italian",
  caloriesAbove: 800,
  caloriesBelow: 200
})
// Returns: number of entries cleared
```
- Flexible filtering by multiple criteria
- All criteria are optional (AND logic)
- Returns count of cleared entries

#### `getExpiredEntries()`
```typescript
const expired = ImageCacheManager.getExpiredEntries()
// Returns: CachedAnalysis[]
```
- Preview entries that will be auto-deleted
- Useful for showing user what will be removed
- Non-destructive query

#### `getCacheStats()`
```typescript
const stats = ImageCacheManager.getCacheStats()
```
- Returns comprehensive statistics object
- Includes popular dishes, cuisine distribution
- Used by CacheStats component

---

## 💾 Storage Handling

### Quota Management

**Problem**: localStorage has ~5-10MB limit
**Solution**: Multi-level protection

1. **Size Limit**: Max 100 entries per cache
2. **Auto Expiry**: 30-day rolling window
3. **Quota Error Handling**: 
   ```typescript
   catch (error) {
     if (error.name === 'QuotaExceededError') {
       this.clearOldEntries(7)  // Emergency cleanup
       // Retry save
     }
   }
   ```

### Cache Priorities

**What Gets Cleared First**:
1. Entries > 30 days old (automatic)
2. Entries beyond 100-entry limit (FIFO)
3. On quota error: Entries > 7 days old

**What Never Gets Cleared**:
- Recent analyses list (separate storage)
- Saved analyses (separate storage)
- User preferences (theme, settings)

---

## 🎯 User Experience

### Visual Indicators

1. **Cache Size Badge**: Shows current storage usage
2. **Last Cleanup Time**: Displays in stats
3. **Entry Count**: Real-time count display
4. **Confirmation Dialogs**: Always show what will be deleted
5. **Success Messages**: Confirm action completion

### Smart Defaults

- **Auto-cleanup**: Runs silently in background
- **7-day clear**: Conservative first option
- **14-day clear**: Medium option
- **30-day expiry**: Maximum retention
- **Confirmation**: Always required for manual clear

### Error Prevention

1. **Empty Cache Check**: Alert if already empty
2. **No Matches Check**: Alert if filter finds nothing
3. **Undo Warning**: Cannot undo cache clear
4. **Data Separation**: Recent/saved lists preserved

---

## 📱 Usage Examples

### For End Users

**Scenario 1: Running Out of Storage**
1. Click Database icon in header
2. See cache size (e.g., 2.5 MB)
3. Confirm to clear all
4. Freed up 2.5 MB

**Scenario 2: Too Many Cached Items**
1. Open Cache Stats (Show Details)
2. Click "Cache Cleaning Options"
3. Choose "Clear Old (7+ days)"
4. See: "Clear 23 entries older than 7 days?"
5. Confirm → Cleaned

**Scenario 3: Testing/Development**
1. Want fresh analysis every time
2. Click "Clear ALL Cache"
3. Cache empty, all new analyses

### For Developers

**Trigger Manual Cleanup**:
```typescript
// In DevTools console
ImageCacheManager.clearCache()
ImageCacheManager.clearOldEntries(30)
ImageCacheManager.getCacheStats()
```

**Monitor Auto-Cleanup**:
```typescript
// Check last cleanup time
localStorage.getItem('lastCacheCleanup')

// Force cleanup
localStorage.removeItem('lastCacheCleanup')
ImageCacheManager.autoCleanup()
```

**Test Quota Handling**:
```typescript
// Fill cache to test limits
for (let i = 0; i < 150; i++) {
  ImageCacheManager.saveToCache({...})
}
// Should auto-limit to 100 entries
```

---

## 🔍 Troubleshooting

### Cache Not Clearing
**Check**:
1. Browser localStorage enabled?
2. Private/Incognito mode?
3. Console errors?

**Solution**:
```typescript
// Manually clear in DevTools
localStorage.removeItem('smartBiteImageCache')
```

### Auto-Cleanup Not Running
**Check**:
1. Last cleanup timestamp: `localStorage.getItem('lastCacheCleanup')`
2. More than 24 hours since last run?

**Solution**:
```typescript
// Reset timestamp to force cleanup
localStorage.removeItem('lastCacheCleanup')
// Reload page
```

### Storage Still Full
**Possible Causes**:
1. Recent analyses list large
2. Saved analyses list large
3. Other app data

**Solution**:
```typescript
// Check sizes
console.log('Cache:', localStorage.getItem('smartBiteImageCache')?.length)
console.log('Recent:', localStorage.getItem('recentAnalyses')?.length)
console.log('Saved:', localStorage.getItem('savedAnalyses')?.length)

// Clear non-essential data
localStorage.removeItem('recentAnalyses')
// (Saved analyses preserved for user)
```

---

## 🚀 Performance Impact

### Automatic Cleanup
- **CPU**: < 10ms (runs once per day)
- **Memory**: Minimal (in-place filtering)
- **Storage**: Recovers space immediately
- **User Impact**: None (background task)

### Manual Clear
- **CPU**: < 5ms (immediate removal)
- **Storage**: Instant recovery
- **UI**: Instant feedback (< 100ms)
- **User Impact**: Requires confirmation only

### Cache Stats
- **Load Time**: < 50ms (calculations on-demand)
- **Memory**: Small (summary object)
- **Update**: Instant after clear
- **Refresh**: Manual toggle only

---

## 📋 Implementation Checklist

### Completed Features ✅
- [x] 30-day automatic expiry
- [x] Daily auto-cleanup on load
- [x] Header quick clear button
- [x] Cache stats component with details
- [x] Multiple clear options (7d, 14d, all)
- [x] Clear by cuisine type
- [x] Clear by calorie threshold
- [x] Clear by custom criteria
- [x] Confirmation dialogs
- [x] Success/error messages
- [x] Console logging
- [x] Quota error handling
- [x] Size limit enforcement (100 entries)
- [x] Cache statistics display

### Future Enhancements 🔮
- [ ] Export cache data
- [ ] Import cache data
- [ ] Cache compression
- [ ] IndexedDB migration (larger storage)
- [ ] Cache analytics dashboard
- [ ] Scheduled cleanup options
- [ ] Cache warming (preload popular dishes)

---

## 🎓 Best Practices

### For Users
1. **Regular Clearing**: Clear cache every 1-2 weeks for optimal performance
2. **Selective Clearing**: Use cuisine/calorie filters to preserve useful data
3. **Check Stats**: Review cache stats before clearing to see what's stored
4. **Auto-Cleanup**: Trust automatic cleanup for general maintenance

### For Developers
1. **Test Limits**: Always test with 100+ entries
2. **Monitor Size**: Watch localStorage usage in DevTools
3. **Log Actions**: Keep console logs for debugging
4. **Handle Errors**: Graceful degradation on quota errors
5. **Preserve Data**: Never clear user's saved analyses

---

## 📊 Metrics to Monitor

### Health Indicators
- Cache hit rate (how often cache is used)
- Average cache size
- Cleanup frequency
- Storage quota usage
- User clear actions

### Warning Signs
- Cache size > 5 MB
- Quota errors in console
- Cleanup failures
- Entry count > 100 (should auto-limit)
- No cleanup for > 7 days

---

## Implementation Date
October 26, 2025

## Status
✅ **COMPLETE** - Full automatic and manual cache management implemented

## Related Docs
- [Blurhash Caching](./BLURHASH-CACHING.md)
- [Caching Mechanism](./caching-mechanism.md)
- [Hybrid Optimization](./HYBRID-OPTIMIZATION-IMPLEMENTATION.md)
