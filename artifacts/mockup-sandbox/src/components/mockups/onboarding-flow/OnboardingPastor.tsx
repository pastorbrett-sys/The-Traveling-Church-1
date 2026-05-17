import { useState } from "react";
import { Button } from "@/components/ui/button";

export function OnboardingPastor() {
  const [tradition] = useState("catholic"); // Mock: would come from Step 1

  const pastorName = tradition === "catholic" || tradition === "orthodox" ? "Father Brett" : "Pastor Brett";
  const pastorTitle = tradition === "catholic" || tradition === "orthodox" ? "Your AI Spiritual Father" : "Your AI Pastor";

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
                  background: step < 3 ? "#B78D00" : "#B78D00",
                  color: "white",
                }}
              >
                {step < 3 ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  step
                )}
              </div>
              {step < 3 && (
                <div className="w-8 h-0.5 rounded" style={{ background: "#B78D00" }} />
              )}
            </div>
          ))}
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#B78D00" }}>
          Step 3 of 3
        </p>
        <h1 className="text-2xl font-bold leading-tight mb-2" style={{ color: "hsl(20, 10%, 15%)" }}>
          Meet Your Pastor
        </h1>
        <p className="text-sm" style={{ color: "hsl(20, 10%, 40%)" }}>
          Ready to study the Word together.
        </p>
      </div>

      {/* Pastor Card */}
      <div className="flex-1 px-5 flex flex-col items-center justify-center">
        <div
          className="w-full max-w-sm p-6 rounded-2xl text-center"
          style={{
            background: "white",
            border: "2px solid hsl(30, 20%, 88%)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
          }}
        >
          {/* Avatar */}
          <div
            className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ background: "#B78D00" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>

          <h2 className="text-xl font-bold mb-1" style={{ color: "hsl(20, 10%, 15%)" }}>
            {pastorName}
          </h2>
          <p className="text-sm mb-4" style={{ color: "hsl(20, 10%, 40%)" }}>
            {pastorTitle}
          </p>

          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {["Bible Study", "Prayer", "Counsel", "Sermon Prep"].map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ background: "#fffdf5", color: "#B78D00", border: "1px solid rgba(183,141,0,0.15)" }}
              >
                {skill}
              </span>
            ))}
          </div>

          <p className="text-xs leading-relaxed" style={{ color: "hsl(20, 10%, 45%)" }}>
            Ask {pastorName} anything about Scripture, faith, or life. He'll tailor his responses to your{" "}
            {tradition === "catholic" ? "Catholic" : tradition === "orthodox" ? "Orthodox" : "Protestant"} tradition.
          </p>
        </div>
      </div>

      {/* Bottom CTA with progress */}
      <div className="px-5 pb-10 pt-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(30, 15%, 90%)" }}>
            <div className="h-full rounded-full" style={{ width: "100%", background: "#B78D00" }} />
          </div>
          <span className="text-xs font-medium" style={{ color: "hsl(20, 10%, 40%)" }}>100%</span>
        </div>
        <Button className="w-full h-14 text-base font-semibold rounded-xl" style={{ background: "#B78D00", color: "white" }}>
          Start Chatting
        </Button>
        <p className="text-center text-xs mt-3" style={{ color: "hsl(20, 10%, 50%)" }}>
          You can update your preferences anytime in Settings
        </p>
      </div>
    </div>
  );
}
