export interface Representative {
  name: string;
  phone: string;
  centerId: string;
}

export interface Supply {
  id: string;
  name: string;
  icon: string;
  currentQuantity: number;
  bookedQuantity: number;
  avgConsumptionPerDay: number;
  unit: string;
}

export interface ReliefSite {
  id: string;
  name: string;
  address: string;
  supplies: Supply[];
  representative: Representative;
}

export interface DistrictReliefData {
  districtCode: string;
  districtName: string;
  sites: ReliefSite[];
}

export type DeliveryStatus = "submitted" | "confirmed" | "delivered";

export interface PendingDelivery {
  referenceId: string;
  donorName: string;
  donorPhone: string;
  supplyId: string;
  supplyName: string;
  supplyUnit: string;
  quantity: number;
  expectedDate: string;
  expectedTime: string;
  status: DeliveryStatus;
  siteId: string;
  siteName: string;
  representative: Representative;
  createdAt: string;
}

// Form Data Type (for cleaner form handling)
export interface DeliveryFormData {
  donorName: string;
  donorPhone: string;
  quantity: string; // Keep as string until parsing
  expectedDate: string;
  expectedTime: string;
}

export type SupplyStatus = "critical" | "low" | "adequate" | "surplus";
export interface WeeklySupplyStatus {
  totalAvailable: number;
  weeklyNeed: number; // avgConsumptionPerDay * 7
  surplus: number;
  daysOfSupply: number;
  status: SupplyStatus;
}
