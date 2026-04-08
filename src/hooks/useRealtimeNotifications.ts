import { useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { toast } from "sonner";

/**
 * Subscribe to real-time changes on key tables and show toast notifications.
 * Call this once in the app root (e.g., inside AppLayout or Index page).
 */
export function useRealtimeNotifications() {
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const channel = supabase!
      .channel("app-notifications")
      // Covenant breach alerts
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "covenants", filter: "status=eq.breach" },
        (payload) => {
          const covenant = payload.new as { name: string; current_value: string };
          toast.error(`Covenant Breach: ${covenant.name}`, {
            description: `Current value: ${covenant.current_value}`,
            duration: 10000,
          });
        }
      )
      // New approval votes
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "ic_votes" },
        (payload) => {
          const vote = payload.new as { voter: string; decision: string };
          toast.info(`New IC Vote: ${vote.voter}`, {
            description: `Decision: ${vote.decision}`,
          });
        }
      )
      // Deal stage changes
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "deals" },
        (payload) => {
          const oldDeal = payload.old as { stage: string; project_name: string };
          const newDeal = payload.new as { stage: string; project_name: string };
          if (oldDeal.stage !== newDeal.stage) {
            toast.info(`Deal Stage Changed: ${newDeal.project_name}`, {
              description: `${oldDeal.stage} → ${newDeal.stage}`,
            });
          }
        }
      )
      // Drawdown status changes
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "drawdowns" },
        (payload) => {
          const oldDD = payload.old as { status: string };
          const newDD = payload.new as { status: string; milestone: string };
          if (oldDD.status !== newDD.status && newDD.status === "disbursed") {
            toast.success(`Drawdown Disbursed`, {
              description: newDD.milestone,
            });
          }
        }
      )
      // New waivers
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "waivers" },
        (payload) => {
          const waiver = payload.new as { covenant_name: string };
          toast.warning(`New Waiver Request`, {
            description: waiver.covenant_name,
          });
        }
      )
      .subscribe();

    return () => {
      supabase!.removeChannel(channel);
    };
  }, []);
}
