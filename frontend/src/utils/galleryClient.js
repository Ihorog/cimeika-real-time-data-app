import axios from "axios";

const DEFAULT_API_BASE = "http://localhost:3000/api/v1";
const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE).replace(/\/$/, "");

const galleryClient = axios.create({
  baseURL: `${apiBase}/gallery`,
  timeout: 7000,
});

export async function listGallery() {
  const { data } = await galleryClient.get("/list");
  return data;
}

export async function uploadMedia(payload) {
  const { data } = await galleryClient.post("/upload", payload);
  return data;
}

export async function analyzeMood(imagePath) {
  const { data } = await galleryClient.post("/mood", { imagePath });
  return data;
}

export async function linkMedia(id, linkedEvent) {
  const { data } = await galleryClient.post("/link", { id, linked_event: linkedEvent });
  return data;
}

export async function fetchStory() {
  const { data } = await galleryClient.get("/story");
  return data;
}

export function resonanceColor(resonance = 0.5) {
  const clamped = Math.min(Math.max(resonance, 0), 1);
  const start = [56, 189, 248]; // sky-400
  const end = [244, 114, 182]; // pink-400
  const mix = start.map((value, idx) => Math.round(value + (end[idx] - value) * clamped));
  return `rgb(${mix.join(",")})`;
}

export default galleryClient;
