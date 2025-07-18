const fs = require('fs-extra');
const path = require('path');

const contactsPath = path.join(__dirname, '../storage/contacts.json');

// Inicializar archivo de contactos
const initContacts = async () => {
  if (!await fs.pathExists(contactsPath)) {
    await fs.writeJson(contactsPath, []);
  }
};

// Obtener todos los contactos
const getContacts = async () => {
  await initContacts();
  return await fs.readJson(contactsPath);
};

// Agregar nuevo contacto
const addContact = async (contact) => {
  const contacts = await getContacts();
  contacts.push(contact);
  await fs.writeJson(contactsPath, contacts);
  return contact;
};

// Eliminar contacto
const deleteContact = async (phone) => {
  const contacts = await getContacts();
  const filtered = contacts.filter(c => c.phone !== phone);
  await fs.writeJson(contactsPath, filtered);
  return filtered;
};

module.exports = {
  getContacts,
  addContact,
  deleteContact
};