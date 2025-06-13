// VERSIONE 5.0 - Fornita in 3 parti per evitare errori di troncamento

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyxmMpsXfe8_arpX-ZBnU_nPQc7EfNSPeTyWi3SVejl6dGZSR8MAeNQVnvtmNkJ--xGcQ/exec"; // IMPORTANTE!

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

// === LOGICA DI NAVIGAZIONE ===
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
        const buttonViewName = button.id.split('-')[1];
        if (`view-${buttonViewName}` === viewId) {
            button.classList.add('active');
            if (button.querySelector('span')) {
                mainTitle.textContent = button.querySelector('span').textContent;
            }
        }
    });
}

// === LOGICA DI AUTENTICAZIONE E DATI ===
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
        const response = await fetch(`${SCRIPT_URL}?email=${encodeURIComponent(email)}`);
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

// === FUNZIONI PER MOSTRARE I CONTENUTI ===

function mostraTurniPersonali(data) {
    turniList.innerHTML = '';
    const turniPersonali = data.turni || [];

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

function mostraPannelloAdmin(data) {
    adminVolontariList.innerHTML = '';
    adminTurniList.innerHTML = '';
    const tuttiIVolontari = data.tuttiIVolontari || [];
    const tuttiITurni = data.tuttiITurni || [];

    if (tuttiIVolontari.length > 0) {
        tuttiIVolontari.forEach(volontario => {
            const item = document.createElement('div');
            item.className = 'list-item';
            item.innerHTML = `<h4>${volontario.Nome} ${volontario.Cognome}</h4><p>${volontario.Email} - Ruolo: ${volontario.Ruolo}</p>`;
            adminVolontariList.appendChild(item);
        });
    }

    if (tuttiITurni.length > 0) {
        tuttiITurni.forEach(turno => {
            const item = document.createElement('div');
            item.className = 'list-item';
            item.innerHTML = `<h4>${turno['Nome Turno']}</h4><p>${turno['Data Inizio']} | ${turno['Ora Inizio']}-${turno['Ora Fine']} @ ${turno.Luogo}</p>`;
            adminTurniList.appendChild(item);
        });
    }
}

// === GESTIONE EVENTI GLOBALI ===

// Event listener per il pulsante di logout
logoutButton.addEventListener('click', logout);

// Event listener per i pulsanti di navigazione
document.querySelectorAll('.nav-button').forEach(button => {
    button.addEventListener('click', () => {
        const viewName = button.id.split('-')[1];
        showView(`view-${viewName}`);
    });
});

// Event listener per il login
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

// Event listener per espandere le card dei turni
document.addEventListener('click', e => {
    const card = e.target.closest('.turno-card');
    if (card) {
        card.classList.toggle('aperta');
    }
});

// Event listener per il caricamento iniziale della pagina
document.addEventListener('DOMContentLoaded', () => {
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
        loginScreen.classList.add('hidden');
        caricaDati(savedEmail);
    } else {
        loginScreen.classList.remove('hidden');
    }
});
