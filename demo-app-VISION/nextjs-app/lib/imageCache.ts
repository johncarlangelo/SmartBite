/**
 * Enhanced Image Caching with Blurhash
 * Provides fast similarity detection and multi-level caching
 */

import { encode } from 'blurhash'

export interface CachedAnalysis {
  imageHash: string // SHA-256 for exact matching
  blurhash: string // Blurhash for similarity detection
  analysis: any
  timestamp: number
  dishName: string
  cuisineType: string
  calories: number
}

/**
 * Generate blurhash from image file (client-side)
 */
export async function generateBlurhash(
  file: File,
  componentX: number = 4,
  componentY: number = 3
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Failed to get canvas context'))
      return
    }

    img.onload = () => {
      try {
        // Use small size for fast blurhash generation
        const width = 32
        const height = 32
        canvas.width = width
        canvas.height = height

        // Draw image
        ctx.drawImage(img, 0, 0, width, height)

        // Get image data
        const imageData = ctx.getImageData(0, 0, width, height)

        // Generate blurhash
        const hash = encode(
          imageData.data,
          width,
          height,
          componentX,
          componentY
        )

        resolve(hash)
        URL.revokeObjectURL(img.src)
      } catch (error) {
        reject(error)
        URL.revokeObjectURL(img.src)
      }
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
      URL.revokeObjectURL(img.src)
    }

    img.src = URL.createObjectURL(file)
  })
}

/**
 * Calculate SHA-256 hash for exact matching
 */
export async function calculateImageHash(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return hashHex
}

/**
 * Image Cache Manager with multi-level caching
 */
export class ImageCacheManager {
  private static readonly CACHE_KEY = 'smartBiteImageCache'
  private static readonly MAX_CACHE_SIZE = 100
  private static readonly CACHE_EXPIRY_DAYS = 30

  /**
   * Level 1: Find exact match by SHA-256 hash
   */
  static findExactMatch(imageHash: string): CachedAnalysis | null {
    const cache = this.getCache()
    return cache.find((entry) => entry.imageHash === imageHash) || null
  }

  /**
   * Level 2: Find similar images by blurhash
   * Uses Hamming distance for comparison
   */
  static findSimilarMatches(
    blurhash: string,
    threshold: number = 5
  ): CachedAnalysis[] {
    const cache = this.getCache()
    const similar: CachedAnalysis[] = []

    for (const entry of cache) {
      const distance = this.calculateHammingDistance(blurhash, entry.blurhash)
      if (distance <= threshold) {
        similar.push(entry)
      }
    }

    // Sort by similarity (lower distance = more similar)
    return similar.sort((a, b) => {
      const distA = this.calculateHammingDistance(blurhash, a.blurhash)
      const distB = this.calculateHammingDistance(blurhash, b.blurhash)
      return distA - distB
    })
  }

  /**
   * Calculate Hamming distance between two strings
   * (number of positions at which the characters differ)
   */
  private static calculateHammingDistance(str1: string, str2: string): number {
    if (str1.length !== str2.length) {
      return Math.abs(str1.length - str2.length) + Math.min(str1.length, str2.length)
    }

    let distance = 0
    for (let i = 0; i < str1.length; i++) {
      if (str1[i] !== str2[i]) {
        distance++
      }
    }
    return distance
  }

  /**
   * Level 3: Get popular dishes
   */
  static getPopularDishes(limit: number = 10): CachedAnalysis[] {
    const cache = this.getCache()

    // Count occurrences of each dish
    const dishCounts = new Map<string, number>()
    cache.forEach((entry) => {
      const count = dishCounts.get(entry.dishName) || 0
      dishCounts.set(entry.dishName, count + 1)
    })

    // Sort by popularity
    return cache
      .sort((a, b) => {
        const countA = dishCounts.get(a.dishName) || 0
        const countB = dishCounts.get(b.dishName) || 0
        return countB - countA
      })
      .slice(0, limit)
  }

  /**
   * Save analysis to cache
   */
  static saveToCache(entry: CachedAnalysis): void {
    let cache = this.getCache()

    // Check if entry already exists
    const existingIndex = cache.findIndex(
      (e) => e.imageHash === entry.imageHash
    )

    if (existingIndex >= 0) {
      // Update existing entry
      cache[existingIndex] = entry
    } else {
      // Add new entry at the beginning
      cache.unshift(entry)

      // Limit cache size
      if (cache.length > this.MAX_CACHE_SIZE) {
        cache = cache.slice(0, this.MAX_CACHE_SIZE)
      }
    }

    this.saveCache(cache)
  }

  /**
   * Get all cache entries (with expiry filtering)
   */
  static getCache(): CachedAnalysis[] {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY)
      if (!cached) return []

      const cache: CachedAnalysis[] = JSON.parse(cached)

      // Filter out expired entries
      const now = Date.now()
      const expiryTime = this.CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000

