import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "seascroll-xp-v1";
const DAILY_CAP_KEY = "seascroll-xp-daily-v1";

export type XpReason =
  | "chat-message"
  | "verse-opened"
  | "chapter-read"
  | "note-saved";

const XP_AMOUNTS: Record<XpReason, number> = {
  "chat-message": 15,
  "verse-opened": 5,
  "chapter-read": 25,
  "note-saved": 10,
};

const DAILY_REASON_CAPS: Partial<Record<XpReason, number>> = {
  "chapter-read": 5,
  "verse-opened": 20,
};

export interface XpState {
  totalXp: number;
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  progress: number;
}

function xpToState(totalXp: number): XpState {
  let level = 1;
  let cumulative = 0;
  while (totalXp >= cumulative + 100 * level) {
    cumulative += 100 * level;
    level += 1;
  }
  const xpIntoLevel = totalXp - cumulative;
  const xpForNextLevel = 100 * level;
  return {
    totalXp,
    level,
    xpIntoLevel,
    xpForNextLevel,
    progress: xpIntoLevel / xpForNextLevel,
  };
}

let memoizedTotal: number | null = null;

function readTotal(): number {
  if (memoizedTotal !== null) return memoizedTotal;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    memoizedTotal = raw ? Math.max(0, parseInt(raw, 10) || 0) : 0;
    return memoizedTotal;
  } catch {
    memoizedTotal = 0;
    return 0;
  }
}

function writeTotal(xp: number) {
  memoizedTotal = xp;
  try {
    localStorage.setItem(STORAGE_KEY, String(xp));
  } catch {}
}

function todayKey() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
}

function readDailyCounts(): Record<string, number> {
  try {
    const raw = localStorage.getItem(DAILY_CAP_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed?.day !== todayKey()) return {};
    return parsed.counts || {};
  } catch {
    return {};
  }
}

function writeDailyCounts(counts: Record<string, number>) {
  try {
    localStorage.setItem(
      DAILY_CAP_KEY,
      JSON.stringify({ day: todayKey(), counts }),
    );
  } catch {}
}

const XP_EVENT = "seascroll-xp-changed";
const LEVEL_UP_EVENT = "seascroll-xp-levelup";

export function grantXp(reason: XpReason, multiplier = 1) {
  const baseAmount = XP_AMOUNTS[reason] * multiplier;
  if (!baseAmount) return;

  const cap = DAILY_REASON_CAPS[reason];
  let amount = baseAmount;
  if (cap != null) {
    const counts = readDailyCounts();
    const used = counts[reason] || 0;
    const remaining = Math.max(0, cap - used);
    amount = Math.min(remaining, baseAmount);
    if (amount <= 0) return;
    counts[reason] = used + 1;
    writeDailyCounts(counts);
  }

  const prev = readTotal();
  const next = prev + amount;
  writeTotal(next);

  const prevState = xpToState(prev);
  const nextState = xpToState(next);
  window.dispatchEvent(new CustomEvent(XP_EVENT, { detail: nextState }));
  if (nextState.level > prevState.level) {
    window.dispatchEvent(
      new CustomEvent(LEVEL_UP_EVENT, {
        detail: { from: prevState.level, to: nextState.level },
      }),
    );
  }
}

export function useXp(): XpState & { onLevelUp: (cb: (e: { from: number; to: number }) => void) => () => void } {
  const [state, setState] = useState<XpState>(() => xpToState(readTotal()));

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<XpState>).detail;
      if (detail) setState(detail);
    };
    const storageHandler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        memoizedTotal = null;
        setState(xpToState(readTotal()));
      }
    };
    window.addEventListener(XP_EVENT, handler);
    window.addEventListener("storage", storageHandler);
    return () => {
      window.removeEventListener(XP_EVENT, handler);
      window.removeEventListener("storage", storageHandler);
    };
  }, []);

  const onLevelUp = useCallback(
    (cb: (e: { from: number; to: number }) => void) => {
      const handler = (e: Event) => {
        cb((e as CustomEvent).detail);
      };
      window.addEventListener(LEVEL_UP_EVENT, handler);
      return () => window.removeEventListener(LEVEL_UP_EVENT, handler);
    },
    [],
  );

  return { ...state, onLevelUp };
}
