# 🎬 Projet – Application Cinéma Pathé

 Contexte  
Ce projet reproduit le fonctionnement d’une borne interactive de cinéma Pathé.  
L’utilisateur peut :  
- Voir les films à l’affiche  
- Choisir une séance et réserver des places  
- Commander des snacks (popcorn, boissons, confiseries)  
- Finaliser sa commande et voir son  ticket  

Tout est développé en front-end avec HTML, CSS et JavaScript
Les données sont sauvegardées dans le **localStorage** du navigateur (pas de base de données).

---

 Fonctionnement  
1. Les films et details des films sont chargés depuis un fichier JSON avec `fetch()`.  
2. Lorsqu’un utilisateur sélectionne une séance, les infos sont stockées en `localStorage`.  
3. Les pages suivantes (places, snacks, paiement) récupèrent ces données pour les afficher.  
4. À la fin, un ticket récapitulatif est généré.  

---

 📱 Responsive Design  
L’application s’adapte aux ordinateurs et aux tablettes . 
