#!/usr/bin/env bash
# ============================================================
#  Cimeika API — автодеплой та тестування на Hugging Face
# ------------------------------------------------------------
#  ПЕРЕД ЗАПУСКОМ:
#    export HF_WRITE_TOKEN="<ваш HF write token>"
#    export OPENAI_API_KEY="<ваш OpenAI key>"
#    # (необов’язково) export OPENWEATHER_KEY="<OpenWeather key>"
# ============================================================
set -euo pipefail

# Ensure script runs from its directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# --- Перевірка необхідних інструментів -------------------------------------
for cmd in git curl python3 pip; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "❌  Не знайдено '$cmd'. Встановіть його і повторіть."
    exit 1
  fi
done

# huggingface-cli will be installed below; ensure it's available
if ! command -v huggingface-cli >/dev/null 2>&1; then
  echo "ℹ️  Installing huggingface_hub..."
  python3 -m pip install --quiet --upgrade huggingface_hub >/dev/null
fi

# --- 0. Перевірка необхідних змінних середовища -----------------------------
for var in HF_WRITE_TOKEN OPENAI_API_KEY; do
  if [[ -z "${!var:-}" ]]; then
    echo "❌  $var не встановлено. Виконайте 'export $var=<value>' і повторіть."
    exit 1
  fi
done

# --- 1. Константи -----------------------------------------------------------
REPO_URL="https://github.com/Ihorog/cimeika-real-time-data-app.git"
REPO_DIR="cimeika-real-time-data-app"
SPACE_NAME="cimeika-api"
HF_SPACE_FULL="Ihorog/${SPACE_NAME}"
HF_SPACE_GIT="https://huggingface.co/spaces/${HF_SPACE_FULL}.git"
SPACE_API_URL="https://ihorog--${SPACE_NAME}.hf.space"  # default URL

# --- 2. Логін ---------------------------------------------------------------
huggingface-cli login --token "$HF_WRITE_TOKEN" --stdout >/dev/null

# --- 4. Клон репозиторію ----------------------------------------------------
if [[ ! -d .git ]]; then
  if [[ ! -d "$REPO_DIR" ]]; then
    git clone "$REPO_URL" "$REPO_DIR"
  fi
  cd "$REPO_DIR"
fi
REPO_DIR="$(basename "$PWD")"

echo "📥  Репозиторій готовий: $REPO_DIR"

# --- 5. Створення / підключення Docker‑Space -------------------------------
if ! huggingface-cli repo info "$HF_SPACE_FULL" &>/dev/null; then
  echo "🚀  Створюємо Space $HF_SPACE_FULL (Docker)..."
  huggingface-cli repo create "$HF_SPACE_FULL" --type space --space-sdk docker
else
  echo "ℹ️  Space $HF_SPACE_FULL вже існує — використовую його."
fi

git remote add hf "$HF_SPACE_GIT" 2>/dev/null || true

echo "🚚  Відправляю код у Space…"

git push hf main --force

# --- 6. Секрети -------------------------------------------------------------
for secret in OPENAI_API_KEY HF_WRITE_TOKEN OPENWEATHER_KEY; do
  if [[ -n "${!secret:-}" ]]; then
    huggingface-cli repo secret set -r "$HF_SPACE_FULL" "$secret" "${!secret}" >/dev/null
  fi
done

echo "🔑  Секрети оновлено."

# --- 7. Очікування запуску Space -------------------------------------------
printf "⏳  Чекаю запуску Space (макс 90 с)…"
for i in {1..18}; do
  STATUS=$(huggingface-cli space status "$HF_SPACE_FULL" 2>/dev/null | grep -o "Running" || true)
  [[ "$STATUS" == "Running" ]] && break
  printf "."; sleep 5
done
echo ""

if [[ "$STATUS" != "Running" ]]; then
  echo "❌  Space не запустився. Перевірте логи у веб‑інтерфейсі Hugging Face."
  exit 1
fi

echo "✅  Space запущено: $SPACE_API_URL"

# --- 8. Локальні залежності та тести ---------------------------------------
if [[ -f requirements.txt ]]; then
  python3 -m pip install --quiet -r requirements.txt >/dev/null
fi
python3 -m pip install --quiet pytest httpx >/dev/null

if [[ -f tests/e2e.py ]]; then
  echo "🧪  Запускаю pytest…"
  pytest -q tests/e2e.py --base-url "$SPACE_API_URL"
else
  echo "⚠️  Тести не знайдено, пропускаю pytest."
fi

echo "\n🚀  Успіх! API працює: $SPACE_API_URL"

