document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.querySelector(".gallery");

    // Étape 1: Récupérer les données de l'API
    fetch('http://localhost:5678/api/works')
        .then(response => response.json())
        .then(works => {
            // Vider la galerie existante
            gallery.innerHTML = '';

            // Étape 2: Parcourir les données reçues
            works.forEach(work => {
                // Étape 3: Créer les éléments HTML nécessaires
                const figure = document.createElement('figure');
                const img = document.createElement('img');
                const figcaption = document.createElement('figcaption');

                // Configurer les attributs et le contenu
                img.src = work.imageUrl;
                img.alt = work.title;
                figcaption.textContent = work.title;

                // Assembler les éléments
                figure.appendChild(img);
                figure.appendChild(figcaption);

                // Étape 4: Ajouter l'élément au DOM
                gallery.appendChild(figure);
            });
        })
        .catch(error => console.error('Erreur lors de la récupération des travaux:', error));
        
});