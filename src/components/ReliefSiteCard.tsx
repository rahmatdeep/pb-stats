import { useState } from "react";
import type { ReliefSite, Supply } from "../types/reliefData";
import SupplyItemModal from "./SupplyItemModal";

interface ReliefSiteCardProps {
  site: ReliefSite;
}

const ReliefSiteCard = ({ site }: ReliefSiteCardProps) => {
  const [selectedSupply, setSelectedSupply] = useState<Supply | null>(null);

  const getStatusColor = (supply: Supply) => {
    const daysRemaining = Math.floor((supply.currentQuantity + supply.bookedQuantity) / supply.avgConsumptionPerDay);
    if (daysRemaining <= 2) return "text-red-600 bg-red-50";
    if (daysRemaining <= 7) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  const getDaysRemaining = (supply: Supply) => {
    return Math.floor((supply.currentQuantity + supply.bookedQuantity) / supply.avgConsumptionPerDay);
  };

  return (
    <div className="p-4 bg-white">
      {/* Site Info */}
      <div className="mb-4 pb-3 border-b border-gray-100">
        <div className="text-sm text-gray-600 space-y-1">
          <div>📍 {site.address}</div>
        </div>
      </div>

      {/* Supplies */}
      <div className="space-y-2">
        <h6 className="font-medium text-gray-800 text-sm mb-3">
          Available Supplies:
        </h6>

        {site.supplies.map((supply) => {
          const daysRemaining = getDaysRemaining(supply);
          return (
            <div
              key={supply.id}
              onClick={() => setSelectedSupply(supply)}
              className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer transition-colors border border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{supply.icon}</span>
                  <div>
                    <div className="font-medium text-gray-800 text-sm">
                      {supply.name}
                    </div>
                    <div className="text-xs text-gray-600">
                      Click for details
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-800">
                    {supply.currentQuantity} {supply.unit}
                  </div>
                  {supply.bookedQuantity > 0 && (
                    <div className="text-xs text-blue-600">
                      +{supply.bookedQuantity} incoming
                    </div>
                  )}
                  <div className={`text-xs px-2 py-1 rounded-full mt-1 ${getStatusColor(supply)}`}>
                    {daysRemaining} days left
                  </div>
                </div>
              </div>
            </div>
          );
        })}
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
