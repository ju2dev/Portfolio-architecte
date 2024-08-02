document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Log des valeurs pour déboguer
        console.log('Email reçu:', email);
        console.log('Mot de passe reçu:', password);

        // Vérification si les champs ne sont pas vides
        if (!email || !password) {
            errorMessage.textContent = 'Email et mot de passe sont obligatoires';
            errorMessage.style.display = 'block';
            return;
        }

        // Appel à l'API de connexion
        fetch('http://localhost:5678/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur de connexion');
            }
            return response.json();
        })
        .then(data => {
            // Connexion réussie
            errorMessage.style.display = 'none';
            console.log('Connexion réussie:', data);

            // Stockage du token dans le localStorage
            localStorage.setItem('token', data.token);

            // Redirection vers la page d'accueil
            window.location.href = '../index.html';

                console.log('Connexion réussie:', data);
                console.log('Token stocké:', localStorage.getItem('token'));

            
        })
        .catch(error => {
            // Échec de la connexion
            console.error('Erreur:', error);
            errorMessage.textContent = 'Email ou mot de passe incorrect';
            errorMessage.style.display = 'block';
        });
    });
});



