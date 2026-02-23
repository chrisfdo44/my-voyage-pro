import React, { useMemo, useState } from "react";
import { Navigation, Info, DollarSign, Clock, Fuel, Calculator, X, Delete } from "lucide-react";

type VoyageInputs = {
  cargoQty: string;
  loadRate: string;
  dischargeRate: string;
  extraDays: string;
  pda: string;
  otherExpenses: string;
  vlsfoRate: string;
  ladenDays: string;
  ballastDays: string;
  seaConsumption: string;
  workingConsumption: string;
  idleConsumption: string;
  hire: string;
  addcom: string;
};

type MiniTarget = "pda" | "otherExpenses";

export function VoyageCalc() {
  const [inputs, setInputs] = useState<VoyageInputs>({
    cargoQty: "",
    loadRate: "",
    dischargeRate: "",
    extraDays: "",
    pda: "",
    otherExpenses: "",
    vlsfoRate: "",
    ladenDays: "",
    ballastDays: "",
    seaConsumption: "",
    workingConsumption: "",
    idleConsumption: "",
    hire: "",
    addcom: "",
  });

  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Mini calculator modal state
  const [miniOpen, setMiniOpen] = useState(false);
  const [miniTarget, setMiniTarget] = useState<MiniTarget>("pda");

  const toNum = (v: string) => (v === "" ? 0 : Number(v));

  const calculate = async () => {
    try {
      setLoading(true);
      setError("");

      const payload = {
        cargoQty: toNum(inputs.cargoQty),
        loadRate: toNum(inputs.loadRate),
        dischargeRate: toNum(inputs.dischargeRate),
        extraDays: toNum(inputs.extraDays),
        pda: toNum(inputs.pda),
        otherExpenses: toNum(inputs.otherExpenses),
        vlsfoRate: toNum(inputs.vlsfoRate),
        ladenDays: toNum(inputs.ladenDays),
        ballastDays: toNum(inputs.ballastDays),
        seaConsumption: toNum(inputs.seaConsumption),
        workingConsumption: toNum(inputs.workingConsumption),
        idleConsumption: toNum(inputs.idleConsumption),
        hire: toNum(inputs.hire),
        addcom: toNum(inputs.addcom),
      };

      const res = await fetch("/api/calculate-voyage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);

      setResults(data);
    } catch (err: any) {
      console.error("Calculation error:", err);
      setError(err?.message || "Calculation failed");
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const openMini = (target: MiniTarget) => {
    setMiniTarget(target);
    setMiniOpen(true);
  };

  const applyMiniResult = (value: number) => {
    // put the result into PDA or Other Exp
    setInputs((prev) => ({
      ...prev,
      [miniTarget]: String(isFinite(value) ? value : 0),
    }));
    setMiniOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-12">
      <div className="flex items-center gap-4 mb-8 sm:mb-12">
        <div className="bg-cyan-glow/10 p-2 sm:p-3 rounded-2xl border border-cyan-glow/20 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
          <Navigation className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-glow" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tighter uppercase">
            Voyage <span className="text-cyan-glow">Mini Calculator</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">
            Route & Fuel Analysis On the go
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 sm:gap-8">
        <div className="lg:col-span-3 glass-panel rounded-3xl overflow-hidden">
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-cyan-glow/10">
            {/* LEFT */}
            <div className="p-6 sm:p-8 space-y-4 sm:space-y-6">
              <h3 className="text-[10px] font-bold text-cyan-glow uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                <div className="w-1 h-1 bg-cyan-glow rounded-full"></div>
                Cargo & Port Logistics
              </h3>

              <Input label="Cargo Quantity (MT)" name="cargoQty" value={inputs.cargoQty} onChange={handleChange} />

              <div className="grid grid-cols-2 gap-4">
                <Input label="Load Rate" name="loadRate" value={inputs.loadRate} onChange={handleChange} />
                <Input label="Discharge Rate" name="dischargeRate" value={inputs.dischargeRate} onChange={handleChange} />
              </div>

              <Input label="Extra Days" name="extraDays" value={inputs.extraDays} onChange={handleChange} />

              {/* PDA + Other Exp with mini-calc icons */}
              <div className="grid grid-cols-2 gap-4">
                <InputWithMiniCalc
                  label="PDA ($)"
                  name="pda"
                  value={inputs.pda}
                  onChange={handleChange}
                  onMini={() => openMini("pda")}
                />
                <InputWithMiniCalc
                  label="Other Exp ($)"
                  name="otherExpenses"
                  value={inputs.otherExpenses}
                  onChange={handleChange}
                  onMini={() => openMini("otherExpenses")}
                />
              </div>

              <Input label="Bunker Price (VLSFO)" name="vlsfoRate" value={inputs.vlsfoRate} onChange={handleChange} />
            </div>

            {/* RIGHT */}
            <div className="p-6 sm:p-8 space-y-4 sm:space-y-6 bg-cyan-glow/[0.02]">
              <h3 className="text-[10px] font-bold text-cyan-glow uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                <div className="w-1 h-1 bg-cyan-glow rounded-full"></div>
                Voyage Parameters
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Laden Days" name="ladenDays" value={inputs.ladenDays} onChange={handleChange} />
                <Input label="Ballast Days" name="ballastDays" value={inputs.ballastDays} onChange={handleChange} />
              </div>

              <Input label="Sea Consumption (MT/day)" name="seaConsumption" value={inputs.seaConsumption} onChange={handleChange} />

              <div className="grid grid-cols-2 gap-4">
                <Input label="Working Cons." name="workingConsumption" value={inputs.workingConsumption} onChange={handleChange} />
                <Input label="Idle Cons." name="idleConsumption" value={inputs.idleConsumption} onChange={handleChange} />
              </div>

              <Input label="Vessel Hire ($/day)" name="hire" value={inputs.hire} onChange={handleChange} />
              <Input label="ADDCOM (e.g. 0.0375)" name="addcom" value={inputs.addcom} onChange={handleChange} />
            </div>
          </div>

          <div className="p-6 sm:p-8 glass-panel border-t border-cyan-glow/10">
            <button
              onClick={calculate}
              disabled={loading}
              className="w-full py-4 bg-cyan-glow text-navy-deep rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-white transition-all shadow-[0_0_30px_rgba(34,211,238,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Processing..." : "Run Simulation"}
            </button>

            {error ? <p className="mt-4 text-xs text-red-400 font-mono">{error}</p> : null}
          </div>
        </div>

        {/* RESULTS */}
        <div className="space-y-6">
          {results ? (
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border-l-4 border-l-cyan-glow space-y-6 sm:space-y-8">
              <div>
                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">
                  <Clock className="w-3 h-3 text-cyan-glow" /> Total Duration
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tighter">
                  {Number(results.totalDuration || 0).toFixed(2)} <span className="text-xs text-slate-500">DAYS</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">
                  <Fuel className="w-3 h-3 text-cyan-glow" /> Bunker Cost
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tighter">
                  ${Number(results.totalBunkerCost || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">
                  <DollarSign className="w-3 h-3 text-cyan-glow" /> Operational Expenses
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tighter">
                  ${Number(results.totalExpenses || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
              </div>

              <div className="pt-6 sm:pt-8 border-t border-cyan-glow/10">
                <div className="text-cyan-glow text-[10px] font-bold uppercase tracking-widest mb-2">Target Freight Rate</div>
                <div className="text-4xl sm:text-5xl font-mono font-bold text-cyan-glow tracking-tighter">
                  ${Number(results.freight || 0).toFixed(2)}
                </div>
                <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">Per Metric Ton</div>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl border border-dashed border-cyan-glow/20 p-8 text-center flex flex-col items-center justify-center h-full min-h-[300px] sm:min-h-[400px]">
              <Navigation className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-glow/10 mb-4 animate-pulse" />
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Awaiting Operational Data</p>
            </div>
          )}

          <div className="glass-panel rounded-3xl p-6">
            <div className="flex items-start gap-3 text-slate-400 text-xs leading-relaxed">
              <Info className="w-4 h-4 text-cyan-glow shrink-0 mt-0.5" />
              <p>Calculations include standard commissions and bunker adjustments. System utilizes real-time market indices for estimation.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Centered mini calculator modal */}
      <MiniCalcModal
        open={miniOpen}
        onClose={() => setMiniOpen(false)}
        onApply={applyMiniResult}
        title={miniTarget === "pda" ? "Mini Calculator → PDA" : "Mini Calculator → Other Exp"}
      />
    </div>
  );
}

/* ----------------------------- Inputs ----------------------------- */

function Input({
  label,
  name,
  value,
  onChange,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{label}</label>
      <input
        type="number"
        step="any"
        inputMode="decimal"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 bg-navy-deep/50 border border-cyan-glow/10 rounded-xl focus:ring-1 focus:ring-cyan-glow outline-none transition-all text-white text-sm font-mono"
        placeholder=""
      />
    </div>
  );
}

function InputWithMiniCalc({
  label,
  name,
  value,
  onChange,
  onMini,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMini: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{label}</label>
        <button
          type="button"
          onClick={onMini}
          className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-cyan-glow/15 bg-cyan-glow/5 hover:bg-cyan-glow/10 transition"
          aria-label="Open mini calculator"
          title="Mini calculator"
        >
          <Calculator className="w-4 h-4 text-cyan-glow" />
        </button>
      </div>

      <input
        type="number"
        step="any"
        inputMode="decimal"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 bg-navy-deep/50 border border-cyan-glow/10 rounded-xl focus:ring-1 focus:ring-cyan-glow outline-none transition-all text-white text-sm font-mono"
        placeholder=""
      />
    </div>
  );
}

/* ------------------------ Mini Calculator Modal ------------------------ */
/**
 * Safe simple expression calculator:
 * - supports digits, ., + - * / ( )
 * - blocks other characters
 */
function MiniCalcModal({
  open,
  onClose,
  onApply,
  title,
}: {
  open: boolean;
  onClose: () => void;
  onApply: (value: number) => void;
  title: string;
}) {
  const [expr, setExpr] = useState("");
  const [preview, setPreview] = useState<number | null>(null);
  const [calcErr, setCalcErr] = useState<string>("");

  React.useEffect(() => {
    if (!open) return;
    // reset each open
    setExpr("");
    setPreview(null);
    setCalcErr("");
  }, [open]);

  const safeEval = (input: string): number => {
    // allow only math characters
    const cleaned = input.replace(/\s+/g, "");
    if (cleaned === "") return 0;
    if (!/^[0-9+\-*/().]+$/.test(cleaned)) {
      throw new Error("Only numbers and + - * / ( ) are allowed");
    }
    // eslint-disable-next-line no-new-func
    const val = Function(`"use strict"; return (${cleaned});`)();
    const num = Number(val);
    if (!isFinite(num)) throw new Error("Invalid result");
    return num;
  };

  React.useEffect(() => {
    if (!open) return;
    try {
      const v = safeEval(expr);
      setPreview(v);
      setCalcErr("");
    } catch (e: any) {
      setPreview(null);
      setCalcErr(expr.trim() === "" ? "" : (e?.message || "Invalid expression"));
    }
  }, [expr, open]);

  const append = (s: string) => setExpr((p) => p + s);
  const backspace = () => setExpr((p) => p.slice(0, -1));
  const clear = () => setExpr("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Close mini calculator"
      />

      {/* Panel */}
      <div className="relative w-full max-w-sm glass-panel rounded-3xl p-5 sm:p-6 border border-cyan-glow/20 shadow-[0_0_40px_rgba(34,211,238,0.15)]">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-cyan-glow">{title}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">
              Example: 1200+450*2
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-2xl border border-cyan-glow/10 bg-cyan-glow/5 hover:bg-cyan-glow/10 transition flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-cyan-glow" />
          </button>
        </div>

        <input
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          className="w-full px-4 py-3 bg-navy-deep/50 border border-cyan-glow/10 rounded-2xl outline-none text-white font-mono text-sm"
          placeholder="Enter expression"
          inputMode="text"
        />

        <div className="mt-3 flex items-center justify-between">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Result
          </div>
          <div className="font-mono font-bold text-white">
            {preview === null ? "—" : preview.toLocaleString(undefined, { maximumFractionDigits: 6 })}
          </div>
        </div>

        {calcErr ? <div className="mt-2 text-xs text-red-400 font-mono">{calcErr}</div> : null}

        <div className="mt-4 grid grid-cols-4 gap-2">
          {["7", "8", "9", "/"].map((k) => (
            <Key key={k} label={k} onClick={() => append(k)} />
          ))}
          {["4", "5", "6", "*"].map((k) => (
            <Key key={k} label={k} onClick={() => append(k)} />
          ))}
          {["1", "2", "3", "-"].map((k) => (
            <Key key={k} label={k} onClick={() => append(k)} />
          ))}
          <Key label="0" onClick={() => append("0")} />
          <Key label="." onClick={() => append(".")} />
          <Key label="+" onClick={() => append("+")} />
          <button
            type="button"
            onClick={backspace}
            className="h-11 rounded-2xl border border-cyan-glow/10 bg-cyan-glow/5 hover:bg-cyan-glow/10 transition flex items-center justify-center"
            aria-label="Backspace"
          >
            <Delete className="w-4 h-4 text-cyan-glow" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={clear}
            className="h-11 rounded-2xl border border-cyan-glow/10 bg-cyan-glow/5 hover:bg-cyan-glow/10 transition text-xs font-black uppercase tracking-[0.2em] text-cyan-glow"
          >
            Clear
          </button>

          <button
            type="button"
            onClick={() => onApply(preview ?? 0)}
            disabled={preview === null || !!calcErr}
            className="h-11 rounded-2xl bg-cyan-glow text-navy-deep font-black uppercase tracking-[0.2em] text-xs hover:bg-white transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Use Result
          </button>
        </div>
      </div>
    </div>
  );
}

function Key({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-11 rounded-2xl border border-cyan-glow/10 bg-cyan-glow/5 hover:bg-cyan-glow/10 transition font-mono font-bold text-white"
    >
      {label}
    </button>
  );
}
