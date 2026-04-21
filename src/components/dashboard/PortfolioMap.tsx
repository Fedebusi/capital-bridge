import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import { formatMillions, stageLabels } from "@/data/sampleDeals";
import { useDeals } from "@/hooks/useDeals";
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

export default function PortfolioMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const navigate = useNavigate();
  const { deals } = useDeals();

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [39.5, -2.0],
      zoom: 6,
      scrollWheelZoom: false,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png").addTo(map);

    const dealsWithCoords = deals.filter(d => d.coordinates && d.coordinates.length === 2);

    dealsWithCoords.forEach(deal => {
      const color = stageMarkerColors[deal.stage] || "#19212E";

      const icon = L.divIcon({
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

      const marker = L.marker(deal.coordinates, { icon }).addTo(map);

      const popupContent = document.createElement("div");
      popupContent.style.fontFamily = "Inter, sans-serif";
      popupContent.style.minWidth = "200px";
      popupContent.innerHTML = `
        <div style="margin-bottom: 4px;">
          <span style="
            display: inline-block;
            padding: 2px 6px;
            background: ${color}22;
            color: ${color};
            border-radius: 4px;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          ">${stageLabels[deal.stage]}</span>
        </div>
        <p style="font-weight: 700; font-size: 14px; color: #19212E; margin: 4px 0 2px;">${deal.projectName}</p>
        <p style="font-size: 11px; color: #64748b;">${deal.location}</p>
        <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px;">
          <div>
            <span style="color: #94a3b8;">Facility</span>
            <p style="font-weight: 700; color: #19212E; margin: 2px 0 0;">${formatMillions(deal.loanAmount)}</p>
          </div>
          <div>
            <span style="color: #94a3b8;">LTV</span>
            <p style="font-weight: 700; color: #19212E; margin: 2px 0 0;">${deal.ltv.toFixed(1)}%</p>
          </div>
        </div>
        <button id="view-deal-${deal.id}" style="
          display: block;
          width: 100%;
          margin-top: 8px;
          padding: 6px;
          background: #19212E;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
        ">View Deal</button>
      `;

      marker.bindPopup(popupContent);

      marker.on("popupopen", () => {
        const btn = document.getElementById(`view-deal-${deal.id}`);
        if (btn) {
          btn.addEventListener("click", () => navigate(`/deals/${deal.id}`));
        }
      });
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [navigate, deals]);

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
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div ref={mapRef} className="h-[380px]" />
    </div>
  );
}
