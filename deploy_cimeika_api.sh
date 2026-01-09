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
  echo "ℹ️  huggingface-cli not found. Attempting to install huggingface_hub in a virtual environment..."

  # Try to use a virtual environment if possible
  if command -v python3 >/dev/null 2>&1 && python3 -m venv --help >/dev/null 2>&1; then
    VENV_DIR="$SCRIPT_DIR/.hf_venv"
    if [ ! -d "$VENV_DIR" ]; then
      python3 -m venv "$VENV_DIR"
    fi
    . "$VENV_DIR/bin/activate"
    python3 -m pip install --quiet --upgrade pip >/dev/null
    python3 -m pip install --quiet --upgrade huggingface_hub >/dev/null
    export PATH="$VENV_DIR/bin:$PATH"
  else
    # Fallback: try to install globally, but warn about permissions
    echo "⚠️  Could not create a virtual environment. Trying to install huggingface_hub globally (may require sudo or fail if permissions are restricted)..."
    python3 -m pip install --quiet --upgrade huggingface_hub >/dev/null
  fi

  # Check again if huggingface-cli is now available
  if ! command -v huggingface-cli >/dev/null 2>&1; then
    echo "❌ huggingface-cli is still not available. Please install huggingface_hub manually or ensure you have the necessary permissions."
    exit 1
  fi
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

# --- 3. Клон репозиторію ----------------------------------------------------
if [[ -d .git ]]; then
  CURRENT_URL=$(git config --get remote.origin.url)
  if [[ "$CURRENT_URL" != "$REPO_URL" ]]; then
    echo "⚠️  Поточний репозиторій не відповідає $REPO_URL."
    
    # Check for uncommitted changes before deleting
    if git rev-parse --verify HEAD >/dev/null 2>&1 && ! git diff-index --quiet HEAD -- 2>/dev/null; then
      echo "❌  Виявлено незафіксовані зміни в поточному репозиторії."
      echo "   Будь ласка, збережіть зміни перед запуском скрипта або видаліть каталог вручну."
      exit 1
    fi
    
    echo "   Клоную правильний репозиторій..."
    cd ..
    if [[ -d "$REPO_DIR" ]]; then
      rm -rf "$REPO_DIR"
    fi
    git clone "$REPO_URL" "$REPO_DIR"
    cd "$REPO_DIR"
  fi
else
# --- 4. Клон репозиторію ----------------------------------------------------
if [[ -d .git ]]; then
  CURRENT_URL=$(git config --get remote.origin.url)
  if [[ "$CURRENT_URL" != "$REPO_URL" ]]; then
    echo "⚠️  Поточний репозиторій не відповідає $REPO_URL. Клоную правильний репозиторій..."
    cd ..
    if [[ -d "$REPO_DIR" ]]; then
      rm -rf "$REPO_DIR"
    fi
    git clone "$REPO_URL" "$REPO_DIR"
    cd "$REPO_DIR"
  fi
else
  if [[ ! -d "$REPO_DIR" ]]; then
    git clone "$REPO_URL" "$REPO_DIR"
  fi
  cd "$REPO_DIR"
fi
REPO_DIR="$(basename "$PWD")"

echo "📥  Репозиторій готовий: $CURRENT_DIR_BASENAME"

# --- 4. Створення / підключення Docker‑Space -------------------------------
if ! huggingface-cli repo info "$HF_SPACE_FULL" &>/dev/null; then
  echo "🚀  Створюємо Space $HF_SPACE_FULL (Docker)..."
  huggingface-cli repo create "$HF_SPACE_FULL" --type space --space-sdk docker
else
  echo "ℹ️  Space $HF_SPACE_FULL вже існує — використовую його."
fi

git remote add hf "$HF_SPACE_GIT" 2>/dev/null || true

echo "🚚  Відправляю код у Space…"

git push hf main --force

# --- 5. Секрети -------------------------------------------------------------
for secret in OPENAI_API_KEY HF_WRITE_TOKEN WEATHER_API_KEY; do
  if [[ -n "${!secret:-}" ]]; then
    huggingface-cli repo secret set -r "$HF_SPACE_FULL" "$secret" "${!secret}" >/dev/null
  fi
done

echo "🔑  Секрети оновлено."

# --- 6. Очікування запуску Space -------------------------------------------
printf "⏳  Чекаю запуску Space (макс 90 с)…"
SPACE_RUNNING=false
for _ in {1..18}; do
  # Check if space status command succeeds and space is running
  if huggingface-cli space status "$HF_SPACE_FULL" 2>/dev/null | grep -q "Running"; then
    SPACE_RUNNING=true
    break
  fi
  printf "."; sleep 5
done
echo ""

if [[ "$SPACE_RUNNING" != "true" ]]; then
  echo "❌  Space не запустився. Перевірте логи у веб‑інтерфейсі Hugging Face."
  exit 1
fi

echo "✅  Space запущено: $SPACE_API_URL"

# --- 7. Локальні залежності та тести ---------------------------------------
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

printf "\n🚀  Успіх! API працює: %s\n" "$SPACE_API_URL"

