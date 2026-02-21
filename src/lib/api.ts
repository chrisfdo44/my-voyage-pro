// src/lib/api.ts
type Json = Record<string, any>;

async function postJSON<T>(url: string, payload: Json): Promise<T> {
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const msg = (data && (data.error || data.message)) || `Request failed (${r.status})`;
    throw new Error(msg);
  }
  return data as T;
}

// Intake
export const calculateIntake = (payload: Json) =>
  postJSON<{ result: number }>("/api/calculate-intake", payload);

// Voyage
export const calculateVoyage = (payload: Json) =>
  postJSON<{
    totalDuration: number;
    totalConsumption: number;
    totalBunkerCost: number;
    totalExpenses: number;
    freight: number;
  }>("/api/calculate-voyage", payload);

// Ballast
export const calculateBallast = (payload: Json) =>
  postJSON<{ result: number }>("/api/calculate-ballast", payload);

// OpenBook
export const calculateOpenBook = (payload: Json) =>
  postJSON<{
    extraSailing: number;
    extraPortDays: number;
    totalDays: number;
    vlsfoSea: number;
    vlsfoPort: number;
    lsmgoSea: number;
    lsmgoPort: number;
    costVLSFO: number;
    costLSMGO: number;
    extraCost: number;
    additionalFreight: number;
    newFreight: number;
  }>("/api/calculate-openbook", payload);
