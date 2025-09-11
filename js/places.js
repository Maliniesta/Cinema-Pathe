document.addEventListener("DOMContentLoaded", () => {
  // Recuperation de  la reservation du localstorage
  const data = JSON.parse(localStorage.getItem("reservation"));
  if (!data) {
    // Si aucune réservation, on retourne au catalogue
    window.location.href = "catalogue.html";
    return;
  }

  // Affichage des details du film
  document.querySelector(".film-image").src = data.image;
  document.querySelector(".film-title").textContent = data.filmTitre;
  document.querySelector(
    ".seance-info"
  ).innerHTML = `Séance <div class="seance-details">${data.horaire} &nbsp;${data.version} <div class="film-fin">Fin prévue à ${data.finPrevue}</div></div>`;
  document.querySelector(
    ".left-container"
  ).style.backgroundImage = `url(${data.image})`;

  // Infos salle et handicap
  const infosBloc = document.querySelector(".infos-salle-handicap");
  infosBloc.innerHTML = `
    <p>Salle : ${data.salle}</p>
    ${
      data.handicap
        ? `<img src="/Cinema-Pathe/assets/images/pictos/w_handicap.png" alt="Accès handicapé" class="b-handicap">`
        : ""
    }
  `;

  // Création de la salle de cinema
  const salleContainer = document.querySelector(".right-container");
  const siegesContainer = document.querySelector(".sieges");
  siegesContainer.innerHTML = "";

  const nombreRangees = 15;
  const blocs = [
    { nom: "gauche", nombre: 3 },
    { nom: "centre", nombre: 10 },
    { nom: "droite", nombre: 3 },
  ];

  // Tableau pour suivre les sièges sélectionnés
  let siegesSelectionnes = [];

  // Message de places disponibles
  const placesDisponibles = document.createElement("p");
  placesDisponibles.className = "places-disponibles";
  salleContainer.insertBefore(placesDisponibles, siegesContainer);

  // boucle sur les rangé
  for (let rangee = 0; rangee < nombreRangees; rangee++) {
    const row = document.createElement("div");
    row.classList.add("row");

    if (rangee === 0) {
      // Rangée spéciale handicap
      const blocDiv = document.createElement("div");
      blocDiv.classList.add("bloc", "handicap-row");
      //Attribution de numero a chaque siege handicapé
      for (let i = 0; i < 6; i++) {
        const seat = document.createElement("div");
        seat.classList.add("seat", "handicap", "available");
        seat.dataset.siegeId = i + 1;
        seat.dataset.rangee = "A";
        seat.dataset.numero = i + 1;
        blocDiv.appendChild(seat);
      }

      row.appendChild(blocDiv);
    } else {
      // Rangées normales
      blocs.forEach((bloc, blocIndex) => {
        const blocDiv = document.createElement("div");
        blocDiv.classList.add("bloc", bloc.nom);

        for (let siege = 0; siege < bloc.nombre; siege++) {
          const seat = document.createElement("div");
          seat.classList.add("seat");
          //attribution d id unique a chaque siege
          const numeroSiege = rangee * 16 + blocIndex * 100 + siege + 1;
          seat.dataset.siegeId = numeroSiege;
          seat.dataset.rangee = String.fromCharCode(65 + rangee);
          seat.dataset.numero = siege + 1;

          // siege reserver aléatoire avec 10% de chance qu il soit reserver
          const random = Math.random();
          seat.classList.add(random < 0.1 ? "reserved" : "available");

          blocDiv.appendChild(seat);
        }

        row.appendChild(blocDiv);
      });
    }

    siegesContainer.appendChild(row);
  }

  // Ajout de placeholder pour cacher certains siege (last et first pour cibler les siege )
  const toutesLesRangees = siegesContainer.querySelectorAll(".row");
  const derniereRangee = toutesLesRangees[toutesLesRangees.length - 1];
  const blocGauche = derniereRangee.querySelector(".bloc.gauche");
  const blocDroite = derniereRangee.querySelector(".bloc.droite");
  const blocCentre = toutesLesRangees[3]?.querySelector(".bloc.centre");

  function remplacerParPlaceholder(bloc, position = "first") {
    const cible = position === "last" ? bloc.lastChild : bloc.firstChild;
    if (cible) {
      const placeholder = document.createElement("div");
      placeholder.classList.add("seat", "placeholder");
      bloc.replaceChild(placeholder, cible);
    }
  }

  blocCentre && remplacerParPlaceholder(blocCentre, "first");
  blocDroite && remplacerParPlaceholder(blocDroite, "last");
  blocGauche && remplacerParPlaceholder(blocGauche, "first");

  // Barre du bas
  const bottomBar = document.createElement("div");
  bottomBar.className = "bottom-bar";
  bottomBar.innerHTML = `
    <div class="legende">
      <div class="legends">
        <div class="legende-item">
          <div class="legende-siege" style="background-image: url('../assets/images/pictos/siege-vert.png');"></div>
          <span>Mes places</span>
        </div>
        <div class="legende-item">
          <div class="legende-siege" style="background-image: url('../assets/images/pictos/siege-jaune.png');"></div>
          <span>Places libres</span>
        </div>
        <div class="legende-item">
          <div class="legende-siege" style="background-image: url('../assets/images/pictos/siege-gris.png');"></div>
          <span>Places réservées</span>
        </div>
      </div>
      <div class="legende-item">
        <span class="count">0</span> places sélectionnées :
        <span class="sieges-liste">-</span>
      </div>
    </div>
    <div class="selection-info">
      <button class="confirm-btn" id="confirmerBtn" disabled>
        Réserver mes places <img src="../assets/images/pictos/fleche-droite.png" class="fleche-droite" alt="flèche" />
      </button>
    </div>
  `;
  salleContainer.appendChild(bottomBar);

  const compteurElement = bottomBar.querySelector(".count");
  const listeElement = bottomBar.querySelector(".sieges-liste");
  const btnConfirmer = bottomBar.querySelector("#confirmerBtn");

  // Selection des siege
  salleContainer.querySelectorAll(".seat").forEach((seat) => {
    seat.addEventListener("click", () => {
      if (
        seat.classList.contains("reserved") ||
        seat.classList.contains("placeholder")
      )
        return;
      //recuperation de l id
      const id = parseInt(seat.dataset.siegeId);
      const label = `${seat.dataset.rangee}${seat.dataset.numero}`;

      if (seat.classList.contains("selected")) {
        // Si déjà sélectionné  on le remet comme avant
        seat.classList.remove("selected");
        seat.classList.add("available");

        if (seat.classList.contains("handicap")) {
          seat.classList.add("handicap");
        }
        //on retire le siege selectionné du tableau
        siegesSelectionnes = siegesSelectionnes.filter((s) => s.id !== id);
      } else {
        if (seat.classList.contains("handicap")) {
          seat.dataset.handicap = "true";
        }

        seat.classList.remove("available", "handicap");
        seat.classList.add("selected");

        siegesSelectionnes.push({ id, label });
      }

      mettreAJourSelection();
    });
  });

  // Mise a jour siege selectionné
  function mettreAJourSelection() {
    compteurElement.textContent = siegesSelectionnes.length;
    listeElement.textContent =
      siegesSelectionnes.length > 0
        ? siegesSelectionnes
            //recupere
            .map((s) => s.label)
            //trie
            .sort()
            .join(", ")
        : "-";
    btnConfirmer.disabled = siegesSelectionnes.length === 0;

    const totalLibres =
      salleContainer.querySelectorAll(".seat.available").length;
    placesDisponibles.textContent = `${totalLibres} places libres`;
  }

  // Créationd un objet avec les data
  btnConfirmer.addEventListener("click", () => {
    const reservationComplete = {
      ...data,
      sieges: siegesSelectionnes,
      nombreSieges: siegesSelectionnes.length,
      dateReservation: new Date().toISOString(),
    };

    // Sauvegarde dans le localStorage pour la page suivante
    localStorage.setItem(
      "reservationComplete",
      JSON.stringify(reservationComplete)
    );

    // Redirection vers la page tarifs
    window.location.href = "tarifs.html";
  });

  // === Initialisation de l'affichage des sièges et compteur ===
  mettreAJourSelection();
});
