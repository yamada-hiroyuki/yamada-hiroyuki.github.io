// Initialize the Leaflet map
const map = L.map("map", { maxZoom: 11 }).setView([38.8945,-77.0104], 7);

L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
  maxZoom: 11,
  minZoom: 7,
  attribution: '© OpenStreetMap contributors, Humanitarian OpenStreetMap Team',
}).addTo(map);

// Create an SVG layer within Leaflet's overlay pane
const svgOverlay = d3.select(map.getPanes().overlayPane).append("svg");
const g = svgOverlay.append("g").attr("class", "leaflet-zoom-hide");

// Projection function: convert lat/lon to Leaflet's layer points
function projectPoint(lat, lon) {
  const point = map.latLngToLayerPoint(L.latLng(lat, lon));
  return [point.x, point.y];
}

// Update the SVG layer's bounds to match the map view
function updateSVGBounds() {
  const bounds = map.getBounds();
  const topLeft = map.latLngToLayerPoint(bounds.getNorthWest());
  const bottomRight = map.latLngToLayerPoint(bounds.getSouthEast());

  svgOverlay
    .attr("width", bottomRight.x - topLeft.x)
    .attr("height", bottomRight.y - topLeft.y)
    .style("left", `${topLeft.x}px`)
    .style("top", `${topLeft.y}px`);

  g.attr("transform", `translate(${-topLeft.x}, ${-topLeft.y})`);
}

