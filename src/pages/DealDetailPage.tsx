import { useParams } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import DealDetail from "@/components/deals/DealDetail";
import { useDeals } from "@/hooks/useDeals";

export default function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { deals, loading } = useDeals();
  const deal = deals.find(d => d.id === id);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!deal) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <p className="text-slate-500">Deal not found</p>
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
