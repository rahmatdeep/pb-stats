import type { DistrictReliefData } from "../types/reliefData";

// Mock data
export const mockReliefData: DistrictReliefData[] = [
  {
    districtCode: "049",
    districtName: "Amritsar",
    sites: [
      {
        id: "site_1",
        name: "Golden Temple Relief Center",
        address: "Golden Temple Complex, Amritsar",
        representative: {
          name: "Harpreet Singh",
          phone: "9876543210",
        },
        supplies: [
          {
            id: "water_1",
            name: "Water Bottles",
            icon: "💧",
            currentQuantity: 120,
            bookedQuantity: 0,
            avgConsumptionPerDay: 150,
            unit: "bottles",
          }, // Critical: 0 days remaining
          {
            id: "food_1",
            name: "Food Packets",
            icon: "🍽️",
            currentQuantity: 80,
            bookedQuantity: 20,
            avgConsumptionPerDay: 60,
            unit: "packets",
          }, // Medium: 1.6 days remaining
          {
            id: "medical_1",
            name: "First Aid Kits",
            icon: "🩹",
            currentQuantity: 50,
            bookedQuantity: 20,
            avgConsumptionPerDay: 8,
            unit: "kits",
          }, // Low: 8.7 days remaining
        ],
      },
      {
        id: "site_2",
        name: "Community Center Relief Point",
        address: "Mall Road, Amritsar",
        representative: {
          name: "Priya Sharma",
          phone: "9887654321",
        },
        supplies: [
          {
            id: "water_2",
            name: "Water Bottles",
            icon: "💧",
            currentQuantity: 50,
            bookedQuantity: 30,
            avgConsumptionPerDay: 90,
            unit: "bottles",
          }, // Critical: 0 days remaining
          {
            id: "hygiene_1",
            name: "Sanitary Pads",
            icon: "🧴",
            currentQuantity: 15,
            bookedQuantity: 10,
            avgConsumptionPerDay: 12,
            unit: "packs",
          }, // Medium: 2 days remaining
        ],
      },
    ],
  },
  {
    districtCode: "041",
    districtName: "Ludhiana",
    sites: [
      {
        id: "site_3",
        name: "Industrial Area Relief Center",
        address: "Industrial Area A, Ludhiana",
        representative: {
          name: "Priya Sharma",
          phone: "9887654321",
        },
        supplies: [
          {
            id: "blanket_1",
            name: "Blankets",
            icon: "🛏️",
            currentQuantity: 25,
            bookedQuantity: 15,
            avgConsumptionPerDay: 35,
            unit: "pieces",
          }, // Medium: 1.1 days remaining
          {
            id: "medicine_1",
            name: "Basic Medicines",
            icon: "💊",
            currentQuantity: 0,
            bookedQuantity: 10,
            avgConsumptionPerDay: 15,
            unit: "boxes",
          }, // Critical: 0 days remaining
        ],
      },
    ],
  },
  {
    districtCode: "037",
    districtName: "Jalandhar",
    sites: [
      {
        id: "site_4",
        name: "Central Relief Hub",
        address: "GT Road, Jalandhar",
        representative: {
          name: "Harpreet Singh",
          phone: "9876543210",
        },
        supplies: [
          {
            id: "water_3",
            name: "Water Bottles",
            icon: "💧",
            currentQuantity: 30,
            bookedQuantity: 20,
            avgConsumptionPerDay: 45,
            unit: "bottles",
          }, // Medium: 1.1 days remaining
          {
            id: "clothing_1",
            name: "Clothing Sets",
            icon: "👕",
            currentQuantity: 80,
            bookedQuantity: 20,
            avgConsumptionPerDay: 15,
            unit: "sets",
          }, // Low: 6.6 days remaining
          {
            id: "hygiene_2",
            name: "Soap Bars",
            icon: "🧼",
            currentQuantity: 10,
            bookedQuantity: 0,
            avgConsumptionPerDay: 25,
            unit: "bars",
          }, // Critical: 0 days remaining
        ],
      },
    ],
  },
];