// Preprocess flight track data
const flightTrack = [
  { "Time": "8:47:58 PM", "Latitude": "35.2251", "Longitude": "-80.9359" },
  { "Time": "8:48:14 PM", "Latitude": "35.2361", "Longitude": "-80.935" },
  { "Time": "8:48:30 PM", "Latitude": "35.2503", "Longitude": "-80.9296" },
  { "Time": "8:48:46 PM", "Latitude": "35.2631", "Longitude": "-80.924" },
  { "Time": "8:49:02 PM", "Latitude": "35.2807", "Longitude": "-80.9163" },
  { "Time": "8:49:20 PM", "Latitude": "35.299", "Longitude": "-80.9073" },
  { "Time": "8:49:38 PM", "Latitude": "35.3136", "Longitude": "-80.8889" },
  { "Time": "8:49:56 PM", "Latitude": "35.3166", "Longitude": "-80.8623" },
  { "Time": "8:50:26 PM", "Latitude": "35.3141", "Longitude": "-80.8132" },
  { "Time": "8:50:56 PM", "Latitude": "35.3132", "Longitude": "-80.7664" },
  { "Time": "8:51:41 PM", "Latitude": "35.3131", "Longitude": "-80.6853" },
  { "Time": "8:52:11 PM", "Latitude": "35.3123", "Longitude": "-80.6257" },
  { "Time": "8:52:41 PM", "Latitude": "35.3109", "Longitude": "-80.5614" },
  { "Time": "8:53:11 PM", "Latitude": "35.3092", "Longitude": "-80.4917" },
  { "Time": "8:53:41 PM", "Latitude": "35.3075", "Longitude": "-80.4219" },
  { "Time": "8:54:11 PM", "Latitude": "35.3059", "Longitude": "-80.3501" },
  { "Time": "8:54:41 PM", "Latitude": "35.3042", "Longitude": "-80.2744" },
  { "Time": "8:55:11 PM", "Latitude": "35.3024", "Longitude": "-80.1975" },
  { "Time": "8:55:29 PM", "Latitude": "35.3015", "Longitude": "-80.1494" },
  { "Time": "8:55:48 PM", "Latitude": "35.3053", "Longitude": "-80.0991" },
  { "Time": "8:56:05 PM", "Latitude": "35.3129", "Longitude": "-80.0576" },
  { "Time": "8:56:46 PM", "Latitude": "35.3417", "Longitude": "-79.9566" },
  { "Time": "8:57:16 PM", "Latitude": "35.3628", "Longitude": "-79.8842" },
  { "Time": "8:57:46 PM", "Latitude": "35.3834", "Longitude": "-79.8127" },
  { "Time": "8:58:16 PM", "Latitude": "35.404", "Longitude": "-79.7416" },
  { "Time": "8:58:46 PM", "Latitude": "35.4255", "Longitude": "-79.6685" },
  { "Time": "8:59:16 PM", "Latitude": "35.4451", "Longitude": "-79.601" },
  { "Time": "8:59:46 PM", "Latitude": "35.4661", "Longitude": "-79.5285" },
  { "Time": "9:00:16 PM", "Latitude": "35.486", "Longitude": "-79.4591" },
  { "Time": "9:00:46 PM", "Latitude": "35.5063", "Longitude": "-79.3885" },
  { "Time": "9:01:16 PM", "Latitude": "35.5262", "Longitude": "-79.3185" },
  { "Time": "9:01:46 PM", "Latitude": "35.5457", "Longitude": "-79.2503" },
  { "Time": "9:02:16 PM", "Latitude": "35.5654", "Longitude": "-79.181" },
  { "Time": "9:02:32 PM", "Latitude": "35.5766", "Longitude": "-79.143" },
  { "Time": "9:02:54 PM", "Latitude": "35.5966", "Longitude": "-79.0966" },
  { "Time": "9:03:18 PM", "Latitude": "35.6238", "Longitude": "-79.0549" },
  { "Time": "9:03:40 PM", "Latitude": "35.6535", "Longitude": "-79.0213" },
  { "Time": "9:04:10 PM", "Latitude": "35.6928", "Longitude": "-78.9788" },
  { "Time": "9:04:40 PM", "Latitude": "35.7323", "Longitude": "-78.936" },
  { "Time": "9:05:10 PM", "Latitude": "35.7736", "Longitude": "-78.8912" },
  { "Time": "9:05:40 PM", "Latitude": "35.8133", "Longitude": "-78.848" },
  { "Time": "9:06:10 PM", "Latitude": "35.8548", "Longitude": "-78.8027" },
  { "Time": "9:06:40 PM", "Latitude": "35.8954", "Longitude": "-78.7589" },
  { "Time": "9:07:10 PM", "Latitude": "35.9387", "Longitude": "-78.7139" },
  { "Time": "9:07:40 PM", "Latitude": "35.9831", "Longitude": "-78.6677" },
  { "Time": "9:08:10 PM", "Latitude": "36.0263", "Longitude": "-78.6221" },
  { "Time": "9:08:40 PM", "Latitude": "36.0709", "Longitude": "-78.5748" },
  { "Time": "9:09:10 PM", "Latitude": "36.1133", "Longitude": "-78.5303" },
  { "Time": "9:09:40 PM", "Latitude": "36.1588", "Longitude": "-78.4826" },
  { "Time": "9:10:10 PM", "Latitude": "36.2069", "Longitude": "-78.4317" },
  { "Time": "9:10:40 PM", "Latitude": "36.2535", "Longitude": "-78.3821" },
  { "Time": "9:11:10 PM", "Latitude": "36.3029", "Longitude": "-78.3294" },
  { "Time": "9:11:40 PM", "Latitude": "36.3498", "Longitude": "-78.2795" },
  { "Time": "9:11:58 PM", "Latitude": "36.3801", "Longitude": "-78.2468" },
  { "Time": "9:12:35 PM", "Latitude": "36.4383", "Longitude": "-78.1787" },
  { "Time": "9:13:05 PM", "Latitude": "36.487", "Longitude": "-78.1215" },
  { "Time": "9:13:35 PM", "Latitude": "36.5334", "Longitude": "-78.0665" },
  { "Time": "9:14:05 PM", "Latitude": "36.5818", "Longitude": "-78.0094" },
  { "Time": "9:14:35 PM", "Latitude": "36.6281", "Longitude": "-77.9549" },
  { "Time": "9:15:06 PM", "Latitude": "36.6776", "Longitude": "-77.8964" },
  { "Time": "9:15:36 PM", "Latitude": "36.7261", "Longitude": "-77.8389" },
  { "Time": "9:16:06 PM", "Latitude": "36.7708", "Longitude": "-77.7856" },
  { "Time": "9:16:36 PM", "Latitude": "36.8194", "Longitude": "-77.728" },
  { "Time": "9:17:06 PM", "Latitude": "36.8646", "Longitude": "-77.6742" },
  { "Time": "9:17:36 PM", "Latitude": "36.9123", "Longitude": "-77.6176" },
  { "Time": "9:18:06 PM", "Latitude": "36.9564", "Longitude": "-77.5653" },
  { "Time": "9:18:36 PM", "Latitude": "37.0027", "Longitude": "-77.5101" },
  { "Time": "9:19:06 PM", "Latitude": "37.0495", "Longitude": "-77.454" },
  { "Time": "9:19:22 PM", "Latitude": "37.074", "Longitude": "-77.425" },
  { "Time": "9:19:43 PM", "Latitude": "37.1091", "Longitude": "-77.3936" },
  { "Time": "9:20:03 PM", "Latitude": "37.1436", "Longitude": "-77.3726" },
  { "Time": "9:20:38 PM", "Latitude": "37.2043", "Longitude": "-77.3458" },
  { "Time": "9:21:08 PM", "Latitude": "37.2568", "Longitude": "-77.3229" },
  { "Time": "9:21:38 PM", "Latitude": "37.3067", "Longitude": "-77.3012" },
  { "Time": "9:22:08 PM", "Latitude": "37.3604", "Longitude": "-77.278" },
  { "Time": "9:22:38 PM", "Latitude": "37.4116", "Longitude": "-77.2558" },
  { "Time": "9:23:08 PM", "Latitude": "37.4661", "Longitude": "-77.232" },
  { "Time": "9:23:38 PM", "Latitude": "37.516", "Longitude": "-77.2101" },
  { "Time": "9:24:08 PM", "Latitude": "37.5693", "Longitude": "-77.187" },
  { "Time": "9:24:38 PM", "Latitude": "37.6206", "Longitude": "-77.1645" },
  { "Time": "9:25:08 PM", "Latitude": "37.6741", "Longitude": "-77.141" },
  { "Time": "9:25:26 PM", "Latitude": "37.7051", "Longitude": "-77.1242" },
  { "Time": "9:25:56 PM", "Latitude": "37.761", "Longitude": "-77.086" },
  { "Time": "9:26:26 PM", "Latitude": "37.813", "Longitude": "-77.0499" },
  { "Time": "9:26:56 PM", "Latitude": "37.8673", "Longitude": "-77.0119" },
  { "Time": "9:27:26 PM", "Latitude": "37.9205", "Longitude": "-76.9749" },
  { "Time": "9:27:56 PM", "Latitude": "37.9699", "Longitude": "-76.9405" },
  { "Time": "9:28:26 PM", "Latitude": "38.0222", "Longitude": "-76.9042" },
  { "Time": "9:28:56 PM", "Latitude": "38.0739", "Longitude": "-76.8683" },
  { "Time": "9:29:26 PM", "Latitude": "38.1286", "Longitude": "-76.8302" },
  { "Time": "9:29:56 PM", "Latitude": "38.1811", "Longitude": "-76.7934" },
  { "Time": "9:30:26 PM", "Latitude": "38.232", "Longitude": "-76.7567" },
  { "Time": "9:30:44 PM", "Latitude": "38.2643", "Longitude": "-76.7277" },
  { "Time": "9:31:08 PM", "Latitude": "38.3003", "Longitude": "-76.6891" },
  { "Time": "9:31:39 PM", "Latitude": "38.3515", "Longitude": "-76.6338" },
  { "Time": "9:32:09 PM", "Latitude": "38.4011", "Longitude": "-76.5802" },
  { "Time": "9:32:54 PM", "Latitude": "38.4716", "Longitude": "-76.5042" },
  { "Time": "9:33:33 PM", "Latitude": "38.5354", "Longitude": "-76.4358" },
  { "Time": "9:34:03 PM", "Latitude": "38.5827", "Longitude": "-76.3848" },
  { "Time": "9:34:33 PM", "Latitude": "38.6324", "Longitude": "-76.3312" },
  { "Time": "9:35:03 PM", "Latitude": "38.6804", "Longitude": "-76.2793" },
  { "Time": "9:35:33 PM", "Latitude": "38.7279", "Longitude": "-76.2279" },
  { "Time": "9:36:03 PM", "Latitude": "38.7766", "Longitude": "-76.175" },
  { "Time": "9:36:33 PM", "Latitude": "38.8248", "Longitude": "-76.1227" },
  { "Time": "9:37:03 PM", "Latitude": "38.8701", "Longitude": "-76.0735" },
  { "Time": "9:37:33 PM", "Latitude": "38.9199", "Longitude": "-76.0193" },
  { "Time": "9:38:03 PM", "Latitude": "38.9665", "Longitude": "-75.9678" },
  { "Time": "9:38:34 PM", "Latitude": "39.0153", "Longitude": "-75.9095" },
  { "Time": "9:39:04 PM", "Latitude": "39.0628", "Longitude": "-75.853" },
  { "Time": "9:39:34 PM", "Latitude": "39.1095", "Longitude": "-75.7971" },
  { "Time": "9:40:04 PM", "Latitude": "39.1555", "Longitude": "-75.742" },
  { "Time": "9:40:34 PM", "Latitude": "39.2003", "Longitude": "-75.6884" },
  { "Time": "9:41:03 PM", "Latitude": "39.2468", "Longitude": "-75.6325" },
  { "Time": "9:41:23 PM", "Latitude": "39.2746", "Longitude": "-75.5995" },
  { "Time": "9:41:53 PM", "Latitude": "39.3221", "Longitude": "-75.5426" },
  { "Time": "9:42:23 PM", "Latitude": "39.3682", "Longitude": "-75.4868" },
  { "Time": "9:42:54 PM", "Latitude": "39.4138", "Longitude": "-75.4317" },
  { "Time": "9:43:24 PM", "Latitude": "39.4612", "Longitude": "-75.3739" },
  { "Time": "9:43:54 PM", "Latitude": "39.5055", "Longitude": "-75.3202" },
  { "Time": "9:44:24 PM", "Latitude": "39.5514", "Longitude": "-75.2644" },
  { "Time": "9:44:42 PM", "Latitude": "39.5772", "Longitude": "-75.233" },
  { "Time": "9:45:12 PM", "Latitude": "39.623", "Longitude": "-75.1775" },
  { "Time": "9:45:42 PM", "Latitude": "39.666", "Longitude": "-75.1248" },
  { "Time": "9:46:08 PM", "Latitude": "39.7091", "Longitude": "-75.0754" },
  { "Time": "9:46:38 PM", "Latitude": "39.755", "Longitude": "-75.024" },
  { "Time": "9:47:08 PM", "Latitude": "39.7998", "Longitude": "-74.9735" },
  { "Time": "9:47:38 PM", "Latitude": "39.8446", "Longitude": "-74.923" },
  { "Time": "9:48:13 PM", "Latitude": "39.8967", "Longitude": "-74.8647" },
  { "Time": "9:48:39 PM", "Latitude": "39.9377", "Longitude": "-74.8261" },
  { "Time": "9:49:09 PM", "Latitude": "39.9865", "Longitude": "-74.7811" },
  { "Time": "9:49:31 PM", "Latitude": "40.0199", "Longitude": "-74.7493" },
  { "Time": "9:50:15 PM", "Latitude": "40.0826", "Longitude": "-74.6655" },
  { "Time": "9:50:57 PM", "Latitude": "40.1407", "Longitude": "-74.5759" },
  { "Time": "9:51:19 PM", "Latitude": "40.1665", "Longitude": "-74.5356" },
  { "Time": "9:51:49 PM", "Latitude": "40.2079", "Longitude": "-74.4711" },
  { "Time": "9:52:15 PM", "Latitude": "40.242", "Longitude": "-74.4178" },
  { "Time": "9:52:45 PM", "Latitude": "40.2802", "Longitude": "-74.3578" },
  { "Time": "9:53:15 PM", "Latitude": "40.3208", "Longitude": "-74.2941" },
  { "Time": "9:53:45 PM", "Latitude": "40.3614", "Longitude": "-74.2306" },
  { "Time": "9:54:15 PM", "Latitude": "40.4011", "Longitude": "-74.1685" },
  { "Time": "9:54:45 PM", "Latitude": "40.4396", "Longitude": "-74.1079" },
  { "Time": "9:55:03 PM", "Latitude": "40.4617", "Longitude": "-74.0732" },
  { "Time": "9:55:33 PM", "Latitude": "40.5016", "Longitude": "-74.0103" },
  { "Time": "9:56:11 PM", "Latitude": "40.5513", "Longitude": "-73.9314" },
  { "Time": "9:56:41 PM", "Latitude": "40.5926", "Longitude": "-73.8654" },
  { "Time": "9:57:24 PM", "Latitude": "40.6471", "Longitude": "-73.7786" },
  { "Time": "9:57:54 PM", "Latitude": "40.687", "Longitude": "-73.7151" },
  { "Time": "9:58:24 PM", "Latitude": "40.7236", "Longitude": "-73.6569" },
  { "Time": "9:58:54 PM", "Latitude": "40.7642", "Longitude": "-73.5919" },
  { "Time": "9:59:24 PM", "Latitude": "40.8063", "Longitude": "-73.5248" },
  { "Time": "9:59:54 PM", "Latitude": "40.8449", "Longitude": "-73.4631" },
  { "Time": "10:00:10 PM", "Latitude": "40.8684", "Longitude": "-73.4268" },
  { "Time": "10:00:28 PM", "Latitude": "40.8906", "Longitude": "-73.3908" },
  { "Time": "10:00:58 PM", "Latitude": "40.9248", "Longitude": "-73.3237" },
  { "Time": "10:01:28 PM", "Latitude": "40.9586", "Longitude": "-73.2568" },
  { "Time": "10:01:58 PM", "Latitude": "40.9927", "Longitude": "-73.1895" },
  { "Time": "10:02:28 PM", "Latitude": "41.0266", "Longitude": "-73.1224" },
  { "Time": "10:03:09 PM", "Latitude": "41.0688", "Longitude": "-73.0252" },
  { "Time": "10:03:39 PM", "Latitude": "41.0974", "Longitude": "-72.957" },
  { "Time": "10:04:09 PM", "Latitude": "41.1255", "Longitude": "-72.8901" },
  { "Time": "10:04:39 PM", "Latitude": "41.1551", "Longitude": "-72.8198" },
  { "Time": "10:05:09 PM", "Latitude": "41.1826", "Longitude": "-72.7543" },
  { "Time": "10:05:39 PM", "Latitude": "41.2112", "Longitude": "-72.6858" },
  { "Time": "10:06:09 PM", "Latitude": "41.2398", "Longitude": "-72.6171" },
  { "Time": "10:06:39 PM", "Latitude": "41.2672", "Longitude": "-72.5512" },
  { "Time": "10:07:09 PM", "Latitude": "41.2954", "Longitude": "-72.4833" },
  { "Time": "10:07:39 PM", "Latitude": "41.3232", "Longitude": "-72.4159" },
  { "Time": "10:08:09 PM", "Latitude": "41.3508", "Longitude": "-72.3492" },
  { "Time": "10:08:39 PM", "Latitude": "41.3781", "Longitude": "-72.283" },
  { "Time": "10:09:10 PM", "Latitude": "41.4056", "Longitude": "-72.2162" },
  { "Time": "10:09:40 PM", "Latitude": "41.432", "Longitude": "-72.152" },
  { "Time": "10:10:10 PM", "Latitude": "41.4588", "Longitude": "-72.0863" },
  { "Time": "10:10:40 PM", "Latitude": "41.4839", "Longitude": "-72.025" },
  { "Time": "10:11:10 PM", "Latitude": "41.5101", "Longitude": "-71.9608" },
  { "Time": "10:11:40 PM", "Latitude": "41.5357", "Longitude": "-71.8979" },
  { "Time": "10:12:10 PM", "Latitude": "41.5608", "Longitude": "-71.836" },
  { "Time": "10:12:40 PM", "Latitude": "41.585", "Longitude": "-71.7761" },
  { "Time": "10:13:10 PM", "Latitude": "41.6096", "Longitude": "-71.7154" },
  { "Time": "10:13:40 PM", "Latitude": "41.6332", "Longitude": "-71.657" },
  { "Time": "10:14:10 PM", "Latitude": "41.6573", "Longitude": "-71.597" },
  { "Time": "10:14:40 PM", "Latitude": "41.6824", "Longitude": "-71.5347" },
  { "Time": "10:15:10 PM", "Latitude": "41.7058", "Longitude": "-71.4762" },
  { "Time": "10:15:40 PM", "Latitude": "41.7305", "Longitude": "-71.415" },
  { "Time": "10:16:10 PM", "Latitude": "41.7543", "Longitude": "-71.3596" },
  { "Time": "10:16:40 PM", "Latitude": "41.7764", "Longitude": "-71.3084" },
  { "Time": "10:17:10 PM", "Latitude": "41.7959", "Longitude": "-71.2631" },
  { "Time": "10:17:40 PM", "Latitude": "41.8162", "Longitude": "-71.2156" },
  { "Time": "10:18:10 PM", "Latitude": "41.8355", "Longitude": "-71.1709" },
  { "Time": "10:18:40 PM", "Latitude": "41.8542", "Longitude": "-71.1296" },
  { "Time": "10:19:10 PM", "Latitude": "41.8725", "Longitude": "-71.0883" },
  { "Time": "10:19:40 PM", "Latitude": "41.8905", "Longitude": "-71.0472" },
  { "Time": "10:20:10 PM", "Latitude": "41.9075", "Longitude": "-71.0085" },
  { "Time": "10:20:34 PM", "Latitude": "41.922", "Longitude": "-70.9771" },
  { "Time": "10:20:50 PM", "Latitude": "41.9346", "Longitude": "-70.9633" },
  { "Time": "10:21:10 PM", "Latitude": "41.9548", "Longitude": "-70.9554" },
  { "Time": "10:21:40 PM", "Latitude": "41.9841", "Longitude": "-70.9439" },
  { "Time": "10:22:10 PM", "Latitude": "42.0139", "Longitude": "-70.932" },
  { "Time": "10:22:40 PM", "Latitude": "42.0449", "Longitude": "-70.9202" },
  { "Time": "10:22:59 PM", "Latitude": "42.0639", "Longitude": "-70.9117" },
  { "Time": "10:23:15 PM", "Latitude": "42.0757", "Longitude": "-70.8955" },
  { "Time": "10:23:35 PM", "Latitude": "42.0807", "Longitude": "-70.8688" },
  { "Time": "10:24:05 PM", "Latitude": "42.0853", "Longitude": "-70.8272" },
  { "Time": "10:24:35 PM", "Latitude": "42.0894", "Longitude": "-70.789" },
  { "Time": "10:24:51 PM", "Latitude": "42.0914", "Longitude": "-70.7696" },
  { "Time": "10:25:07 PM", "Latitude": "42.0977", "Longitude": "-70.7556" },
  { "Time": "10:25:23 PM", "Latitude": "42.1076", "Longitude": "-70.7505" },
  { "Time": "10:25:39 PM", "Latitude": "42.1196", "Longitude": "-70.7547" },
  { "Time": "10:25:55 PM", "Latitude": "42.129", "Longitude": "-70.7591" },
  { "Time": "10:26:11 PM", "Latitude": "42.1403", "Longitude": "-70.7645" },
  { "Time": "10:26:41 PM", "Latitude": "42.1598", "Longitude": "-70.7741" },
  { "Time": "10:27:11 PM", "Latitude": "42.1794", "Longitude": "-70.7838" },
  { "Time": "10:27:41 PM", "Latitude": "42.1981", "Longitude": "-70.7927" },
  { "Time": "10:28:00 PM", "Latitude": "42.2095", "Longitude": "-70.8009" },
  { "Time": "10:28:20 PM", "Latitude": "42.2192", "Longitude": "-70.8115" },
  { "Time": "10:28:48 PM", "Latitude": "42.2333", "Longitude": "-70.8291" },
  { "Time": "10:29:18 PM", "Latitude": "42.2477", "Longitude": "-70.8488" },
  { "Time": "10:29:48 PM", "Latitude": "42.2617", "Longitude": "-70.8674" },
  { "Time": "10:30:18 PM", "Latitude": "42.2752", "Longitude": "-70.8854" },
  { "Time": "10:30:43 PM", "Latitude": "42.2861", "Longitude": "-70.9" },
  { "Time": "10:31:13 PM", "Latitude": "42.2991", "Longitude": "-70.9173" },
  { "Time": "10:31:43 PM", "Latitude": "42.3116", "Longitude": "-70.934" },
  { "Time": "10:31:59 PM", "Latitude": "42.3178", "Longitude": "-70.9424" },
  { "Time": "10:32:15 PM", "Latitude": "42.3239", "Longitude": "-70.9505" },
  { "Time": "10:32:31 PM", "Latitude": "42.3306", "Longitude": "-70.9594" },
  { "Time": "10:32:47 PM", "Latitude": "42.3367", "Longitude": "-70.9676" },
  { "Time": "10:33:03 PM", "Latitude": "42.3437", "Longitude": "-70.977" },
  { "Time": "10:33:19 PM", "Latitude": "42.3495", "Longitude": "-70.9847" },
  { "Time": "10:33:35 PM", "Latitude": "42.3562", "Longitude": "-70.9936 "}
];

