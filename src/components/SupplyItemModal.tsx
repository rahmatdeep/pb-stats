import {
  Calendar,
  TrendingDown,
  Package,
  X,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import type { Supply } from "../types/reliefData";
import { getUrgencyLevel } from "../utils/urgencyUtils";

interface SupplyItemModalProps {
  supply: Supply;
  siteName: string;
  onClose: () => void;
}

const SupplyItemModal = ({
  supply,
  siteName,
  onClose,
}: SupplyItemModalProps) => {
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
  const getIcon = () => {
    if (urgency.level === "Critical" || urgency.level === "Medium") {
      return <AlertTriangle className="w-5 h-5" />;
    }
    return <CheckCircle className="w-5 h-5" />;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-5 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{supply.icon}</span>
                <h3 className="text-xl font-bold">{supply.name}</h3>
              </div>
              <p className="text-indigo-100 text-sm">{siteName}</p>
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
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-medium ${urgency.color}`}
          >
            {getIcon()}
            {urgency.level} Priority
          </div>

          {/* Current Status */}
          <div className="bg-slate-50 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3 mb-3">
              <Package className="w-5 h-5 text-slate-600" />
              <h4 className="font-semibold text-slate-800">
                Current Inventory
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center bg-white rounded-lg p-4 border border-slate-200">
                <div className="text-3xl font-bold text-indigo-600 mb-1">
                  {supply.currentQuantity}
                </div>
                <div className="text-xs text-slate-600 uppercase tracking-wide">
                  Available Now
                </div>
              </div>

              <div className="text-center bg-white rounded-lg p-4 border border-slate-200">
                <div className="text-3xl font-bold text-emerald-600 mb-1">
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
                <div className="text-sm text-slate-600">Total Available</div>
              </div>
            </div>
          </div>

          {/* Consumption Analysis */}
          <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-slate-800">Usage Analytics</h4>
            </div>

            <div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600">Daily Consumption:</span>
                <span className="font-semibold text-slate-800">
                  {supply.avgConsumptionPerDay} {supply.unit}/day
                </span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600">Supply Duration:</span>
                <span
                  className={`font-semibold ${
                    daysRemaining <= 7 ? "text-red-600" : "text-emerald-600"
                  }`}
                >
                  {daysRemaining} days
                </span>
              </div>
            </div>
          </div>

          {/* Donation Suggestion */}
          <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <h4 className="font-semibold text-slate-800">
                Donation Recommendation
              </h4>
            </div>

            <p className="text-slate-700 mb-4 leading-relaxed">
              Based on current consumption patterns, we recommend donating on:
            </p>

            <div className="bg-white rounded-lg p-4 border border-emerald-300">
              <div className="font-semibold text-emerald-700">
                {getSuggestedDonationDate()}
              </div>
              <div className="text-sm text-slate-600">
                Suggested quantity:{" "}
                <span className="font-medium">
                  {supply.avgConsumptionPerDay * 7} {supply.unit}
                </span>{" "}
                (1 week supply)
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-lg hover:shadow-xl">
              Donate
            </button>

            <button
              onClick={onClose}
              className="w-full bg-slate-100 text-slate-700 py-3 px-6 rounded-xl hover:bg-slate-200 transition-colors font-medium"
            >
              Close Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplyItemModal;
