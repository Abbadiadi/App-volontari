// VERSIONE CON PANNELLO ADMIN

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwTIHtjYE4t0hvryfgZmozEK5tNOnCAWFUuhG7o2u-htxAOue5Gegg_oG1fDFrRI6-arQ/exec"; // IMPORTANTE!

const loginScreen = document.getElementById('login-screen');
const mainApp = document.getElementById('main-app');
const emailInput = document.getElementById('email-input');
const loginButton = document.getElementById('login-button');
const errorMessage = document.getElementById('error-message');
const loadingSpinner = document.getElementById('loading-spinner');
const turniList = document.getElementById('turni-list');
const logoutButton = document.getElementById('logout-button');
const mainTitle = document.getElementById('main-title');
const adminPanelButton = document.getElementById('admin-panel-button');
const userView = document.getElementById('user-view');
const adminView = document.getElementById('admin-view');
const adminVolontariList = document.getElementById('admin-volontari-list');
const adminTurniList = document.getElementById('admin-turni-list');

function logout() {
    localStorage.removeItem('userEmail');
    location.reload();
}

async function caricaDati(email) {
    loadingSpinner.classList.remove('hidden');
    loginScreen.classList.add('hidden');
    mainApp.classList.add('hidden');
    errorMessage.innerHTML = '';
    
    try {
        const response = await fetch(`${SCRIPT_URL}?email=${encodeURIComponent(email)}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        loginScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
        
        mostraTurni(data);

        if (data.user.ruolo === 'Admin' || data.user.ruolo === 'Responsabile') {
            adminPanelButton.classList.remove('hidden');
            mostraPannelloAdmin(data);
        }
        
    } catch (error) {
        alert("Si è verificato un errore: " + error.message);
        logout();
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}

function mostraTurni(data) {
    turniList.innerHTML = '';
    const turniPersonali = data.turni || [];

    if (turniPersonali.length === 0) {
        turniList.innerHTML = '<p style="text-align: center; color: var(--colore-grigio-testo);">Nessun turno assegnato.</p>';
        return;
    }

    const now = new Date();
    const parseDateTime = (turno) => {
        const dateParts = turno['Data Inizio'].split('/');
        const timeParts = turno['Ora Inizio'].split(':');
        return new Date(dateParts[2], dateParts[1] - 1, dateParts[0], timeParts[0], timeParts[1]);
    };

    turniPersonali.forEach(turno => {
        const card = document.createElement('div');
        card.className = 'turno-card';

        const fine = parseDateTime(turno);
        if (now > fine) {
            card.classList.add('passato');
        }
        if (turno.Categoria) {
            const categoriaClasse = 'categoria-' + turno.Categoria.trim().toLowerCase().replace(/\s+/g, '-');
            card.classList.add(categoriaClasse);
        }
        
        const orario = `${turno['Ora Inizio']} - ${turno['Ora Fine']}`;
        card.innerHTML = `
            <h3>${turno['Nome Turno']}</h3>
            <p class="turno-orario">${orario}</p>
            <p class="turno-luogo">📍 ${turno.Luogo}</p>
            <p class="turno-descrizione">${turno.Descrizione}</p>`;
        turniList.appendChild(card);
    });
}

function mostraPannelloAdmin(data) {
    adminVolontariList.innerHTML = '';
    adminTurniList.innerHTML = '';
    const tuttiIVolontari = data.tuttiIVolontari || [];
    const tuttiITurni = data.tuttiITurni || [];

    tuttiIVolontari.forEach(volontario => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `<h4>${volontario.Nome} ${volontario.Cognome}</h4><p>${volontario.Email} - Ruolo: ${volontario.Ruolo}</p>`;
        adminVolontariList.appendChild(item);
    });

    tuttiITurni.forEach(turno => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `<h4>${turno['Nome Turno']}</h4><p>${turno['Data Inizio']} | ${turno['Ora Inizio']}-${turno['Ora Fine']} @ ${turno.Luogo}</p>`;
        adminTurniList.appendChild(item);
    });
}

// === GESTIONE EVENTI ===
logoutButton.addEventListener('click', logout);

loginButton.addEventListener('click', () => {
    const email = emailInput.value.trim();
    if (email) {
        localStorage.setItem('userEmail', email);
        caricaDati(email);
    }
});

emailInput.addEventListener('keyup', e => {
    if (e.key === 'Enter') {
        e.preventDefault();
        loginButton.click();
    }
});

document.addEventListener('click', e => {
    const card = e.target.closest('.turno-card');
    if (card) {
        card.classList.toggle('aperta');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
        loginScreen.classList.add('hidden');
        caricaDati(savedEmail);
    }
});

// Nuovi eventi per cambiare vista
adminPanelButton.addEventListener('click', () => {
    userView.classList.add('hidden');
    adminView.classList.remove('hidden');
    mainTitle.textContent = "Pannello di Controllo";
});

mainTitle.addEventListener('click', () => {
    if (!adminView.classList.contains('hidden')) {
        adminView.classList.add('hidden');
        userView.classList.remove('hidden');
        mainTitle.textContent = "I Miei Turni";
    }
});
