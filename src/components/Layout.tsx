import React from "react";
import { Ship, Menu, X, Sun, Moon } from "lucide-react";
import { cn } from "../lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  setView: (v: any) => void;
}

type ThemeMode = "dark" | "light";

export function Layout({ children, currentView, setView }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // ✅ Start default as dark, then read localStorage safely in useEffect
  const [theme, setTheme] = React.useState<ThemeMode>("dark");

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("vp-theme");
      if (saved === "dark" || saved === "light") {
        setTheme(saved);
        document.documentElement.classList.toggle("dark", saved === "dark");
      } else {
        // default dark
        document.documentElement.classList.add("dark");
      }
    } catch {
      // ignore
    }
  }, []);

  React.useEffect(() => {
    // ✅ Apply theme class to <html>
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem("vp-theme", theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const navItems = [
    { id: "home", label: "Dashboard" },
    { id: "intake", label: "Intake" },
    { id: "voyage", label: "Voyage" },
    { id: "ballast", label: "Ballast" },
    { id: "openbook", label: "Open Book" },
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-navy-deep flex flex-col font-sans text-[color:var(--vp-text)]">
      {/* Header */}
      <header className="bg-navy-deep/80 backdrop-blur-md border-b border-cyan-glow/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            {/* Brand */}
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setView("home")}
            >
              <div className="bg-cyan-glow/10 p-2 rounded-lg group-hover:bg-cyan-glow transition-all border border-cyan-glow/20">
                <Ship className="w-5 h-5 text-cyan-glow group-hover:text-navy-deep" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-black tracking-tighter uppercase text-[color:var(--vp-text)]">
                  VoyagePro
                </span>
                <span className="text-[8px] font-bold text-cyan-glow tracking-[0.3em] uppercase">
                  Intelligence
                </span>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-[0.2em] transition-all relative py-2",
                    currentView === item.id
                      ? "text-cyan-glow after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-cyan-glow shadow-[0_10px_20px_-10px_rgba(34,211,238,0.5)]"
                      : "text-[color:var(--vp-muted)] hover:text-[color:var(--vp-text)]"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Desktop Right Side */}
            <div className="hidden md:flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl border border-cyan-glow/10 bg-cyan-glow/5 hover:bg-cyan-glow/10 transition"
                aria-label="Toggle theme"
                title="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-cyan-glow" />
                ) : (
                  <Moon className="w-5 h-5 text-cyan-glow" />
                )}
              </button>

              <div className="px-3 py-1 rounded-full bg-cyan-glow/5 border border-cyan-glow/10 text-[8px] font-bold text-cyan-glow uppercase tracking-[0.3em]">
                System Status: Online
              </div>
            </div>

            {/* Mobile buttons */}
            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl border border-cyan-glow/10 bg-cyan-glow/5 hover:bg-cyan-glow/10 transition"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 text-cyan-glow" />
                ) : (
                  <Moon className="w-5 h-5 text-cyan-glow" />
                )}
              </button>

              <button
                className="p-2 text-cyan-glow"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Open menu"
              >
                {isMenuOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Overlay */}
        <div
          className={cn(
            "fixed inset-0 z-[100] bg-navy-deep transition-all duration-300 md:hidden",
            isMenuOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
          )}
        >
          <div className="flex flex-col h-full p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-3">
                <div className="bg-cyan-glow/10 p-2 rounded-lg border border-cyan-glow/20">
                  <Ship className="w-6 h-6 text-cyan-glow" />
                </div>
                <span className="text-xl font-black tracking-tighter uppercase text-[color:var(--vp-text)]">
                  VoyagePro
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-xl border border-cyan-glow/10 bg-cyan-glow/5 hover:bg-cyan-glow/10 transition"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? (
                    <Sun className="w-6 h-6 text-cyan-glow" />
                  ) : (
                    <Moon className="w-6 h-6 text-cyan-glow" />
                  )}
                </button>

                <button
                  className="p-2 text-cyan-glow hover:bg-cyan-glow/10 rounded-full transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>
            </div>

            <nav className="flex flex-col gap-4">
              {navItems.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setView(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={cn(
                    "text-4xl font-black uppercase tracking-tight text-left transition-all duration-300 flex items-center gap-4 py-2",
                    currentView === item.id
                      ? "text-cyan-glow"
                      : "text-[color:var(--vp-muted)] hover:text-[color:var(--vp-text)]"
                  )}
                >
                  <span className="text-xs font-mono opacity-20">0{index + 1}</span>
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="mt-auto pt-10 border-t border-cyan-glow/10">
              <div className="flex items-center gap-2 text-cyan-glow/60 text-[10px] font-bold uppercase tracking-widest mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-glow animate-pulse"></div>
                System Status: Online
              </div>
              <div className="grid grid-cols-2 gap-4 text-[10px] font-bold uppercase tracking-widest text-[color:var(--vp-muted)]">
                <a href="#" className="hover:text-[color:var(--vp-text)] transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="hover:text-[color:var(--vp-text)] transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="hover:text-[color:var(--vp-text)] transition-colors">
                  Technical Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow relative">{children}</main>

      {/* Footer */}
      <footer className="bg-navy-deep border-t border-cyan-glow/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <Ship className="w-6 h-6 text-cyan-glow" />
              <span className="text-lg font-bold tracking-tighter uppercase text-[color:var(--vp-text)]">
                VoyagePro
              </span>
            </div>

            <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-[color:var(--vp-muted)]">
              <a href="#" className="hover:text-cyan-glow transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-cyan-glow transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-cyan-glow transition-colors">
                Support
              </a>
            </div>

            <div className="text-[10px] font-bold uppercase tracking-widest text-[color:var(--vp-muted)]">
              © 2026 VoyagePro Maritime. v4.2.0-stable
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
