import { useEffect, useRef, useState } from "react";
import { MapPin, Loader2, AlertCircle } from "lucide-react";
import * as d3 from "d3";
import DistrictInfoPanel from "./DistrictInfoPanel";
import { mockReliefData } from "../assets/mockData";

type Coordinates = [number, number];
type Line = Coordinates[];
type GlobalArcs = Line[];
type ArcIndex = number;
type Ring = ArcIndex[];
type PolygonGeometry = Ring[];
type MultiPolygonGeometry = PolygonGeometry[];

interface BaseGeometry {
  properties: {
    dt_code: string;
    district: string;
    st_code: string;
    year: string;
    st_nm: string;
  };
}

interface Polygon extends BaseGeometry {
  type: "Polygon";
  arcs: PolygonGeometry;
}

interface MultiPolygon extends BaseGeometry {
  type: "MultiPolygon";
  arcs: MultiPolygonGeometry;
}

export type Geometry = Polygon | MultiPolygon;

interface MapJSON {
  type: string;
  objects: {
    districts: {
      type: string;
      geometries: Geometry[];
    };
  };
  arcs: GlobalArcs;
  bbox: [number, number, number, number];
}

const PunjabMap = () => {
  const svgRef = useRef(null);
  const [mapData, setMapData] = useState<MapJSON | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<Geometry | null>(
    null
  );

  const hasReliefData = (districtCode: string): boolean => {
    return mockReliefData.some((data) => data.districtCode === districtCode);
  };

  useEffect(() => {
    const loadMapData = async () => {
      try {
        setLoading(true);

        const response = await fetch("/projected_maps/punjab.json");
        if (!response.ok) {
          throw new Error(`Failed to load map: ${response.status}`);
        }

        const topology: MapJSON = await response.json();

        if (!topology.objects?.districts?.geometries) {
          throw new Error("Invalid map data structure");
        }

        setMapData(topology);
        setError(null);
      } catch (err) {
        console.error("Error loading map:", err);
        setError((err as Error)?.message ?? String(err));
      } finally {
        setLoading(false);
      }
    };

    loadMapData();
  }, []);

  useEffect(() => {
    if (!mapData) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Set up dimensions from the bbox or use defaults
    const bbox = mapData.bbox || [0, 0, 432, 488];
    const width = bbox[2] - bbox[0];
    const height = bbox[3] - bbox[1];

    // Use viewBox for scaling
    const maxWidth = 400;
    const displayWidth = Math.min(width, maxWidth);
    const displayHeight = (height * displayWidth) / width;

    svg
      .attr("width", displayWidth)
      .attr("height", displayHeight)
      .attr("viewBox", `0 0 ${width} ${height}`);

    // Create tooltip
    const tooltip = d3
      .select("body")
      .selectAll(".map-tooltip")
      .data([0])
      .join("div")
      .attr("class", "map-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("z-index", "1000")
      .style("max-width", "200px");

    // Function to convert arc indices to coordinates
    const arcToCoordinates = (arcIndex: ArcIndex) => {
      const isReversed = arcIndex < 0;
      const realIndex = isReversed ? Math.abs(arcIndex) - 1 : arcIndex;
      const arc = mapData.arcs[realIndex];
      return isReversed ? [...arc].reverse() : arc;
    };

    // Function to build polygon coordinates from arcs
    const buildPolygon = (arcIndices: Ring) => {
      const coordinates = [];
      for (const arcIndex of arcIndices) {
        const arcCoords = arcToCoordinates(arcIndex);
        coordinates.push(...arcCoords);
      }
      return coordinates;
    };

    // Convert geometries to SVG paths
    const districts: Geometry[] = mapData.objects.districts.geometries;

    districts.forEach((district, _index) => {
      const paths: GlobalArcs = [];

      if (district.type === "Polygon") {
        district.arcs.forEach((ring) => {
          const coords = buildPolygon(ring);
          paths.push(coords);
        });
      } else if (district.type === "MultiPolygon") {
        district.arcs.forEach((polygon) => {
          polygon.forEach((ring) => {
            const coords = buildPolygon(ring);
            paths.push(coords);
          });
        });
      }

      // Create SVG path for each polygon
      paths.forEach((coords, _pathIndex) => {
        if (coords.length === 0) return;

        const pathData = `M${coords.map((d) => d.join(",")).join("L")}Z`;

        // Check if this district has relief data
        const hasRelief = hasReliefData(district.properties.dt_code);
        const isSelected =
          selectedDistrict?.properties?.dt_code ===
          district.properties?.dt_code;

        svg
          .append("path")
          .datum(district)
          .attr("d", pathData)
          .attr("fill", () => {
            if (isSelected) return "#ea580c"; // Selected color (dark orange)
            if (hasRelief) return "#fdba74"; // Has relief data (medium orange)
            return "#fed7aa"; // No relief data (light orange)
          })
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 0.5)
          .style("cursor", "pointer")
          .on("mouseover", function (_event, d) {
            const districtIsSelected =
              selectedDistrict?.properties?.dt_code === d.properties?.dt_code;

            if (!districtIsSelected) {
              d3.select(this).attr("fill", "#fb923c");
            }

            tooltip.style("visibility", "visible").html(`
                <strong>${d.properties.district}</strong><br/>
                Code: ${d.properties.dt_code}
              `);
          })
          .on("mousemove", function (event) {
            tooltip
              .style("left", event.pageX + 10 + "px")
              .style("top", event.pageY - 10 + "px");
          })
          .on("mouseout", function (_event, d) {
            const districtHasRelief = hasReliefData(d.properties.dt_code);
            const districtIsSelected =
              selectedDistrict?.properties?.dt_code === d.properties?.dt_code;

            if (!districtIsSelected) {
              d3.select(this).attr(
                "fill",
                districtHasRelief ? "#fdba74" : "#fed7aa"
              );
            }
            tooltip.style("visibility", "hidden");
          })
          .on("click", function (_event, d) {
            setSelectedDistrict(d);

            // Update all paths to show selection
            svg.selectAll("path").attr("fill", function (pathData) {
              return (pathData as Geometry).properties?.dt_code ===
                d.properties?.dt_code
                ? "#ea580c"
                : "#fed7aa";
            });
          });
      });
    });
  }, [mapData, selectedDistrict]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br  from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-lg font-medium text-slate-700">
            Loading Punjab map...
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Please wait while we prepare the relief data
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br  from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">
            Map Loading Error
          </h3>
          <p className="text-red-600 mb-2">{error}</p>
          <p className="text-sm text-slate-500">
            Make sure punjab.json exists in public/projected_maps/
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br  from-amber-50 to-orange-100">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-amber-50 rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  <h2 className="text-lg font-semibold text-slate-800">
                    Punjab District Map
                  </h2>
                </div>

                <div className="bg-orange-50 rounded-xl p-4">
                  <svg ref={svgRef} className="w-full h-auto max-w-full"></svg>
                </div>
                <div className="mt-2 p-4 bg-gradient-to-r from-orange-100 to-amber-100 rounded-xl">
                  <div className="text-sm text-slate-700 text-center space-y-1">
                    <p>
                      💡 <strong>Tap any district</strong> to view relief sites
                      and supply information
                    </p>
                    <div className="flex items-center justify-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-orange-300 rounded border border-white"></div>
                        <span>Has Relief Centers</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-orange-200 rounded border border-white"></div>
                        <span>No Relief Data</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* District Info Panel */}
          <div className="lg:col-span-1">
            <DistrictInfoPanel
              selectedDistrict={selectedDistrict}
              onClearSelection={() => setSelectedDistrict(null)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PunjabMap;
