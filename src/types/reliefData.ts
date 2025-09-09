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
  representative: {
    name: string;
    phone: string;
  };
}

export interface DistrictReliefData {
  districtCode: string;
  districtName: string;
  sites: ReliefSite[];
}
