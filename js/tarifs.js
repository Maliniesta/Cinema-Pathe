document.addEventListener("DOMContentLoaded", () => {
  // Récupération des données de réservation complètes (film + sièges)
  const data = JSON.parse(localStorage.getItem("reservationComplete"));

  // Sécurité : si pas de données, retour au catalogue
  if (!data) {
    window.location.href = "catalogue.html";
    return;
  }

  // === REMPLISSAGE DES INFORMATIONS FILM / SALLE ===
  const infosBloc = document.querySelector(".infos-salle-handicap");
  if (infosBloc) {
    infosBloc.innerHTML = `
      <p>Salle : ${data.salle}</p>
      ${
        data.handicap
          ? `<img src="/assets/images/pictos/w_handicap.png" alt="Accès handicapé" class="b-handicap">`
          : ""
      }
    `;
  }

  const filmImage = document.querySelector(".film-image");
  if (filmImage) filmImage.src = data.image;

  const filmTitle = document.querySelector(".film-title");
  if (filmTitle) filmTitle.textContent = data.filmTitre;

  const seanceInfo = document.querySelector(".seance-info");
  if (seanceInfo) {
    seanceInfo.innerHTML = `
      Séance 
      <div class="seance-details">
        ${data.horaire} &nbsp;${data.version} 
        <div class="film-fin">Fin prévue à ${data.finPrevue}</div>
      </div>
    `;
  }

  const filmSummary = document.querySelector(".film-summary");
  if (filmSummary) filmSummary.style.backgroundImage = `url(${data.image})`;

  const siegesListe = document.querySelector(".sieges-liste");
  if (siegesListe && data.sieges) {
    siegesListe.textContent = data.sieges.map((s) => s.label).join(", ");
  }

  // === TARIFS ===
  const adultePrix = 9.9;
  const moins14Prix = 6.5;
  let adulteCount = 0;
  let moins14Count = 0;
  let reductionPromo = 0;

  const nombrePlacesSelectionnees = data.sieges.length;

  const recapListe = document.querySelector(".recap-liste");
  const totalPrix = document.querySelector(".total-prix");
  const continuerBtn = document.querySelector(".continue-btn");

  // === FONCTION MISE À JOUR DU RÉCAP ===
  function mettreAJourRecap() {
    if (!recapListe) return;
    recapListe.innerHTML = "";
    let total = 0;

    // Tarifs adulte
    if (adulteCount > 0) {
      const sousTotal = adulteCount * adultePrix;
      total += sousTotal;
      recapListe.innerHTML += `
        <div class="recap-item">
          <div class="recap-label">${adulteCount}x Adulte</div>
          <div class="recap-prix">${sousTotal.toFixed(2)}€</div>
        </div>
      `;
    }

    // Tarifs moins de 14 ans
    if (moins14Count > 0) {
      const sousTotal = moins14Count * moins14Prix;
      total += sousTotal;
      recapListe.innerHTML += `
        <div class="recap-item">
          <div class="recap-label">${moins14Count}x Moins de 14 ans</div>
          <div class="recap-prix">${sousTotal.toFixed(2)}€</div>
        </div>
      `;
    }

    // Réduction promo
    if (reductionPromo > 0) {
      recapListe.innerHTML += `
        <div class="recap-item recap-promo">
          <div class="recap-label">Code promo MALIK</div>
          <div class="recap-prix">-${reductionPromo.toFixed(2)}€</div>
        </div>
      `;
      total -= reductionPromo;
    }

    total = Math.max(0, total); // Sécurité total positif
    if (totalPrix) totalPrix.textContent = `${total.toFixed(2)}€`;
  }

  // === FONCTION POUR ACTIVER/DÉSACTIVER BOUTON CONTINUER ===
  function updateContinueButton() {
    if (!continuerBtn) return;
    continuerBtn.disabled =
      adulteCount + moins14Count !== nombrePlacesSelectionnees;
  }

  // === BOUTONS PLUS / MOINS ===
  const plusAdulteBtn = document.querySelector(
    ".plus-btn[data-tarif='adulte']"
  );
  const moinsAdulteBtn = document.querySelector(
    ".moins-btn[data-tarif='adulte']"
  );
  const plusMoins14Btn = document.querySelector(
    ".plus-btn[data-tarif='moins14']"
  );
  const moinsMoins14Btn = document.querySelector(
    ".moins-btn[data-tarif='moins14']"
  );

  plusAdulteBtn?.addEventListener("click", () => {
    if (adulteCount + moins14Count < nombrePlacesSelectionnees) {
      adulteCount++;
      document.querySelector(".tarif-count[data-tarif='adulte']").textContent =
        adulteCount;
      mettreAJourRecap();
      updateContinueButton();
    }
  });

  moinsAdulteBtn?.addEventListener("click", () => {
    if (adulteCount > 0) {
      adulteCount--;
      document.querySelector(".tarif-count[data-tarif='adulte']").textContent =
        adulteCount;
      mettreAJourRecap();
      updateContinueButton();
    }
  });

  plusMoins14Btn?.addEventListener("click", () => {
    if (adulteCount + moins14Count < nombrePlacesSelectionnees) {
      moins14Count++;
      document.querySelector(".tarif-count[data-tarif='moins14']").textContent =
        moins14Count;
      mettreAJourRecap();
      updateContinueButton();
    }
  });

  moinsMoins14Btn?.addEventListener("click", () => {
    if (moins14Count > 0) {
      moins14Count--;
      document.querySelector(".tarif-count[data-tarif='moins14']").textContent =
        moins14Count;
      mettreAJourRecap();
      updateContinueButton();
    }
  });

  // === BOUTON MODIFIER VOS PLACES ===
  const modifBtn = document.querySelector(".modif-btn");
  modifBtn?.addEventListener("click", () => {
    window.location.href = "places.html";
  });

  // === BOUTON CONTINUER ===
  continuerBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    if (adulteCount + moins14Count === nombrePlacesSelectionnees) {
      const prixTotal = Math.max(
        0,
        adulteCount * adultePrix + moins14Count * moins14Prix - reductionPromo
      );

      const reservationFinale = {
        ...data,
        tarifs: {
          adulte: { prix: adultePrix, count: adulteCount },
          moins14: { prix: moins14Prix, count: moins14Count },
        },
        reductionPromo,
        prixTotal,
        dateSelection: new Date().toISOString(),
      };

      localStorage.setItem(
        "reservationFinale",
        JSON.stringify(reservationFinale)
      );
      window.location.href = "snack.html"; // suite logique
    } else {
      alert(
        `Veuillez sélectionner des tarifs pour toutes vos places (${nombrePlacesSelectionnees} places sélectionnées, ${
          adulteCount + moins14Count
        } tarifs choisis)`
      );
    }
  });

  // === GESTION CODE PROMO / CINEPASS ===
  const ajouterBtn = document.querySelector(".ajouter-btn");
  ajouterBtn?.addEventListener("click", () => {
    const codeInput = document.querySelector(".cinepass-input");
    const code = codeInput.value.trim().toLowerCase();

    if (code === "malik") {
      if (reductionPromo === 0) {
        reductionPromo = 5;
        alert("Code promo MALIK appliqué ! Réduction de 5€");
        mettreAJourRecap();
        codeInput.value = "";
      } else {
        alert("Un code promo est déjà appliqué !");
      }
    } else if (code) {
      alert(`Code "${code}" non reconnu.`);
    } else {
      alert("Veuillez saisir un code.");
    }
  });

  // === INITIALISATION ===
  mettreAJourRecap();
  updateContinueButton();
});
