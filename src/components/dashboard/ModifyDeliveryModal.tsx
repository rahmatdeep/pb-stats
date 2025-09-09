import { useEffect, useState } from "react";
import { Phone, X, Save } from "lucide-react";
import type { PendingDelivery, Supply } from "../../types";
import { calculateOptimalQuantity } from "../../utils/weeklySupplyUtils";

interface ModifyDeliveryModalProps {
  isOpen: boolean;
  delivery: PendingDelivery | null;
  supply: Supply | null;
  onClose: () => void;
  onSave: (
    deliveryId: string,
    newQuantity: number,
    newDate: string,
    newTime: string
  ) => void;
}

const ModifyDeliveryModal = ({
  isOpen,
  delivery,
  supply,
  onClose,
  onSave,
}: ModifyDeliveryModalProps) => {
  const [modifiedQuantity, setModifiedQuantity] = useState(
    delivery?.quantity || 0
  );
  const [modifiedDate, setModifiedDate] = useState(
    delivery?.expectedDate || ""
  );
  const [modifiedTime, setModifiedTime] = useState(
    delivery?.expectedTime || ""
  );

  // Reset form when delivery changes
  useEffect(() => {
    if (delivery) {
      setModifiedQuantity(delivery.quantity);
      setModifiedDate(delivery.expectedDate);
      setModifiedTime(delivery.expectedTime);
    }
  }, [delivery]);

  if (!isOpen || !delivery || !supply) return null;

  const optimalQuantity = calculateOptimalQuantity(supply);

  const handleSave = () => {
    onSave(delivery.referenceId, modifiedQuantity, modifiedDate, modifiedTime);
    onClose();
  };

  // Get today's date for minimum date selection
  const today = new Date();
  const todayString = today.toISOString().split("T")[0];

  // Get tomorrow's date
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowString = tomorrow.toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Phone className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-bold text-slate-800">
              Modify Delivery Request
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Delivery Info */}
        <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-sm font-bold text-orange-600">
              #{delivery.referenceId}
            </span>
            <span className="text-sm text-slate-600">{supply.name}</span>
          </div>
          <p className="font-semibold text-slate-800">{delivery.donorName}</p>
          <p className="text-sm text-slate-600">📞 {delivery.donorPhone}</p>
        </div>

        {/* Smart Suggestions */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">
            💡 Smart Suggestions
          </h3>
          <div className="space-y-2 text-sm">
            <p className="text-blue-700">
              <strong>Optimal Quantity:</strong> {optimalQuantity} {supply.unit}
              <span className="text-blue-600"> (for 1 week supply)</span>
            </p>
            <p className="text-blue-700">
              <strong>Current Weekly Need:</strong>{" "}
              {supply.avgConsumptionPerDay * 7} {supply.unit}
            </p>
            <p className="text-blue-700">
              <strong>Suggested:</strong> Request delivery today/tomorrow if
              critically low
            </p>
          </div>
        </div>

        {/* Modification Form */}
        <div className="space-y-4 mb-6">
          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Quantity ({supply.unit})
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                value={modifiedQuantity}
                onChange={(e) =>
                  setModifiedQuantity(parseInt(e.target.value) || 0)
                }
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <button
                onClick={() => setModifiedQuantity(optimalQuantity)}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                Use Optimal
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Original: {delivery.quantity} {supply.unit} • Optimal:{" "}
              {optimalQuantity} {supply.unit}
            </p>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Delivery Date
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={modifiedDate}
                min={todayString}
                onChange={(e) => setModifiedDate(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <button
                onClick={() => setModifiedDate(todayString)}
                className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                Today
              </button>
              <button
                onClick={() => setModifiedDate(tomorrowString)}
                className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
              >
                Tomorrow
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Original: {delivery.expectedDate}
            </p>
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Delivery Time
            </label>
            <input
              type="time"
              value={modifiedTime}
              onChange={(e) => setModifiedTime(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <p className="text-xs text-slate-500 mt-1">
              Original: {delivery.expectedTime}
            </p>
          </div>
        </div>

        {/* Call Script Helper */}
        <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-green-800 mb-2">📞 Call Script</h3>
          <p className="text-sm text-green-700">
            "Hi {delivery.donorName}, thank you for your donation offer of{" "}
            {delivery.quantity} {supply.unit}. Based on our current supply
            levels, we'd like to discuss adjusting this to{" "}
            <strong>
              {optimalQuantity} {supply.unit}
            </strong>{" "}
            for delivery on <strong>{modifiedDate}</strong>. Would this work for
            you?"
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => window.open(`tel:${delivery.donorPhone}`)}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4" />
            Call Donor
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModifyDeliveryModal;
