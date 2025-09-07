import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import DistrictInfoPanel from "./DistrictInfoPanel";

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

        svg
          .append("path")
          .datum(district)
          .attr("d", pathData)
          .attr("fill", (d) =>
            selectedDistrict?.properties?.dt_code === d.properties?.dt_code
              ? "#4a90e2"
              : "#e0e0e0"
          )
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 0.5)
          .style("cursor", "pointer")
          .on("mouseover", function (_event, d) {
            if (
              selectedDistrict?.properties?.dt_code !== d.properties?.dt_code
            ) {
              d3.select(this).attr("fill", "#6ba3f5");
            }

            tooltip.style("visibility", "visible").html(`
                <strong>${d.properties.district}</strong><br/>
                State: ${d.properties.st_nm}<br/>
                Code: ${d.properties.dt_code}
              `);
          })
          .on("mousemove", function (event) {
            tooltip
              .style("left", event.pageX + 10 + "px")
              .style("top", event.pageY - 10 + "px");
          })
          .on("mouseout", function (_event, d) {
            if (
              selectedDistrict?.properties?.dt_code !== d.properties?.dt_code
            ) {
              d3.select(this).attr("fill", "#e0e0e0");
            }
            tooltip.style("visibility", "hidden");
          })
          .on("click", function (_event, d) {
            setSelectedDistrict(d);

            // Update all paths to show selection
            svg.selectAll("path").attr("fill", function (pathData) {
              return (pathData as Geometry).properties?.dt_code ===
                d.properties?.dt_code
                ? "#4a90e2"
                : "#e0e0e0";
            });
          });
      });
    });
  }, [mapData, selectedDistrict]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading Punjab map...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-red-500">
          Error: {error}
          <br />
          <small className="text-gray-500 mt-2 block">
            Make sure punjab.json exists in public/projected_maps/
          </small>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen bg-gray-50">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Punjab Districts - Relief Management
      </h2>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="border border-gray-300 rounded-lg overflow-hidden shadow-lg bg-white p-4">
              <svg ref={svgRef} className="w-full h-auto max-w-full"></svg>
              <p className="text-sm text-gray-600 mt-2 text-center">
                Hover over districts for details • Click to select
              </p>
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