const captions = {
  1: "CLT Airport - D / E gates",
  14: "Greensboro, NC, from 23,000' altitude and ~20 mi distance, through a cell phone telephoto lens",
  44: "Raleigh, NC, looking northwest torward Durham, NC",
  77: "Richmond, VA, at approx 50x zoom from an altitude of 33,000'",
  79: "Zoomed in shot of DC. Context pic a few seconds later.",
  80: "Context picture at 0.6x zoom for the picture a few seconds earlier.",
  94: "Approaching the  the southern terminus of the Bos-Wash Megalopolis.",
  97: "View of Washington, DC and Arlington, VA",
  98: "Washington, DC blending into the greater DelMarVa",
  101: "The megalopolis continues, with a view of Annapolis in the distance",
  102: "Annapolis, MD",
  103: "Annapolis, MD, with foreground context to capture the city's luminosity compared to the surrounding area.",
  104: "Wide angle picture of Annapolis, MD, with foreground context to capture the city's luminosity compared to the surrounding area.",
  107: "Looking down , crossing from Maryland into Pennsylvania.",
  111: "Looking back, leaving DelMarVa.",
  116: "Near Wilmington, DE.",
  118: "Wilmington, DE.",
  120: "Wilmington, DE and Chester, PA.",
  122: "Approaching Philadelphia, PA.",
  123: "Philadelphia, PA, with Broad Street runinng distinctively up and to the right of the image.",
  124: "Closer to Philadelphia, PA.",
  125: "Philadelphia, PA.",
  128: "Philadelphia, PA and Camden, NJ in the foreground.",
  129: "Maybe Reading, PA in the distance?",
  130: "Closer view of Reading, PA, from a distance of approximately 60 mi.",
  131: "Burlington, NJ, featuring a swath of distribution centers in the foreground.",
  132: "Trenton makes, the world takes! Trenton, NJ.",
  133: "Trenton, NJ, featuring distribution centers all over.",
  134: "Central New Jersey, showing just how lovely our highways and industrial regions can be.",
  135: "Distribution makes the world go 'round, and the NY Tristate is no exception. Massive swath of DCs on the outskirts of NYC.",
  136: "New Brunswick, NJ in the foreground, with Highland Park, Piscataway and Edison in the background.",
  137: "Central Jersey -- New Brunswick NJ on the left, with Newark, NJ in the distance on the right.",
  140: "View of Newark, NJ and the beginning of the New York City Metropolis.",
  142: "New Jersey and New York. Taken at 0.6x zoom, so the luminosity appears lower than in real life.",
  143: "View of New Jersey and New York City.",
  144: "Brooklyn in the foreground, with Manhattan and New Jersey in the background.",
  145: "Manhattan and downtown Brooklyn, NYC.",
  146: "Wide angle of New Jersey, Manhattan and Brooklyn.",
  147: "View of New York City from the east.",
  148: "North of New York City. The blue bridge in the background is the Tappan Zee.",
  149: "Sands Point and Glen Cove, NY in the foreground. New Rochelle, Mamoroneck, Rye, Chester, NY, all the way to Stamford, CT on the right.",
  150: "Chester, NY and Stamford, CT in the midground, with the Tappan Zee bridge (blue) just barely visible in the back left of the image.",
  151: "Closeup of Stamford, CT.",
  152: "Stamford and Norwalk, CT.",
  153: "Closeup of Norwalk, CT, with Danbury, CT in the background.",
  155: "Bridgeport, CT, with Danbury, CT in the back left of the image.",
  157: "Looking back at Bridgeport, CT in the foreground and Danbury, CT in the background.",
  158: "Looking forward to New Haven, CT, with Waterbury and Hartford, CT visible in the background.",
  159: "New Haven, CT, with a touch of cloud cover.",
  160: "Wide angle shot of New Haven, CT under light clouds. Waterbury and Hartford, CT visible in the background.",
  161: "Downtown New Haven, CT with Waterbury, CT just visible at the top of the image.",
  162: "Hartford, CT and Springfield, MA in the distance.",
  163: "A distant view of Hartford, CT and Springfield, MA.",
  170: "Distant view of Providence, RI and Boston, MA.",
  176: "Distant view of Boston, MA. Large distribution cewnter visible in the foreground.",
  178: "Looking down in suburban MA, showing the stark contrast between light pollution near cities and outside of them.",
  182: "Providence, RI.",
  183: "Providence, RI.",
  184: "Providence, RI.",
  185: "Distant view of Boston, MA.",
  187: "Telephoto view of Boston, MA.",
  198: "Brockton, MA, on approach to Boston Logan.",
  199: "Wide angle of Brockton, MA, on approach to Boston Logan.",
  200: "Coming in to Boston, MA, on approach to BOS Runway 27.",
  227: "Landing on Runway 27 at Boston Logan, with the Boston skyline visible in the background.",
};



