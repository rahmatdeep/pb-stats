import { useState } from "react";
import { Package, ChevronRight } from "lucide-react";
import type { ReliefSite, Supply } from "../types/reliefData";
import SupplyItemModal from "./SupplyItemModal";
import { getUrgencyLevel } from "../utils/urgencyUtils";

interface ReliefSiteCardProps {
  site: ReliefSite;
}

const ReliefSiteCard = ({ site }: ReliefSiteCardProps) => {
  const [selectedSupply, setSelectedSupply] = useState<Supply | null>(null);

  return (
    <div className="p-6">
      {/* Supplies */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Package className="w-5 h-5 text-orange-600" />
          <h6 className="font-semibold text-slate-800">Available Supplies</h6>
        </div>

        <div className="space-y-3">
          {site.supplies.map((supply) => {
            const urgency = getUrgencyLevel(supply);

            return (
              <div
                key={supply.id}
                onClick={() => setSelectedSupply(supply)}
                className={`group p-4 ${urgency.bgColor} rounded-xl border hover:shadow-md transition-all cursor-pointer`}
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

                  <div className="text-right ml-4 font-semibold text-sm text-slate-800">
                    {supply.currentQuantity} {supply.unit}
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors ml-2" />
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
