import type { Supply, WeeklySupplyStatus } from "../types";

export const calculateWeeklyStatus = (supply: Supply): WeeklySupplyStatus => {
  // Use ONLY current stock for days left calculation (critical for urgency detection)
  const currentStock = supply.currentQuantity;
  const weeklyNeed = supply.avgConsumptionPerDay * 7;

  // This is the key - days left should be based on current stock only
  const daysOfSupply = Math.floor(currentStock / supply.avgConsumptionPerDay);

  // Total available includes booked for other planning calculations
  const totalAvailable = supply.currentQuantity + supply.bookedQuantity;
  const surplus = totalAvailable - weeklyNeed;

  let status: WeeklySupplyStatus["status"];
  if (daysOfSupply < 2) status = "critical";
  else if (daysOfSupply < 4) status = "low";
  else if (daysOfSupply <= 10) status = "adequate";
  else status = "surplus";

  return {
    totalAvailable,
    weeklyNeed,
    surplus,
    daysOfSupply, // This will be 0.8 for your 120 bottles scenario
    status, // This will be "critical"
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
