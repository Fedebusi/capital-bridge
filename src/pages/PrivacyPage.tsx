import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur z-20">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <span className="text-sm font-bold text-primary">CapitalBridge</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 prose prose-slate">
        <h1 className="text-4xl font-bold text-primary tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-400 mb-10">Last updated: 21 April 2026</p>

        <section className="space-y-6 text-slate-600 text-[15px] leading-relaxed">
          <div>
            <h2 className="text-xl font-bold text-primary mt-8 mb-3">1. Who we are</h2>
            <p>
              CapitalBridge is operated by the fund manager and data controller responsible for the platform.
              This notice explains how we collect, use, and protect personal data when you access the platform.
              For any data-protection inquiry please contact us at <a href="mailto:privacy@capitalbridge.com" className="text-accent underline">privacy@capitalbridge.com</a>.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-primary mt-8 mb-3">2. Data we collect</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Account data:</strong> name, email, role, hashed password, authentication timestamps.</li>
              <li><strong>Activity data:</strong> deal views, edits, uploads, and audit-log entries tied to your user ID.</li>
              <li><strong>Uploaded content:</strong> documents, photos, and term sheets that you or your team upload.</li>
              <li><strong>Technical data:</strong> IP address, browser, device, and error-tracking events (via Sentry when enabled).</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-primary mt-8 mb-3">3. Purpose and legal basis</h2>
            <p>
              We process personal data to operate the platform (contractual necessity, GDPR art. 6(1)(b)), to
              comply with legal and regulatory obligations applicable to real-estate debt funds
              (art. 6(1)(c)), and for our legitimate interests in securing and improving the service (art. 6(1)(f)).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-primary mt-8 mb-3">4. Storage and retention</h2>
            <p>
              Data is stored on Supabase (PostgreSQL hosted in the EU) and Vercel (frontend hosting). We retain
              account and deal data for the duration of the fund's lifecycle plus the statutory retention
              period for financial and AML records (10 years under Spanish law). Audit logs are retained for
              the same period.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-primary mt-8 mb-3">5. Sharing and sub-processors</h2>
            <p>
              We use the following sub-processors under data-processing agreements:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Supabase</strong> — authentication, database, storage (EU region).</li>
              <li><strong>Vercel</strong> — frontend hosting and analytics.</li>
              <li><strong>Sentry</strong> — error monitoring (when enabled).</li>
              <li><strong>Resend</strong> — transactional email (when enabled).</li>
            </ul>
            <p className="mt-2">
              We do not sell personal data. Data may be disclosed to regulators, auditors, or the fund's
              capital partner (CastleLake) where strictly required by contract or law.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-primary mt-8 mb-3">6. Your rights (GDPR)</h2>
            <p>
              You may request access, rectification, erasure, restriction, portability, or object to
              processing of your personal data. You may also withdraw consent at any time and lodge a
              complaint with the Spanish Data Protection Authority (AEPD). Email
              <a href="mailto:privacy@capitalbridge.com" className="text-accent underline"> privacy@capitalbridge.com</a> to exercise any right.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-primary mt-8 mb-3">7. Cookies</h2>
            <p>
              CapitalBridge uses only strictly necessary cookies for authentication and session management.
              Optional analytics cookies (Vercel Analytics) are loaded only after you accept via the cookie
              banner shown on first visit. You can revoke consent at any time by clearing your browser
              storage.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-primary mt-8 mb-3">8. Security</h2>
            <p>
              Data is encrypted in transit (TLS 1.2+) and at rest. Access is controlled by Supabase
              row-level security policies bound to user roles. Passwords are hashed with bcrypt. Suspicious
              activity is logged and reviewed.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-primary mt-8 mb-3">9. Changes</h2>
            <p>
              We may update this policy to reflect operational, legal, or regulatory changes. Material changes
              will be notified via email or in-app notice.
            </p>
          </div>
        </section>

        <div className="mt-12 pt-6 border-t border-slate-100 flex gap-6 text-sm">
          <Link to="/terms" className="text-slate-500 hover:text-primary transition-colors">Terms of Service</Link>
          <Link to="/" className="text-slate-500 hover:text-primary transition-colors">Home</Link>
        </div>
      </main>
    </div>
  );
}
