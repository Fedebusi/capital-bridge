import AppLayout from "@/components/layout/AppLayout";
import PortfolioMap from "@/components/dashboard/PortfolioMap";

export default function MapPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">Geographic Distribution</h1>
          <p className="text-slate-500 text-sm mt-1">Portfolio assets mapped by location</p>
        </div>
        <PortfolioMap />
      </div>
    </AppLayout>
  );
}
