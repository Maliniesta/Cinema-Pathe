// =====================================================
// 1. Chargement du fichier JSON contenant la liste des films
// =====================================================
fetch("../JSON/films.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Erreur lors du chargement du fichier JSON");
    }
    return response.json(); // Conversion du JSON en objet JS
  })

  .then((films) => {
    // =====================================================
    // 2. Déclaration des variables principales
    // =====================================================
    const container = document.querySelector(".films-container"); // Zone où on affiche les films
    let allFilms = films; // On garde la liste complète pour appliquer les filtres

    // =====================================================
    // 3. Fonction qui affiche les films
    // =====================================================
    function renderFilms(filmsToRender) {
      container.innerHTML = ""; // On vide l'affichage avant de le remplir

      filmsToRender.forEach((film) => {
        const filmCard = document.createElement("div");
        filmCard.classList.add("film-card");

        // --- 3.1 Ajout d’un tag (nouveau ou frisson) ---
        let tagImage = "";
        if (film.mention_frisson) {
          tagImage = `<img src="/assets/images/pictos/frisson.png" alt="Frisson" class="tag-image">`;
        } else if (film.nouveau) {
          tagImage = `<img src="/assets/images/pictos/nouveau.jpg" alt="Nouveau" class="tag-image">`;
        }

        // --- 3.2 Ajout des pictos (-12 ans, violence, etc.) ---
        let pictos = "";
        if (film.âge_minimum >= 12) {
          pictos += `<img src="/assets/images/pictos/-12ans.png" alt="-12" class="pictos">`;
        }
        if (film.avertissement_violence) {
          pictos += `<img src="/assets/images/pictos/violence.jpg" alt="Violence" class="pictos">`;
        }

        // --- 3.3 Calcul de la durée affichée ---
        const duree = `(${Math.floor(film.durée_minutes / 60)}h${
          film.durée_minutes % 60
        })`;

        // --- 3.4 Construction de la liste des séances ---
        let seancesHTML = '<div class="seance-container">';

        film.séances.forEach((seance) => {
          // Langue (VF / VOST)
          let version = "";
          if (seance.vf) version = "VF";
          else if (seance.vost) version = "VOST";

          // Qualité (4K, IMAX, 4DX)
          let qualites = [];
          if (seance["4k"]) qualites.push("4K");
          if (seance.imax) qualites.push("IMAX");
          if (seance["4D"]) qualites.push("4DX");

          // Accessibilité handicap
          let access = seance.handicap
            ? '<img src="/assets/images/pictos/w_handicap.png" alt="Handicapé" class="w-handicap">'
            : "";

          // Lien séance (cliquable vers places.html)
          seancesHTML += `
            <a href="places.html" 
               class="seance" 
               data-film="${film.titre}" 
               data-horaire="${seance.horaire}" 
               data-version="${version}" 
               data-qualites="${qualites.join(" ")}"
               data-image="${film.image}"
               data-salle="${seance.salle}"
               data-handicap="${seance.handicap}">
              <div class="seance-details">
                <div class="qualite">${qualites.join(" ")}</div>
                <div class="horaire">${
                  seance.horaire
                } <span class="version">${version}</span></div>
              </div>
              <div class="access">${access}</div>
            </a>
          `;
        });

        seancesHTML += "</div>";

        // --- 3.5 Construction de la carte film ---
        filmCard.innerHTML = `
          <div class="film-content">
            <div class="film-affiche">
              <div class="film-image">
                <img src="${film.image}" alt="${film.titre}" class="film-image">
              </div>
              <div class="film-info">
                <div class="film-title">
                  ${tagImage}
                  <h2>${film.titre}</h2>
                </div>
                <div class="film-details">
                  <p class="genre">${film.genre.join(", ")}</p>
                  <p class="duree">${duree}</p>
                  ${pictos}
                </div>
              </div>
            </div>
            ${seancesHTML}
          </div>
        `;

        container.appendChild(filmCard);
      });

      // =====================================================
      // 4. Listeners sur les séances (sauvegarde en localStorage)
      // =====================================================
      document.querySelectorAll(".seance").forEach((seanceEl) => {
        seanceEl.addEventListener("click", () => {
          const filmTitre = seanceEl.dataset.film;
          const horaire = seanceEl.dataset.horaire;
          const version = seanceEl.dataset.version;
          const qualites = seanceEl.dataset.qualites;
          const image = seanceEl.dataset.image;
          const salle = seanceEl.dataset.salle;
          const handicap = seanceEl.dataset.handicap === "true";

          // Durée du film pour calcul de fin
          const film = films.find((f) => f.titre === filmTitre);
          const dureeMinutes = film?.durée_minutes || 0;

          // Conversion horaire → Date
          const [heures, minutes] = horaire.split(":").map(Number);
          const dateDebut = new Date();
          dateDebut.setHours(heures);
          dateDebut.setMinutes(minutes);
          dateDebut.setSeconds(0);

          // Calcul de l’heure de fin
          const dateFin = new Date(dateDebut.getTime() + dureeMinutes * 60000);
          const finPrevue = `${String(dateFin.getHours()).padStart(
            2,
            "0"
          )}:${String(dateFin.getMinutes()).padStart(2, "0")}`;

          // Sauvegarde de la réservation
          localStorage.setItem(
            "reservation",
            JSON.stringify({
              filmTitre,
              horaire,
              version,
              qualites,
              image,
              salle,
              handicap,
              finPrevue,
            })
          );
        });
      });
    }

    // =====================================================
    // 5. Gestion des filtres
    // =====================================================
    const genreSelect = document.getElementById("filter-genre");
    const formatSelect = document.getElementById("filter-format");
    const langSelect = document.getElementById("filter-lang");
    const searchInput = document.getElementById("search-film");

    // Fonction qui applique les filtres
    function applyFilters() {
      const genre = genreSelect.value.toLowerCase();
      let format = formatSelect.value.toLowerCase();
      const lang = langSelect.value.toLowerCase();
      const search = searchInput.value.toLowerCase();

      // Si "Qualitée" est sélectionné → pas de filtre
      if (format === "qualitée") format = "";

      // Filtrage
      const filtered = allFilms.filter((film) => {
        // Genre
        if (genre && !film.genre.map((g) => g.toLowerCase()).includes(genre)) {
          return false;
        }

        // Format (qualité)
        if (format) {
          const hasFormat = film.séances.some((s) => {
            if (format === "4k" && s["4k"]) return true;
            if (format === "imax" && s.imax) return true;
            if (format === "4dx" && s["4D"]) return true;
            return false;
          });
          if (!hasFormat) return false;
        }

        // Langue
        if (lang) {
          const hasLang = film.séances.some(
            (s) => (lang === "vf" && s.vf) || (lang === "vost" && s.vost)
          );
          if (!hasLang) return false;
        }

        // Recherche (titre)
        if (search && !film.titre.toLowerCase().includes(search)) {
          return false;
        }

        return true;
      });

      // Réaffichage
      renderFilms(filtered);
    }

    // Ajout des écouteurs sur les filtres
    genreSelect.addEventListener("change", applyFilters);
    formatSelect.addEventListener("change", applyFilters);
    langSelect.addEventListener("change", applyFilters);
    searchInput.addEventListener("input", applyFilters);

    // =====================================================
    // 6. Affichage initial (tous les films)
    // =====================================================
    renderFilms(allFilms);
  })

  // =====================================================
  // 7. Gestion des erreurs de chargement
  // =====================================================
  .catch((error) => {
    console.error("Erreur :", error);
  });
