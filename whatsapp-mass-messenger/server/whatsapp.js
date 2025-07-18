const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const qrcodeGenerator = require('qrcode'); // Nueva importación para generar QR como imagen
const fs = require('fs-extra');
const path = require('path');

let client = null;
let qrCode = null;
let isAuthenticated = false;
let ioInstance = null;

const initClient = () => {
  const sessionPath = path.join(__dirname, '../storage/sessions');
  if (fs.existsSync(sessionPath)) {
    fs.removeSync(sessionPath);
  }
  client = new Client({
    authStrategy: new LocalAuth({
      dataPath: path.join(__dirname, '../storage/sessions')
    }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  client.on('qr', async (qr) => {
    qrCode = qr;
    
    // Mostrar QR en terminal (funcionalidad existente)
    qrcode.generate(qr, { small: true });
    
    // Generar QR como imagen base64 para la web (nueva funcionalidad)
    try {
      const qrImage = await generateQRBase64(qr);
      if (ioInstance) {
        ioInstance.emit('qr', qrImage);
      }
    } catch (error) {
      console.error('Error generando QR para la web:', error);
    }
  });

  client.on('authenticated', () => {
    isAuthenticated = true;
    qrCode = null;
    if (ioInstance) ioInstance.emit('authenticated');
  });

  client.on('auth_failure', () => {
    isAuthenticated = false;
    if (ioInstance) ioInstance.emit('auth_failure');
  });

  client.on('disconnected', (reason) => {
    isAuthenticated = false;
    if (ioInstance) ioInstance.emit('disconnected', reason);
    // No eliminamos la sesión aquí para permitir reconexión
  });

  client.on('ready', () => {
    isAuthenticated = true;
    if (ioInstance) ioInstance.emit('ready');
  });

  client.initialize();
};

// Función para generar QR en base64 (nueva función)
const generateQRBase64 = (qr) => {
  return new Promise((resolve, reject) => {
    qrcodeGenerator.toDataURL(qr, (err, url) => {
      if (err) reject(err);
      resolve(url);
    });
  });
};

const init = (io) => {
  ioInstance = io;
  initClient();
};

const getClient = () => client;
const getMessageMedia = () => MessageMedia;
const getQrCode = () => qrCode;
const checkAuth = () => isAuthenticated;

const logout = async () => {
  if (client) {
    await client.logout();
    // Eliminar sesión al desvincular
    fs.removeSync(path.join(__dirname, '../storage/sessions'));
    // Reiniciar el cliente para generar nuevo QR
    initClient();
  }
};

module.exports = {
  init,
  getClient,
  getMessageMedia,
  getQrCode,
  checkAuth,
  logout
};