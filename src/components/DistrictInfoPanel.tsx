import { useState } from "react";
import { MapPin, Package, ChevronDown, ChevronUp, X } from "lucide-react";
import { type Geometry } from "./PunjabMap";
import { mockReliefData } from "../assets/mockData";
import type { DistrictReliefData } from "../types/reliefData";
import ReliefSiteCard from "./ReliefSiteCard";

interface DistrictInfoPanelProps {
  selectedDistrict: Geometry | null;
  onClearSelection: () => void;
}

const DistrictInfoPanel = ({
  selectedDistrict,
  onClearSelection,
}: DistrictInfoPanelProps) => {
  const [expandedSites, setExpandedSites] = useState<Set<string>>(new Set());

  const toggleSite = (siteId: string) => {
    const newExpanded = new Set(expandedSites);
    if (newExpanded.has(siteId)) {
      newExpanded.delete(siteId);
    } else {
      newExpanded.add(siteId);
    }
    setExpandedSites(newExpanded);
  };

  const getReliefData = (districtCode: string): DistrictReliefData | null => {
    return (
      mockReliefData.find((data) => data.districtCode === districtCode) || null
    );
  };

  if (!selectedDistrict) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden sticky top-4">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            District Information
          </h3>
        </div>
        <div className="p-8">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
              <MapPin className="w-10 h-10 text-slate-400" />
            </div>
            <h4 className="text-xl font-semibold text-slate-800 mb-3">
              No District Selected
            </h4>
            <small className="text-slate-600 leading-relaxed">
              Tap any district on the map to view detailed relief information
              and supplies.
            </small>
          </div>
        </div>
      </div>
    );
  }

  const reliefData = getReliefData(selectedDistrict.properties.dt_code);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden sticky top-4 max-h-[85vh] flex flex-col">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-5 flex items-center justify-between">
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
        <div className="p-6">
          {/* District Header */}
          <h4 className="text-xl font-bold text-slate-800 mb-3">
            {selectedDistrict.properties.district}
          </h4>

          {reliefData ? (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-4 h-4 text-indigo-600" />
                <h5 className="text-lg font-semibold text-slate-800">
                  Relief Sites ({reliefData.sites.length})
                </h5>
              </div>

              {/* Relief Sites Accordion */}
              <div className="space-y-3">
                {reliefData.sites.map((site) => (
                  <div
                    key={site.id}
                    className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50"
                  >
                    <button
                      onClick={() => toggleSite(site.id)}
                      className="w-full px-5 py-4 text-left hover:bg-slate-100 transition-colors flex justify-between items-center"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800">
                          {site.name}
                        </div>
                        <div className="flex items-start gap-1 text-xs text-slate-600 mb-2">
                          <MapPin className="w-3 h-3 mt-0.5 text-indigo-600 flex-shrink-0" />
                          <span className="leading-relaxed">
                            {site.address}
                          </span>
                        </div>
                        <div className="text-sm text-slate-700 flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          {site.supplies.length} supplies available
                        </div>
                      </div>
                      <div className="ml-3">
                        {expandedSites.has(site.id) ? (
                          <ChevronUp className="w-5 h-5 text-slate-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-500" />
                        )}
                      </div>
                    </button>

                    {expandedSites.has(site.id) && (
                      <div className="border-t border-slate-200 bg-white">
                        <ReliefSiteCard site={site} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-100 to-orange-200 rounded-full flex items-center justify-center">
                <Package className="w-10 h-10 text-amber-600" />
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
