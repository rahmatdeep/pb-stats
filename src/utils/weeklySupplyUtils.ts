import type { Supply, WeeklySupplyStatus } from "../types";

export const calculateWeeklyStatus = (supply: Supply): WeeklySupplyStatus => {
  const totalAvailable = supply.currentQuantity + supply.bookedQuantity;
  const weeklyNeed = supply.avgConsumptionPerDay * 7; // Simple calculation!
  const surplus = totalAvailable - weeklyNeed;
  const daysOfSupply = Math.floor(totalAvailable / supply.avgConsumptionPerDay);

  let status: WeeklySupplyStatus["status"];
  if (daysOfSupply < 2) status = "critical";
  else if (daysOfSupply < 4) status = "low";
  else if (daysOfSupply <= 10) status = "adequate";
  else status = "surplus";

  return {
    totalAvailable,
    weeklyNeed,
    surplus,
    daysOfSupply,
    status,
  };
};

export const getStatusStyles = (status: WeeklySupplyStatus["status"]) => {
  const styles = {
    critical: {
      bgColor: "bg-red-50 border-red-300",
      textColor: "text-red-800",
      badgeColor: "bg-red-100 text-red-800",
    },
    low: {
      bgColor: "bg-orange-50 border-orange-300",
      textColor: "text-orange-800",
      badgeColor: "bg-orange-100 text-orange-800",
    },
    adequate: {
      bgColor: "bg-green-50 border-green-300",
      textColor: "text-green-800",
      badgeColor: "bg-green-100 text-green-800",
    },
    surplus: {
      bgColor: "bg-blue-50 border-blue-300",
      textColor: "text-blue-800",
      badgeColor: "bg-blue-100 text-blue-800",
    },
  };
  return styles[status];
};

export const shouldSuggestEarlierDelivery = (
  supply: Supply,
  _proposedQuantity: number,
  proposedDate: string
): boolean => {
  const currentStatus = calculateWeeklyStatus(supply);
  const proposedDeliveryDate = new Date(proposedDate);
  const today = new Date();
  const daysUntilDelivery = Math.ceil(
    (proposedDeliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Current supply will run out before proposed delivery date
  return currentStatus.daysOfSupply < daysUntilDelivery;
};

export const calculateOptimalQuantity = (supply: Supply): number => {
  const currentStatus = calculateWeeklyStatus(supply);
  const weeklyNeed = supply.avgConsumptionPerDay * 7;

  // Optimal = 1 week's supply minus what we already have/expect
  const optimal = Math.max(0, weeklyNeed - currentStatus.totalAvailable);

  return optimal;
};
