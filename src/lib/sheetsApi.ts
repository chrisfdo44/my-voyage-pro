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

  if (str === "") return 0;

  // Handle percentages
  if (str.endsWith("%")) {
    const num = Number(str.replace("%", ""));
    return Number.isFinite(num) ? num / 100 : 0;
  }

  // Clean leading zeros safely for numeric-looking strings
  const num = Number(str);
  return Number.isFinite(num) ? num : 0;
}

function pick(row: any, keys: string[]) {
  const rowKeys = Object.keys(row);

  for (const wanted of keys) {
    const exact = rowKeys.find((k) => k === wanted);
    if (exact && row[exact] !== undefined && row[exact] !== null && row[exact] !== "") {
      return row[exact];
    }

    const normalizedWanted = wanted.trim().toLowerCase().replace(/\s+/g, " ");
    const loose = rowKeys.find(
      (k) => k.trim().toLowerCase().replace(/\s+/g, " ") === normalizedWanted
    );

    if (loose && row[loose] !== undefined && row[loose] !== null && row[loose] !== "") {
      return row[loose];
    }
  }

  return undefined;
}

function normalizeVesselRow(row: any): VesselRow {
  return {
    vessel: pick(row, ["Vessel"]) ?? "",
    dwt: toNumber(pick(row, ["Dwt"])),
    draft: toNumber(pick(row, ["Draft"])),
    tpc: toNumber(pick(row, ["TPC"])),
    grain: toNumber(pick(row, ["Grain"])),
    ladenSpeed: toNumber(pick(row, ["Laden Speed"])),
    ladenCons: toNumber(
      pick(row, ["Laden Consumption", "Laden Consump", "Laden Consum", "Laden Cons"])
    ),
    ballastSpeed: toNumber(pick(row, ["Ballast Speed"])),
    ballastCons: toNumber(
      pick(row, ["Ballast Consumption", "Ballast Consump", "Ballast Consun", "Ballast Cons"])
    ),
    seaMgo: toNumber(pick(row, ["Sea MGO"])),
    idleVlsfo: toNumber(pick(row, ["Idle VLSFO"])),
    idleMgo: toNumber(pick(row, ["Idle MGO"])),
    workVlsfo: toNumber(pick(row, ["Working VLSFO"])),
    workMgo: toNumber(pick(row, ["Working MGO"])),
    vslConstant: toNumber(pick(row, ["Vsl Constant", "Vessel Constant"])),
  };
}

function normalizeCargoRow(row: any): CargoRow {
  return {
    accountName: pick(row, ["Account Name"]) ?? "",
    cargo: pick(row, ["Cargo"]) ?? "",
    quantity: toNumber(pick(row, ["Quantity"])),
    tolerance: toNumber(pick(row, ["Tolarence", "Tolerance"])),
    loadPort: pick(row, ["Load Port"]) ?? "",
    loadRate: toNumber(pick(row, ["Load Rate"])),
    dischargePort: pick(row, ["Discharge Port"]) ?? "",
    dischargeRate: toNumber(pick(row, ["Discharge Rate"])),
    turnTime: pick(row, ["Turn Time"]) ?? "",
    addcom: toNumber(
      pick(row, [
        "Addcom+ brokerage",
        "Addcom+ brok",
        "Addcom + brokerage",
        "Addcom + Brokerage",
        "Addcom",
      ])
    ),
    lpPda: toNumber(pick(row, ["LP PDA"])),
    dpPda: toNumber(pick(row, ["DP PDA"])),
    otherCharges: toNumber(pick(row, ["Other Charges"])),
    draftRestriction: toNumber(pick(row, ["Draft Restriction"])),
    seaMargin: toNumber(pick(row, ["Sea Margin"])),
    dop: pick(row, ["Dop", "DOP"]) ?? "",
    ballastDistance: toNumber(pick(row, ["Ballast Distance"])),
    ladenDistance: toNumber(pick(row, ["Laden Distance"])),
    totalDistance: toNumber(pick(row, ["Total"])),
    parameters: pick(row, ["Parameters"]) ?? "",
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

  const data = raw?.data ?? raw;
  const vesselSource = data.vessels ?? data.vesselData ?? [];
  const cargoSource = data.cargo ?? data.cargoData ?? [];

  return {
    vessels: vesselSource.map(normalizeVesselRow),
    cargo: cargoSource.map(normalizeCargoRow),
  };
}
