
document.addEventListener("DOMContentLoaded", function () {
    // Initialisation de la carte
    var map = L.map('map').setView([48.8566, 2.3522], 5); // Centrée sur Paris

    // Ajout des tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Variables pour stocker les marqueurs et l'itinéraire
    let startMarker = null;
    let endMarker = null;
    let routeLayer = null;


    // Ajout d'un écouteur pour détecter l'entrée utilisateur dans le champ de texte
    const departureInput = document.getElementById('departure');
    const arrivalInput = document.getElementById('arrival');

    departureInput.addEventListener('change', function () {
        geocodeAddress(departureInput.value, 'start');
    });

    arrivalInput.addEventListener('change', function () {
        geocodeAddress(arrivalInput.value, 'end');
    });


    // Fonction pour ajouter ou déplacer un marqueur
    function addMarker(latlng, type) {
        if (type === 'start') {
            if (startMarker) map.removeLayer(startMarker);
            startMarker = L.marker(latlng, { draggable: true }).addTo(map);
            startMarker.on('dragend', calculateRoute);
            reverseGeocode(latlng, 'departure');
        } else if (type === 'end') {
            if (endMarker) map.removeLayer(endMarker);
            endMarker = L.marker(latlng, { draggable: true }).addTo(map);
            endMarker.on('dragend', calculateRoute);
            reverseGeocode(latlng, 'arrival');
        }
        calculateRoute();
    }

    // Ajout des marqueurs en cliquant sur la carte
    map.on('click', function (e) {
        if (!startMarker) {
            addMarker(e.latlng, 'start');
        } else if (!endMarker) {
            addMarker(e.latlng, 'end');
        } else {
            resetMarkers();
        }
    });

    // Fonction pour réinitialiser les marqueurs et l'itinéraire
    function resetMarkers() {
        if (startMarker) map.removeLayer(startMarker);
        if (endMarker) map.removeLayer(endMarker);
        if (routeLayer) map.removeLayer(routeLayer);
        startMarker = null;
        endMarker = null;
        document.getElementById('departure').value = '';
        document.getElementById('arrival').value = '';
    }

    // Fonction pour calculer et afficher l'itinéraire
    function calculateRoute() {
        if (!startMarker || !endMarker) return;

        let start = startMarker.getLatLng();
        let end = endMarker.getLatLng();

        let url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (routeLayer) map.removeLayer(routeLayer);

                let coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
                routeLayer = L.polyline(coords, { color: 'blue', weight: 5 }).addTo(map);
            })
            .catch(error => console.error("Erreur lors du calcul de l'itinéraire :", error));
    }




    // Fonction pour géocoder une adresse et placer un marqueur
    function geocodeAddress(address, type) {
        geocoder.geocode(address, function (results) {
            if (results.length > 0) {
                let latlng = results[0].center;
                addMarker(latlng, type);
                if (type === 'start') {
                    document.getElementById('departure').value = results[0].name;
                } else if (type === 'end') {
                    document.getElementById('arrival').value = results[0].name;
                }
            }
        });
    }

    // Fonction pour obtenir l'adresse d'un point cliqué
    function reverseGeocode(latlng, field) {
        let url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.display_name) {
                    document.getElementById(field).value = data.display_name;
                }
            })
            .catch(error => console.error("Erreur lors de la récupération de l'adresse :", error));
    }


    function masquersuggestion() {
        if (!departureInput.contains(e.target) && !departureSuggestions.contains(e.target)) {
            departureSuggestions.innerHTML = "";
        }
        if (!arrivalInput.contains(e.target) && !arrivalSuggestions.contains(e.target)) {
            arrivalSuggestions.innerHTML = "";
        }
    }



    var geocoder = L.Control.Geocoder.nominatim();


    // Création des div pour afficher les suggestions
    const departureSuggestions = document.createElement('div');
    departureSuggestions.classList.add('suggestions');
    departureInput.parentNode.appendChild(departureSuggestions);

    const arrivalSuggestions = document.createElement('div');
    arrivalSuggestions.classList.add('suggestions');
    arrivalInput.parentNode.appendChild(arrivalSuggestions);

    // Fonction pour récupérer les suggestions depuis Nominatim
    function fetchSuggestions(query, suggestionBox, type) {
        if (query.length < 3) {
            suggestionBox.innerHTML = "";
            return;
        }

        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=5`)
            .then(response => response.json())
            .then(data => {
                suggestionBox.innerHTML = "";
                data.forEach(place => {
                    let item = document.createElement('div');
                    item.textContent = place.display_name;
                    item.classList.add('suggestion-item');
                    item.addEventListener('click', () => {
                        // Insérer l'adresse sélectionnée dans l'input
                        if (type === 'start') {
                            departureInput.value = place.display_name;
                            addMarker([parseFloat(place.lat), parseFloat(place.lon)], 'start');
                            departureSuggestions.innerHTML = ""; // Masquer les suggestions
                            masquersuggestion();
                        } else {
                            arrivalInput.value = place.display_name;
                            addMarker([parseFloat(place.lat), parseFloat(place.lon)], 'end');
                            arrivalSuggestions.innerHTML = ""; // Masquer les suggestions
                            masquersuggestion();

                        }
                    });
                    suggestionBox.appendChild(item);
                });
            })
            .catch(error => console.error("Erreur de géocodage :", error));
    }

    // Écouteurs d'événements pour l'entrée utilisateur
    departureInput.addEventListener('input', () => fetchSuggestions(departureInput.value, departureSuggestions, 'start'));
    arrivalInput.addEventListener('input', () => fetchSuggestions(arrivalInput.value, arrivalSuggestions, 'end'));

    // Masquer les suggestions lorsqu'on clique en dehors
    document.addEventListener('click', (e) => {
        masquersuggestion()
    });




});