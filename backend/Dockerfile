FROM python:3.9-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

WORKDIR /app

COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

COPY backend ./backend

EXPOSE ${PORT}

CMD ["gunicorn", "backend.main:app", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:${PORT}"]
