// Questo è il codice JavaScript che viene eseguito nel browser dell'utente

// IMPORTANTE: Incolla qui l'URL che otterrai dopo aver fatto il "Deploy" del Google Apps Script
const SCRIPT_URL = "https://abbadiadi.github.io/App-volontari/";

// Riferimenti agli elementi HTML
const loginScreen = document.getElementById('login-screen');
const mainApp = document.getElementById('main-app');
const emailInput = document.getElementById('email-input');
const loginButton = document.getElementById('login-button');
const errorMessage = document.getElementById('error-message');
const userProfile = document.getElementById('user-profile');
const turniList = document.getElementById('turni-list');
const loadingSpinner = document.getElementById('loading-spinner');

// Logica al click del pulsante di login
loginButton.addEventListener('click', () => {
    const email = emailInput.value.trim();
    if (email === "") {
        mostraErrore("Per favore, inserisci un'email.");
        return;
    }
    
    // Salva l'email e carica i dati
    localStorage.setItem('userEmail', email); // Salviamo l'email per accessi futuri
    caricaDati(email);
});

// Funzione per mostrare un errore nel login
function mostraErrore(messaggio) {
    errorMessage.textContent = messaggio;
    errorMessage.classList.remove('hidden');
}

// Funzione per caricare i dati dal nostro "server" (Google Apps Script)
async function caricaDati(email) {
    // Mostra l'indicatore di caricamento e nasconde il resto
    loadingSpinner.classList.remove('hidden');
    loginScreen.classList.add('hidden');
    mainApp.classList.add('hidden');
    errorMessage.classList.add('hidden');

    try {
        // Chiama lo script online, passando l'email come parametro
        const response = await fetch(`${SCRIPT_URL}?email=${encodeURIComponent(email)}`);
        const data = await response.json();

        // Controlla se ci sono stati errori dal server
        if (data.error) {
            throw new Error(data.error);
        }

        // Se tutto è OK, mostra l'app principale
        mostraApp(data);

    } catch (error) {
        // Se c'è un errore, torna alla schermata di login e mostralo
        console.error("Errore nel caricamento dati:", error);
        mostraErrore(`Errore: ${error.message}. Riprova.`);
        loginScreen.classList.remove('hidden');
        localStorage.removeItem('userEmail'); // Rimuove l'email salvata se il login fallisce
    } finally {
        // Nasconde l'indicatore di caricamento in ogni caso
        loadingSpinner.classList.add('hidden');
    }
}

// Funzione per "costruire" e mostrare l'app con i dati ricevuti
function mostraApp(data) {
    // Mostra il contenitore principale dell'app
    mainApp.classList.remove('hidden');

    // Mostra il profilo utente
    userProfile.innerHTML = `<h2>Ciao, ${data.user.nome}!</h2><p>Ruolo: ${data.user.ruolo}</p>`;

    // Pulisce la lista dei turni precedente
    turniList.innerHTML = ''; 

    // Controlla se ci sono turni da mostrare
    if (data.turni.length === 0) {
        turniList.innerHTML = '<p>Nessun turno assegnato per oggi.</p>';
        return;
    }

    // Per ogni turno ricevuto, crea una "card" HTML
    data.turni.forEach(turno => {
        const card = document.createElement('div');
        card.className = 'turno-card';
        
        // Formatta l'orario
        const orario = `${turno['Ora Inizio']} - ${turno['Ora Fine']}`;
        
        // Aggiunge il contenuto HTML alla card
        card.innerHTML = `
            <h3>${turno['Nome Turno']}</h3>
            <p class="turno-orario">${orario}</p>
            <p class="turno-luogo">📍 ${turno.Luogo}</p>
            <p class="turno-descrizione">${turno.Descrizione}</p>
        `;
        
        // Aggiunge la card alla lista nel nostro HTML
        turniList.appendChild(card);
    });
}

// Controlla se l'utente era già loggato all'avvio dell'app
document.addEventListener('DOMContentLoaded', () => {
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
        emailInput.value = savedEmail; // Pre-compila l'email
        caricaDati(savedEmail); // Prova a caricare i dati automaticamente
    }
});
