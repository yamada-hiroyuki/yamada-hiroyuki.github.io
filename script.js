// Initialize the Leaflet map
const map = L.map("map", {
    maxZoom: 11 // Restrict maximum zoom level here as well
  }).setView([38.88989877057183, -77.03688209146726], 7); // Centered and zoomed to flight track extent

// Add the Humanitarian OpenStreetMap tile layer
L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
  maxZoom: 11,
  minZoom: 7,
  attribution: '© OpenStreetMap contributors, Humanitarian OpenStreetMap Team'
}).addTo(map);

// Add an SVG overlay for D3.js
const svgOverlay = d3.select(map.getPanes().overlayPane).append("svg");
const g = svgOverlay.append("g").attr("class", "leaflet-zoom-hide");

// Projection function for lat/lon to Leaflet points
function projectPoint(lat, lon) {
  const point = map.latLngToLayerPoint(L.latLng(lat, lon));
  return [point.x, point.y];
}

// Load flight track data
d3.csv("/data/flight-track.csv").then(flightData => {
  const flightTrack = flightData.map(d => ({
    time: d.Time,
    lat: +d.Latitude,
    lon: +d.Longitude,
  }));

  // Generate the flight path
  const line = d3.line()
    .x(d => projectPoint(d.lat, d.lon)[0])
    .y(d => projectPoint(d.lat, d.lon)[1]);

  // Append the flight path
  g.append("path")
    .datum(flightTrack)
    .attr("class", "flight-path")
    .attr("d", line)
    .attr("fill", "none")
    .attr("stroke", "lime")
    .attr("stroke-width", 2);

  // Append pips
  flightTrack.forEach(point => {
    const [x, y] = projectPoint(point.lat, point.lon);
    g.append("circle")
      .attr("cx", x)
      .attr("cy", y)
      .attr("r", 5)
      .attr("fill", "lightgrey")
      .on("mouseover", (event) => {
        const infoBox = d3.select("#info-box");
        infoBox.style("display", "block")
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 50}px`);
        d3.select("#info-image").attr("src", "/data/images/image-placeholder.jpg");
        d3.select("#info-text").text(`Time: ${point.time}`);
      });
  });

  // Redraw path and pips on map zoom/move
  const redraw = () => {
    g.selectAll("path.flight-path").attr("d", line);
    g.selectAll("circle")
      .attr("cx", d => projectPoint(d.lat, d.lon)[0])
      .attr("cy", d => projectPoint(d.lat, d.lon)[1]);
  };

  map.on("zoom", redraw);
  map.on("move", redraw);
});

// Close the info box when clicking outside
d3.select("body").on("click", () => {
  d3.select("#info-box").style("display", "none");
});
