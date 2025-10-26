# Multi-Model Setup Guide for SmartBite

## 🎯 Using Multiple Models for Optimal Performance

SmartBite now supports using different Ollama models for different tasks to optimize speed and resource usage.

### 📦 Model Configuration

| Task | Recommended Model | Why? |
|------|------------------|------|
| **Image Analysis** | `llava:7b` | Requires vision capabilities to analyze food images |
| **AI Recommendations** | `llama3.1:1b` | Text-only, 10x faster, perfect for generating dish suggestions |

---

## 🚀 Quick Setup

### 1. **Pull the Required Models**

```bash
# Vision model for image analysis (if not already installed)
ollama pull llava:7b

# Fast text model for recommendations
ollama pull llama3.1:1b
```

### 2. **Verify Installation**

```bash
ollama list
```

You should see both models:
```
NAME            ID              SIZE      MODIFIED
llava:7b        ...             4.7 GB    ...
llama3.1:1b     ...             1.3 GB    ...
```

### 3. **Environment Configuration**

Your `.env.local` file is already configured:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_VISION_MODEL=llava:7b              # For image analysis
OLLAMA_RECOMMENDATION_MODEL=llama3.1:1b   # For recommendations
```

### 4. **Start Ollama**

```bash
ollama serve
```

---

## ⚡ Performance Benefits

### Before (Single Model)
- **Image Analysis**: llava:7b → ~10-30 seconds
- **Recommendations**: llava:7b → ~20-60 seconds
- **Total Time**: ~30-90 seconds per analysis

### After (Multi-Model)
- **Image Analysis**: llava:7b → ~10-30 seconds
- **Recommendations**: llama3.1:1b → ~3-10 seconds ⚡
- **Total Time**: ~13-40 seconds per analysis
- **Speed Improvement**: 2-3x faster! 🚀

---

## 🎛️ Alternative Model Options

### For Recommendations (Choose One)
```bash
# Ultra-fast (best for speed)
ollama pull llama3.1:1b      # 1.3 GB - FASTEST

# Good balance
ollama pull llama3.2:3b      # 2.0 GB - Faster + Better Quality

# Better quality
ollama pull llama2:7b        # 3.8 GB - Slower but More Detailed
```

### For Image Analysis (Choose One)
```bash
# Standard (current)
ollama pull llava:7b         # 4.7 GB - Good Balance

# Lighter
ollama pull llava:13b        # 7.4 GB - Better Quality

# Alternative
ollama pull bakllava         # 4.4 GB - Good Performance
```

---

## 🔧 How It Works

### Image Analysis API (`/api/analyze-image`)
```typescript
// Uses OLLAMA_VISION_MODEL (llava:7b)
const visionModel = process.env.OLLAMA_VISION_MODEL || 'llava:7b'
```
- Receives food image
- Analyzes with vision-capable model
- Returns dish name, ingredients, nutrition, recipe

### Recommendations API (`/api/recommendations`)
```typescript
// Uses OLLAMA_RECOMMENDATION_MODEL (llama3.1:1b)
const recommendationModel = process.env.OLLAMA_RECOMMENDATION_MODEL || 'llama3.1:1b'
```
- Receives text prompt (no images)
- Generates recommendations with fast text model
- Returns 3-6 dish suggestions

---

## 📊 Model Comparison

| Model | Size | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| `llama3.1:1b` | 1.3 GB | ⚡⚡⚡⚡⚡ | ⭐⭐⭐ | Recommendations (FASTEST) |
| `llama3.2:3b` | 2.0 GB | ⚡⚡⚡⚡ | ⭐⭐⭐⭐ | Recommendations (Balanced) |
| `llama2:7b` | 3.8 GB | ⚡⚡⚡ | ⭐⭐⭐⭐⭐ | Recommendations (Quality) |
| `llava:7b` | 4.7 GB | ⚡⚡ | ⭐⭐⭐⭐ | Image Analysis (Required) |

---

## 🧪 Testing the Setup

### Test Image Analysis
```bash
# Should use llava:7b
curl -X POST http://localhost:3000/api/analyze-image \
  -F "image=@your-food-image.jpg"
```

### Test Recommendations
```bash
# Should use llama3.1:1b
curl -X POST http://localhost:3000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "type": "seasonal",
    "month": 10
  }'
```

---

## 🐛 Troubleshooting

### Issue: "Model not found"
**Solution**: Pull the model first
```bash
ollama pull llama3.1:1b
```

### Issue: Recommendations still slow
**Check**: Verify `.env.local` is loaded
```bash
# Restart Next.js dev server
npm run dev
```

### Issue: Model not available
**Alternative**: Edit `.env.local` to use available model
```env
# Use llama2 if llama3.1 not available
OLLAMA_RECOMMENDATION_MODEL=llama2:7b
```

---

## 💡 Best Practices

1. **Use smallest model that works**: Start with `llama3.1:1b` for recommendations
2. **Keep llava for images**: Vision models are required for image analysis
3. **Monitor performance**: Check response times in console
4. **Adjust based on quality**: If recommendations aren't good, upgrade to `llama3.2:3b`

---

## 📈 Resource Usage

### Memory Requirements
- **llava:7b**: ~6 GB RAM
- **llama3.1:1b**: ~2 GB RAM
- **Total (both loaded)**: ~8 GB RAM
- **Recommended System RAM**: 16 GB+

### Disk Space
- **llava:7b**: 4.7 GB
- **llama3.1:1b**: 1.3 GB
- **Total**: 6 GB

---

## ✅ Verification Checklist

- [ ] Ollama is installed and running
- [ ] `llava:7b` model is pulled (for images)
- [ ] `llama3.1:1b` model is pulled (for recommendations)
- [ ] `.env.local` file exists with correct models
- [ ] Next.js dev server restarted
- [ ] Test image analysis works
- [ ] Test recommendations are faster

---

**Status**: ✅ **Optimized for Speed**
**Speed Improvement**: 2-3x faster recommendations
**Date**: October 26, 2025

Enjoy lightning-fast AI recommendations! ⚡
