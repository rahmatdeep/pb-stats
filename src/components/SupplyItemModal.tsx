import type { Supply } from "../types/reliefData";

interface SupplyItemModalProps {
  supply: Supply;
  siteName: string;
  onClose: () => void;
}

const SupplyItemModal = ({ supply, siteName, onClose }: SupplyItemModalProps) => {
  const totalQuantity = supply.currentQuantity + supply.bookedQuantity;
  const daysRemaining = Math.floor(totalQuantity / supply.avgConsumptionPerDay);
  
  const getSuggestedDonationDate = () => {
    const suggestedDays = Math.max(1, daysRemaining - 3); // Suggest donation 3 days before running out
    const date = new Date();
    date.setDate(date.getDate() + suggestedDays);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getUrgencyLevel = () => {
    if (daysRemaining <= 2) return { level: "Critical", color: "text-red-600 bg-red-100", emoji: "🚨" };
    if (daysRemaining <= 7) return { level: "Medium", color: "text-yellow-600 bg-yellow-100", emoji: "⚠️" };
    return { level: "Low", color: "text-green-600 bg-green-100", emoji: "✅" };
  };

  const urgency = getUrgencyLevel();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                {supply.icon} {supply.name}
              </h3>
              <p className="text-sm text-gray-600">{siteName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Urgency Badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${urgency.color}`}>
            {urgency.emoji} {urgency.level} Priority
          </div>

          {/* Current Status */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <h4 className="font-semibold text-gray-800">Current Status</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {supply.currentQuantity}
                </div>
                <div className="text-xs text-gray-600">Available Now</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  +{supply.bookedQuantity}
                </div>
                <div className="text-xs text-gray-600">Incoming</div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-800">
                  {totalQuantity} {supply.unit}
                </div>
                <div className="text-sm text-gray-600">Total Available</div>
              </div>
            </div>
          </div>

          {/* Consumption Analysis */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <h4 className="font-semibold text-gray-800">Consumption Analysis</h4>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Daily Usage:</span>
                <span className="font-medium">{supply.avgConsumptionPerDay} {supply.unit}/day</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Days Remaining:</span>
                <span className={`font-medium ${daysRemaining <= 7 ? 'text-red-600' : 'text-green-600'}`}>
                  {daysRemaining} days
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Weekly Need:</span>
                <span className="font-medium">{supply.avgConsumptionPerDay * 7} {supply.unit}/week</span>
              </div>
            </div>
          </div>

          {/* Donation Suggestion */}
          <div className="bg-green-50 p-4 rounded-lg space-y-3">
            <h4 className="font-semibold text-gray-800">💡 Donation Suggestion</h4>
            
            <div className="space-y-2">
              <p className="text-sm text-gray-700">
                Based on current consumption patterns, we suggest scheduling donations by:
              </p>
              
              <div className="bg-white p-3 rounded border border-green-200">
                <div className="font-medium text-green-700">
                  📅 {getSuggestedDonationDate()}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Suggested quantity: {supply.avgConsumptionPerDay * 7} {supply.unit} (1 week supply)
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-center">
            🤝 Schedule Donation
          </button>
          
          <button 
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-center"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupplyItemModal;
