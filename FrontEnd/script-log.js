const form = document.querySelector('form');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const errorMessage = document.getElementById('error-message');
const urlLogin = "http://localhost:5678/api/users/login";

async function fetchData(url, method = 'GET', data = null) {
  try {
      const options = {
          method,
          headers: {
              'Content-Type': 'application/json'
          },
          body: data ? JSON.stringify(data) : null
      };

      const response = await fetch(url, options);

      if (!response.ok) {
          throw new Error("Erreur de requête réseau");
      }

      return await response.json();
  } catch (error) {
      console.error(error);
      throw error;
  }
}

async function login(event) {
    event.preventDefault(); 
  

    const email = emailInput.value;
    const password = passwordInput.value;
    const data = {
      "email": email, 
      "password": password
    }
    console.log("Email:", email);
    console.log("Mot de passe:", password);
    const toLog = await fetchData(urlLogin, "POST", data);
    console.log(toLog);

    if (toLog.token) {
      console.log("Connexion réussie !");
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem("token", toLog.token);
      localStorage.setItem("userId", toLog.userId);
      errorMessage.style.display = "none";
      window.location.href = 'index.html';

    
    } else {
      console.log("Échec de la connexion.");
      errorMessage.style.display = 'block';
    }
  }
  
  form.addEventListener('submit', login);

