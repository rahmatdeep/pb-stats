import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import SupplyManagementPanel from "../components/dashboard/SupplyManagementPanel";
import PendingConfirmationsPanel from "../components/dashboard/PendingConfirmationsPanel";
import DeliveryCalendarPanel from "../components/dashboard/DeliveryCalendarPanel";
import type {
  ReliefSite,
  PendingDelivery,
  Supply,
  DeliveryStatus,
} from "../types";
import { mockReliefData } from "../assets/mockData";

const CenterDashboard = () => {
  const { centerId } = useParams<{ centerId: string }>();
  const [currentSite, setCurrentSite] = useState<ReliefSite | null>(null);
  const [pendingDeliveries, setPendingDeliveries] = useState<PendingDelivery[]>(
    [
      {
        referenceId: "DEL123456",
        donorName: "Rajesh Kumar",
        donorPhone: "9876543210",
        supplyId: "water_1",
        supplyName: "Water Bottles",
        supplyUnit: "bottles",
        quantity: 2000,
        expectedDate: "2025-09-12",
        expectedTime: "14:00",
        status: "submitted",
        siteId: "site_1",
        siteName: "Golden Temple Relief Center",
        representative: {
          name: "Harpreet Singh",
          phone: "9876543210",
          centerId: "CENTER001",
        },
        createdAt: new Date().toISOString(),
      },
      {
        referenceId: "DEL123457",
        donorName: "Priya Singh",
        donorPhone: "9887654321",
        supplyId: "water_1",
        supplyName: "Water Bottles",
        supplyUnit: "bottles",
        quantity: 500,
        expectedDate: "2025-09-13", // 4 days later
        expectedTime: "10:00",
        status: "submitted",
        siteId: "site_1",
        siteName: "Golden Temple Relief Center",
        representative: {
          name: "Harpreet Singh",
          phone: "9876543210",
          centerId: "CENTER001",
        },
        createdAt: new Date().toISOString(),
      },
      {
        referenceId: "DEL123458",
        donorName: "Amit Patel",
        donorPhone: "9765432109",
        supplyId: "food_1",
        supplyName: "Food Packets",
        supplyUnit: "packets",
        quantity: 25,
        expectedDate: "2025-09-11",
        expectedTime: "16:30",
        status: "submitted",
        siteId: "site_1",
        siteName: "Golden Temple Relief Center",
        representative: {
          name: "Harpreet Singh",
          phone: "9876543210",
          centerId: "CENTER001",
        },
        createdAt: new Date().toISOString(),
      },
    ]
  );

  useEffect(() => {
    if (centerId) {
      for (const district of mockReliefData) {
        const site = district.sites.find(
          (s) => s.representative.centerId === centerId
        );
        if (site) {
          setCurrentSite(site);
          break;
        }
      }
    }
  }, [centerId]);

  const handleSupplyUpdate = (updatedSupplies: Supply[]) => {
    console.log("Supplies updated:", updatedSupplies);
  };

  // STEP 1: Confirm/Reject delivery intent (updates incoming stock)
  const handleConfirmDeliveryIntent = (deliveryId: string) => {
    const delivery = pendingDeliveries.find(
      (d) => d.referenceId === deliveryId
    );
    if (delivery && currentSite) {
      // Update incoming stock for the specific supply
      const updatedSite = { ...currentSite };
      const supply = updatedSite.supplies.find(
        (s) => s.id === delivery.supplyId
      );
      if (supply) {
        supply.bookedQuantity += delivery.quantity;
      }
      setCurrentSite(updatedSite);

      // Update delivery status to confirmed
      setPendingDeliveries((prev) =>
        prev.map((d) =>
          d.referenceId === deliveryId
            ? { ...d, status: "confirmed" as DeliveryStatus }
            : d
        )
      );
    }
  };

  const handleRejectDeliveryIntent = (deliveryId: string) => {
    setPendingDeliveries((prev) =>
      prev.filter((d) => d.referenceId !== deliveryId)
    );
  };

  // STEP 2: Confirm actual delivery (moves incoming to current stock)
  const handleConfirmActualDelivery = (deliveryId: string) => {
    const delivery = pendingDeliveries.find(
      (d) => d.referenceId === deliveryId
    );
    if (delivery && currentSite) {
      // Move from booked to current stock
      const updatedSite = { ...currentSite };
      const supply = updatedSite.supplies.find(
        (s) => s.id === delivery.supplyId
      );
      if (supply) {
        supply.currentQuantity += delivery.quantity;
        supply.bookedQuantity = Math.max(
          0,
          supply.bookedQuantity - delivery.quantity
        );
      }
      setCurrentSite(updatedSite);

      // Mark delivery as completed
      setPendingDeliveries((prev) =>
        prev.map((d) =>
          d.referenceId === deliveryId
            ? { ...d, status: "delivered" as DeliveryStatus }
            : d
        )
      );
    }
  };

  const handleModifyDelivery = (
    deliveryId: string,
    newQuantity: number,
    newDate: string,
    newTime: string
  ) => {
    setPendingDeliveries((prev) =>
      prev.map((d) =>
        d.referenceId === deliveryId
          ? {
              ...d,
              quantity: newQuantity,
              expectedDate: newDate,
              expectedTime: newTime,
            }
          : d
      )
    );

    // Show success message
    alert(`Delivery ${deliveryId} has been modified successfully!`);
  };

  if (!currentSite) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Loading Dashboard...
          </h2>
          <p className="text-slate-600">Center ID: {centerId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-2">
            Center Representative Dashboard
          </h1>
          <p className="text-orange-100">
            Managing: {currentSite.name} • ID: {centerId}
          </p>
        </div>
      </header>

      {/* Updated Dashboard Grid */}
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Top Row - Confirmations and Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Confirmations - Top Left */}
          <div>
            <PendingConfirmationsPanel
              pendingDeliveries={pendingDeliveries.filter(
                (d) => d.status === "submitted"
              )}
              supplies={currentSite.supplies}
              onConfirmIntent={handleConfirmDeliveryIntent}
              onRejectIntent={handleRejectDeliveryIntent}
              onModifyDelivery={handleModifyDelivery}
            />
          </div>

          {/* Delivery Calendar - Top Right */}
          <div>
            <DeliveryCalendarPanel
              confirmedDeliveries={pendingDeliveries.filter(
                (d) => d.status === ("confirmed" as DeliveryStatus)
              )}
              supplies={currentSite.supplies}
              onConfirmActualDelivery={handleConfirmActualDelivery}
            />
          </div>
        </div>

        {/* Bottom Row - Supply Management (Full Width) */}
        <div>
          <SupplyManagementPanel
            site={currentSite}
            onSupplyUpdate={handleSupplyUpdate}
          />
        </div>
      </main>
    </div>
  );
};

export default CenterDashboard;
