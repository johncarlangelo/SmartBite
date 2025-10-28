/**
 * Cache Statistics Component
 * Displays useful information about the image cache
 */

'use client'

import { useState, useEffect } from 'react'
import { ImageCacheManager } from '@/lib/imageCache'
import { Database, TrendingUp, Image as ImageIcon, Calendar, Trash2 } from 'lucide-react'

export default function CacheStats() {
  const [stats, setStats] = useState<ReturnType<typeof ImageCacheManager.getCacheStats> | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [showClearOptions, setShowClearOptions] = useState(false)

  useEffect(() => {
    updateStats()
  }, [])

  const updateStats = () => {
    const cacheStats = ImageCacheManager.getCacheStats()
    setStats(cacheStats)
  }

  const clearCache = async () => {
    if (confirm(`Are you sure you want to clear ALL ${stats?.totalEntries || 0} cached analyses?\n\nThis will clear BOTH client cache and server database.\n\nThis action cannot be undone.`)) {
      try {
        // Clear client-side localStorage cache
        const clientCleared = ImageCacheManager.clearCache()
        
        // Clear server-side database cache
        const serverResponse = await fetch('/api/clear-cache', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'all' })
        })
        
        if (!serverResponse.ok) {
          throw new Error('Failed to clear server cache')
        }
        
        const serverData = await serverResponse.json()
        
        updateStats()
        alert(`✓ Successfully cleared:\n- ${clientCleared} client cache entries\n- ${serverData.clearedCount} server database entries!`)
      } catch (error) {
        console.error('Clear cache error:', error)
        alert('❌ Error clearing cache. Check console for details.')
      }
    }
  }

  const clearOldEntries = async (days: number) => {
    const expiredCount = ImageCacheManager.getCache().filter(entry => {
      const age = Date.now() - entry.timestamp
      return age >= days * 24 * 60 * 60 * 1000
    }).length

    if (expiredCount === 0) {
      alert(`No entries older than ${days} days found in client cache.`)
      return
    }

    if (confirm(`Clear entries older than ${days} days?\n\nClient cache: ~${expiredCount} entries\n\nThis will also clear matching server database entries.`)) {
      try {
        // Clear client-side cache
        const clientCleared = ImageCacheManager.clearOldEntries(days)
        
        // Clear server-side database
        const serverResponse = await fetch('/api/clear-cache', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'old', value: days.toString() })
        })
        
        if (!serverResponse.ok) {
          throw new Error('Failed to clear server cache')
        }
        
        const serverData = await serverResponse.json()
        
        updateStats()
        alert(`✓ Successfully cleared:\n- ${clientCleared} client cache entries\n- ${serverData.clearedCount} server database entries!`)
        setShowClearOptions(false)
      } catch (error) {
        console.error('Clear old entries error:', error)
        alert('❌ Error clearing old entries. Check console for details.')
      }
    }
  }

  const clearByCuisine = async () => {
    const cuisine = prompt('Enter cuisine type to clear (e.g., "Italian", "Chinese"):')
    if (!cuisine) return

    const matchingEntries = ImageCacheManager.getByCuisine(cuisine)
    if (matchingEntries.length === 0) {
      alert(`No entries found for cuisine: ${cuisine} in client cache`)
      return
    }

    if (confirm(`Clear ${matchingEntries.length} ${cuisine} cuisine entries?\n\nThis will also clear matching server database entries.`)) {
      try {
        // Clear client-side cache
        const clientCleared = ImageCacheManager.clearByCriteria({ cuisineType: cuisine })
        
        // Clear server-side database
        const serverResponse = await fetch('/api/clear-cache', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'cuisine', value: cuisine })
        })
        
        if (!serverResponse.ok) {
          throw new Error('Failed to clear server cache')
        }
        
        const serverData = await serverResponse.json()
        
        updateStats()
        alert(`✓ Successfully cleared:\n- ${clientCleared} client cache entries\n- ${serverData.clearedCount} server database entries!`)
      } catch (error) {
        console.error('Clear by cuisine error:', error)
        alert('❌ Error clearing cuisine entries. Check console for details.')
      }
    }
  }

  const clearByCalories = async () => {
    const threshold = prompt('Clear entries with calories above:')
    if (!threshold) return

    const calorieLimit = parseInt(threshold)
    if (isNaN(calorieLimit)) {
      alert('Please enter a valid number')
      return
    }

    const matchingEntries = ImageCacheManager.getCache().filter(
      entry => entry.calories > calorieLimit
    )

    if (matchingEntries.length === 0) {
      alert(`No entries found with calories above ${calorieLimit} in client cache`)
      return
    }

    if (confirm(`Clear ${matchingEntries.length} entries with more than ${calorieLimit} calories?\n\nThis will also clear matching server database entries.`)) {
      try {
        // Clear client-side cache
        const clientCleared = ImageCacheManager.clearByCriteria({ caloriesAbove: calorieLimit })
        
        // Clear server-side database
        const serverResponse = await fetch('/api/clear-cache', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'calories', value: calorieLimit.toString() })
        })
        
        if (!serverResponse.ok) {
          throw new Error('Failed to clear server cache')
        }
        
        const serverData = await serverResponse.json()
        
        updateStats()
        alert(`✓ Successfully cleared:\n- ${clientCleared} client cache entries\n- ${serverData.clearedCount} server database entries!`)
      } catch (error) {
        console.error('Clear by calories error:', error)
        alert('❌ Error clearing high-calorie entries. Check console for details.')
      }
    }
  }

  if (!stats) return null

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (date: Date | null): string => {
    if (!date) return 'N/A'
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 shadow-lg border border-purple-200 dark:border-purple-900">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-purple-600" />
          Image Cache Statistics
        </h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow">
          <div className="flex items-center gap-2 mb-1">
            <ImageIcon className="w-4 h-4 text-blue-600" />
            <p className="text-xs text-gray-600 dark:text-gray-400">Total Cached</p>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.totalEntries}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow">
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-4 h-4 text-green-600" />
            <p className="text-xs text-gray-600 dark:text-gray-400">Cache Size</p>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{formatBytes(stats.cacheSize)}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-orange-600" />
            <p className="text-xs text-gray-600 dark:text-gray-400">Avg Calories</p>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.averageCalories}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-purple-600" />
            <p className="text-xs text-gray-600 dark:text-gray-400">Cuisines</p>
          </div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{stats.cuisineTypes.length}</p>
        </div>
      </div>

      {/* Detailed Stats */}
      {showDetails && (
        <div className="space-y-4">
          {/* Popular Dishes */}
          {stats.popularDishes.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Popular Dishes</h4>
              <div className="space-y-2">
                {stats.popularDishes.map((dish, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{dish.dish}</span>
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                      {dish.count}x
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cuisine Types */}
          {stats.cuisineTypes.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
              <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Cuisine Distribution</h4>
              <div className="space-y-2">
                {stats.cuisineTypes.slice(0, 5).map((cuisine, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{cuisine.cuisine}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                          style={{
                            width: `${(cuisine.count / stats.totalEntries) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        {cuisine.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cache Management */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Cache Management</h4>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>Oldest Entry: {formatDate(stats.oldestEntry)}</p>
              <p>Newest Entry: {formatDate(stats.newestEntry)}</p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                ⏰ Auto-cleanup: Entries older than 30 days are automatically removed from client cache
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                💾 All clear operations affect both client cache (localStorage) and server database (analyses.db)
              </p>
            </div>
            
            {!showClearOptions ? (
              <button
                onClick={() => setShowClearOptions(true)}
                className="w-full mt-4 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Cache Cleaning Options
              </button>
            ) : (
              <div className="space-y-2 mt-4">
                <button
                  onClick={() => clearOldEntries(7)}
                  className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  🗓️ Clear Old (7+ days)
                </button>
                <button
                  onClick={() => clearOldEntries(14)}
                  className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  🗓️ Clear Old (14+ days)
                </button>
                <button
                  onClick={clearByCuisine}
                  className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  🍽️ Clear by Cuisine
                </button>
                <button
                  onClick={clearByCalories}
                  className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  🔥 Clear High Calories
                </button>
                <button
                  onClick={clearCache}
                  className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear ALL Cache
                </button>
                <button
                  onClick={() => setShowClearOptions(false)}
                  className="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
