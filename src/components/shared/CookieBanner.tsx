import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

const CONSENT_KEY = "capitalbridge_cookie_consent_v1";

type Consent = "accepted" | "rejected" | null;

export function getCookieConsent(): Consent {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(CONSENT_KEY);
  return v === "accepted" || v === "rejected" ? v : null;
}

export default function CookieBanner() {
  const [consent, setConsent] = useState<Consent>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setConsent(getCookieConsent());
  }, []);

  if (!mounted || consent !== null) return null;

  function record(value: "accepted" | "rejected") {
    localStorage.setItem(CONSENT_KEY, value);
    setConsent(value);
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-[60] animate-fade-in">
      <div className="rounded-2xl bg-primary text-white shadow-xl p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-sm font-bold uppercase tracking-wider">Cookies</h3>
          <button
            type="button"
            onClick={() => record("rejected")}
            aria-label="Reject non-essential cookies"
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-sm text-white/80 leading-relaxed">
          We use strictly necessary cookies for authentication. With your consent we also load
          privacy-friendly analytics to improve the platform.
          See our <Link to="/privacy" className="underline hover:text-accent">privacy policy</Link>.
        </p>
        <div className="flex gap-2 mt-4">
          <button
            type="button"
            onClick={() => record("rejected")}
            className="flex-1 rounded-full bg-white/10 hover:bg-white/20 px-4 py-2 text-xs font-semibold transition-colors"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={() => record("accepted")}
            className="flex-1 rounded-full bg-accent hover:bg-accent/90 px-4 py-2 text-xs font-semibold transition-colors"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
