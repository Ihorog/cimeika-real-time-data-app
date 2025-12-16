import type { Bundle, Concept } from "./types";

// Local seed (потрібно створити файл і вставити повний bundle JSON)
import localBundle from "../../data/core7_bundle_v1.json";

type StoreResponse = {
  status?: string;
  module?: string;
  id?: string;
  payload?: any;
};

function env(key: string, fallback = ""): string {
  return (process.env[key] ?? fallback).toString();
}

function asBundle(maybe: any): Bundle {
  // store може повертати bundle або обгортку з payload
  const b = (maybe?.bundle_id ? maybe : maybe?.payload) ?? maybe;

  if (!b?.bundle_id || !Array.isArray(b?.concepts) || !b?.graph?.nodes) {
    throw new Error("Invalid bundle shape");
  }
  return b as Bundle;
}

async function loadFromStore(): Promise<Bundle | null> {
  const base = env("NEXT_PUBLIC_CIMEIKA_API_BASE");
  const storeId = env("NEXT_PUBLIC_ENCYCLOPEDIA_STORE_ID");

  if (!base || !storeId) return null;

  const url = `${base.replace(/\/$/, "")}/api/v1/store/${encodeURIComponent(storeId)}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;

  const json = (await res.json()) as StoreResponse;
  // очікуємо, що bundle лежить у json.payload або json.payload.payload (залежно від реалізації)
  const candidate =
    json?.payload?.payload ??
    json?.payload ??
    json;

  return asBundle(candidate);
}

export async function getBundle(): Promise<Bundle> {
  const source = env("NEXT_PUBLIC_ENCYCLOPEDIA_SOURCE", "local");

  if (source === "store") {
    try {
      const storeBundle = await loadFromStore();
      if (storeBundle) return storeBundle;
    } catch {
      // fallback нижче
    }
  }

  return asBundle(localBundle);
}

export async function getConcept(id: string): Promise<Concept | null> {
  const bundle = await getBundle();
  return bundle.concepts.find((c) => c.id === id) ?? null;
}

export async function getConceptMap(): Promise<Record<string, Concept>> {
  const bundle = await getBundle();
  return Object.fromEntries(bundle.concepts.map((c) => [c.id, c]));
}