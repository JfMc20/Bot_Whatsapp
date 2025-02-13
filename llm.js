// llm.js
require('dotenv').config();
const axios = require('axios');

// Modelo que se usará para resumir; puedes cambiarlo según lo que ofrezca Together AI.
const MODEL = "mistral-7b-instruct";

/**
 * Genera un resumen del texto proporcionado usando Together AI.
 *
 * @param {string} texto - El contenido a resumir.
 * @returns {Promise<string>} - El resumen generado.
 */
async function generarResumen(texto) {
  try {
    // Define el prompt para solicitar el resumen.
    const prompt = `Por favor, resume el siguiente texto:\n\n${texto}`;
    
    const response = await axios.post(
      "https://api.together.xyz/v1/chat/completions",
      {
        model: MODEL,
        messages: [
          { role: "user", content: prompt }
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.TOGETHER_AI_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    
    // Se asume que la respuesta tiene la estructura: { choices: [ { message: { content: "respuesta" } } ] }
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Error generando resumen:", error.response?.data || error.message);
    return "Error al generar el resumen.";
  }
}

module.exports = { generarResumen };
