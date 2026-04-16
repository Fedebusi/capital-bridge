import { useNavigate, Link } from "react-router-dom";
import { Building2, ShieldCheck, Landmark, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-accent to-indigo-400 flex items-center justify-center">
              <span className="text-white text-base font-bold">C</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-primary">CapitalBridge</span>
          </Link>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Benvenuto</h1>
          <p className="text-slate-500 text-base mt-2">Scegli come accedere alla piattaforma</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Platform access */}
          <button
            onClick={() => navigate("/dashboard")}
            className="group relative rounded-3xl bg-white border border-slate-200 p-8 text-left transition-all hover:border-accent hover:shadow-lg hover:shadow-accent/10"
          >
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-accent to-indigo-400 flex items-center justify-center mb-6">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-primary mb-2">Piattaforma</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              Per analisti, originator e portfolio manager. Accesso completo a deal, pipeline e operazioni.
            </p>
            <div className="flex items-center gap-2 text-sm font-semibold text-accent">
              Accedi alla piattaforma
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Investor access */}
          <button
            onClick={() => navigate("/investor?standalone")}
            className="group relative rounded-3xl bg-white border border-slate-200 p-8 text-left transition-all hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10"
          >
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mb-6">
              <Landmark className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-primary mb-2">Investor</h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              Per limited partner e capital provider. Vista portafoglio, rendimenti e reportistica.
            </p>
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
              Accedi come investor
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        <div className="text-center mt-10">
          <Link to="/" className="text-sm text-slate-400 hover:text-primary transition-colors inline-flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5" />
            Torna alla homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
