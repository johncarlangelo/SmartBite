# 0003_NutriLens-AI

NutriLens AI is a computer vision web app that identifies a dish from a photo, lists ingredients, estimates nutrition, and provides a recipe guide. Works online and offline with local Ollama.

## Getting Started

Project is based on the VISION-TRACK template located at `demo-app-VISION/nextjs-app`.

### Prerequisites
- Node.js 18+
- Ollama running locally (`ollama serve`)
- A vision-capable model (e.g., `ollama pull llava:7b`)
- For Shadcn library (`npx shadcn@latest add https://reactbits.dev/r/AnimatedList-TS-TW`, `npx shadcn@latest add https://reactbits.dev/r/GridMotion-TS-TW`)
- Just incase (`npm install -D tailwindcss postcss autoprefixer`, `npx tailwindcss init -p`)

### Run
```bash
cd demo-app-VISION/nextjs-app
npm install
npm run dev
```

Open `http://localhost:3000` and upload an image of a dish.

### API
`POST /api/analyze-image` accepts multipart form with `image` and optional `offline` flag. Returns structured JSON with `dishName`, `cuisineType`, `ingredients`, `nutrition`, and `recipe`.


