document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.querySelector(".gallery");
    const bandeauNoir = document.getElementById('bandeau-noir');
    const editModal = document.getElementById('edit-modal');
    const closeModal = document.getElementById('close-modal');
    const btnModifier = document.getElementById('btn-modifier');
    const addPhoto = document.getElementById('add-photo')
    let allWorks = [];

    // Étape 1: Récupérer les données de l'API et afficher les images
    fetch('http://localhost:5678/api/works')
        .then(response => response.json())
        .then(works => {
            allWorks = works;
            displayWorks(works);
            createFilters(works);
            updateLoginLogoutLink(); // Mettre à jour le lien de connexion/déconnexion après la création des filtres
        })
        .catch(error => console.error('Erreur lors de la récupération des travaux:', error));

    function displayWorks(works) {
        // Vider la galerie existante
        gallery.innerHTML = '';
        // Parcourir les données reçues et créer les images avec légende
        works.forEach(work => {
            const figure = document.createElement('figure');
            const img = document.createElement('img');
            const figcaption = document.createElement('figcaption');
            img.src = work.imageUrl;
            img.alt = work.title;
            figcaption.textContent = work.title;
            figure.appendChild(img);
            figure.appendChild(figcaption);
            gallery.appendChild(figure);
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

                const category = this.textContent;
                let filteredWorks;

                if (category === "Tous") {
                    filteredWorks = allWorks;
                } else {
                    filteredWorks = allWorks.filter(work => work.category.name === category);
                }

                displayWorks(filteredWorks);
            });
        });
    }

    // Fonction pour créer un filtre avec classe, contenu et l'attacher à un parent spécifié
    function createFilter(balise, classes = [], contenu, parent) {
        let filter = document.createElement(balise);
        classes.forEach(classe => filter.classList.add(classe));
        filter.textContent = contenu;
        parent.appendChild(filter);
    }

    function updateLoginLogoutLink() {
        const loginLogoutLink = document.getElementById('loginLogoutLink');
        const Tfilter = document.querySelector('.Tfilter');
        const btnModifier = document.getElementById('btn-modifier');

        if (!loginLogoutLink || !Tfilter) return;

        const token = localStorage.getItem('token');
        if (token) {
            loginLogoutLink.textContent = 'logout';
            loginLogoutLink.onclick = logout;
            Tfilter.style.display = 'none'; // Cacher les filtres quand connecté
            btnModifier.classList.remove('hidden');
            bandeauNoir.classList.remove('hidden');
        } else {
            loginLogoutLink.textContent = 'login';
            loginLogoutLink.onclick = navigateToLogin;
            Tfilter.style.display = ''; // Afficher les filtres quand déconnecté
            btnModifier.classList.add('hidden');
            bandeauNoir.classList.add('hidden');
        }
    }

    function logout(e) {
        e.preventDefault();
        localStorage.removeItem('token');
        console.log('Déconnexion réussie');
        updateLoginLogoutLink();
        updateUIForLoggedOutState();
    }

    function updateUIForLoggedOutState() {
        // Mise à jour l'interface utilisateur ici sans recharger la page
        const editControls = document.getElementById('edit-controls');
        if (editControls) {
            editControls.style.display = 'none';
        }
    }

    function navigateToLogin(e) {
        e.preventDefault();
        window.location.href = '../FrontEnd/login/login.html';
    }

   
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

        const deleteIcon = document.createElement('i');
        deleteIcon.classList.add('fa-solid', 'fa-trash-can' , 'delete-icon');
        deleteIcon.addEventListener('click', () => {
            console.log(`Deleting work with ID: ${work.id}`);
            supprimerTravail(work.id);
        });
    figure.appendChild(deleteIcon);
    });
}

    function supprimerTravail(travailId) {
        fetch(`http://localhost:5678/api/works/${travailId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        })
    .then(response => {
        if (response.ok) {
            console.log(`Le travail avec l'ID : ${travailId} a été supprimé.`);
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


    // Afficher les works dans la modale
        function displayWorksInModal() {
            const modalGallery = document.querySelector('.modal-gallery');
        if (modalGallery) {
            displayWorksWithoutCaptions(allWorks, modalGallery);
        }
    }

    function openModal() {
        editModal.classList.remove('hidden');
        editModal.style.display = 'block';
        document.body.classList.add('modal-open');
        displayWorksInModal();
    }

    function closeModalFunction() {
        editModal.classList.add('hidden');
        editModal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }

    if (btnModifier) {
        btnModifier.addEventListener('click', openModal);
    }   

    if (closeModal) {
        closeModal.addEventListener('click', closeModalFunction);
    }

    // Fermer la modale si on clique en dehors
        window.onclick = function(event) {
            if (event.target === editModal) {
                closeModalFunction();
            }
        }

    addPhoto.addEventListener('click', () => {
        console.log('Ajouter une photo');
  });

    function checkLoginStatus() {
        const token = localStorage.getItem('token');
        const editControls = document.getElementById('edit-controls');
        if (token && editControls) {
            editControls.style.display = 'block';
        }
    }

    // Mettre à jour le lien de connexion/déconnexion après la création des filtres
    document.addEventListener('DOMContentLoaded', () => {
        checkLoginStatus();
        updateLoginLogoutLink();
    });
});


