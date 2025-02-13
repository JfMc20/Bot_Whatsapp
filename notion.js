const { Client } = require('@notionhq/client');
const { readFileSync } = require('fs');
const mime = require('mime-types');

// Inicializa el cliente con tu API Key
const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function agregarNota(nota, etiquetas = ['General']) {
  try {
    if (!process.env.NOTION_DATABASE_ID) {
      throw new Error("❌ ERROR: NOTION_DATABASE_ID no está definido en el .env");
    }
    if (!process.env.NOTION_API_KEY) {
      throw new Error("❌ ERROR: NOTION_API_KEY no está definido en el .env");
    }

    console.log("✅ Conectando a Notion con DATABASE_ID:", process.env.NOTION_DATABASE_ID);

    const response = await notion.pages.create({
      parent: { database_id: process.env.NOTION_DATABASE_ID },
      properties: {
        "Name": { 
          title: [{ text: { content: nota } }]
        },
        "Fecha": {
          date: { start: new Date().toISOString() }
        },
        "Tags": {
          multi_select: etiquetas.map(tag => ({ name: tag }))
        }
      }
    });

    console.log("✅ Nota agregada correctamente a Notion:", response.id);
    return true;

  } catch (error) {
    console.error("❌ Error agregando nota a Notion:", error.message);
    return false;
  }
}

async function listarNotas() {
  try {
    const response = await notion.databases.query({ database_id: process.env.NOTION_DATABASE_ID });

    if (!response.results.length) {
      return ["📌 No hay notas guardadas en Notion."];
    }

    return response.results.map(page => `- ${page.properties?.["Name"]?.title?.[0]?.text?.content || 'Sin título'}`);

  } catch (error) {
    console.error("❌ Error obteniendo notas de Notion:", error.message);
    return ["❌ No se pudieron obtener las notas."];
  }
}

async function listarNotasPorTag(tag) {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      filter: {
        property: "Tags",
        multi_select: { contains: tag }
      }
    });

    if (!response.results.length) {
      return [`📌 No hay notas con la etiqueta #${tag}.`];
    }

    return response.results.map(page => `- ${page.properties?.["Name"]?.title?.[0]?.text?.content || 'Sin título'}`);

  } catch (error) {
    console.error("❌ Error obteniendo notas por tag:", error.message);
    return ["❌ No se pudieron obtener las notas."];
  }
}

async function eliminarNota(notaId) {
  try {
    await notion.pages.update({ page_id: notaId, archived: true });
    console.log("✅ Nota eliminada correctamente en Notion");
    return true;
  } catch (error) {
    console.error("❌ Error eliminando nota en Notion:", error.message);
    return false;
  }
}

async function subirPDF(nombreArchivo, rutaArchivo) {
  try {
    const tipoMime = mime.lookup(rutaArchivo) || 'application/pdf';

    const response = await notion.pages.create({
      parent: { database_id: process.env.NOTION_DATABASE_ID },
      properties: {
        "Name": { title: [{ text: { content: nombreArchivo } }] },
        "Archivo": {
          files: [{
            name: nombreArchivo,
            type: "external",
            external: { url: `https://example.com/uploads/${nombreArchivo}` } // Reemplazar con la URL real
          }]
        }
      }
    });

    console.log("✅ Archivo PDF subido correctamente a Notion:", response.id);
    return true;
  } catch (error) {
    console.error("❌ Error subiendo PDF a Notion:", error.message);
    return false;
  }
}

async function subirArchivo(nombreArchivo, media) {
  try {
    const extension = mime.extension(media.mimetype) || 'bin';
    const urlTemporal = `https://example.com/uploads/${nombreArchivo}.${extension}`; // Simula una URL de archivo

    const response = await notion.pages.create({
      parent: { database_id: process.env.NOTION_DATABASE_ID },
      properties: {
        "Name": { title: [{ text: { content: nombreArchivo } }] },
        "Archivo": {
          files: [{
            name: `${nombreArchivo}.${extension}`,
            type: "external",
            external: { url: urlTemporal } 
          }]
        }
      }
    });

    console.log("✅ Archivo subido correctamente a Notion:", response.id);
    return true;
  } catch (error) {
    console.error("❌ Error subiendo archivo a Notion:", error.message);
    return false;
  }
}

async function mostrarAyuda() {
  return `📌 *Comandos disponibles:*

  📝 *Notas en Notion:*
  - *!nota [contenido]* ➜ Agrega una nota a Notion.
  - *!nota [contenido] #Etiqueta* ➜ Agrega una nota con etiquetas.
  - *!nota listar* ➜ Lista todas las notas guardadas en Notion.
  - *!nota listar #etiqueta* ➜ Lista las notas con una etiqueta específica.
  - *!nota eliminar [ID]* ➜ Elimina una nota específica de Notion.

  📂 *Gestión de Archivos en Notion:*
  - *!subirpdf [nombre]* + _Adjunta un PDF_ ➜ Sube un archivo PDF a Notion.
  - *!subirarchivo [nombre]* + _Adjunta una imagen u otro archivo_ ➜ Sube imágenes u otros archivos a Notion.

  📅 *Eventos:*
  - *!evento [descripción]* ➜ Crea un evento en Google Calendar.

  🤖 *IA y Asistentes:*
  - *@bot [pregunta]* ➜ Pregunta a la IA integrada en WhatsApp.
  - *!resumen* ➜ Genera un resumen de los últimos mensajes.

  🛠 *Otros:*
  - *!help* ➜ Muestra esta lista de comandos.
  `;
}

module.exports = { agregarNota, listarNotas, listarNotasPorTag, eliminarNota, subirPDF, subirArchivo, mostrarAyuda };
