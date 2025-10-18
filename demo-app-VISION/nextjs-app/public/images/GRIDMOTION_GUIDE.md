# GridMotion Background Setup

## 🎨 What is GridMotion?

The GridMotion background creates a stunning 3D-like effect with a tilted grid that follows your mouse movement. Each grid cell can display images or text, creating a dynamic and interactive background.

## ✨ Features

- **Mouse-Following Animation**: Grid tiles move smoothly based on mouse position
- **Tilted 3D Perspective**: Grid is rotated -15 degrees for a modern look
- **GSAP-Powered**: Smooth, performant animations using GSAP
- **Customizable Content**: Can display images or text in each grid cell
- **Theme Adaptive**: Changes colors based on dark/light mode

## 🖼️ How to Add Your Images

### Option 1: Use Image URLs
In `app/page.tsx`, update the `backgroundImages` array with your image URLs:

```typescript
const backgroundImages = [
  '/images/burger.jpg',
  '/images/chicken.jpg',
  '/images/chips.jpg',
  '/images/fries.jpg',
  '/images/pizza.jpg',
  // Add up to 28 images (4 rows × 7 columns)
]
```

### Option 2: Mix Images and Text
You can also mix images with text placeholders:

```typescript
const backgroundImages = [
  '/images/pizza.jpg',
  'Burger',
  '/images/sushi.jpg',
  'Pasta',
  // ... more items
]
```

## 🎛️ Customization Options

### Adjust Opacity
In `app/page.tsx`, find this line:
```tsx
<div className="fixed inset-0 -z-10 opacity-20">
```
Change `opacity-20` to:
- `opacity-10` - More subtle background
- `opacity-30` - More visible background
- `opacity-50` - Very prominent background

### Change Gradient Color
The `gradientColor` prop controls the radial gradient:
```tsx
<GridMotion 
  items={backgroundImages} 
  gradientColor={darkMode ? '#0f172a' : '#f1f5f9'}
/>
```

### Adjust Grid Size
In `components/GridMotion.tsx`, change:
- `totalItems = 28` - Total number of grid cells (4 rows × 7 columns = 28)
- `grid-rows-4` - Number of rows
- `grid-cols-7` - Number of columns per row

### Modify Animation Speed
In `GridMotion.tsx`, adjust:
- `maxMoveAmount = 300` - How far tiles move (higher = more movement)
- `baseDuration = 0.8` - Animation speed (lower = faster)
- `inertiaFactors` - Different speeds for each row

## 📁 Adding Images

1. Place your images in `public/images/`
2. Reference them in the array: `/images/your-image.jpg`
3. The GridMotion will automatically display them in the grid

## 🎯 Tips for Best Results

1. **Image Count**: Provide at least 7 images for the first row
2. **Image Size**: Recommended 400x400px or larger
3. **Image Quality**: Medium quality is fine (they're displayed small in the grid)
4. **Contrast**: Use images that work with both light and dark themes
5. **Performance**: Fewer than 28 images is fine, the rest will be text placeholders

## 🔧 Advanced Customization

### Change Grid Rotation
In `GridMotion.tsx`, find `rotate-[-15deg]` and change to:
- `rotate-[-10deg]` - Less tilt
- `rotate-[-20deg]` - More tilt
- `rotate-[0deg]` - No tilt (flat grid)

### Adjust Grid Gap
Change `gap-4` to:
- `gap-2` - Smaller gaps
- `gap-6` - Larger gaps

### Modify Cell Appearance
In the grid cell div, customize:
- `rounded-[10px]` - Border radius
- `bg-[#111]` - Background color
- Add hover effects or borders

## 🚀 Performance Notes

- Uses GSAP's ticker for optimal performance
- GPU-accelerated transforms
- Efficiently handles mouse events
- Smooth 60fps animations

Enjoy your dynamic GridMotion background! 🎉
