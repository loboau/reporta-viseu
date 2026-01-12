# Deployment Guide - Reporta Viseu

## Quick Deploy (Frontend Only - Recommended for Demo)

The frontend is **self-contained** and includes AI letter generation via Gemini API.
This is all you need for a council presentation demo.

### Option 1: Deploy to Vercel (Free - 5 minutes)

#### Prerequisites
- GitHub account
- Vercel account (free): https://vercel.com

#### Steps

1. **Push code to GitHub**
   ```bash
   cd /Users/lobomau/Documents/reporta
   git init
   git add .
   git commit -m "Initial commit - Reporta Viseu"

   # Create repo on GitHub, then:
   git remote add origin https://github.com/YOUR_USERNAME/reporta-viseu.git
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to https://vercel.com/new
   - Click "Import Git Repository"
   - Select your `reporta-viseu` repo
   - Configure:
     - **Root Directory**: `frontend`
     - **Framework Preset**: Next.js (auto-detected)
   - Click "Deploy"

3. **Add Environment Variable (Optional - for AI letters)**
   - In Vercel dashboard, go to your project
   - Settings > Environment Variables
   - Add:
     - Name: `GEMINI_API_KEY`
     - Value: Your key from https://aistudio.google.com/app/apikey
   - Redeploy

4. **Done!** Your app is live at `https://your-project.vercel.app`

---

## Full Stack Deploy (Frontend + Backend + Database)

Use this if you need persistent data storage.

### Architecture
```
Vercel (Frontend) -----> Railway (Backend + PostgreSQL)
     |                         |
     v                         v
  Next.js 14               Fastify API
  Gemini API               Prisma ORM
                           PostgreSQL
```

### Backend on Railway (Free tier: $5/month credit)

1. **Create Railway account**: https://railway.app

2. **Deploy from GitHub**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repo
   - Set **Root Directory**: `backend`

3. **Add PostgreSQL**
   - In your project, click "New"
   - Select "Database" > "PostgreSQL"
   - Railway auto-links the DATABASE_URL

4. **Add Environment Variables**
   ```
   DATABASE_URL=<auto-set by Railway>
   ANTHROPIC_API_KEY=your_key_here
   PORT=3001
   NODE_ENV=production
   UPLOAD_DIR=./uploads
   BASE_URL=https://your-app.railway.app
   ```

5. **Connect Frontend to Backend**
   - Get your Railway backend URL
   - In Vercel, add env variable:
     - `NEXT_PUBLIC_API_URL=https://your-backend.railway.app`

---

## Alternative: Hostinger VPS Deployment

If you have a Hostinger VPS, you can self-host everything.

### Requirements
- Hostinger VPS with SSH access
- Node.js 20+ installed
- PostgreSQL 15 installed
- PM2 process manager
- Nginx for reverse proxy

### Setup Script
```bash
# SSH into your VPS
ssh user@your-vps-ip

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Clone your repo
git clone https://github.com/YOUR_USERNAME/reporta-viseu.git
cd reporta-viseu

# Setup Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your values
npx prisma migrate deploy
npx prisma db seed
npm run build
pm2 start dist/index.js --name reporta-api

# Setup Frontend
cd ../frontend
npm install
cp .env.example .env.local
# Edit .env.local with your values
npm run build
pm2 start npm --name reporta-web -- start

# Save PM2 config
pm2 save
pm2 startup
```

### Nginx Configuration
```nginx
# /etc/nginx/sites-available/reporta-viseu
server {
    listen 80;
    server_name reporta.yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## Demo Checklist

Before your council presentation:

- [ ] App loads at your URL
- [ ] Map shows Viseu correctly
- [ ] GPS location works (needs HTTPS)
- [ ] Category selection works
- [ ] Photo upload works
- [ ] Letter generation works (test with/without API key)
- [ ] Email link opens correctly
- [ ] Mobile responsive (test on phone)

---

## Troubleshooting

### "Letter generation failed"
- Check if GEMINI_API_KEY is set correctly
- App falls back to local template if API fails

### "Map not loading"
- Leaflet requires HTTPS for GPS
- Vercel provides HTTPS automatically

### "Build failed on Vercel"
- Check Root Directory is set to `frontend`
- Check Node.js version (needs 18+)

---

## Cost Summary

| Service | Cost |
|---------|------|
| Vercel (Frontend) | Free |
| Railway (Backend) | Free ($5 credit) |
| Gemini API | Free (limited) |
| **Total** | **$0** |

---

*Reporta Viseu - Say What?*
