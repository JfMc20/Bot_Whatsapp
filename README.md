🤖 Asistente Virtual: Bot de WhatsApp para Notion y Google Calendar

El Asistente Virtual es un bot de WhatsApp impulsado por un LLM gratuito (Modelo de Lenguaje) diseñado para analizar, resumir y organizar información en Notion y Google Calendar. Además, responde a menciones e interactúa en conversaciones grupales. Desarrollado en Node.js, cuenta con una arquitectura modular para escalabilidad y flexibilidad.

🏗 Estructura y Funcionalidad

1️⃣ Interacción con WhatsApp

Tecnología: whatsapp-web.js (WWebJS)

Función: El bot escucha mensajes en grupos o chats privados y procesa comandos específicos.

Comandos Soportados:

@bot: Interactúa directamente con el bot usando lenguaje natural.

!resumen: Genera un resumen de la actividad reciente del chat.

!nota [contenido]: Guarda el contenido proporcionado como una nota en Notion.

Ejemplo: !nota Comprar víveres → Guarda "Comprar víveres" en Notion.

!nota listar: Recupera y lista todas las notas guardadas.

!subirarchivo: Sube un archivo a Imgur y almacena el enlace en Notion.

!evento [detalles]: Crea un evento en Google Calendar.

Ejemplo: !evento Reunión mañana a las 10 AM → Crea un evento "Reunión".

!evento listar: Lista los próximos eventos en Google Calendar.

!ayuda: Muestra una lista de comandos disponibles.

2️⃣ Interacción Contextual en el Chat

Objetivo: El bot responde a menciones o preguntas en chats grupales, proporcionando respuestas útiles y contextuales.

Tecnología: Mistral-7B, LLaMA o Falcon (a través de Hugging Face o LocalAI).

Ejemplos:

Mención Directa:

Usuario: "@bot, ¿qué opinas de la ciberseguridad?"

Bot: "La ciberseguridad es crucial. Activar 2FA y usar contraseñas fuertes ayuda mucho. ¿Quieres más consejos?"

Interacción Natural:

Usuario: "Hoy fue un día difícil en el trabajo..."

Bot: "Algunos días pueden ser pesados, pero seguro que mañana será mejor. ¿Qué pasó?"

Preguntas Técnicas:

Usuario: "@bot, ¿cómo hago pentesting en una API?"

Bot: "Para hacer pentesting en APIs, puedes usar herramientas como Burp Suite o Postman con fuzzing. ¿Quieres detalles?"

3️⃣ Integración con Notion

Función: Guardar notas, tareas y enlaces de archivos en una base de datos de Notion.

Tecnología: @notionhq/client (API de Notion).

Características:

Guardar notas con el comando !nota.

Listar todas las notas con !nota listar.

Subir archivos a Imgur y almacenar enlaces en Notion con !subirarchivo.

4️⃣ Integración con Google Calendar

Función: Crear y gestionar eventos en Google Calendar.

Tecnología: googleapis (API de Google Calendar).

Características:

Crear eventos con el comando !evento.

Listar próximos eventos con !evento listar.

5️⃣ Manejo de Seguridad y Spam

Objetivo: Asegurar que el bot opere de manera segura y evite el uso indebido.

Características:

Límite de tasa para evitar spam.

Listas blancas/negras para usuarios.

Cifrado de datos sensibles.

🛠 Tecnologías Utilizadas

Backend: Node.js

Librerías:

whatsapp-web.js para la integración con WhatsApp.

@notionhq/client para la integración con Notion.

googleapis para la integración con Google Calendar.

Mistral-7B, LLaMA o Falcon para el procesamiento de lenguaje natural.

Hosting: Máquina local, VPS o servicios en la nube como Heroku.

🚀 Cómo Usar

Clona el repositorio:

git clone https://github.com/tuusuario/tu-repositorio.git

Instala las dependencias:
   
npm install

Configura las variables de entorno en .env:

NOTION_API_KEY=tu_clave_de_api_de_notion
GOOGLE_CALENDAR_API_KEY=tu_clave_de_api_de_google_calendar

Ejecuta el bot:

npm start

📜 Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo LICENSE para más detalles.
🙌 Contribuciones

¡Las contribuciones son bienvenidas! Por favor, lee el archivo CONTRIBUTING.md para conocer las pautas.
📞 Contacto

Para preguntas o sugerencias, no dudes en contactarme:

 Email: josem.csegurity@gmail.com

GitHub: @JfMc20

🌟 Futuras Funcionalidades

Integración con más herramientas de productividad (ej: Trello, Slack).

Soporte para comandos de voz.

Soporte para múltiples idiomas.

