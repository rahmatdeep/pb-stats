import { Truck, MapPin, X } from "lucide-react";
import { useState } from "react";
import SelfDeliveryModal from "./SelfDeliveryModal";
import type { Representative, Supply } from "../../types";

interface DonationOptionsModalProps {
  supply: Supply;
  siteName: string;
  districtName: string;
  representative: Representative;
  onClose: () => void;
}

const DonationOptionsModal = ({
  supply,
  siteName,
  districtName,
  representative,
  onClose,
}: DonationOptionsModalProps) => {
  const [showSelfDelivery, setShowSelfDelivery] = useState(false);

  const handleFindShops = () => {
    const searchQuery = `${supply.name} shops near ${siteName} in ${districtName} Punjab`;
    const googleMapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(
      searchQuery
    )}`;
    window.open(googleMapsUrl, "_blank");
    onClose();
  };

  return (
    <>
      {/* Show donation options by default */}
      {!showSelfDelivery && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-amber-50 rounded-2xl max-w-md w-full shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-5 rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div className="text-white">
                  <h3 className="text-xl font-bold mb-2">
                    Choose Donation Method
                  </h3>
                  <div className="flex items-center gap-2 text-orange-100">
                    <span className="text-lg">{supply.icon}</span>
                    <span className="text-sm">
                      {supply.name} for {siteName}
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

            {/* Options */}
            <div className="p-6 space-y-4">
              {/* Self Delivery Option */}
              <button
                onClick={() => setShowSelfDelivery(true)}
                className="w-full p-6 bg-amber-100 hover:bg-amber-200 border-2 border-amber-300 hover:border-amber-400 rounded-xl transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-full text-white group-hover:scale-110 transition-transform">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-slate-800 mb-1">
                      I'll Deliver Myself
                    </h4>
                    <p className="text-sm text-slate-600">
                      Purchase and bring supplies directly to the relief center
                    </p>
                  </div>
                </div>
              </button>

              {/* Find Shops Option */}
              <button
                onClick={handleFindShops}
                className="w-full p-6 bg-amber-100 hover:bg-amber-200 border-2 border-amber-300 hover:border-amber-400 rounded-xl transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-full text-white group-hover:scale-110 transition-transform">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-slate-800 mb-1">
                      Find Nearby Shops
                    </h4>
                    <p className="text-sm text-slate-600">
                      Get directions to local stores that might have these
                      supplies
                    </p>
                  </div>
                </div>
              </button>

              {/* Cancel */}
              <button
                onClick={onClose}
                className="w-full py-3 px-6 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Show self delivery modal */}
      {showSelfDelivery && (
        <SelfDeliveryModal
          supply={supply}
          siteName={siteName}
          representative={representative}
          onClose={onClose} // Close entire flow when done
        />
      )}
    </>
  );
};

export default DonationOptionsModal;
