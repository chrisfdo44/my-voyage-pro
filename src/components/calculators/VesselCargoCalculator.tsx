import React, { useEffect, useMemo, useRef, useState } from "react";
import { fetchBackendFromWebApp, type CargoRow, type VesselRow } from "../../lib/sheetsApi";
import html2canvas from "html2canvas";

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

function percentDisplay(value: number) {
  if (!value && value !== 0) return "";
  return Number((value * 100).toFixed(2)).toString();
}

function percentInput(value: string) {
  const num = Number(value);
  return Number.isFinite(num) ? num / 100 : 0;
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
const exportRef = useRef<HTMLDivElement | null>(null);
  
async function captureScreenshot() {
  try {
    if (!exportRef.current) {
      alert("Export section not found");
      return;
    }

    const canvas = await html2canvas(exportRef.current, {
      backgroundColor: "#020817",
      scale: 3,
      useCORS: true,
      logging: false,
    });

    const image = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = image;
    link.download = `voyagepro-report-${new Date().toISOString().slice(0, 10)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Screenshot error:", error);
    alert("Screenshot failed. Check browser console.");
  }
}
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

    const loadableQtyByVessel = intakeQty - n(grey.vslConstant);
    const cargoQtyMax = n(grey.quantity) * (1 + n(grey.tolerance));

    const loadableQty = Math.min(loadableQtyByVessel, cargoQtyMax);
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

const page = "min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100";
const shell = "mx-auto max-w-screen-xl px-4 py-6";
const card =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60";
const title = "text-2xl font-bold tracking-tight text-slate-900 dark:text-white";
const sub = "text-xs uppercase tracking-[0.22em] text-cyan-600 dark:text-cyan-400/80";
const sectionTitle = "text-lg font-semibold tracking-wide text-slate-900 dark:text-white";
const label =
  "mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-300";
const input =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20";
const btnPrimary =
  "rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400";
const btnGhost =
  "rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 hover:border-cyan-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:border-cyan-400";

  const pnlValue = calculated?.results?.pnl ?? 0;
  const pnlColor =
    pnlValue > 0 ? "text-emerald-400" : pnlValue < 0 ? "text-rose-400" : "text-white";

  if (loading) {
    return (
      <div className={page}>
        <div className={shell}>
          <div className={card}>
            <div className={title}>Loading calculator…</div>
            <div className={sub}>Fetching backend vessel and cargo data.</div>
          </div>
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className={page}>
        <div className={shell}>
          <div className={card}>
            <div className={title}>Couldn’t load backend data</div>
            <div className="mt-2 text-sm text-rose-300">{err}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!grey) return null;

  return (
    <div className={page}>
      <div className={shell} ref={reportRef}>
        <div className="mb-6">
          <div className={title}>Cargo Freight Calculator</div>
          <div className={sub}>Route & Freight Analysis</div>
        </div>

        <div className={`${card} mb-4`}>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
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
            <div className="flex items-end">
  <button className={`${btnGhost} w-full`} onClick={captureScreenshot} type="button">
    Capture Screenshot
  </button>
</div>
          </div>
        </div>

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
              ["TT and Bunkering Days", "waitingDays"],
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

  {/* Loadable Qty */}
  <div className={card}>
    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
      Loadable Qty
    </div>
    <div className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
      {calculated ? fmt(calculated.intake.loadableQty, 0) : "-"}
    </div>
    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">MT</div>
  </div>

  {/* Total Days */}
  <div className={card}>
    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
      Total Days
    </div>
    <div className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
      {calculated ? fmt(calculated.days.totalDays, 2) : "-"}
    </div>
    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Days</div>
  </div>

  {/* Freight */}
  <div className={card}>
    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
      Freight
    </div>
    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">USD</div>
    <div className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
      {calculated ? fmt(calculated.results.freight, 2) : "-"}
    </div>
  </div>

  {/* TCE */}
  <div className={card}>
    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
      TCE
    </div>
    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">USD / Day</div>
    <div className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
      {calculated ? fmt(calculated.results.tce, 0) : "-"}
    </div>
  </div>

  {/* PNL */}
  <div className={card}>
    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
      PNL
    </div>
    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">USD</div>
    <div className={`text-4xl font-semibold tracking-tight ${pnlColor}`}>
      {calculated ? fmt(calculated.results.pnl, 0) : "-"}
    </div>
  </div>

</div>

        {/* Voyage Summary */}
<div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
  <div className={card}>
    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
      Ballast Days
    </div>
    <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
      {calculated ? fmt(calculated.days.ballastDays, 2) : "-"}
    </div>
    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Days</div>
  </div>

  <div className={card}>
    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
      Laden Days
    </div>
    <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
      {calculated ? fmt(calculated.days.ladenDays, 2) : "-"}
    </div>
    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Days</div>
  </div>

  <div className={card}>
    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
      Port Days
    </div>
    <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
      {calculated
        ? fmt(
            calculated.days.loadingDays +
              calculated.days.dischargingDays +
              calculated.days.waitingDays,
            2
          )
        : "-"}
    </div>
    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Days</div>
  </div>

  <div className={card}>
    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-600 dark:text-cyan-400">
      Total Bunker
    </div>
    <div className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
      {calculated
        ? fmt(calculated.bunkers.totalVlsfo + calculated.bunkers.totalMgo, 2)
        : "-"}
    </div>
    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
      MT
      {calculated && (
        <span className="ml-2 text-slate-500">
          VLSFO {fmt(calculated.bunkers.totalVlsfo, 2)} / MGO {fmt(calculated.bunkers.totalMgo, 2)}
        </span>
      )}
    </div>
</div>
  </div>
        <div className="grid grid-cols-1 gap-6">
          <div className={card}>
            <div className="mb-4 flex items-center justify-between">
              <div className={sectionTitle}>Vessel Parameters</div>
            </div>

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

          <div className={card}>
            <div className="mb-4 flex items-center justify-between">
              <div className={sectionTitle}>Cargo Parameters</div>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <div className={label}>Cargo</div>
                <input
                  className={input}
                  value={grey.cargo}
                  onChange={(e) => setGrey((s) => ({ ...s!, cargo: e.target.value }))}
                />
              </div>

              <div>
                <div className={label}>Quantity</div>
                <input
                  className={input}
                  type="number"
                  step="any"
                  value={displayValue(grey.quantity)}
                  onChange={(e) =>
                    setGrey((s) => ({ ...s!, quantity: Number(e.target.value) }))
                  }
                />
              </div>

              <div>
                <div className={label}>Tolerance</div>
                <input
                  className={input}
                  type="number"
                  step="any"
                  value={percentDisplay(grey.tolerance)}
                  onChange={(e) =>
                    setGrey((s) => ({ ...s!, tolerance: percentInput(e.target.value) }))
                  }
                />
              </div>
            </div>

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

            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <div className={label}>Ballast Distance</div>
                <input
                  className={input}
                  type="number"
                  step="any"
                  value={displayValue(grey.ballastDistance)}
                  onChange={(e) =>
                    setGrey((s) => ({ ...s!, ballastDistance: Number(e.target.value) }))
                  }
                />
              </div>

              <div>
                <div className={label}>Laden Distance</div>
                <input
                  className={input}
                  type="number"
                  step="any"
                  value={displayValue(grey.ladenDistance)}
                  onChange={(e) =>
                    setGrey((s) => ({ ...s!, ladenDistance: Number(e.target.value) }))
                  }
                />
              </div>

              <div>
                <div className={label}>Total Distance</div>
                <input
                  className={input}
                  type="number"
                  step="any"
                  value={displayValue(grey.totalDistance)}
                  onChange={(e) =>
                    setGrey((s) => ({ ...s!, totalDistance: Number(e.target.value) }))
                  }
                />
              </div>

              <div>
                <div className={label}>Sea Margin</div>
                <input
                  className={input}
                  type="number"
                  step="any"
                  value={percentDisplay(grey.seaMargin)}
                  onChange={(e) =>
                    setGrey((s) => ({ ...s!, seaMargin: percentInput(e.target.value) }))
                  }
                />
              </div>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <div className={label}>Other Charges</div>
                <input
                  className={input}
                  type="number"
                  step="any"
                  value={displayValue(grey.otherCharges)}
                  onChange={(e) =>
                    setGrey((s) => ({ ...s!, otherCharges: Number(e.target.value) }))
                  }
                />
              </div>

              <div>
                <div className={label}>Addcom + Brokerage</div>
                <input
                  className={input}
                  type="number"
                  step="any"
                  value={percentDisplay(grey.addcom)}
                  onChange={(e) =>
                    setGrey((s) => ({ ...s!, addcom: percentInput(e.target.value) }))
                  }
                />
              </div>

              <div>
                <div className={label}>Draft Restriction</div>
                <input
                  className={input}
                  type="number"
                  step="any"
                  value={displayValue(grey.draftRestriction)}
                  onChange={(e) =>
                    setGrey((s) => ({ ...s!, draftRestriction: Number(e.target.value) }))
                  }
                />
              </div>

              <div>
                <div className={label}>Water Density</div>
                <input
                  className={input}
                  type="number"
                  step="any"
                  value={displayValue(grey.waterDensity)}
                  onChange={(e) =>
                    setGrey((s) => ({ ...s!, waterDensity: Number(e.target.value) }))
                  }
                />
              </div>
            </div>

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

            <div>
              <div className={label}>Remarks</div>
              <div className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                {grey.parameters || "-"}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
  
  style={{
    position: "fixed",
    left: "-99999px",
    top: 0,
    width: "1400px",
    background: "#020817",
    color: "#e2e8f0",
    padding: "48px 32px",
    boxSizing: "border-box",
  }}
>
  <div
    ref={exportRef}
    style={{
      background: "#020817",
      color: "#e2e8f0",
      fontFamily: "Arial, sans-serif",
    }}
  >
    <div style={{ marginBottom: "28px" }}>
      <div style={{ fontSize: "44px", fontWeight: 700, color: "#ffffff" }}>
        Cargo Freight Calculator
      </div>
      <div style={{ fontSize: "14px", letterSpacing: "0.2em", color: "#22d3ee", marginTop: "8px" }}>
        ROUTE & FREIGHT ANALYSIS
      </div>
    </div>

    <div
      style={{
        border: "1px solid #334155",
        borderRadius: "18px",
        background: "#0f172a",
        padding: "24px",
        marginBottom: "20px",
      }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
        <div>
          <div style={{ fontSize: "12px", color: "#94a3b8", letterSpacing: "0.14em" }}>VESSEL NAME</div>
          <div style={{ fontSize: "30px", color: "#fff", marginTop: "8px" }}>{selectedVessel}</div>
        </div>
        <div>
          <div style={{ fontSize: "12px", color: "#94a3b8", letterSpacing: "0.14em" }}>ACCOUNT NAME</div>
          <div style={{ fontSize: "30px", color: "#fff", marginTop: "8px" }}>{selectedAccount}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
        <div>
          <div style={{ fontSize: "12px", color: "#94a3b8", letterSpacing: "0.14em" }}>VLSFO PRICE</div>
          <div style={{ fontSize: "22px", color: "#fff", marginTop: "8px" }}>{green.vlsfoPrice}</div>
        </div>
        <div>
          <div style={{ fontSize: "12px", color: "#94a3b8", letterSpacing: "0.14em" }}>MGO PRICE</div>
          <div style={{ fontSize: "22px", color: "#fff", marginTop: "8px" }}>{green.mgoPrice}</div>
        </div>
        <div>
          <div style={{ fontSize: "12px", color: "#94a3b8", letterSpacing: "0.14em" }}>HIRE</div>
          <div style={{ fontSize: "22px", color: "#fff", marginTop: "8px" }}>{green.hire}</div>
        </div>
      </div>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "18px", marginBottom: "20px" }}>
      {[
        ["Loadable Qty", calculated ? fmt(calculated.intake.loadableQty, 0) : "-", "MT", "#ffffff"],
        ["Total Days", calculated ? fmt(calculated.days.totalDays, 2) : "-", "Days", "#ffffff"],
        ["Freight", calculated ? fmt(calculated.results.freight, 2) : "-", "USD/MT", "#ffffff"],
        ["TCE", calculated ? fmt(calculated.results.tce, 0) : "-", "USD / Day", "#ffffff"],
        ["PNL", calculated ? fmt(calculated.results.pnl, 0) : "-", "USD", pnlValue > 0 ? "#34d399" : pnlValue < 0 ? "#fb7185" : "#ffffff"],
      ].map(([labelText, value, unit, valueColor]) => (
        <div
          key={labelText}
          style={{
            border: "1px solid #334155",
            borderRadius: "18px",
            background: "#0f172a",
            padding: "22px",
          }}
        >
          <div style={{ fontSize: "12px", color: "#22d3ee", letterSpacing: "0.16em", textTransform: "uppercase" }}>
            {labelText}
          </div>
          <div style={{ fontSize: "30px", fontWeight: 700, color: valueColor as string, marginTop: "18px" }}>
            {value}
          </div>
          <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "8px" }}>{unit}</div>
        </div>
      ))}
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "18px", marginBottom: "20px" }}>
      {[
        ["Ballast Days", calculated ? fmt(calculated.days.ballastDays, 2) : "-", "Days"],
        ["Laden Days", calculated ? fmt(calculated.days.ladenDays, 2) : "-", "Days"],
        ["Port Days", calculated ? fmt(calculated.days.loadingDays + calculated.days.dischargingDays + calculated.days.waitingDays, 2) : "-", "Days"],
        ["Total Bunker", calculated ? fmt(calculated.bunkers.totalVlsfo + calculated.bunkers.totalMgo, 2) : "-", `MT  VLSFO ${calculated ? fmt(calculated.bunkers.totalVlsfo, 2) : "-"} / MGO ${calculated ? fmt(calculated.bunkers.totalMgo, 2) : "-"}`],
      ].map(([labelText, value, unit]) => (
        <div
          key={labelText}
          style={{
            border: "1px solid #334155",
            borderRadius: "18px",
            background: "#0f172a",
            padding: "22px",
          }}
        >
          <div style={{ fontSize: "12px", color: "#22d3ee", letterSpacing: "0.16em", textTransform: "uppercase" }}>
            {labelText}
          </div>
          <div style={{ fontSize: "30px", fontWeight: 700, color: "#fff", marginTop: "18px" }}>
            {value}
          </div>
          <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "8px" }}>{unit}</div>
        </div>
      ))}
    </div>

    <div
      style={{
        border: "1px solid #334155",
        borderRadius: "18px",
        background: "#0f172a",
        padding: "24px",
      }}
    >
      <div style={{ fontSize: "24px", fontWeight: 700, color: "#fff", marginBottom: "16px" }}>Cargo Details</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        {[
          ["Cargo", grey.cargo],
          ["Quantity", grey.quantity],
          ["Tolerance", `${percentDisplay(grey.tolerance)}%`],
          ["Load Port", grey.loadPort],
          ["Discharge Port", grey.dischargePort],
          ["Ballast Distance", grey.ballastDistance],
          ["Laden Distance", grey.ladenDistance],
          ["Remarks", grey.parameters || "-"],
        ].map(([labelText, value]) => (
          <div key={labelText}>
            <div style={{ fontSize: "12px", color: "#94a3b8", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              {labelText}
            </div>
            <div style={{ fontSize: "20px", color: "#fff", marginTop: "8px" }}>{String(value)}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
</div>
    </div>
  );
}
