// Initialize the map and controls
var map = L.map('map').setView([36.1900, 5.3667], 12); // Set to Setif city coordinates

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Zoom In functionality
document.getElementById('zoom-in').addEventListener('click', function() {
    map.zoomIn();
});

// Zoom Out functionality
document.getElementById('zoom-out').addEventListener('click', function() {
    map.zoomOut();
});

// Reset map view functionality
document.getElementById('reset-map').addEventListener('click', function() {
    map.setView([36.1900, 5.3667], 12);
});

// Clear markers functionality
document.getElementById('clear-markers').addEventListener('click', function() {
    markersLayer.clearLayers();
    routingLayer.clearLayers();
});

// Export button
document.getElementById('export-btn').addEventListener('click', function() {
    window.location.href = '/api/export';  // Trigger the download
});

// Initialize marker layer for points of interest
var markersLayer = L.layerGroup().addTo(map);

var routingLayer = L.layerGroup().addTo(map); // Separate layer for routes


// Function to add markers
function addMarker(lat, lon) {
    var marker = L.marker([lat, lon]).addTo(markersLayer);
    marker.bindPopup(`<b>Coordinates:</b><br>Lat: ${lat}<br>Lon: ${lon}`);
}


// Function to draw a route between two points with a unique color
function drawRoute(start, end, color) {
    // Use L.polyline instead of L.Routing.control for dynamic routing simulation
    fetch(`https://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?geometries=geojson`)
        .then(response => response.json())
        .then(data => {
            if (data.routes && data.routes.length > 0) {
                var route = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
                L.polyline(route, {
                    color: color,
                    weight: 9,
                    opacity: 1
                }).addTo(routingLayer);
            }
        })
        .catch(error => console.error('Error fetching route:', error));
}

// Generate random color
function getRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

// Fetch coordinates from the backend and add to the map and sidebar
fetch('/api/coordinates')
    .then(response => response.json())
    .then(data => {

        var previousPoint = null;

        data.forEach(coord => {
            // Add marker to the map
            addMarker(coord.lat, coord.lon);

            // Add POI to the list dynamically with a Delete button
            var poiList = document.getElementById('poi-list');
            var li = document.createElement('li');
            li.innerHTML = `
                <a href="#" class="poi-link" data-lat="${coord.lat}" data-lon="${coord.lon}">
                    Lat: ${coord.lat}, Lon: ${coord.lon}
                </a>
                <span class="poi-name"> - ${coord.name}</span>
                <button class="delete-btn" data-name="${coord.name}">Delete</button>
            `;
            poiList.appendChild(li);

            // Center map on click of POI link
            li.querySelector('.poi-link').addEventListener('click', function (e) {
                e.preventDefault();
                map.setView([coord.lat, coord.lon], 16); // Zoom to clicked POI
            });

            // Add event listener to the delete button
            li.querySelector('.delete-btn').addEventListener('click', function () {
                deletePoint(coord.name, li);
            });
            // Draw route between the current and previous point with a unique color
            if (previousPoint) {
                var routeColor = getRandomColor();
                drawRoute(previousPoint, coord, routeColor);
            }

            // Update the previous point
            previousPoint = coord;           
        });
    })
    .catch(error => console.error('Error fetching coordinates:', error));

// Store the last added point to check for pairing
let lastAddedPoint = null;

