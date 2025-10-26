# 0003_SmartBite

SmartBite is a computer vision web app that identifies a dish from a photo, lists ingredients, estimates nutrition, and provides a recipe guide. Works online and offline with local Ollama.

## Getting Started

Project is based on the VISION-TRACK template located at `demo-app-VISION/nextjs-app`.

### Prerequisites
- Node.js 18+
- Ollama running locally (`ollama serve`)
- Required AI models:
  - `ollama pull llava:7b` (4.7GB) - Vision model for image analysis
  - `ollama pull llama3.2:1b` (1.3GB) - Fast text model for recommendations and recipes
- For Shadcn library (`npx shadcn@latest add https://reactbits.dev/r/AnimatedList-TS-TW`, `npx shadcn@latest add https://reactbits.dev/r/GridMotion-TS-TW`)
- Just incase (`npm install -D tailwindcss postcss autoprefixer`, `npx tailwindcss init -p`)

### Run
```bash
cd demo-app-VISION/nextjs-app
npm install
npm run dev
```

Open `http://localhost:3000` and upload an image of a dish.

### API Endpoints
- **`POST /api/analyze-image`** - Accepts multipart form with `image` and optional `offline` flag. Returns structured JSON with `dishName`, `cuisineType`, `ingredients`, `nutrition`, and `recipe`.
- **`POST /api/recommendations`** - Generates AI-powered recommendations in 3 categories (healthier, seasonal, pairing). Accepts `type`, `currentDish`, `recentDishes`, `month`, and `offline`.
- **`POST /api/generate-recipe`** - Generates detailed recipe for a specific dish. Accepts `dishName` and `cuisineType`. Returns full recipe with ingredients, instructions, nutrition, and tips.
- **`POST /api/check-cache`** - Checks if an image has been analyzed before using SHA-256 hash.

### Features
- **AI-Powered Food Analysis**: Upload food images for instant identification and analysis
- **Multi-Model AI**: Uses llava:7b (vision) + llama3.2:1b (text) for optimized performance
- **AI Recommendations Engine**: Get healthier alternatives, seasonal picks, and perfect pairings
- **Recipe Modal**: Detailed recipes with AI generation + external search links
- **History Management**: Track and save your analyzed dishes
- **Dark/Light Mode**: Persistent theme switching
- **Offline Support**: Works completely offline with local Ollama models
- **Smart Caching**: Duplicate detection and instant cache results


