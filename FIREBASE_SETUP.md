# Firebase Setup Guide - 5 Minutes

Firebase Realtime Database replaces the WebSocket server with Google's hosted database. Much simpler!

## Step 1: Create Firebase Project (2 minutes)

1. Go to [firebase.google.com](https://firebase.google.com)
2. Click **"Get started"** (sign in with Google)
3. Click **"Add project"**
4. Name it `golden-triangle` → Click Continue
5. Disable Google Analytics (not needed) → Create project
6. Wait ~30 seconds for it to create

## Step 2: Enable Realtime Database (1 minute)

1. In Firebase Console, click **"Realtime Database"** in left sidebar
2. Click **"Create Database"**
3. Choose location (United States or closest to you)
4. Select **"Start in test mode"** → Click Enable
   *(Test mode = open access for development, we'll secure it later)*

## Step 3: Get Your Config (1 minute)

1. Click the **⚙️ gear icon** → Project settings
2. Scroll down to **"Your apps"**
3. Click the **Web icon** `</>`
4. Name it `golden-triangle-web` → Click Register
5. **Copy the firebaseConfig object** - you'll need this next!

It looks like:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "golden-triangle-abc123.firebaseapp.com",
  databaseURL: "https://golden-triangle-abc123-default-rtdb.firebaseio.com",
  projectId: "golden-triangle-abc123",
  storageBucket: "golden-triangle-abc123.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Step 4: Add Config to Your Project (1 minute)

1. Open `firebase-config.js` in your project
2. **Replace** the placeholder values with your actual config from Step 3
3. Save the file

## Step 5: Deploy to Vercel

```bash
git add .
git commit -m "Add Firebase for multiplayer"
git push origin main
```

Then deploy to Vercel (same as before - just import your GitHub repo).

## Done! 🎉

Your game will now use Firebase for multiplayer:
- No server to deploy
- No Railway needed
- Just Vercel + Firebase
- Free tier: 1GB storage, 10GB/month bandwidth (plenty for your game)

Test it by opening your Vercel URL and clicking "Create Game"!
