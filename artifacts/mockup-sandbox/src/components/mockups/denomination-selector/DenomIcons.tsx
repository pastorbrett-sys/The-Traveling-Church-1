import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const denominations = [
  {
    id: "protestant",
    label: "Protestant",
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
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
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
        <path d="M12 3v18" />
        <path d="M6 9h12" />
      </svg>
    ),
  },
  {
    id: "orthodox",
    label: "Orthodox",
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
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

export function DenomIcons() {
  const [selected, setSelected] = useState<string | null>("protestant");

  return (
    <div className="min-h-screen w-full flex flex-col" style={{ background: "hsl(30, 20%, 97%)", fontFamily: "'Poppins', system-ui, sans-serif" }}>
      {/* Header */}
      <div className="px-6 pt-12 pb-6 text-center">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: "#B78D00" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
            <path d="M12 3v18" />
            <path d="M6 8h12" />
            <path d="M8 12h8" />
            <path d="M6 16h12" />
            <path d="M10 3l2-1 2 1" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold leading-tight mb-2" style={{ color: "hsl(20, 10%, 15%)" }}>
          Pick Your Tradition
        </h1>
        <p className="text-sm" style={{ color: "hsl(20, 10%, 40%)" }}>
          We tailor content to how you worship.
        </p>
      </div>

      {/* Icon Grid */}
      <div className="flex-1 px-8">
        <div className="grid grid-cols-3 gap-4">
          {denominations.map((d) => {
            const isSelected = selected === d.id;
            const Icon = d.icon;
            return (
              <button
                key={d.id}
                onClick={() => setSelected(d.id)}
                className="flex flex-col items-center gap-2 transition-all duration-200"
              >
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-200"
                  style={{
                    background: isSelected ? "#B78D00" : "white",
                    color: isSelected ? "white" : "hsl(25, 35%, 45%)",
                    border: isSelected ? "none" : "2px solid hsl(30, 20%, 88%)",
                    boxShadow: isSelected
                      ? "0 8px 24px rgba(183,141,0,0.25)"
                      : "0 1px 4px rgba(0,0,0,0.04)",
                  }}
                >
                  <Icon />
                </div>
                <span
                  className="text-sm font-medium"
                  style={{ color: isSelected ? "#B78D00" : "hsl(20, 10%, 35%)" }}
                >
                  {d.label}
                </span>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-[#B78D00] flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selected detail card */}
        {selected && (
          <div
            className="mt-6 p-4 rounded-xl text-center"
            style={{ background: "#fffdf5", border: "1px solid rgba(183,141,0,0.2)" }}
          >
            <p className="text-sm" style={{ color: "hsl(20, 10%, 35%)" }}>
              {selected === "protestant" && "Baptist, Methodist, Pentecostal, Lutheran, Presbyterian, and more"}
              {selected === "catholic" && "Roman Catholic, Eastern Catholic, and other Catholic traditions"}
              {selected === "orthodox" && "Eastern Orthodox, Oriental Orthodox, and other Orthodox traditions"}
            </p>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="px-5 pb-8 pt-4">
        <Button
          className="w-full h-14 text-base font-semibold rounded-xl"
          style={{
            background: "#B78D00",
            color: "white",
          }}
        >
          Continue
        </Button>
        <p className="text-center text-xs mt-3" style={{ color: "hsl(20, 10%, 50%)" }}>
          You can change this anytime in Settings
        </p>
      </div>
    </div>
  );
}
