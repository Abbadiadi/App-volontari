// VERSIONE 4.1 - Definitiva e Corretta

const SCRIPT_URL = "INCOLLA_QUI_IL_TUO_URL_DELLO_SCRIPT"; // IMPORTANTE!

// Riferimenti a tutti gli elementi HTML usati nello script
const loginScreen = document.getElementById('login-screen');
const mainApp = document.getElementById('main-app');
const emailInput = document.getElementById('email-input');
const loginButton = document.getElementById('login-button');
const errorMessage = document.getElementById('error-message');
const loadingSpinner = document.getElementById('loading-spinner');
const mainTitle = document.getElementById('main-title');
const turniList = document.getElementById('turni-list');
const allViews = document.querySelectorAll('.view');
const logoutButton = document.getElementById('logout-button');
const navButtons = document.querySelectorAll('.nav-button');
const navAdmin = document.getElementById('nav-admin');
const adminVolontariList = document.getElementById('admin-volontari-list');
const adminTurniList = document.getElementById('admin-turni-list');

// --- LOGICA DI NAVIGAZIONE ---
function showView(viewId) {
    allViews.forEach(view => {
        view.style.display = 'none';
    });
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.style.display = 'block';
    }

    navButtons.forEach(button => {
        button.classList.remove('active');
        // Ricostruisce l'id della vista dal bottone per il confronto
        const buttonViewName = button.id.split('-')[1]; 
        if (`view-${buttonViewName}` === viewId) {
            button.classList.add('active');
            mainTitle.textContent = button.querySelector('span').textContent;
        }
    });
}

// --- LOGICA DI AUTENTICAZIONE E DATI ---
function logout() {
    localStorage.removeItem('userEmail');
    location.reload();
}

async function caricaDati(email) {
    loadingSpinner.classList.remove('hidden');
    loginScreen.style.display = 'none';
    mainApp.style.display = 'none';
    errorMessage.classList.add('hidden');
    
    try {
        const response = await fetch(`<span class="math-inline">\{SCRIPT\_URL\}?email\=</span>{encodeURIComponent(email)}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        loginScreen.style.display = 'none';
        mainApp.style.display = 'block';
        showView('view-turni');
        
        mostraTurniPersonali(data);

        if (data.user.ruolo === 'Admin' || data.user.ruolo === 'Responsabile') {
            console.log("Utente con privilegi. Abilito funzioni e vista Admin.");
            navAdmin.classList.remove('hidden');
            mostraPannelloAdmin(data);
        }
        
    } catch (error) {
        console.error("Errore nel caricamento dati:", error);
        alert("Si è verificato un errore: " + error.message);
        logout();
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}

// --- FUNZIONI PER MOSTRARE I CONTENUTI ---

function mostraTurniPersonali(data) {
    turniList.innerHTML = '';
    const turniPersonali = data.turniPersonali || [];

    if (turniPersonali.length === 0) {
        turniList.innerHTML = '<p style="text-align: center; color: var(--colore-grigio-testo);">Nessun turno personale assegnato.</p>';
        return;
    }

    const now = new Date();
    
    const turniFuturi = [], turniPassati = [];
    let turnoAttuale = null;

    const parseDateTime = (dateStr, timeStr) => {
        const dateParts = dateStr.split('/');
        const timeParts = timeStr.split(':');
        return new Date(dateParts[2], dateParts[1] - 1, dateParts[0], timeParts[0], timeParts[1]);
    };

    turniPersonali.forEach(turno => {
        const inizio = parseDateTime(turno['Data Inizio'], turno['Ora Inizio']);
        const fine = parseDateTime(turno['Data Inizio'], turno['Ora Fine']);
        if (now >= inizio && now <= fine) turnoAttuale = turno;
        else if (now > fine) turniPassati.push(turno);
        else turniFuturi.push(turno);
    });
    turniPassati.reverse();

    const turniOrdinati = [
        ...(turnoAttuale ? [turnoAttuale] : []),
        ...turniFuturi,
        ...turniPassati
    ];

    turniOrdinati.forEach(turno => {
        const card = document.createElement('div');
        card.className = 'turno-card';
        const inizio = parseDateTime(turno['Data Inizio'], turno['Ora Inizio']);
        const fine = parseDateTime(turno['Data Inizio'], turno['Ora Fine']);
        if (now >= inizio && now <= fine) card.classList.add('attuale');
        else if (now > fine) card.classList.add('passato');
        if (turno.Categoria) card
