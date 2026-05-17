import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const denominations = [
  {
    id: "protestant",
    label: "Protestant",
    subtitle: "Baptist, Methodist, Pentecostal, Lutheran, & more",
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
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
    subtitle: "Roman Catholic, Eastern Catholic, & more",
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M12 3v18" />
        <path d="M6 9h12" />
      </svg>
    ),
  },
  {
    id: "orthodox",
    label: "Orthodox",
    subtitle: "Eastern Orthodox, Oriental Orthodox, & more",
    icon: () => (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
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

export function DenomCards() {
  const [selected, setSelected] = useState<string | null>("protestant");

  return (
    <div className="min-h-screen w-full flex flex-col" style={{ background: "hsl(30, 20%, 97%)", fontFamily: "'Poppins', system-ui, sans-serif" }}>
      {/* Header */}
      <div className="px-6 pt-12 pb-4">
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "hsl(25, 35%, 45%)" }}>
          Welcome to Sea Scroll
        </p>
        <h1 className="text-2xl font-bold leading-tight mb-2" style={{ color: "hsl(20, 10%, 15%)" }}>
          Which Christian tradition do you call home?
        </h1>
        <p className="text-sm" style={{ color: "hsl(20, 10%, 40%)" }}>
          This helps us tailor prayers, readings, and community for you.
        </p>
      </div>

      {/* Cards */}
      <div className="flex-1 px-5 pb-6 space-y-3">
        {denominations.map((d) => {
          const isSelected = selected === d.id;
          const Icon = d.icon;
          return (
            <Card
              key={d.id}
              onClick={() => setSelected(d.id)}
              className="cursor-pointer transition-all duration-200 border-2"
              style={{
                borderColor: isSelected ? "#B78D00" : "hsl(30, 20%, 88%)",
                background: isSelected ? "#fffdf5" : "white",
                boxShadow: isSelected ? "0 4px 20px rgba(183,141,0,0.15)" : "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <CardContent className="p-4 flex items-center gap-4">
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
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base" style={{ color: "hsl(20, 10%, 15%)" }}>
                      {d.label}
                    </h3>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#B78D00] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: "hsl(20, 10%, 45%)" }}>
                    {d.subtitle}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="px-5 pb-8 pt-2">
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
