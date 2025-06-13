// VERSIONE COMPLETA CON NAVIGAZIONE

const SCRIPT_URL = "INCOLLA_QUI_IL_TUO_URL_DI_DEPLOYMENT"; // IMPORTANTE!

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
const navAdmin = document.getElementById('nav-admin');
const adminVolontariList = document.getElementById('admin-volontari-list');
const adminTurniList = document.getElementById('admin-turni-list');

// === LOGICA DI NAVIGAZIONE ===
function showView(viewId) {
    allViews.forEach(view => {
        view.classList.add('hidden');
        view.classList.remove('active');
    });
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.remove('hidden');
        targetView.classList.add('active');
    }

    document.querySelectorAll('.nav-button').forEach(button => {
        button.classList.remove('active');
        const buttonViewName = button.id.split('-')[1];
        if (`view-${buttonViewName}` === viewId) {
            button.classList.add('active');
            if(button.querySelector('span')) {
                mainTitle.textContent = button.querySelector('span').textContent;
            }
        }
    });
}

// === LOGICA DI AUTENTICAZIONE E DATI ===
function logout() { localStorage.removeItem('userEmail'); location.reload(); }

async function caricaDati(email) {
    loadingSpinner.classList.remove('hidden');
    loginScreen.classList.add('hidden');
    mainApp.classList.add('hidden');
    errorMessage.innerHTML = '';
    
    try {
        const response = await fetch(`${SCRIPT_URL}?email=${encodeURIComponent(email)}`);
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        mainApp.classList.remove('hidden');
        showView('view-turni');
        
        mostraTurniPersonali(data);

        if (data.user.ruolo === 'Admin' || data.user.ruolo === 'Responsabile') {
            navAdmin.classList.remove('hidden');
            mostraPannelloAdmin(data);
        }
        
    } catch (error) {
        alert("Si è verificato un errore: " + error.message);
        logout();
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}

function mostraTurniPersonali(data) {
    turniList.innerHTML = '';
    const turniPersonali = data.turni || [];
    if (turniPersonali.length === 0) {
        turniList.innerHTML = '<p style="text-align: center;">Nessun turno personale assegnato.</p>';
        return;
    }
    // ... logica per creare le card...
}

function mostraPannelloAdmin(data) {
    adminVolontariList.innerHTML = '';
    adminTurniList.innerHTML = '';
    const tuttiIVolontari = data.tuttiIVolontari || [];
    const tuttiITurni = data.tuttiITurni || [];
    // ... logica per creare le liste admin...
}

// === GESTIONE EVENTI ===
logoutButton.addEventListener('click', logout);
document.querySelectorAll('.nav-button').forEach(button => {
    button.addEventListener('click', () => {
        showView(`view-${button.id.replace('nav-','view-')}`);
    });
});
loginButton.addEventListener('click', () => { /* ... */ });
emailInput.addEventListener('keyup', e => { /* ... */ });
document.addEventListener('click', e => { /* ... */ });
document.addEventListener('DOMContentLoaded', () => { /* ... */ });
