# SentinalAI — AI-Powered Discord Moderation Bot

SentinalAI is a production-ready Discord moderation bot that uses real-time emotion detection to intelligently respond to user messages. It combines a Flask-based AI backend with a Discord.js bot to deliver smart moderation and support actions.

---

## 🌟 Features

- 🤖 Real-time emotion detection via REST API (`/analyze`)
- 🧠 Detects: anger, sadness, joy, fear, disgust, neutral, surprise
- ⚖️ Smart moderation system:
  - Anger → warning system
  - Sadness → supportive responses
  - Disgust → toxicity-based caution
  - Fear → reassurance messages
  - Joy → logged (no spam replies)
- ⏱ Per-user rate limiting to prevent spam
- 📊 Emotion history tracking (in-memory)
- 🔁 Repeated anger detection (3 triggers → stronger warning)
- 🛠 Moderator logging (console + optional Discord channel)
- 📌 `!emotionstats` command for user emotion insights
- 🧩 Modular architecture for clean scaling

---

## 🧱 Tech Stack

- **Backend**: Python, Flask, Transformers, Torch  
- **AI Model**: `j-hartmann/emotion-english-distilroberta-base`  
- **Bot**: Node.js, discord.js v14  
- **Communication**: REST API (Axios)  
- **Config**: `.env` based  

---

## 📁 Project Structure

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
````

---

## 📦 Installation

```bash
git clone <your-repo-url>
cd SentinalAI
```

Create your environment file:

```bash
cp .env.example .env
```

Add your Discord credentials and config values.

---

## ▶️ Run the Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

Default API:

```
http://127.0.0.1:5000
```

Optional health check:

```bash
curl http://127.0.0.1:5000/health
```

---

## ▶️ Run the Bot

Open a new terminal:

```bash
cd bot
npm install
npm run start
```

If successful:

```
✅ Logged in as <bot-name>
```

---

## 🧪 Usage

Send messages in your Discord server and observe how the bot reacts based on emotional tone.

Check stats:

```text
!emotionstats
```

---

## 🔌 API Example

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

---

## 🚀 Production Notes

* Deploy Flask using Gunicorn/Uvicorn behind a reverse proxy
* Add persistent storage (Redis/Postgres) for long-term tracking
* Use least-privilege Discord bot permissions
* Integrate centralized logging (ELK, Datadog, etc.)
* Add retry + failover handling for API calls

---

## 🔮 Future Improvements

* Slash command version of `!emotionstats`
* Per-server moderation customization
* Moderator dashboard with analytics
* Alert escalation system (auto-mute, mod ping)
* Performance optimizations (caching, batching)

---

## 📄 License

MIT License (see `LICENSE`)

---

Made with 💻 by [@Prakhar](https://github.com/prakharbuilds)
