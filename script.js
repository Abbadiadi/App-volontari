// VERSIONE 2: CON GESTIONE DELLE SCHERMATE

const SCRIPT_URL = "INCOLLA_QUI_IL_TUO_URL_DELLO_SCRIPT";

// Riferimenti agli elementi HTML
const loginScreen = document.getElementById('login-screen');
const mainApp = document.getElementById('main-app');
const emailInput = document.getElementById('email-input');
const loginButton = document.getElementById('login-button');
const errorMessage = document.getElementById('error-message');
const loadingSpinner = document.getElementById('loading-spinner');

// Riferimenti ai nuovi elementi dell'app principale
const mainTitle = document.getElementById('main-title');
const turniList = document.getElementById('turni-list');
const allViews = document.querySelectorAll('.view');

// Riferimenti ai pulsanti di navigazione
const navButtons = document.querySelectorAll('.nav-button');
const navTurni = document.getElementById('nav-turni');
const navProgramma = document.getElementById('nav-programma');
const navChat = document.getElementById('nav-chat');
const navPlanimetria = document.getElementById('nav-planimetria');

// === LOGICA CAMBIO SCHERMATA (NUOVA) ===
function showView(viewId) {
    // Nasconde tutte le viste
    allViews.forEach(view => {
        view.classList.add('hidden');
        view.classList.remove('active-view');
    });

    // Mostra solo la vista richiesta
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.remove('hidden');
        targetView.classList.add('active-view');
    }

    // Aggiorna lo stato "attivo" dei pulsanti di navigazione
    navButtons.forEach(button => {
        button.classList.remove('active');
    });
    const activeButton = document.getElementById(`nav-${viewId.split('-')[1]}`);
    if (activeButton) {
        activeButton.classList.add('active');
    }

    // Aggiorna il titolo nell'header
    // (Prende il testo dal pulsante di navigazione corrispondente)
    mainTitle.textContent = activeButton.querySelector('span').textContent;
}

// Aggiunge gli eventi di click ai pulsanti di navigazione
navTurni.addEventListener('click', () => showView('view-turni'));
navProgramma.addEventListener('click', () => showView('view-programma'));
navChat.addEventListener('click', () => showView('view-chat'));
navPlanimetria.addEventListener('click', () => showView('view-planimetria'));
// =======================================


// === LOGICA DI LOGIN E CARICAMENTO DATI (invariata ma con modifiche finali) ===
async function caricaDati(email) {
    loadingSpinner.classList.remove('hidden');
    loginScreen.classList.add('hidden');
    mainApp.classList.add('hidden');
    
    try {
        const response = await fetch(`${SCRIPT_URL}?email=${encodeURIComponent(email)}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        // Nasconde la schermata di login e mostra l'app
        loginScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
        
        // Esegue la funzione per mostrare i dati
        mostraTurni(data); // Modificato da mostraApp a mostraTurni

        // *** INTEGRAZIONE RUOLI ADMIN/RESPONSABILE (da sviluppare) ***
        if (data.user.ruolo === 'Admin' || data.user.ruolo === 'Responsabile') {
            console.log("Utente con privilegi elevati. Qui abiliteremo le funzioni speciali.");
            // Esempio: potremmo mostrare un pulsante admin
        }
        
    } catch (error) {
        console.error("Errore nel caricamento dati:", error);
        loginScreen.classList.remove('hidden');
        mainApp.classList.add('hidden');
        // Qui mostreremo l'errore nel login-card
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}

// Funzione specifica per mostrare solo i turni (ex mostraApp)
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

// --- Eventi di Login e Caricamento Iniziale (leggermente modificati) ---
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
        mainApp.classList.remove('hidden');
        loginScreen.classList.add('hidden');
        caricaDati(savedEmail);
    }
});
