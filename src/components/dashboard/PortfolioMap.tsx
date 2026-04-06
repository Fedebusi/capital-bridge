import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon, DivIcon } from "leaflet";
import { Link } from "react-router-dom";
import { sampleDeals, formatMillions, stageLabels, stageColors } from "@/data/sampleDeals";
import { cn } from "@/lib/utils";
import "leaflet/dist/leaflet.css";

const stageMarkerColors: Record<string, string> = {
  active: "#19212E",
  screening: "#64748b",
  due_diligence: "#3b82f6",
  ic_approval: "#8b5cf6",
  documentation: "#f59e0b",
  repaid: "#10b981",
  rejected: "#ef4444",
};

function createMarkerIcon(stage: string) {
  const color = stageMarkerColors[stage] || "#19212E";
  return new DivIcon({
    className: "",
    html: `<div style="
      width: 28px; height: 28px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

export default function PortfolioMap() {
  const dealsWithCoords = sampleDeals.filter(d => d.coordinates);

  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
      <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
        <h2 className="text-sm font-bold text-primary uppercase tracking-wider">Geographic Distribution</h2>
        <div className="flex items-center gap-4">
          {[
            { label: "Active", color: "#19212E" },
            { label: "Pipeline", color: "#3b82f6" },
            { label: "Repaid", color: "#10b981" },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="h-[380px]">
        <MapContainer
          center={[39.5, -2.0]}
          zoom={6}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          {dealsWithCoords.map(deal => (
            <Marker
              key={deal.id}
              position={deal.coordinates}
              icon={createMarkerIcon(deal.stage)}
            >
              <Popup>
                <div className="font-body min-w-[200px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide",
                      stageColors[deal.stage]
                    )}>
                      {stageLabels[deal.stage]}
                    </span>
                  </div>
                  <p className="font-bold text-sm text-slate-900 mt-1">{deal.projectName}</p>
                  <p className="text-[11px] text-slate-500">{deal.location}</p>
                  <div className="mt-2 pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400">Facility</span>
                      <p className="font-bold text-slate-900">{formatMillions(deal.loanAmount)}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">LTV</span>
                      <p className="font-bold text-slate-900">{deal.ltv.toFixed(1)}%</p>
                    </div>
                  </div>
                  <Link
                    to={`/deals/${deal.id}`}
                    className="block mt-2 text-center bg-slate-900 text-white rounded py-1 text-[10px] font-bold uppercase tracking-wide hover:bg-slate-800 transition-colors"
                  >
                    View Deal
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
