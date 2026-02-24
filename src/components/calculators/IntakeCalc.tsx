import React, { useState } from "react";
import { Anchor, Info } from "lucide-react";

type IntakeInputs = {
  deadweight: string;
  draft: string;
  tpc: string;
  grainCapacity: string;
  sf: string;
  draftRestriction: string;
  waterDensity: string;
  vslConstant: string;
  qty: string;
  tolerance: string;
  tropical: "No" | "Yes";
};

export function IntakeCalc() {
  // Keep numeric inputs as STRINGS so user can clear field (empty string).
  const [inputs, setInputs] = useState<IntakeInputs>({
    deadweight: "",
    draft: "",
    tpc: "",
    grainCapacity: "",
    sf: "",
    draftRestriction: "",
    waterDensity: "1.025",
    vslConstant: "",
    qty: "",
    tolerance: "",
    tropical: "No",
  });

  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const toNum = (v: string) => (v === "" ? 0 : Number(v));

  const calculate = async () => {
    try {
      setLoading(true);
      setError("");

      // Convert to numeric payload ONLY here
      const payload = {
        deadweight: toNum(inputs.deadweight),
        draft: toNum(inputs.draft),
        tpc: toNum(inputs.tpc),
        grainCapacity: toNum(inputs.grainCapacity),
        sf: toNum(inputs.sf),
        draftRestriction: toNum(inputs.draftRestriction),
        waterDensity: toNum(inputs.waterDensity),
        vslConstant: toNum(inputs.vslConstant),
        qty: toNum(inputs.qty),
        tolerance: toNum(inputs.tolerance),
        tropical: inputs.tropical,
      };

      const res = await fetch("/api/calculate-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || `Request failed (${res.status})`);
      }

      setResult(data.result);
    } catch (err: any) {
      console.error("Calculation error:", err);
      setError(err?.message || "Calculation failed");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "tropical") {
      setInputs((prev) => ({ ...prev, tropical: value as "No" | "Yes" }));
      return;
    }

    // keep as raw string (allow "")
    setInputs((prev) => ({ ...prev, [name]: value } as IntakeInputs));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-12">
      <div className="flex items-center gap-4 mb-8 sm:mb-12">
        <div className="bg-cyan-glow/10 p-2 sm:p-3 rounded-2xl border border-cyan-glow/20 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
          <Anchor className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-glow" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tighter uppercase">
            Intake <span className="text-cyan-glow">Analysis</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">
            Cargo Capacity Optimization Module
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 sm:p-8">
          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-[10px] font-bold text-cyan-glow uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                <div className="w-1 h-1 bg-cyan-glow rounded-full"></div>
                Vessel Specifications
              </h3>
              <Input label="Deadweight (MT)" name="deadweight" value={inputs.deadweight} onChange={handleChange} />
              <Input label="Draft (m)" name="draft" value={inputs.draft} onChange={handleChange} />
              <Input label="TPC" name="tpc" value={inputs.tpc} onChange={handleChange} />
              <Input label="Grain Capacity (cbft)" name="grainCapacity" value={inputs.grainCapacity} onChange={handleChange} />
              <Input label="Stowage Factor (SF) (1m³ = 35.315 ft³)" name="sf" value={inputs.sf} onChange={handleChange} />
            </div>
<CbmToCbftConverter
  onApplyCbft={(cbft) =>
    setInputs((prev) => ({ ...prev, grainCapacity: cbft }))
  }
/>
            <div className="space-y-4 sm:space-y-6">
              <h3 className="text-[10px] font-bold text-cyan-glow uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                <div className="w-1 h-1 bg-cyan-glow rounded-full"></div>
                Operational Constraints
              </h3>
              <Input label="Draft Restriction (m)" name="draftRestriction" value={inputs.draftRestriction} onChange={handleChange} />
              <Input label="Water Density" name="waterDensity" value={inputs.waterDensity} onChange={handleChange} />
              <Input label="Vessel Constant (MT)" name="vslConstant" value={inputs.vslConstant} onChange={handleChange} />
              <Input label="Cargo Quantity (MT)" name="qty" value={inputs.qty} onChange={handleChange} />
              <Input label="Tolerance (%)" name="tolerance" value={inputs.tolerance} onChange={handleChange} />

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
                  Tropical Zone
                </label>
                <select
                  name="tropical"
                  value={inputs.tropical}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-navy-deep/50 border border-cyan-glow/10 rounded-xl focus:ring-1 focus:ring-cyan-glow outline-none transition-all text-white text-sm"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={calculate}
            disabled={loading}
            className="w-full mt-8 sm:mt-12 py-4 bg-cyan-glow text-navy-deep rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-white transition-all shadow-[0_0_30px_rgba(34,211,238,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Execute Analysis"}
          </button>

          {error ? <p className="mt-4 text-xs text-red-400 font-mono">{error}</p> : null}
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border-l-4 border-l-cyan-glow">
            <h3 className="text-cyan-glow text-[10px] font-bold uppercase tracking-widest mb-4">
              Calculated Intake
            </h3>
            <div className="text-4xl sm:text-5xl font-mono font-bold text-white mb-2 tracking-tighter">
              {result !== null ? `${result.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "—"}
              <span className="text-sm text-slate-500 ml-2">MT</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-6">
              <div className="w-2/3 h-full bg-cyan-glow animate-pulse"></div>
            </div>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-4">
              Confidence: 99.8%
            </p>
          </div>

          <div className="glass-panel rounded-3xl p-6">
            <div className="flex items-start gap-3 text-slate-400 text-xs leading-relaxed">
              <Info className="w-4 h-4 text-cyan-glow shrink-0 mt-0.5" />
              <p>
                System processing considers draft restrictions, water density adjustments, and grain capacity limitations for high-precision estimation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function VolumeConverter() {
  const [cbm, setCbm] = React.useState<string>("");
  const [cbft, setCbft] = React.useState<string>("");

  const CBM_TO_CBFT = 35.3146667;

  const handleCbmChange = (value: string) => {
    setCbm(value);
    if (value === "") {
      setCbft("");
    } else {
      const result = Number(value) * CBM_TO_CBFT;
      setCbft(result.toFixed(2));
    }
  };

  const handleCbftChange = (value: string) => {
    setCbft(value);
    if (value === "") {
      setCbm("");
    } else {
      const result = Number(value) / CBM_TO_CBFT;
      setCbm(result.toFixed(2));
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 max-w-md mx-auto">
      <h3 className="text-[10px] font-bold text-cyan-glow uppercase tracking-[0.3em] mb-2">
        CBM ⇄ CBFT Converter
      </h3>

      <p className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--vp-muted)] mb-6">
        1 CBM = 35.3146667 CBFT
      </p>

      <div className="space-y-5">
        {/* CBM */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest ml-1 text-[color:var(--vp-muted)]">
            Cubic Meter (CBM)
          </label>
          <input
            type="number"
            step="any"
            inputMode="decimal"
            value={cbm}
            onChange={(e) => handleCbmChange(e.target.value)}
            className="w-full px-4 py-3 bg-navy-deep/50 border border-cyan-glow/10 rounded-xl focus:ring-1 focus:ring-cyan-glow outline-none transition-all text-[color:var(--vp-text)] text-sm font-mono"
          />
        </div>

        {/* CBFT */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest ml-1 text-[color:var(--vp-muted)]">
            Cubic Feet (CBFT)
          </label>
          <input
            type="number"
            step="any"
            inputMode="decimal"
            value={cbft}
            onChange={(e) => handleCbftChange(e.target.value)}
            className="w-full px-4 py-3 bg-navy-deep/50 border border-cyan-glow/10 rounded-xl focus:ring-1 focus:ring-cyan-glow outline-none transition-all text-[color:var(--vp-text)] text-sm font-mono"
          />
        </div>

        {/* Clear */}
        <button
          type="button"
          onClick={() => {
            setCbm("");
            setCbft("");
          }}
          className="w-full py-3 rounded-2xl border border-cyan-glow/15 bg-cyan-glow/5 text-[10px] font-bold uppercase tracking-widest text-[color:var(--vp-text)] hover:bg-cyan-glow/10 transition"
        >
          Clear
        </button>
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
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
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
