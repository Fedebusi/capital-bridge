import AppLayout from "@/components/layout/AppLayout";
import PortfolioMap from "@/components/dashboard/PortfolioMap";

export default function MapPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-primary tracking-tight">Geographic Distribution</h1>
          <p className="text-slate-500 text-base mt-2">Portfolio assets mapped by location</p>
        </div>
        <PortfolioMap />
      </div>
    </AppLayout>
  );
}
