import React, { useState } from "react";
import { Ship, Info, TrendingUp } from "lucide-react";

export function BallastCalc() {
  const [inputs, setInputs] = useState({
    ballastDays: 0,
    voyageDays: 0,
    bunkerPrice: 0,
    consumptionBallast: 0,
    hireBssAps: 0,
    ballastBonus: 0,
  });

  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const calculate = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/calculate-ballast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({
      ...prev,
      [name]: value === "" ? 0 : Number(value),
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-12">
      <div className="flex items-center gap-4 mb-8 sm:mb-12">
        <div className="bg-cyan-glow/10 p-2 sm:p-3 rounded-2xl border border-cyan-glow/20 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
          <Ship className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-glow" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tighter uppercase">
            Ballast <span className="text-cyan-glow">Calculator</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">
            Gross DOP Hire Calculation Module
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
        <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 sm:space-y-8">
          <h3 className="text-[10px] font-bold text-cyan-glow uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
            <div className="w-1 h-1 bg-cyan-glow rounded-full"></div>
            Input Parameters
          </h3>

          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <Input label="Ballast Days" name="ballastDays" value={inputs.ballastDays} onChange={handleChange} />
            <Input label="Total Voyage Days" name="voyageDays" value={inputs.voyageDays} onChange={handleChange} />
          </div>

          <Input label="Bunker Price ($)" name="bunkerPrice" value={inputs.bunkerPrice} onChange={handleChange} />
          <Input
            label="Ballast Consumption (MT/day)"
            name="consumptionBallast"
            value={inputs.consumptionBallast}
            onChange={handleChange}
          />

          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <Input label="Hire Basis APS ($)" name="hireBssAps" value={inputs.hireBssAps} onChange={handleChange} />
            <Input label="Ballast Bonus ($)" name="ballastBonus" value={inputs.ballastBonus} onChange={handleChange} />
          </div>

          <button
            onClick={calculate}
            disabled={loading}
            className="w-full mt-4 py-4 bg-cyan-glow text-navy-deep rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-white transition-all shadow-[0_0_30px_rgba(34,211,238,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Calculate Gross DOP Hire"}
          </button>

          {error ? <p className="mt-2 text-xs text-red-400 font-mono">{error}</p> : null}
        </div>

        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border-l-4 border-l-cyan-glow relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-cyan-glow text-[10px] font-bold uppercase tracking-widest mb-4">
                Gross DOP Hire
              </h3>
              <div className="text-4xl sm:text-5xl font-mono font-bold text-white mb-6 tracking-tighter">
                {result !== null ? `$${result.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "—"}
              </div>
              <div className="flex items-center gap-2 text-cyan-glow/60 text-[10px] font-bold uppercase tracking-widest">
                <TrendingUp className="w-4 h-4" />
                Calculated per day basis
              </div>
            </div>
            <Ship className="absolute -right-12 -bottom-12 w-32 h-32 sm:w-48 sm:h-48 text-cyan-glow/5 rotate-12" />
          </div>

          <div className="glass-panel rounded-3xl p-6">
            <h4 className="text-[10px] font-bold text-cyan-glow uppercase tracking-widest mb-4 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Formula Logic
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              System calculates equivalent Daily Operating Profit (DOP) hire rate considering ballast leg duration, bunker consumption, and contractual ballast bonuses.
            </p>
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
  value: any;
  onChange: any;
}) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{label}</label>
      <input
        type="number"
        step="any"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 bg-navy-deep/50 border border-cyan-glow/10 rounded-xl focus:ring-1 focus:ring-cyan-glow outline-none transition-all text-white text-sm font-mono"
        placeholder="0.00"
      />
    </div>
  );
}
