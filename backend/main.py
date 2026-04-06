import logging
import os
import re
from typing import Dict

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from transformers import pipeline

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("emotion-api")

MODEL_NAME = os.getenv("EMOTION_MODEL", "j-hartmann/emotion-english-distilroberta-base")
MAX_LENGTH = int(os.getenv("MAX_TEXT_LENGTH", "512"))

app = Flask(__name__)

logger.info("Loading emotion model: %s", MODEL_NAME)
emotion_classifier = pipeline(
    "text-classification",
    model=MODEL_NAME,
    top_k=None,
)
logger.info("Emotion model loaded successfully")

URL_PATTERN = re.compile(r"https?://\S+|www\.\S+", re.IGNORECASE)
MENTION_PATTERN = re.compile(r"@[A-Za-z0-9_]+")
MULTISPACE_PATTERN = re.compile(r"\s+")
EMOJI_PATTERN = re.compile(
    "["
    "\U0001F600-\U0001F64F"  # emoticons
    "\U0001F300-\U0001F5FF"  # symbols & pictographs
    "\U0001F680-\U0001F6FF"  # transport & map symbols
    "\U0001F1E0-\U0001F1FF"  # flags
    "\U00002700-\U000027BF"
    "\U000024C2-\U0001F251"
    "]+",
    flags=re.UNICODE,
)


def preprocess_text(text: str) -> str:
    """Clean raw text before running emotion inference."""
    text = text.lower().strip()
    text = URL_PATTERN.sub(" ", text)
    text = MENTION_PATTERN.sub(" ", text)
    text = EMOJI_PATTERN.sub(" ", text)
    text = MULTISPACE_PATTERN.sub(" ", text)
    return text[:MAX_LENGTH].strip()


def analyze_emotions(text: str) -> Dict:
    cleaned_text = preprocess_text(text)
    if not cleaned_text:
        raise ValueError("Text is empty after preprocessing")

    predictions = emotion_classifier(cleaned_text)
    # `top_k=None` returns [[...]] for a single input in most transformers versions.
    predictions = predictions[0] if predictions and isinstance(predictions[0], list) else predictions

    score_map = {item["label"].lower(): float(item["score"]) for item in predictions}
    top_emotion = max(score_map, key=score_map.get)
    confidence = score_map[top_emotion]

    return {
        "top_emotion": top_emotion,
        "confidence": confidence,
        "all_emotions": score_map,
    }


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": MODEL_NAME}), 200


@app.route("/analyze", methods=["POST"])
def analyze():
    payload = request.get_json(silent=True)
    if not payload or "text" not in payload:
        return jsonify({"error": "Invalid payload. Expected JSON with a 'text' field."}), 400

    text = payload.get("text")
    if not isinstance(text, str):
        return jsonify({"error": "Field 'text' must be a string."}), 400

    try:
        result = analyze_emotions(text)
        return jsonify(result), 200
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception:
        logger.exception("Unexpected inference error")
        return jsonify({"error": "Internal server error during emotion analysis."}), 500


if __name__ == "__main__":
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "5000"))
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    app.run(host=host, port=port, debug=debug)
