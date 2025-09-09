import { useState } from "react";
import {
  Calendar,
  Package,
  AlertTriangle,
  CheckCircle,
  Clock,
  MoveDown,
  X,
  Zap,
  TrendingDown,
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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Calculate daily supply levels accounting for consumption and deliveries
  const calculateDailySupplyForecast = (date: string, dayIndex: number) => {
    const supplyForecast = supplies.map((supply) => {
      // Start with ONLY current stock (no booked quantities)
      let stockLevel = supply.currentQuantity;

      // Subtract consumption for each day up to this date
      stockLevel -= supply.avgConsumptionPerDay * dayIndex;

      // Add deliveries that arrive on or before this date
      const deliveriesUpToDate = confirmedDeliveries.filter(
        (d) => d.supplyId === supply.id && d.expectedDate <= date
      );

      const totalDeliveries = deliveriesUpToDate.reduce(
        (sum, delivery) => sum + delivery.quantity,
        0
      );

      stockLevel += totalDeliveries;

      // Calculate days left from this point
      const projectedStock = Math.max(0, stockLevel);
      const daysLeft =
        projectedStock <= 0
          ? 0
          : Math.floor(projectedStock / supply.avgConsumptionPerDay);

      return {
        ...supply,
        projectedStock,
        daysLeft,
        status:
          daysLeft <= 0
            ? "critical"
            : daysLeft <= 2
            ? "low"
            : daysLeft <= 7
            ? "adequate"
            : "surplus",
      };
    });

    // Get deliveries specifically for this date
    const dayDeliveries = confirmedDeliveries.filter(
      (d) => d.expectedDate === date
    );

    // Group deliveries by supply type for this day
    const supplyDeliveries = dayDeliveries.reduce((acc, delivery) => {
      if (!acc[delivery.supplyId]) acc[delivery.supplyId] = 0;
      acc[delivery.supplyId] += delivery.quantity;
      return acc;
    }, {} as Record<string, number>);

    // Determine overall day status
    let overallStatus = "green";
    let criticalCount = 0;
    let lowCount = 0;

    supplyForecast.forEach((supply) => {
      if (supply.status === "critical") {
        criticalCount++;
        overallStatus = "red";
      } else if (supply.status === "low" && overallStatus !== "red") {
        lowCount++;
        overallStatus = "yellow";
      }
    });

    return {
      status: overallStatus,
      deliveries: dayDeliveries,
      totalExpected: dayDeliveries.length,
      supplyForecast,
      criticalCount,
      lowCount,
      supplyDeliveries,
      mostCritical: supplyForecast.reduce<(typeof supplyForecast)[0] | null>(
        (most, current) =>
          current.daysLeft < (most?.daysLeft || Infinity) ? current : most,
        null
      ),
    };
  };

  // Generate next 7 days with forecasting
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
        isToday: i === 0,
        dayIndex: i,
        ...calculateDailySupplyForecast(dateStr, i),
      });
    }
    return days;
  };

  const next7Days = getNext7Days();

  const getStatusColor = (
    status: string,
    isToday: boolean,
    isSelected: boolean
  ) => {
    let baseColor =
      {
        green: "bg-green-100 border-green-300 text-green-800",
        yellow: "bg-yellow-100 border-yellow-300 text-yellow-800",
        red: "bg-red-100 border-red-300 text-red-800",
        default: "bg-gray-100 border-gray-300 text-gray-800",
      }[status] || "bg-gray-100 border-gray-300 text-gray-800";

    if (isSelected) {
      baseColor += " ring-2 ring-blue-400 bg-opacity-80";
    } else if (isToday) {
      baseColor += " ring-2 ring-orange-400";
    }

    return baseColor;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "green":
        return <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "yellow":
        return <Clock className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "red":
        return <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />;
      default:
        return <Package className="w-3 h-3 sm:w-4 sm:h-4" />;
    }
  };

  const selectedDay = selectedDate
    ? next7Days.find((day) => day.date === selectedDate)
    : null;

  return (
    <div className="bg-white rounded-lg shadow-lg flex flex-col sm:rounded-2xl sm:max-h-[600px]">
      {/* Panel Header - Mobile First */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 px-3 py-3 rounded-t-lg flex-shrink-0 sm:px-6 sm:py-4 sm:rounded-t-2xl">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Calendar className="w-5 h-5 text-white sm:w-6 sm:h-6" />
            <h2 className="text-lg font-bold text-white sm:text-xl">
              Weekly Supply Forecast
            </h2>
          </div>
          <div className="text-orange-100 text-xs sm:text-sm">Next 7 days</div>
        </div>
        <p className="text-orange-100 text-xs mt-1 sm:text-sm">
          <span className="sm:hidden">Daily supply tracking</span>
          <span className="hidden sm:inline">
            Daily supply levels with consumption and delivery forecasting
          </span>
        </p>
      </div>

      {/* Legend - Mobile First */}
      <div className="px-3 pt-2 pb-2 border-b border-gray-100 flex-shrink-0 sm:px-6 sm:pt-4">
        <div className="flex flex-wrap items-center gap-3 text-xs sm:gap-6">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full sm:w-3 sm:h-3"></div>
            <span className="text-slate-600">Good</span>
            <span className="hidden sm:inline text-slate-600">Supplies</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full sm:w-3 sm:h-3"></div>
            <span className="text-slate-600">Low</span>
            <span className="hidden sm:inline text-slate-600">Supplies</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-400 rounded-full sm:w-3 sm:h-3"></div>
            <span className="text-slate-600">Critical</span>
            <span className="hidden sm:inline text-slate-600">Shortages</span>
          </div>
        </div>
      </div>

      {/* Scrollable Content - Mobile First */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 sm:p-6">
          {/* Calendar Grid - Mobile First: 2 cols, Desktop: 7 cols */}
          <div className="grid grid-cols-7 gap-2 mb-4 sm:gap-2 sm:mb-6">
            {next7Days.map((day) => (
              <div
                key={day.date}
                onClick={() =>
                  setSelectedDate(day.date === selectedDate ? null : day.date)
                }
                className={`p-2 rounded-lg border transition-all cursor-pointer hover:scale-105 sm:rounded-xl sm:border-2 ${getStatusColor(
                  day.status,
                  day.isToday,
                  day.date === selectedDate
                )} relative`}
              >
                {/* Today indicator */}
                {day.isToday && (
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-500 rounded-full sm:-top-1 sm:-right-1 sm:w-3 sm:h-3"></div>
                )}

                {/* Day Header */}
                <div className="text-center mb-1">
                  <div className="text-xs font-medium opacity-70">
                    {day.dayName}
                  </div>
                  <div className="text-sm font-bold sm:text-lg">
                    {day.dayNum}
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                  {getStatusIcon(day.status)}

                  {/* Most Critical Supply */}
                  {day.mostCritical && (
                    <div className="text-xs bg-white bg-opacity-70 px-1 py-0.5 rounded-full text-center min-w-0">
                      <div className="truncate">
                        <span className="sm:hidden">
                          {day.mostCritical.icon}
                        </span>
                        <span className="hidden sm:inline">
                          {day.mostCritical.icon} {day.mostCritical.daysLeft}d
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Critical/Low Count - Mobile optimized */}
                  {(day.criticalCount > 0 || day.lowCount > 0) && (
                    <div className="text-xs bg-white bg-opacity-70 px-1 py-0.5 rounded-full">
                      {day.criticalCount > 0 && (
                        <span className="text-red-600">
                          🔴{day.criticalCount}
                        </span>
                      )}
                      {day.lowCount > 0 && (
                        <span className="text-yellow-600">
                          🟡{day.lowCount}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Delivery Count */}
                  {day.totalExpected > 0 && (
                    <div className="flex items-center gap-0 text-xs bg-white bg-opacity-70 px-1 py-0.5 rounded-full">
                      {day.totalExpected}{" "}
                      <MoveDown className="w-2 h-2 sm:w-3 sm:h-3" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Selected Day Details - Mobile optimized */}
          {selectedDay && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg sm:mb-6 sm:p-4 sm:border-2 sm:rounded-xl">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="font-semibold text-blue-800 flex items-center gap-2 text-sm sm:text-base">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="sm:hidden">
                    {selectedDay.dayName} {selectedDay.dayNum}
                  </span>
                  <span className="hidden sm:inline">
                    {selectedDay.dayName}, {selectedDay.dayNum}th - Supply
                    Forecast
                  </span>
                </h3>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Supply Status for Selected Day */}
              <div className="space-y-2 mb-3 sm:space-y-3 sm:mb-4">
                <h4 className="font-medium text-blue-800 flex items-center gap-2 text-sm sm:text-base">
                  <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="sm:hidden">
                    Day {selectedDay.dayIndex + 1} Forecast
                  </span>
                  <span className="hidden sm:inline">
                    Projected Supply Levels (Day {selectedDay.dayIndex + 1})
                  </span>
                </h4>

                {/* Scrollable Supply Forecast */}
                <div className="grid gap-2 max-h-32 overflow-y-auto sm:max-h-48">
                  {selectedDay.supplyForecast.map((supply) => (
                    <div
                      key={supply.id}
                      className={`p-2 rounded-lg border flex items-center justify-between sm:p-3 ${
                        supply.status === "critical"
                          ? "bg-red-50 border-red-200"
                          : supply.status === "low"
                          ? "bg-yellow-50 border-yellow-200"
                          : "bg-green-50 border-green-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1 sm:gap-3">
                        <span className="text-lg sm:text-xl">
                          {supply.icon}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 text-sm truncate sm:text-base">
                            {supply.name}
                          </p>
                          <p className="text-xs text-slate-600 sm:text-sm">
                            <span className="sm:hidden">
                              {supply.projectedStock}
                            </span>
                            <span className="hidden sm:inline">
                              Projected: {supply.projectedStock} {supply.unit}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`font-bold text-sm sm:text-lg ${
                            supply.status === "critical"
                              ? "text-red-700"
                              : supply.status === "low"
                              ? "text-yellow-700"
                              : "text-green-700"
                          }`}
                        >
                          {supply.daysLeft}d
                        </div>
                        <div className="text-xs text-slate-500">
                          <span className="sm:hidden">
                            {supply.status === "critical"
                              ? "OUT"
                              : supply.status === "low"
                              ? "LOW"
                              : "OK"}
                          </span>
                          <span className="hidden sm:inline">
                            {supply.status === "critical"
                              ? "OUT OF STOCK"
                              : supply.status === "low"
                              ? "Running Low"
                              : "Good Supply"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deliveries for Selected Day */}
              {selectedDay.deliveries.length > 0 && (
                <div className="space-y-2 sm:space-y-3">
                  <h4 className="font-medium text-blue-800 flex items-center gap-2 text-sm sm:text-base">
                    <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="sm:hidden">
                      Deliveries ({selectedDay.deliveries.length})
                    </span>
                    <span className="hidden sm:inline">
                      Deliveries Arriving ({selectedDay.deliveries.length})
                    </span>
                  </h4>

                  {/* Scrollable Deliveries List */}
                  <div className="space-y-2 max-h-32 overflow-y-auto sm:max-h-40">
                    {selectedDay.deliveries.map((delivery) => {
                      const supply = supplies.find(
                        (s) => s.id === delivery.supplyId
                      );
                      return (
                        <div
                          key={delivery.referenceId}
                          className="bg-white p-2 rounded-lg border border-blue-200 sm:p-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0 flex-1 sm:gap-3">
                              <span className="text-base sm:text-lg">
                                {supply?.icon}
                              </span>
                              <div className="min-w-0">
                                <p className="font-medium text-slate-800 text-sm truncate sm:text-base">
                                  {delivery.donorName}
                                </p>
                                <p className="text-xs text-slate-600 truncate sm:text-sm">
                                  {delivery.quantity} {delivery.supplyUnit}
                                  <span className="hidden sm:inline">
                                    {" "}
                                    at {delivery.expectedTime}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-green-700 text-sm sm:text-base">
                                +{delivery.quantity}
                              </p>
                              <p className="text-xs text-slate-500 truncate max-w-[60px] sm:max-w-none">
                                {supply?.name}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Today's Actions - Mobile First */}
          {(!selectedDate ||
            selectedDate === new Date().toISOString().split("T")[0]) && (
            <div>
              <h3 className="font-semibold text-slate-800 mb-2 flex items-center gap-2 text-sm sm:mb-3 sm:text-base">
                <Zap className="w-3 h-3 text-orange-500 sm:w-4 sm:h-4" />
                <span className="sm:hidden">Today's Actions</span>
                <span className="hidden sm:inline">
                  Today's Actions Required
                </span>
              </h3>

              {/* Critical supplies today */}
              {next7Days[0]?.supplyForecast.filter(
                (s) => s.status === "critical"
              ).length > 0 && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg sm:mb-4 sm:p-3">
                  <h4 className="font-medium text-red-800 mb-2 text-sm sm:text-base">
                    <span className="sm:hidden">🚨 Critical (0d left)</span>
                    <span className="hidden sm:inline">
                      🚨 Critical Supplies (0 days left)
                    </span>
                  </h4>
                  <div className="space-y-1">
                    {next7Days[0].supplyForecast
                      .filter((s) => s.status === "critical")
                      .map((supply) => (
                        <p
                          key={supply.id}
                          className="text-xs text-red-700 sm:text-sm"
                        >
                          {supply.icon} {supply.name}
                          <span className="hidden sm:inline">
                            : {supply.projectedStock} {supply.unit} remaining
                          </span>
                        </p>
                      ))}
                  </div>
                </div>
              )}

              {/* Today's deliveries - Scrollable */}
              <div className="max-h-32 overflow-y-auto sm:max-h-48">
                {confirmedDeliveries.filter((d) => {
                  const today = new Date().toISOString().split("T")[0];
                  return d.expectedDate === today;
                }).length === 0 ? (
                  <p className="text-slate-500 text-xs sm:text-sm">
                    No deliveries expected today
                  </p>
                ) : (
                  <div className="space-y-2">
                    {confirmedDeliveries
                      .filter(
                        (d) =>
                          d.expectedDate ===
                          new Date().toISOString().split("T")[0]
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
                            className="flex flex-col gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200 sm:flex-row sm:items-center sm:justify-between sm:p-3"
                          >
                            <div className="flex items-center gap-2 min-w-0 sm:gap-3">
                              <span className="font-mono text-xs font-bold text-orange-600">
                                #{delivery.referenceId}
                              </span>
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-800 text-sm truncate">
                                  {delivery.donorName}
                                </p>
                                <p className="text-xs text-slate-600 truncate sm:text-sm">
                                  {supply?.icon} {delivery.quantity}{" "}
                                  {delivery.supplyUnit}
                                  <span className="hidden sm:inline">
                                    {" "}
                                    of {delivery.supplyName}
                                  </span>
                                </p>
                                {weeklyStatus && supply && (
                                  <p className="text-xs text-slate-500">
                                    <span className="sm:hidden">
                                      +
                                      {Math.floor(
                                        delivery.quantity /
                                          supply.avgConsumptionPerDay
                                      )}
                                      d
                                    </span>
                                    <span className="hidden sm:inline">
                                      Will extend supply by: +
                                      {Math.floor(
                                        delivery.quantity /
                                          supply.avgConsumptionPerDay
                                      )}
                                      d
                                    </span>
                                  </p>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() =>
                                onConfirmActualDelivery(delivery.referenceId)
                              }
                              className="bg-green-500 hover:bg-green-600 text-white py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors sm:py-1 sm:text-sm"
                            >
                              <Package className="w-3 h-3" />
                              <span className="sm:hidden">Delivered</span>
                              <span className="hidden sm:inline">
                                Mark Delivered
                              </span>
                            </button>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryCalendarPanel;