// Handle form submission to add a new point
document.getElementById('add-poi-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent the form from refreshing the page

    // Collect input values
    const lat = parseFloat(document.getElementById('poi-lat').value);
    const lon = parseFloat(document.getElementById('poi-lon').value);
    const name = document.getElementById('poi-name').value;

    // Validate inputs
    if (isNaN(lat) || isNaN(lon) || !name.trim()) {
        alert("Please provide valid latitude, longitude, and name.");
        return;
    }

    // Send data to the backend
    fetch('/api/add-coordinate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lon, name })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert("Error: " + data.error);
            } else {
                alert("Point added successfully!");

                // Add the new point dynamically to the map and list
                addMarker(lat, lon);
                const poiList = document.getElementById('poi-list');
                const li = document.createElement('li');
                li.innerHTML = `
                    <a href="#" class="poi-link" data-lat="${lat}" data-lon="${lon}">
                        Lat: ${lat}, Lon: ${lon}
                    </a>
                    <span class="poi-name"> - ${name}</span>
                    <button class="delete-btn" data-name="${name}">Delete</button>
                `;
                poiList.appendChild(li);

                // Center map on the new point when clicked
                li.querySelector('.poi-link').addEventListener('click', function (event) {
                    event.preventDefault();
                    map.setView([lat, lon], 16); // Zoom to the new point
                });

                // Add event listener to the delete button
                li.querySelector('.delete-btn').addEventListener('click', function () {
                    deletePoint(name, li);
                });

                // Check for the previous unpaired point
                if (lastAddedPoint) {
                    var routeColor = getRandomColor();
                    drawRoute(lastAddedPoint, { lat: lat, lon: lon }, routeColor);
                    
                    // Clear lastAddedPoint after pairing
                    lastAddedPoint = null;
                } else {
                    // Store the current point as the last added if no pair
                    lastAddedPoint = { lat: lat, lon: lon };
                }

                // Clear form inputs
                document.getElementById('add-poi-form').reset();
            }
        })
        .catch(error => {
            console.error("Error adding point:", error);
            alert("An error occurred while adding the point.");
        });
});



// Function to delete a point (both from the list and the CSV file)
function deletePoint(name, liElement) {
    fetch('/api/delete-point', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: name })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);  // Show success message
        liElement.remove();    // Remove the point from the list on the frontend
        markersLayer.clearLayers(); // Optionally clear all markers
        // Re-fetch and reload markers after deletion
        fetch('/api/coordinates')
            .then(response => response.json())
            .then(data => {
                data.forEach(coord => {
                    addMarker(coord.lat, coord.lon);
                });
            });
    })
    .catch(error => {
        console.error("Error:", error);
    });
}

document.getElementById("toggle-form").addEventListener("click", function () {
    const form = document.getElementById("add-poi-form");
    const header = document.getElementById("toggle-form");
    if (form.style.display === "none" || form.style.display === "") {
        form.style.display = "block"; // Show the form
        header.classList.add("open"); // Rotate the arrow
    } else {
        form.style.display = "none"; // Hide the form
        header.classList.remove("open"); // Reset the arrow
    }
});


// Search // ********************************************


// Search functionality
document.querySelector('button[type="submit"]').addEventListener('click', function (e) {
    e.preventDefault(); // Prevent the form from refreshing the page

    // Get the coordinates from the search input
    const input = document.querySelector('input[type="search"]').value;
    const coords = input.split(',');

    // Validate input format (two numbers separated by a comma)
    if (coords.length === 2) {
        const lat = parseFloat(coords[0].trim());
        const lon = parseFloat(coords[1].trim());

        // Check if the coordinates are valid
        if (!isNaN(lat) && !isNaN(lon)) {
            // Center map on the searched coordinates
            map.setView([lat, lon], 16);

            // Add a marker at the searched coordinates
            const marker = L.marker([lat, lon]).addTo(markersLayer);
            marker.bindPopup("<b>Searched Point</b>");

            // Show a prompt to the user to add the point
            if (confirm("Do you want to add this point to your list?")) {
                // Ask for a name to add the point to the list
                const name = prompt("Enter a name for this point:");
                if (name) {
                    // Send the point to the backend to save it
                    fetch('/api/add-coordinate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ lat, lon, name })
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.error) {
                            alert("Error: " + data.error);
                        } else {
                            alert("Point added successfully!");

                            // Add the new point dynamically to the map and list
                            const poiList = document.getElementById('poi-list');
                            const li = document.createElement('li');
                            li.innerHTML = `
                                <a href="#" class="poi-link" data-lat="${lat}" data-lon="${lon}">
                                    Lat: ${lat}, Lon: ${lon}
                                </a>
                                <span class="poi-name"> - ${name}</span>
                            `;
                            poiList.appendChild(li);

                            // Center map on the new point when clicked
                            li.querySelector('.poi-link').addEventListener('click', function (event) {
                                event.preventDefault();
                                map.setView([lat, lon], 16); // Zoom to the new point
                            });
                        }
                    })
                    .catch(error => {
                        console.error("Error adding point:", error);
                        alert("An error occurred while adding the point.");
                    });
                }
            }
        } else {
            alert("Invalid coordinates. Please enter valid latitude and longitude.");
        }
    } else {
        alert("Please enter coordinates in the format: Latitude, Longitude.");
    }
});

