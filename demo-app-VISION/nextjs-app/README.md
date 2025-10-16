# SmartBite

Identify dishes, ingredients, nutrition, and recipes from a photo. Works online or fully offline using local Ollama.

## Run

1. Install deps
```bash
npm install
```
2. Start Ollama and ensure a vision-capable model is pulled, e.g.
```bash
ollama pull llama3.2-vision
```
3. Start dev server
```bash
npm run dev
```

## Environment

Optional env vars:

- `OLLAMA_BASE_URL` (default `http://localhost:11434`)
- `OLLAMA_VISION_MODEL` (default `llama3.2-vision:latest`)
- `OLLAMA_ONLINE_MODEL` (default same as vision model)

## API

`POST /api/analyze-image` (multipart/form-data)
- `image`: PNG/JPG/JPEG
- `offline`: `true` to force local model

Returns JSON:
```json
{
  "dishName": "Spaghetti Bolognese",
  "cuisineType": "Italian",
  "ingredients": ["spaghetti", "ground beef", "tomato", "onion"],
  "nutrition": { "calories": 520, "protein_g": 24, "carbs_g": 62, "fat_g": 20 },
  "recipe": { "servings": 2, "prepMinutes": 10, "cookMinutes": 25, "steps": ["Boil pasta", "Cook sauce", "Combine"] }
}
```


