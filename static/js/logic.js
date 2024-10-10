// Initialize the map and set its view to our chosen geographical coordinates and a zoom level
var map = L.map('map').setView([20, 0], 2);

// Add a tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Function to determine marker size based on earthquake magnitude
function getRadius(magnitude) {
  return magnitude ? magnitude * 4 : 1;
}

// Function to determine marker color based on earthquake depth
function getColor(depth) {
  return depth > 90 ? '#ea2c2c' :
         depth > 70 ? '#ea822c' :
         depth > 50 ? '#ee9c00' :
         depth > 30 ? '#eecc00' :
         depth > 10 ? '#d4ee00' :
                      '#98ee00';
}

// URL to fetch the earthquake data from USGS
var earthquakeDataUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

// Fetch the earthquake GeoJSON data using D3
d3.json(earthquakeDataUrl).then(function(data) {
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  L.geoJSON(data, {
    // Use pointToLayer to create circle markers
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    },
    // Set the style for each circleMarker using the styleInfo function
    style: function(feature) {
      return {
        opacity: 1,
        fillOpacity: 0.8,
        fillColor: getColor(feature.geometry.coordinates[2]),
        color: "#000000",
        radius: getRadius(feature.properties.mag),
        stroke: true,
        weight: 0.5
      };
    },
    // Create popups for each marker to display magnitude and location
    onEachFeature: function(feature, layer) {
      layer.bindPopup(
        "<strong>Location:</strong> " + feature.properties.place +
        "<br><strong>Magnitude:</strong> " + feature.properties.mag +
        "<br><strong>Depth:</strong> " + feature.geometry.coordinates[2] + " km"
      );
    }
  }).addTo(map);

  // Add legend to the map after the data has been added
  addLegend();
});

// Function to add a legend to the map
function addLegend() {
  var legend = L.control({ position: 'bottomright' });

  legend.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'legend'),
        depths = [-10, 10, 30, 50, 70, 90];

    div.innerHTML += "<h4>Depth (km)</h4>";

    // Loop through the depth intervals and generate a label with a colored square for each interval
    for (var i = 0; i < depths.length; i++) {
      div.innerHTML +=
        '<i style="background:' + getColor(depths[i] + 1) + '"></i> ' +
        depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
    }

    return div;
  };

  legend.addTo(map);
}
