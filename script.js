// VERSIONE 2.1: CON FUNZIONE DI LOGOUT

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw7zpWPsDEIwoZwoh5A7lokHdId3gAIubyGMlau1NCWW3QSgqplN_skakU6EPRprY8ccA/exec"; // ASSICURATI CHE QUI CI SIA IL TUO URL CORRETTO!

// Riferimenti agli elementi HTML
const loginScreen = document.getElementById('login-screen');
const mainApp = document.getElementById('main-app');
const emailInput = document.getElementById('email-input');
const loginButton = document.getElementById('login-button');
const errorMessage = document.getElementById('error-message');
const loadingSpinner = document.getElementById('loading-spinner');

// Riferimenti agli elementi dell'app principale
const mainTitle = document.getElementById('main-title');
const turniList = document.getElementById('turni-list');
const allViews = document.querySelectorAll('.view');
const logoutButton = document.getElementById('logout-button'); // NUOVO RIFERIMENTO

// Riferimenti ai pulsanti di navigazione
const navButtons = document.querySelectorAll('.nav-button');
const navTurni = document.getElementById('nav-turni');
const navProgramma = document.getElementById('nav-programma');
const navChat = document.getElementById('nav-chat');
const navPlanimetria = document.getElementById('nav-planimetria');


// === NUOVA FUNZIONE DI LOGOUT ===
function logout() {
    // 1. Rimuove l'email salvata dalla memoria del browser
    localStorage.removeItem('userEmail');
    // 2. Ricarica la pagina. Questo riporterà automaticamente alla schermata di login
    // perché non troverà più un'email salvata. È il modo più pulito e sicuro.
    location.reload();
}

// Aggiunge l'evento di click al pulsante di logout
logoutButton.addEventListener('click', logout);
// ================================


// === LOGICA CAMBIO SCHERMATA (invariata) ===
function showView(viewId) {
    allViews.forEach(view => {
        view.classList.add('hidden');
        view.classList.remove('active-view');
    });
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.remove('hidden');
        targetView.classList.add('active-view');
    }
    navButtons.forEach(button => {
        button.classList.remove('active');
    });
    const activeButton = document.getElementById(`nav-${viewId.split('-')[1]}`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    mainTitle.textContent = activeButton.querySelector('span').textContent;
}

navTurni.addEventListener('click', () => showView('view-turni'));
navProgramma.addEventListener('click', () => showView('view-programma'));
navChat.addEventListener('click', () => showView('view-chat'));
navPlanimetria.addEventListener('click', () => showView('view-planimetria'));
// =======================================


// === LOGICA DI LOGIN E CARICAMENTO DATI (invariata) ===
async function caricaDati(email) {
    loadingSpinner.classList.remove('hidden');
    loginScreen.classList.add('hidden');
    mainApp.classList.add('hidden');
    
    try {
        const response = await fetch(`${SCRIPT_URL}?email=${encodeURIComponent(email)}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        loginScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
        
        mostraTurni(data);

        if (data.user.ruolo === 'Admin' || data.user.ruolo === 'Responsabile') {
            console.log("Utente con privilegi elevati. Qui abiliteremo le funzioni speciali.");
        }
        
    } catch (error) {
        console.error("Errore nel caricamento dati:", error);
        // Se il caricamento fallisce (es. utente rimosso), esegui il logout per pulire
        logout();
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}

// Funzione specifica per mostrare solo i turni (invariata)
function mostraTurni(data) {
    turniList.innerHTML = '';
    if (data.turni.length === 0) {
        turniList.innerHTML = '<p>Nessun turno assegnato per oggi.</p>';
        return;
    }
    data.turni.forEach(turno => {
        const card = document.createElement('div');
        card.className = 'turno-card';
        if (turno.Categoria) {
            const categoriaClasse = 'categoria-' + turno.Categoria.trim().toLowerCase().replace(/\s+/g, '-');
            card.classList.add(categoriaClasse);
        }
        const orario = `${turno['Ora Inizio']} - ${turno['Ora Fine']}`;
        card.innerHTML = `
            <h3>${turno['Nome Turno']}</h3>
            <p class="turno-orario">${orario}</p>
            <p class="turno-luogo">📍 ${turno.Luogo}</p>
            <p class="turno-descrizione">${turno.Descrizione}</p>
        `;
        turniList.appendChild(card);
    });
}

// --- Eventi di Login e Caricamento Iniziale (invariati) ---
loginButton.addEventListener('click', () => {
    const email = emailInput.value.trim();
    if (email) {
        localStorage.setItem('userEmail', email);
        caricaDati(email);
    }
});

emailInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        loginButton.click();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
        caricaDati(savedEmail);
    } else {
        loginScreen.classList.remove('hidden');
    }
});
