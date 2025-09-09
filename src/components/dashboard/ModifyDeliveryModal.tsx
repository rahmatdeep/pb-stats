import { useEffect, useState } from "react";
import {
  Phone,
  X,
  Save,
  AlertTriangle,
  Clock,
  Package,
  Zap,
} from "lucide-react";
import type { PendingDelivery, Supply } from "../../types";
import {
  calculateOptimalQuantity,
  calculateWeeklyStatus,
  shouldSuggestEarlierDelivery,
} from "../../utils/weeklySupplyUtils";

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

  const weeklyStatus = calculateWeeklyStatus(supply);
  const optimalQuantity = calculateOptimalQuantity(supply);
  const shouldSuggestEarlier = shouldSuggestEarlierDelivery(
    supply,
    delivery.quantity,
    delivery.expectedDate
  );

  const today = new Date();
  const todayString = today.toISOString().split("T")[0];
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowString = tomorrow.toISOString().split("T")[0];

  // Analyze the situation
  const isCurrentlyCritical = weeklyStatus.daysOfSupply < 2;
  const isDeliveryDelayed = delivery.expectedDate > todayString;
  const isUrgent =
    isCurrentlyCritical && isDeliveryDelayed && shouldSuggestEarlier;

  const totalAfterDelivery = weeklyStatus.totalAvailable + delivery.quantity;
  const weeklyNeed = supply.avgConsumptionPerDay * 7;
  const isExcess = totalAfterDelivery > weeklyNeed * 1.5;

  // Determine the scenario
  let scenario = "normal";
  if (isUrgent && isExcess) scenario = "urgent_and_excess";
  else if (isUrgent) scenario = "urgent";
  else if (isExcess) scenario = "excess";

  // Calculate delivery gap
  const deliveryDate = new Date(delivery.expectedDate);
  const daysUntilDelivery = Math.ceil(
    (deliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  const handleSave = () => {
    onSave(delivery.referenceId, modifiedQuantity, modifiedDate, modifiedTime);
    onClose();
  };

  // Get scenario-specific styling and content
  const getScenarioStyles = () => {
    switch (scenario) {
      case "urgent_and_excess":
        return {
          headerBg: "bg-gradient-to-r from-red-600 to-purple-600",
          suggestionBg: "bg-purple-50 border-purple-200",
          suggestionText: "text-purple-800",
          urgencyIcon: <AlertTriangle className="w-5 h-5 text-red-500" />,
          title: "🚨 URGENT + EXCESS Modification",
        };
      case "urgent":
        return {
          headerBg: "bg-gradient-to-r from-red-600 to-red-700",
          suggestionBg: "bg-red-50 border-red-200",
          suggestionText: "text-red-800",
          urgencyIcon: <Zap className="w-5 h-5 text-red-500" />,
          title: "🚨 URGENT Modification",
        };
      case "excess":
        return {
          headerBg: "bg-gradient-to-r from-blue-600 to-blue-700",
          suggestionBg: "bg-blue-50 border-blue-200",
          suggestionText: "text-blue-800",
          urgencyIcon: <Package className="w-5 h-5 text-blue-500" />,
          title: "📦 EXCESS Modification",
        };
      default:
        return {
          headerBg: "bg-gradient-to-r from-orange-600 to-orange-700",
          suggestionBg: "bg-blue-50 border-blue-200",
          suggestionText: "text-blue-800",
          urgencyIcon: <Phone className="w-5 h-5 text-orange-500" />,
          title: "📞 Modify Delivery Request",
        };
    }
  };

  const styles = getScenarioStyles();

  // Get scenario-specific call script
  const getCallScript = () => {
    switch (scenario) {
      case "urgent_and_excess":
        return `"Hi ${delivery.donorName}, thank you for offering ${
          delivery.quantity
        } ${supply.unit}! We're in an emergency situation with only ${
          weeklyStatus.daysOfSupply
        } days supply left. Could you please deliver ${optimalQuantity} ${
          supply.unit
        } TODAY to cover our immediate crisis? We'd love to schedule the remaining ${
          delivery.quantity - optimalQuantity
        } ${
          supply.unit
        } for next week. This helps us manage our urgent needs while ensuring your donation has maximum impact!"`;

      case "urgent":
        return `"Hi ${delivery.donorName}, thank you for offering ${
          delivery.quantity
        } ${supply.unit}! We're facing an emergency with only ${
          weeklyStatus.daysOfSupply
        } days supply left. Could you please deliver these supplies TODAY or tomorrow instead of ${
          delivery.expectedDate
        }? We'll completely run out in ${Math.floor(
          weeklyStatus.daysOfSupply
        )} day(s) and your delivery would arrive ${daysUntilDelivery} days from now, leaving us without supplies for ${
          daysUntilDelivery - Math.floor(weeklyStatus.daysOfSupply)
        } days."`;

      case "excess":
        return `"Hi ${delivery.donorName}, thank you for your generous offer of ${delivery.quantity} ${supply.unit}! Based on our current supply levels, we'd like to discuss adjusting this to ${optimalQuantity} ${supply.unit} for delivery on ${modifiedDate}. This perfectly covers our weekly needs while allowing other centers to benefit from your generosity. Would this work for you?"`;

      default:
        return `"Hi ${delivery.donorName}, thank you for your donation offer of ${delivery.quantity} ${supply.unit}. We'd like to discuss adjusting the delivery details to ${modifiedQuantity} ${supply.unit} for delivery on ${modifiedDate}. Would this work for you?"`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Enhanced Header */}
        <div className={`${styles.headerBg} px-6 py-4 rounded-t-2xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {styles.urgencyIcon}
              <h2 className="text-xl font-bold text-white">{styles.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
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

          {/* Scenario-Specific Analysis */}
          <div className={`mb-6 p-4 rounded-lg border ${styles.suggestionBg}`}>
            <h3 className={`font-semibold mb-3 ${styles.suggestionText}`}>
              📊 Current Situation Analysis
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-slate-800">Current Supply</p>
                <p className={`${styles.suggestionText} font-bold`}>
                  {supply.currentQuantity} {supply.unit} (
                  {weeklyStatus.daysOfSupply}d left)
                </p>
              </div>
              <div>
                <p className="font-medium text-slate-800">Weekly Need</p>
                <p className="text-slate-700">
                  {weeklyNeed} {supply.unit}
                </p>
              </div>
              <div>
                <p className="font-medium text-slate-800">Delivery In</p>
                <p className="text-slate-700">{daysUntilDelivery} days</p>
              </div>
              <div>
                <p className="font-medium text-slate-800">Optimal Quantity</p>
                <p className="text-green-700 font-bold">
                  {optimalQuantity} {supply.unit}
                </p>
              </div>
            </div>
          </div>

          {/* Smart Suggestions Based on Scenario */}
          <div className={`mb-6 p-4 rounded-lg border ${styles.suggestionBg}`}>
            <h3 className={`font-semibold mb-3 ${styles.suggestionText}`}>
              💡 Smart Recommendations
            </h3>
            <div className="space-y-3 text-sm">
              {scenario === "urgent_and_excess" && (
                <>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-red-700">
                      <strong>URGENT:</strong> Request {optimalQuantity}{" "}
                      {supply.unit} for immediate delivery TODAY
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Package className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-blue-700">
                      <strong>EXCESS:</strong> Schedule remaining{" "}
                      {delivery.quantity - optimalQuantity} {supply.unit} for
                      next week or redirect to other centers
                    </p>
                  </div>
                </>
              )}

              {scenario === "urgent" && (
                <>
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-red-700">
                      <strong>CRITICAL GAP:</strong> You'll be without supplies
                      for{" "}
                      {daysUntilDelivery -
                        Math.floor(weeklyStatus.daysOfSupply)}{" "}
                      days if delivery isn't moved earlier
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <p className="text-orange-700">
                      <strong>SOLUTION:</strong> Request delivery TODAY or
                      tomorrow to avoid stockout
                    </p>
                  </div>
                </>
              )}

              {scenario === "excess" && (
                <>
                  <div className="flex items-start gap-2">
                    <Package className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-blue-700">
                      <strong>OPTIMIZATION:</strong> Reduce to {optimalQuantity}{" "}
                      {supply.unit} for perfect weekly supply
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-green-700">
                      <strong>ALTERNATIVE:</strong> Redirect excess{" "}
                      {delivery.quantity - optimalQuantity} {supply.unit} to
                      other centers in need
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Modification Form */}
          <div className="space-y-4 mb-6">
            {/* Quantity with Smart Presets */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Quantity ({supply.unit})
              </label>
              <div className="flex gap-2 mb-2">
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
                  className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                >
                  Use Optimal ({optimalQuantity})
                </button>
              </div>

              {/* Quick preset buttons based on scenario */}
              <div className="flex gap-2 text-xs">
                {scenario === "urgent_and_excess" && (
                  <button
                    onClick={() =>
                      setModifiedQuantity(
                        Math.min(
                          optimalQuantity,
                          Math.floor(delivery.quantity / 2)
                        )
                      )
                    }
                    className="px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                  >
                    Half Now (
                    {Math.min(
                      optimalQuantity,
                      Math.floor(delivery.quantity / 2)
                    )}
                    )
                  </button>
                )}
                <button
                  onClick={() => setModifiedQuantity(delivery.quantity)}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                >
                  Original ({delivery.quantity})
                </button>
              </div>

              <p className="text-xs text-slate-500 mt-1">
                Original: {delivery.quantity} {supply.unit} • Optimal:{" "}
                {optimalQuantity} {supply.unit}
              </p>
            </div>

            {/* Date with Smart Presets */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Delivery Date
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="date"
                  value={modifiedDate}
                  min={todayString}
                  onChange={(e) => setModifiedDate(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                {(scenario === "urgent" ||
                  scenario === "urgent_and_excess") && (
                  <button
                    onClick={() => setModifiedDate(todayString)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                  >
                    🚨 TODAY
                  </button>
                )}
                <button
                  onClick={() => setModifiedDate(tomorrowString)}
                  className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
                >
                  Tomorrow
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Original: {delivery.expectedDate}
                {isUrgent && (
                  <span className="text-red-600 font-medium">
                    {" "}
                    • ⚠️ URGENT: Change to avoid{" "}
                    {daysUntilDelivery -
                      Math.floor(weeklyStatus.daysOfSupply)}{" "}
                    day gap
                  </span>
                )}
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

          {/* Enhanced Call Script */}
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Suggested Call Script
            </h3>
            <p className="text-sm text-green-700 leading-relaxed">
              {getCallScript()}
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
              className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-white ${
                scenario === "urgent_and_excess"
                  ? "bg-purple-500 hover:bg-purple-600"
                  : scenario === "urgent"
                  ? "bg-red-500 hover:bg-red-600"
                  : scenario === "excess"
                  ? "bg-blue-500 hover:bg-blue-600"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModifyDeliveryModal;
