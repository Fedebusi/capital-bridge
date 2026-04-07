import { createContext, useContext, useState, type ReactNode } from "react";
import { sampleDeals, type Deal } from "@/data/sampleDeals";

interface DealsContextType {
  deals: Deal[];
  addDeals: (newDeals: Deal[]) => void;
}

const DealsContext = createContext<DealsContextType | null>(null);

export function DealsProvider({ children }: { children: ReactNode }) {
  const [deals, setDeals] = useState<Deal[]>(sampleDeals);

  const addDeals = (newDeals: Deal[]) => {
    setDeals(prev => [...prev, ...newDeals]);
  };

  return (
    <DealsContext.Provider value={{ deals, addDeals }}>
      {children}
    </DealsContext.Provider>
  );
}

export function useDeals() {
  const ctx = useContext(DealsContext);
  if (!ctx) throw new Error("useDeals must be used within DealsProvider");
  return ctx;
}
