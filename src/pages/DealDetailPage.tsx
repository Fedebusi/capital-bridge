import { useParams } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import DealDetail from "@/components/deals/DealDetail";
import { sampleDeals } from "@/data/sampleDeals";

export default function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const deal = sampleDeals.find(d => d.id === id);

  if (!deal) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Deal not found</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <DealDetail deal={deal} />
    </AppLayout>
  );
}
