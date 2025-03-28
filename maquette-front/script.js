// Initialisation de la carte
var map = L.map('map').setView([48.8566, 2.3522], 7); // Centré sur Paris
    
// Ajout d'un fond de carte OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);


// Gestion des marqueurs de départ et d'arrivée
var startMarker, endMarker, routeLayer;

function addMarker(latlng, type) {
  if (type === "start") {
      if (startMarker) map.removeLayer(startMarker);
      startMarker = L.marker(latlng, { draggable: true }).addTo(map).bindPopup("Départ");
  } else {
      if (endMarker) map.removeLayer(endMarker);
      endMarker = L.marker(latlng, { draggable: true }).addTo(map).bindPopup("Arrivée");
  }

  // Reverse geocode to update address fields
  fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json`)
      .then(response => response.json())
      .then(data => {
          const address = data.display_name;
          if (type === "start") {
              document.getElementById("departure").value = address;
          } else {
              document.getElementById("arrival").value = address;
          }
      })
      .catch(error => console.error("Erreur lors du reverse geocoding :", error));
}

map.on('click', function(e) {
    if (!startMarker) {
        addMarker(e.latlng, "start");
    } else if (!endMarker) {
        addMarker(e.latlng, "end");
        calculateRoute(); // Calculer l'itinéraire après avoir placé l'arrivée
    }
});

function calculateRoute() {
    if (!startMarker || !endMarker) return;

    var startLatLng = startMarker.getLatLng();
    var endLatLng = endMarker.getLatLng();

    var url = `https://router.project-osrm.org/route/v1/driving/${startLatLng.lng},${startLatLng.lat};${endLatLng.lng},${endLatLng.lat}?overview=full&geometries=geojson`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (routeLayer) map.removeLayer(routeLayer);
            
            var route = L.geoJSON(data.routes[0].geometry, {
                color: 'blue',
                weight: 5,
                opacity: 0.7
            }).addTo(map);

            routeLayer = route;
        })
        .catch(error => console.error("Erreur lors du calcul de l'itinéraire :", error));
}




// Assurez-vous que le bouton close-menu est désactivé au chargement de la page
document.addEventListener("DOMContentLoaded", function () {
    var closeButton = document.getElementById("close-menu");
    closeButton.disabled = true; // Désactive le bouton close-menu
});


function toggleMenu() {
    var menu = document.getElementById("menu");
    var button = document.getElementById("menu-toggle");
    var closeButton = document.getElementById("close-menu");

    // Toggle de la classe 'visible' pour le menu
    menu.classList.toggle("visible");

    // Activer ou désactiver les boutons en fonction de l'état du menu
    if (menu.classList.contains("visible")) {
        button.disabled = true; // Désactive le bouton toggle
        closeButton.disabled = false; // Active le bouton close
    } else {
        button.disabled = false; // Active le bouton toggle
        closeButton.disabled = true; // Désactive le bouton close
    }
}


// Fonction pour afficher/masquer la popup
function togglePopup(event) {
    if (event) {
        event.preventDefault(); // Empêche le comportement par défaut du lien
    }
    var popup = document.getElementById("account-popup");
    popup.classList.toggle("hidden");
}



//Methode pour mettre en évidence le bouton calculerco2 lorsqu'il est activé
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("travel-form");
    const calculateBtn = document.getElementById("calculateCO2");

    function updateButtonState() {
        const departure = document.getElementById("departure").value.trim();
        const arrival = document.getElementById("arrival").value.trim();
        const people = document.getElementById("people").value;
        const transport = document.getElementById("transport").value;

        if (departure !== "" && arrival !== "" && people > 0 && transport !== "") {
            calculateBtn.classList.remove("btn-disabled");
            calculateBtn.classList.add("btn-active");
            calculateBtn.disabled = false;
        } else {
            calculateBtn.classList.add("btn-disabled");
            calculateBtn.classList.remove("btn-active");
            calculateBtn.disabled = true;
        }
    }

    // Écouteurs sur les champs du formulaire
    form.addEventListener("input", updateButtonState);
});


