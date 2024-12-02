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
});

// Initialize marker layer for points of interest
var markersLayer = L.layerGroup().addTo(map);

// Function to add markers
function addMarker(lat, lon) {
    var marker = L.marker([lat, lon]).addTo(markersLayer);
    marker.bindPopup("<b>Point of Interest</b>");
}

// Fetch coordinates from the backend and add to the map and sidebar
fetch('/api/coordinates')
    .then(response => response.json())
    .then(data => {
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
        });
    })
    .catch(error => console.error('Error fetching coordinates:', error));

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
