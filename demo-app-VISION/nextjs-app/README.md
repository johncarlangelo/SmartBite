# SmartBite - AI-Powered Food Analysis App 🍽️

SmartBite is a Next.js application that uses AI to analyze food images and provide comprehensive information about dishes, including ingredients, detailed nutrition facts, and step-by-step recipes.

## ✨ Key Features

### 🎨 Landing Page
- **Dark/Light Mode Toggle**: Persistent theme switching with localStorage support
- **Animated Hero Section**: Smooth entrance animations using Framer Motion
- **Interactive Food Carousel**: Showcasing popular dishes with ratings and category badges
- **Fully Responsive**: Mobile-first design with Tailwind CSS

### 🔍 Analysis Page
- **Instant AI Analysis**: Upload food images for immediate AI-powered insights
- **Fast Processing**: Optimized with 1.1s progress animation and auto-trigger on upload
- **Comprehensive Results Display**:
  - Dish name and cuisine type identification
  - Complete ingredient list with visual tags
  - Detailed nutrition information (calories, protein, carbs, fat) in 4-column grid
  - Step-by-step recipe with prep and cook times
- **Smooth Animations**: Scale-in animations for all result cards
- **Optimized Layout**: Clean vertical column layout with 95% card width

### 📚 History Feature
- **Dual-Tab System**:
  - **Recent Tab**: Shows ALL uploaded and analyzed dishes (unlimited storage)
  - **Saved Tab**: Shows only your starred/favorited dishes
- **Advanced UI Features**:
  - Smooth scrolling with gradient fade overlays (top & bottom)
  - Animated list items with scale and opacity transitions
  - Custom thin scrollbar styling
- **Easy Management**:
  - Click any item to reload full analysis details
  - Delete individual items with trash icon
  - Clear all items per tab with one click
  - Unread count badge on history button
- **Persistent Storage**: All history automatically saved in browser localStorage

### 📖 Recipe Display
- **Scrollable Steps List**: Max 500px height with smooth overflow scrolling
- **Animated Steps**: Scale-in animations with staggered delays (0.05s between items)
- **Smart Gradient Overlays**: Automatic fade effects when 3+ steps (better readability)
- **Custom Scrollbar**: Thin 8px scrollbar matching app theme

