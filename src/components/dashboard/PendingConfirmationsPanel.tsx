import { useState } from "react";
import { Phone, Check, X, AlertCircle, Calendar, Scroll } from "lucide-react";
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

    // Use the shouldSuggestEarlierDelivery function properly
    const shouldSuggestEarlier = shouldSuggestEarlierDelivery(
      supply,
      delivery.quantity,
      delivery.expectedDate
    );

    const today = new Date().toISOString().split("T")[0];

    // Enhanced urgency check using both conditions
    const isCurrentlyCritical = weeklyStatus.daysOfSupply < 2;
    const isDeliveryDelayed = delivery.expectedDate > today;

    // KEY: Use shouldSuggestEarlier for more accurate urgency detection
    const isUrgent =
      isCurrentlyCritical && isDeliveryDelayed && shouldSuggestEarlier;

    // Calculate excess after delivery
    const totalAfterDelivery = weeklyStatus.totalAvailable + delivery.quantity;
    const weeklyNeed = supply.avgConsumptionPerDay * 7;
    const excessAfterDelivery = totalAfterDelivery - weeklyNeed;

    let urgentAction = null;
    let excessAction = null;

    // Check for urgent need using the enhanced logic
    if (isUrgent) {
      urgentAction = {
        type: "urgent",
        message: `Critical shortage! Only ${
          weeklyStatus.daysOfSupply
        } days left, delivery in ${Math.ceil(
          (new Date(delivery.expectedDate).getTime() -
            new Date(today).getTime()) /
            (1000 * 60 * 60 * 24)
        )} days.`,
        action: "Request delivery TODAY or ASAP",
      };
    }

    // Check for excess (quantity too high)
    if (excessAfterDelivery > weeklyNeed * 0.5) {
      excessAction = {
        type: "excess",
        message: `Full quantity would create excess. You only need ${optimalQuantity} ${supply.unit}.`,
        action: `Suggest accepting ${optimalQuantity} now, rest later`,
      };
    }

    // Determine recommendation based on both flags
    let recommendation:
      | "approve"
      | "modify"
      | "urgent"
      | "excess"
      | "urgent_and_excess";
    let reason = "";
    let suggestedAction = "";

    if (urgentAction && excessAction) {
      recommendation = "urgent_and_excess";
      reason = `URGENT + EXCESS: Need ${optimalQuantity} bottles TODAY, schedule rest later`;
      suggestedAction = `Call for partial delivery: ${optimalQuantity} today, ${
        delivery.quantity - optimalQuantity
      } later`;
    } else if (urgentAction) {
      recommendation = "urgent";
      reason = urgentAction.message;
      suggestedAction = urgentAction.action;
    } else if (excessAction) {
      recommendation = "excess";
      reason = excessAction.message;
      suggestedAction = excessAction.action;
    } else {
      recommendation = "approve";
      reason = "Good timing and quantity";
    }

    return {
      recommendation,
      reason,
      suggestedQuantity: optimalQuantity,
      suggestedAction,
      weeklyStatus,
      shouldSuggestEarlier, // Keep this for debugging
      urgentAction,
      excessAction,
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

  const getMessageTextColor = (recommendation: string) => {
    switch (recommendation) {
      case "urgent_and_excess":
        return "text-purple-800";
      case "urgent":
        return "text-red-800";
      case "excess":
        return "text-blue-800";
      case "modify":
        return "text-orange-800";
      default:
        return "text-green-800";
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg flex flex-col max-h-[70vh] sm:rounded-2xl sm:max-h-[600px]">
        {/* Panel Header - Fixed */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 px-4 py-3 rounded-t-lg flex-shrink-0 sm:px-6 sm:py-4 sm:rounded-t-2xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <Phone className="w-5 h-5 text-white sm:w-6 sm:h-6" />
            <h2 className="text-lg font-bold text-white sm:text-xl">
              Smart Delivery Management
            </h2>
            <span className="bg-white text-orange-600 text-xs font-bold px-1.5 py-0.5 rounded-full sm:text-sm sm:px-2 sm:py-1">
              {pendingDeliveries.length}
            </span>
          </div>
          <p className="text-orange-100 text-xs mt-1 sm:text-sm">
            Weekly supply optimization with smart recommendations
          </p>
        </div>

        {/* Scrollable Delivery Requests */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            {pendingDeliveries.length === 0 ? (
              <div className="text-center text-slate-500 py-6 sm:py-8">
                <Phone className="w-10 h-10 mx-auto mb-2 text-slate-300 sm:w-12 sm:h-12 sm:mb-3" />
                <p className="text-sm sm:text-base">No pending confirmations</p>
              </div>
            ) : (
              <>
                {/* Scroll hint - hidden on mobile, shown on larger screens */}
                {pendingDeliveries.length > 2 && (
                  <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 mb-4 justify-center">
                    <Scroll className="w-3 h-3" />
                    <span>
                      Scroll to see all {pendingDeliveries.length} requests
                    </span>
                  </div>
                )}

                <div className="space-y-3 sm:space-y-4">
                  {pendingDeliveries.map((delivery, _index) => {
                    const analysis = analyzeDelivery(delivery);
                    const supply = supplies.find(
                      (s) => s.id === delivery.supplyId
                    );

                    return (
                      <div
                        key={delivery.referenceId}
                        className={`border rounded-lg p-3 sm:border-2 sm:rounded-xl sm:p-4 ${
                          analysis.recommendation === "urgent_and_excess"
                            ? "border-purple-300 bg-purple-50"
                            : analysis.recommendation === "urgent"
                            ? "border-red-300 bg-red-50"
                            : analysis.recommendation === "excess"
                            ? "border-blue-300 bg-blue-50"
                            : analysis.recommendation === "modify"
                            ? "border-orange-300 bg-orange-50"
                            : "border-green-300 bg-green-50"
                        }`}
                      >
                        {/* Header with Analysis - Mobile first */}
                        <div className="flex items-start justify-between mb-2 sm:mb-3">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                            <span className="font-mono text-xs font-bold text-orange-600">
                              #{delivery.referenceId}
                            </span>

                            {/* Mobile: Stack badges vertically, Desktop: horizontal */}
                            <div className="flex flex-wrap gap-1">
                              {analysis.urgentAction && (
                                <div className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-medium bg-red-100 text-red-800 sm:px-2 sm:py-1">
                                  🚨{" "}
                                  <span className="hidden sm:inline">
                                    URGENT
                                  </span>
                                </div>
                              )}
                              {analysis.excessAction && (
                                <div className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-medium bg-blue-100 text-blue-800 sm:px-2 sm:py-1">
                                  📦{" "}
                                  <span className="hidden sm:inline">
                                    EXCESS
                                  </span>
                                </div>
                              )}
                              {!analysis.urgentAction &&
                                !analysis.excessAction && (
                                  <div className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-medium bg-green-100 text-green-800 sm:px-2 sm:py-1">
                                    <AlertCircle className="w-2 h-2 sm:w-3 sm:h-3" />
                                    <span className="hidden sm:inline">
                                      APPROVE
                                    </span>
                                  </div>
                                )}
                            </div>
                          </div>

                          {/* Supply Status - smaller on mobile */}
                          {supply && (
                            <div className="text-right text-xs">
                              <div className="font-semibold text-slate-800">
                                {analysis.weeklyStatus?.totalAvailable}{" "}
                                <span className="hidden sm:inline">
                                  {supply.unit}
                                </span>
                              </div>
                              <div className="text-slate-600">
                                {analysis.weeklyStatus?.daysOfSupply}d
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Donor & Supply Info - Mobile optimized */}
                        <div className="mb-2 sm:mb-3">
                          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start">
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-slate-800 text-sm truncate">
                                {delivery.donorName}
                              </p>
                              <p className="text-xs text-slate-600">
                                📞 {delivery.donorPhone}
                              </p>
                            </div>
                            <div className="text-left sm:text-right">
                              <p className="font-bold text-slate-800 text-sm">
                                {delivery.quantity} {delivery.supplyUnit}
                              </p>
                              <p className="text-xs text-slate-600 truncate">
                                {delivery.supplyName}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-xs text-slate-600 bg-white bg-opacity-50 px-2 py-1 rounded mt-2 sm:gap-2">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">
                              {delivery.expectedDate} at {delivery.expectedTime}
                            </span>
                          </div>
                        </div>

                        {/* Smart Recommendation - Mobile optimized */}
                        <div
                          className={`p-2 rounded-lg mb-3 ${
                            analysis.recommendation === "urgent_and_excess"
                              ? "bg-purple-100 border border-purple-200"
                              : analysis.recommendation === "urgent"
                              ? "bg-red-100 border border-red-200"
                              : analysis.recommendation === "excess"
                              ? "bg-blue-100 border border-blue-200"
                              : analysis.recommendation === "modify"
                              ? "bg-orange-100 border border-orange-200"
                              : "bg-green-100 border border-green-200"
                          }`}
                        >
                          <p
                            className={`text-xs font-medium mb-1 ${
                              analysis.recommendation === "urgent_and_excess"
                                ? "text-purple-800"
                                : analysis.recommendation === "urgent"
                                ? "text-red-800"
                                : analysis.recommendation === "excess"
                                ? "text-blue-800"
                                : analysis.recommendation === "modify"
                                ? "text-orange-800"
                                : "text-green-800"
                            }`}
                          >
                            💡 <span className="hidden sm:inline">Smart </span>
                            Recommendation
                          </p>

                          {/* Show both urgent and excess messages - mobile condensed */}
                          {analysis.urgentAction && (
                            <p className="text-xs text-red-700 mb-1">
                              🔥 <strong>CRITICAL:</strong>{" "}
                              {analysis.weeklyStatus?.daysOfSupply} days left
                              <span className="hidden sm:inline">
                                {" "}
                                - need immediate delivery today!
                              </span>
                            </p>
                          )}

                          {analysis.excessAction && (
                            <p className="text-xs text-blue-700 mb-1">
                              📊 <strong>EXCESS:</strong> Too much
                              <span className="hidden sm:inline">
                                {" "}
                                ({delivery.quantity} {supply?.unit}, need ~
                                {analysis.suggestedQuantity})
                              </span>
                            </p>
                          )}

                          {analysis.suggestedAction && (
                            <p
                              className={`text-xs font-medium ${getMessageTextColor(
                                analysis.recommendation
                              )}`}
                            >
                              → {analysis.suggestedAction}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons - Mobile first stacked layout */}
                        <div className="flex flex-col gap-2 sm:flex-row">
                          {analysis.recommendation === "approve" && (
                            <>
                              <button
                                onClick={() =>
                                  onConfirmIntent(delivery.referenceId)
                                }
                                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors sm:flex-1 sm:text-xs"
                              >
                                <Check className="w-3 h-3" />
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  onRejectIntent(delivery.referenceId)
                                }
                                className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center transition-colors sm:w-auto sm:px-3"
                              >
                                <X className="w-3 h-3" />
                                <span className="sm:hidden ml-1">Reject</span>
                              </button>
                            </>
                          )}

                          {analysis.recommendation === "urgent" && (
                            <>
                              <button
                                onClick={() => handleOpenModifyModal(delivery)}
                                className="w-full  bg-orange-500 hover:bg-orange-600 text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors sm:flex-1 sm:text-xs"
                              >
                                <AlertCircle className="w-3 h-3" />
                                <span className="sm:hidden">
                                  Modify for TODAY
                                </span>
                                <span className="hidden sm:inline">
                                  Call for TODAY - Modify
                                </span>
                              </button>
                              <div className="flex gap-2 sm:contents">
                                <button
                                  onClick={() =>
                                    onConfirmIntent(delivery.referenceId)
                                  }
                                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors sm:text-xs"
                                >
                                  <Check className="w-3 h-3" />
                                  <span className="sm:hidden">Accept</span>
                                  <span className="hidden sm:inline">
                                    Accept As-Is
                                  </span>
                                </button>
                                <button
                                  onClick={() =>
                                    onRejectIntent(delivery.referenceId)
                                  }
                                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center transition-colors sm:px-3"
                                >
                                  <X className="w-3 h-3" />
                                  <span className="sm:hidden ml-1">Reject</span>
                                </button>
                              </div>
                            </>
                          )}

                          {(analysis.recommendation === "excess" ||
                            analysis.recommendation === "modify" ||
                            analysis.recommendation ===
                              "urgent_and_excess") && (
                            <>
                              <button
                                onClick={() => handleOpenModifyModal(delivery)}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors sm:flex-1 sm:text-xs"
                              >
                                <Phone className="w-3 h-3" />
                                <span className="sm:hidden">
                                  {analysis.recommendation ===
                                  "urgent_and_excess"
                                    ? "Call for TODAY"
                                    : "Call & Modify"}
                                </span>
                                <span className="hidden sm:inline">
                                  {analysis.recommendation ===
                                  "urgent_and_excess"
                                    ? "Call for PARTIAL TODAY"
                                    : "Call & Modify"}
                                </span>
                              </button>
                              <div className="flex gap-2 sm:contents">
                                <button
                                  onClick={() =>
                                    onConfirmIntent(delivery.referenceId)
                                  }
                                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors sm:text-xs"
                                >
                                  <Check className="w-3 h-3" />
                                  <span className="sm:hidden">Accept</span>
                                  <span className="hidden sm:inline">
                                    Accept Full
                                  </span>
                                </button>
                                <button
                                  onClick={() =>
                                    onRejectIntent(delivery.referenceId)
                                  }
                                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center transition-colors sm:px-3"
                                >
                                  <X className="w-3 h-3" />
                                  <span className="sm:hidden ml-1">Reject</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
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
