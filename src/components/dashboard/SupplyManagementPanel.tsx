import { useState, useEffect } from "react";
import {
  Package,
  Save,
  AlertTriangle,
  TrendingUp,
  Calendar,
} from "lucide-react";
import type { ReliefSite, Supply } from "../../types";
import {
  calculateWeeklyStatus,
  getStatusStyles,
  calculateOptimalQuantity,
} from "../../utils/weeklySupplyUtils";

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
            <h2 className="text-xl font-bold text-white">
              Weekly Supply Management
            </h2>
            <div className="text-orange-100 text-sm bg-orange-500 bg-opacity-30 px-2 py-1 rounded-full">
              Target: 1 week supply
            </div>
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
      <div className="p-6 space-y-6">
        {editingSupplies.map((supply) => {
          const weeklyStatus = calculateWeeklyStatus(supply);
          const styles = getStatusStyles(weeklyStatus.status);
          const optimalQuantity = calculateOptimalQuantity(supply);
          const weeklyNeed = supply.avgConsumptionPerDay * 7; // Calculate weekly need

          return (
            <div
              key={supply.id}
              className={`p-5 rounded-xl border-2 ${styles.bgColor} transition-all`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{supply.icon}</span>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">
                      {supply.name}
                    </h3>
                    <p className="text-sm text-slate-600">{supply.unit}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Status Badge */}
                  <div
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${styles.badgeColor}`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    {weeklyStatus.status.toUpperCase()}
                  </div>

                  {/* Days of Supply */}
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${styles.textColor}`}>
                      {weeklyStatus.daysOfSupply}d
                    </div>
                    <div className="text-xs text-slate-500">supply left</div>
                  </div>
                </div>
              </div>

              {/* Current vs Target Overview */}
              <div className="mb-4 p-3 bg-white bg-opacity-70 rounded-lg">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-slate-800">
                      {weeklyStatus.totalAvailable}
                    </div>
                    <div className="text-xs text-slate-600">
                      Total Available
                    </div>
                    <div className="text-xs text-slate-500">
                      (Current + Expected)
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-orange-600">
                      {weeklyNeed}
                    </div>
                    <div className="text-xs text-slate-600">Weekly Need</div>
                    <div className="text-xs text-slate-500">
                      ({supply.avgConsumptionPerDay}/day × 7)
                    </div>
                  </div>
                  <div>
                    <div
                      className={`text-lg font-bold ${
                        weeklyStatus.surplus >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {weeklyStatus.surplus >= 0 ? "+" : ""}
                      {weeklyStatus.surplus}
                    </div>
                    <div className="text-xs text-slate-600">
                      {weeklyStatus.surplus >= 0 ? "Surplus" : "Deficit"}
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-blue-600">
                      {optimalQuantity}
                    </div>
                    <div className="text-xs text-slate-600">
                      Need to Request
                    </div>
                    <div className="text-xs text-slate-500">for 1 week</div>
                  </div>
                </div>
              </div>

              {/* Input Controls */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Current Stock Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Current Stock
                    <span className="text-xs text-slate-500 ml-1">
                      (What you have right now)
                    </span>
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
                    className="w-full px-4 py-3 text-lg font-medium border-2 border-amber-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                  />
                </div>

                {/* Expected Deliveries Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Expected Deliveries
                    <span className="text-xs text-slate-500 ml-1">
                      (Confirmed incoming)
                    </span>
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
                    className="w-full px-4 py-3 text-lg font-medium border-2 border-amber-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                  />
                </div>
              </div>

              {/* Action Recommendations */}
              {weeklyStatus.status === "critical" ||
              weeklyStatus.status === "low" ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-red-800 font-medium mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    Urgent Action Required
                  </div>
                  <p className="text-red-700 text-sm">
                    You need{" "}
                    <strong>
                      {optimalQuantity} {supply.unit}
                    </strong>{" "}
                    to reach 1 week supply. Contact donors immediately or
                    consider emergency procurement.
                  </p>
                </div>
              ) : weeklyStatus.status === "surplus" ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-blue-800 font-medium mb-1">
                    <TrendingUp className="w-4 h-4" />
                    Surplus Available
                  </div>
                  <p className="text-blue-700 text-sm">
                    You have{" "}
                    <strong>
                      {Math.abs(weeklyStatus.surplus)} {supply.unit}
                    </strong>{" "}
                    more than needed. Consider redirecting new donations to
                    other supplies or locations.
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-800 font-medium mb-1">
                    <Calendar className="w-4 h-4" />
                    Well Stocked
                  </div>
                  <p className="text-green-700 text-sm">
                    Good supply level. Monitor daily consumption and update when
                    deliveries arrive.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SupplyManagementPanel;
