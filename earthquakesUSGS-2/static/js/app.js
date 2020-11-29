// YOUR CODE HERE!
console.log('This is earthquakesUSGS-2 leaflet js file - Reza Abasaltian');

// Adding tile layer
var streets = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Reza Abasaltian © <a href=\"https://www.rice.edu/\">Rice University</a> | Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 14,
    minZoom: 6,
    id: "streets-v11",
    accessToken: API_KEY
});

// Adding tile layer
var light = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Reza Abasaltian © <a href=\"https://www.rice.edu/\">Rice University</a> | Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 7,
    minZoom: 4,
    id: "light-v10",
    accessToken: API_KEY
});

// Adding tile layer
var dark = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Reza Abasaltian © <a href=\"https://www.rice.edu/\">Rice University</a> | Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 7,
    minZoom: 3,
    id: "dark-v10",
    accessToken: API_KEY
});

// Adding tile layer
var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Reza Abasaltian © <a href=\"https://www.rice.edu/\">Rice University</a> | Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 6,
    minZoom: 2,
    id: "satellite-v9",
    accessToken: API_KEY
});

// Adding tile layer
var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Reza Abasaltian © <a href=\"https://www.rice.edu/\">Rice University</a> | Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 10,
    minZoom: 4,
    id: "outdoors-v11",
    accessToken: API_KEY
});

// Creating map object
var map = L.map("map", {
    center: [38.835224, -104.8198],
    zoom: 4,
    // default layers to have enabled
    layers: [outdoors]
});

// Load in geojson data
var link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var link2 = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";

// Fetch the USGS Earthquakes GeoJSON data and call function init() on application startup
// Fetch the Tectonic Plates GeoJSON data and call function init() on application startup
var GeoJSON = [link,link2];
var promises = [];
GeoJSON.forEach(function(url) {
    promises.push(d3.json(url))
});
Promise.all(promises).then(data => init(data));

// function to initialize data read and bridge between layers
function init(data) {

    var eqLayers = addEarthquakes(data[0]);
    var tecLayer = addTectonic(data[1]);
    //Overlays that may be toggled on or off
    var overlayMaps = {
        "Earthquakes": L.layerGroup(eqLayers[0]),
        "Earthquakes-Heat": L.layerGroup(eqLayers[1]),
        "Tectonic Plates": L.layerGroup(tecLayer),
    };
    // Only one base layer can be shown at a time
    var baseMaps = {
        "Light": light,
        "Dark": dark,
        "Outdoors": outdoors,
        "Satellite": satellite,
        "Streets": streets,
    };
    // Pass layers into the layer control and add the layer control to the map
    var options = { collapsed: false };
    L.control.layers(baseMaps, overlayMaps, options).addTo(map);
} //end init() function

// function adds earthquake layers to a list array and returns back to init()
function addEarthquakes(data) {
    //console.log(data);

    // define features array list containing earthquake coordinates (within geometry) and properties
    var features = data.features;
    //console.log(features);

    // create a marker heat array
    var heatArray = [];

    // Define a markerColor function that will give each earthquake a different color based on its depth
    function markerColor(depth_str) {
        var depth = parseFloat(depth_str);
        //console.log(depth);
        var color = "white";
        switch (true) {
            case (depth >= -10 && depth < 10):
                color = "lime";
                break;
            case (depth >= 10 && depth < 30):
                color = "#CCFF00";
                break;
            case (depth >= 30 && depth < 50):
                color = "#FFCC00";
                break;
            case (depth >= 50 && depth < 70):
                color = "#FF9900";
                break;
            case (depth >= 70 && depth < 90):
                color = "#FF6600";
                break;
            case (depth >= 90):
                color = "#BF0000";
                break;
            default:
                color = "lime";
                break;
        }
        //console.log(color);
        return color;
    }

    // Define a markerSize function that will give each earthquake a different radius based on its magnitude
    function markerSize(magnitude) {
        return parseInt(magnitude * 12345);
    }

    // initialize an earthquaker layer
    var eqLayer = [];

    // loop through each earthquake features and assign its coordinates
    features.forEach(function (data) {
        // define location array to each features geometry array list
        var location = data.geometry;
        // if the location field is populated
        if (location) {
            // Add a new heat marker coordinates to the heat array 
            heatArray.push([location.coordinates[1], location.coordinates[0]]);

            eqLayer.push(L.circle([location.coordinates[1], location.coordinates[0]], {
                fillOpacity: 0.95,
                color: "grey",
                fillColor: markerColor(location.coordinates[2]),
                radius: markerSize(data.properties.mag)
            }).bindPopup(`<div class="popup"><h4>${data.properties.place}</h4><hr> <h5>Magnitude: ${parseFloat(data.properties.mag).toFixed(2)} ${data.properties.magType}</h5> <h5>Depth: ${parseFloat(location.coordinates[2]).toFixed(2)} km</h5></div>`));
        }
    });

    //add the marker heat array to the map
    var eqHeatLayer = [];
    eqHeatLayer.push(L.heatLayer(heatArray, {
        radius: 20,
        blur: 35
    }));

    // Set up the legend
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function (map) {
        var div = L.DomUtil.create("div", "legend");
        var limits = ["-10—10", "10—30", "30—50", "50—70", "70—90", "90+"];
        var colors = ["lime", "#CCFF00", "#FFCC00", "#FF9900", "#FF6600", "#BF0000"];
        var labels = [];

        limits.forEach(function (limit, index) {
            labels.push(`<div class="square" style="background-color:${colors[index]}">
            <h5>${limit}</h5></div>`);
        });

        div.innerHTML += labels.join('');
        return div;
    };

    // Adding legend to the map
    legend.addTo(map);

    var eqLayers = [];
    eqLayers.push(eqLayer);
    eqLayers.push(eqHeatLayer);

    return eqLayers;
}; //end addEarthquakes()

// function adds tectonic plate layers to a list array and returns back to init()
function addTectonic(data) {
    //console.log(data);

    // define features array list containing earthquake coordinates (within geometry) and properties
    var features = data.features;
    //console.log(features);

    // Creating poly line options
    var lineOptions = { className: 'polyline' };

    var tecLayer = [];

    // loop through each earthquake features and assign its coordinates
    features.forEach(function (data) {
        // define location array to each features geometry array list
        var location = data.geometry.coordinates[0];
        //console.log(location);
        var locationCoord = [];
        location.forEach(function (coord) {
            var latlng = []
            latlng.push(coord[1]);
            latlng.push(coord[0]);
            locationCoord.push(latlng);
        });
        tecLayer.push(L.polyline(locationCoord, lineOptions));
    });

    return tecLayer;
}; //end addTectonic()