import { useState } from "react";
import {
  MapPin,
  Package,
  ChevronDown,
  ChevronUp,
  X,
  Phone,
  User,
} from "lucide-react";
import { type Geometry } from "./PunjabMap";
import { mockReliefData } from "../assets/mockData";
import type { DistrictReliefData } from "../types";
import ReliefSiteCard from "./ReliefSiteCard";

interface DistrictInfoPanelProps {
  selectedDistrict: Geometry | null;
  onClearSelection: () => void;
}

const DistrictInfoPanel = ({
  selectedDistrict,
  onClearSelection,
}: DistrictInfoPanelProps) => {
  const [expandedSite, setExpandedSite] = useState<string | null>(null);

  const toggleSite = (siteId: string) => {
    setExpandedSite(expandedSite === siteId ? null : siteId);
  };

  const getReliefData = (districtCode: string): DistrictReliefData | null => {
    return (
      mockReliefData.find((data) => data.districtCode === districtCode) || null
    );
  };

  if (!selectedDistrict) {
    const totalDistricts = mockReliefData.length;
    const totalSites = mockReliefData.reduce(
      (sum, district) => sum + district.sites.length,
      0
    );

    return (
      <div className="bg-amber-50 rounded-2xl shadow-xl border border-orange-200 overflow-hidden">
        <div className="p-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-amber-200 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-orange-400" />
            </div>
            <h4 className="text-xl font-semibold text-slate-800 mb-3">
              Select a District
            </h4>
            <p className="text-slate-600 mb-2 text-sm leading-relaxed">
              Relief operations are active in{" "}
              <strong className="text-orange-600">
                {totalDistricts} districts
              </strong>{" "}
              with{" "}
              <strong className="text-orange-600">
                {totalSites} relief centers
              </strong>
            </p>
            <p className="text-xs text-slate-500">
              Click any highlighted district on the map to view detailed
              information
            </p>
          </div>
        </div>
      </div>
    );
  }

  const reliefData = getReliefData(selectedDistrict.properties.dt_code);

  return (
    <div className="bg-amber-50 rounded-2xl shadow-xl border border-orange-200 overflow-hidden sticky top-4 max-h-[85vh] flex flex-col">
      <div className="bg-gradient-to-r  from-orange-600 to-red-600 px-6 py-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          District Relief Info
        </h3>
        <button
          onClick={onClearSelection}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-4">
          {/* District Header */}
          <h4 className="text-xl font-bold text-slate-800 mb-3">
            {selectedDistrict.properties.district}
          </h4>

          {reliefData ? (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-4 h-4 text-orange-600" />
                <h5 className="text-lg font-semibold text-slate-800">
                  Relief Sites ({reliefData.sites.length})
                </h5>
              </div>

              {/* Relief Sites Accordion */}
              <div className="space-y-3">
                {reliefData.sites.map((site) => (
                  <div
                    key={site.id}
                    className="border border-orange-200 rounded-xl overflow-hidden bg-orange-50"
                  >
                    <button
                      onClick={() => toggleSite(site.id)}
                      className="w-full px-5 py-4 text-left hover:bg-orange-100 transition-colors flex justify-between items-center"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800">
                          {site.name}
                        </div>
                        <div className="flex items-start gap-1 text-xs text-slate-600">
                          <MapPin className="w-3 h-3 mt-0.5 text-orange-600 flex-shrink-0" />
                          <span className="leading-relaxed">
                            {site.address}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-600 mb-2">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 text-orange-600" />
                            <span>{site.representative.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-orange-600" />
                            <span className="font-mono">
                              {site.representative.phone}
                            </span>
                          </div>
                        </div>

                        <div className="text-sm text-slate-700 flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          {site.supplies.length} supplies available
                        </div>
                      </div>
                      <div className="ml-3">
                        {expandedSite === site.id ? (
                          <ChevronUp className="w-5 h-5 text-slate-500 transition-transform duration-300" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-500 transition-transform duration-300" />
                        )}
                      </div>
                    </button>

                    <div
                      className={`border-t border-orange-200 bg-amber-50 transition-all duration-300 ease-in-out ${
                        expandedSite === site.id
                          ? "max-h-screen opacity-100"
                          : "max-h-0 opacity-0 overflow-hidden"
                      }`}
                    >
                      <div className="transition-transform duration-300 ease-in-out">
                        <ReliefSiteCard
                          site={site}
                          districtName={selectedDistrict.properties.district}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-2">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-yellow-100 to-orange-200 rounded-full flex items-center justify-center">
                <Package className="w-10 h-10 text-orange-600" />
              </div>
              <h4 className="text-xl font-semibold text-slate-800 mb-3">
                No Relief Data Available
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Relief sites for this district are currently being organized and
                will be available soon.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DistrictInfoPanel;
