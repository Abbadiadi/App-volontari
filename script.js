// Versione 2.1 - Ordinamento corretto

function doGet(e) {
  const userEmail = e.parameter.email;
  
  if (!userEmail) {
    return ContentService.createTextOutput(JSON.stringify({ "error": "Email non fornita" })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const volontariSheet = ss.getSheetByName("Volontari");
    const turniSheet = ss.getSheetByName("Turni");
    const assegnazioniSheet = ss.getSheetByName("Assegnazioni");

    const volontariData = volontariSheet.getDataRange().getValues();
    const turniData = turniSheet.getDataRange().getValues();
    const assegnazioniData = assegnazioniSheet.getDataRange().getValues();

    const volontariHeaders = volontariData.shift();
    const turniHeaders = turniData.shift();
    const assegnazioniHeaders = assegnazioniData.shift();

    const emailVolontarioIndex = volontariHeaders.indexOf("Email");
    const ruoloVolontarioIndex = volontariHeaders.indexOf("Ruolo");
    const nomeVolontarioIndex = volontariHeaders.indexOf("Nome");

    const idTurnoAssegnazioniIndex = assegnazioniHeaders.indexOf("ID_Turno");
    const emailAssegnazioniIndex = assegnazioniHeaders.indexOf("Email_Volontario");
    
    const idTurnoTurniIndex = turniHeaders.indexOf("ID_Turno");
    const dataInizioTurniIndex = turniHeaders.indexOf("Data Inizio");
    const oraInizioTurniIndex = turniHeaders.indexOf("Ora Inizio");

    // --- LOGICA PRINCIPALE ---

    let userData = null;
    for (let i = 0; i < volontariData.length; i++) {
      if (volontariData[i][emailVolontarioIndex].toLowerCase() === userEmail.toLowerCase()) {
        userData = {
          nome: volontariData[i][nomeVolontarioIndex],
          ruolo: volontariData[i][ruoloVolontarioIndex]
        };
        break;
      }
    }
    
    if (!userData) {
       return ContentService.createTextOutput(JSON.stringify({ "error": "Utente non trovato" })).setMimeType(ContentService.MimeType.JSON);
    }

    const turniAssegnatiIds = assegnazioniData
      .filter(row => row[emailAssegnazioniIndex].toLowerCase() === userEmail.toLowerCase())
      .map(row => row[idTurnoAssegnazioniIndex]);

    const turniDetails = [];
    if (turniAssegnatiIds.length > 0) {
      for (let i = 0; i < turniData.length; i++) {
        const turnoRow = turniData[i];
        const currentIdTurno = turnoRow[idTurnoTurniIndex];
        if (turniAssegnatiIds.includes(currentIdTurno)) {
          let turno = {};
          turniHeaders.forEach((header, index) => {
            turno[header] = turnoRow[index];
          });
          turniDetails.push(turno);
        }
      }
    }
    
    // --- NUOVA LOGICA DI ORDINAMENTO CORRETTA ---
    turniDetails.sort((a, b) => {
      // Funzione per convertire data e ora in un oggetto Date di JavaScript
      const parseDateTime = (turno) => {
        const dateParts = turno['Data Inizio'].split('/');
        const timeParts = turno['Ora Inizio'].split(':');
        // Formato: Anno, Mese (0-11), Giorno, Ora, Minuti
        return new Date(dateParts[2], dateParts[1] - 1, dateParts[0], timeParts[0], timeParts[1]);
      };
      
      const dateA = parseDateTime(a);
      const dateB = parseDateTime(b);
      
      return dateA - dateB; // Ordina confrontando gli oggetti Date
    });

    const finalResponse = {
      user: userData,
      turni: turniDetails
    };

    return ContentService.createTextOutput(JSON.stringify(finalResponse)).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "error": error.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}
