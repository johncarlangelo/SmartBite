# Deployment Guide

## Overview

This guide provides instructions for deploying SmartBite in different environments. The application can be deployed locally for personal use or on a server for shared access.

## Prerequisites

### System Requirements
- Node.js 18.x or higher
- npm 9.x or higher
- Ollama service
- At least 8GB RAM (16GB recommended)
- 20GB free disk space (for Ollama models and application data)

### Dependencies
- Ollama with LLaVA model
- SQLite (included with better-sqlite3 package)
- TypeScript compiler
- Next.js runtime

## Local Deployment

### 1. Install Ollama

Download and install Ollama from [https://ollama.com](https://ollama.com)

### 2. Pull the LLaVA Model

```bash
ollama pull llava:7b
```

### 3. Verify Ollama Installation

```bash
ollama list
```

You should see the llava model in the list.

### 4. Clone the Repository

```bash
git clone <repository-url>
cd smartbite/nextjs-app
```

### 5. Install Dependencies

```bash
npm install
```

### 6. Environment Configuration

Create a `.env.local` file in the `nextjs-app` directory:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_VISION_MODEL=llava:7b
OLLAMA_ONLINE_MODEL=llava:7b
```

### 7. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 8. Build for Production

```bash
npm run build
```

### 9. Start Production Server

```bash
npm run start
```

## Server Deployment

### 1. Server Requirements

- Ubuntu 20.04 LTS or newer (recommended)
- 16GB RAM minimum
- 50GB disk space
- Non-root user with sudo privileges

### 2. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull model
ollama pull llava:7b
```

### 3. Deploy Application

```bash
# Clone repository
git clone <repository-url>
cd smartbite/nextjs-app

# Install dependencies
npm install

# Build application
npm run build
```

### 4. Environment Configuration

Create `.env.production`:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_VISION_MODEL=llava:7b
OLLAMA_ONLINE_MODEL=llava:7b
```

### 5. Process Management

Install PM2 for process management:

```bash
npm install -g pm2
```

Create ecosystem.config.js:

```javascript
module.exports = {
  apps: [{
    name: 'smartbite',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: './',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

Start with PM2:

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 6. Reverse Proxy (Nginx)

Install Nginx:

```bash
sudo apt install nginx -y
```

Create configuration file `/etc/nginx/sites-available/smartbite`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/smartbite /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 7. SSL Certificate (Let's Encrypt)

Install Certbot:

```bash
sudo apt install certbot python3-certbot-nginx -y
```

Obtain certificate:

```bash
sudo certbot --nginx -d your-domain.com
```

## Docker Deployment

### 1. Dockerfile

Create a Dockerfile in the project root:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY nextjs-app/package*.json ./
RUN npm install

COPY nextjs-app/ .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
```

### 2. Docker Compose

Create docker-compose.yml:

```yaml
version: '3.8'
services:
  smartbite:
    build: .
    ports:
      - "3000:3000"
    environment:
      - OLLAMA_BASE_URL=http://host.docker.internal:11434
    volumes:
      - ./data:/app/data
    depends_on:
      - ollama

  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama:/root/.ollama

volumes:
  ollama:
```

### 3. Build and Run

```bash
docker-compose up -d
```

## Environment Variables

### Required Variables
- `OLLAMA_BASE_URL`: Base URL for Ollama service (default: http://localhost:11434)
- `OLLAMA_VISION_MODEL`: Model for offline analysis (default: llava:7b)
- `OLLAMA_ONLINE_MODEL`: Model for online analysis (default: llava:7b)

### Optional Variables
- `NODE_ENV`: Environment (development|production)
- `PORT`: Port to run the application on (default: 3000)

## Monitoring and Maintenance

### Logs
View application logs:

```bash
# Development
npm run dev

# Production (PM2)
pm2 logs smartbite

# Docker
docker-compose logs smartbite
```

### Database Maintenance
The SQLite database is self-maintaining, but you can:
- Monitor size growth in the `data/` directory
- Backup the `data/analyses.db` file regularly
- Clear the database by deleting the file (cache will rebuild automatically)

### Performance Monitoring
- Monitor Ollama resource usage
- Track response times for cache hits vs. AI analysis
- Monitor database size growth

## Troubleshooting

### Common Issues

1. **Ollama Not Responding**
   - Check if Ollama service is running: `systemctl status ollama`
   - Verify model is loaded: `ollama list`
   - Check firewall settings for port 11434

2. **Cache Not Working**
   - Verify database file permissions
   - Check if the `data` directory is writable
   - Ensure the database service is initializing correctly

3. **Slow Analysis**
   - Verify system has sufficient RAM
   - Check CPU usage during analysis
   - Ensure GPU acceleration is enabled if available

4. **Deployment Issues**
   - Check PM2 logs for application errors
   - Verify environment variables are set correctly
   - Ensure all dependencies are installed

### Debugging Steps

1. Check application logs
2. Verify Ollama is accessible
3. Test API endpoints directly
4. Confirm database connectivity
5. Validate environment configuration

## Security Considerations

### Data Privacy
- All image processing happens locally
- No external data transmission
- User history stored in browser localStorage
- Cached results stored server-side without personal identifiers

### Access Control
- No authentication required for local use
- Implement authentication for shared deployments
- Use HTTPS in production environments
- Restrict access to the Ollama API if needed

### Updates
- Regularly update Node.js and dependencies
- Keep Ollama updated to latest version
- Monitor security advisories for dependencies