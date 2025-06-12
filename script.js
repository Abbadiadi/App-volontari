// VERSIONE 3.2 - COMPLETA E CORRETTA

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzB_OGRtu0C0dldguVULzacJeLjDvGzNe_PSF7VqFj6UMzSnG823BXt1LAc7mPH0nm0tg/exec"; // IMPORTANTE! Assicurati che qui ci sia il tuo URL corretto

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
const navAdmin = document.getElementById('nav-admin');

// === LOGICA DI NAVIGAZIONE ===
function showView(viewId) {
    // Nasconde tutte le "schermate"
    allViews.forEach(view => view.style.display = 'none');
    
    // Mostra solo la schermata richiesta
    const targetView = document.getElementById(viewId);
    if (targetView) targetView.style.display = 'block';

    // Aggiorna lo stato "attivo" e il titolo dell'header
    navButtons.forEach(button => {
        button.classList.remove('active');
        const buttonViewName = button.id.split('-')[1]; // es. "turni" da "nav-turni"
        if (`view-${buttonViewName}` === viewId) {
            button.classList.add('active');
            mainTitle.textContent = button.querySelector('span').textContent;
        }
    });
}

// Aggiunge gli eventi di click a tutti i pulsanti di navigazione
document.querySelectorAll('.nav-button').forEach(button => {
    button.addEventListener('click', () => {
        const viewName = button.id.split('-')[1];
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

        // Se i dati sono stati caricati con successo...
        loginScreen.style.display = 'none';
        mainApp.style.display = 'block';
        showView('view-turni'); // Mostra la vista dei turni come default
        
        mostraTurni(data); // Popola la vista dei turni

        // Controlla il ruolo e mostra il pulsante Admin se necessario
        if (data.user.ruolo === 'Admin' || data.user.ruolo === 'Responsabile') {
            console.log("Utente con privilegi. Funzioni speciali abilitate.");
            navAdmin.classList.remove('hidden'); // Mostra il pulsante Admin
        }
        
    } catch (error) {
        console.error("Errore nel caricamento dati:", error);
        alert("Si è verificato un errore: " + error.message);
        logout(); // Se c'è un errore, torna al login
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}

function mostraTurni(data) {
    turniList.innerHTML = '';
    if (data.turni.length === 0) {
        turniList.innerHTML = '<p style="text-align: center; color: var(--colore-grigio-testo);">Nessun turno assegnato.</p>';
        return;
    }

    const now = new Date();
    
    const turniFuturi = [];
    const turniPassati = [];
    let turnoAttuale = null;

    const parseDateTime = (dateStr, timeStr) => {
        const dateParts = dateStr.split('/');
        const timeParts = timeStr.split(':');
        return new Date(dateParts[2], dateParts[1] - 1, dateParts[0], timeParts[0], timeParts[1]);
    };

    data.turni.forEach(turno => {
        const inizio = parseDateTime(turno['Data Inizio'], turno['Ora Inizio']);
        const fine = parseDateTime(turno['Data Inizio'], turno['Ora Fine']);
        if (now >= inizio && now <= fine) {
            turnoAttuale = turno;
        } else if (now > fine) {
            turniPassati.push(turno);
        } else {
            turniFuturi.push(turno);
        }
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
        if (now >= inizio && now <= fine) {
            card.classList.add('attuale');
        } else if (now > fine) {
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


// === GESTIONE EVENTI ===
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
        loginScreen.style.display = 'none';
        caricaDati(savedEmail);
    } else {
        loginScreen.style.display = 'block';
    }
});