      return cache.filter((entry) => {
        const age = now - entry.timestamp
        return age < expiryTime
      })
    } catch (error) {
      console.error('Failed to read cache:', error)
      return []
    }
  }

  /**
   * Save cache to localStorage
   */
  private static saveCache(cache: CachedAnalysis[]): void {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache))
    } catch (error) {
      console.error('Failed to save cache:', error)
      // If localStorage is full, try to clear old entries
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        this.clearOldEntries()
        try {
          localStorage.setItem(this.CACHE_KEY, JSON.stringify(cache))
        } catch {
          console.error('Still failed to save cache after cleanup')
        }
      }
    }
  }

  /**
   * Clear entries older than specified days
   */
  static clearOldEntries(days: number = 7): number {
    const cache = this.getCache()
    const now = Date.now()
    const cutoffTime = days * 24 * 60 * 60 * 1000

    const initialCount = cache.length
    const filtered = cache.filter((entry) => {
      const age = now - entry.timestamp
      return age < cutoffTime
    })

    this.saveCache(filtered)
    const clearedCount = initialCount - filtered.length
    
    if (clearedCount > 0) {
      console.log(`🧹 Cleared ${clearedCount} entries older than ${days} days`)
    }
    
    return clearedCount
  }

  /**
   * Clear all cache
   */
  static clearCache(): number {
    const cache = this.getCache()
    const count = cache.length
    localStorage.removeItem(this.CACHE_KEY)
    console.log(`🗑️ Cleared all ${count} cache entries`)
    return count
  }

  /**
   * Automatic cleanup - Run on initialization
   * Removes entries older than CACHE_EXPIRY_DAYS
   */
  static autoCleanup(): void {
    const lastCleanup = localStorage.getItem('lastCacheCleanup')
    const now = Date.now()
    
    // Run cleanup daily
    if (!lastCleanup || now - parseInt(lastCleanup) > 24 * 60 * 60 * 1000) {
      console.log('🔄 Running automatic cache cleanup...')
      const cleared = this.clearOldEntries(this.CACHE_EXPIRY_DAYS)
      localStorage.setItem('lastCacheCleanup', now.toString())
      
      if (cleared > 0) {
        console.log(`✓ Automatic cleanup complete: ${cleared} old entries removed`)
      }
    }
  }

  /**
   * Get entries that will be deleted (for preview before manual clear)
   */
  static getExpiredEntries(): CachedAnalysis[] {
    const cache = this.getCache()
    const now = Date.now()
    const expiryTime = this.CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000

    return cache.filter((entry) => {
      const age = now - entry.timestamp
      return age >= expiryTime
    })
  }

  /**
   * Clear entries by specific criteria
   */
  static clearByCriteria(criteria: {
    olderThanDays?: number
    cuisineType?: string
    caloriesAbove?: number
    caloriesBelow?: number
  }): number {
    let cache = this.getCache()
    const initialCount = cache.length
    const now = Date.now()

    if (criteria.olderThanDays) {
      const cutoffTime = criteria.olderThanDays * 24 * 60 * 60 * 1000
      cache = cache.filter((entry) => {
        const age = now - entry.timestamp
        return age < cutoffTime
      })
    }

    if (criteria.cuisineType) {
      cache = cache.filter(
        (entry) =>
          entry.cuisineType.toLowerCase() !== criteria.cuisineType!.toLowerCase()
      )
    }

    if (criteria.caloriesAbove) {
      cache = cache.filter((entry) => entry.calories <= criteria.caloriesAbove!)
    }

    if (criteria.caloriesBelow) {
      cache = cache.filter((entry) => entry.calories >= criteria.caloriesBelow!)
    }

    this.saveCache(cache)
    const clearedCount = initialCount - cache.length
    
    if (clearedCount > 0) {
      console.log(`🧹 Cleared ${clearedCount} entries matching criteria`)
    }
    
    return clearedCount
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): {
    totalEntries: number
    cacheSize: number
    oldestEntry: Date | null
    newestEntry: Date | null
    popularDishes: Array<{ dish: string; count: number }>
    averageCalories: number
    cuisineTypes: Array<{ cuisine: string; count: number }>
  } {
    const cache = this.getCache()

    if (cache.length === 0) {
      return {
        totalEntries: 0,
        cacheSize: 0,
        oldestEntry: null,
        newestEntry: null,
        popularDishes: [],
        averageCalories: 0,
        cuisineTypes: [],
      }
    }

    // Calculate statistics
    const timestamps = cache.map((e) => e.timestamp)
    const dishCounts = new Map<string, number>()
    const cuisineCounts = new Map<string, number>()
    let totalCalories = 0

    cache.forEach((entry) => {
      // Count dishes
      const dishCount = dishCounts.get(entry.dishName) || 0
      dishCounts.set(entry.dishName, dishCount + 1)

      // Count cuisines
      const cuisineCount = cuisineCounts.get(entry.cuisineType) || 0
      cuisineCounts.set(entry.cuisineType, cuisineCount + 1)

      // Sum calories
      totalCalories += entry.calories || 0
    })

    // Get popular dishes
    const popularDishes = Array.from(dishCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([dish, count]) => ({ dish, count }))

    // Get cuisine types
    const cuisineTypes = Array.from(cuisineCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([cuisine, count]) => ({ cuisine, count }))

    return {
      totalEntries: cache.length,
      cacheSize: new Blob([JSON.stringify(cache)]).size,
      oldestEntry: new Date(Math.min(...timestamps)),
      newestEntry: new Date(Math.max(...timestamps)),
      popularDishes,
      averageCalories: Math.round(totalCalories / cache.length),
      cuisineTypes,
    }
  }

  /**
   * Search cache by dish name
   */
  static searchByDishName(query: string): CachedAnalysis[] {
    const cache = this.getCache()
    const lowerQuery = query.toLowerCase()

    return cache.filter((entry) =>
      entry.dishName.toLowerCase().includes(lowerQuery)
    )
  }

  /**
   * Get dishes by cuisine type
   */
  static getByCuisine(cuisineType: string): CachedAnalysis[] {
    const cache = this.getCache()
    return cache.filter(
      (entry) =>
        entry.cuisineType.toLowerCase() === cuisineType.toLowerCase()
    )
  }

  /**
   * Get dishes by calorie range
   */
  static getByCalorieRange(
    minCalories: number,
    maxCalories: number
  ): CachedAnalysis[] {
    const cache = this.getCache()
    return cache.filter(
      (entry) => entry.calories >= minCalories && entry.calories <= maxCalories
    )
  }
}
