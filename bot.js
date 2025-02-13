require('dotenv').config();
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const { responderConTogetherAI } = require('./together');
const { agregarNota, listarNotas, eliminarNota, subirArchivo, mostrarAyuda, listarNotasPorTag } = require('./notion');
const { crearEvento } = require('./calendar');
const { generarResumen } = require('./llm');

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
            '--disable-gpu',
            '--disable-features=Permissions-Policy'
        ]
    }
});

let qrGenerated = false;

client.on('qr', (qr) => {
    if (!qrGenerated) {
        qrcode.generate(qr, { small: true });
        console.log('📌 Escanea el QR para iniciar sesión');
        qrGenerated = true;
    }
});

client.on('authenticated', () => {
    console.log('🔑 Sesión autenticada correctamente.');
    qrGenerated = false;
});

client.on('ready', async () => {
    console.log('✅ El bot está listo y conectado a WhatsApp.');
    const chats = await client.getChats();
    console.log(`📋 Chats cargados correctamente: ${chats.length}`);
});

client.on('auth_failure', msg => console.error('❌ Error de autenticación:', msg));

client.on('disconnected', (reason) => {
    console.log('⚠️ El bot se ha desconectado:', reason);
    console.log('⏳ Intentando reconexión...');
    client.initialize();
});

client.on('change_state', state => console.log(`🔄 Estado del bot cambiado a: ${state}`));

client.on('message', async (msg) => {
    console.log(`📩 [MENSAJE RECIBIDO] De: ${msg.from} - Contenido: "${msg.body}" | Tipo: ${msg.type}`);

    if (msg.fromMe) return;

    try {
        const contenido = msg.body.trim().toLowerCase();

        if (contenido === '!nota listar') { 
            const notas = await listarNotas();
            msg.reply(notas.length ? `📋 *Notas en Notion:*\n${notas.join("\n")}` : "📌 No hay notas almacenadas en Notion.");
            return;
        }
        else if (contenido.startsWith('!listar #')) { 
            const tag = contenido.replace('!listar #', '').trim();
            const notas = await listarNotasPorTag(tag);
            msg.reply(notas.length ? `📋 *Notas con el Tag #${tag}:*\n${notas.join("\n")}` : `📌 No hay notas con la etiqueta #${tag}.`);
            return;
        }
        else if (contenido.startsWith('!nota eliminar ')) {
            const notaId = contenido.replace('!nota eliminar ', '').trim();
            const resultado = await eliminarNota(notaId);
            msg.reply(resultado ? '✅ Nota eliminada en Notion.' : '❌ Error eliminando la nota.');
            return;
        }
        else if (contenido.startsWith('!nota ') && contenido !== '!nota listar') { 
            const nota = contenido.replace('!nota ', '').trim();
            if (!nota) return msg.reply("❌ Debes escribir el contenido de la nota.");
            const resultado = await agregarNota(nota);
            msg.reply(resultado ? '✅ Nota agregada en Notion.' : '❌ Error al agregar la nota.');
            return;
        }
        else if (contenido.startsWith('!subirarchivo')) {
            if (msg.hasMedia) {
                const media = await msg.downloadMedia();

                if (['application/pdf', 'image/jpeg', 'image/png', 'image/gif'].includes(media.mimetype)) {
                    let nombreArchivo = contenido.replace('!subirarchivo', '').trim() || 'Archivo_Subido';

                    // Normalizar el nombre del archivo
                    nombreArchivo = nombreArchivo.replace(/[^a-zA-Z0-9-_]/g, '_');
                    let extension = media.mimetype.split('/')[1];
                    let nombreFinal = `${nombreArchivo}.${extension}`;

                    // Crear carpeta temporal si no existe
                    const tempFolderPath = path.join(__dirname, 'temp');
                    if (!fs.existsSync(tempFolderPath)) {
                        fs.mkdirSync(tempFolderPath);
                    }

                    // Guardar archivo temporalmente
                    const filePath = path.join(tempFolderPath, nombreFinal);
                    fs.writeFileSync(filePath, Buffer.from(media.data, 'base64'));

                    const resultado = await subirArchivo(nombreFinal, filePath);

                    // Eliminar archivo temporal después de subirlo
                    fs.unlinkSync(filePath);

                    msg.reply(resultado ? `✅ Archivo "${nombreFinal}" subido correctamente a Notion.` : "❌ Error al subir el archivo.");
                } else {
                    msg.reply("❌ Solo se permiten archivos en formato PDF, JPG, PNG y GIF.");
                }
            } else {
                msg.reply("❌ Debes adjuntar un archivo (PDF o imagen) junto con el comando.");
            }
            return;
        }
        else if (contenido === '!help') { 
            const ayuda = await mostrarAyuda();
            msg.reply(ayuda);
            return;
        }
        else if (contenido.includes('@bot')) {
            if (await verificarSpam(msg.from)) return;
            const respuesta = await responderConTogetherAI(contenido);
            msg.reply(respuesta || "❌ No pude procesar tu mensaje.");
            return;
        }
    } catch (error) {
        console.error("❌ Error en el procesamiento del mensaje:", error.message);
        msg.reply("❌ Ocurrió un error. Intenta nuevamente.");
    }
});

// Función para verificar si el usuario está enviando demasiados mensajes seguidos (antispam)
const usuariosUltimosMensajes = {};
async function verificarSpam(usuario) {
    const ahora = Date.now();
    if (usuariosUltimosMensajes[usuario] && (ahora - usuariosUltimosMensajes[usuario]) < 5000) {
        console.log(`⏳ Bloqueado mensaje de spam de ${usuario}`);
        return true;
    }
    usuariosUltimosMensajes[usuario] = ahora;
    return false;
}

client.initialize();
