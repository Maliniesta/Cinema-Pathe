// Liste des images
const images = [
  "assets/images/films-en-vedette/best_seller.jpg",
  "assets/images/films-en-vedette/naked_gun.jpg",
  "assets/images/films-en-vedette/karate_kid.jpg",
  "assets/images/films-en-vedette/nobody2.jpg",
  "assets/images/films-en-vedette/evanouis.jpg",
  "assets/images/films-en-vedette/wishy.jpg",
];

let idx = 0;

function showBg() {
  document.body.style.backgroundImage = `url('${images[idx]}')`;
  document.body.style.backgroundSize = "100vw 100vh"; // Forcer la taille
}
// modulo pour boucler l'image
function nextBg() {
  idx = (idx + 1) % images.length;
  showBg();
}

// Affiche la première image
showBg();

// Change d'image toutes les 2 secondes
setInterval(nextBg, 2000);
