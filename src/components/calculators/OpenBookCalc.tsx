import React, { useState } from "react";
import { FileText, ArrowRight } from "lucide-react";

type OpenBookInputs = {
  baseFreight: string;
  quantity: string;
  initialRate: string;
  revisedRate: string;
  additionalDays: string;
  extraMiles: string;
  extraExpenses: string;
  ballastSpeed: string;
  ladenSpeed: string;
  ballastVLSFO: string;
  ladenVLSFO: string;
  seaLSMGO: string;
  idleVLSFO: string;
  workingVLSFO: string;
  portLSMGO: string;
  vlsfoCost: string;
  lsmgoCost: string;
  vesselHire: string;
  addcom: string;
};

export function OpenBookCalc() {
  // Keep numeric inputs as STRINGS so user can clear field (empty string).
  const [inputs, setInputs] = useState<OpenBookInputs>({
    baseFreight: "",
    quantity: "",
    initialRate: "",
    revisedRate: "",
    additionalDays: "",
    extraMiles: "",
    extraExpenses: "",
    ballastSpeed: "",
    ladenSpeed: "",
    ballastVLSFO: "",
    ladenVLSFO: "",
    seaLSMGO: "",
    idleVLSFO: "",
    workingVLSFO: "",
    portLSMGO: "",
    vlsfoCost: "",
    lsmgoCost: "",
    vesselHire: "",
    addcom: "",
  });

  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toNum = (v: string) => (v === "" ? 0 : Number(v));

  const calculate = async () => {
    try {
      setLoading(true);
      setError("");

      // Convert to numeric payload ONLY here
      const payload = {
        baseFreight: toNum(inputs.baseFreight),
        quantity: toNum(inputs.quantity),
        initialRate: toNum(inputs.initialRate),
        revisedRate: toNum(inputs.revisedRate),
        additionalDays: toNum(inputs.additionalDays),
        extraMiles: toNum(inputs.extraMiles),
        extraExpenses: toNum(inputs.extraExpenses),
        ballastSpeed: toNum(inputs.ballastSpeed),
        ladenSpeed: toNum(inputs.ladenSpeed),
        ballastVLSFO: toNum(inputs.ballastVLSFO),
        ladenVLSFO: toNum(inputs.ladenVLSFO),
        seaLSMGO: toNum(inputs.seaLSMGO),
        idleVLSFO: toNum(inputs.idleVLSFO),
        workingVLSFO: toNum(inputs.workingVLSFO),
        portLSMGO: toNum(inputs.portLSMGO),
        vlsfoCost: toNum(inputs.vlsfoCost),
        lsmgoCost: toNum(inputs.lsmgoCost),
        vesselHire: toNum(inputs.vesselHire),
        addcom: toNum(inputs.addcom),
      };

      const res = await fetch("/api/calculate-openbook", {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // keep as raw string (allow "")
    setInputs((prev) => ({ ...prev, [name]: value } as OpenBookInputs));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:py-12">
      <div className="flex items-center gap-4 mb-8 sm:mb-12">
        <div className="bg-cyan-glow/10 p-2 sm:p-3 rounded-2xl border border-cyan-glow/20 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
          <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-glow" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tighter uppercase">
            Open Book <span className="text-cyan-glow">Audit</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">
            Freight Adjustment & Cost Breakdown Module
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6 sm:gap-8">
        <div className="lg:col-span-3 space-y-6 sm:space-y-8">
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            <Section title="Cargo Logistics" icon={<FileText className="w-4 h-4" />}>
              <Input label="Base Freight ($)" name="baseFreight" value={inputs.baseFreight} onChange={handleChange} />
              <Input label="Quantity (MT)" name="quantity" value={inputs.quantity} onChange={handleChange} />
              <Input label="Initial Load or Discharge Rate" name="initialRate" value={inputs.initialRate} onChange={handleChange} />
            </Section>

            <Section title="Vessel Specs" icon={<ArrowRight className="w-4 h-4" />}>
              <Input label="Laden Speed (kts)" name="ladenSpeed" value={inputs.ladenSpeed} onChange={handleChange} />
              <Input label="Laden VLSFO (MT/d)" name="ladenVLSFO" value={inputs.ladenVLSFO} onChange={handleChange} />
              <Input label="Sea LSMGO (MT/d)" name="seaLSMGO" value={inputs.seaLSMGO} onChange={handleChange} />
              <Input label="Idle VLSFO (MT/d)" name="idleVLSFO" value={inputs.idleVLSFO} onChange={handleChange} />
              <Input label="Working VLSFO (MT/d)" name="workingVLSFO" value={inputs.workingVLSFO} onChange={handleChange} />
              <Input label="Port LSMGO (MT/d)" name="portLSMGO" value={inputs.portLSMGO} onChange={handleChange} />
            </Section>

            <Section title="Operation Cost" icon={<ArrowRight className="w-4 h-4" />}>
              <Input label="VLSFO Cost ($/MT)" name="vlsfoCost" value={inputs.vlsfoCost} onChange={handleChange} />
              <Input label="LSMGO Cost ($/MT)" name="lsmgoCost" value={inputs.lsmgoCost} onChange={handleChange} />
              <Input label="Vessel Hire ($/day)" name="vesselHire" value={inputs.vesselHire} onChange={handleChange} />
              <Input label="Addcom (%)" name="addcom" value={inputs.addcom} onChange={handleChange} />
            </Section>

            <Section title="Revised Routes" icon={<ArrowRight className="w-4 h-4" />}>
              <Input label="Revised Load or Discharge Rate" name="revisedRate" value={inputs.revisedRate} onChange={handleChange} />
              <Input label="Additional Days" name="additionalDays" value={inputs.additionalDays} onChange={handleChange} />
              <Input label="Extra Miles" name="extraMiles" value={inputs.extraMiles} onChange={handleChange} />
              <Input label="Extra Expenses ($)" name="extraExpenses" value={inputs.extraExpenses} onChange={handleChange} />

              <button
                onClick={calculate}
                disabled={loading}
                className="w-full mt-4 py-4 bg-cyan-glow text-navy-deep rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-white transition-all shadow-[0_0_30px_rgba(34,211,238,0.3)] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Recalculate Audit"}
              </button>

              {error ? <p className="text-xs text-red-400 font-mono mt-2">{error}</p> : null}
            </Section>
          </div>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl overflow-hidden border border-cyan-glow/20">
            <div className="bg-cyan-glow/10 p-4 sm:p-6 border-b border-cyan-glow/10">
              <h3 className="font-bold text-xs uppercase tracking-widest text-cyan-glow">
                Freight Summary
              </h3>
            </div>
            <div className="p-4 sm:p-6 space-y-6">
              <div className="flex justify-between">
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                  Additional Freight
                </span>
                <span className="text-lg font-mono font-bold text-white">
                  ${results?.additionalFreight?.toFixed(2) ?? "0.00"}
                </span>
              </div>

              <div className="pt-6 border-t border-cyan-glow/10">
                <span className="text-cyan-glow text-[10px] font-bold uppercase tracking-widest block mb-2">
                  Adjusted Rate
                </span>
                <div className="text-3xl font-mono font-bold text-white">
                  ${results?.newFreight?.toFixed(2) ?? "0.00"}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-3xl p-4 sm:p-6 space-y-4">
            <Metric label="Extra Sailing" value={results?.extraSailing?.toFixed(2) ?? "0.00"} unit="Days" />
            <Metric label="Extra Port Days" value={results?.extraPortDays?.toFixed(2) ?? "0.00"} unit="Days" />
            <Metric label="Total Extra Days" value={results?.totalDays?.toFixed(2) ?? "0.00"} unit="Days" />
            <Metric label="Total Extra Cost" value={results?.extraCost?.toFixed(0) ?? "0"} unit="$" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="glass-panel rounded-3xl p-6 space-y-4">
      <div className="flex items-center gap-2 text-white font-bold mb-2 text-xs uppercase tracking-widest">
        <div className="bg-cyan-glow/10 p-1.5 rounded-lg text-cyan-glow">{icon}</div>
        {title}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Metric({
  label,
  value,
  unit = "",
}: {
  label: string;
  value: any;
  unit?: string;
}) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-slate-500 font-bold uppercase tracking-widest">{label}</span>
      <span className="font-mono font-bold text-white">
        {value} <span className="text-[10px] text-slate-600">{unit}</span>
      </span>
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
        className="w-full px-4 py-2 bg-navy-deep/50 border border-cyan-glow/10 rounded-xl focus:ring-1 focus:ring-cyan-glow outline-none transition-all text-white text-sm font-mono"
        placeholder=""
      />
    </div>
  );
}
