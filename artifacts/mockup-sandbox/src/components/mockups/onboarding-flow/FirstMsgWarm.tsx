import { useState } from "react";
// Avatar placeholder — in the real app this uses @assets/Pastor_Brett_Chat_Icon_1767476985840.png

const traditions = [
  { id: "protestant", label: "Protestant" },
  { id: "catholic", label: "Catholic" },
  { id: "orthodox", label: "Orthodox" },
  { id: "other", label: "Other tradition" },
];

export function FirstMsgWarm() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="min-h-screen w-full flex flex-col" style={{ background: "hsl(30, 20%, 97%)", fontFamily: "'Poppins', system-ui, sans-serif" }}>
      {/* Top Tabs */}
      <div className="px-4 pt-4 pb-2">
        <div className="inline-flex bg-white rounded-xl p-1 shadow-sm">
          <button className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2" style={{ background: "#f5f5f5", color: "hsl(20, 10%, 15%)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Chat
          </button>
          <button className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2" style={{ color: "hsl(20, 10%, 45%)" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            Bible
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 px-4 pt-4 pb-4 space-y-4">
        {/* First message */}
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold" style={{ background: "#B78D00" }}>BB</div>
          <div className="flex-1">
            <div className="inline-block px-4 py-3 rounded-2xl rounded-tl-none text-sm" style={{ background: "white", color: "hsl(20, 10%, 15%)", border: "1px solid hsl(30, 20%, 88%)" }}>
              <p>Peace be with you! I'm Brett — here to help you explore Scripture, grow in faith, or just talk through what's on your heart.</p>
              <p className="mt-2">To serve you best, I'd love to know: what tradition do you worship in?</p>
            </div>
          </div>
        </div>

        {/* Tradition bubbles */}
        <div className="flex flex-wrap gap-2 pl-[52px]">
          {traditions.map((t) => {
            const isSelected = selected === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelected(t.id)}
                className="px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200"
                style={{
                  background: isSelected ? "#B78D00" : "white",
                  color: isSelected ? "white" : "#B78D00",
                  border: isSelected ? "none" : "1px solid rgba(183,141,0,0.3)",
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Response after selection */}
        {selected && (
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold" style={{ background: "#B78D00" }}>BB</div>
            <div className="flex-1">
              <div className="inline-block px-4 py-3 rounded-2xl rounded-tl-none text-sm" style={{ background: "#fffdf5", color: "hsl(20, 10%, 15%)", border: "1px solid rgba(183,141,0,0.2)" }}>
                <p className="font-medium" style={{ color: "#B78D00" }}>
                  {selected === "catholic"
                    ? "Beautiful. I'm Father Brett, and I'm honored to walk with you."
                    : selected === "orthodox"
                    ? "Beautiful. I'm Father Brett, and I'm honored to walk with you."
                    : "Beautiful. I'm Pastor Brett, and I'm honored to walk with you."}
                </p>
                <p className="mt-1" style={{ color: "hsl(20, 10%, 40%)" }}>
                  What's on your mind today?
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="px-4 pb-6">
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: "white", border: "1px solid hsl(30, 20%, 88%)" }}>
          <span className="text-sm" style={{ color: "hsl(20, 10%, 50%)" }}>Share what's on your heart...</span>
        </div>
      </div>
    </div>
  );
}
