// VERSIONE 3.0: Interfaccia a schede e turni dinamici

const SCRIPT_URL = "INCOLLA_QUI_IL_TUO_URL_DELLO_SCRIPT"; // IMPORTANTE!

// Riferimenti agli elementi HTML
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

// === LOGICA DI NAVIGAZIONE ===
function showView(viewId) {
    allViews.forEach(view => view.style.display = 'none');
    const targetView = document.getElementById(viewId);
    if (targetView) targetView.style.display = 'block';

    navButtons.forEach(button => {
        button.classList.remove('active');
        if (button.id === `nav-${viewId.split('-')[1]}`) {
            button.classList.add('active');
            mainTitle.textContent = button.querySelector('span').textContent;
        }
    });
}

document.querySelectorAll('.nav-button').forEach(button => {
    button.addEventListener('click', () => {
        const viewName = button.id.split('-')[1]; // es. "turni" da "nav-turni"
        showView(`view-${viewName}`);
    });
});

// === LOGICA DI AUTENTICAZIONE E DATI ===
function logout() {
    localStorage.removeItem('userEmail');
    location.reload();
}
logoutButton.addEventListener('click', logout);

async function caricaDati(email) {
    loadingSpinner.classList.remove('hidden');
    loginScreen.style.display = 'none';
    mainApp.style.display = 'none';
    errorMessage.classList.add('hidden');
    
    try {
        const response = await fetch(`${SCRIPT_URL}?email=${encodeURIComponent(email)}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        loginScreen.style.display = 'none';
        mainApp.style.display = 'block';
        showView('view-turni'); // Mostra la vista dei turni di default
        
        mostraTurni(data);

        if (data.user.ruolo === 'Admin' || data.user.ruolo === 'Responsabile') {
            console.log("Utente con privilegi. Funzioni speciali da abilitare.");
        }
        
    } catch (error) {
        console.error("Errore nel caricamento dati:", error);
        logout();
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}

function mostraTurni(data) {
    turniList.innerHTML = '';
    if (data.turni.length === 0) {
        turniList.innerHTML = '<p>Nessun turno assegnato.</p>';
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

    data.turni.forEach(turno => {
        const inizio = parseDateTime(turno['Data Inizio'], turno['Ora Inizio']);
        const fine = parseDateTime(turno['Data Inizio'], turno['Ora Fine']);
        if (now >= inizio && now <= fine) turnoAttuale = turno;
        else if (now > fine) turniPassati.push(turno);
        else turniFuturi.push(turno);
    });
    turniPassati.reverse();

    const turniOrdinati = [];
    if (turnoAttuale) turniOrdinati.push(turnoAttuale);
    turniOrdinati.push(...turniFuturi, ...turniPassati);

    turniOrdinati.forEach(turno => {
        const card = document.createElement('div');
        card.className = 'turno-card';
        const inizio = parseDateTime(turno['Data Inizio'], turno['Ora Inizio']);
        const fine = parseDateTime(turno['Data Inizio'], turno['Ora Fine']);
        if (now >= inizio && now <= fine) card.classList.add('attuale');
        else if (now > fine) card.classList.add('passato');
        if (turno.Categoria) card.classList.add('categoria-' + turno.Categoria.trim().toLowerCase().replace(/\s+/g, '-'));
        
        card.innerHTML = `<h3>${turno['Nome Turno']}</h3>
                          <p class="turno-orario">${turno['Ora Inizio']} - ${turno['Ora Fine']}</p>
                          <p class="turno-luogo">📍 ${turno.Luogo}</p>
                          <p class="turno-descrizione">${turno.Descrizione}</p>`;
        turniList.appendChild(card);
    });
}

// === GESTIONE EVENTI ===
loginButton.addEventListener('click', () => {
    const email = emailInput.value.trim();
    if (email) {
        localStorage.setItem('userEmail', email);
        caricaDati(email);
    }
});
emailInput.addEventListener('keyup', e => e.key === 'Enter' && loginButton.click());

document.addEventListener('click', e => {
    const card = e.target.closest('.turno-card');
    if (card) card.classList.toggle('aperta');
});

document.addEventListener('DOMContentLoaded', () => {
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
        loginScreen.style.display = 'none';
        caricaDati(savedEmail);
    } else {
        loginScreen.style.display = 'block';
    }
});
