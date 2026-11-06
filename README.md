# 🎬 Doc Video Automation Pipeline & Deployment Engine

> Automated pipeline to convert documentation, markdown specifications, technical guides, and release notes into animated video presentations with synchronized narration, visual storyboards, and multi-cloud CI/CD deployment.

**Repository:** `https://github.com/markjosephcandy-bot/Doc_video_automation.git`

---

## ⚡ Quick Start

```bash
# 1. Clone repository
git clone https://github.com/markjosephcandy-bot/Doc_video_automation.git
cd Doc_video_automation

# 2. Install dependencies
npm install

# 3. Start development server & pipeline console
npm run dev
```

The automation console runs on [http://localhost:3000](http://localhost:3000).

---

## 🚀 Automated Deployment Process

The project includes an end-to-end automated deployment pipeline with scripts and GitHub Actions.

### 1. Run Deployment Script Locally or on Server
```bash
# Make script executable
chmod +x ./scripts/deploy.sh

# Run automated deployment (runs checks, lint, build, smoke tests, and packages)
./scripts/deploy.sh

# Target specific environment or mode:
DEPLOY_TARGET=docker ./scripts/deploy.sh
DEPLOY_TARGET=cloud-run ./scripts/deploy.sh
```

### 2. Push & Sync to GitHub Repository Automatically
```bash
# Make script executable
chmod +x ./scripts/push_to_github.sh

# Push changes to markjosephcandy-bot/Doc_video_automation
./scripts/push_to_github.sh "feat: update doc-to-video pipeline engine"

# Or push with your Personal Access Token (PAT):
GITHUB_TOKEN="ghp_yourPersonalAccessToken" ./scripts/push_to_github.sh
```

---

## 🔄 CI/CD Pipeline Architecture

```
[Markdown / Documentation]
           │
           ▼
[Doc Parser & Section Analyzer]
           │
           ▼
[AI Script Synthesizer & Voiceover Generator]
           │
           ▼
[Visual Storyboarder & Scene Stager]
           │
           ▼
[Canvas 60fps Video Player & Audio Sync]
           │
     ┌─────┴───────────────┐
     ▼                     ▼
[Video Export]   [CI/CD Deployment Pipeline]
 (WebM/MP4/JSON)   ├── Step 1: Lint & Typecheck
                   ├── Step 2: Engine Smoke Test
                   ├── Step 3: Production Build
                   ├── Step 4: Docker Container Packaging
                   └── Step 5: Cloud Run / Host Deployment
```

---

## 🛠 Features

- **Document Ingestion**: Supports Markdown, release notes, architecture specifications, API docs, and SOPs.
- **Automated Scene Splitting**: Intelligently segments long-form content into bite-sized 10-25 second presentation scenes.
- **Narrator & Speech Timing**: Generates synchronized voiceover text with timing cues and browser SpeechSynthesis preview.
- **Kinetic Visual Staging**: Animated title cards, bullet highlights, interactive code blocks, architecture flow diagrams, and key stat callouts.
- **Interactive Video Player**: 16:9 preview player with scene scrubbing, timeline playback, caption overlays, and speed controls.
- **Deployment Control Hub**: Built-in visual pipeline orchestrator to monitor, test, and trigger CI/CD builds with live logs.
- **GitHub Sync Station**: Direct in-app GitHub repository connection, status inspector, and automated push utility.

---

## 🐳 Docker Deployment

```bash
# Build Docker image
docker build -t doc-video-automation:latest .

# Run container
docker run -p 3000:3000 doc-video-automation:latest

# Or using Docker Compose
docker compose up -d
```

---

## 🔒 Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Web server port (default: `3000`) |
| `GEMINI_API_KEY` | Optional: Gemini API key for smart document script synthesis |
| `GITHUB_TOKEN` | Optional: GitHub Personal Access Token for automated pushing |
| `DEPLOY_TARGET` | Deployment target (`docker`, `cloud-run`, `local`, `vercel`) |

---

*Automated by Doc_video_automation Pipeline.*
