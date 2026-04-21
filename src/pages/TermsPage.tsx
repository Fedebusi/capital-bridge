import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
        <h1 className="text-4xl font-bold text-primary tracking-tight mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-400 mb-10">Last updated: 21 April 2026</p>

        <section className="space-y-6 text-slate-600 text-[15px] leading-relaxed">
          <div>
            <h2 className="text-xl font-bold text-primary mt-8 mb-3">1. Acceptance</h2>
            <p>
              By accessing CapitalBridge you agree to these Terms of Service and to our Privacy Policy.
              CapitalBridge is an internal portfolio-management tool for an institutional real-estate
              debt fund. Access is granted by the fund manager only.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-primary mt-8 mb-3">2. Eligible users</h2>
            <p>
              The platform is restricted to (i) the fund's employees, (ii) authorised advisors and
              auditors, and (iii) institutional investors with an active subscription. Any other access
              is prohibited and may be logged and reported.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-primary mt-8 mb-3">3. Not investment advice</h2>
            <p>
              Content, metrics, and projections shown in the platform — including PIK schedules, IRR
              estimates, covenant statuses, and valuations — are provided for internal management and
              reporting purposes only. They do not constitute investment advice, an offer to sell, or a
              solicitation to buy any financial instrument.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-primary mt-8 mb-3">4. Accuracy</h2>
            <p>
              We take reasonable care to ensure accuracy, but deal data, construction progress, and
              borrower information may be incomplete or out of date. Final investment decisions must
              be based on signed term sheets, executed loan agreements, and official reports, not on
              the platform's real-time views.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-primary mt-8 mb-3">5. Confidentiality</h2>
            <p>
              All deal, borrower, and investor data on the platform is confidential. You must not copy,
              export, or disclose it outside the fund except as strictly necessary for your role and in
              compliance with your employment or subscription agreement.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-primary mt-8 mb-3">6. Account security</h2>
            <p>
              You are responsible for maintaining the confidentiality of your credentials and for all
              activity under your account. Notify the administrator immediately on suspected compromise.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-primary mt-8 mb-3">7. Service availability</h2>
            <p>
              CapitalBridge is provided "as is" and "as available". We do not guarantee uninterrupted
              access, and we may perform planned maintenance, release updates, or suspend accounts that
              violate these Terms without notice.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-primary mt-8 mb-3">8. Liability</h2>
            <p>
              To the maximum extent permitted by law, neither the fund manager nor any sub-processor is
              liable for indirect, consequential, or lost-profit damages arising from use of the platform.
              Nothing limits liability for fraud, gross negligence, or statutory liability that cannot be
              excluded.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-primary mt-8 mb-3">9. Governing law</h2>
            <p>
              These Terms are governed by Spanish law. The courts of Madrid have exclusive jurisdiction,
              subject to any mandatory consumer-protection rights that apply to you.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-primary mt-8 mb-3">10. Contact</h2>
            <p>
              Questions about these Terms can be sent to
              <a href="mailto:legal@capitalbridge.com" className="text-accent underline"> legal@capitalbridge.com</a>.
            </p>
          </div>
        </section>

        <div className="mt-12 pt-6 border-t border-slate-100 flex gap-6 text-sm">
          <Link to="/privacy" className="text-slate-500 hover:text-primary transition-colors">Privacy Policy</Link>
          <Link to="/" className="text-slate-500 hover:text-primary transition-colors">Home</Link>
        </div>
      </main>
    </div>
  );
}
