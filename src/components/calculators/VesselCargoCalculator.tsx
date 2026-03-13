import React, { useEffect, useMemo, useState } from "react";
import { fetchBackendFromWebApp, type CargoRow, type VesselRow } from "../../lib/sheetsApi";

type GreyEditable = {
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

  waterDensity: number;
};

type GreenInputs = {
  waitingDays: number;
  vlsfoPrice: number;
  mgoPrice: number;
  hire: number;
  ballastBonus: number;
  charterFreight: number;
};

const BROKERAGE_FIXED = 0.0375;

function n(v: unknown, fallback = 0) {
  const num = typeof v === "number" ? v : Number(v);
  return Number.isFinite(num) ? num : fallback;
}

function fmt(num: number, decimals = 2) {
  if (!Number.isFinite(num)) return "-";
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function displayValue(value: number | string) {
  if (typeof value === "number") return String(value);
  return value ?? "";
}

export default function VesselCargoCalculator() {
  const WEB_APP_URL = useMemo(
    () => import.meta.env.VITE_SHEETS_WEBAPP_URL as string,
    []
  );

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [vessels, setVessels] = useState<VesselRow[]>([]);
  const [cargoList, setCargoList] = useState<CargoRow[]>([]);

  const [selectedVessel, setSelectedVessel] = useState<string>("");
  const [selectedAccount, setSelectedAccount] = useState<string>("");

  const [backendGreyDefaults, setBackendGreyDefaults] = useState<GreyEditable | null>(null);
  const [grey, setGrey] = useState<GreyEditable | null>(null);

  const [green, setGreen] = useState<GreenInputs>({
    waitingDays: 2,
    vlsfoPrice: 690,
    mgoPrice: 1200,
    hire: 18000,
    ballastBonus: 0,
    charterFreight: 21.2,
  });

  const [calculated, setCalculated] = useState<any | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setErr(null);

        if (!WEB_APP_URL) {
          throw new Error("Missing VITE_SHEETS_WEBAPP_URL in env");
        }

        const data = await fetchBackendFromWebApp(WEB_APP_URL);
        if (!mounted) return;

        setVessels(data.vessels);
        setCargoList(data.cargo);
        setSelectedVessel(data.vessels[0]?.vessel ?? "");
        setSelectedAccount(data.cargo[0]?.accountName ?? "");
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message || "Failed to load backend");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [WEB_APP_URL]);

  const vesselDefaults = useMemo(
    () => vessels.find((v) => v.vessel === selectedVessel),
    [vessels, selectedVessel]
  );

  const cargoDefaults = useMemo(
    () => cargoList.find((c) => c.accountName === selectedAccount),
    [cargoList, selectedAccount]
  );

  useEffect(() => {
    if (!vesselDefaults || !cargoDefaults) return;

    const d: GreyEditable = {
      dwt: vesselDefaults.dwt,
      draft: vesselDefaults.draft,
      tpc: vesselDefaults.tpc,
      grain: vesselDefaults.grain,
      ladenSpeed: vesselDefaults.ladenSpeed,
      ladenCons: vesselDefaults.ladenCons,
      ballastSpeed: vesselDefaults.ballastSpeed,
      ballastCons: vesselDefaults.ballastCons,
      seaMgo: vesselDefaults.seaMgo,
      idleVlsfo: vesselDefaults.idleVlsfo,
      idleMgo: vesselDefaults.idleMgo,
      workVlsfo: vesselDefaults.workVlsfo,
      workMgo: vesselDefaults.workMgo,
      vslConstant: vesselDefaults.vslConstant,

      cargo: cargoDefaults.cargo,
      quantity: cargoDefaults.quantity,
      tolerance: cargoDefaults.tolerance,
      loadPort: cargoDefaults.loadPort,
      loadRate: cargoDefaults.loadRate,
      dischargePort: cargoDefaults.dischargePort,
      dischargeRate: cargoDefaults.dischargeRate,
      turnTime: cargoDefaults.turnTime,
      addcom: cargoDefaults.addcom,
      lpPda: cargoDefaults.lpPda,
      dpPda: cargoDefaults.dpPda,
      otherCharges: cargoDefaults.otherCharges,
      draftRestriction: cargoDefaults.draftRestriction,
      seaMargin: cargoDefaults.seaMargin,
      dop: cargoDefaults.dop,
      ballastDistance: cargoDefaults.ballastDistance,
      ladenDistance: cargoDefaults.ladenDistance,
      totalDistance: cargoDefaults.totalDistance,
      parameters: cargoDefaults.parameters,

      waterDensity: 1.025,
    };

    setBackendGreyDefaults(d);
    setGrey(d);
    setCalculated(null);
  }, [vesselDefaults, cargoDefaults]);

  function resetGreyToBackend() {
    if (!backendGreyDefaults) return;
    setGrey(backendGreyDefaults);
    setCalculated(null);
  }

  function calculate() {
    if (!grey) return;

    const draftBssSW = n(grey.draft) * n(grey.waterDensity) / 1.025;
    const draftRestriction = n(grey.draftRestriction);
    const dwtChange = draftRestriction < draftBssSW ? draftBssSW - draftRestriction : 0;
    const restrictedDwt = dwtChange * n(grey.tpc) * 100;
    const intakeQty = n(grey.dwt) - restrictedDwt;
    const loadableQty = intakeQty - n(grey.vslConstant);
    const H1 = loadableQty;

    const ballastDays =
      n(grey.ballastDistance) / (n(grey.ballastSpeed) * (1 - n(grey.seaMargin))) / 24;
    const ballastVlsfo =
      (n(grey.ballastDistance) / (n(grey.ballastSpeed) * 24) * (1 + n(grey.seaMargin))) *
      n(grey.ballastCons);
    const ballastMgo = ballastDays * n(grey.seaMgo);

    const ladenDays =
      n(grey.ladenDistance) / (n(grey.ladenSpeed) * (1 - n(grey.seaMargin))) / 24;
    const ladenVlsfo =
      (n(grey.ladenDistance) / (n(grey.ladenSpeed) * 24) * (1 + n(grey.seaMargin))) *
      n(grey.ladenCons);
    const ladenMgo = ladenDays * n(grey.seaMgo);

    const loadingDays = H1 / n(grey.loadRate);
    const loadingVlsfo = loadingDays * n(grey.workVlsfo);
    const loadingMgo = loadingDays * n(grey.workMgo);

    const dischargingDays = H1 / n(grey.dischargeRate);
    const dischargingVlsfo = dischargingDays * n(grey.workVlsfo);
    const dischargingMgo = dischargingDays * n(grey.workMgo);

    const waitingDays = n(green.waitingDays);
    const waitingVlsfo = waitingDays * n(grey.idleVlsfo);
    const waitingMgo = waitingDays * n(grey.idleMgo);

    const totalDays =
      ballastDays + ladenDays + loadingDays + dischargingDays + waitingDays;
const totalVlsfo =
  ballastVlsfo + ladenVlsfo + loadingVlsfo + dischargingVlsfo + waitingVlsfo;
    const totalMgo =
      ballastMgo + ladenMgo + loadingMgo + dischargingMgo + waitingMgo;

    const bunkerCostVlsfo = totalVlsfo * n(green.vlsfoPrice);
    const bunkerCostMgo = totalMgo * n(green.mgoPrice);

    const hireCost = n(green.hire) * (1 - BROKERAGE_FIXED) * totalDays;
    const pda = n(grey.lpPda) + n(grey.dpPda);
    const ballastBonus = n(green.ballastBonus) * (1 - BROKERAGE_FIXED);
    const cve = 1500 * (totalDays / 30);
    const otherCharges = n(grey.otherCharges);

    const totalExpense =
      otherCharges + ballastBonus + pda + bunkerCostVlsfo + bunkerCostMgo + cve + hireCost;

    const freight =
      ((n(green.hire) * (1 - BROKERAGE_FIXED) * totalDays + (totalExpense - hireCost)) / H1) *
      (1 + n(grey.addcom));

    const tce =
      ((((n(green.charterFreight) * (1 - n(grey.addcom))) * H1) - (totalExpense - hireCost)) /
        totalDays) *
      (1 + BROKERAGE_FIXED);

    const pnl = (n(green.charterFreight) - freight) * H1;

    setCalculated({
      intake: { loadableQty, intakeQty, restrictedDwt, dwtChange, draftBssSW, draftRestriction },
      days: { ballastDays, ladenDays, loadingDays, dischargingDays, waitingDays, totalDays },
      bunkers: { totalVlsfo, totalMgo, bunkerCostVlsfo, bunkerCostMgo },
      costs: { hireCost, pda, ballastBonus, cve, otherCharges, totalExpense },
      results: { freight, tce, pnl },
    });
  }

  useEffect(() => {
    if (!grey) return;
    calculate();
  }, [grey, green]);

