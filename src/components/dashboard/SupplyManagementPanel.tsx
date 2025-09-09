import { useState, useEffect } from "react";
import { Package, Save, AlertTriangle } from "lucide-react";
import type { ReliefSite, Supply } from "../../types";
import { getUrgencyLevel } from "../../utils/urgencyUtils";

interface SupplyManagementPanelProps {
  site: ReliefSite | null;
  onSupplyUpdate: (supplies: Supply[]) => void;
}

const SupplyManagementPanel = ({
  site,
  onSupplyUpdate,
}: SupplyManagementPanelProps) => {
  const [editingSupplies, setEditingSupplies] = useState<Supply[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize editing state when site changes
  useEffect(() => {
    if (site?.supplies) {
      setEditingSupplies([...site.supplies]);
    }
  }, [site]);

  const handleQuantityChange = (supplyId: string, newQuantity: number) => {
    const updated = editingSupplies.map((supply) =>
      supply.id === supplyId
        ? { ...supply, currentQuantity: Math.max(0, newQuantity) }
        : supply
    );
    setEditingSupplies(updated);
    setHasChanges(true);
  };

  const handleBookedQuantityChange = (supplyId: string, newBooked: number) => {
    const updated = editingSupplies.map((supply) =>
      supply.id === supplyId
        ? { ...supply, bookedQuantity: Math.max(0, newBooked) }
        : supply
    );
    setEditingSupplies(updated);
    setHasChanges(true);
  };

  const handleSaveChanges = () => {
    onSupplyUpdate(editingSupplies);
    setHasChanges(false);
    // Show success message or toast
    alert("Supply levels updated successfully!");
  };

  if (!site) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <p className="text-slate-600">Loading site data...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg">
      {/* Panel Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Supply Management</h2>
          </div>
          {hasChanges && (
            <button
              onClick={handleSaveChanges}
              className="bg-white text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors font-medium flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          )}
        </div>
      </div>

      {/* Supply Items */}
      <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
        {editingSupplies.map((supply) => {
          const urgency = getUrgencyLevel(supply);
          const daysLeft = Math.floor(
            (supply.currentQuantity + supply.bookedQuantity) /
              supply.avgConsumptionPerDay
          );

          return (
            <div
              key={supply.id}
              className={`p-4 rounded-xl border-2 ${urgency.bgColor}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{supply.icon}</span>
                  <div>
                    <h3 className="font-semibold text-slate-800">
                      {supply.name}
                    </h3>
                    <p className="text-sm text-slate-600">{supply.unit}</p>
                  </div>
                </div>

                {urgency.level !== "Low" && (
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${urgency.color}`}
                  >
                    <AlertTriangle className="w-3 h-3" />
                    {urgency.level}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                {/* Current Quantity Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Current Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={supply.currentQuantity}
                    onChange={(e) =>
                      handleQuantityChange(
                        supply.id,
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                  />
                </div>

                {/* Incoming/Booked Quantity Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Incoming Stock
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={supply.bookedQuantity}
                    onChange={(e) =>
                      handleBookedQuantityChange(
                        supply.id,
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                  />
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-amber-50 rounded p-2">
                  <div className="font-semibold text-orange-600">
                    {supply.currentQuantity + supply.bookedQuantity}
                  </div>
                  <div className="text-slate-500">Total</div>
                </div>
                <div className="bg-amber-50 rounded p-2">
                  <div className="font-semibold text-slate-800">
                    {supply.avgConsumptionPerDay}/day
                  </div>
                  <div className="text-slate-500">Usage</div>
                </div>
                <div className="bg-amber-50 rounded p-2">
                  <div
                    className={`font-semibold ${
                      daysLeft <= 3
                        ? "text-red-600"
                        : daysLeft <= 7
                        ? "text-orange-600"
                        : "text-green-600"
                    }`}
                  >
                    {daysLeft}d
                  </div>
                  <div className="text-slate-500">Left</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SupplyManagementPanel;
