import { useState } from "react";
import { Button } from "@/components/ui/button";

export function OnboardingWelcome() {
  const [started, setStarted] = useState(false);

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{ background: "hsl(30, 20%, 97%)", fontFamily: "'Poppins', system-ui, sans-serif" }}
    >
      {/* Hero illustration area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
          style={{ background: "#B78D00" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12">
            <path d="M12 3v18" />
            <path d="M6 8h12" />
            <path d="M8 12h8" />
            <path d="M6 16h12" />
            <path d="M10 3l2-1 2 1" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold leading-tight mb-3" style={{ color: "hsl(20, 10%, 15%)" }}>
          Welcome to Sea Scroll
        </h1>
        <p className="text-base max-w-xs mx-auto" style={{ color: "hsl(20, 10%, 40%)" }}>
          Your personal AI pastor for Bible study, prayer, and spiritual guidance.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {["AI Pastor", "Bible Reader", "Prayer Timer", "Daily Verses"].map((f) => (
            <span
              key={f}
              className="px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: "#fffdf5", color: "#B78D00", border: "1px solid rgba(183,141,0,0.2)" }}
            >
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-5 pb-10 pt-4">
        <Button
          onClick={() => setStarted(true)}
          className="w-full h-14 text-base font-semibold rounded-xl"
          style={{ background: "#B78D00", color: "white" }}
        >
          {started ? "Let's go..." : "Get Started"}
        </Button>
        <p className="text-center text-xs mt-3" style={{ color: "hsl(20, 10%, 50%)" }}>
          Takes less than a minute
        </p>
      </div>
    </div>
  );
}
