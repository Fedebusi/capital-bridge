import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const stats = [
  { value: "€2.4B", label: "assets under management", client: "FUND I" },
  { value: "142", label: "active credit facilities", client: "PORTFOLIO" },
  { value: "12.1%", label: "annualized fund IRR", client: "RETURNS" },
  { value: "0.02%", label: "impaired asset ratio", client: "RISK" },
  { value: "8.4%", label: "average interest rate", client: "YIELD" },
  { value: "4.2yr", label: "weighted average life", client: "DURATION" },
];

function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 900;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    let angle = 0;
    let animId: number;

    const draw = () => {
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;
      const r = size * 0.4;

      // Tilt
      const tilt = 0.4;

      for (let lat = -90; lat <= 90; lat += 6) {
        for (let lon = -180; lon <= 180; lon += 6) {
          const latR = (lat * Math.PI) / 180;
          const lonR = ((lon + angle) * Math.PI) / 180;

          const x3d = Math.cos(latR) * Math.sin(lonR);
          const y3d = Math.sin(latR);
          const z3d = Math.cos(latR) * Math.cos(lonR);

          // Apply tilt rotation around X axis
          const y3dTilted = y3d * Math.cos(tilt) - z3d * Math.sin(tilt);
          const z3dTilted = y3d * Math.sin(tilt) + z3d * Math.cos(tilt);

          if (z3dTilted < 0) continue;

          const px = cx + x3d * r;
          const py = cy - y3dTilted * r;
          const opacity = 0.08 + z3dTilted * 0.18;
          const dotSize = 1 + z3dTilted * 1.2;

          // Simple continent detection for visual interest
          const isLand = checkLand(lat, lon + angle);

          ctx.fillStyle = isLand
            ? `rgba(25, 33, 46, ${opacity * 4})`
            : `rgba(25, 33, 46, ${opacity * 1.5})`;

          ctx.fillRect(px - dotSize / 2, py - dotSize / 2, dotSize, dotSize);
        }
      }

      angle += 0.15;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-[900px] h-[900px]"
      style={{ width: 900, height: 900 }}
    />
  );
}

// Simplified continent shapes for visual effect
function checkLand(lat: number, lon: number): boolean {
  lon = ((lon % 360) + 360) % 360;
  if (lon > 180) lon -= 360;

  // Europe
  if (lat > 35 && lat < 70 && lon > -10 && lon < 40) return true;
  // Africa
  if (lat > -35 && lat < 35 && lon > -20 && lon < 50) return true;
  // Asia
  if (lat > 10 && lat < 70 && lon > 40 && lon < 140) return true;
  // North America
  if (lat > 15 && lat < 70 && lon > -130 && lon < -60) return true;
  // South America
  if (lat > -55 && lat < 15 && lon > -80 && lon < -35) return true;
  // Australia
  if (lat > -40 && lat < -10 && lon > 110 && lon < 155) return true;

  return false;
}

const rotatingWords = ["scale", "deploy", "grow"];

export default function LandingPage() {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex(prev => (prev + 1) % rotatingWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white text-primary font-body">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-[1400px] mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link to="/" className="text-xl font-extrabold tracking-tight font-headline">
              CapitalBridge <span className="text-[10px] font-medium text-slate-400 align-super">TM</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              {["Features", "How it works", "Investors", "Pricing"].map(item => (
                <a key={item} href="#" className="text-sm text-slate-500 hover:text-primary transition-colors font-medium">
                  {item}
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm text-slate-600 hover:text-primary transition-colors font-medium">
              Sign in
            </Link>
            <Link
              to="/login"
              className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-slate-800 transition-colors"
            >
              Start creating
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative min-h-screen flex items-center overflow-hidden">
        {/* Globe */}
        <div className="absolute right-[-150px] top-1/2 -translate-y-1/2 opacity-50 pointer-events-none select-none">
          <Globe />
        </div>

        <div className="max-w-[1400px] mx-auto px-8 pt-32 pb-20 relative z-10">
          {/* Subtitle */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-px bg-slate-300" />
            <span className="text-sm text-slate-400 tracking-wide font-medium">The platform for institutional lending</span>
          </div>

          {/* Headline */}
          <h1 className="text-[clamp(3rem,8vw,7rem)] font-extrabold leading-[0.95] tracking-tight max-w-[900px] font-headline">
            The platform
            <br />
            to{" "}
            <span className="inline-block relative overflow-hidden h-[1.1em] align-bottom">
              {rotatingWords.map((word, i) => (
                <span
                  key={word}
                  className="absolute left-0 top-0 transition-all duration-700 ease-in-out bg-gradient-to-r from-primary via-slate-600 to-slate-300 bg-clip-text text-transparent"
                  style={{
                    transform: i === wordIndex ? "translateY(0)" : i === (wordIndex - 1 + rotatingWords.length) % rotatingWords.length ? "translateY(-120%)" : "translateY(120%)",
                    opacity: i === wordIndex ? 1 : 0,
                  }}
                >
                  {word}
                </span>
              ))}
              {/* Invisible text for width */}
              <span className="invisible">{rotatingWords.reduce((a, b) => a.length > b.length ? a : b)}</span>
              <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-transparent rounded-full" />
            </span>
          </h1>

          {/* Description */}
          <p className="mt-8 text-lg text-slate-500 leading-relaxed max-w-[550px] font-body">
            Your toolkit to originate, manage, and monitor institutional
            debt. Securely deploy capital, track covenants, and scale
            your lending operations.
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-4 mt-10">
            <Link
              to="/login"
              className="bg-primary text-white px-7 py-4 rounded-full text-sm font-semibold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-primary/10"
            >
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login?role=investor"
              className="border border-slate-200 text-slate-700 px-7 py-4 rounded-full text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              Investor access
            </Link>
          </div>
        </div>
      </div>

      {/* Scrolling Stats Ticker */}
      <div className="border-t border-slate-100 bg-white overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap py-6">
          {[...stats, ...stats, ...stats].map((stat, i) => (
            <div key={i} className="flex items-baseline gap-3 mx-10 shrink-0">
              <span className="text-4xl font-extrabold text-primary tracking-tight font-headline">{stat.value}</span>
              <div>
                <span className="text-sm text-slate-400 font-medium">{stat.label}</span>
                <br />
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{stat.client}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
