import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

type Coordinates = [number, number];
type Arcs = Coordinates[];

interface Geometry {
  type: string;
  arcs: Arcs;
  properties: {
    dt_code: string;
    district: string;
    st_code: string;
    year: string;
    st_nm: string;
  };
}

interface MapJSON {
  type: string;
  objects: {
    districts: {
      type: string;
      geometries: Geometry[];
    };
  };
  arcs: Arcs[];
  bbox: [number, number, number, number];
}

const PunjabMap = () => {
  const svgRef = useRef(null);
  const [mapData, setMapData] = useState<MapJSON | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

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
        setError(err.message);
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
    const arcToCoordinates = (arcIndex) => {
      const isReversed = arcIndex < 0;
      const realIndex = isReversed ? Math.abs(arcIndex) - 1 : arcIndex;
      const arc = mapData.arcs[realIndex];
      return isReversed ? [...arc].reverse() : arc;
    };

    // Function to build polygon coordinates from arcs
    const buildPolygon = (arcIndices) => {
      const coordinates = [];
      for (const arcIndex of arcIndices) {
        const arcCoords = arcToCoordinates(arcIndex);
        coordinates.push(...arcCoords);
      }
      return coordinates;
    };

    // Convert geometries to SVG paths
    const districts = mapData.objects.districts.geometries;

    districts.forEach((district, index) => {
      const paths: Arcs[] = [];

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
      paths.forEach((coords, pathIndex) => {
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
          .on("mouseover", function (event, d) {
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
          .on("mouseout", function (event, d) {
            if (
              selectedDistrict?.properties?.dt_code !== d.properties?.dt_code
            ) {
              d3.select(this).attr("fill", "#e0e0e0");
            }
            tooltip.style("visibility", "hidden");
          })
          .on("click", function (event, d) {
            console.log("Clicked district:", d.properties);
            setSelectedDistrict(d);

            // Update all paths to show selection
            svg.selectAll("path").attr("fill", function (pathData) {
              return pathData.properties?.dt_code === d.properties?.dt_code
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
        Punjab Districts
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

          {/* Data Panel */}
          <div className="lg:col-span-1">
            <div className="border border-gray-300 rounded-lg shadow-lg bg-white sticky top-4">
              <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                <h3 className="text-lg font-semibold text-gray-800">
                  District Information
                </h3>
              </div>

              <div className="p-4">
                {selectedDistrict ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xl font-bold text-blue-600 mb-2">
                        {selectedDistrict.properties.district}
                      </h4>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="text-sm font-medium text-gray-600">
                          State
                        </div>
                        <div className="text-lg text-gray-900">
                          {selectedDistrict.properties.st_nm}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="text-sm font-medium text-gray-600">
                          District Code
                        </div>
                        <div className="text-lg font-mono text-gray-900">
                          {selectedDistrict.properties.dt_code}
                        </div>
                      </div>

                      {selectedDistrict.properties.st_code && (
                        <div className="bg-gray-50 p-3 rounded-md">
                          <div className="text-sm font-medium text-gray-600">
                            State Code
                          </div>
                          <div className="text-lg font-mono text-gray-900">
                            {selectedDistrict.properties.st_code}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Additional properties if they exist */}
                    {Object.keys(selectedDistrict.properties).length > 3 && (
                      <div className="mt-6">
                        <h5 className="text-sm font-semibold text-gray-700 mb-2">
                          Additional Properties
                        </h5>
                        <div className="bg-gray-50 p-3 rounded-md max-h-32 overflow-y-auto">
                          {Object.entries(selectedDistrict.properties).map(
                            ([key, value]) => {
                              if (
                                [
                                  "district",
                                  "st_nm",
                                  "dt_code",
                                  "st_code",
                                ].includes(key)
                              )
                                return null;
                              return (
                                <div
                                  key={key}
                                  className="flex justify-between text-xs mb-1"
                                >
                                  <span className="text-gray-600 font-medium">
                                    {key}:
                                  </span>
                                  <span className="text-gray-800 ml-2">
                                    {String(value)}
                                  </span>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedDistrict(null)}
                      className="w-full mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
                    >
                      Clear Selection
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <div className="text-4xl mb-4">🗺️</div>
                    <p className="text-lg font-medium mb-2">
                      No District Selected
                    </p>
                    <p className="text-sm">
                      Click on any district on the map to view its information
                      here.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PunjabMap;
