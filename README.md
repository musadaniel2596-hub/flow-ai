# Flow AI ⚡

**AI-powered code debugger** — paste code or scan a screenshot and get instant error detection, line-by-line explanations, and corrected code.

---

## Features

- **Custom code editor** — lightweight, no Monaco/CodeMirror, built from scratch
- **Syntax highlighting** — regex-based, supports 15+ languages
- **AI error detection** — powered by OpenRouter (GPT-4, Claude, Llama, and more)
- **Error line highlighting** — visual indicators directly in the editor
- **Corrected code panel** — AI returns the full fixed version
- **Camera / image scanner** — upload a screenshot and AI extracts + analyzes the code
- **Language auto-detection** — client-side heuristic + AI confirmation
- **Dark futuristic UI** — glassmorphism, smooth animations, fully responsive

---

## Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS |
| Backend  | Node.js, Express, TypeScript      |
| AI       | OpenRouter API (multi-model)      |
| Vision   | meta-llama/llama-3.2-90b-vision-instruct |
| Deploy   | Render (backend + frontend)       |

---

## Local Development

### 1. Clone & install

```bash
git clone https://github.com/your-username/flow-ai.git
cd flow-ai

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Configure environment

```bash
# Backend
cp backend/.env.example backend/.env
```

Edit `backend/.env`:
```env
OPENROUTER_API_KEY=your_openrouter_key_here
OPENROUTER_MODEL=openrouter/auto
OPENROUTER_VISION_MODEL=meta-llama/llama-3.2-90b-vision-instruct
FRONTEND_URL=http://localhost:3000
```

### 3. Run backend

```bash
cd backend
npm run dev
# → http://localhost (check server console for actual port)
```

### 4. Run frontend

```bash
cd frontend
npm run dev
# → http://localhost:3000
```

### 5. Open browser

Visit [http://localhost:3000](http://localhost:3000)

---

## Deploy to Render

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/flow-ai.git
git push -u origin main
```

### Step 2 — Deploy the Backend

1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Name:** `flow-ai-backend`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free (or Starter for better performance)
4. Add Environment Variables:
   | Key | Value |
   |-----|-------|
   | `OPENROUTER_API_KEY` | *(your key from openrouter.ai)* |
   | `OPENROUTER_MODEL` | `openrouter/auto` |
   | `OPENROUTER_VISION_MODEL` | `meta-llama/llama-3.2-90b-vision-instruct` |
   | `NODE_ENV` | `production` |
   | `FRONTEND_URL` | *(your frontend URL — set after step 3)* |
5. Click **Create Web Service**
6. Note your backend URL: `https://flow-ai-backend.onrender.com`

### Step 3 — Deploy the Frontend

1. Go to Render → **New → Web Service**
2. Connect the same GitHub repo
3. Configure:
   - **Name:** `flow-ai-frontend`
   - **Root Directory:** `frontend`
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free
4. Add Environment Variables:
   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | `https://flow-ai-backend.onrender.com` |
   | `NODE_ENV` | `production` |
5. Click **Create Web Service**
6. Note your frontend URL: `https://flow-ai-frontend.onrender.com`

### Step 4 — Update CORS

Go back to your **backend service** on Render → Environment → Update:
- `FRONTEND_URL` = `https://flow-ai-frontend.onrender.com`

Trigger a redeploy (Manual Deploy → Deploy latest commit).

### Step 5 — Done! 🎉

Your app is live at: `https://flow-ai-frontend.onrender.com`

---

## API Reference

### `POST /analyze`

Analyze code text.

**Request:**
```json
{ "code": "const x = 5\nconsole.log(x" }
```

**Response:**
```json
{
  "language": "javascript",
  "errors": [
    {
      "line": 2,
      "message": "Missing closing parenthesis",
      "fix": "Add ) at end of console.log call",
      "severity": "error"
    }
  ],
  "fixedCode": "const x = 5;\nconsole.log(x);",
  "summary": "1 syntax error found: missing closing parenthesis."
}
```

### `POST /vision`

Analyze a code screenshot.

**Request:** `multipart/form-data` with `image` field (PNG/JPG/WEBP, max 10MB)

**Response:** Same structure as `/analyze`

### `GET /health`

Health check endpoint.

---

## Get an OpenRouter API Key

1. Visit [openrouter.ai](https://openrouter.ai)
2. Sign up → Dashboard → API Keys → Create Key
3. Free tier includes access to many models including `openrouter/auto`

---

## Project Structure

```
flow-ai/
├── frontend/           # Next.js app
│   └── src/
│       ├── app/        # Pages and layout
│       ├── components/ # Editor, Scanner, AI panels
│       ├── lib/        # API client, syntax highlighter, language detection
│       └── types/      # TypeScript interfaces
│
├── backend/            # Express API
│   └── src/
│       ├── routes/     # /analyze and /vision endpoints
│       ├── services/   # OpenRouter, code analysis, image analysis
│       └── server.ts   # Main Express app
│
├── render.yaml         # Render deployment config
└── README.md
```

---

## License

MIT — built with ❤️ using OpenRouter and Next.js.
"# Flow-Editor" 
