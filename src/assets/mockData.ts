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
        supplies: [
          {
            id: "water_1",
            name: "Water Bottles",
            icon: "💧",
            currentQuantity: 500,
            bookedQuantity: 200,
            avgConsumptionPerDay: 150,
            unit: "bottles",
          },
          {
            id: "food_1",
            name: "Food Packets",
            icon: "🍽️",
            currentQuantity: 300,
            bookedQuantity: 100,
            avgConsumptionPerDay: 80,
            unit: "packets",
          },
          {
            id: "medical_1",
            name: "First Aid Kits",
            icon: "🩹",
            currentQuantity: 50,
            bookedQuantity: 20,
            avgConsumptionPerDay: 10,
            unit: "kits",
          },
        ],
      },
      {
        id: "site_2",
        name: "Community Center Relief Point",
        address: "Mall Road, Amritsar",
        supplies: [
          {
            id: "water_2",
            name: "Water Bottles",
            icon: "💧",
            currentQuantity: 300,
            bookedQuantity: 150,
            avgConsumptionPerDay: 100,
            unit: "bottles",
          },
          {
            id: "hygiene_1",
            name: "Sanitary Pads",
            icon: "🧴",
            currentQuantity: 200,
            bookedQuantity: 50,
            avgConsumptionPerDay: 25,
            unit: "packs",
          },
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
        supplies: [
          {
            id: "blanket_1",
            name: "Blankets",
            icon: "🛏️",
            currentQuantity: 150,
            bookedQuantity: 75,
            avgConsumptionPerDay: 30,
            unit: "pieces",
          },
          {
            id: "medicine_1",
            name: "Basic Medicines",
            icon: "💊",
            currentQuantity: 100,
            bookedQuantity: 40,
            avgConsumptionPerDay: 20,
            unit: "boxes",
          },
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
        supplies: [
          {
            id: "water_3",
            name: "Water Bottles",
            icon: "💧",
            currentQuantity: 50,
            bookedQuantity: 100,
            avgConsumptionPerDay: 75,
            unit: "bottles",
          },
          {
            id: "clothing_1",
            name: "Clothing Sets",
            icon: "👕",
            currentQuantity: 80,
            bookedQuantity: 20,
            avgConsumptionPerDay: 15,
            unit: "sets",
          },
          {
            id: "hygiene_2",
            name: "Soap Bars",
            icon: "🧼",
            currentQuantity: 200,
            bookedQuantity: 0,
            avgConsumptionPerDay: 40,
            unit: "bars",
          },
        ],
      },
    ],
  },
];