const page = "min-h-screen bg-slate-950 text-slate-100";
const shell = "mx-auto max-w-7xl px-4 py-6";
const card = "rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm";
const title = "text-2xl font-bold tracking-tight text-white";
const sub = "text-xs uppercase tracking-[0.22em] text-cyan-400/80";
const sectionTitle = "text-lg font-semibold tracking-wide text-white";
const label = "mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300";
  const input =
    "w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20";
  const btnPrimary =
    "rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400";
  const btnGhost =
    "rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100 hover:border-cyan-400";

  const pnlValue = calculated?.results?.pnl ?? 0;
  const pnlColor =
    pnlValue > 0 ? "text-emerald-400" : pnlValue < 0 ? "text-rose-400" : "text-white";

  if (loading) {
    return (
  <div className={page}>
    <div className={shell}>
      <div className="mb-6">
        <div className={title}>Cargo Freight Calculator</div>
        <div className={sub}>Route & Freight Analysis</div>
      </div>

      {/* Top Row */}
      <div className={`${card} mb-4`}>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div>
            <div className={label}>Vessel Name</div>
            <select
              className={input}
              value={selectedVessel}
              onChange={(e) => setSelectedVessel(e.target.value)}
            >
              {vessels.map((v) => (
                <option key={v.vessel} value={v.vessel}>
                  {v.vessel}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className={label}>Account Name</div>
            <select
              className={input}
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
            >
              {cargoList.map((c) => (
                <option key={c.accountName} value={c.accountName}>
                  {c.accountName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button className={`${btnPrimary} w-full`} onClick={calculate} type="button">
              Calculate
            </button>
          </div>

          <div className="flex items-end">
            <button className={`${btnGhost} w-full`} onClick={resetGreyToBackend} type="button">
              Reset Backend Values
            </button>
          </div>
        </div>
      </div>

      {/* User Inputs Row */}
      <div className={`${card} mb-4`}>
        <div className="mb-4 flex items-center justify-between">
          <div className={sectionTitle}>User Inputs</div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            ["VLSFO Price", "vlsfoPrice"],
            ["MGO Price", "mgoPrice"],
            ["Hire", "hire"],
            ["Ballast Bonus", "ballastBonus"],
            ["Waiting Days", "waitingDays"],
            ["Charter Frt", "charterFreight"],
          ].map(([t, k]) => (
            <div key={k}>
              <div className={label}>{t}</div>
              <input
                className={input}
                type="number"
                step="any"
                value={(green as any)[k]}
                onChange={(e) =>
                  setGreen((s) => ({ ...s, [k]: Number(e.target.value) }))
                }
              />
            </div>
          ))}
        </div>
      </div>

      {/* Result Cards */}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className={card}>
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Loadable Qty
          </div>
          <div className="mt-3 text-4xl font-semibold tracking-tight text-white">
            {calculated ? fmt(calculated.intake.loadableQty, 0) : "-"}
          </div>
        </div>

        <div className={card}>
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Total Days
          </div>
          <div className="mt-3 text-4xl font-semibold tracking-tight text-white">
            {calculated ? fmt(calculated.days.totalDays, 2) : "-"}
          </div>
        </div>

        <div className={card}>
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Freight
          </div>
          <div className="mt-3 text-4xl font-semibold tracking-tight text-white">
            {calculated ? fmt(calculated.results.freight, 2) : "-"}
          </div>
        </div>

        <div className={card}>
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
            TCE
          </div>
          <div className="mt-3 text-4xl font-semibold tracking-tight text-white">
            {calculated ? fmt(calculated.results.tce, 0) : "-"}
          </div>
        </div>

        <div className={card}>
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-400">
            PNL
          </div>
          <div className={`mt-3 text-4xl font-semibold tracking-tight ${pnlColor}`}>
            {calculated ? fmt(calculated.results.pnl, 0) : "-"}
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {/* Vessel Parameters */}
        <div className={card}>
          <div className="mb-4 flex items-center justify-between">
            <div className={sectionTitle}>Vessel Parameters</div>
          </div>

          {/* Row 1 */}
          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-5">
            {[
              ["DWT", "dwt"],
              ["Draft", "draft"],
              ["TPC", "tpc"],
              ["Grain", "grain"],
              ["Vsl Constant", "vslConstant"],
            ].map(([t, k]) => (
              <div key={k}>
                <div className={label}>{t}</div>
                <input
                  className={input}
                  type="number"
                  step="any"
                  value={displayValue((grey as any)[k])}
                  onChange={(e) =>
                    setGrey((s) => ({ ...s!, [k]: Number(e.target.value) }))
                  }
                />
              </div>
            ))}
          </div>

          {/* Row 2 */}
          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-5">
            {[
              ["Laden Speed", "ladenSpeed"],
              ["Laden Cons", "ladenCons"],
              ["Ballast Speed", "ballastSpeed"],
              ["Ballast Cons", "ballastCons"],
              ["Sea MGO", "seaMgo"],
            ].map(([t, k]) => (
              <div key={k}>
                <div className={label}>{t}</div>
                <input
                  className={input}
                  type="number"
                  step="any"
                  value={displayValue((grey as any)[k])}
                  onChange={(e) =>
                    setGrey((s) => ({ ...s!, [k]: Number(e.target.value) }))
                  }
                />
              </div>
            ))}
          </div>

          {/* Row 3 */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["Idle VLSFO", "idleVlsfo"],
              ["Idle MGO", "idleMgo"],
              ["Working VLSFO", "workVlsfo"],
              ["Working MGO", "workMgo"],
            ].map(([t, k]) => (
              <div key={k}>
                <div className={label}>{t}</div>
                <input
                  className={input}
                  type="number"
                  step="any"
                  value={displayValue((grey as any)[k])}
                  onChange={(e) =>
                    setGrey((s) => ({ ...s!, [k]: Number(e.target.value) }))
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* Cargo Parameters */}
        <div className={card}>
          <div className="mb-4 flex items-center justify-between">
            <div className={sectionTitle}>Cargo Parameters</div>
          </div>

          {/* Row 1 */}
          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <div className={label}>Cargo</div>
              <input
                className={input}
                value={grey.cargo}
                onChange={(e) => setGrey((s) => ({ ...s!, cargo: e.target.value }))}
              />
            </div>

            {[
              ["Quantity", "quantity"],
              ["Tolerance", "tolerance"],
            ].map(([t, k]) => (
              <div key={k}>
                <div className={label}>{t}</div>
                <input
                  className={input}
                  type="number"
                  step="any"
                  value={displayValue((grey as any)[k])}
                  onChange={(e) =>
                    setGrey((s) => ({ ...s!, [k]: Number(e.target.value) }))
                  }
                />
              </div>
            ))}
          </div>

          {/* Row 2 */}
          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["Load Rate", "loadRate"],
              ["Discharge Rate", "dischargeRate"],
              ["LP PDA", "lpPda"],
              ["DP PDA", "dpPda"],
            ].map(([t, k]) => (
              <div key={k}>
                <div className={label}>{t}</div>
                <input
                  className={input}
                  type="number"
                  step="any"
                  value={displayValue((grey as any)[k])}
                  onChange={(e) =>
                    setGrey((s) => ({ ...s!, [k]: Number(e.target.value) }))
                  }
                />
              </div>
            ))}
          </div>

          {/* Row 3 */}
          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["Ballast Distance", "ballastDistance"],
              ["Laden Distance", "ladenDistance"],
              ["Total Distance", "totalDistance"],
              ["Sea Margin", "seaMargin"],
            ].map(([t, k]) => (
              <div key={k}>
                <div className={label}>{t}</div>
                <input
                  className={input}
                  type="number"
                  step="any"
                  value={displayValue((grey as any)[k])}
                  onChange={(e) =>
                    setGrey((s) => ({ ...s!, [k]: Number(e.target.value) }))
                  }
                />
              </div>
            ))}
          </div>

          {/* Row 4 */}
          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["Other Charges", "otherCharges"],
              ["Addcom + Brokerage", "addcom"],
              ["Draft Restriction", "draftRestriction"],
              ["Water Density", "waterDensity"],
            ].map(([t, k]) => (
              <div key={k}>
                <div className={label}>{t}</div>
                <input
                  className={input}
                  type="number"
                  step="any"
                  value={displayValue((grey as any)[k])}
                  onChange={(e) =>
                    setGrey((s) => ({ ...s!, [k]: Number(e.target.value) }))
                  }
                />
              </div>
            ))}
          </div>

          {/* Row 5 */}
          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["DOP", "dop"],
              ["Load Port", "loadPort"],
              ["Discharge Port", "dischargePort"],
              ["Turn Time", "turnTime"],
            ].map(([t, k]) => (
              <div key={k}>
                <div className={label}>{t}</div>
                <input
                  className={input}
                  value={(grey as any)[k]}
                  onChange={(e) =>
                    setGrey((s) => ({ ...s!, [k]: e.target.value }))
                  }
                />
              </div>
            ))}
          </div>

          {/* Remarks */}
          <div>
            <div className={label}>Remarks</div>
            <div className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-slate-300">
              {grey.parameters || "-"}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
