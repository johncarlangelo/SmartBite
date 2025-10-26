/**
 * Image Compression Utility
 * Compresses images before upload to speed up processing
 */

export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

/**
 * Compress an image file before upload
 * Reduces file size by 60-80% while maintaining quality for AI analysis
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const { maxWidth = 800, maxHeight = 800, quality = 0.85 } = options

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onerror = () => reject(new Error('Failed to read file'))

    reader.onload = (e) => {
      const img = new Image()

      img.onerror = () => reject(new Error('Failed to load image'))

      img.onload = () => {
        try {
          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width
          let height = img.height

          if (width > maxWidth || height > maxHeight) {
            const aspectRatio = width / height

            if (width > height) {
              width = maxWidth
              height = width / aspectRatio
            } else {
              height = maxHeight
              width = height * aspectRatio
            }
          }

          // Create canvas and draw resized image
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Failed to get canvas context'))
            return
          }

          // Enable high-quality image smoothing
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'

          // Draw the image
          ctx.drawImage(img, 0, 0, width, height)

          // Convert canvas to blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to create blob'))
                return
              }

              // Create new file from blob
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })

              console.log(
                `Image compressed: ${(file.size / 1024).toFixed(2)}KB → ${(
                  compressedFile.size / 1024
                ).toFixed(2)}KB (${(
                  ((file.size - compressedFile.size) / file.size) *
                  100
                ).toFixed(1)}% reduction)`
              )

              resolve(compressedFile)
            },
            'image/jpeg',
            quality
          )
        } catch (error) {
          reject(error)
        }
      }

      img.src = e.target?.result as string
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Check if image needs compression
 */
export function shouldCompress(file: File): boolean {
  const MIN_SIZE = 200 * 1024 // 200KB
  return file.size > MIN_SIZE
}
