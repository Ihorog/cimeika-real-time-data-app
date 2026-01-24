# Аудіо Дані / Audio Data

Ця папка призначена для зберігання метаданих та конфігурацій, пов'язаних з аудіо.

This folder is for storing metadata and configurations related to audio.

## Призначення / Purpose

- Метадані аудіофайлів (назви, тривалість, теги)
- Плейлісти у форматі JSON
- Налаштування аудіо для різних модулів
- Audio file metadata (titles, duration, tags)
- Playlists in JSON format
- Audio settings for different modules

## Приклад структури / Example structure

```json
{
  "audio_files": [
    {
      "id": "welcome_sound",
      "filename": "welcome.mp3",
      "duration": 3.5,
      "module": "ci",
      "category": "notification"
    }
  ],
  "playlists": [
    {
      "id": "mood_relaxation",
      "name": "Релаксація / Relaxation",
      "files": ["ambient1.mp3", "ambient2.mp3"]
    }
  ]
}
```
