import { useState, useEffect } from "react";
import { Heart, MessageSquare, ArrowLeft, CheckCircle } from "lucide-react";
import { Link, useSearch } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

const PRESET_AMOUNTS = [
  { value: 2500, label: "$25" },
  { value: 5500, label: "$55" },
  { value: 10000, label: "$100" },
  { value: 25000, label: "$250" },
  { value: 50000, label: "$500" },
  { value: 100000, label: "$1,000" },
];

type Frequency = "one-time" | "monthly";

export default function Donate() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const isSuccess = params.get("success") === "true";
  const isCancelled = params.get("cancelled") === "true";

  const [frequency, setFrequency] = useState<Frequency>("one-time");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isSuccess) {
      window.gtag?.("event", "purchase", { transaction_id: "donation" });
    }
  }, [isSuccess]);

  const isCustom = selectedAmount === null && customAmount !== "";

  const finalAmountCents = isCustom
    ? Math.round(parseFloat(customAmount) * 100)
    : selectedAmount;

  const finalAmountDisplay = finalAmountCents
    ? `$${(finalAmountCents / 100).toLocaleString()}`
    : null;

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/donate/create-checkout", {
        amountCents: finalAmountCents,
        frequency,
        note: note || undefined,
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        window.gtag?.("event", "begin_checkout", {
          value: finalAmountCents! / 100,
          currency: "USD",
          donation_frequency: frequency,
        });
        window.location.href = data.url;
      }
    },
    onError: () => {
      setError("Something went wrong. Please try again.");
    },
  });

  const handleSubmit = () => {
    setError("");
    if (!finalAmountCents || finalAmountCents < 100) {
      setError("Minimum donation is $1.00");
      return;
    }
    if (finalAmountCents > 99999900) {
      setError("Please contact us for donations over $999,999");
      return;
    }
    checkoutMutation.mutate();
  };

  const handlePresetClick = (value: number) => {
    setSelectedAmount(value);
    setCustomAmount("");
    setError("");
  };

  const handleCustomChange = (val: string) => {
    const cleaned = val.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    const formatted = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : cleaned;
    setCustomAmount(formatted);
    setSelectedAmount(null);
    setError("");
  };

  return (
    <div className="bg-background text-foreground antialiased min-h-screen">
      <Navigation />

      <main className="pt-8 pb-20">
        <div className="max-w-md mx-auto px-4">
          <Link
            href="/programs"
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 transition-colors text-sm"
            data-testid="link-back-programs"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Programs
          </Link>

          {isSuccess && (
            <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 text-center" data-testid="banner-success">
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
              <h2 className="text-xl font-bold text-green-800 dark:text-green-200 mb-2">
                Thank you for your generosity!
              </h2>
              <p className="text-green-700 dark:text-green-300 text-sm">
                Your donation supports The Traveling Church's mission worldwide. God bless you.
              </p>
            </div>
          )}

          {isCancelled && (
            <div className="mb-6 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-6 text-center" data-testid="banner-cancelled">
              <p className="text-orange-700 dark:text-orange-300 text-sm">
                No worries — your payment was not processed. You can try again whenever you're ready.
              </p>
            </div>
          )}

          <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 px-6 pt-8 pb-6 text-center">
              <div className="donatePageIcon inline-flex items-center justify-center w-14 h-14 rounded-full mb-4">
                <Heart className="w-7 h-7 text-white" fill="white" />
              </div>
              <h1
                className="text-2xl md:text-3xl font-bold"
                data-testid="heading-donate"
              >
                Choose amount
              </h1>
              <p className="text-sm text-muted-foreground mt-2">
                Every gift supports The Traveling Church's mission worldwide.
              </p>
            </div>

            <div className="px-6 pb-8 pt-6 space-y-6">
              <div
                className="flex rounded-full border border-border overflow-hidden"
                data-testid="toggle-frequency"
              >
                <button
                  onClick={() => setFrequency("one-time")}
                  className={`flex-1 py-3 text-sm font-semibold transition-all ${
                    frequency === "one-time"
                      ? "donateFreqActive text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid="button-onetime"
                >
                  One-time
                </button>
                <button
                  onClick={() => setFrequency("monthly")}
                  className={`flex-1 py-3 text-sm font-semibold transition-all ${
                    frequency === "monthly"
                      ? "donateFreqActive text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid="button-monthly"
                >
                  Monthly
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {PRESET_AMOUNTS.map((amount) => (
                  <button
                    key={amount.value}
                    onClick={() => handlePresetClick(amount.value)}
                    className={`py-3.5 rounded-xl text-sm font-semibold transition-all border ${
                      selectedAmount === amount.value
                        ? "donateAmountActive border-primary text-foreground shadow-md scale-[1.03]"
                        : "border-border bg-card text-foreground hover:border-primary/50 hover:shadow-sm"
                    }`}
                    data-testid={`button-amount-${amount.value}`}
                  >
                    {amount.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-lg">
                  $
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="Other"
                  value={customAmount}
                  onChange={(e) => handleCustomChange(e.target.value)}
                  className={`w-full py-3.5 pl-9 pr-16 rounded-xl border text-lg font-medium transition-all bg-card text-foreground placeholder:text-muted-foreground focus:outline-none ${
                    isCustom
                      ? "border-primary shadow-md"
                      : "border-border focus:border-primary/50"
                  }`}
                  data-testid="input-custom-amount"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                  USD
                </span>
              </div>

              <div>
                <button
                  onClick={() => setShowNote(!showNote)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="button-toggle-note"
                >
                  <MessageSquare className="w-4 h-4" />
                  {showNote ? "Hide note" : "Add note/comment"}
                </button>
                {showNote && (
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Leave a message with your gift (optional)"
                    rows={3}
                    className="mt-3 w-full rounded-xl border border-border bg-card text-foreground px-4 py-3 text-sm resize-none focus:outline-none focus:border-primary/50 placeholder:text-muted-foreground"
                    data-testid="textarea-note"
                  />
                )}
              </div>

              {error && (
                <p className="text-sm text-red-500 text-center" data-testid="text-error">
                  {error}
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={
                  (!selectedAmount && !customAmount) ||
                  checkoutMutation.isPending
                }
                className="donateContinueBtn w-full py-4 rounded-full text-white font-semibold text-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                data-testid="button-continue-donate"
              >
                {checkoutMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <>
                    Continue
                    {finalAmountDisplay && frequency === "monthly"
                      ? ` — ${finalAmountDisplay}/mo`
                      : finalAmountDisplay
                        ? ` — ${finalAmountDisplay}`
                        : ""}
                  </>
                )}
              </button>

              <p className="text-xs text-center text-muted-foreground leading-relaxed">
                You'll be redirected to Stripe for secure payment.
                {frequency === "monthly" && " You can cancel anytime."}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