// Fonction pour gérer la soumission du formulaire de voyage
document.getElementById('travel-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Récupérer les données du formulaire
    const departure = document.getElementById('departure').value;
    const arrival = document.getElementById('arrival').value;
    const transport = document.getElementById('transport').value;
    const numPeople = document.getElementById('people').value;

    // Remplacer les valeurs dans la section "Voyage calculé"
    document.getElementById('calc-departure').textContent = departure;
    document.getElementById('calc-arrival').textContent = arrival;
    document.getElementById('calc-transport').textContent = transport;
    document.getElementById('calc-num-people').textContent = numPeople;
    const distanceInKm = document.getElementById('calc-distance').textContent;

    document.getElementById("calc-co2").textContent = `${distanceInKm} km * ratio CO2 de ${transport} * ${numPeople} personnes`;


    document.getElementById('no-trip').style.display = 'none';
    document.getElementById('trip-calculated').style.display = 'block';
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
    toggleMenu()
});




// Fonction pour gérer la soumission du formulaire de connection
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Récupérer les données du formulaire
    const name = document.getElementById('login-name').value;
    const password = document.getElementById('login-password').value;

    //Verifier si les valeurs sont correctes
    if (name === 'admin' && password === 'admin') {
    }
    if (true) {
        window.location.href = 'account.html';
    }

});




/*function shortAddress(displayName) {
  console.log("### Debug: shortAddress called with:", displayName);
  if (!displayName) return "";

  // Example detection rules (tweak as needed)
  const knownCountries = ["France", "United States", "Canada", "Germany", "United Kingdom", "Spain", "Italy"];
  const isPostalCode = (str) => /^\d{4,5}$/.test(str); // Simple example for 4-5 digit codes
  const isHouseNumber = (str) => /^\d+([a-zA-Z]*)?$/.test(str);

  const parts = displayName.split(",").map(p => p.trim()).filter(Boolean);
  let houseNumber = "", street = "", city = "", postalCode = "", country = "";

  // Try to find each piece in a single pass
  parts.forEach(part => {
    console.log(part);
    // Remove known undesired parts (arrondissements, régions, etc.):
    if (/arrondissement|metropolitan|île|région/i.test(part)) {
      return;
    }
    if (knownCountries.includes(part)) {
      country = part;
    } else if (isPostalCode(part)) {
      postalCode = part;
    } else if (isHouseNumber(part) && !houseNumber) {
      houseNumber = part;
    } else if (!street) {
      // First unrecognized part as street
      street = part;
    } else if (!city) {
      // Second unrecognized part as city
      city = part;
    }
  });

  // Build final string with whichever parts exist
  const finalParts = [houseNumber, street, postalCode, city, country].filter(Boolean);
  const finalString = finalParts.join(", ");
  console.log("### Debug: shortAddress result:", finalString);
  return finalString;
}*/

function enableAutocomplete(inputId, resultsId) {
  console.log("### Debug: Autocomplete enabled for", inputId);
  const input = document.getElementById(inputId);
  const results = document.getElementById(resultsId);
  let timer;

  input.addEventListener('input', function() {
      console.log("### Debug: input event fired, current value:", input.value);
      clearTimeout(timer);
      const query = input.value.trim();
      if (query.length < 3) {
          console.log("### Debug: query too short, hiding results");
          results.style.display = 'none';
          results.innerHTML = '';
          return;
      }
      timer = setTimeout(() => {
          const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
          console.log("### Debug: sending GET request to Nominatim:", url);
          fetch(url)
            .then(response => response.json())
            .then(data => {
              console.log("### Debug: fetched data from Nominatim:", data);
              results.innerHTML = '';
              data.forEach(item => {
                console.log("### Debug: appending item:", item.display_name);
                const div = document.createElement('div');
                div.className = 'autocomplete-item';
                div.textContent = item.display_name;
                div.addEventListener('click', () => {
                  console.log("### Debug: item clicked:", item.display_name);
                  input.value = item.display_name;
                  results.style.display = 'none';
                  results.innerHTML = '';

                  // Place the corresponding marker on the map
                  const lat = parseFloat(item.lat);
                  const lon = parseFloat(item.lon);
                  const latlng = { lat, lng: lon };
                  const markerType = (inputId === 'departure') ? 'start' : 'end';
                  addMarker(latlng, markerType);
                  if(markerType === 'end') {
                    calculateRoute(); // Calculate route if arrival marker is placed
                  }
                });
                results.appendChild(div);
              });
              results.style.display = data.length ? 'block' : 'none';
            })
            .catch(error => {
              console.error("### Debug: error fetching data:", error);
              results.innerHTML = '';
              results.style.display = 'none';
            });
      }, 300);
  });
}
  
  // Initialize autocomplete once DOM has loaded
  document.addEventListener("DOMContentLoaded", function () {
    // ...existing code...
  
    enableAutocomplete('departure', 'departure-autocomplete-results');
    enableAutocomplete('arrival', 'arrival-autocomplete-results');
  });