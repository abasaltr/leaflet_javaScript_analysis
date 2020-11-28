// YOUR CODE HERE!
console.log('This is earthquakesUSGS-1 leaflet js file - Reza Abasaltian');

// Creating map object
var map = L.map("map", {
    center: [40.7128, -74.0059],
    zoom: 4
});

// Adding tile layer
L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Reza Abasaltian © <a href=\"https://www.rice.edu/\">Rice University</a> | Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 8,
    minZoom: 3,
    id: "streets-v11",
    accessToken: API_KEY
}).addTo(map);

// Load in geojson data
var link = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Fetch the GeoJSON data
d3.json(link).then(function (response) {
    //console.log(response);

    // define features array list containing earthquake coordinates (within geometry) and properties
    var features = response.features;
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

    // loop through each earthquake features and assign its coordinates
    features.forEach(function (data) {
        // define location array to each features geometry array list
        var location = data.geometry;
        // if the location field is populated
        if (location) {
            // Add a new heat marker coordinates to the heat array 
            heatArray.push([location.coordinates[1], location.coordinates[0]]);

            L.circle([location.coordinates[1], location.coordinates[0]], {
                fillOpacity: 0.95,
                color: "grey",
                fillColor: markerColor(location.coordinates[2]),
                radius: markerSize(data.properties.mag)
            }).bindPopup(`<div class="popup"><h4>${data.properties.place}</h4><hr> <h5>Magnitude: ${parseFloat(data.properties.mag).toFixed(2)} ${data.properties.magType}</h5> <h5>Depth: ${parseFloat(location.coordinates[2]).toFixed(2)} km</h5></div>`).addTo(map);
        }
    });

    // add the marker heat array to the map
    L.heatLayer(heatArray, {
        radius: 20,
        blur: 35
    }).addTo(map);

    // Set up the legend
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function (map) {
        var div = L.DomUtil.create("div", "legend");
        var limits = ["-10—10", "10—30", "30—50", "50—70", "70—90", "90+"];
        var colors = ["lime", "#CCFF00", "#FFCC00", "#FF9900", "#FF6600", "#BF0000"];
        var labels = [];

        limits.forEach(function (limit,index) {
            labels.push(`<div class="square" style="background-color:${colors[index]}">
            <h5>${limit}</h5></div>`);
        });

        div.innerHTML += labels.join('');
        return div;
    };

    // Adding legend to the map
    legend.addTo(map);
});

