import AppLayout from "@/components/layout/AppLayout";
import { Trophy, Target, Handshake, Sparkles, MapPin, Mail, Globe } from "lucide-react";

const team = [
  {
    name: "Federico Busi",
    role: "Founder & CEO",
    bio: "Former investment banker with over a decade of real estate finance experience across Southern Europe.",
  },
  {
    name: "Marco Rivera",
    role: "Head of Origination",
    bio: "Fifteen years in real estate credit. Originated more than €500M of facilities across Spain and Italy.",
  },
  {
    name: "Ana Delgado",
    role: "Senior Analyst",
    bio: "Specialist in due diligence and risk assessment. CFA Charterholder, former M&A advisory.",
  },
  {
    name: "Pablo Serrano",
    role: "Head of Risk",
    bio: "Ex-KPMG. Leads covenant monitoring and construction oversight across the portfolio.",
  },
];

const values = [
  {
    icon: Target,
    title: "Discipline",
    description: "Rigorous investment criteria. We pass on deals that do not fit the mandate — volume is never the goal.",
  },
  {
    icon: Trophy,
    title: "Track record",
    description: "Zero defaults since inception and a 12%+ weighted average IRR across the book.",
  },
  {
    icon: Handshake,
    title: "Partnership",
    description: "We treat borrowers as long-term counterparties, not transactions. Repeat business reflects it.",
  },
  {
    icon: Sparkles,
    title: "Technology",
    description: "CapitalBridge is our in-house workflow, reporting, and monitoring platform, built for institutional scale.",
  },
];

const stats = [
  { value: "€2.4B", label: "Assets under management" },
  { value: "142", label: "Facilities originated" },
  { value: "12.1%", label: "Weighted average IRR" },
  { value: "0", label: "Defaults to date" },
  { value: "4.2yr", label: "Weighted average life" },
];

export default function AboutPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <header>
          <h1 className="text-4xl font-bold text-primary tracking-tight">About CapitalBridge</h1>
          <p className="text-slate-500 text-base mt-2">Institutional real estate debt, managed with discipline.</p>
        </header>

        {/* Mission */}
        <div className="bg-gradient-to-br from-primary via-slate-800 to-slate-700 rounded-xl p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/4" />
          <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />
          <div className="relative z-10 max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-3">Our mission</p>
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
              Financing Spanish residential development with institutional discipline.
            </h2>
            <p className="mt-5 text-white/70 leading-relaxed">
              CapitalBridge is an institutional debt fund focused on residential, commercial, and
              refurbishment projects across Spain. We lend to selected developers with strong track
              records, delivering senior, mezzanine, and bridge facilities structured around rigorous
              risk controls.
            </p>
            <p className="mt-4 text-white/70 leading-relaxed">
              Our approach combines disciplined underwriting, active portfolio monitoring, and a
              proprietary workflow platform. Every facility is actively managed from origination
              through close-out, with full transparency for our capital partners.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {values.map(v => (
            <div key={v.title} className="bg-slate-50 rounded-2xl shadow-sm p-6 hover:shadow-md transition-all">
              <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
                <v.icon className="h-5 w-5 text-accent" />
              </div>
              <h3 className="text-sm font-extrabold text-primary">{v.title}</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">{v.description}</p>
            </div>
          ))}
        </div>

        {/* Team */}
        <div>
          <h2 className="text-lg font-extrabold text-primary mb-4">The team</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {team.map(member => (
              <div key={member.name} className="bg-slate-50 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all">
                <div className="h-32 bg-gradient-to-br from-primary to-slate-700 flex items-center justify-center">
                  <span className="text-4xl font-extrabold text-white/20">
                    {member.name.split(" ").map(n => n[0]).join("")}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-extrabold text-primary">{member.name}</h3>
                  <p className="text-xs text-accent font-bold uppercase tracking-wide mt-0.5">{member.role}</p>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-slate-50 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-extrabold text-primary mb-5">By the numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            {stats.map(s => (
              <div key={s.label}>
                <p className="text-3xl font-extrabold text-primary">{s.value}</p>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
          <h2 className="text-lg font-extrabold text-primary mb-4">Contact</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center shadow-sm">
                <MapPin className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Office</p>
                <p className="text-sm text-primary font-medium">Madrid, Spain</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center shadow-sm">
                <Mail className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Email</p>
                <p className="text-sm text-primary font-medium">info@capitalbridge.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center shadow-sm">
                <Globe className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase">Website</p>
                <p className="text-sm text-primary font-medium">capitalbridge.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
