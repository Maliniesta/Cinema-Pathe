document.addEventListener("DOMContentLoaded", () => {
  // Récupérer les données de réservation
  const data =
    JSON.parse(localStorage.getItem("reservationComplete")) ||
    JSON.parse(localStorage.getItem("reservationFinale"));

  if (!data) {
    alert("Erreur: aucune réservation trouvée !");
    window.location.href = "catalogue.html";
    return;
  }

  // === Affichage infos film ===
  const filmTitle = document.querySelector(".film-title");
  const filmImage = document.querySelector(".film-image");
  const filmSummary = document.querySelector(".film-summary");
  const seanceInfo = document.querySelector(".seance-info");
  const infosSalleHandicap = document.querySelector(".infos-salle-handicap");
  const siegesListe = document.querySelector(".sieges-liste");

  if (filmTitle && data.filmTitre) filmTitle.textContent = data.filmTitre;
  if (filmImage && data.image) filmImage.src = data.image;
  if (filmSummary && data.image) {
    filmSummary.style.backgroundImage = `url(${data.image})`;
    filmSummary.style.backgroundSize = "cover";
    filmSummary.style.backgroundPosition = "center";
  }
  if (seanceInfo && data.horaire) {
    seanceInfo.innerHTML = `Séance <div class="seance-details">${
      data.horaire
    } ${data.version || ""} <div class="film-fin">Fin prévue à ${
      data.finPrevue || ""
    }</div></div>`;
  }

  if (siegesListe && data.sieges) {
    siegesListe.textContent = data.sieges.map((s) => s.label).join(", ");
  }

  // === Remplir les informations du ticket dans .ticket-container ===

  // Titre du film
  const filmTitleEl = document.getElementById("filmTitle");
  if (filmTitleEl && data.filmTitre) {
    filmTitleEl.textContent = data.filmTitre.toUpperCase();
  }

  // Horaire et version
  const seanceHoraireEl = document.getElementById("seanceHoraire");
  if (seanceHoraireEl && data.horaire) {
    seanceHoraireEl.textContent = `${data.horaire} ${data.version || "VF"}`;
  }

  // Salle
  const salleNameEl = document.getElementById("salleName");
  if (salleNameEl && data.salle) {
    salleNameEl.textContent = data.salle;
  }

  // Sièges
  const siegesInfoEl = document.getElementById("siegesInfo");
  if (siegesInfoEl && data.sieges) {
    const siegesText = data.sieges.map((s) => s.label).join(", ");
    siegesInfoEl.textContent = siegesText;
  }

  // === Calcul du total ===
  let total = 0;

  // Tarifs
  if (data.tarifs?.adulte) {
    total += data.tarifs.adulte.count * data.tarifs.adulte.prix;
  }
  if (data.tarifs?.moins14) {
    total += data.tarifs.moins14.count * data.tarifs.moins14.prix;
  }

  // Réduction promo
  if (data.reductionPromo) {
    total -= data.reductionPromo;
  }

  // Snacks
  if (Array.isArray(data.snacks?.items)) {
    data.snacks.items.forEach(({ prix, quantite }) => {
      total += prix * quantite;
    });
  }

  total = Math.max(0, total);

  // Afficher le total
  const totalPriceEl = document.getElementById("totalPrice");
  if (totalPriceEl) {
    totalPriceEl.textContent = `${total.toFixed(2).replace(".", ",")} €`;
  }
});

function goBack() {
  // Nettoyer les données de réservation
  localStorage.removeItem("commande_complete");
  localStorage.removeItem("reservationComplete");
  localStorage.removeItem("reservationFinale");

  // Rediriger vers l'accueil
  window.location.href = "../index.html";
}
