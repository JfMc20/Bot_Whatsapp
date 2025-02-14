# Bot de WhatsApp para Notion y Google Calendar

## 🚀 Asistente Virtual para WhatsApp con Integración a Notion y Google Calendar

Este bot permite la interacción con WhatsApp mediante un modelo de lenguaje (LLM) para analizar, resumir y organizar información en **Notion** y **Google Calendar**. Además, responde a menciones y preguntas en chats grupales.

> **Desarrollado en Node.js**, con una arquitectura modular que garantiza escalabilidad y flexibilidad.

---

## 🛠️ Características Principales

- 📌 **Interacción con WhatsApp**: Escucha mensajes en grupos o chats privados y procesa comandos específicos.
- 📝 **Integración con Notion**: Permite guardar notas, tareas y archivos directamente en Notion.
- 📅 **Gestión de eventos en Google Calendar**: Crea y lista eventos mediante comandos.
- 🤖 **Interacción Contextual en el Chat**: Responde a menciones o preguntas en chats grupales con respuestas útiles y contextualizadas.
- 🔒 **Seguridad y Prevención de Spam**: Implementa límite de tasa y listas negras/blancas para evitar abuso.

---

## 📌 Comandos Soportados

- `@bot`: Interactúa con el bot usando lenguaje natural.
- `!resumen`: Genera un resumen de la conversación reciente en el chat.
- `!nota [contenido]`: Guarda una nota en Notion.
  - _Ejemplo:_ `!nota Comprar víveres` → Guarda la nota "Comprar víveres" en Notion.
- `!nota listar`: Muestra todas las notas guardadas en Notion.
- `!subirarchivo`: Sube un archivo a Imgur y almacena el enlace en Notion.
- `!evento [detalles]`: Crea un evento en Google Calendar.
  - _Ejemplo:_ `!evento Reunión mañana a las 10 AM` → Crea un evento "Reunión" en Google Calendar.
- `!evento listar`: Lista los próximos eventos de Google Calendar.
- `!ayuda`: Muestra la lista de comandos disponibles.

---

## 🔗 Integraciones

### 📖 Notion
- Almacena notas y listas de tareas mediante la API de Notion.
- Soporta subida de archivos a Notion con `!subirarchivo`.

### 📅 Google Calendar
- Crea eventos con `!evento`.
- Lista eventos con `!evento listar`.

### 🔐 Seguridad
- Límite de tasa para evitar spam.
- Soporte de listas negras y blancas.
- Cifrado de datos sensibles.

---

## ⚙️ Tecnologías Utilizadas

- **Backend**: Node.js
- **Librerías**:
  - `whatsapp-web.js`: Para la integración con WhatsApp.
  - `@notionhq/client`: Para la integración con Notion.
  - `googleapis`: Para la integración con Google Calendar.
- **Procesamiento de Lenguaje Natural**: LlamaIndex o Falcon.
- **Hosting**: Compatible con VPS, servidores locales o servicios en la nube como Heroku.

---

## 🚀 Cómo Usar

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/usuario/tu-repositorio.git
   cd tu-repositorio
   ```
2. **Instala las dependencias**
   ```bash
   npm install
   ```
3. **Configura las variables de entorno en `.env`**
   ```env
   NOTION_API_KEY=tu_clave_de_api_de_notion
   GOOGLE_CALENDAR_API_KEY=tu_clave_de_api_de_google_calendar
   ```
4. **Inicia el bot**
   ```bash
   npm start
   ```

---

## 🤝 Contribuciones
¡Las contribuciones son bienvenidas! Si deseas colaborar, por favor revisa el archivo `CONTRIBUTING.md`.

---

## 📜 Licencia
[MIT License](LICENSE)

---

## 📧 Contacto
Para preguntas o sugerencias, puedes contactarme en:
📩 **Correo:** jeson.security@gmail.com

---

## 🔮 Futuras Funcionalidades
- **Integración con herramientas de productividad** (Ej: Trello, Slack).
- **Soporte para comandos de voz**.
- **Compatibilidad con múltiples idiomas**.

---

### ⭐ Si te gusta este proyecto, ¡considera darle una estrella en GitHub! ⭐


