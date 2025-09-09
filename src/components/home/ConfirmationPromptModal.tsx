import { Phone, Copy, CheckCircle } from "lucide-react";
import { useState } from "react";
import type { PendingDelivery } from "../../types";

interface ConfirmationPromptModalProps {
  deliveryData: PendingDelivery;
  onClose: () => void;
}

const ConfirmationPromptModal = ({
  deliveryData,
  onClose,
}: ConfirmationPromptModalProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyReference = () => {
    navigator.clipboard.writeText(deliveryData.referenceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCall = () => {
    window.location.href = `tel:${deliveryData.representative.phone}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 rounded-t-2xl">
          <div className="text-white text-center">
            <CheckCircle className="w-12 h-12 mx-auto mb-2" />
            <h3 className="text-xl font-bold">Registration Successful!</h3>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Reference ID */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h4 className="font-semibold text-blue-800 mb-2">
              Your Reference ID
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-mono font-bold text-blue-600">
                #{deliveryData.referenceId}
              </span>
              <button
                onClick={handleCopyReference}
                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {copied ? "Copied!" : "Tap to copy"}
            </p>
          </div>

          {/* Next Steps */}
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">
                ⚠️ Important Next Step
              </h4>
              <p className="text-yellow-700 text-sm">
                Please call the center representative to confirm your donation
                before proceeding.
              </p>
            </div>

            {/* Representative Details */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-800 mb-3">
                Contact Representative
              </h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">Name:</span>
                  <span className="ml-2 font-medium">
                    {deliveryData.representative.name}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Center:</span>
                  <span className="ml-2 font-medium">
                    {deliveryData.siteName}
                  </span>
                </div>
              </div>
            </div>

            {/* Call Button */}
            <button
              onClick={handleCall}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-xl hover:from-green-700 hover:to-green-800 transition-all font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5" />
              Call {deliveryData.representative.phone}
            </button>

            {/* Instructions */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h4 className="font-semibold text-green-800 mb-2">
                During the call:
              </h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>
                  • Mention your reference ID: #{deliveryData.referenceId}
                </li>
                <li>
                  • Confirm quantity: {deliveryData.quantity}{" "}
                  {deliveryData.supplyUnit} of {deliveryData.supplyName}
                </li>
                <li>
                  • Confirm timing: {deliveryData.expectedDate} at{" "}
                  {deliveryData.expectedTime}
                </li>
              </ul>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPromptModal;
