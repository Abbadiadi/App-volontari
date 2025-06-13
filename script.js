// VERSIONE 4.3 - FIX DEFINITIVO SUL NOME DELLA VARIABILE

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyxmMpsXfe8_arpX-ZBnU_nPQc7EfNSPeTyWi3SVejl6dGZSR8MAeNQVnvtmNkJ--xGcQ/exec"; // IMPORTANTE!

// Riferimenti agli elementi HTML
const loginScreen = document.getElementById('login-screen');
const mainApp = document.getElementById('main-app');
// ... (tutti gli altri riferimenti fino a adminTurniList rimangono uguali)
const adminTurniList = document.getElementById('admin-turni-list');


// === LOGICA DI NAVIGAZIONE (invariata) ===
function showView(viewId) {
    document.querySelectorAll('.view').forEach(view => view.style.display = 'none');
    const targetView = document.getElementById(viewId);
    if (targetView) targetView.style.display = 'block';

    document.querySelectorAll('.nav-button').forEach(button => {
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


// === LOGICA DI AUTENTICAZIONE E DATI (invariata) ===
function logout() {
    localStorage.removeItem('userEmail');
    location.reload();
}

async function caricaDati(email) {
    loadingSpinner.classList.remove('hidden');
    loginScreen.style.display = 'none';
    mainApp.style.display = 'none';
    document.getElementById('error-message').classList.add('hidden');
    
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
            document.getElementById('nav-admin').classList.remove('hidden');
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


// === FUNZIONI PER MOSTRARE I CONTENUTI (con la correzione) ===

function mostraTurniPersonali(data) {
    const turniList = document.getElementById('turni-list');
    turniList.innerHTML = '';
    
    // --- ECCO LA CORREZIONE! ---
    // Prima cercava `data.turniPersonali`, ora cerca `data.turni`
    const turniPersonali = data.turni || [];
    // ---------------------------

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
        if (turno.Categoria) card.classList.add('categoria-' + turno.Categoria.trim().toLowerCase().replace(/\s+/g, '-'));
        
        const orario = `${turno['Ora Inizio']} - ${turno['Ora Fine']}`;
        card.innerHTML = `
            <h3><span class="math-inline">\{turno\['Nome Turno'\]\}</h3\>
<p class\="turno\-orario"\></span>{orario}</p>
            <p class="turno-luogo">📍 <span class="math-inline">\{turno\.Luogo\}</p\>
<p class\="turno\-descrizione"\></span>{turno.Descrizione}</p>`;
        turniList.appendChild(card);
    });
}

function mostraPannelloAdmin(data) {
    const adminVolontariList = document.getElementById('admin-volontari-list');
    const adminTurniList = document.getElementById('admin-turni-list');
    adminVolontariList.innerHTML = '';
    adminTurniList.innerHTML = '';

    const tuttiIVolontari = data.tuttiIVolontari || [];
    const tuttiITurni = data.tuttiITurni || [];

    tuttiIVolontari.forEach(volontario => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `<h4>${volontario.Nome} <span class="math-inline">\{volontario\.Cognome\}</h4\><p\></span>{volontario.Email} - Ruolo: ${volontario.Ruolo}</p>`;
        adminVolontariList.appendChild(item);
    });

    tuttiITurni.forEach(turno => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `<h4><span class="math-inline">\{turno\['Nome Turno'\]\}</h4\><p\></span>{turno['Data Inizio']} | <span class="math-inline">\{turno\['Ora Inizio'\]\}\-</span>{turno['Ora Fine']} @ ${turno.Luogo}</p>`;
        adminTurniList.appendChild(item);
    });
}


// === GESTIONE EVENTI GLOBALI ===
document.getElementById('logout-button').addEventListener('click', logout);

document.querySelectorAll('.nav-button').forEach(button => {
    button.addEventListener('click', () => {
        const viewName = button.id.split('-')[1];
        showView(`view-${viewName}`);
    });
});

document.getElementById('login-button').addEventListener('click', () => {
    const email = document.getElementById('email-input').value.trim();
    if (email) {
        localStorage.setItem('userEmail', email);
        caricaDati(email);
    }
});
document.getElementById('email-input').addEventListener('keyup', e => {
    if (e.key === 'Enter') {
        e.preventDefault();
        document.getElementById('login-button').click();
    }
});

document.addEventListener('click', e => {
    const card = e.target.closest('.turno-card');
    if (card) {
        card.classList.toggle('aperta');
    }
});

document.addEventListener('DOMContentLoaded', () =>
