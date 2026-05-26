# Aria — Windows AI Screen Assistant
## Complete Build & Installation Guide

---

## What You're Building

**Aria** is a floating AI assistant for Windows — a clone of Clicky (Mac) that:
- Pops up next to your cursor when you press **Alt+Space**
- Captures your screen with one click
- Sends the screenshot to Claude AI and answers your questions about it
- Lives in your system tray — always available, never in the way

---

## PART 1 — Install the Tools You Need

You only need to do this once on your PC.

### Step 1 — Install Node.js

Node.js is the engine that runs the app.

1. Go to: **https://nodejs.org**
2. Download the **LTS version** (the green button)
3. Run the installer — click Next → Next → Install
4. When done, open **Command Prompt** (press `Win + R`, type `cmd`, hit Enter)
5. Type this and press Enter:
   ```
   node --version
   ```
6. You should see something like `v20.11.0` — that means it worked ✓

---

### Step 2 — Install Git (needed to manage the project)

1. Go to: **https://git-scm.com/download/win**
2. Download and install — all default options are fine
3. Restart Command Prompt after installing

---

## PART 2 — Set Up the Project

### Step 3 — Create the Project Folder

Open **Command Prompt** and run these commands one by one:

```cmd
cd %USERPROFILE%\Desktop
mkdir aria-assistant
cd aria-assistant
mkdir src
mkdir src\assets
```

You now have this folder on your Desktop:
```
aria-assistant/
  src/
    assets/
```

---

### Step 4 — Copy the Source Files

Copy these files into the correct locations:

| File | Put it at |
|------|-----------|
| `package.json`  | `aria-assistant\package.json` |
| `src\main.js`   | `aria-assistant\src\main.js` |
| `src\preload.js`| `aria-assistant\src\preload.js` |
| `src\index.html`| `aria-assistant\src\index.html` |
| `src\settings.html` | `aria-assistant\src\settings.html` |

> All 5 files came with this guide. Just copy-paste them into the right folders.

---

### Step 5 — Add App Icons

Aria needs two icon files to look professional:

**Option A — Use a placeholder (quickest)**
- Skip this step for now and test the app first
- The app will run without icons, they'll just be blank

**Option B — Make real icons (recommended before sharing)**
1. Go to **https://www.favicon.io/favicon-generator/** or **https://cloudconvert.com**
2. Create or upload a square image (any logo/icon you like)
3. Export as:
   - `icon.ico` — put it at `src\assets\icon.ico`
   - `tray.png` (16×16 px PNG) — put it at `src\assets\tray.png`

---

### Step 6 — Install Dependencies

In Command Prompt, make sure you're inside the project folder:

```cmd
cd %USERPROFILE%\Desktop\aria-assistant
```

Now install everything:

```cmd
npm install
```

This downloads Electron and all required packages. It will take 2–5 minutes.
You'll see a progress bar. When it finishes you'll see `found 0 vulnerabilities`.

---

## PART 3 — Get Your API Key

### Step 7 — Sign Up for Anthropic (Free)

1. Go to: **https://console.anthropic.com/**
2. Click **Sign Up** — use your email or Google account
3. Verify your email
4. Go to **API Keys** in the left sidebar
5. Click **Create Key**
6. Copy the key — it looks like: `sk-ant-api03-xxxxxxxxxxxxxxxx`

> **Important:** Save this key somewhere safe. You can only see it once.
> The free tier gives you enough credits to test the app many times.

---

## PART 4 — Run the App

### Step 8 — Start Aria for the First Time

In Command Prompt (inside the aria-assistant folder):

```cmd
npm start
```

Aria will launch. You'll see:
- A small **AI icon in your system tray** (bottom-right of taskbar)
- Nothing else — it hides itself at launch

Press **Alt+Space** — the Aria window pops up next to your cursor!

---

### Step 9 — Enter Your API Key

1. Press **Alt+Space** to open Aria
2. Click the **⚙ Settings** button (top-right of the window)
3. Paste your API key from Step 7
4. Click **Test API Key** — it should say "✓ API key is valid!"
5. Click **Save Settings**

---

### Step 10 — Use Aria

1. Press **Alt+Space** — Aria appears next to your cursor
2. Click **📸 Capture** — Aria takes a screenshot of your screen
3. Type a question like:
   - *"Explain what you see on screen"*
   - *"What should I do next?"*
   - *"Find any errors here"*
4. Press **Enter** — Aria replies with an AI-powered answer!

---

## PART 5 — Build the .EXE Installer

When you're happy with the app and want to share it or install it properly:

### Step 11 — Install Windows Build Tools

You need one extra tool for building:

```cmd
npm install --global windows-build-tools
```

> If this fails, try running Command Prompt **as Administrator**:
> Right-click Command Prompt → "Run as administrator"

---

### Step 12 — Build the Installer

```cmd
npm run build
```

This takes 3–10 minutes. When done, check the `dist/` folder:

```
aria-assistant/
  dist/
    Aria Setup 1.0.0.exe   ← This is your installer!
```

Double-click **`Aria Setup 1.0.0.exe`** to install Aria on your PC like any normal Windows app.

---

### Step 13 — Build a Portable Version (No Install Needed)

If you want a version you can just run without installing (e.g. from a USB drive):

```cmd
npm run build:portable
```

This creates a single `.exe` file you can run anywhere.

---

## PART 6 — Troubleshooting

### "npm is not recognized"
→ Node.js didn't install properly. Re-download from nodejs.org and restart your PC.

### "App opens but Alt+Space doesn't work"
→ Another app might be using Alt+Space. Try closing other apps (especially productivity tools like PowerToys, Notion, etc.)

### "Screenshot fails"
→ Run the app as Administrator. Right-click the app → "Run as administrator"

### "API error: invalid_api_key"
→ Your API key is wrong. Go back to console.anthropic.com, create a new key, and paste it in Settings.

### "API error: insufficient_credits"
→ Your free credits ran out. Go to console.anthropic.com → Billing to add credits ($5 lasts a very long time).

### "Build fails with node-gyp error"
→ Run this, then try again:
```cmd
npm install --global node-gyp
npm install --global windows-build-tools
```

---

## PART 7 — Customization (Optional)

### Change the Hotkey
Open `src/main.js` and find this line:
```javascript
const hotkey = cfg.hotkey || 'Alt+Space';
```
Change `'Alt+Space'` to any combo like `'Ctrl+Shift+A'` or `'F9'`.

### Change the AI Personality
Open `src/index.html` and find the `system:` line in the `send()` function. Edit the text to change how Aria responds.

### Change the App Name
Open `package.json` and change `"productName": "Aria"` to anything you want.

---

## Project File Structure (Final)

```
aria-assistant/
├── package.json          ← App config & build settings
├── node_modules/         ← Auto-installed (don't touch)
├── dist/                 ← Built .exe files go here
└── src/
    ├── main.js           ← Main process (window, hotkey, tray, screenshot)
    ├── preload.js        ← Security bridge between UI and system
    ├── index.html        ← Main chat UI
    ├── settings.html     ← Settings window
    └── assets/
        ├── icon.ico      ← App icon
        └── tray.png      ← System tray icon (16×16)
```

---

## Quick Command Reference

| Task | Command |
|------|---------|
| Run the app (dev mode) | `npm start` |
| Build .exe installer | `npm run build` |
| Build portable .exe | `npm run build:portable` |
| Install dependencies | `npm install` |

---

*Built with Electron + Claude AI (claude-sonnet-4-20250514)*
