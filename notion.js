const { Client } = require('@notionhq/client');
const { readFileSync } = require('fs');
const mime = require('mime-types');

// Inicializa el cliente de Notion
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// ==================== FUNCIONES PARA NOTAS ====================
async function agregarNota(nota, etiquetas = ['General']) {
  try {
    if (!process.env.NOTION_DATABASE_ID || !process.env.NOTION_API_KEY) {
      throw new Error("❌ Configuración incompleta en .env");
    }

    const response = await notion.pages.create({
      parent: { database_id: process.env.NOTION_DATABASE_ID },
      properties: {
        "Name": { 
          title: [{ text: { content: nota.slice(0, 2000) } }]
        },
        "Fecha": {
          date: { start: new Date().toISOString() }
        },
        "Tags": {
          multi_select: etiquetas.map(tag => ({ 
            name: tag.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ ]/g, '') 
          }))
        }
      }
    });
    return true;
  } catch (error) {
    console.error("❌ Error en Notion:", error.body || error.message);
    return false;
  }
}

// ==================== FUNCIONES PARA ARCHIVOS ====================
async function agregarEnlaceANotion(nombreArchivo, enlaceImgur) {
  try {
    const nombreLimpio = nombreArchivo
      .replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ ]/g, '_')
      .slice(0, 100);

    const response = await notion.pages.create({
      parent: { database_id: process.env.NOTION_DATABASE_ID },
      properties: {
        "Name": { 
          title: [{ text: { content: nombreLimpio } }]
        },
        "Fecha": {
          date: { start: new Date().toISOString() }
        },
        "Archivo": {
          files: [{
            name: "🖼️ Ver imagen",
            type: "external",
            external: { url: enlaceImgur }
          }]
        }
      }
    });
    return true;
  } catch (error) {
    console.error("❌ Error en Notion:", error.body?.message || error.message);
    return false;
  }
}

// Función crítica añadida
async function subirArchivo(nombreArchivo, enlaceImgur) {
  try {
    return await agregarEnlaceANotion(nombreArchivo, enlaceImgur);
  } catch (error) {
    console.error("❌ Error subiendo archivo:", error.message);
    return false;
  }
}

// ==================== FUNCIONES ADICIONALES ====================
async function listarNotas() {
  try {
    const response = await notion.databases.query({ 
      database_id: process.env.NOTION_DATABASE_ID,
      sorts: [{ timestamp: 'created_time', direction: 'descending' }]
    });

    return response.results.map((page, index) => {
      const nombre = page.properties?.Name?.title?.[0]?.text?.content || 'Sin título';
      const fecha = new Date(page.created_time).toLocaleDateString('es-ES');
      const etiquetas = page.properties?.Tags?.multi_select?.map(t => `🏷️ #${t.name}`).join(' ') || '';
      const idCorto = page.id.slice(0, 8) + '...';
      
      // Verificar si tiene imagen de Imgur
      const tieneImagen = page.properties?.Archivo?.files?.length > 0;
      const iconoImagen = tieneImagen ? ' 📸' : '';

      return `
${index + 1}️⃣ *${nombre}${iconoImagen}*  
   🆔 \`${idCorto}\`  
   📅 ${fecha}  
   ${etiquetas}`;
    });

  } catch (error) {
    return ["❌ Error al obtener notas"];
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

    return response.results.map(page => 
      `- ${page.properties?.Name?.title?.[0]?.text?.content || 'Sin título'}`
    );
  } catch (error) {
    console.error("❌ Error en Notion:", error.body || error.message);
    return ["❌ Error al filtrar notas"];
  }
}

async function eliminarNota(notaId) {
  try {
    await notion.pages.update({ 
      page_id: notaId, 
      archived: true 
    });
    return true;
  } catch (error) {
    console.error("❌ Error en Notion:", error.body || error.message);
    return false;
  }
}

// ==================== AYUDA MEJORADA ====================
async function mostrarAyuda() {
  return `
📚 *Menú de Ayuda* 📚

📝 *Gestión de Notas:*
  → !nota [texto] ➜ Crea nueva nota
  → !nota listar ➜ Muestra todas las notas
  → !nota listar #etiqueta ➜ Filtra por etiqueta
  → !nota eliminar [ID] ➜ Elimina una nota

📁 *Gestión de Archivos:*
  → !subirarchivo [nombre] + *adjunta imagen* ➜ Sube a Imgur y Notion`;
}

// Exportación completa y corregida
module.exports = { 
  agregarNota, 
  listarNotas, 
  listarNotasPorTag, 
  eliminarNota, 
  subirArchivo, 
  agregarEnlaceANotion, 
  mostrarAyuda 
};