const processedFlightTrack = flightTrack.map((d) => ({
  lat: parseFloat(d.Latitude),
  lon: parseFloat(d.Longitude),
  time: d.Time,
}));

// Render the flight track as a line
function renderFlightTrack(data) {
  const lineData = data.map((d) => projectPoint(d.lat, d.lon));

  g.append("path")
    .datum(lineData)
    .attr("d", d3.line().x((d) => d[0]).y((d) => d[1]).curve(d3.curveNatural))
    .attr("stroke", "lime")
    .attr("stroke-width", 2)
    .attr("fill", "none");
}

// Helper to show the info pane
function showInfoPane(imageSrc, caption, persistent = false) {
  const infoBox = document.getElementById("info-box");
  const infoImage = document.getElementById("info-image");
  const infoText = document.getElementById("info-text");

  infoImage.src = imageSrc;
  infoText.textContent = caption;

  infoBox.style.display = "block";

  if (!persistent) {
    document.addEventListener("click", (event) => {
      if (!infoBox.contains(event.target)) {
        infoBox.style.display = "none";
        document.removeEventListener("click", arguments.callee);
      }
    });
  }
}
let activePip = null; // Tracks the currently active (persistent) pip

function renderInteractivePip(index, imagePath, captionKey) {
  const pipData = processedFlightTrack[index];
  const [x, y] = projectPoint(pipData.lat, pipData.lon);

  // Append the pip and give it a unique ID
  const circle = g.append("circle")
    .attr("id", `pip-${index}`)
    .attr("cx", x)
    .attr("cy", y)
    .attr("r", 6)
    .attr("fill", "dark-gray")
    .attr("stroke", "white")
    .attr("stroke-width", 2)
    .on("mouseover", function () {
      if (activePip !== this) {
        d3.select(this).attr("r", 8).attr("fill", "green"); // Highlight on hover
        showInfoPane(imagePath, captions[captionKey]);
      }
    })
    .on("mouseout", function () {
      if (activePip !== this) {
        d3.select(this).attr("r", 6).attr("fill", "dark-gray"); // Reset pip styling
        const infoBox = document.getElementById("info-box");
        infoBox.style.display = "none"; // Hide info pane
      }
    })
    .on("click", function (event) {
      event.stopPropagation(); // Prevent bubbling to hide the pane

      // Deactivate any previously active pip
      if (activePip) {
        d3.select(activePip).attr("r", 6).attr("fill", "dark-gray");
      }

      // Set this pip as active
      activePip = this;
      activePipIndex = pipIndices.indexOf(index); // Set active pip index
      d3.select(this).attr("r", 8).attr("fill", "green");
      showInfoPane(imagePath, captions[captionKey], true);
    });
}


