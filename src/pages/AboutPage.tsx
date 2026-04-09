import AppLayout from "@/components/layout/AppLayout";
import { Users, Trophy, Target, Heart, MapPin, Mail, Globe, Sparkles } from "lucide-react";

const team = [
  { name: "Federico Busi", role: "Founder & CEO", bio: "Ex investment banker con passione per il real estate lending e il Milan. Sogna di finanziare il nuovo stadio rossonero.", funFact: "Forza AC Milan! 🔴⚫" },
  { name: "Marco Rivera", role: "Head of Origination", bio: "15 anni di esperienza nel credito immobiliare. Ha originato oltre €500M di deals in Spagna e Italia.", funFact: "Tifoso del Milan anche lui, ovviamente." },
  { name: "Ana Delgado", role: "Senior Analyst", bio: "Specializzata in due diligence e valutazione del rischio. CFA Charterholder.", funFact: "L'unica che non tifa Milan nel team. Nessuno è perfetto." },
  { name: "Pablo Serrano", role: "Head of Risk", bio: "Ex KPMG, responsabile del monitoraggio covenants e costruzione. Parla 4 lingue.", funFact: "Ha convertito la moglie al tifo rossonero." },
];

const values = [
  { icon: Target, title: "Disciplina", description: "Criteri di investimento rigorosi. Non facciamo deals solo per fare volume. Come il Milan di Sacchi: sistema prima di tutto." },
  { icon: Trophy, title: "Track Record", description: "Zero default, 12%+ IRR medio. I numeri parlano, come le 7 Champions del Milan." },
  { icon: Heart, title: "Relazioni", description: "Trattiamo i borrower come partner, non come numeri. Rapporti a lungo termine." },
  { icon: Sparkles, title: "Innovazione", description: "Tecnologia al servizio del lending. CapitalBridge è la prova che si può innovare anche nella finanza tradizionale." },
];

export default function AboutPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <header>
          <h1 className="text-2xl font-extrabold text-primary">About Us</h1>
          <p className="text-slate-500 text-sm mt-1">Chi siamo, cosa facciamo, e perché il Milan vincerà la Champions</p>
        </header>

        {/* Mission */}
        <div className="bg-gradient-to-br from-primary via-slate-800 to-slate-700 rounded-xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full -translate-y-1/3 translate-x-1/4" />
          <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-red-500/5 rounded-full translate-y-1/2" />
          <div className="relative z-10 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">La nostra missione</p>
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
              Finanziare lo sviluppo immobiliare con disciplina istituzionale e passione rossonera.
            </h2>
            <p className="mt-4 text-white/60 leading-relaxed">
              CapitalBridge è un fondo di debito istituzionale specializzato nel finanziamento di sviluppo immobiliare
              in Spagna. Prestiamo a promotori selezionati per progetti residenziali, commerciali e di riqualificazione.
              Il nostro approccio combina analisi rigorosa, tecnologia avanzata, e una cultura di squadra ispirata
              ai valori del grande Milan di Berlusconi. Perché nel lending come nel calcio, servono visione,
              disciplina e il coraggio di puntare in alto.
            </p>
            <p className="mt-4 text-2xl">🔴⚫ Forza Milan, sempre! ⚫🔴</p>
          </div>
        </div>

        {/* Values */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {values.map(v => (
            <div key={v.title} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-all">
              <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center mb-3">
                <v.icon className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-sm font-extrabold text-primary">{v.title}</h3>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">{v.description}</p>
            </div>
          ))}
        </div>

        {/* Team */}
        <div>
          <h2 className="text-lg font-extrabold text-primary mb-4">Il Team</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {team.map(member => (
              <div key={member.name} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all group">
                {/* Avatar placeholder */}
                <div className="h-32 bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                  <span className="text-4xl font-extrabold text-white/20">{member.name.split(" ").map(n => n[0]).join("")}</span>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-extrabold text-primary">{member.name}</h3>
                  <p className="text-xs text-red-600 font-bold uppercase tracking-wide mt-0.5">{member.role}</p>
                  <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{member.bio}</p>
                  <p className="text-[11px] text-red-600 font-medium mt-2 italic">{member.funFact}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-extrabold text-primary mb-5">Numeri chiave</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            {[
              { value: "€2.4B", label: "AUM" },
              { value: "142", label: "Deals finanziati" },
              { value: "12.1%", label: "IRR medio" },
              { value: "0", label: "Default" },
              { value: "7", label: "Champions del Milan" },
            ].map(s => (
              <div key={s.label}>
                <p className="text-3xl font-extrabold text-primary">{s.value}</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-gradient-to-br from-red-50 to-red-100/30 rounded-xl border border-red-200/30 p-6">
          <h2 className="text-lg font-extrabold text-primary mb-4">Contatti</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center shadow-sm">
                <MapPin className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Sede</p>
                <p className="text-sm text-primary font-medium">Madrid, España</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center shadow-sm">
                <Mail className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Email</p>
                <p className="text-sm text-primary font-medium">info@capitalbridge.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center shadow-sm">
                <Globe className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Stadio preferito</p>
                <p className="text-sm text-primary font-medium">San Siro, Milano 🏟️</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
