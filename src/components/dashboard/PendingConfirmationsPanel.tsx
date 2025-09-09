import { Phone, Check, X, Clock } from "lucide-react";
import type { PendingDelivery } from "../../types";

interface PendingConfirmationsPanelProps {
  pendingDeliveries: PendingDelivery[];
  onConfirmIntent: (deliveryId: string) => void;
  onRejectIntent: (deliveryId: string) => void;
}

const PendingConfirmationsPanel = ({
  pendingDeliveries,
  onConfirmIntent,
  onRejectIntent,
}: PendingConfirmationsPanelProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg h-fit">
      {/* Panel Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <Phone className="w-6 h-6 text-white" />
          <h2 className="text-xl font-bold text-white">
            Pending Confirmations
          </h2>
          <span className="bg-white text-orange-600 text-sm font-bold px-2 py-1 rounded-full">
            {pendingDeliveries.length}
          </span>
        </div>
      </div>

      {/* Delivery Requests */}
      <div className="p-6">
        {pendingDeliveries.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            <Phone className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>No pending confirmations</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingDeliveries.map((delivery) => (
              <div
                key={delivery.referenceId}
                className="border-2 border-amber-200 rounded-xl p-4 bg-amber-50"
              >
                {/* Delivery Info Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-orange-600">
                      #{delivery.referenceId}
                    </span>
                    <div className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      <Clock className="w-3 h-3" />
                      Awaiting Confirmation
                    </div>
                  </div>
                </div>

                {/* Donor Details */}
                <div className="mb-3">
                  <p className="font-semibold text-slate-800">
                    {delivery.donorName}
                  </p>
                  <p className="text-sm text-slate-600">
                    {delivery.donorPhone}
                  </p>
                </div>

                {/* Supply Details */}
                <div className="bg-white rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-slate-800">
                      {delivery.supplyName}
                    </span>
                    <span className="text-slate-600">
                      {delivery.quantity} {delivery.supplyUnit}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600">
                    Expected: {delivery.expectedDate} at {delivery.expectedTime}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => onConfirmIntent(delivery.referenceId)}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    Approve & Add to Incoming
                  </button>
                  <button
                    onClick={() => onRejectIntent(delivery.referenceId)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingConfirmationsPanel;