// Handle clicks elsewhere on the map to hide the active pip
map.on("click", () => {
  if (activePip) {
    d3.select(activePip).attr("r", 6).attr("fill", "dark-gray"); // Reset active pip styling
    const infoBox = document.getElementById("info-box");
    infoBox.style.display = "none"; // Hide the info pane
    activePip = null; // Reset the active pip tracker
  }
});


// Update the SVG on map interaction
function updateSVG() {
  updateSVGBounds();

  // Update flight track line
  const lineData = processedFlightTrack.map((d) => projectPoint(d.lat, d.lon));
  g.select("path")
    .datum(lineData)
    .attr("d", d3.line().x((d) => d[0]).y((d) => d[1]).curve(d3.curveNatural));

  // Update interactive pip position
  processedFlightTrack.forEach((pipData, index) => {
    const [x, y] = projectPoint(pipData.lat, pipData.lon);
    g.select(`#pip-${index}`)
      .attr("cx", x)
      .attr("cy", y);
  });
}


// Initial render
updateSVGBounds();
renderFlightTrack(processedFlightTrack);



// List of integers for the pips to render
const pipIndices = [1, 14, 44, 77, 79, 80, 94, 97, 98, 101, 102, 103, 104, 107, 111, 116, 118, 120, 122, 123, 124, 125, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 140, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 155, 157, 158, 159, 160, 161, 162, 163, 170, 176, 178, 182, 183, 184, 185, 187, 198, 199, 200, 227,];



