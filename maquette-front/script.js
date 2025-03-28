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
