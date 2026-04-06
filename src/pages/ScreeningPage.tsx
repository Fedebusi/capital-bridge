import AppLayout from "@/components/layout/AppLayout";
import ScreeningTool from "@/components/screening/ScreeningTool";

export default function ScreeningPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Deal Screening</h1>
          <p className="text-sm text-muted-foreground mt-1">Quick assessment of new lending opportunities against fund investment criteria</p>
        </div>
        <ScreeningTool />
      </div>
    </AppLayout>
  );
}
