import {
  Calendar,
  TrendingDown,
  Package,
  X,
  AlertTriangle,
  MapPin,
} from "lucide-react";
import type { Representative, Supply } from "../../types";
import { getUrgencyLevel } from "../../utils/urgencyUtils";
import { useState } from "react";
import DonationOptionsModal from "./DonationOptionsModal";

interface SupplyItemModalProps {
  supply: Supply;
  siteName: string;
  districtName: string;
  representative: Representative;
  onClose: () => void;
}

const SupplyItemModal = ({
  supply,
  siteName,
  districtName,
  representative,
  onClose,
}: SupplyItemModalProps) => {
  const [showDonationOptions, setShowDonationOptions] = useState(false);

  const totalQuantity = supply.currentQuantity + supply.bookedQuantity;
  const daysRemaining = Math.floor(totalQuantity / supply.avgConsumptionPerDay);

  const getSuggestedDonationDate = () => {
    const suggestedDays = Math.max(1, daysRemaining - 3);
    const date = new Date();
    date.setDate(date.getDate() + suggestedDays);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const urgency = getUrgencyLevel(supply);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-amber-50 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-5 rounded-t-2xl">
            <div className="flex justify-between items-start">
              <div className="text-white">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{supply.icon}</span>
                  <h3 className="text-xl font-bold">{supply.name}</h3>
                </div>
                <div className="flex gap-1">
                  <MapPin className="w-4 h-4 mt-[1px]" />
                  <p className="text-orange-100 text-sm">{siteName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Urgency Badge */}
            {urgency.level !== "Low" && (
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-medium text-md ${urgency.color}`}
              >
                <AlertTriangle className="w-4 h-4" />
                {urgency.level} Priority
              </div>
            )}

            {/* Current Status */}
            <div className="bg-amber-100 border-amber-400 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-slate-600" />
                <h4 className="font-semibold text-slate-800">
                  Current Inventory
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center bg-white rounded-lg p-4 border border-amber-200">
                  <div className="text-3xl font-bold text-orange-600 mb-1">
                    {supply.currentQuantity}
                  </div>
                  <div className="text-xs text-slate-600 uppercase tracking-wide">
                    Available Now
                  </div>
                </div>

                <div className="text-center bg-white rounded-lg p-4 border border-amber-200">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    +{supply.bookedQuantity}
                  </div>
                  <div className="text-xs text-slate-600 uppercase tracking-wide">
                    Incoming
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-800 mb-1">
                    {totalQuantity} {supply.unit}
                  </div>
                  <div className="text-sm text-slate-600">Expected Total</div>
                </div>
              </div>
            </div>

            {/* Consumption Analysis */}
            <div className="bg-orange-50 rounded-xl p-5 border border-orange-200">
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-5 h-5 text-orange-600" />
                <h4 className="font-semibold text-slate-800">
                  Usage Analytics
                </h4>
              </div>

              <div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-600">Daily Consumption:</span>
                  <span className="font-semibold text-slate-800">
                    {supply.avgConsumptionPerDay} {supply.unit}/day
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-600">Supply Duration:</span>
                  <span
                    className={`font-semibold ${
                      daysRemaining <= 7 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {daysRemaining} days
                  </span>
                </div>
              </div>
            </div>

            {/* Donation Suggestion */}
            <div className="bg-green-50 rounded-xl p-5 border border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <h4 className="font-semibold text-slate-800">
                  Donation Recommendation
                </h4>
              </div>

              <p className="text-slate-700 mb-4 leading-relaxed">
                Based on current consumption patterns, we recommend donating on:
              </p>

              <div className="bg-white rounded-lg p-4 border border-green-300">
                <div className="font-semibold text-green-700">
                  {getSuggestedDonationDate()}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => setShowDonationOptions(true)}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 px-6 rounded-xl hover:from-orange-700 hover:to-red-700 transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                Donate
              </button>

              <button
                onClick={onClose}
                className="w-full  bg-orange-100 text-orange-700 py-3 px-6 rounded-xl hover:bg-orange-200 transition-colors font-medium"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Only show donation options modal */}
      {showDonationOptions && (
        <DonationOptionsModal
          supply={supply}
          siteName={siteName}
          districtName={districtName}
          representative={representative}
          onClose={() => setShowDonationOptions(false)}
        />
      )}
    </>
  );
};

export default SupplyItemModal;
