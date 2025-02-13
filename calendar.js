const { google } = require('googleapis');
const calendar = google.calendar('v3');

// Función para autenticar y crear un evento
async function crearEvento(evento) {
  try {
    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
    
    const response = await calendar.events.insert({
      auth,
      calendarId: 'primary',
      requestBody: {
        summary: evento.titulo,
        description: evento.descripcion,
        start: { dateTime: evento.inicio },
        end: { dateTime: evento.fin }
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creando evento:', error);
    return null;
  }
}

module.exports = { crearEvento };
