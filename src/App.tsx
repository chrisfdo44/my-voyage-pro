import React, { useState, useEffect } from "react";
import { Layout } from "./components/Layout";
import { Auth } from "./components/Auth";
import { IntakeCalc } from "./components/calculators/IntakeCalc";
import { VoyageCalc } from "./components/calculators/VoyageCalc";
import { BallastCalc } from "./components/calculators/BallastCalc";
import { OpenBookCalc } from "./components/calculators/OpenBookCalc";
import VesselCargoCalculator from "./components/calculators/VesselCargoCalculator";
import { Ship, Calculator, FileText, Navigation, Anchor, LogIn, ArrowRight } from "lucide-react";

type View = "home" | "intake" | "voyage" | "ballast" | "openbook" | "cargo" | "auth";

export default function App() {
  const [view, setView] = useState<View>("home");

  const renderView = () => {
    switch (view) {
      case "intake": return <IntakeCalc />;
      case "cargo": return <VesselCargoCalculator />;
      case "voyage": return <VoyageCalc />;
      case "ballast": return <BallastCalc />;
      case "openbook": return <OpenBookCalc />;
      default: return <Home onSelectView={setView} />;
    }
  };

  return (
    <Layout 
      currentView={view} 
      setView={setView} 
    >
      {renderView()}
    </Layout>
  );
}

function Home({ onSelectView }: { onSelectView: (v: View) => void }) {
  const tools = [
    { id: "intake", name: "Intake", icon: Anchor, desc: "Cargo Capacity Analysis" },
    { id: "voyage", name: "Voyage", icon: Navigation, desc: "Route & Fuel Optimization" },
    { id: "ballast", name: "Ballast", icon: Ship, desc: "DOP Hire Calculation" },
    { id: "openbook", name: "Open Book", icon: FileText, desc: "Freight Cost Breakdown" },
  ];

  return (
    <div className="relative min-h-screen bg-navy-deep overflow-hidden font-sans">
      {/* Background Ocean & Ship */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1544161513-0179fe746fd5?auto=format&fit=crop&w=2400&q=80" 
          alt="Bulk Carrier at Night"
          className="w-full h-full object-cover opacity-40 grayscale"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/80 via-transparent to-navy-deep"></div>
      </div>

      {/* Holographic Overlays */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {/* GPS Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <path d="M-100 600 Q 400 400 900 700 T 1800 500" fill="none" stroke="#22d3ee" strokeWidth="2" className="animate-pulse-glow" />
          <path d="M-100 700 Q 500 500 1000 800 T 1900 600" fill="none" stroke="#22d3ee" strokeWidth="1" className="animate-pulse-glow" />
        </svg>

        {/* Floating Data Points */}
      </div>

      {/* Main Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-20 pb-20 sm:pb-32">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
          {/* Hero Text */}
          <div className="max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-glow/10 border border-cyan-glow/20 text-cyan-glow text-[10px] font-bold uppercase tracking-[0.3em] mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-glow animate-pulse"></div>
              System Active: Global Network
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-white tracking-tighter leading-tight sm:leading-none mb-6">
              Maritime <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-glow to-blue-400">Intelligence</span> Dashboard
            </h1>
            <p className="text-slate-400 text-lg sm:text-xl leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0">
              Next-generation analytics for the modern bulk carrier fleet. Real-time voyage optimization and cargo logistics.
            </p>
            
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <button 
                onClick={() => onSelectView("voyage")}
                className="w-full sm:w-auto px-8 py-4 bg-cyan-glow text-navy-deep font-bold rounded-xl hover:bg-white transition-all shadow-[0_0_20px_rgba(34,211,238,0.4)]"
              >
                Launch Operations
              </button>
            </div>
          </div>

          {/* Holographic Ship Display (Visual Representation) */}
          <div className="relative w-full max-w-lg aspect-square lg:aspect-auto lg:h-[500px] flex items-center justify-center mt-10 lg:mt-0">
            <div className="absolute inset-0 bg-cyan-glow/5 rounded-full blur-3xl animate-pulse-glow"></div>
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              <Ship className="w-48 h-48 sm:w-64 sm:h-64 text-cyan-glow/40 animate-float" />
              {/* Decorative HUD Elements */}
              <div className="absolute inset-0 border-[1px] border-cyan-glow/20 rounded-full animate-[spin_20s_linear_infinite]"></div>
              <div className="absolute inset-4 border-[1px] border-dashed border-cyan-glow/10 rounded-full animate-[spin_30s_linear_infinite_reverse]"></div>
            </div>
          </div>
        </div>

        {/* Tools Grid - Futuristic Style */}
        <div className="mt-20 sm:mt-32 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onSelectView(tool.id as View)}
              className="group glass-panel p-6 sm:p-8 rounded-3xl hover:border-cyan-glow/50 transition-all text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-glow/5 rounded-bl-full -mr-12 -mt-12 group-hover:bg-cyan-glow/10 transition-colors"></div>
              <div className="w-12 h-12 rounded-xl bg-cyan-glow/10 flex items-center justify-center mb-6 border border-cyan-glow/20 group-hover:scale-110 transition-transform">
                <tool.icon className="w-6 h-6 text-cyan-glow" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{tool.name}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{tool.desc}</p>
              <div className="mt-6 flex items-center gap-2 text-[10px] font-bold text-cyan-glow opacity-0 group-hover:opacity-100 transition-opacity">
                ACCESS MODULE <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
