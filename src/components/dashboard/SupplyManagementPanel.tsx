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
      <div className="bg-white rounded-lg p-4 shadow-lg sm:rounded-2xl sm:p-6">
        <p className="text-slate-600 text-sm sm:text-base">
          Loading site data...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg sm:rounded-2xl">
      {/* Panel Header - Mobile First */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 px-3 py-3 rounded-t-lg sm:px-6 sm:py-4 sm:rounded-t-2xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <Package className="w-5 h-5 text-white sm:w-6 sm:h-6" />
              <h2 className="text-lg font-bold text-white sm:text-xl">
                <span className="sm:hidden">Supply Management</span>
                <span className="hidden sm:inline">
                  Weekly Supply Management
                </span>
              </h2>
            </div>
            <div className="text-orange-100 text-xs w-fit bg-orange-500 bg-opacity-30 px-2 py-1 rounded-full sm:text-sm">
              <span className="sm:hidden">1 week target</span>
              <span className="hidden sm:inline">Target: 1 week supply</span>
            </div>
          </div>
          {hasChanges && (
            <button
              onClick={handleSaveChanges}
              className="bg-white text-orange-600 px-3 py-2 rounded-lg hover:bg-orange-50 transition-colors font-medium flex items-center justify-center gap-2 text-sm sm:px-4"
            >
              <Save className="w-4 h-4" />
              <span className="sm:hidden">Save</span>
              <span className="hidden sm:inline">Save Changes</span>
            </button>
          )}
        </div>
      </div>

      {/* Supply Items - Mobile First */}
      <div className="p-3 space-y-4 sm:p-6 sm:space-y-6">
        {editingSupplies.map((supply) => {
          const weeklyStatus = calculateWeeklyStatus(supply);
          const styles = getStatusStyles(weeklyStatus.status);
          const optimalQuantity = calculateOptimalQuantity(supply);
          const weeklyNeed = supply.avgConsumptionPerDay * 7;

          return (
            <div
              key={supply.id}
              className={`p-3 rounded-lg border transition-all sm:p-5 sm:rounded-xl sm:border-2 ${styles.bgColor}`}
            >
              {/* Header - Mobile First */}
              <div className="flex flex-col gap-3 mb-3 sm:flex-row sm:items-center sm:justify-between sm:mb-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-2xl sm:text-3xl">{supply.icon}</span>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                      {supply.name}
                    </h3>
                    <p className="text-sm text-slate-600">{supply.unit}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:flex-col sm:items-end sm:gap-3">
                  {/* Status Badge */}
                  <div
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium sm:px-3 sm:text-sm ${styles.badgeColor}`}
                  >
                    <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{weeklyStatus.status.toUpperCase()}</span>
                  </div>

                  {/* Days of Supply */}
                  <div className="text-right">
                    <div
                      className={`text-xl font-bold sm:text-2xl ${styles.textColor}`}
                    >
                      {weeklyStatus.daysOfSupply}d
                    </div>
                    <div className="text-xs text-slate-500">
                      <span className="sm:hidden">left</span>
                      <span className="hidden sm:inline">supply left</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Current vs Target Overview - Mobile First */}
              <div className="mb-3 p-2 bg-white bg-opacity-70 rounded-lg sm:mb-4 sm:p-3">
                <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4 sm:gap-4">
                  <div>
                    <div className="text-base font-bold text-slate-800 sm:text-lg">
                      {weeklyStatus.totalAvailable}
                    </div>
                    <div className="text-xs text-slate-600">
                      <span className="sm:hidden">Total</span>
                      <span className="hidden sm:inline">Total Available</span>
                    </div>
                    <div className="text-xs text-slate-500 hidden sm:block">
                      (Current + Expected)
                    </div>
                  </div>
                  <div>
                    <div className="text-base font-bold text-orange-600 sm:text-lg">
                      {weeklyNeed}
                    </div>
                    <div className="text-xs text-slate-600">
                      <span className="sm:hidden">Need</span>
                      <span className="hidden sm:inline">Weekly Need</span>
                    </div>
                    <div className="text-xs text-slate-500 hidden sm:block">
                      ({supply.avgConsumptionPerDay}/day × 7)
                    </div>
                  </div>
                  <div>
                    <div
                      className={`text-base font-bold sm:text-lg ${
                        weeklyStatus.surplus >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {weeklyStatus.surplus >= 0 ? "+" : ""}
                      {weeklyStatus.surplus}
                    </div>
                    <div className="text-xs text-slate-600">
                      {weeklyStatus.surplus >= 0 ? (
                        <>
                          <span className="sm:hidden">Extra</span>
                          <span className="hidden sm:inline">Surplus</span>
                        </>
                      ) : (
                        <>
                          <span className="sm:hidden">Short</span>
                          <span className="hidden sm:inline">Deficit</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="text-base font-bold text-blue-600 sm:text-lg">
                      {optimalQuantity}
                    </div>
                    <div className="text-xs text-slate-600">
                      <span className="sm:hidden">Request</span>
                      <span className="hidden sm:inline">Need to Request</span>
                    </div>
                    <div className="text-xs text-slate-500 hidden sm:block">
                      for 1 week
                    </div>
                  </div>
                </div>
              </div>

              {/* Input Controls - Mobile First */}
              <div className="grid grid-cols-1 gap-3 mb-3 sm:grid-cols-2 sm:gap-4 sm:mb-4">
                {/* Current Stock Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <span className="sm:hidden">Current Stock</span>
                    <span className="hidden sm:inline">Current Stock</span>
                    <span className="text-xs text-slate-500 ml-1 hidden sm:inline">
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
                    className="w-full px-3 py-2 text-base font-medium border-2 border-amber-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white sm:px-4 sm:py-3 sm:text-lg"
                  />
                </div>

                {/* Expected Deliveries Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <span className="sm:hidden">Expected</span>
                    <span className="hidden sm:inline">
                      Expected Deliveries
                    </span>
                    <span className="text-xs text-slate-500 ml-1 hidden sm:inline">
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
                    className="w-full px-3 py-2 text-base font-medium border-2 border-amber-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white sm:px-4 sm:py-3 sm:text-lg"
                  />
                </div>
              </div>

              {/* Action Recommendations - Mobile First */}
              {weeklyStatus.status === "critical" ||
              weeklyStatus.status === "low" ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-red-800 font-medium mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="sm:hidden">Urgent Action</span>
                    <span className="hidden sm:inline">
                      Urgent Action Required
                    </span>
                  </div>
                  <p className="text-red-700 text-sm">
                    <span className="sm:hidden">
                      Need{" "}
                      <strong>
                        {optimalQuantity} {supply.unit}
                      </strong>{" "}
                      for 1 week supply. Contact donors now.
                    </span>
                    <span className="hidden sm:inline">
                      You need{" "}
                      <strong>
                        {optimalQuantity} {supply.unit}
                      </strong>{" "}
                      to reach 1 week supply. Contact donors immediately or
                      consider emergency procurement.
                    </span>
                  </p>
                </div>
              ) : weeklyStatus.status === "surplus" ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-blue-800 font-medium mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="sm:hidden">Surplus</span>
                    <span className="hidden sm:inline">Surplus Available</span>
                  </div>
                  <p className="text-blue-700 text-sm">
                    <span className="sm:hidden">
                      Have{" "}
                      <strong>
                        {Math.abs(weeklyStatus.surplus)} {supply.unit}
                      </strong>{" "}
                      extra. Consider redirecting.
                    </span>
                    <span className="hidden sm:inline">
                      You have{" "}
                      <strong>
                        {Math.abs(weeklyStatus.surplus)} {supply.unit}
                      </strong>{" "}
                      more than needed. Consider redirecting new donations to
                      other supplies or locations.
                    </span>
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-800 font-medium mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="sm:hidden">Good Supply</span>
                    <span className="hidden sm:inline">Well Stocked</span>
                  </div>
                  <p className="text-green-700 text-sm">
                    <span className="sm:hidden">
                      Good supply level. Monitor consumption and update
                      deliveries.
                    </span>
                    <span className="hidden sm:inline">
                      Good supply level. Monitor daily consumption and update
                      when deliveries arrive.
                    </span>
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
