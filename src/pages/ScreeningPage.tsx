import AppLayout from "@/components/layout/AppLayout";
import ScreeningTool from "@/components/screening/ScreeningTool";

export default function ScreeningPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">Deal Screening</h1>
          <p className="text-slate-500 text-sm mt-1">Quick assessment of new lending opportunities against fund investment criteria</p>
        </div>
        <ScreeningTool />
      </div>
    </AppLayout>
  );
}