// *******************************************************

// Function to enable clicking on the map to add markers and draw a route
function enableClickToRoute(map) {
    const tempMarkersLayer = L.layerGroup().addTo(map); // Temporary layer for click markers

    map.on('click', function (e) {
        // Add a marker to the temporary layer at the clicked location
        const marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(tempMarkersLayer);

        // Check the number of markers in the temporary layer
        if (tempMarkersLayer.getLayers().length === 2) {
            const markers = tempMarkersLayer.getLayers();
            const point1 = markers[0].getLatLng();
            const point2 = markers[1].getLatLng();

            // Use Leaflet Routing Machine to draw the route
            const routeControl = L.Routing.control({
                waypoints: [
                    L.latLng(point1.lat, point1.lng),
                    L.latLng(point2.lat, point2.lng)
                ],
                createMarker: function() { return null; }, // Disable routing machine's default markers
                lineOptions: {
                    styles: [{ color: 'blue', weight: 4, opacity: 0.7 }]
                },
                routeWhileDragging: false
            }).addTo(map);

            // After drawing a route, clear markers and route for new selections
            map.on('click', function clearOldRoute() {
                map.removeControl(routeControl); // Remove the route
                tempMarkersLayer.clearLayers(); // Clear the temporary markers
                map.off('click', clearOldRoute); // Unbind the event to avoid recursion
            });
        }
    });
}

// Call the function to enable click-to-route functionality
 enableClickToRoute(map);




// right-click functionality to copy coords

function enableRightClickToCopy(map) {
    // Add contextmenu event listener to the map
    map.on('contextmenu', function (e) {
        // Get the coordinates of the right-clicked point
        const lat = e.latlng.lat.toFixed(6); // Limit to 6 decimal places
        const lng = e.latlng.lng.toFixed(6);

        // Copy the coordinates to the clipboard
        const coords = `${lat}, ${lng}`;
        navigator.clipboard.writeText(coords).then(() => {
            // Show a confirmation message
            alert(`Coordinates copied to clipboard: ${coords}`);
        }).catch(err => {
            console.error('Failed to copy coordinates:', err);
            alert('Failed to copy coordinates. Please try again.');
        });
    });
}

// Call the function to enable right-click functionality
enableRightClickToCopy(map);


// Function to add geolocation marker and circle
// function addUserLocation(map) {
//     // Check if the browser supports geolocation
//     if (navigator.geolocation) {
//         // Get the user's current position
//         navigator.geolocation.getCurrentPosition(
//             function (position) {
//                 const userLat = position.coords.latitude;
//                 const userLon = position.coords.longitude;

//                 // Add a marker for the user's location
//                 const userMarker = L.marker([userLat, userLon], {
//                     icon: L.icon({
//                         iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Custom marker icon
//                         iconSize: [30, 30],
//                         iconAnchor: [15, 30]
//                     })
//                 }).addTo(map).bindPopup('You are here!').openPopup();

//                 // Add a circle around the user's location
//                 const userCircle = L.circle([userLat, userLon], {
//                     color: 'blue',    // Circle border color
//                     fillColor: '#3a7bd5', // Circle fill color
//                     fillOpacity: 0.3, // Transparency of the fill
//                     radius: 500       // Radius in meters
//                 }).addTo(map);

//                 // Pan the map to the user's location
//                 map.setView([userLat, userLon], 14);
//             },
//             function (error) {
//                 // Handle geolocation errors
//                 console.error('Geolocation error:', error);
//                 alert('Unable to retrieve your location. Please allow location access or try again.');
//             }
//         );
//     } else {
//         alert('Geolocation is not supported by your browser.');
//     }
// }

// // Call the function to get and display the user's location
// addUserLocation(map);