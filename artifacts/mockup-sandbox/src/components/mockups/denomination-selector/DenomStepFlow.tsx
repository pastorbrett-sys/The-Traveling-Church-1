import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const denominations = [
  {
    id: "protestant",
    label: "Protestant",
    description: "Baptist, Methodist, Pentecostal, Lutheran, & more",
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M12 3v18" />
        <path d="M6 8h12" />
        <path d="M8 12h8" />
        <path d="M6 16h12" />
        <path d="M10 3l2-1 2 1" />
      </svg>
    ),
  },
  {
    id: "catholic",
    label: "Catholic",
    description: "Roman Catholic, Eastern Catholic, & more",
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M12 3v18" />
        <path d="M6 9h12" />
      </svg>
    ),
  },
  {
    id: "orthodox",
    label: "Orthodox",
    description: "Eastern Orthodox, Oriental Orthodox, & more",
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
        <path d="M12 3v18" />
        <path d="M6 7h12" />
        <path d="M8 12h8" />
        <path d="M6 17h12" />
        <path d="M9 3l3-1 3 1" />
        <path d="M9 21l3 1 3-1" />
      </svg>
    ),
  },
];

export function DenomStepFlow() {
  const [selected, setSelected] = useState<string | null>("protestant");

  return (
    <div className="min-h-screen w-full flex flex-col" style={{ background: "hsl(30, 20%, 97%)", fontFamily: "'Poppins', system-ui, sans-serif" }}>
      {/* Step Indicator */}
      <div className="px-6 pt-10 pb-2">
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                style={{
                  background: step === 1 ? "#B78D00" : "hsl(30, 15%, 90%)",
                  color: step === 1 ? "white" : "hsl(20, 10%, 50%)",
                }}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className="w-8 h-0.5 rounded"
                  style={{ background: step === 1 ? "#B78D00" : "hsl(30, 15%, 90%)" }}
                />
              )}
            </div>
          ))}
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#B78D00" }}>
          Step 1 of 3
        </p>
        <h1 className="text-2xl font-bold leading-tight mb-2" style={{ color: "hsl(20, 10%, 15%)" }}>
          Choose Your Tradition
        </h1>
        <p className="text-sm" style={{ color: "hsl(20, 10%, 40%)" }}>
          Select the Christian tradition that best describes your faith.
        </p>
      </div>

      {/* Pill selectors */}
      <div className="flex-1 px-5 pb-4 space-y-3">
        {denominations.map((d) => {
          const isSelected = selected === d.id;
          const Icon = d.icon;
          return (
            <button
              key={d.id}
              onClick={() => setSelected(d.id)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 text-left"
              style={{
                background: isSelected ? "#fffdf5" : "white",
                border: isSelected ? "2px solid #B78D00" : "2px solid hsl(30, 20%, 88%)",
                boxShadow: isSelected
                  ? "0 4px 20px rgba(183,141,0,0.12)"
                  : "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: isSelected ? "#B78D00" : "hsl(30, 15%, 90%)",
                  color: isSelected ? "white" : "hsl(25, 35%, 45%)",
                }}
              >
                <Icon />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base" style={{ color: "hsl(20, 10%, 15%)" }}>
                  {d.label}
                </h3>
                <p className="text-xs mt-0.5" style={{ color: "hsl(20, 10%, 45%)" }}>
                  {d.description}
                </p>
              </div>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-200"
                style={{
                  background: isSelected ? "#B78D00" : "hsl(30, 15%, 90%)",
                }}
              >
                {isSelected && <Check className="w-4 h-4 text-white" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom CTA with progress */}
      <div className="px-5 pb-8 pt-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(30, 15%, 90%)" }}>
            <div className="h-full rounded-full" style={{ width: "33%", background: "#B78D00" }} />
          </div>
          <span className="text-xs font-medium" style={{ color: "hsl(20, 10%, 40%)" }}>33%</span>
        </div>
        <Button
          className="w-full h-14 text-base font-semibold rounded-xl"
          style={{
            background: "#B78D00",
            color: "white",
          }}
        >
          Next Step
        </Button>
        <p className="text-center text-xs mt-3" style={{ color: "hsl(20, 10%, 50%)" }}>
          You can change this anytime in Settings
        </p>
      </div>
    </div>
  );
}