### 🎯 Additional Features
- **Drag & Drop Upload**: Easy image uploading with file preview
- **Duplicate Detection**: SHA-256 hashing to identify previously analyzed images
- **Server-Side Caching**: SQLite database for persistent storage of analysis results
- **Instant Cache Results**: Previously analyzed images load instantly from cache
- **Glassmorphism Design**: Modern UI with backdrop blur effects

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3
- **Animations**: Framer Motion (motion/react)
- **Icons**: Lucide React
- **Backend**: Next.js API Routes
- **Database**: SQLite with better-sqlite3
- **AI Processing**: Ollama with LLaVA 7B vision model
- **State Management**: React useState + localStorage
- **Deployment**: Docker-ready with PM2 process management support

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm**, **yarn**, or **pnpm** (npm comes with Node.js)
- **Git** - [Download here](https://git-scm.com/)
- **[Ollama](https://ollama.com)** - For AI model processing

### Installing Prerequisites

#### On Windows:
```powershell
# Install Node.js (includes npm)
# Download from https://nodejs.org/ and run installer

# Install Git
# Download from https://git-scm.com/ and run installer

# Verify installations
node --version
npm --version
git --version

# Install Ollama
# Download from https://ollama.com/ and run installer
```

#### On macOS:
```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js and npm
brew install node

# Install Git
brew install git

# Install Ollama
brew install ollama

# Verify installations
node --version
npm --version
git --version
ollama --version
```

#### On Linux (Ubuntu/Debian):
```bash
# Update package list
sudo apt update

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Git
sudo apt install -y git

# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Verify installations
node --version
npm --version
git --version
ollama --version
```

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/johncarlangelo/SmartBite.git
cd SmartBite/demo-app-VISION/nextjs-app
```

### 2. Install Ollama AI Model

```bash
# Start Ollama service (if not running automatically)
# On Windows/Mac: Ollama starts automatically after installation
# On Linux, you may need to start it:
# systemctl start ollama  # or: ollama serve

# Pull the LLaVA 7B vision model (required for image analysis)
ollama pull llava:7b

# Verify the model is installed
ollama list
```

### 3. Install Project Dependencies

This will install all required npm packages including:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React (icons)
- better-sqlite3 (database)
- and more...

```bash
npm install
# or if you prefer yarn:
yarn install
# or if you prefer pnpm:
pnpm install
```

**Note**: Installation may take 2-5 minutes depending on your internet connection.

### 4. Environment Setup

Create a `.env.local` file in the `nextjs-app` directory:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_VISION_MODEL=llava:7b
OLLAMA_ONLINE_MODEL=llava:7b
```

### 5. Run the Development Server

```bash
npm run dev
# or if using yarn:
yarn dev
# or if using pnpm:
pnpm dev
```

You should see output like:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Ready in X.Xs
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### 6. Build for Production

```bash
# Build the application
npm run build

# This will:
# - Compile TypeScript
# - Optimize code and assets
# - Generate static pages
# - Create production bundles

# Start the production server
npm start

# Or combine both with your preferred package manager:
yarn build && yarn start
pnpm build && pnpm start
```

The production build will be available at [http://localhost:3000](http://localhost:3000).

## 📁 Project Structure

```
nextjs-app/
├── app/
│   ├── page.tsx                 # Landing page (with dark/light mode)
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles + custom scrollbar
│   ├── analyze/
│   │   └── page.tsx             # Analysis page (main feature)
│   └── api/
│       └── analyze-image/
│           └── route.ts         # API endpoint for image analysis
├── components/
│   ├── Navbar.tsx               # Navigation (dark/light mode support)
│   ├── HeroSection.tsx          # Hero with animations
│   ├── FoodCarousel.tsx         # Food showcase carousel
│   ├── GridMotion.tsx           # Animated grid background
│   └── AnimatedList.tsx         # Reusable animated list
├── lib/
│   └── utils.ts                 # Utility functions
├── public/
│   └── images/                  # Food images
├── docs/                        # Detailed documentation
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

## 📚 Documentation

Detailed documentation is available in the [docs](docs/) folder:

- [System Overview](docs/system-overview.md) - High-level architecture and components
- [Caching Mechanism](docs/caching-mechanism.md) - How duplicate detection and caching works
- [API Documentation](docs/api-documentation.md) - Details of all API endpoints
- [Database Schema](docs/database-schema.md) - Database structure and design
- [Frontend Architecture](docs/frontend-architecture.md) - UI components and state management
- [Deployment Guide](docs/deployment-guide.md) - How to deploy and configure the application

## 🔧 Recent Changes & Updates (Latest Release)

### ⚡ Performance Optimizations
- ✅ Reduced analysis progress animation from **7.5s to 1.1s** (85% faster)
- ✅ Reduced result display delay from **500ms to 100ms**
- ✅ **Auto-trigger analysis** on image upload (removed manual "Analyze" button)
- ✅ Fixed data.analysis bug in API response handling

### 🎨 Layout & UI Updates
- ✅ Changed analyze page from **side-by-side grid to vertical column layout**
- ✅ Expanded all result cards to **95% width** for better readability
- ✅ Removed overflow scroll from result cards (full visibility)
- ✅ Added **History button in header** with unread count badge

### 📚 History Feature Improvements
- ✅ Implemented **dual-tab system** (Recent + Saved favorites)
- ✅ **Removed 50-item limit** - now stores unlimited upload history
- ✅ Added **animated list** with scale-in effects (0.7 → 1.0 scale)
- ✅ Added **gradient overlays** for better scroll indication
- ✅ **Custom scrollbar styling** (8px thin scrollbar)
- ✅ Separate localStorage keys for each tab
- ✅ Individual delete and bulk "Clear All" options per tab

### 📖 Recipe Steps Enhancement
- ✅ Added **max-height (500px)** with overflow scroll for long recipes
- ✅ **Animated list items** with staggered delays (0.05s between items)
- ✅ **Smart gradient overlays** (show only when 3+ steps)
- ✅ Custom scrollbar matching overall theme

### 🌓 Dark/Light Mode
- ✅ Added **persistent dark/light mode toggle** on landing page
- ✅ Theme preference **saved to localStorage**
- ✅ All components support both themes (Navbar, Hero, Carousel)
- ✅ **Smooth 300ms transitions** between modes
- ✅ **Floating toggle button** (bottom-right corner with Sun/Moon icons)

### 🍔 Food Carousel Cleanup
- ✅ Removed price display
- ✅ Removed "Add to Cart" button
- ✅ Removed review count text (kept rating stars)
- ✅ **Cleaner, more focused** card design

### 🎨 Custom Scrollbar Styling
Added global scrollbar styles in `globals.css`:
- **8px thin scrollbar** width
- **Semi-transparent** with hover effects
- **Rounded corners** for modern look
- Support for **Chrome/Edge (WebKit)** and **Firefox**

## 🎯 Usage Guide

### Analyzing Food
1. Navigate to the **Analyze** page (click "Get Started" or "Analyze" in navigation)
2. Upload a food image:
   - Click the upload area to browse files
   - Or drag and drop an image
3. Analysis starts **automatically within 100ms**
4. View comprehensive results:
   - Dish name and cuisine type
   - Complete ingredient list with visual tags
   - Nutrition facts in organized 4-column grid
   - Step-by-step recipe (scrollable if many steps)

### Managing History
1. Click the **History** button (top-right corner, shows unread count badge)
2. Switch between tabs:
   - **Recent Tab**: View all analyzed dishes chronologically (unlimited)
   - **Saved Tab**: View only your starred/favorited dishes
3. **Interact with items**:
   - Click any item to reload its full analysis
   - Use trash icon to delete individual items
   - Use "Clear All" button to remove all items in current tab
4. History persists across browser sessions

### Saving Favorites
1. After analyzing a dish, look for the **star icon** in results
2. Click to save to your **Saved** tab
3. Access saved items anytime from **History → Saved** tab

### Switching Themes
1. Look for the **floating button** in bottom-right corner of landing page
2. Click to toggle between **dark mode** ☾ and **light mode** ☀️
3. Preference is **automatically saved** and persists across sessions

## 🐛 Troubleshooting

### Development Server Issues
```bash
# Clear cache and reinstall dependencies
rm -rf .next node_modules package-lock.json
npm install
npm run dev
```

### Ollama Connection Issues
```bash
# Ensure Ollama is running
ollama serve

# Check if model is installed
ollama list

# Pull model if missing
ollama pull llava:7b
```

### Build Errors
```bash
# Check for TypeScript errors
npm run build

# Note: CSS/Tailwind @tailwind warnings can be safely ignored
# These directives are processed correctly by PostCSS
```

### localStorage Not Persisting
- Ensure you're **not in incognito/private browsing mode**
- Check browser console for localStorage errors
- Clear browser cache and reload the page
- Verify browser localStorage is enabled in settings

## 📜 Available Scripts

All scripts can be run with `npm`, `yarn`, or `pnpm`:

```bash
# Development
npm run dev          # Start development server (http://localhost:3000)
                     # Includes hot-reload and fast refresh

# Production
npm run build        # Build optimized production bundle
                     # Compiles TypeScript, optimizes assets
npm run start        # Start production server
                     # Serves the built application

# Code Quality
npm run lint         # Run ESLint for code quality checks
                     # Finds problems in JavaScript/TypeScript code

# Package Management
npm install          # Install all dependencies from package.json
npm update           # Update packages to latest compatible versions
npm outdated         # Check for outdated packages
```

### Quick Commands Reference

```bash
# First time setup (in order)
git clone https://github.com/johncarlangelo/SmartBite.git
cd SmartBite/demo-app-VISION/nextjs-app
npm install
ollama pull llava:7b
npm run dev

# Daily development
npm run dev          # Start coding!

# Before pushing to GitHub
npm run build        # Ensure build works
npm run lint         # Check code quality

# Deploy to production
npm run build
npm run start
```

## 🤝 Contributing

### Development Workflow
1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and test thoroughly

3. **Commit with descriptive messages**:
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

4. **Push to your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request** on GitHub

### Code Style Guidelines
- Use **TypeScript** for all new files
- Follow existing component patterns and structure
- Use **Tailwind CSS** for styling (avoid inline styles)
- Add animations using **Framer Motion** for consistency
- **Support both dark and light modes** for new components
- Add proper **TypeScript types** for props and state
- Write **descriptive comments** for complex logic

## 📝 Important Notes

### localStorage Keys Used
- `darkMode` - Theme preference (boolean)
- `recentAnalyses` - Recent upload history (array)
- `savedAnalyses` - Saved favorites (array)
- `historyView` - Current history tab selection ('recent' | 'saved')
- `unreadCount` - Count of unread history items (number)

### API Configuration
- The analyze-image API endpoint may need configuration for production deployment
- Ollama must be running on the configured URL (default: http://localhost:11434)
- Images are stored in `/public/images/` directory

### Performance Tips
- Analysis is cached in SQLite database for instant re-loading
- Images use SHA-256 hashing for duplicate detection
- History items are stored locally (no server dependency)

## 📚 Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Ollama Documentation](https://github.com/jmorganca/ollama) - AI model deployment
- [LLaVA Model](https://llava-vl.github.io/) - Vision language model details
- [Tailwind CSS Documentation](https://tailwindcss.com/) - Utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library for React
- [Lucide Icons](https://lucide.dev/) - Beautiful consistent icons

## 📄 License

This project is part of the SmartBite application. Please refer to the main repository for licensing information.

## 👥 Contributors

We welcome contributions! Feel free to submit issues and pull requests.

## 📧 Support

For questions, issues, or feature requests:
- Open an issue on [GitHub](https://github.com/johncarlangelo/SmartBite/issues)
- Contact the maintainers

---

**Made with ❤️ by the SmartBite Team | Happy Coding! 🍽️✨**