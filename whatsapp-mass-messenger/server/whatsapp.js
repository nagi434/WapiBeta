const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs-extra');
const path = require('path');

let client;
let qrCode = null;
let isAuthenticated = false;
let ioInstance;

const initClient = () => {
  client = new Client({
    authStrategy: new LocalAuth({
      dataPath: path.join(__dirname, '../storage/sessions')
    }),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
  });

  client.on('qr', (qr) => {
    qrCode = qr;
    qrcode.generate(qr, { small: true });
    if (ioInstance) ioInstance.emit('qr', qr);
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