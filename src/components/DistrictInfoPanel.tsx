import { useState } from "react";
import { type Geometry } from "./PunjabMap";
import { mockReliefData, type DistrictReliefData } from "../types/reliefData";
import ReliefSiteCard from "./ReliefSiteCard";

interface DistrictInfoPanelProps {
  selectedDistrict: Geometry | null;
  onClearSelection: () => void;
}

const DistrictInfoPanel = ({ selectedDistrict, onClearSelection }: DistrictInfoPanelProps) => {
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
    return mockReliefData.find(data => data.districtCode === districtCode) || null;
  };

  if (!selectedDistrict) {
    return (
      <div className="border border-gray-300 rounded-lg shadow-lg bg-white sticky top-4">
        <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <h3 className="text-lg font-semibold text-gray-800">
            District Information
          </h3>
        </div>
        <div className="p-4">
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-4">🗺️</div>
            <p className="text-lg font-medium mb-2">
              No District Selected
            </p>
            <p className="text-sm">
              Click on any district on the map to view relief information.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const reliefData = getReliefData(selectedDistrict.properties.dt_code);

  return (
    <div className="border border-gray-300 rounded-lg shadow-lg bg-white sticky top-4 max-h-[80vh] overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <h3 className="text-lg font-semibold text-gray-800">
          District Relief Information
        </h3>
      </div>

      <div className="overflow-y-auto flex-1">
        <div className="p-4">
          {/* District Header */}
          <div className="mb-6">
            <h4 className="text-xl font-bold text-blue-600 mb-2">
              {selectedDistrict.properties.district}
            </h4>
            <div className="text-sm text-gray-600">
              Code: {selectedDistrict.properties.dt_code} • State: {selectedDistrict.properties.st_nm}
            </div>
          </div>

          {reliefData ? (
            <div className="space-y-4">
              <div className="mb-4">
                <h5 className="text-lg font-semibold text-gray-700 mb-3">
                  Relief Sites ({reliefData.sites.length})
                </h5>
              </div>

              {/* Relief Sites Accordion */}
              <div className="space-y-2">
                {reliefData.sites.map((site) => (
                  <div key={site.id} className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleSite(site.id)}
                      className="w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-t-lg transition-colors flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium text-gray-800">
                          {site.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {site.supplies.length} supplies available
                        </div>
                      </div>
                      <div className="text-gray-400">
                        {expandedSites.has(site.id) ? "−" : "+"}
                      </div>
                    </button>

                    {expandedSites.has(site.id) && (
                      <div className="border-t border-gray-200">
                        <ReliefSiteCard site={site} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <div className="text-3xl mb-3">🏗️</div>
              <p className="text-lg font-medium mb-2">
                No Relief Data Available
              </p>
              <p className="text-sm">
                Relief sites for this district are being set up.
              </p>
            </div>
          )}

          <button
            onClick={onClearSelection}
            className="w-full mt-6 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
          >
            Clear Selection
          </button>
        </div>
      </div>
    </div>
  );
};

export default DistrictInfoPanel;
