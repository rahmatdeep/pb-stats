import {
  Calendar,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  MoveDown,
} from "lucide-react";
import type { PendingDelivery, Supply } from "../../types";
import { calculateWeeklyStatus } from "../../utils/weeklySupplyUtils";

interface DeliveryCalendarPanelProps {
  confirmedDeliveries: PendingDelivery[];
  supplies: Supply[];
  onConfirmActualDelivery: (deliveryId: string) => void;
}

const DeliveryCalendarPanel = ({
  confirmedDeliveries,
  supplies,
  onConfirmActualDelivery,
}: DeliveryCalendarPanelProps) => {
  // Calculate supply status for each day based on weekly consumption
  const calculateDaySupplyStatus = (date: string) => {
    const dayDeliveries = confirmedDeliveries.filter(
      (d) => d.expectedDate === date
    );

    // Group deliveries by supply type for this day
    const supplyDeliveries = dayDeliveries.reduce((acc, delivery) => {
      if (!acc[delivery.supplyId]) acc[delivery.supplyId] = 0;
      acc[delivery.supplyId] += delivery.quantity;
      return acc;
    }, {} as Record<string, number>);

    let totalStatus = "green"; // Start optimistic

    // Check each supply type using weekly logic
    supplies.forEach((supply) => {
      const expectedDelivery = supplyDeliveries[supply.id] || 0;
      const weeklyStatus = calculateWeeklyStatus(supply);
      const avgConsumptionPerDay = supply.avgConsumptionPerDay;

      if (weeklyStatus.status === "critical" && expectedDelivery === 0) {
        totalStatus = "red"; // Critical supply with no delivery
      } else if (
        weeklyStatus.status === "low" &&
        expectedDelivery < avgConsumptionPerDay &&
        totalStatus !== "red"
      ) {
        totalStatus = "yellow"; // Low supply with insufficient delivery
      }
    });

    return {
      status: totalStatus,
      deliveries: dayDeliveries,
      totalExpected: dayDeliveries.length,
    };
  };

  // Generate next 7 days
  const getNext7Days = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      days.push({
        date: dateStr,
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        dayNum: date.getDate(),
        ...calculateDaySupplyStatus(dateStr),
      });
    }
    return days;
  };

  const next7Days = getNext7Days();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "green":
        return "bg-green-100 border-green-300 text-green-800";
      case "yellow":
        return "bg-yellow-100 border-yellow-300 text-yellow-800";
      case "red":
        return "bg-red-100 border-red-300 text-red-800";
      default:
        return "bg-gray-100 border-gray-300 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "green":
        return <CheckCircle className="w-4 h-4" />;
      case "yellow":
        return <Clock className="w-4 h-4" />;
      case "red":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg h-fit">
      {/* Panel Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">
              Weekly Supply Calendar
            </h2>
          </div>
          <div className="text-orange-100 text-sm">Next 7 days</div>
        </div>
        <p className="text-orange-100 text-sm mt-1">
          Track deliveries against weekly consumption targets
        </p>
      </div>

      {/* Legend */}
      <div className="px-6 pt-4 pb-2 border-b border-gray-100">
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="text-slate-600">Adequate Supply</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <span className="text-slate-600">Low Supply</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span className="text-slate-600">Critical Gap</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        <div className="grid grid-cols-7 gap-2">
          {next7Days.map((day) => (
            <div
              key={day.date}
              className={`p-3 rounded-xl border-2 transition-all cursor-pointer hover:scale-105 ${getStatusColor(
                day.status
              )}`}
            >
              {/* Day Header */}
              <div className="text-center mb-2">
                <div className="text-xs font-medium opacity-70">
                  {day.dayName}
                </div>
                <div className="text-lg font-bold">{day.dayNum}</div>
              </div>

              {/* Status Indicator */}
              <div className="flex flex-col items-center gap-1">
                {getStatusIcon(day.status)}

                {/* Delivery Count */}
                {day.totalExpected > 0 && (
                  <div className="flex items-center gap-0 text-sm bg-white bg-opacity-70 px-2 py-1 rounded-full">
                    {day.totalExpected} <MoveDown className="w-4 h-3" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Deliveries for Today */}
        <div className="mt-6">
          <h3 className="font-semibold text-slate-800 mb-3">
            Today's Deliveries
          </h3>
          {confirmedDeliveries.filter((d) => {
            const today = new Date().toISOString().split("T")[0];
            return d.expectedDate === today;
          }).length === 0 ? (
            <p className="text-slate-500 text-sm">
              No deliveries expected today
            </p>
          ) : (
            <div className="space-y-2">
              {confirmedDeliveries
                .filter(
                  (d) =>
                    d.expectedDate === new Date().toISOString().split("T")[0]
                )
                .map((delivery) => {
                  const supply = supplies.find(
                    (s) => s.id === delivery.supplyId
                  );
                  const weeklyStatus = supply
                    ? calculateWeeklyStatus(supply)
                    : null;

                  return (
                    <div
                      key={delivery.referenceId}
                      className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold text-orange-600">
                          #{delivery.referenceId}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-800">
                            {delivery.donorName}
                          </p>
                          <p className="text-sm text-slate-600">
                            {delivery.quantity} {delivery.supplyUnit} of{" "}
                            {delivery.supplyName}
                          </p>
                          {weeklyStatus && (
                            <p className="text-xs text-slate-500">
                              Current: {weeklyStatus.daysOfSupply}d supply left
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          onConfirmActualDelivery(delivery.referenceId)
                        }
                        className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                      >
                        <Package className="w-3 h-3" />
                        Mark Delivered
                      </button>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryCalendarPanel;
