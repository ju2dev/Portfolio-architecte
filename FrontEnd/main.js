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
            createFilters(works);
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

    // Fonction pour créer les filtres à partir des données récupérées
    function createFilters(works) {
        const divF = document.createElement("div");
        divF.classList.add("Tfilter");

        // Créer le filtre "Tous" en premier
        createFilter("button", ["filter", "selected"], "Tous", divF);

        // Utiliser un Set pour stocker les noms des catégories uniques
        const categorySet = new Set();

        // Créer les filtres pour chaque catégorie
        works.forEach(work => {
            if (!categorySet.has(work.category.name)) {
                createFilter("button", ["filter"], work.category.name, divF);
                categorySet.add(work.category.name);
            }
        });

        // Ajouter divF au DOM, juste avant la galerie
        gallery.parentNode.insertBefore(divF, gallery);

        // Ajouter des écouteurs d'événements aux filtres
        const filterList = document.querySelectorAll(".filter");

        filterList.forEach((filterCategory) => {

            filterCategory.addEventListener("click", function () {
                // Enlever la classe "selected" de tous les filtres
                filterList.forEach((btn) => btn.classList.remove("selected"));
                
                // Ajouter la classe "selected" au filtre cliqué
                this.classList.add("selected");

                // Récupère le nom de la catégorie à partir du texte filtre cliqué
                const category = this.textContent;
                let filteredWorks;

                // Si la catégorie "tous" est sélectionné, affiche tous les travaux
                if (category === "Tous") {
                    filteredWorks = allWorks;
                } 
                // Sinon filtré travaux par catégorie avec nom de catégorie
                else {
                    filteredWorks = allWorks.filter(work => work.category.name === category);
                }

                // Appel de la fonction pour affiché travaux filtrés
                displayWorks(filteredWorks);
            });
        });
    }

    // Fonction pour créer un filtre avec classe, contenu et l'attacher à un parent spécifié
    function createFilter(balise, classes = [], contenu, parent) {

        let filter = document.createElement(balise);

         // Ajouter chaque classe CSS fournie dans le tableau "classes" à l'élément créé
        classes.forEach(classe => filter.classList.add(classe));
        filter.textContent = contenu;
        parent.appendChild(filter);
    }

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

    // Mise à jour de l'interface pour l'état déconnecté
    function updateUIForLoggedOutState() {

        // Mise à jour l'interface utilisateur ici sans recharger la page
        const editControls = document.getElementById('edit-controls');

        if (editControls) {
            editControls.style.display = 'none';
        }
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
    // Parcourir les données reçues et créer les images avec légende
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

  // Ajouter un écouteur d'événement au bouton de fermeture de la modale principale 
  if (closeModal) {
    closeModal.addEventListener('click', closeAddPhotoModalFunction);
}

    // Retour à la modale d'édition lorsque le bouton de retour est cliqué
    retourmodal.addEventListener('click', () => {
        addPhotoModal.style.display = 'none';
        editModal.style.display = 'block';
});

    // Remplissage du select des catégories dans la modale d'ajout de photo
    function populateCategorySelect() {
        const categories = [
            { id: 1, name: "Objets" },
            { id: 2, name: "Appartements" },
            { id: 3, name: "Hotels & restaurants" }
    ];

        const categorySelect = document.getElementById('photo-category');
        categorySelect.innerHTML = '';
        categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id; // Définir l'ID de la catégorie comme valeur de l'option
        option.textContent = category.name; // Définir le nom de la catégorie comme texte de l'option
        categorySelect.appendChild(option); // Ajouter l'option au select
});
}

     // Vérification du statut de connexion
    function checkLoginStatus() {
        const token = localStorage.getItem('token');
        const editControls = document.getElementById('edit-controls');

         // Si token présent et élément des contrôles d'édition existe, afficher contrôles
        if (token && editControls) {
            editControls.style.display = 'block';
        }
    }

    // Mettre à jour le lien de connexion/déconnexion après le chargement du DOM
    document.addEventListener('DOMContentLoaded', () => {
        checkLoginStatus();
        updateLoginLogoutLink(); // Mettre à jour l'état du lien de connexion/déconnexion
    });
    
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
    const category = categorySelect.value; // Convertir en entier

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
            // Réinitialisation du formulaire et des éléments d'aperçu après un envoi réussi
            addPhotoForm.reset();
            photoPreview.src = '/FrontEnd/assets/images/image-regular.svg';
            textp.style.display = 'none';
            errorDiv.style.display = 'none';
            imageFile = null; // Réinitialiser l'image stockée
        } else {
            const errorText = await response.text(); // Récupérer le texte d'erreur
            console.error('Erreur lors de l’ajout de la photo:', errorText);
            errorDiv.textContent = "Une erreur s'est produite lors de l'ajout de la photo.";
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        // Gestion des erreurs de communication avec le serveur
        console.error('Erreur:', error);
        errorDiv.textContent = "Une erreur s'est produite lors de la communication avec le serveur.";
        errorDiv.style.display = 'block';
    }
});