// Keep track of the currently active pip index
let activePipIndex = null;

// Function to activate a pip by index
function activatePip(index) {
  // Deactivate the currently active pip
  if (activePipIndex !== null) {
    const currentPipId = `#pip-${pipIndices[activePipIndex]}`;
    d3.select(currentPipId).attr("r", 6).attr("fill", "dark-gray");
  }

  // Update the active pip index
  activePipIndex = index;

  // Activate the new pip
  const pipId = `#pip-${pipIndices[activePipIndex]}`;
  const pipData = processedFlightTrack[pipIndices[activePipIndex]];
  const imagePath = `/data/images/image${pipIndices[activePipIndex]}.jpg`;
  const caption = captions[pipIndices[activePipIndex]];

  d3.select(pipId).attr("r", 8).attr("fill", "green");
  showInfoPane(imagePath, caption, true);

  // Pan the map to the pip location
  const latLng = L.latLng(pipData.lat, pipData.lon+3);
  map.setView(latLng, map.getZoom());
}

// Listen for arrow key events
document.addEventListener("keydown", (event) => {
  if (!pipIndices.length) return;

  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
    // Move to the next pip
    if (activePipIndex === null) {
      activatePip(0); // Start with the first pip if none is active
    } else {
      activatePip((activePipIndex + 1) % pipIndices.length);
    }
    event.preventDefault();
  } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    // Move to the previous pip
    if (activePipIndex === null) {
      activatePip(pipIndices.length - 1); // Start with the last pip if none is active
    } else {
      activatePip(
        (activePipIndex - 1 + pipIndices.length) % pipIndices.length
      );
    }
    event.preventDefault();
  }
});

// Loop through the list and render pips
pipIndices.forEach((index) => {
  renderInteractivePip(index, `/data/images/image${index}.jpg`, index);
});

// Attach update event listeners to the map
map.on("zoomend moveend", updateSVG);
