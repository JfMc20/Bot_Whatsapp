require('dotenv').config();
const { Together } = require('together-ai');

// Inicializar Together AI
const together = new Together({ apiKey: process.env.TOGETHER_AI_KEY });

// Función para enviar mensaje a Together AI y obtener respuesta
async function responderConTogetherAI(mensaje) {
  try {
    const response = await together.chat.completions.create({
      messages: [{ role: 'user', content: mensaje }],
      model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
      max_tokens: 200,
      temperature: 0.7,
      top_p: 0.7,
      stop: ['<|eot_id|>', '<|eom_id|>']
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error('❌ Error en Together AI:', error);
    return '❌ Hubo un error al procesar tu mensaje.';
  }
}

module.exports = { responderConTogetherAI };



