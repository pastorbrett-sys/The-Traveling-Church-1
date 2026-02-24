import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function SecretBible() {
  const [, setLocation] = useLocation();

  return (
    <div className="fixed inset-0 w-full h-full">
      <button
        onClick={() => setLocation("/")}
        className="fixed top-4 left-4 z-50 bg-black/70 hover:bg-black/90 text-white rounded-full p-2 shadow-lg transition-colors"
        data-testid="button-back-from-secret-bible"
        aria-label="Back to The Traveling Church"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <iframe
        src="https://secretbible.org"
        className="w-full h-full border-0"
        title="Secret Bible"
        allow="clipboard-write; clipboard-read"
        data-testid="iframe-secret-bible"
      />
    </div>
  );
}
