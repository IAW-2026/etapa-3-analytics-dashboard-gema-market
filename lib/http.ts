import { hashApiKey } from "./api-key";

export async function apiFetch<T>(url: string, apiKey: string): Promise<T> {
  const res = await fetch(url, {
    headers: { "x-api-key-hash": hashApiKey(apiKey) },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} — ${url}`);
  return res.json() as Promise<T>;
}
