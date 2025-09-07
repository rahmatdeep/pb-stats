import type { Supply } from "../types/reliefData";

export const getUrgencyLevel = (supply: Supply) => {
  const totalQuantity = supply.currentQuantity + supply.bookedQuantity;
  const daysRemaining = Math.floor(totalQuantity / supply.avgConsumptionPerDay);

  if (daysRemaining === 0) {
    return {
      level: "Critical",
      color: "text-red-700 bg-red-100 border-red-200",
      bgColor: "bg-red-100 border-red-200 hover:border-red-300",
    };
  }
  if (daysRemaining <= 2) {
    return {
      level: "Medium",
      color: "text-amber-700 bg-amber-100 border-amber-200",
      bgColor: "bg-amber-100 border-amber-200 hover:border-amber-300",
    };
  }
  return {
    level: "Low",
    color: "text-emerald-700 bg-emerald-100 border-emerald-200",
    bgColor: "bg-emerald-100 border-emerald-200 hover:border-emerald-300",
  };
};
