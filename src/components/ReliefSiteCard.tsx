import { useState } from "react";
import { Package, ChevronRight } from "lucide-react";
import type { ReliefSite, Supply } from "../types/reliefData";
import SupplyItemModal from "./SupplyItemModal";

interface ReliefSiteCardProps {
  site: ReliefSite;
}

const ReliefSiteCard = ({ site }: ReliefSiteCardProps) => {
  const [selectedSupply, setSelectedSupply] = useState<Supply | null>(null);

  const getStatusColor = (supply: Supply) => {
    const daysRemaining = Math.floor(
      (supply.currentQuantity + supply.bookedQuantity) /
        supply.avgConsumptionPerDay
    );
    if (daysRemaining <= 2) return "text-red-700 bg-red-100 border-red-200";
    if (daysRemaining <= 7)
      return "text-amber-700 bg-amber-100 border-amber-200";
    return "text-emerald-700 bg-emerald-100 border-emerald-200";
  };

  const getDaysRemaining = (supply: Supply) => {
    return Math.floor(
      (supply.currentQuantity + supply.bookedQuantity) /
        supply.avgConsumptionPerDay
    );
  };

  return (
    <div className="p-6">
      {/* Supplies */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Package className="w-5 h-5 text-indigo-600" />
          <h6 className="font-semibold text-slate-800">Available Supplies</h6>
        </div>

        <div className="space-y-3">
          {site.supplies.map((supply) => {
            const daysRemaining = getDaysRemaining(supply);
            return (
              <div
                key={supply.id}
                onClick={() => setSelectedSupply(supply)}
                className="group p-4 bg-gradient-to-r from-white to-slate-50 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-xl p-2 bg-white rounded-lg shadow-sm">
                      {supply.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-md text-slate-800 mb-1">
                        {supply.name}
                      </div>
                    </div>
                  </div>

                  <div className="text-right ml-4">
                    <div className="font-semibold text-sm text-slate-800 mb-1">
                      {supply.currentQuantity} {supply.unit}
                    </div>
                    {supply.bookedQuantity > 0 && (
                      <div className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full mb-2">
                        +{supply.bookedQuantity} incoming
                      </div>
                    )}
                    <div
                      className={`text-xs px-3 py-1 rounded-full border font-medium ${getStatusColor(
                        supply
                      )}`}
                    >
                      {daysRemaining} days left
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors ml-2" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Supply Modal */}
      {selectedSupply && (
        <SupplyItemModal
          supply={selectedSupply}
          siteName={site.name}
          onClose={() => setSelectedSupply(null)}
        />
      )}
    </div>
  );
};

export default ReliefSiteCard;
