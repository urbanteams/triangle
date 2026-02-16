# Deployment Guide - Golden Triangle Multiplayer

This guide will help you deploy the Golden Triangle game with full multiplayer support:
- **Vercel**: Hosts the static frontend (HTML files)
- **Railway**: Hosts the WebSocket server for multiplayer

## Prerequisites

1. GitHub account (you already have this)
2. [Vercel account](https://vercel.com/signup) (free)
3. [Railway account](https://railway.app/) (free tier available)

---

## Part 1: Deploy Server to Railway

### Step 1: Push code to GitHub

```bash
git add .
git commit -m "Prepare for Railway and Vercel deployment"
git push origin main
```

### Step 2: Deploy to Railway

1. Go to [railway.app](https://railway.app/) and sign in with GitHub
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `triangle` repository
5. Railway will detect it's a Node.js app

### Step 3: Configure Railway deployment

1. In Railway dashboard, click on your deployed service
2. Go to **Settings** tab
3. Under **"Root Directory"**, enter: `server`
4. Under **"Start Command"**, it should auto-detect `npm start`
5. Click **"Deploy"**

### Step 4: Get your Railway URL

1. Once deployed, go to the **Settings** tab
2. Under **"Networking"**, click **"Generate Domain"**
3. Copy the generated URL (e.g., `golden-triangle-production.up.railway.app`)
4. **Important**: Your WebSocket URL will be `wss://YOUR-RAILWAY-DOMAIN` (note the `wss://` prefix)

---

## Part 2: Update Frontend with Railway URL

### Step 1: Update index.html

1. Open `index.html` in your code editor
2. Find this line near the top (around line 195):
   ```javascript
   const PRODUCTION_WS_URL = "REPLACE_WITH_YOUR_RAILWAY_URL";
   ```
3. Replace it with your Railway WebSocket URL:
   ```javascript
   const PRODUCTION_WS_URL = "wss://your-railway-domain.up.railway.app";
   ```
   (Replace `your-railway-domain` with your actual Railway domain)

### Step 2: Commit and push changes

```bash
git add index.html
git commit -m "Configure production WebSocket server"
git push origin main
```

---

## Part 3: Deploy Frontend to Vercel

### Step 1: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New..."** → **"Project"**
3. Import your `triangle` repository
4. Vercel will auto-detect the settings (using `vercel.json`)
5. Click **"Deploy"**

### Step 2: Test your deployment

1. Once deployed, Vercel will give you a URL (e.g., `triangle.vercel.app`)
2. Open the URL in your browser
3. Click **"Create Game"** - it should work now!
4. Test with a friend or in two different browser windows:
   - Window 1: Create game, get room code
   - Window 2: Join game with the code

---

## Testing Multiplayer

### Create a Game
1. Go to your Vercel URL
2. Click "Create Game" (choose Regular or Hidden mode)
3. You'll get a 4-character room code
4. Share this code with another player

### Join a Game
1. Another player goes to your Vercel URL
2. Click "Join Game"
3. Enter the room code
4. Game starts automatically when both players are connected!

---

## Local Development

For local development, the server is already configured to work:

```bash
cd server
npm start
```

Then open `http://localhost:8000` - both Create Game and Hot Seat modes will work.

---

## Troubleshooting

### "Create Game" button does nothing
- Check browser console (F12) for errors
- Verify Railway server is running (check Railway dashboard)
- Verify WebSocket URL in `index.html` is correct (starts with `wss://`)

### Connection fails
- Make sure Railway service is deployed and running
- Check Railway logs for errors
- Verify CORS is configured correctly in `server.js`

### Room code not working
- Both players must use the same Vercel URL
- Room codes expire after 30 minutes of inactivity
- Try creating a new room

---

## URLs Summary

After deployment, you'll have:

| Service | Purpose | URL Example |
|---------|---------|-------------|
| Railway | WebSocket server | `wss://triangle-prod.up.railway.app` |
| Vercel | Frontend (game) | `https://triangle.vercel.app` |
| Vercel | Hot Seat mode | `https://triangle.vercel.app/golden-triangle.html` |

---

## Cost

Both services have generous free tiers:
- **Railway**: 500 hours/month free (more than enough for a hobby project)
- **Vercel**: Unlimited free hosting for personal projects

Enjoy your deployed multiplayer Golden Triangle game! 🎮✨
