# 🚀 Deployment Guide - AI Prompt Library Pro

## 📋 **Prerequisites**

- Docker & Docker Compose
- Git
- Domain name (for production)
- SSL certificate (recommended)

## 🏠 **Local Development**

### Method 1: Python Server (Simplest)
```bash
cd web-app
python3 -m http.server 8000
# Access: http://localhost:8000/src/index.html
```

### Method 2: Docker Development
```bash
# Build and run development container
docker-compose --profile dev up -d prompt-library-dev
# Access: http://localhost:8080/src/
```

## 🐳 **Docker Production Deployment**

### 1. Build Production Image
```bash
# Build the production image
docker build -t prompt-library-pro .

# Run production container
docker run -d -p 80:80 --name prompt-library-pro prompt-library-pro
```

### 2. Docker Compose Production
```bash
# Production deployment
docker-compose up -d prompt-library-pro

# View logs
docker-compose logs -f prompt-library-pro

# Scale horizontally (if needed)
docker-compose up -d --scale prompt-library-pro=3
```

## ☁️ **Cloud Deployment Options**

### **Option 1: Vercel (Recommended for Static Sites)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
# Follow prompts, set build directory to 'web-app'
```

### **Option 2: Netlify**
```bash
# Drag and drop 'web-app' folder to Netlify
# Or connect GitHub repo with build settings:
# - Build command: (none)
# - Publish directory: web-app
```

### **Option 3: AWS S3 + CloudFront**
```bash
# Sync to S3 bucket
aws s3 sync web-app/ s3://your-bucket-name --delete

# Setup CloudFront distribution for CDN
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

### **Option 4: Digital Ocean Apps**
```yaml
# app.yaml
name: prompt-library-pro
services:
- name: web
  source_dir: /web-app
  github:
    repo: your-username/prompt-library
    branch: main
  routes:
  - path: /
  http_port: 8080
```

### **Option 5: Heroku**
```bash
# Create Heroku app
heroku create prompt-library-pro

# Deploy
git push heroku main
```

## 🔧 **Advanced Production Setup**

### 1. SSL/HTTPS Setup
```bash
# Using Let's Encrypt with Nginx
docker run -d \
  --name certbot \
  -v /etc/letsencrypt:/etc/letsencrypt \
  -v /var/www/certbot:/var/www/certbot \
  certbot/certbot \
  certonly --webroot -w /var/www/certbot -d yourdomain.com
```

### 2. Load Balancer Configuration
```yaml
# nginx-lb.conf
upstream app_servers {
    server prompt-library-pro-1:80;
    server prompt-library-pro-2:80;
    server prompt-library-pro-3:80;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /etc/ssl/certs/yourdomain.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.key;
    
    location / {
        proxy_pass http://app_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 3. Monitoring & Analytics
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  prompt-library-pro:
    # ... existing config
    
  monitoring:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      
  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=your-password
```

## 🌍 **CDN Integration**

### CloudFront Configuration
```json
{
  "CallerReference": "prompt-library-pro-2024",
  "Aliases": {
    "Quantity": 1,
    "Items": ["yourdomain.com"]
  },
  "DefaultRootObject": "src/index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [{
      "Id": "prompt-library-s3",
      "DomainName": "your-bucket.s3.amazonaws.com",
      "S3OriginConfig": {
        "OriginAccessIdentity": ""
      }
    }]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "prompt-library-s3",
    "ViewerProtocolPolicy": "redirect-to-https",
    "Compress": true
  }
}
```

## 📊 **Performance Optimization**

### 1. Enable Compression
```nginx
# In nginx.conf (already included)
gzip on;
gzip_types application/javascript application/json text/css;
```

### 2. Browser Caching
```nginx
# Static assets - 1 year cache
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. Preload Critical Resources
```html
<!-- Add to index.html <head> -->
<link rel="preload" href="app.js" as="script">
<link rel="preload" href="data/professional-prompts.json" as="fetch" crossorigin>
```

## 🔒 **Security Hardening**

### 1. Security Headers (in nginx.conf)
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

### 2. Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">
```

## 🧪 **Testing & Validation**

### 1. Pre-deployment Tests
```bash
# Run validation tests
./scripts/validate-deployment.sh

# Performance testing
lighthouse --chrome-flags="--headless" --output-path=./reports/lighthouse.html --output=html http://localhost

# Security scan
docker run --rm -v $(pwd):/app clair-scanner --ip=localhost prompt-library-pro
```

### 2. Health Checks
```bash
# Basic health check
curl -f http://localhost/src/index.html || exit 1

# JSON validation
curl -s http://localhost/src/data/professional-prompts.json | jq . > /dev/null
```

## 📈 **Scaling Considerations**

### Horizontal Scaling
```yaml
# docker-compose.scale.yml
version: '3.8'
services:
  prompt-library-pro:
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
```

### Database Integration (Future)
```yaml
  # When moving to dynamic backend
  database:
    image: postgres:15
    environment:
      POSTGRES_DB: promptlibrary
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      
  redis:
    image: redis:alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
```

## 🚨 **Troubleshooting**

### Common Issues

**1. 404 Errors on Refresh**
```nginx
# Ensure proper fallback in nginx.conf
location / {
    try_files $uri $uri/ /src/index.html;
}
```

**2. CORS Issues**
```nginx
# Add CORS headers
add_header Access-Control-Allow-Origin "*" always;
add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
```

**3. Large JSON Loading Issues**
```javascript
// Implement chunked loading for large datasets
async function loadPromptsChunked() {
    // Implementation in app.js
}
```

### Debug Commands
```bash
# Check container logs
docker logs prompt-library-pro -f

# Inspect container
docker exec -it prompt-library-pro sh

# Test nginx config
docker exec prompt-library-pro nginx -t

# Check file permissions
docker exec prompt-library-pro ls -la /usr/share/nginx/html/
```

## 📝 **Deployment Checklist**

### Pre-Production
- [ ] All JSON files validated
- [ ] JavaScript syntax checked
- [ ] Performance tested (Lighthouse score > 85)
- [ ] Security headers configured
- [ ] SSL certificate installed
- [ ] Backup strategy implemented
- [ ] Monitoring configured

### Production Deployment
- [ ] DNS configured
- [ ] CDN enabled
- [ ] Monitoring alerts set up
- [ ] Error tracking enabled
- [ ] Performance monitoring active
- [ ] Security scanning enabled
- [ ] Automated backups running

### Post-Deployment
- [ ] Health checks passing
- [ ] Performance metrics within targets
- [ ] Error rates < 1%
- [ ] User feedback collection active
- [ ] Analytics tracking working

---

## 🎯 **Quick Deploy Commands**

### Development
```bash
# Local development
cd web-app && python3 -m http.server 8000
```

### Production
```bash
# Docker production
docker-compose up -d prompt-library-pro

# Cloud deployment (Vercel)
vercel --prod

# Manual sync (S3)
aws s3 sync web-app/ s3://your-bucket --delete
```

**Your AI Prompt Library Pro is ready for professional deployment! 🚀**