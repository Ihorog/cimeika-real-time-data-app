# Аудіо / Audio

Ця папка призначена для зберігання аудіофайлів, які використовуються в застосунку Cimeika.

This folder is for storing audio files used in the Cimeika application.

## Структура / Structure

- Звукові ефекти / Sound effects
- Музика / Music  
- Голосові повідомлення / Voice messages
- Аудіо-нотифікації / Audio notifications

## Підтримувані формати / Supported formats

- MP3
- WAV
- OGG
- M4A

## Використання / Usage

Аудіофайли з цієї папки доступні через Express статичний сервер за шляхом `/audio/`.

Audio files from this folder are accessible via Express static server at `/audio/`.

Example:
```
http://localhost:7860/audio/notification.mp3
```
