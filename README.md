# SentinalAI

A production-ready AI-powered Discord moderation bot that uses a Flask emotion detection API to classify message sentiment/emotions in real time and trigger moderation or supportive responses.

## Project Overview

SentinalAI combines:
- A **Python Flask backend** serving Hugging Face emotion inference.
- A **Discord.js v14 bot** that listens to messages and makes moderation decisions.
- A **REST integration layer** between bot and backend for clean service boundaries.

The emotion model used is:
- `j-hartmann/emotion-english-distilroberta-base`

Supported emotions:
- anger, sadness, joy, fear, disgust, neutral, surprise

## Features

### Core Features
- Real-time message analysis via `POST /analyze`.
- Predicts:
  - `top_emotion`
  - `confidence`
  - `all_emotions` score map
- Input preprocessing:
  - lowercase
  - remove links
  - remove mentions
  - remove emojis

### Moderation Logic
- **Anger**: confidence > 0.8 → warns user
- **Sadness**: confidence > 0.7 → supportive message
- **Disgust** (toxicity proxy): confidence > 0.75 → caution user
- **Fear**: confidence > 0.75 → reassurance/support
- **Joy**: logged for moderators (no spam reply)
- **Neutral**: ignored

### Advanced / Resume-Grade Features
- Per-user **rate limiting** to prevent reply spam.
- In-memory **emotion history tracking** per user.
- **Repeated anger detection**: 3 anger events in 10 minutes triggers stronger warning.
- Moderator logging:
  - Console log (always)
  - Optional Discord moderation channel logging
- Thresholds and runtime behavior managed by environment config.
- `!emotionstats` command to show recent emotion events for a user.
- Modular files (`apiClient`, `emotionHandler`, `config`) for maintainability.

## Tech Stack

- **Backend API**: Python, Flask, Transformers, Torch
- **AI/NLP**: Hugging Face model pipeline
- **Bot Runtime**: Node.js, discord.js v14
- **Communication**: REST (`axios` → Flask)
- **Configuration**: `.env` + `.env.example`

## Project Structure

```text
backend/
  main.py
  requirements.txt

bot/
  index.js
  config.js
  package.json
  utils/
    apiClient.js
    emotionHandler.js

.env.example
README.md
```

## Setup Instructions (Step-by-Step)

## 1) Clone and enter project

```bash
git clone <your-repo-url>
cd SentinalAI
```

## 2) Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your Discord credentials and preferred thresholds.

## 3) Start backend API

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

API default URL: `http://127.0.0.1:5000`

Optional check:
```bash
curl http://127.0.0.1:5000/health
```

## 4) Start Discord bot

Open a new terminal:

```bash
cd bot
npm install
npm run start
```

If configured correctly, bot will show:
- `✅ Logged in as <bot-name>`

## 5) Test in Discord

Send messages with different emotional tones and observe moderation behavior.

Try command:
```text
!emotionstats
```

## Example API Usage

### Request

```bash
curl -X POST http://127.0.0.1:5000/analyze \
  -H "Content-Type: application/json" \
  -d '{"text":"I am really upset right now"}'
```

### Response

```json
{
  "top_emotion": "anger",
  "confidence": 0.91,
  "all_emotions": {
    "anger": 0.91,
    "sadness": 0.03,
    "neutral": 0.02,
    "fear": 0.01,
    "joy": 0.01,
    "disgust": 0.01,
    "surprise": 0.01
  }
}
```

## Production Notes

- Run Flask behind a production WSGI server (Gunicorn/Uvicorn workers) and reverse proxy.
- Add persistent storage (Redis/Postgres) for long-term user emotion analytics.
- Restrict bot intents and permissions to least privilege.
- Add centralized logging (e.g., CloudWatch, ELK, Datadog).
- Add retries/circuit breakers for API calls.

## Optional Toxicity Model Support

The architecture is modular and allows extending backend inference with a second classifier (e.g., toxicity model) and returning merged decisions to the bot.

## Future Improvements

- Slash command version of `!emotionstats`.
- Per-server configurable moderation policies.
- Dashboard for moderators with trend charts.
- Alert escalation workflows (mod ping, temporary mute integration).
- Caching and batching optimizations for higher throughput.

## License

MIT (see `LICENSE`).
