document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.querySelector(".gallery");
    const bandeauNoir = document.getElementById('bandeau-noir');
    const editModal = document.getElementById('edit-modal');
    const closeModal = document.getElementById('close-modal');
    const btnModifier = document.getElementById('btn-modifier');
    const addPhoto = document.getElementById('add-photo')
    const modalOverlay = document.getElementById('edit-modal-overlay');
    let allWorks = [];


    // Étape 1: Récupérer les données de l'API et afficher les images
    fetch('http://localhost:5678/api/works')
        .then(response => response.json())
        .then(works => {
            allWorks = works; // Stock travaux récup
            displayWorks(works);
            updateLoginLogoutLink(); // Mettre à jour le lien de connexion/déconnexion après la création des filtres
        })
        .catch(error => console.error('Erreur lors de la récupération des travaux:', error));

    // Fonction pour afficher les travaux dans la galerie
    function displayWorks(works) {
        // Vider la galerie existante
        gallery.innerHTML = '';
         // Pour chaque travail, on crée une figure avec une image et une légende
        works.forEach(work => {
            const figure = document.createElement('figure');
            const img = document.createElement('img');
            const figcaption = document.createElement('figcaption');
            img.src = work.imageUrl; // Défini source de l'image
            img.alt = work.title;
            figcaption.textContent = work.title;
            figure.appendChild(img);
            figure.appendChild(figcaption);
            gallery.appendChild(figure); // Ajouter la figure à la galeri
        });
    }

   // Fonction pour récupérer les catégories depuis le localStorage ou l'API si elles sont expirées
    function fetchCategories() {
        const cachedCategories = localStorage.getItem('categories');
        const expirationTime = localStorage.getItem('categoriesExpiration');

    // Si les catégories sont en cache et valides, on les retourne directement
    if (cachedCategories && expirationTime && Date.now() < expirationTime) {
        return Promise.resolve(JSON.parse(cachedCategories));
    }

    // Sinon, on va les chercher depuis l'API et on met à jour le cache
    return fetch('http://localhost:5678/api/categories')
        .then(response => {
            if (!response.ok) throw new Error('Erreur lors de la récupération des catégories: ' + response.statusText);
            return response.json();
        })
        .then(categories => {
            // Stocke les catégories dans le localStorage avec une expiration de 24h
            localStorage.setItem('categories', JSON.stringify(categories));
            localStorage.setItem('categoriesExpiration', Date.now() + 86400000); // 24 heures en ms
            return categories;
        })
        .catch(error => {
            console.error('Erreur lors de la récupération des catégories:', error);
            return [];
        });
}

    // Fonction pour récupérer les travaux en fonction de l'ID de la catégorie sélectionnée
        function fetchWorksByCategory(categoryId) {
        return fetch('http://localhost:5678/api/works')
        .then(response => {
            if (!response.ok) throw new Error('Erreur dans la récupération des travaux: ' + response.statusText);
            return response.json();
        })
        .then(works => {
            // Si un ID de catégorie est spécifié, on filtre les travaux en conséquence
            if (categoryId) works = works.filter(work => work.categoryId == categoryId);
            displayWorks(works); // Affiche les travaux dans la galerie
        })
        .catch(error => console.error('Erreur lors de la récupération des travaux:', error));
}

    // Fonction pour créer les filtres à partir des catégories et les ajouter au DOM
    function createFilters(categories) {
        const filterContainer = document.createElement("div");
        filterContainer.classList.add("Tfilter");

    // Crée un filtre "Tous" pour afficher tous les travaux
    createFilterButton("Tous", filterContainer, null);
    
    // Crée un bouton de filtre pour chaque catégorie
    categories.forEach(category => createFilterButton(category.name, filterContainer, category.id));

    // Ajoute les filtres juste avant la galerie dans le DOM
    const gallery = document.querySelector(".gallery");
        gallery.parentNode.insertBefore(filterContainer, gallery);

    // Ajoute les listeners pour gérer les clics sur les filtres
    document.querySelectorAll(".filter").forEach(btn => {
        btn.addEventListener("click", function () {
            // Enlève la classe "selected" de tous les filtres puis l'ajoute à celui qui est cliqué
            document.querySelectorAll(".filter").forEach(btn => btn.classList.remove("selected"));
            this.classList.add("selected");
            fetchWorksByCategory(this.dataset.categoryId || null); // Récupère les travaux selon le filtre
        });
    });
}

    // Fonction pour créer un bouton de filtre et l'ajouter au conteneur des filtres
    function createFilterButton(text, parent, categoryId) {
        const button = document.createElement("button");
        button.classList.add("filter");
        if (!categoryId) button.classList.add("selected"); // Le bouton "Tous" est sélectionné par défaut
        button.textContent = text;
        if (categoryId) button.dataset.categoryId = categoryId; // Associe l'ID de catégorie au bouton si disponible
        parent.appendChild(button);
}

    // Fonction pour afficher les travaux dans la galerie
    function displayWorks(works) {
        const gallery = document.querySelector(".gallery");
        gallery.innerHTML = ''; // Vide la galerie existante

    // Crée les éléments figure, img, et figcaption pour chaque travail et les ajoute à la galerie
    works.forEach(work => {
        const figure = document.createElement('figure');
        figure.innerHTML = `<img src="${work.imageUrl}" alt="${work.title}"><figcaption>${work.title}</figcaption>`;
        gallery.appendChild(figure);
    });
}

    // Fonction d'initialisation de l'application
    function initApp() {
        fetchCategories().then(categories => {
        createFilters(categories); // Crée les filtres avec les catégories récupérées
        return fetchWorksByCategory(null); // Récupère tous les travaux au démarrage
    }).catch(error => console.error('Erreur lors de l\'initialisation de l\'application:', error));
}

    //Lance l'application
    initApp();


    // Fonction pour mettre à jour le lien de connexion/déconnexion
    function updateLoginLogoutLink() {

        // Récupérer les éléments du DOM nécessaires
        const loginLogoutLink = document.getElementById('loginLogoutLink');
        const Tfilter = document.querySelector('.Tfilter');
        const btnModifier = document.getElementById('btn-modifier');
        const header = document.querySelector('header');

        if (!loginLogoutLink || !Tfilter) return;

        // Vérifie si un token est stocké dans le localStorage
        const token = localStorage.getItem('token');

        if (token) {
            // Si l'utilisateur est connecté
            loginLogoutLink.textContent = 'logout';
            loginLogoutLink.onclick = logout; // Associe fonction de déconnexion au clic 
            Tfilter.style.display = 'none'; // Cacher les filtres quand connecté
            btnModifier.classList.remove('hidden');
            bandeauNoir.classList.remove('hidden');
            header.style.margin ='70px 0px'; // Ajuster la marge du header
        } else {
             // Si l'utilisateur n'est pas connecté
            loginLogoutLink.textContent = 'login';
            loginLogoutLink.onclick = navigateToLogin; // Associe fonction vers page de connexion au clic 
            Tfilter.style.display = ''; // Afficher les filtres quand déconnecté
            btnModifier.classList.add('hidden');
            bandeauNoir.classList.add('hidden');
        }
    }

    // Fonction de déconnexion
    function logout(e) {
        e.preventDefault(); // Empêcher le comportement par défaut du lien
        localStorage.removeItem('token'); // Supprimer le token du localStorage pour déconnecter l'utilisateur
        updateLoginLogoutLink(); // Mettre à jour le lien de connexion/déconnexion pour refléter l'état déconnecté
        updateUIForLoggedOutState(); // Mettre à jour l'interface utilisateur pour l'état déconnecté
    }


     // Navigation vers la page de connexion
    function navigateToLogin(e) {
        e.preventDefault();
        window.location.href = '../FrontEnd/login/login.html';
    }

   // Affichage des travaux sans légendes (pour la modale)
    function displayWorksWithoutCaptions(works, container) {
    // Vider le conteneur existant
    container.innerHTML = '';
    // Parcourir les données reçues et créer les images 
    works.forEach(work => {
        const figure = document.createElement('figure');
        const img = document.createElement('img');
        const figcaption = document.createElement('figcaption');
        img.src = work.imageUrl;
        img.alt = work.title;
        figure.appendChild(img);
        figure.appendChild(figcaption);
        container.appendChild(figure);

        // Ajout de l'icône de suppression
        const deleteIcon = document.createElement('i');

        // Ajouter les classes nécessaires pour styliser l'icône de suppression
        deleteIcon.classList.add('fa-solid', 'fa-trash-can' , 'delete-icon');

        // Ajouter un écouteur d'événement "click" à l'icône de suppression
        deleteIcon.addEventListener('click', () => {
            supprimerTravail(work.id); // Appeler fonction "supprimerTravail" ; passant l'ID travail à supp
        });

        // Ajout icône supp : enfant élément "figure" afficher page
        figure.appendChild(deleteIcon);
    });
}

     // Fonction pour supprimer un travail
    function supprimerTravail(travailId) {
        fetch(`http://localhost:5678/api/works/${travailId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`, // Ajout jeton d'authentification : vérif utilisateur
                'Content-Type': 'application/json' // Type de contenu pour la requête
            }
        })
    .then(response => {
         // Vérif si la suppression a réussi
        if (response.ok) {
             // Mise à jour liste travaux supp élément avec l'ID correspondant
            allWorks = allWorks.filter(travail => travail.id !== travailId);
            displayWorksInContainer(allWorks, document.querySelector('.modal-gallery'));
        } else {
            return response.json().then(data => {
                console.error('Échec de la suppression du travail :', data);
            });
        }
    })
        .catch(error => console.error('Erreur :', error));
}

        // Mise à jour de la galerie dans la modale
        const modalGallery = document.querySelector('.modal-gallery');
        if (modalGallery) {
        displayWorksWithoutCaptions(allWorks, modalGallery);
    }

        // Afficher les travaux dans la modale
        function displayWorksInModal() {
            const modalGallery = document.querySelector('.modal-gallery');

        // Si galerie modale, afficher travaux sans légende
        if (modalGallery) {
            displayWorksWithoutCaptions(allWorks, modalGallery);
        }
    }

    // Ouverture de la modale
    function openModal() {
        // Afficher la modale et l'overlay, désactiver le défilement de la page
        editModal.classList.remove('hidden');
        editModal.style.display = 'block';
        document.getElementById('edit-modal-overlay').classList.remove('hidden'); // Afficher le fond gris
        document.body.classList.add('modal-open');
        document.body.style.overflow = 'hidden'; // Empêche le défilement
        displayWorksInModal();
    }

    // Fermeture de la modale
    function closeModalFunction() {
        // Cacher la modale et l'overlay, réactiver le défilement de la page
        editModal.classList.add('hidden');
        editModal.style.display = 'none';
        document.getElementById('edit-modal-overlay').classList.add('hidden');
        document.body.classList.remove('modal-open');
        document.body.style.overflow = ''; // Rétablit le défilement
    }

    // Ajout des écouteurs d'événements pour ouvrir/fermer la modale
    if (btnModifier) {
        btnModifier.addEventListener('click', openModal); // Ouvrir modale : clic sur bouton "Modifier"
    }   

    if (closeModal) {
        closeModal.addEventListener('click', closeModalFunction); // Fermer modale : clic sur bouton de fermeture
    }

    // Fermer la modale en cliquant sur l'overlay
    modalOverlay.addEventListener('click', () => {
        closeModalFunction(); // Ferme la modal
      });
    

     // Gestion de la modale d'ajout de photo
    const addPhotoModal = document.getElementById('add-photo-modal');
    const retourmodal = document.getElementById("retour-modal")
    const addPhotoModalOverlay = document.getElementById('add-photo-modal-overlay');
    const closeAddPhotoModal = document.getElementById('close-add-photo-modal');

    // Ouvrir modale d'ajout de photo : clic sur bouton "Ajouter une photo"
    addPhoto.addEventListener('click', () => {
        addPhotoModal.style.display = 'block';
        addPhotoModalOverlay.classList.remove('hidden');
        editModal.style.display = 'none'; // Cacher la modale d'édition
        document.body.style.overflow = 'hidden'; // Empêche le défilement
        modalOverlay.classList.add('hidden');
        populateCategorySelect(); // Remplir la liste déroulante des catégories
  });

    // Fermer la modale en cliquant sur le bouton de fermeture
    closeAddPhotoModal.addEventListener('click', () => {
        addPhotoModal.style.display = 'none';
        document.body.style.overflow = ''; // Rétablit le défilement
        addPhotoModalOverlay.classList.add('hidden');
});

    // Fermer la modale d'ajout de photo en cliquant sur l'overlay
    function closeAddPhotoModalFunction() {
        addPhotoModalOverlay.classList.add('hidden');
        addPhotoModal.style.display = 'none';
        document.body.style.overflow = ''; // Réactive le défilement du body
  }

   addPhotoModalOverlay.addEventListener('click', () => {
    closeAddPhotoModalFunction(); // Ferme la modal
});

    // Retour à la modale d'édition lorsque le bouton de retour est cliqué
    retourmodal.addEventListener('click', () => {
        addPhotoModal.style.display = 'none';
        editModal.style.display = 'block';
});

   // Fonction pour remplir dynamiquement le sélecteur de catégories
    function populateCategorySelect() {
    // Appel à la fonction pour récupérer les catégories
    fetchCategories().then(categories => {
        const categorySelect = document.getElementById('photo-category');
        categorySelect.innerHTML = ''; // On vide d'abord toutes les options existantes dans le select

        // Pour chaque catégorie récupérée, on crée une option dans le select
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id; // L'ID de la catégorie devient la valeur de l'option
            option.textContent = category.name; // Le nom de la catégorie devient le texte affiché
            categorySelect.appendChild(option); // On ajoute l'option au sélecteur
        });
    }).catch(error => {
        // Gestion des erreurs, on affiche un message dans la console si ça ne marche pas
        console.error('Erreur lors du chargement des catégories:', error);
    });
}

    // Appel de la fonction pour remplir le sélecteur dès le chargement de la page
    populateCategorySelect();
});

