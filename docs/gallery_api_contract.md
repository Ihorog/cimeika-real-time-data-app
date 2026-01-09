# Gallery API Contract (Phase 8 – Living Memory)

**Base path:** `/api/v1/gallery`

## Data Model

Media item schema:

```json
{
  "id": "string",
  "type": "photo|video",
  "date": "ISO 8601 string",
  "location": "string",
  "emotion": "calm|happy|nostalgic|sad|neutral",
  "resonance": "float 0-1",
  "tags": ["string"],
  "linked_event": "optional string",
  "note": "optional string",
  "source": "archive|upload"
}
```

## Endpoints

### GET `/list`
Returns the user gallery with summary buckets.

**Response 200**
```json
{
  "status": "ok",
  "module": "gallery",
  "data": {
    "items": [
      {
        "id": "g-aurora",
        "type": "photo",
        "date": "2024-11-21T07:20:00Z",
        "location": "Kyiv, UA",
        "emotion": "happy",
        "resonance": 0.86,
        "tags": ["sunrise", "city", "calm"],
        "linked_event": "calendar-walk-001",
        "note": "Ранковий променад з кавою",
        "source": "archive"
      }
    ],
    "summary": {
      "count": 3,
      "emotionCounts": {"happy": 1, "nostalgic": 1, "calm": 1},
      "latest": ["..."]
    }
  }
}
```

### POST `/upload`
Mock upload of a photo/video; data is persisted to `data/gallery.json`.

**Request body**
```json
{
  "type": "photo",
  "date": "2024-12-01T00:00:00Z",
  "location": "Lviv, UA",
  "tags": ["winter"],
  "note": "Evening lights"
}
```

**Response 201**
```json
{
  "status": "ok",
  "module": "gallery_upload",
  "data": {
    "item": {
      "id": "g-<uuid>",
      "emotion": "neutral",
      "resonance": 0.5,
      "linked_event": null,
      "note": "Evening lights",
      "tags": ["winter"]
    }
  }
}
```

### POST `/mood`
Bridges to Python mock analyzer `ci_mitca_gallery.py` (function `analyze_mood`).
Caches the result to `data/gallery_moods.json`.

**Request body**
```json
{"imagePath": "./public/test.jpg"}
```

**Response 200**
```json
{
  "status": "ok",
  "module": "gallery_mood",
  "data": {
    "image": "./public/test.jpg",
    "emotion": "happy",
    "resonance": 0.78,
    "analyzed_at": "2024-05-12T10:10:00Z",
    "cached": false,
    "cacheSize": 1,
    "source": "ci_mitca_gallery"
  }
}
```

### POST `/link`
Links media to Calendar/Nastrij context.

**Request body**
```json
{"id": "g-aurora", "linked_event": "calendar-link-777"}
```

**Response 200**
```json
{
  "status": "ok",
  "module": "gallery_link",
  "data": {
    "item": {
      "id": "g-aurora",
      "linked_event": "calendar-link-777"
    }
  }
}
```

### GET `/story`
Builds a visual story using the first three media entries and Kazkar hints.

**Response 200**
```json
{
  "status": "ok",
  "module": "gallery_story",
  "data": {
    "story": "Казкар сплітає 3 фрагменти пам'яті: Kyiv, UA (happy), ...",
    "itemsUsed": ["..."],
    "moodHints": 2,
    "kazkarSource": "/api/v1/kazkar/story",
    "calendarLink": "/api/v1/calendar/link"
  }
}
```

## Client helper
`frontend/src/utils/galleryClient.js` exposes helpers:

```js
import { listGallery, uploadMedia, analyzeMood, linkMedia, fetchStory } from "./galleryClient";

const gallery = await listGallery();
await uploadMedia({ type: "photo", date: new Date().toISOString(), location: "Kyiv" });
```

## Tests
Run gallery tests in isolation:

```bash
npm test -- --runInBand __tests__/api_v1_gallery.test.js
```
