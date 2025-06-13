// VERSIONE STABILE SEMPLIFICATA

const SCRIPT_URL = "INCOLLA_QUI_IL_TUO_URL_DELLO_SCRIPT"; // IMPORTANTE!

// Riferimenti agli elementi HTML
const loginScreen = document.getElementById('login-screen');
const mainApp = document.getElementById('main-app');
const emailInput = document.getElementById('email-input');
const loginButton = document.getElementById('login-button');
const errorMessage = document.getElementById('error-message');
const loadingSpinner = document.getElementById('loading-spinner');
const turniList = document.getElementById('turni-list');
const logoutButton = document.getElementById('logout-button');

// --- LOGICA DI AUTENTICAZIONE E DATI ---
function logout() {
    localStorage.removeItem('userEmail');
    location.reload();
}

async function caricaDati(email) {
    loadingSpinner.classList.remove('hidden');
    loginScreen.classList.add('hidden');
    mainApp.classList.add('hidden');
    errorMessage.classList.add('hidden');
    
    try {
        const response = await fetch(`${SCRIPT_URL}?email=${encodeURIComponent(email)}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        loginScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
        
        mostraTurni(data);
        
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
        turniList.innerHTML = '<p style="text-align: center;">Nessun turno assegnato.</p>';
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
            card.classList.add('categoria-' + turno.Categoria.trim().toLowerCase());
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

// --- GESTIONE EVENTI ---
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
