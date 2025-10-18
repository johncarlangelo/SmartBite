# SmartBite

SmartBite is an AI-powered food analysis application that identifies dishes, ingredients, nutritional information, and provides recipes from uploaded food images.

## Features

- **AI Image Analysis**: Uses LLaVA model via Ollama to analyze food images
- **Drag & Drop Upload**: Easy image uploading with preview
- **Duplicate Detection**: SHA-256 hashing to identify previously analyzed images
- **Server-Side Caching**: SQLite database for persistent storage of analysis results
- **Instant Results**: Previously analyzed images load instantly from cache
- **Responsive UI**: Beautiful glassmorphism design with dark/light mode
- **History Tracking**: Save and revisit previous analyses

## Technology Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, SQLite with better-sqlite3
- **AI Processing**: Ollama with LLaVA 7B vision model
- **Deployment**: Docker-ready with PM2 process management support

## Getting Started

1. Install [Ollama](https://ollama.com)
2. Pull the vision model: `ollama pull llava:7b`
3. Install dependencies: `npm install`
4. Run development server: `npm run dev`

## Documentation

Detailed documentation is available in the [docs](docs/) folder:

- [System Overview](docs/system-overview.md) - High-level architecture and components
- [Caching Mechanism](docs/caching-mechanism.md) - How duplicate detection and caching works
- [API Documentation](docs/api-documentation.md) - Details of all API endpoints
- [Database Schema](docs/database-schema.md) - Database structure and design
- [Frontend Architecture](docs/frontend-architecture.md) - UI components and state management
- [Deployment Guide](docs/deployment-guide.md) - How to deploy and configure the application

## Environment Variables

Create a `.env.local` file with the following variables:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_VISION_MODEL=llava:7b
OLLAMA_ONLINE_MODEL=llava:7b
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [Ollama Documentation](https://github.com/jmorganca/ollama)
- [LLaVA Model](https://llava-vl.github.io/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)