// Sélection des éléments du DOM
const addPhotoForm = document.getElementById('add-photo-form');
const addPhotoButton = document.getElementById('photo-upload-btn');
const photoInput = document.getElementById('photo-upload-input');
const photoPreview = document.getElementById('photo-preview');
const titleInput = document.getElementById('photo-title');
const categorySelect = document.getElementById('photo-category');
const validateButton = document.getElementById('add-photo1');
const errorDiv = document.getElementById('error');
const textp = document.getElementById('p1');
const dynamicPhotoPreview = document.getElementById('dynamic-photo-preview');
let imageFile = null; // Variable pour stocker le fichier image

    // Ajout d'un écouteur d'événement sur le bouton pour déclencher la sélection du fichier image
    addPhotoButton.addEventListener('click', () => {
        photoInput.click(); // Déclenche le clic sur l'input file
    });

    // Gestion du changement dans l'input file pour afficher l'aperçu de l'image sélectionnée
    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0]; 
    
    if (file) {
        // Vérification de la taille du fichier
        if (file.size > 4 * 1024 * 1024) {
            errorDiv.textContent = 'Le fichier dépasse la taille maximale de 4 Mo.';
            errorDiv.style.display = 'block';
            photoInput.value = ''; // Réinitialise le champ de fichier
            imageFile = null;
        } else {
            // Si la taille est correcte, affiche aperçu de l'image
            const reader = new FileReader();
            reader.onload = function(e) {
                dynamicPhotoPreview.src = e.target.result; // Mettre à jour l'aperçu avec l'image sélectionnée
                dynamicPhotoPreview.style.display = 'block';
                photoPreview.style.display = 'none';
                textp.style.display = 'none';
                errorDiv.style.display = 'none';
                imageFile = file; // Stocker le fichier image
            };
            reader.readAsDataURL(file); // Lire le contenu du fichier pour l'aperçu
            addPhotoButton.style.display = 'none'; // Cacher le bouton de chargement après sélection
        }
    }
  });
  
    // Gestion de la validation et de l'envoi du formulaire d'ajout de photo
    validateButton.addEventListener('click', async (e) => {
        e.preventDefault();
    
    const title = titleInput.value;
    const category = parseInt(categorySelect.value);

     // Vérification que tous les champs sont remplis correctement
    if (!imageFile || !title || isNaN(category)) {
        errorDiv.textContent = "Veuillez remplir tous les champs.";
        errorDiv.style.display = 'block';
        errorDiv.style.color = 'red';
        errorDiv.style.textAlign = 'center';
        return; // Arrête la fonction si les champs ne sont pas remplis correctement
    }

    // Création d'un objet FormData pour l'envoi des données du formulaire
    const formData = new FormData();
        formData.append('title', title);
        formData.append('category', category);
        formData.append('image', imageFile);

    const token = localStorage.getItem('token');
    try {
        const response = await fetch('http://localhost:5678/api/works', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`}, // Ajoute le token à l'en-tête de la requête

            body: formData // Envoie l'objet FormData
        });
        
        if (response.ok) {
            const newWork = await response.json(); // Récupérer la réponse du serveur (le nouveau travail ajouté)
            allWorks.push(newWork); // Ajouter le nouveau travail à la liste existante
            displayWorks(allWorks); // Rafraîchir l'affichage de la galerie
            displayWorksInModal(); // Mettre à jour l'affichage dans la modale

            // Réinitialisation du formulaire
            addPhotoForm.reset();
            dynamicPhotoPreview.src = ''; // Réinitialiser l'aperçu de l'image
            dynamicPhotoPreview.style.display = 'none';
            textp.style.display = 'block';
            addPhotoButton.style.display = 'block';
            errorDiv.style.display = 'none';
            imageFile = null;
        } else {
            const errorText = await response.text(); // Récupérer le texte d'erreur
            console.error('Erreur lors de l’ajout de la photo:', errorText);
            errorDiv.textContent = "Une erreur s'est produite lors de l'ajout de la photo.";
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        // Gestion des erreurs de communication avec le serveur
        console.error('Erreur:', error);
        errorDiv.style.display = 'block';
    }

});
