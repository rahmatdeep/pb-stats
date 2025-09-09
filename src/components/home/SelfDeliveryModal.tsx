import { useState } from "react";
import { X } from "lucide-react";
import type {
  Supply,
  Representative,
  PendingDelivery,
  DeliveryStatus,
  DeliveryFormData,
} from "../../types";
import ConfirmationPromptModal from "./ConfirmationPromptModal";

interface SelfDeliveryModalProps {
  supply: Supply;
  siteName: string;
  representative: Representative;
  onClose: () => void;
}

const SelfDeliveryModal = ({
  supply,
  siteName,
  representative,
  onClose,
}: SelfDeliveryModalProps) => {
  const [formData, setFormData] = useState<DeliveryFormData>({
    donorName: "",
    donorPhone: "",
    quantity: "",
    expectedDate: "",
    expectedTime: "",
  });

  // Handle confirmation modal within this component
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [deliveryData, setDeliveryData] = useState<PendingDelivery | null>(
    null
  );

  const generateReferenceId = () => {
    return `DEL${Date.now().toString().slice(-6)}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const referenceId = generateReferenceId();

    const submittedDeliveryData: PendingDelivery = {
      referenceId,
      donorName: formData.donorName,
      donorPhone: formData.donorPhone,
      supplyId: supply.id,
      supplyName: supply.name,
      supplyUnit: supply.unit, // Now properly included
      quantity: parseInt(formData.quantity),
      expectedDate: formData.expectedDate,
      expectedTime: formData.expectedTime,
      status: "submitted" as DeliveryStatus,
      siteId: representative.centerId,
      siteName,
      representative,
      createdAt: new Date().toISOString(),
    };

    setDeliveryData(submittedDeliveryData);
    setShowConfirmation(true);
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  return (
    <>
      {/* Show form by default */}
      {!showConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-amber-50 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-5 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div className="text-white">
                  <h3 className="text-xl font-bold mb-2">
                    Register Self Delivery
                  </h3>
                  <div className="flex items-center gap-2 text-orange-100">
                    <span className="text-lg">{supply.icon}</span>
                    <span className="text-sm">
                      {supply.name} → {siteName}
                    </span>
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

            {/* Form - exact same as before */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* All your existing form fields... */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.donorName}
                  onChange={(e) =>
                    setFormData({ ...formData, donorName: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  value={formData.donorPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, donorPhone: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                  placeholder="9876543210"
                  title="Please enter a valid 10-digit phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Quantity Planning to Donate
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.quantity}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-20 bg-white"
                    placeholder="50"
                  />
                  <span className="absolute right-3 top-3 text-slate-500 text-sm">
                    {supply.unit}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Expected Date
                  </label>
                  <input
                    type="date"
                    required
                    min={getTomorrowDate()}
                    value={formData.expectedDate}
                    onChange={(e) =>
                      setFormData({ ...formData, expectedDate: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Expected Time
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.expectedTime}
                    onChange={(e) =>
                      setFormData({ ...formData, expectedTime: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 px-6 rounded-xl hover:from-orange-700 hover:to-red-700 transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                Register Delivery Intent
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full bg-orange-100 text-orange-700 py-3 px-6 rounded-xl hover:bg-orange-200 transition-colors font-medium"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Show confirmation modal */}
      {showConfirmation && deliveryData && (
        <ConfirmationPromptModal
          deliveryData={deliveryData}
          onClose={onClose} // Close entire flow
        />
      )}
    </>
  );
};

export default SelfDeliveryModal;
