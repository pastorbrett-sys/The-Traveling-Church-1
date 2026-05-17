import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Church, Pencil } from "lucide-react";
import { apiFetch } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { type TraditionProfile, PRESET_TRADITIONS } from "@shared/traditions";

const TRADITION_KEY = "userTradition";

type Choice = "protestant" | "catholic" | "orthodox" | "other" | "not_sure";

interface Props {
  isAuthenticated: boolean;
}

export function TraditionSettings({ isAuthenticated }: Props) {
  const { toast } = useToast();
  const [profile, setProfile] = useState<TraditionProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [otherMode, setOtherMode] = useState(false);
  const [otherText, setOtherText] = useState("");
  const [classifying, setClassifying] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      try {
        const v = localStorage.getItem(TRADITION_KEY);
        if (v) {
          try {
            const parsed = JSON.parse(v);
            if (parsed?.tradition) setProfile(parsed);
          } catch {}
        }
      } catch {}
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const res = await apiFetch("/api/user/tradition");
        if (res.ok) {
          const data = await res.json();
          if (data?.tradition) setProfile(data.tradition);
        }
      } catch {}
      setLoading(false);
    })();
  }, [isAuthenticated]);

  const save = useCallback(async (next: TraditionProfile) => {
    setProfile(next);
    try { localStorage.setItem(TRADITION_KEY, JSON.stringify(next)); } catch {}
    if (isAuthenticated) {
      try {
        await apiFetch("/api/user/tradition", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(next),
        });
      } catch {
        toast({ title: "Saved locally", description: "Couldn't reach the server, your choice is saved on this device.", variant: "default" });
      }
    }
    setEditing(false);
    setOtherMode(false);
    setOtherText("");
    toast({ title: "Tradition updated", description: `Brett will address you as ${next.personaTitle} Brett.` });
  }, [isAuthenticated, toast]);

  const handleChoice = useCallback((choice: Choice) => {
    if (choice === "other") { setOtherMode(true); return; }
    const preset = choice === "not_sure" ? PRESET_TRADITIONS.not_sure : PRESET_TRADITIONS[choice];
    save(preset);
  }, [save]);

  const handleOtherSubmit = useCallback(async () => {
    const text = otherText.trim();
    if (!text) return;
    setClassifying(true);
    try {
      const res = await apiFetch("/api/user/tradition/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.profile?.tradition) {
          await save(data.profile);
          return;
        }
      }
      await save({ tradition: text.slice(0, 80), traditionCategory: "other", personaTitle: "Pastor" });
    } catch {
      await save({ tradition: text.slice(0, 80), traditionCategory: "other", personaTitle: "Pastor" });
    } finally {
      setClassifying(false);
    }
  }, [otherText, save]);

  const choices: { value: Choice; label: string }[] = [
    { value: "protestant", label: "Protestant" },
    { value: "catholic", label: "Catholic" },
    { value: "orthodox", label: "Orthodox" },
    { value: "other", label: "Other" },
    { value: "not_sure", label: "I'm not sure" },
  ];

  return (
    <Card data-testid="card-tradition-settings">
      <CardHeader>
        <CardTitle className="flex items-center gap-2" data-testid="heading-tradition">
          <Church className="w-5 h-5" />
          Tradition
        </CardTitle>
        <CardDescription>
          Personalizes how Brett addresses you and which tradition flavors his answers.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center text-sm text-muted-foreground"><Loader2 className="w-4 h-4 mr-2 animate-spin" />Loading…</div>
        ) : !editing ? (
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium" data-testid="text-tradition-current">
                {profile ? profile.tradition : "Not set"}
              </div>
              <div className="text-xs text-muted-foreground">
                {profile ? `Addressed as ${profile.personaTitle} Brett` : "Pick one to personalize Brett"}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setEditing(true)} data-testid="button-edit-tradition">
              <Pencil className="w-4 h-4 mr-1" />{profile ? "Change" : "Choose"}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {!otherMode && !classifying && (
              <div className="flex flex-wrap gap-2">
                {choices.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => handleChoice(c.value)}
                    className="inline-flex items-center gap-2 bg-[#b8860b]/10 border border-[#b8860b]/30 text-[#9a7209] dark:text-[#d4a843] rounded-full px-4 py-2 text-sm font-medium hover:bg-[#b8860b]/20 transition-colors"
                    data-testid={`button-tradition-${c.value}`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            )}
            {otherMode && !classifying && (
              <form onSubmit={(e) => { e.preventDefault(); handleOtherSubmit(); }} className="flex gap-2" data-testid="form-tradition-other-settings">
                <input
                  type="text"
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  placeholder="Type your tradition (e.g. Anglican, Coptic)…"
                  maxLength={120}
                  autoFocus
                  className="flex-1 rounded-full border border-[#b8860b]/30 bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#b8860b]/40"
                  data-testid="input-tradition-other-settings"
                />
                <Button type="submit" disabled={!otherText.trim()} className="rounded-full bg-[#b8860b] hover:bg-[#9a7209] text-white" data-testid="button-tradition-other-submit-settings">
                  Save
                </Button>
              </form>
            )}
            {classifying && (
              <div className="flex items-center text-sm text-muted-foreground"><Loader2 className="w-4 h-4 mr-2 animate-spin" />Setting that up…</div>
            )}
            <Button variant="ghost" size="sm" onClick={() => { setEditing(false); setOtherMode(false); setOtherText(""); }} data-testid="button-cancel-tradition">
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
