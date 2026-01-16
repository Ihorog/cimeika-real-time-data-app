import argparse
import hashlib
import json
import random
from datetime import datetime
from pathlib import Path

EMOTIONS = ["calm", "happy", "nostalgic", "sad", "neutral"]
BASE_DIR = Path(__file__).resolve().parent.parent
CACHE_PATH = BASE_DIR / "data" / "gallery_moods.json"


def load_cache():
    if CACHE_PATH.exists():
        return json.loads(CACHE_PATH.read_text(encoding="utf-8"))
    return {}


def save_cache(cache):
    CACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
    CACHE_PATH.write_text(json.dumps(cache, ensure_ascii=False, indent=2), encoding="utf-8")


def _seed_from_path(image_path: str) -> int:
    digest = hashlib.sha256(str(image_path).encode("utf-8")).hexdigest()
    return int(digest[:12], 16)


def _emotion_from_seed(seed: int) -> str:
    chooser = random.Random(seed * 13 + 7)
    return chooser.choice(EMOTIONS)


def _resonance_from_seed(seed: int) -> float:
    sampler = random.Random(seed + 101)
    return round(sampler.uniform(0.32, 0.97), 2)


def analyze_mood(image_path: str) -> dict:
    """
    Аналізує зображення на предмет емоційного спектра.
    Повертає словник із полями:
    - emotion: calm|happy|nostalgic|sad|neutral
    - resonance: float (0.0–1.0)
    """
    cache = load_cache()
    normalized_path = str(Path(image_path))

    if normalized_path in cache:
        stored = cache[normalized_path].copy()
        stored["cached"] = True
        return stored

    seed = _seed_from_path(normalized_path)
    result = {
        "emotion": _emotion_from_seed(seed),
        "resonance": _resonance_from_seed(seed),
        "analyzed_at": datetime.utcnow().isoformat() + "Z",
        "cached": False
    }

    cache[normalized_path] = {
        "emotion": result["emotion"],
        "resonance": result["resonance"],
        "analyzed_at": result["analyzed_at"]
    }
    save_cache(cache)
    return result


def main():
    parser = argparse.ArgumentParser(description="Cimeika Gallery mood analyzer (mock)")
    parser.add_argument("--image", required=True, help="Path to the image asset")
    args = parser.parse_args()

    payload = analyze_mood(args.image)
    print(json.dumps(payload, ensure_ascii=False))


if __name__ == "__main__":
    main()
