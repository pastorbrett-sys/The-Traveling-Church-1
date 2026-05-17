import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, BookOpen } from "lucide-react";

const translations = [
  { id: "KJV", name: "King James Version", language: "English", popular: true },
  { id: "NIV", name: "New International Version", language: "English", popular: true },
  { id: "ESV", name: "English Standard Version", language: "English", popular: false },
  { id: "NRSV", name: "New Revised Standard Version", language: "English", popular: false },
  { id: "ETH", name: "Ethiopic (Geez)", language: "Amharic", popular: true },
  { id: "AMPROT", name: "Amharic Protestant", language: "Amharic", popular: false },
];

export function OnboardingBible() {
  const [selected, setSelected] = useState<string>("KJV");

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
                  background: step <= 2 ? "#B78D00" : "hsl(30, 15%, 90%)",
                  color: step <= 2 ? "white" : "hsl(20, 10%, 50%)",
                }}
              >
                {step < 2 ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  step
                )}
              </div>
              {step < 3 && (
                <div className="w-8 h-0.5 rounded" style={{ background: step <= 2 ? "#B78D00" : "hsl(30, 15%, 90%)" }} />
              )}
            </div>
          ))}
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#B78D00" }}>
          Step 2 of 3
        </p>
        <h1 className="text-2xl font-bold leading-tight mb-2" style={{ color: "hsl(20, 10%, 15%)" }}>
          Pick Your Bible
        </h1>
        <p className="text-sm" style={{ color: "hsl(20, 10%, 40%)" }}>
          Choose the translation you read most often.
        </p>
      </div>

      {/* Translation list */}
      <div className="flex-1 px-5 pb-4 space-y-2.5">
        {translations.map((t) => {
          const isSelected = selected === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 text-left"
              style={{
                background: isSelected ? "#fffdf5" : "white",
                border: isSelected ? "2px solid #B78D00" : "2px solid hsl(30, 20%, 88%)",
                boxShadow: isSelected ? "0 4px 20px rgba(183,141,0,0.12)" : "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{
                  background: isSelected ? "#B78D00" : "hsl(30, 15%, 90%)",
                  color: isSelected ? "white" : "hsl(25, 35%, 45%)",
                }}
              >
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm" style={{ color: "hsl(20, 10%, 15%)" }}>
                    {t.name}
                  </h3>
                  {t.popular && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ background: "rgba(183,141,0,0.12)", color: "#B78D00" }}>
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-xs mt-0.5" style={{ color: "hsl(20, 10%, 45%)" }}>
                  {t.language}
                </p>
              </div>
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-200"
                style={{ background: isSelected ? "#B78D00" : "hsl(30, 15%, 90%)" }}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom CTA with progress */}
      <div className="px-5 pb-8 pt-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(30, 15%, 90%)" }}>
            <div className="h-full rounded-full" style={{ width: "66%", background: "#B78D00" }} />
          </div>
          <span className="text-xs font-medium" style={{ color: "hsl(20, 10%, 40%)" }}>66%</span>
        </div>
        <Button className="w-full h-14 text-base font-semibold rounded-xl" style={{ background: "#B78D00", color: "white" }}>
          Next Step
        </Button>
        <p className="text-center text-xs mt-3" style={{ color: "hsl(20, 10%, 50%)" }}>
          You can change this anytime in Settings
        </p>
      </div>
    </div>
  );
}
