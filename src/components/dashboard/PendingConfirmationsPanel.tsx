import { useState } from "react";
import { Phone, Check, X, AlertCircle, Calendar } from "lucide-react";
import type { PendingDelivery, Supply } from "../../types";
import {
  shouldSuggestEarlierDelivery,
  calculateWeeklyStatus,
  calculateOptimalQuantity,
} from "../../utils/weeklySupplyUtils";
import ModifyDeliveryModal from "./ModifyDeliveryModal";

interface PendingConfirmationsPanelProps {
  pendingDeliveries: PendingDelivery[];
  supplies: Supply[];
  onConfirmIntent: (deliveryId: string) => void;
  onRejectIntent: (deliveryId: string) => void;
  onModifyDelivery: (
    deliveryId: string,
    newQuantity: number,
    newDate: string,
    newTime: string
  ) => void;
}

const PendingConfirmationsPanel = ({
  pendingDeliveries,
  supplies,
  onConfirmIntent,
  onRejectIntent,
  onModifyDelivery,
}: PendingConfirmationsPanelProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] =
    useState<PendingDelivery | null>(null);

  const analyzeDelivery = (delivery: PendingDelivery) => {
    const supply = supplies.find((s) => s.id === delivery.supplyId);
    if (!supply)
      return { recommendation: "approve", reason: "Supply not found" };

    const weeklyStatus = calculateWeeklyStatus(supply);
    const optimalQuantity = calculateOptimalQuantity(supply);
    const shouldSuggestEarlier = shouldSuggestEarlierDelivery(
      supply,
      delivery.quantity,
      delivery.expectedDate
    );

    // Calculate what total will be after this delivery
    const totalAfterDelivery = weeklyStatus.totalAvailable + delivery.quantity;
    const weeklyNeed = supply.avgConsumptionPerDay * 7;
    const excessAfterDelivery = totalAfterDelivery - weeklyNeed;

    let recommendation: "approve" | "modify" | "urgent" | "excess";
    let reason = "";
    let suggestedQuantity = delivery.quantity;
    let suggestedAction = "";

    if (weeklyStatus.status === "critical" && shouldSuggestEarlier) {
      recommendation = "urgent";
      reason = `Critical shortage! Only ${weeklyStatus.daysOfSupply} days left.`;
      suggestedAction = "Request immediate delivery today";
    } else if (excessAfterDelivery > weeklyNeed * 0.5) {
      // More than 1.5 weeks total supply
      recommendation = "excess";
      suggestedQuantity = optimalQuantity;
      reason = `This would create excess. You only need ${optimalQuantity} ${supply.unit}.`;
      suggestedAction = `Suggest reducing to ${suggestedQuantity} ${supply.unit}`;
    } else if (weeklyStatus.status === "low" && shouldSuggestEarlier) {
      recommendation = "modify";
      reason = `Low stock. Consider requesting earlier delivery.`;
      suggestedAction = "Ask for delivery today/tomorrow";
    } else {
      recommendation = "approve";
      reason = "Good timing and quantity";
    }

    return {
      recommendation,
      reason,
      suggestedQuantity,
      suggestedAction,
      weeklyStatus,
      shouldSuggestEarlier,
    };
  };

  const handleOpenModifyModal = (delivery: PendingDelivery) => {
    setSelectedDelivery(delivery);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDelivery(null);
  };

  const handleSaveModification = (
    deliveryId: string,
    newQuantity: number,
    newDate: string,
    newTime: string
  ) => {
    onModifyDelivery(deliveryId, newQuantity, newDate, newTime);
    handleCloseModal();
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg h-fit">
        {/* Panel Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Phone className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">
              Smart Delivery Management
            </h2>
            <span className="bg-white text-orange-600 text-sm font-bold px-2 py-1 rounded-full">
              {pendingDeliveries.length}
            </span>
          </div>
          <p className="text-orange-100 text-sm mt-1">
            Weekly supply optimization with smart recommendations
          </p>
        </div>

        {/* Delivery Requests */}
        <div className="p-6">
          {pendingDeliveries.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              <Phone className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No pending confirmations</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingDeliveries.map((delivery) => {
                const analysis = analyzeDelivery(delivery);
                const supply = supplies.find((s) => s.id === delivery.supplyId);

                return (
                  <div
                    key={delivery.referenceId}
                    className={`border-2 rounded-xl p-5 ${
                      analysis.recommendation === "urgent"
                        ? "border-red-300 bg-red-50"
                        : analysis.recommendation === "excess"
                        ? "border-blue-300 bg-blue-50"
                        : analysis.recommendation === "modify"
                        ? "border-orange-300 bg-orange-50"
                        : "border-green-300 bg-green-50"
                    }`}
                  >
                    {/* Header with Analysis */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-orange-600">
                          #{delivery.referenceId}
                        </span>
                        <div
                          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${
                            analysis.recommendation === "urgent"
                              ? "bg-red-100 text-red-800"
                              : analysis.recommendation === "excess"
                              ? "bg-blue-100 text-blue-800"
                              : analysis.recommendation === "modify"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          <AlertCircle className="w-3 h-3" />
                          {analysis.recommendation.toUpperCase()}
                        </div>
                      </div>

                      {/* Current Supply Status */}
                      {supply && (
                        <div className="text-right text-sm">
                          <div className="font-semibold text-slate-800">
                            {analysis.weeklyStatus?.totalAvailable}{" "}
                            {supply.unit}
                          </div>
                          <div className="text-slate-600">
                            {analysis.weeklyStatus?.daysOfSupply}d supply
                          </div>
                          <div className="text-xs text-slate-500">
                            Need: {supply.avgConsumptionPerDay * 7}/week
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Donor Details */}
                    <div className="mb-4">
                      <p className="font-semibold text-slate-800">
                        {delivery.donorName}
                      </p>
                      <p className="text-sm text-slate-600">
                        📞 {delivery.donorPhone}
                      </p>
                    </div>

                    {/* Supply Details */}
                    <div className="bg-white rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-slate-800">
                          {delivery.supplyName}
                        </span>
                        <span className="text-lg font-bold text-slate-800">
                          {delivery.quantity} {delivery.supplyUnit}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar className="w-4 h-4" />
                        Expected: {delivery.expectedDate} at{" "}
                        {delivery.expectedTime}
                      </div>
                    </div>

                    {/* AI Recommendation */}
                    <div
                      className={`p-3 rounded-lg mb-4 ${
                        analysis.recommendation === "urgent"
                          ? "bg-red-100 border border-red-200"
                          : analysis.recommendation === "excess"
                          ? "bg-blue-100 border border-blue-200"
                          : analysis.recommendation === "modify"
                          ? "bg-orange-100 border border-orange-200"
                          : "bg-green-100 border border-green-200"
                      }`}
                    >
                      <div
                        className={`font-medium mb-1 ${
                          analysis.recommendation === "urgent"
                            ? "text-red-800"
                            : analysis.recommendation === "excess"
                            ? "text-blue-800"
                            : analysis.recommendation === "modify"
                            ? "text-orange-800"
                            : "text-green-800"
                        }`}
                      >
                        💡 Smart Recommendation
                      </div>
                      <p
                        className={`text-sm ${
                          analysis.recommendation === "urgent"
                            ? "text-red-700"
                            : analysis.recommendation === "excess"
                            ? "text-blue-700"
                            : analysis.recommendation === "modify"
                            ? "text-orange-700"
                            : "text-green-700"
                        }`}
                      >
                        {analysis.reason}
                      </p>
                      {analysis.suggestedAction && (
                        <p
                          className={`text-sm font-medium mt-1 ${
                            analysis.recommendation === "urgent"
                              ? "text-red-800"
                              : analysis.recommendation === "excess"
                              ? "text-blue-800"
                              : analysis.recommendation === "modify"
                              ? "text-orange-800"
                              : "text-green-800"
                          }`}
                        >
                          → {analysis.suggestedAction}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {analysis.recommendation === "approve" && (
                        <>
                          <button
                            onClick={() =>
                              onConfirmIntent(delivery.referenceId)
                            }
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            Approve as Planned
                          </button>
                          <button
                            onClick={() => onRejectIntent(delivery.referenceId)}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {analysis.recommendation === "urgent" && (
                        <>
                          <button
                            onClick={() =>
                              onConfirmIntent(delivery.referenceId)
                            }
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                          >
                            <AlertCircle className="w-4 h-4" />
                            Approve - Call for TODAY
                          </button>
                          <button
                            onClick={() => onRejectIntent(delivery.referenceId)}
                            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {(analysis.recommendation === "excess" ||
                        analysis.recommendation === "modify") && (
                        <>
                          <button
                            onClick={() => handleOpenModifyModal(delivery)}
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
                          >
                            <Phone className="w-4 h-4" />
                            Call to Discuss & Modify
                          </button>
                          <button
                            onClick={() =>
                              onConfirmIntent(delivery.referenceId)
                            }
                            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onRejectIntent(delivery.referenceId)}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modification Modal */}
      <ModifyDeliveryModal
        isOpen={isModalOpen}
        delivery={selectedDelivery}
        supply={
          selectedDelivery
            ? supplies.find((s) => s.id === selectedDelivery.supplyId) || null
            : null
        }
        onClose={handleCloseModal}
        onSave={handleSaveModification}
      />
    </>
  );
};

export default PendingConfirmationsPanel;
