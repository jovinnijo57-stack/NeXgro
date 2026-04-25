import { createContext, useContext, useState, ReactNode } from "react";

const ComparisonContext = createContext<any>(null);

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [comparisonItems, setComparisonItems] = useState<string[]>([]);
  return (
    <ComparisonContext.Provider value={{
      comparisonItems,
      addToComparison: (id: string) => setComparisonItems(prev => [...prev, id]),
      removeFromComparison: (id: string) => setComparisonItems(prev => prev.filter(i => i !== id)),
      isInComparison: (id: string) => comparisonItems.includes(id)
    }}>
      {children}
    </ComparisonContext.Provider>
  );
}

export const useComparison = () => useContext(ComparisonContext);
