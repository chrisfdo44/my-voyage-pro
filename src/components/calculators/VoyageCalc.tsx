import React, { useState } from "react";
import { Navigation, Info, DollarSign, Clock, Fuel } from "lucide-react";

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

export function VoyageCalc() {
  // IMPORTANT: keep these as STRINGS so the user can clear the field (empty string).
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

  // Convert "" -> 0, otherwise Number(...)
  const toNum = (v: string) => (v === "" ? 0 : Number(v));

  const calculate = async () => {
    try {
      setLoading(true);
      setError("");

      // Convert to numeric payload only here
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

      if (!res.ok) {
        throw new Error(data?.error || `Request failed (${res.status})`);
      }

      setResults(data);
    } catch (err: any) {
      console.error("Calculation error:", err);
      setError(err?.message || "Calculation failed");
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  // Keep raw string so empty is allowed
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
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

              <div className="grid grid-cols-2 gap-4">
                <Input label="PDA ($)" name="pda" value={inputs.pda} onChange={handleChange} />
                <Input label="Other Exp ($)" name="otherExpenses" value={inputs.otherExpenses} onChange={handleChange} />
              </div>

              <Input label="Bunker Price (VLSFO)" name="vlsfoRate" value={inputs.vlsfoRate} onChange={handleChange} />
            </div>

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

        <div className="space-y-6">
          {results ? (
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border-l-4 border-l-cyan-glow space-y-6 sm:space-y-8">
              <div>
                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">
                  <Clock className="w-3 h-3 text-cyan-glow" /> Total Duration
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tighter">
                  {Number(results.totalDuration || 0).toFixed(2)}{" "}
                  <span className="text-xs text-slate-500">DAYS</span>
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
                <div className="text-cyan-glow text-[10px] font-bold uppercase tracking-widest mb-2">
                  Target Freight Rate
                </div>
                <div className="text-4xl sm:text-5xl font-mono font-bold text-cyan-glow tracking-tighter">
                  ${Number(results.freight || 0).toFixed(2)}
                </div>
                <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">
                  Per Metric Ton
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl border border-dashed border-cyan-glow/20 p-8 text-center flex flex-col items-center justify-center h-full min-h-[300px] sm:min-h-[400px]">
              <Navigation className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-glow/10 mb-4 animate-pulse" />
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                Awaiting Operational Data
              </p>
            </div>
          )}

          <div className="glass-panel rounded-3xl p-6">
            <div className="flex items-start gap-3 text-slate-400 text-xs leading-relaxed">
              <Info className="w-4 h-4 text-cyan-glow shrink-0 mt-0.5" />
              <p>
                Calculations include standard commissions and bunker adjustments. System utilizes real-time market indices for estimation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
        {label}
      </label>
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
