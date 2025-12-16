import { get, post } from "../lib/api";

const GALLERY_BASE_PATH = "/api/v1/gallery";

async function unwrap(response, message = "Gallery service unavailable") {
  if (!response || response.status === "error") {
    throw new Error(response?.error || message);
  }

  return response.data;
}

export async function listGallery() {
  const payload = await get(`${GALLERY_BASE_PATH}/list`);
  return unwrap(payload);
}

export async function uploadMedia(payload) {
  const payloadResponse = await post(`${GALLERY_BASE_PATH}/upload`, payload);
  return unwrap(payloadResponse);
}

export async function analyzeMood(imagePath) {
  const payload = await post(`${GALLERY_BASE_PATH}/mood`, { imagePath });
  return unwrap(payload, "Gallery mood analyzer unavailable");
}

export async function linkMedia(id, linkedEvent) {
  const payload = await post(`${GALLERY_BASE_PATH}/link`, { id, linked_event: linkedEvent });
  return unwrap(payload);
}

export async function fetchStory() {
  const payload = await get(`${GALLERY_BASE_PATH}/story`);
  return unwrap(payload);
}

export function resonanceColor(resonance = 0.5) {
  const clamped = Math.min(Math.max(resonance, 0), 1);
  const start = [56, 189, 248]; // sky-400
  const end = [244, 114, 182]; // pink-400
  const mix = start.map((value, idx) => Math.round(value + (end[idx] - value) * clamped));
  return `rgb(${mix.join(",")})`;
}
