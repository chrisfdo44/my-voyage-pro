export type VesselRow = {
  vessel: string;
  dwt: number;
  draft: number;
  tpc: number;
  grain: number;
  ladenSpeed: number;
  ladenCons: number;
  ballastSpeed: number;
  ballastCons: number;
  seaMgo: number;
  idleVlsfo: number;
  idleMgo: number;
  workVlsfo: number;
  workMgo: number;
  vslConstant: number;
};

export type CargoRow = {
  accountName: string;
  cargo: string;
  quantity: number;
  tolerance: number;
  loadPort: string;
  loadRate: number;
  dischargePort: string;
  dischargeRate: number;
  turnTime: string;
  addcom: number;
  lpPda: number;
  dpPda: number;
  otherCharges: number;
  draftRestriction: number;
  seaMargin: number;
  dop: string;
  ballastDistance: number;
  ladenDistance: number;
  totalDistance: number;
  parameters: string;
};

export type BackendPayload = {
  vessels: VesselRow[];
  cargo: CargoRow[];
};

function toNumber(value: any): number {
  if (typeof value === "number") return value;
  if (value == null) return 0;

  const str = String(value).trim().replace(/,/g, "");

  // Handle percentages like "10%" or "1.25%" or "7%"
  if (str.endsWith("%")) {
    const num = Number(str.replace("%", ""));
    return Number.isFinite(num) ? num / 100 : 0;
  }

  const num = Number(str);
  return Number.isFinite(num) ? num : 0;
}

function normalizeVesselRow(row: any): VesselRow {
  return {
    vessel: row["Vessel"] ?? "",
    dwt: toNumber(row["Dwt"]),
    draft: toNumber(row["Draft"]),
    tpc: toNumber(row["TPC"]),
    grain: toNumber(row["Grain"]),
    ladenSpeed: toNumber(row["Laden Speed"]),
    ladenCons: toNumber(row["Laden Consump"]),
    ballastSpeed: toNumber(row["Ballast Speed"]),
    ballastCons: toNumber(row["Ballast Consump"]),
    seaMgo: toNumber(row["Sea MGO"]),
    idleVlsfo: toNumber(row["Idle VLSFO"]),
    idleMgo: toNumber(row["Idle MGO"]),
    workVlsfo: toNumber(row["Working VLSFO"]),
    workMgo: toNumber(row["Working MGO"]),
    vslConstant: toNumber(row["Vsl Constant"]),
  };
}

function normalizeCargoRow(row: any): CargoRow {
  return {
    accountName: row["Account Name"] ?? "",
    cargo: row["Cargo"] ?? "",
    quantity: toNumber(row["Quantity"]),
    tolerance: toNumber(row["Tolarence"]),
    loadPort: row["Load Port"] ?? "",
    loadRate: toNumber(row["Load Rate"]),
    dischargePort: row["Discharge Port"] ?? "",
    dischargeRate: toNumber(row["Discharge Rate"]),
    turnTime: row["Turn Time"] ?? "",
    addcom: toNumber(row["Addcom+ brok"]),
    lpPda: toNumber(row["LP PDA"]),
    dpPda: toNumber(row["DP PDA"]),
    otherCharges: toNumber(row["Other Charges"]),
    draftRestriction: toNumber(row["Draft Restriction"]),
    seaMargin: toNumber(row["Sea Margin"]),
    dop: row["Dop"] ?? "",
    ballastDistance: toNumber(row["Ballast Distance"]),
    ladenDistance: toNumber(row["Laden Distance"]),
    totalDistance: toNumber(row["Total"]),
    parameters: row["Parameters"] ?? "",
  };
}

export async function fetchBackendFromWebApp(webAppUrl: string): Promise<BackendPayload> {
  const res = await fetch(webAppUrl, { method: "GET" });
  if (!res.ok) throw new Error(`WebApp HTTP ${res.status}`);

  let raw: any;
  try {
    raw = await res.json();
  } catch {
    const txt = await res.text();
    raw = JSON.parse(txt);
  }

  // Supports:
  // 1) { vessels:[...], cargo:[...] }
  // 2) { data:{ vessels:[...], cargo:[...] } }
  // 3) { vesselData:[...], cargoData:[...] }
  // 4) raw array wrappers if your Apps Script uses different naming
  const data = raw?.data ?? raw;

  const vesselSource = data.vessels ?? data.vesselData ?? [];
  const cargoSource = data.cargo ?? data.cargoData ?? [];

  return {
    vessels: vesselSource.map(normalizeVesselRow),
    cargo: cargoSource.map(normalizeCargoRow),
  };
}
