document.addEventListener("DOMContentLoaded", () => {
  // Récupération de la réservation
  let data =
    JSON.parse(localStorage.getItem("reservationFinale")) ||
    JSON.parse(localStorage.getItem("reservationComplete"));

  if (!data) {
    alert("Erreur: données de réservation non trouvées");
    window.location.href = "catalogue.html";
    return;
  }

  // Sélecteurs DOM
  const filmTitleEl = document.querySelector(".film-title");
  const filmImageEl = document.querySelector(".film-image");
  const seanceInfoEl = document.querySelector(".seance-info");
  const filmSummaryEl = document.querySelector(".film-summary");
  const siegesListeEl = document.querySelector(".sieges-liste");
  const snackContainer = document.querySelector(".snack-container");
  const recapListe = document.querySelector(".recap-liste");
  const totalPrixEl = document.querySelector(".total-prix");
  const continueBtn = document.querySelector(".continue-btn");

  // Initialisation affichage film
  if (filmTitleEl) filmTitleEl.textContent = data.filmTitre || "";
  if (filmImageEl) filmImageEl.src = data.image || "";
  if (filmSummaryEl && data.image)
    filmSummaryEl.style.backgroundImage = `url(${data.image})`;
  if (seanceInfoEl)
    seanceInfoEl.innerHTML = `Séance <div class="seance-details">${
      data.horaire || ""
    } ${data.version || ""} <div class="film-fin">Fin prévue à ${
      data.finPrevue || ""
    }</div></div>`;
  if (siegesListeEl && data.sieges)
    siegesListeEl.textContent = data.sieges.map((s) => s.label).join(", ");

  // ⚡ Gestion des snacks
  let snacksSelectionnes = [];

  function initSnacks() {
    const items = data.snacks?.items;
    if (!items) return;
    if (Array.isArray(items)) {
      snacksSelectionnes = items.map((it) => ({
        nom: it.nom,
        prix: Number(it.prix) || 0,
        quantite: Number(it.quantite) || 0,
      }));
    } else if (typeof items === "object") {
      snacksSelectionnes = Object.keys(items).map((nom) => {
        const it = items[nom] || {};
        return {
          nom,
          prix: Number(it.prix) || 0,
          quantite: Number(it.quantite) || 0,
        };
      });
    }
    console.log("Snacks initialisés :", snacksSelectionnes);
  }

  function updateSnackQtyDisplay(nom) {
    const el = document.querySelector(
      `[data-snack="${CSS.escape(nom)}"] .snack-count`
    );
    if (el) {
      const s = snacksSelectionnes.find((s) => s.nom === nom);
      el.textContent = s ? s.quantite : 0;
    }
  }

  function ajouterSnack(nom, prix, quantite = 1) {
    let s = snacksSelectionnes.find((s) => s.nom === nom);
    if (s) s.quantite += quantite;
    else snacksSelectionnes.push({ nom, prix, quantite });
    updateSnackQtyDisplay(nom);
    afficherRecap();
  }

  function retirerSnack(nom) {
    let s = snacksSelectionnes.find((s) => s.nom === nom);
    if (!s) return;
    s.quantite -= 1;
    if (s.quantite <= 0)
      snacksSelectionnes = snacksSelectionnes.filter((x) => x.nom !== nom);
    updateSnackQtyDisplay(nom);
    afficherRecap();
  }

  function calcTotalSnacks() {
    return snacksSelectionnes.reduce((sum, s) => sum + s.prix * s.quantite, 0);
  }

  function calcTotalFilm() {
    let total = 0;
    if (data.tarifs?.adulte)
      total +=
        (data.tarifs.adulte.count || 0) *
        (Number(data.tarifs.adulte.prix) || 0);
    if (data.tarifs?.moins14)
      total +=
        (data.tarifs.moins14.count || 0) *
        (Number(data.tarifs.moins14.prix) || 0);
    if (data.reductionPromo) total -= Number(data.reductionPromo) || 0;
    return Math.max(0, total);
  }

  function afficherRecap() {
    if (!recapListe) return;
    recapListe.innerHTML = "";

    // Film
    if (data.tarifs?.adulte?.count > 0) {
      const montant =
        (data.tarifs.adulte.count || 0) *
        (Number(data.tarifs.adulte.prix) || 0);
      recapListe.innerHTML += `<div class="recap-item"><div class="recap-label">${
        data.tarifs.adulte.count
      }x Adulte</div><div class="recap-prix">${montant.toFixed(
        2
      )}€</div></div>`;
    }
    if (data.tarifs?.moins14?.count > 0) {
      const montant =
        (data.tarifs.moins14.count || 0) *
        (Number(data.tarifs.moins14.prix) || 0);
      recapListe.innerHTML += `<div class="recap-item"><div class="recap-label">${
        data.tarifs.moins14.count
      }x Moins de 14 ans</div><div class="recap-prix">${montant.toFixed(
        2
      )}€</div></div>`;
    }
    if (data.reductionPromo && Number(data.reductionPromo) > 0) {
      recapListe.innerHTML += `<div class="recap-item recap-promo"><div class="recap-label">Code promo</div><div class="recap-prix">-${Number(
        data.reductionPromo
      ).toFixed(2)}€</div></div>`;
    }

    // Snacks
    snacksSelectionnes.forEach((s) => {
      if (s.quantite > 0) {
        const montant = s.prix * s.quantite;
        const wrapper = document.createElement("div");
        wrapper.className = "recap-item";
        wrapper.dataset.snackRecap = s.nom;
        wrapper.innerHTML = `
          <div class="recap-label">${s.quantite}x ${s.nom}</div>
          <div class="recap-prix">${montant.toFixed(
            2
          )}€ <button class="supprimer-btn" aria-label="Supprimer ${
          s.nom
        }"><img src="../assets/images/pictos/poubelle.png" alt="supprimer" class="icone-supprimer" /></button></div>
        `;
        recapListe.appendChild(wrapper);

        // bouton supprimer
        const btn = wrapper.querySelector(".supprimer-btn");
        if (btn)
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            retirerSnack(s.nom);
          });
      }
    });

    // Total global
    const totalGlobal = calcTotalFilm() + calcTotalSnacks();
    if (totalPrixEl) totalPrixEl.textContent = `${totalGlobal.toFixed(2)}€`;
    console.log(
      "Total film:",
      calcTotalFilm(),
      "Total snacks:",
      calcTotalSnacks(),
      "Total global:",
      totalGlobal
    );
  }

  // ⚡ Charger les snacks depuis JSON et créer les boutons +/−
  if (snackContainer) {
    fetch("https://maliniesta.github.io/Cinema-Pathe/JSON/snack.json")
      .then((r) => {
        if (!r.ok) throw new Error("Erreur chargement snack.json");
        return r.json();
      })
      .then((snackData) => {
        snackContainer.innerHTML = "";
        Object.keys(snackData).forEach((categorie) => {
          const produits = snackData[categorie];
          const titre = document.createElement("h5");
          titre.className = "snack-categorie";
          titre.textContent = categorie;
          snackContainer.appendChild(titre);

          const section = document.createElement("div");
          section.className = "snack-section";

          produits.forEach((produit) => {
            const nom = produit.nom;
            const prix = Number(produit.prix) || 0;
            const image = produit.image || "";

            const div = document.createElement("div");
            div.className = "snack-item";
            div.setAttribute("data-snack", nom);
            div.innerHTML = `
              <img src="${image}" alt="${nom}" class="snack-img" />
              <div class="snack-selection">
                <span class="snack-nom">${nom}</span>
                <div class="snack-choice">
                  <span class="snack-prix">${prix.toFixed(2)}€</span>
                  <div class="snack-controls">
                    <button class="moins-btn" data-snack="${nom}" aria-label="moins"><img src="../assets/images/pictos/moins-btn.png" class="image-moins-btn" alt="Moins"/></button>
                    <span class="snack-count">0</span>
                    <button class="plus-btn" data-snack="${nom}" aria-label="plus"><img src="../assets/images/pictos/plus-btn.png" class="image-plus-btn" alt="Plus"/></button>
                  </div>
                </div>
              </div>
            `;

            // bouton +/−
            div.querySelector(".plus-btn")?.addEventListener("click", (e) => {
              e.stopPropagation();
              ajouterSnack(nom, prix);
            });
            div.querySelector(".moins-btn")?.addEventListener("click", (e) => {
              e.stopPropagation();
              retirerSnack(nom);
            });

            // afficher quantité existante
            const existing = snacksSelectionnes.find((s) => s.nom === nom);
            if (existing)
              div.querySelector(".snack-count").textContent = existing.quantite;

            section.appendChild(div);
          });

          snackContainer.appendChild(section);
        });

        afficherRecap();
      })
      .catch((err) => {
        console.error(err);
        afficherRecap();
      });
  }

  // ⚡ Initialisation
  initSnacks();
  afficherRecap();

  // Finaliser réservation
  function finaliserReservation() {
    const filmTotal = calcTotalFilm();
    const snacksTotal = calcTotalSnacks();
    const prixTotalFinal = Number((filmTotal + snacksTotal).toFixed(2));

    const reservationComplete = {
      ...data,
      snacks: { items: [...snacksSelectionnes], total: snacksTotal },
      prixTotalFinal,
      dateFinalisation: new Date().toISOString(),
    };

    localStorage.setItem(
      "reservationComplete",
      JSON.stringify(reservationComplete)
    );
    window.location.href = "paiement.html";
  }

  if (continueBtn) {
    continueBtn.disabled = false;
    continueBtn.addEventListener("click", (e) => {
      e.preventDefault();
      finaliserReservation();
    });
  }
});
