import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useXp } from "@/hooks/use-xp";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface XpLevelBarProps {
  compact?: boolean;
}

export function XpLevelBar({ compact = false }: XpLevelBarProps) {
  const { level, xpIntoLevel, xpForNextLevel, progress, onLevelUp } = useXp();
  const [burst, setBurst] = useState<{ to: number; key: number } | null>(null);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    return onLevelUp(({ to }) => {
      setBurst({ to, key: Date.now() });
      setFlash(true);
      window.setTimeout(() => setFlash(false), 600);
      window.setTimeout(() => setBurst(null), 1600);
    });
  }, [onLevelUp]);

  const widthClass = compact ? "w-[110px]" : "w-[140px]";
  const remaining = xpForNextLevel - xpIntoLevel;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`relative inline-flex items-center gap-2 h-8 pl-1 pr-2.5 rounded-full bg-muted/70 border border-border/60 shadow-sm select-none ${widthClass}`}
            role="progressbar"
            aria-valuenow={Math.round(progress * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Level ${level}, ${xpIntoLevel} of ${xpForNextLevel} XP`}
            data-testid="xp-level-bar"
          >
            {/* Level badge */}
            <motion.div
              key={`lvl-${level}`}
              initial={{ scale: 1 }}
              animate={burst ? { scale: [1, 1.35, 1] } : { scale: 1 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="relative flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold text-white shadow-md"
              style={{
                background:
                  "linear-gradient(135deg, #f5d27a 0%, #d4a04a 55%, #a0742a 100%)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.55), 0 1px 3px rgba(120,80,20,0.35)",
              }}
              data-testid="xp-level-badge"
            >
              {level}
            </motion.div>

            {/* Bar track */}
            <div className="relative flex-1 h-2 rounded-full bg-foreground/10 overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, #f5d27a 0%, #e0b250 40%, #c9942e 100%)",
                  boxShadow: "0 0 8px rgba(212, 160, 74, 0.55)",
                }}
                animate={{ width: `${Math.min(100, Math.max(3, progress * 100))}%` }}
                transition={{ type: "spring", stiffness: 140, damping: 22 }}
                data-testid="xp-progress-fill"
              />
              {/* Shimmer */}
              <motion.div
                className="absolute inset-y-0 w-1/3 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
                }}
                animate={{ x: ["-120%", "320%"] }}
                transition={{
                  duration: 2.6,
                  repeat: Infinity,
                  repeatDelay: 1.4,
                  ease: "easeInOut",
                }}
              />
              {/* Level-up white flash */}
              <AnimatePresence>
                {flash && (
                  <motion.div
                    className="absolute inset-0 bg-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.9, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.55 }}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Level-up burst overlay */}
            <AnimatePresence>
              {burst && (
                <motion.div
                  key={burst.key}
                  initial={{ opacity: 0, y: 0, scale: 0.6 }}
                  animate={{ opacity: [0, 1, 1, 0], y: -34, scale: 1.05 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="absolute -top-1 left-1/2 -translate-x-1/2 pointer-events-none"
                >
                  <div
                    className="px-2 py-0.5 rounded-full text-[11px] font-bold text-white whitespace-nowrap"
                    style={{
                      background:
                        "linear-gradient(135deg, #f5d27a 0%, #d4a04a 60%, #a0742a 100%)",
                      boxShadow: "0 4px 14px rgba(212,160,74,0.55)",
                    }}
                    data-testid="xp-levelup-burst"
                  >
                    Level {burst.to}!
                  </div>
                  {/* Radiating sparkles */}
                  {[0, 1, 2, 3, 4, 5].map((i) => {
                    const angle = (i / 6) * Math.PI * 2;
                    return (
                      <motion.span
                        key={i}
                        initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
                        animate={{
                          x: Math.cos(angle) * 28,
                          y: Math.sin(angle) * 22,
                          opacity: 0,
                          scale: 1,
                        }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                        className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full"
                        style={{
                          background:
                            "radial-gradient(circle, #fff 0%, #f5d27a 60%, transparent 100%)",
                        }}
                      />
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          <div className="font-medium">Level {level}</div>
          <div className="text-muted-foreground">
            {xpIntoLevel} / {xpForNextLevel} XP · {remaining} to next
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
