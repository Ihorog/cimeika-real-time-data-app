# Аудіо для Frontend / Frontend Audio

Ця папка призначена для зберігання аудіофайлів, які використовуються у Next.js frontend застосунку.

This folder is for storing audio files used in the Next.js frontend application.

## Використання / Usage

Аудіофайли з цієї папки доступні через Next.js публічні ресурси за шляхом `/audio/`.

Audio files from this folder are accessible via Next.js public assets at `/audio/`.

Example:
```typescript
// У React компоненті / In React component
<audio src="/audio/welcome.mp3" />

// Або програмно / Or programmatically
const audio = new Audio('/audio/notification.mp3');
audio.play();
```

## Рекомендації / Recommendations

- Використовуйте оптимізовані формати (MP3, OGG) для веб
- Додайте альтернативні формати для кращої сумісності
- Стискайте файли для швидшого завантаження
- Use optimized formats (MP3, OGG) for web
- Add alternative formats for better compatibility
- Compress files for faster loading
