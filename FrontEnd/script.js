const urlWorks = "http://localhost:5678/api/works";
const validateButton = document.querySelector(".btn_validate");
const fileInput = document.getElementById("file");
let deletedImageIds = [];


async function loadPhotos() {
    try {
        const response = await fetch("http://localhost:5678/api/works");
        const photos = await response.json();
        
        const gallery = document.querySelector(".gallery");
        gallery.innerHTML = '';

        photos.forEach(photo => {
            const imgElement = document.createElement("img");
            imgElement.src = photo.imageUrl;
            imgElement.alt = photo.title;
            gallery.appendChild(imgElement);
        });
    } catch (error) {
        console.error("Erreur lors du chargement des photos :", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadPhotos();
});

async function main(galeryImg) {
    try {
        displayProjects(galeryImg);
    } catch (error) {
        console.error(error);
    }
}

function publishChanges() {
    console.log("Changements publiés avec succès !");
}

function editMode() {
    const addForm = document.getElementById('addForm');
    const confirmationMessage = document.getElementById('confirmationMessage');

    if (!addForm || !confirmationMessage) {
        console.error("Les éléments HTML requis n'ont pas été trouvés.");
        return;
    }
    document.getElementById('addForm').style.display = 'none';
    document.getElementById('confirmationMessage').innerText = 'La photo a été ajoutée avec succès au projet.';
    document.getElementById('confirmationMessage').style.display = 'block';

    publishChanges();
    resetForm();
     console.log("Publier les changements");
     console.log("Publier les changements");
}

function addImageToGallery(imageUrl, title) {
    const gallery = document.querySelector(".gallery");
    const figure = document.createElement("figure");
    figure.classList.add("project");
    const imgElement = document.createElement("img");
    imgElement.src = imageUrl;
    imgElement.alt = title;
    const figcaption = document.createElement("figcaption");
    figcaption.textContent = title;
    figure.appendChild(imgElement);
    figure.appendChild(figcaption);
    gallery.appendChild(figure);
}

async function validateForm() {
    try {
        console.log("Début de la validation du formulaire...");

        const titleInput = document.getElementById('title').value;
        const categorySelect = document.getElementById('categories').value;
        const file = fileInput.files[0];

        // Validation côté client
        if (!titleInput || !categorySelect || !file) {
            alert("Veuillez remplir tous les champs du formulaire.");
            return;
        }

        const formData = new FormData();
        formData.append("image", file);
        formData.append("title", titleInput);
        formData.append("category", categorySelect);

        const authToken = localStorage.getItem('token');
        const response = await fetch("http://localhost:5678/api/works", {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
            body: formData
        });

        // Gestion des erreurs HTTP
        if (!response.ok) {
            handleHttpError(response.status);
            return;
        }

        const responseData = await response.json();
        console.log("Réponse de l'API :", responseData);

        // Réinitialiser le formulaire
        resetForm();
        refreshGallery();
        // Mettre à jour l'interface après le succès
        updateUiAfterSuccess();

    } catch (error) {
        console.error("Erreur lors de la validation du formulaire :", error);
    }
}

function resetForm() {
    document.getElementById('title').value = '';
    document.getElementById('categories').value = '';
    fileInput.value = '';
    clearImagePreview();
}

function clearImagePreview() {
    const ajoutPhotoDiv = document.querySelector(".ajoutPhoto");
    const existingPreview = ajoutPhotoDiv.querySelector("img");
    if (existingPreview) {
        existingPreview.remove();
    }
}

// Fonction utilitaire pour gérer les erreurs HTTP
function handleHttpError(status) {
    switch (status) {
        case 400:
            alert("Erreur de validation du formulaire. Veuillez remplir entièrement le formulaire.");
            break;
        case 401:
            alert("Non autorisé.");
            break;
        case 500:
            alert("Comportement inattendu.");
            break;
        default:
            alert("Une erreur s'est produite lors de l'envoi du formulaire.");
    }
}

function updateUiAfterSuccess() {
    try {
        validateButton.disabled = true;


        document.getElementById('title').value = '';
        document.getElementById('categories').value = '';
        fileInput.value = ''; // Réinitialise le champ de sélection de fichier

        loadImagesIntoModal1();
        closeModal();

        validateButton.disabled = false;
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'interface après la réussite :", error);
    }
}

validateButton.addEventListener("click", validateForm);

function displayProjects(galeryImg , selectedCategory ="0") {
    const gallery = document.querySelector(".gallery");
    

    gallery.innerHTML = '';

    let imagesToAdd = [];


    const imgObjet = filterProjectsByCategory (galeryImg, "1");
    console.log (imgObjet)
    const imgAppart = filterProjectsByCategory (galeryImg, "2");
    console.log (imgAppart)
    const imgHotel = filterProjectsByCategory (galeryImg, "3");
    console.log (imgHotel)
 
    switch (selectedCategory) {
        case '1':
            imagesToAdd = imgObjet;
            break;
        case '2':
            imagesToAdd = imgAppart;
            break;
        case '3':
            imagesToAdd = imgHotel;
            break;
        default:
            imagesToAdd = galeryImg;
            break;
    }


    for (const imgData of imagesToAdd) {
        const imgElement = createProject(imgData.imageUrl);
        gallery.appendChild(imgElement);
    }

}

document.addEventListener("DOMContentLoaded", () => {
    // Vérifie si l'utilisateur est connecté
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    // Sélectionne tous les boutons de filtrage
    const filterButtons = document.querySelectorAll(".filter-buttons");
    
    // Si l'utilisateur est connecté, cache les boutons de filtrage
    if (isLoggedIn === 'true') {
        filterButtons.forEach(button => {
            button.style.display = 'none';
        });
    }
});



function createProjectWithDeleteButton(imageUrl, title, projectId) {
    const projectElement = document.createElement("figure");
    projectElement.classList.add("project");

    const imgElement = document.createElement("img");
    imgElement.src = imageUrl;
    imgElement.alt = title;
    projectElement.appendChild(imgElement);

    const divImg = document.createElement("div");
    divImg.classList.add("divFig");
    projectElement.appendChild(divImg);

    const figcaption = document.createElement("figcaption");
    figcaption.textContent = title;
    divImg.appendChild(figcaption);

    const deleteButton = document.createElement("button");
 
    deleteButton.classList.add("delete-button");
    deleteButton.addEventListener("click", async () => {
        try {
            // Appel de la fonction pour supprimer le projet
            await deleteProject(projectId);
            // Rechargement des images après la suppression
            await loadImagesIntoModal1();
            await refreshGallery();
        } catch (error) {
            console.error(error);
        }
    });
    projectElement.appendChild(deleteButton);

    return projectElement;
}

function fetchWithAuthorization(url, options) {
    return new Promise((resolve, reject) => {
        const authToken = localStorage.getItem('token');
        options.headers = options.headers || {};
        options.headers['Authorization'] = `Bearer ${authToken}`;

        fetch(url, options)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erreur de requête: ${response.statusText}`);
                }
                resolve(response);
            })
            .catch(error => {
                reject(error);
            });
    });
}

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

function createProject(imageUrl, title) {
    const projectElement = document.createElement("figure");
    projectElement.classList.add("project");

    const imgElement = document.createElement("img");
    imgElement.src = imageUrl;
    imgElement.alt = title; 
    projectElement.appendChild(imgElement);

    const figcaption = document.createElement("figcaption");
    figcaption.textContent = title; 
    projectElement.appendChild(figcaption);

    
    return projectElement;
}

function filterProjectsByCategory(listProjects, category) {
    const filteredProjects = [];
    /*parcours la liste des projets pour filtrer */
    listProjects.forEach(project => {
        if (category == project.categoryId){
            filteredProjects.push(project);
        }
    })
    return filteredProjects;
}

function openModal1() {
    const modal1 = document.getElementById("modal1");
    modal1.style.display = "flex";
    modal1.removeAttribute("aria-hidden");
    loadImagesIntoModal1();
    
}

document.querySelector('.ajout button').addEventListener('click', openModal2);

function displayinfo(allinfo) {
    let gallery = document.querySelector(".modal-gallery");
    gallery.innerHTML = "";
    for (const info of allinfo) {
        console.log("HTML généré pour l'image :", figureHTML);
        gallery.insertAdjacentHTML("beforeend",
            `
            <figure>
                <img src="${info.imageUrl}" alt="${info.title}">
                <figcaption>${info.title}</figcaption>
            </figure>
            `
        );
    }
}

async function loadImagesIntoModal1() {
    try {
        const gallery = document.querySelector(".project-modale");

        // Obtient les images de l'API
        const galeryImg = await fetchData(urlWorks);

        // Vide la galerie actuelle
        gallery.innerHTML = '';

        // Ajoute les nouvelles images à la galerie
        galeryImg.forEach(imgData => {
            const figure = document.createElement("figure");
            const imgElement = document.createElement("img");
            imgElement.src = imgData.imageUrl;
            imgElement.alt = imgData.title;

            const figcaption = document.createElement("figcaption");
            const editLink = document.createElement("a");
            editLink.textContent = "éditer";
            editLink.classList.add("js-edit");
            editLink.href = "#";

            editLink.style.textDecoration = "none";
            editLink.style.color = "black";

            const deleteIcon = document.createElement("i");
            deleteIcon.classList.add("fas", "fa-trash-alt");
            deleteIcon.addEventListener("click", async () => {
                try {
                    await deleteProject(imgData.id);
                    loadImagesIntoModal1(); // Recharge les images après la suppression
                } catch (error) {
                    console.error(error);
                }
            });

            figure.appendChild(imgElement);
            figcaption.appendChild(editLink);
            figure.appendChild(figcaption);
            figure.appendChild(deleteIcon);
            gallery.appendChild(figure);
        });
    } catch (error) {
        console.error(error);
    }
}

function openModal2() {
    const modal2 = document.getElementById("modal2");
    modal2.style.display = "flex";
    modal2.removeAttribute("aria-hidden");

    clearImagePreview();
}

fileInput.addEventListener("change", async (event) => {
    try {
        console.log("Changement détecté");
        
        // Récupère le fichier sélectionné par l'utilisateur
        const selectedFile = event.target.files[0];
        console.log("Fichier sélectionné :", selectedFile);

        // Supprime l'élément prévisualisé s'il existe
        const ajoutPhotoDiv = document.querySelector(".ajoutPhoto");
        const existingPreview = ajoutPhotoDiv.querySelector("img");
        if (existingPreview) {
            existingPreview.remove();
            console.log("Prévisualisation existante supprimée");
        }

        // Si aucun fichier n'a été sélectionné, ne rien faire
        if (!selectedFile) {
            return;
        }

        // Prévisualise l'image sélectionnée
        const previewImage = document.createElement("img");
        previewImage.src = URL.createObjectURL(selectedFile);
        console.log("Prévisualisation de l'image créée :", previewImage);

        // Ajoute l'image prévisualisée à la modalité
        ajoutPhotoDiv.appendChild(previewImage);
        console.log("Image prévisualisée ajoutée à la modalité");

        // Récupérer le nom du fichier sans l'extension
        const filename = selectedFile.name.replace(/\.[^/.]+$/, "");
        console.log("Nom de fichier sans extension :", filename);

        
        // Remplir automatiquement le champ de titre avec le nom du fichier
        const titleInput = document.getElementById('title');
        titleInput.value = filename;
        console.log("Champ de titre rempli automatiquement :", titleInput.value);

        const categoryInput = document.getElementById('category');
        categoryInput.value = determineCategory(filename); 
        console.log("Champ de catégorie rempli automatiquement :", categoryInput.value);

        console.log("Champ de titre rempli automatiquement :", titleInput.value);
    } catch (error) {
        console.error("Une erreur s'est produite lors de la sélection du fichier :", error);
    }
});

async function deleteProject(projectId) {
    try {
        const authToken = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5678/api/works/${projectId}`, {
            method: 'DELETE',
            headers: {
                'Accept': '*/*',
                'Authorization': `Bearer ${authToken}`,
            }
        });

        if (response.ok) {
            console.log(`Projet avec l'ID ${projectId} supprimé avec succès.`);
            // Recharge les projets après la suppression
            await main();
            await refreshGallery(); // Appel de la fonction de rafraîchissement

        const imageElement = document.querySelector(`.gallery img[src*="${projectId}"]`);
            if (imageElement) {
                imageElement.parentElement.remove();
            }
        } else {
            console.error(`Échec de la suppression du projet avec l'ID ${projectId}.`);
        }
        deletedImageIds.push(projectId);
    } catch (error) {
        console.error("Une erreur s'est produite lors de la suppression du projet :", error);
    }
}

async function refreshGallery() {
    try {

        const galeryImg = await fetchData(urlWorks);


        const gallery = document.querySelector(".gallery");
        gallery.innerHTML = '';

        for (const imgData of galeryImg) {
            if (!deletedImageIds.includes(imgData.id)) {
                const imgElement = createProjectWithDeleteButton(imgData.imageUrl, imgData.title, imgData.id);
                gallery.appendChild(imgElement);
            }
        }
    } catch (error) {
        console.error("Erreur lors du rafraîchissement de la galerie :", error);
    }
}

document.querySelector("#introduction a").addEventListener("click", openModal2);
document.querySelector("#portfolio a").addEventListener("click", openModal1);

function closeModal() {
    const modals = document.querySelectorAll(".modal");
    modals.forEach(modal => {
        modal.style.display = "none";
        modal.setAttribute("aria-hidden", true);
    });
}

document.querySelectorAll(".fa-xmark").forEach(xmark => {
    xmark.addEventListener("click", closeModal);
});

document.querySelector(".fa-arrow-left").addEventListener("click", closeModal);

document.addEventListener("click", event => {
    if (event.target.classList.contains("modal-overlay")) {
        closeModal();
    }
});

validateButton.addEventListener("click", () => {
    console.log("Bouton de validation cliqué");
    console.log(authToken);
    validateForm();
});

document.addEventListener("DOMContentLoaded", () => {
    const btnValidate = document.querySelector('.btn_validate');
    const fileInput = document.getElementById('file');
    btnValidate.addEventListener("click", validateForm);
});

function fillFormFields(category, title) {
    titleInput.value = title;

    for (let option of categorySelect.options) {
        if (option.value === category) {
            option.selected = true;
            break;
        }
    }
}

async function init() {
    try {
        const galeryImg = await fetchData(urlWorks);
        await main(galeryImg); // Affiche les projets

        // Charge les images dans la première modalité
        await loadImagesIntoModal1(galeryImg);

        // Ajoute les écouteurs d'événements et autres initialisations
        const tous = document.querySelector(".tous");
        tous.addEventListener ("click" , (e)=> {
            displayProjects(galeryImg , "0");
        } );
        const objets = document.querySelector(".objets");
        objets.addEventListener ("click" , (e)=> {
            displayProjects(galeryImg , "1");
        } );
        const appartements = document.querySelector(".appartements ");
        appartements .addEventListener ("click" , (e)=> {
            displayProjects(galeryImg , "2");
        } );
        const hotels = document.querySelector(".hotels");
        hotels.addEventListener ("click" , (e)=> {
            displayProjects(galeryImg , "3");
        } );
        const deleteIcons = document.querySelectorAll(".fa-trash-alt");
        deleteIcons.forEach(deleteIcon => {
            deleteIcon.addEventListener("click", async () => {
                console.log("Clic sur l'icône de suppression...");
        
                const figure = deleteIcon.parentElement;
                console.log("Élément parent de l'icône de suppression:", figure);
        
                const projectId = figure.querySelector("img").getAttribute("data-id");
                console.log("ID du projet:", projectId);
        
                try {
                    console.log("Tentative de suppression du projet...");
        
                    // Appel de la fonction pour supprimer le projet
                    await deleteProject(projectId);
                    console.log(`Projet avec l'ID ${projectId} supprimé avec succès.`);
        
                    // Supprimer l'image de la galerie
                    figure.remove();
                    console.log("Image supprimée de la galerie.");
                } catch (error) {
                    console.error("Erreur lors de la suppression du projet :", error);
                }
            });
        });
        

        // Initialise d'autres fonctionnalités si nécessaire
        const modal2 = document.querySelector(".modal-2.js-modal-stop");
        if (modal2) {
            modal2.addEventListener("click", stopPropagation);
        }
    } catch (error) {
        console.error(error);
    }
}

function stopPropagation(event) {
    event.stopPropagation();
}

function showEditFeatures() {
    const editButtons = document.querySelectorAll('.js-edit');

    editButtons.forEach(button => {
        button.style.display = 'block';
    });
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  
  
    if (logoutButton) {
        logoutButton.style.display = 'none';
    }

    window.location.href = 'index.html';
}

function toggleEditButtonVisibility() {
    const editButtons = document.querySelectorAll('.js-edit');

    if (isLoggedIn()) {
        editButtons.forEach(button => {
            button.style.display = 'block';
        });
    } else {
        editButtons.forEach(button => {
            button.style.display = 'none';
        });
    }
}
document.addEventListener("DOMContentLoaded", () => {
    const filterButtons = document.querySelectorAll(".filter-button");
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    if (!isLoggedIn || isLoggedIn === 'false') {
        filterButtons.forEach(button => {
            button.style.display = 'none';
        });
    }
});

function isLoggedIn() {
    // Vérifie si l'utilisateur est connecté
    const authToken = localStorage.getItem('authToken');
    return authToken !== null && authToken !== undefined;
}

document.addEventListener("DOMContentLoaded", () => {
    // Appel de la fonction pour afficher ou masquer le bouton "Modifier" en fonction de l'état de connexion initialement
    toggleEditButtonVisibility();

    const loginLogoutLinks = document.querySelectorAll(".login_logout");
    const logoutButton = document.getElementById("logoutButton");
    const editMode = document.querySelectorAll(".edit-mode");
    const modifie = document.getElementById("modif-projet");
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    
    
    if (isLoggedIn === 'true') {
        console.log("L'utilisateur est connecté.");
        loginLogoutLinks.forEach(link => link.style.display = 'none');
        editMode.forEach(edit => edit.style.display = 'block');
        modifie.style.display = 'block';

        if (logoutButton) {
            logoutButton.style.display = 'block';
            logoutButton.addEventListener("click", logout); 
        }
    } else {
        console.log("L'utilisateur n'est pas connecté.");
        editMode.forEach(edit => edit.style.display = 'none');
        modifie.style.display = 'none';

        if (logoutButton) {
            logoutButton.style.display = 'none';
        }

        loginLogoutLinks.forEach(link => {
            link.style.display = 'block';
            link.addEventListener("click", () => {
                console.log("Redirection vers la page de connexion...");
            });
        });
    }
});


const images = document.querySelectorAll('.gallery img');
const trashCans = document.querySelectorAll('.trash-can');



images.forEach((image, index) => {
    const trashCan = trashCans[index];
    const imageRect = image.getBoundingClientRect();
    trashCan.style.top = imageRect.top + 'px';
    trashCan.style.left = (imageRect.left + imageRect.width) + 'px';
});


window.addEventListener('resize', () => {
    images.forEach((image, index) => {
        const trashCan = trashCans[index];
        const imageRect = image.getBoundingClientRect();
        trashCan.style.top = imageRect.top + 'px';
        trashCan.style.left = (imageRect.left + imageRect.width) + 'px';
    });
});


init();