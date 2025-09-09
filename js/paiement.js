document.addEventListener("DOMContentLoaded", () => {
  // 🔹 Récupération des données de réservation depuis le localStorage
  const data = JSON.parse(localStorage.getItem("reservationComplete"));

  if (!data) {
    alert("Erreur: aucune réservation trouvée !");
    window.location.href = "catalogue.html";
    return;
  }

  // 🔹 Fonction pour convertir les snacks en tableau uniforme
  function snacksToArray(items) {
    if (!items) return [];
    if (Array.isArray(items)) return items;
    if (typeof items === "object") {
      return Object.keys(items).map((nom) => {
        const it = items[nom];
        return {
          nom,
          prix: Number(it.prix) || 0,
          quantite: Number(it.quantite) || 0,
        };
      });
    }
    return [];
  }

  // 🔹 Sélection des éléments HTML pour affichage
  const filmTitle = document.querySelector(".film-title");
  const filmImage = document.querySelector(".film-image");
  const filmSummary = document.querySelector(".film-summary");
  const seanceInfo = document.querySelector(".seance-info");
  const infosSalleHandicap = document.querySelector(".infos-salle-handicap");
  const siegesListe = document.querySelector(".sieges-liste");
  const recapListe = document.querySelector(".recap-liste");
  const totalPrixEl = document.querySelector(".total-prix");

  // 🔹 Formulaire paiement
  const cardNumberInput = document.getElementById("cardNumber");
  const expiryInput = document.getElementById("expiry");
  const cvvInput = document.getElementById("cvv");
  const continueBtn = document.querySelector(".continue-btn");

  // 🔹 Affichage des informations du film
  if (filmTitle) filmTitle.textContent = data.filmTitre;
  if (filmImage) filmImage.src = data.image;
  if (filmSummary) {
    filmSummary.style.backgroundImage = `url(${data.image})`;
    filmSummary.style.backgroundSize = "cover";
    filmSummary.style.backgroundPosition = "center";
  }
  if (seanceInfo) {
    seanceInfo.innerHTML = `Séance <div class="seance-details">${data.horaire} ${data.version}<div class="film-fin">Fin prévue à ${data.finPrevue}</div></div>`;
  }
  if (infosSalleHandicap) {
    infosSalleHandicap.innerHTML = `<p>Salle : ${data.salle}</p>${
      data.handicap
        ? `<img src="/Cinema-Pathe/assets/images/pictos/w_handicap.png" alt="Accès handicapé" class="b-handicap">`
        : ""
    }`;
  }
  if (siegesListe)
    siegesListe.textContent = data.sieges.map((s) => s.label).join(", ");

  // 🔹 Calcul du total pour les places
  function calcTotalFilm() {
    let total = 0;
    if (data.tarifs?.adulte)
      total += data.tarifs.adulte.count * Number(data.tarifs.adulte.prix);
    if (data.tarifs?.moins14)
      total += data.tarifs.moins14.count * Number(data.tarifs.moins14.prix);
    if (data.reductionPromo) total -= Number(data.reductionPromo);
    return Math.max(0, total);
  }

  // 🔹 Calcul du total pour les snacks
  function calcTotalSnacks() {
    const snacksArray = snacksToArray(data.snacks?.items);
    return snacksArray.reduce(
      (sum, snack) => sum + snack.quantite * snack.prix,
      0
    );
  }

  // 🔹 Calcul du total global
  function calcTotalGlobal() {
    return calcTotalFilm() + calcTotalSnacks();
  }

  // 🔹 Affichage du récapitulatif et du total
  function afficherRecap() {
    const totalGlobal = calcTotalGlobal();
    if (recapListe) {
      recapListe.innerHTML = "";
      if (data.tarifs?.adulte?.count > 0) {
        const montantAdulte =
          data.tarifs.adulte.count * data.tarifs.adulte.prix;
        recapListe.innerHTML += `<div class="recap-item"><span>${
          data.tarifs.adulte.count
        }x Adulte</span><span>${montantAdulte.toFixed(2)}€</span></div>`;
      }
      if (data.tarifs?.moins14?.count > 0) {
        const montantEnfant =
          data.tarifs.moins14.count * data.tarifs.moins14.prix;
        recapListe.innerHTML += `<div class="recap-item"><span>${
          data.tarifs.moins14.count
        }x Moins de 14 ans</span><span>${montantEnfant.toFixed(
          2
        )}€</span></div>`;
      }
      if (data.reductionPromo && Number(data.reductionPromo) > 0) {
        recapListe.innerHTML += `<div class="recap-item recap-promo"><span>Code promo</span><span>-${Number(
          data.reductionPromo
        ).toFixed(2)}€</span></div>`;
      }
      const snacksArray = snacksToArray(data.snacks?.items);
      snacksArray.forEach((snack) => {
        if (snack.quantite > 0) {
          const montantSnack = snack.quantite * snack.prix;
          recapListe.innerHTML += `<div class="recap-item"><span>${
            snack.quantite
          }x ${snack.nom}</span><span>${montantSnack.toFixed(2)}€</span></div>`;
        }
      });
    }
    if (totalPrixEl) totalPrixEl.textContent = `${totalGlobal.toFixed(2)}€`;
    return totalGlobal;
  }

  // 🔹 Total final
  let totalFinal =
    data.prixTotalFinal && data.prixTotalFinal > 0
      ? data.prixTotalFinal
      : afficherRecap();
  if (totalPrixEl) totalPrixEl.textContent = `${totalFinal.toFixed(2)}€`;

  // 🔹 Fonctions pour gérer les messages d'erreur
  function afficherErreur(inputElement, message) {
    // Chercher s'il y a déjà un message d'erreur pour cet élément
    const existingError =
      inputElement.parentNode.querySelector(".error-message");

    if (existingError) {
      // Mettre à jour le message existant
      existingError.textContent = message;
    } else {
      // Créer un nouveau message d'erreur
      const errorDiv = document.createElement("div");
      errorDiv.className = "error-message";
      errorDiv.style.cssText = "color: red; font-size: 14px; margin-top: 5px;";
      errorDiv.textContent = message;
      inputElement.parentNode.appendChild(errorDiv);
    }
  }

  function supprimerErreur(inputElement) {
    const existingError =
      inputElement.parentNode.querySelector(".error-message");
    if (existingError) {
      existingError.remove();
    }
  }

  // 🔹 Validation individuelle de chaque champ avec affichage d'erreur
  function validateCardNumber() {
    if (!cardNumberInput) return true;

    const cardValue = cardNumberInput.value.replace(/\s+/g, "");

    if (cardValue.length === 0) {
      afficherErreur(cardNumberInput, "Veuillez saisir un numéro de carte");
      return false;
    } else if (cardValue.length !== 16) {
      afficherErreur(
        cardNumberInput,
        "Le numéro de carte doit contenir 16 chiffres"
      );
      return false;
    } else if (!/^\d+$/.test(cardValue)) {
      afficherErreur(
        cardNumberInput,
        "Le numéro de carte ne doit contenir que des chiffres"
      );
      return false;
    } else {
      supprimerErreur(cardNumberInput);
      return true;
    }
  }

  function validateExpiry() {
    if (!expiryInput) return true;

    const expiryValue = expiryInput.value.trim();

    if (expiryValue.length === 0) {
      afficherErreur(expiryInput, "Veuillez saisir la date d'expiration");
      return false;
    } else if (!/^\d{2}\/\d{2}$/.test(expiryValue)) {
      afficherErreur(expiryInput, "Format attendu: MM/AA (ex: 12/25)");
      return false;
    } else {
      supprimerErreur(expiryInput);
      return true;
    }
  }

  function validateCVV() {
    if (!cvvInput) return true;

    const cvvValue = cvvInput.value.trim();

    if (cvvValue.length === 0) {
      afficherErreur(cvvInput, "Veuillez saisir le code CVV");
      return false;
    } else if (cvvValue.length < 3) {
      afficherErreur(cvvInput, "Le code CVV doit contenir au moins 3 chiffres");
      return false;
    } else if (!/^\d+$/.test(cvvValue)) {
      afficherErreur(cvvInput, "Le code CVV ne doit contenir que des chiffres");
      return false;
    } else {
      supprimerErreur(cvvInput);
      return true;
    }
  }

  // 🔹 Fonction globale de validation
  function validateInputs() {
    const isCardValid = validateCardNumber();
    const isExpiryValid = validateExpiry();
    const isCvvValid = validateCVV();

    return isCardValid && isExpiryValid && isCvvValid;
  }

  // 🔹 Fonction pour activer/désactiver le bouton
  function updateButtonState() {
    if (continueBtn) {
      const isFormValid = validateInputs();
      continueBtn.disabled = !isFormValid;

      if (isFormValid) {
        continueBtn.style.opacity = "1";
        continueBtn.style.cursor = "pointer";
      } else {
        continueBtn.style.opacity = "0.5";
        continueBtn.style.cursor = "not-allowed";
      }
    }
  }

  // 🔹 Ajout des événements pour validation en temps réel
  if (cardNumberInput) {
    cardNumberInput.addEventListener("input", () => {
      validateCardNumber();
      updateButtonState();
    });
    cardNumberInput.addEventListener("blur", validateCardNumber);
  }

  if (expiryInput) {
    expiryInput.addEventListener("input", () => {
      validateExpiry();
      updateButtonState();
    });
    expiryInput.addEventListener("blur", validateExpiry);
  }

  if (cvvInput) {
    cvvInput.addEventListener("input", () => {
      validateCVV();
      updateButtonState();
    });
    cvvInput.addEventListener("blur", validateCVV);
  }

  // 🔹 Validation initiale au chargement
  updateButtonState();

  // 🔹 Bouton continuer : si formulaire invalide, afficher une alerte
  if (continueBtn) {
    continueBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (!validateInputs()) {
        alert(
          "⚠️ Les champs du formulaire sont invalides. Vérifiez vos informations."
        );
        return;
      }

      // Formulaire valide → traitement du paiement
      continueBtn.disabled = true;
      continueBtn.textContent = "Validation en cours...";

      const successMessage = document.createElement("div");
      successMessage.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: #4CAF50; color: white; padding: 20px 40px; border-radius: 8px;
        font-size: 18px; font-weight: bold; z-index: 10000; box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      `;
      successMessage.textContent = "✅ Paiement validé ! Redirection...";
      document.body.appendChild(successMessage);

      setTimeout(() => {
        successMessage.remove();
        const paymentData = {
          ...data,
          paiement: {
            montantTotal: totalFinal,
            datePaiement: new Date().toISOString(),
            statut: "validé",
          },
        };
        localStorage.setItem("commande_complete", JSON.stringify(paymentData));
        window.location.href = "ticket.html";
      }, 2000);
    });
  }
});
