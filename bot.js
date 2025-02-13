require('dotenv').config();
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const chrono = require('chrono-node');
const axios = require('axios');
const { responderConTogetherAI } = require('./together');
const { 
    agregarNota, 
    listarNotas, 
    eliminarNota, 
    subirArchivo, 
    mostrarAyuda, 
    listarNotasPorTag 
} = require('./notion');
const { crearEvento } = require('./calendar');

// ==================== CONFIGURACIÓN INICIAL ====================
const ultimosMensajes = {};
const client = new Client({
    authStrategy: new LocalAuth({ dataPath: './session' }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
        ]
    }
});

// ==================== SISTEMA ANTI-SPAM ====================
function verificarSpam(usuario) {
    const ahora = Date.now();
    const tiempoEntreMensajes = 5000;
    
    if (ultimosMensajes[usuario] && (ahora - ultimosMensajes[usuario] < tiempoEntreMensajes)) {
        return true;
    }
    
    ultimosMensajes[usuario] = ahora;
    return false;
}

// ==================== MANEJO DE EVENTOS ====================
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('📌 Escanea el QR para iniciar sesión');
});

client.on('authenticated', () => console.log('🔑 Sesión autenticada'));
client.on('ready', async () => {
    const chats = await client.getChats();
    console.log(`✅ Bot listo | Chats activos: ${chats.length}`);
});

client.on('disconnected', (reason) => {
    console.log('⚠️ Desconectado:', reason);
    client.initialize();
});

// ==================== NÚCLEO DE COMANDOS ====================
client.on('message', async (msg) => {
    if (msg.fromMe) return;
    console.log(`📩 Mensaje de ${msg.from}: ${msg.body}`);

    try {
        const contenido = msg.body.trim();

        // Comandos de Notion
        if (contenido === '!nota listar') {
            const notas = await listarNotas();
            msg.reply(notas.join("\n") || "📌 No hay notas registradas");
        }

        else if (contenido.startsWith('!listar #')) {
            const tag = contenido.split('#')[1].trim();
            const notas = await listarNotasPorTag(tag);
            msg.reply(notas.join("\n") || `📌 No existen notas con #${tag}`);
        }

        else if (contenido.startsWith('!nota eliminar ')) {
            const notaId = contenido.split(' ')[2].trim();
            msg.reply(await eliminarNota(notaId) ? '🗑️ Nota eliminada' : '❌ Error al eliminar');
        }

        else if (contenido.startsWith('!nota ')) {
            const textoNota = contenido.replace('!nota ', '').trim();
            msg.reply(await agregarNota(textoNota) ? '📝 Nota guardada' : '❌ Error al guardar');
        }

        // Subida de archivos
        else if (contenido.startsWith('!subirarchivo')) {
            if (!msg.hasMedia) return msg.reply("❌ Adjunta un archivo válido");
            
            const media = await msg.downloadMedia();
            const nombreArchivo = contenido.replace('!subirarchivo', '').trim() || 'Sin_nombre';
            const extension = mime.extension(media.mimetype) || media.mimetype.split('/')[1] || 'bin';
            const nombreFinal = `${nombreArchivo.replace(/[^\w-]/g, '_')}.${extension}`;

            // Guardar temporalmente
            const tempPath = path.join(__dirname, 'temp', nombreFinal);
            fs.writeFileSync(tempPath, Buffer.from(media.data, 'base64'));

            let resultado;
            if (media.mimetype.startsWith('image/')) {
                const imgurUrl = await subirImagenAImgur(tempPath);
                if (imgurUrl) {
                    const exito = await subirArchivo(nombreArchivo, imgurUrl);
                    resultado = exito ? 
                        `🖼️ *Imagen subida:*\n${imgurUrl}\n📥 *Enlace guardado en Notion*` : 
                        "❌ Error al guardar en Notion";
                } else {
                    resultado = "❌ Fallo al subir a Imgur";
                }
            } else {
                resultado = "🔧 Solo se soportan imágenes por ahora";
            }

            fs.unlinkSync(tempPath);
            msg.reply(resultado);
            return;
        }

        // Calendario
        else if (contenido.startsWith('!evento ')) {
            const descripcion = contenido.replace('!evento ', '').trim();
            const fecha = chrono.parseDate(descripcion);
            
            if (!fecha) return msg.reply("❌ Formato de fecha incorrecto");
            
            try {
                const exito = await crearEvento({
                    titulo: descripcion,
                    inicio: fecha.toISOString(),
                    fin: new Date(fecha.getTime() + 3600000).toISOString()
                });
                msg.reply(exito ? `📅 Evento creado:\n${fecha.toLocaleString()}` : "❌ Error al crear evento");
            } catch (error) {
                msg.reply("❌ Error con Google Calendar");
            }
            return;
        }

        // Comandos generales
        else if (contenido === '!help') msg.reply(await mostrarAyuda());
        else if (contenido.includes('@bot')) {
            if (verificarSpam(msg.from)) return;
            const respuestaIA = await responderConTogetherAI(contenido);
            msg.reply(respuestaIA || "🤖 No pude procesar tu solicitud");
        }

    } catch (error) {
        console.error("❌ Error crítico:", error);
        msg.reply("⚠️ Ocurrió un error interno");
    }
});

// ==================== INTEGRACIÓN CON IMGUR ====================
async function subirImagenAImgur(filePath) {
    try {
        const imagenData = fs.readFileSync(filePath, 'base64');
        const respuesta = await axios.post(
            'https://api.imgur.com/3/image',
            { image: imagenData },
            { headers: { 
                Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
                'Content-Type': 'application/json'
            } }
        );
        return respuesta.data.data.link;
    } catch (error) {
        console.error("❌ Error en Imgur:", error.response?.data?.error || error.message);
        return null;
    }
}

client.initialize();