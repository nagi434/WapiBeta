import { useState, useEffect } from 'react';
import { contactsService } from '../services/api';

// Cache global simple para evitar recargar contactos en cada montaje
let cachedContacts = null;

export function useContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableSegments, setAvailableSegments] = useState(['todos']);

  // Función para obtener contactos
  const fetchContacts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await contactsService.getContacts();
      setContacts(data);
      // Guardar en caché para siguientes montajes
      cachedContacts = data;
    } catch (err) {
      setError('Error al cargar contactos');
    } finally {
      setLoading(false);
    }
  };

  // Actualizar segmentos disponibles cuando cambian los contactos
  useEffect(() => {
    if (contacts && contacts.length > 0) {
      const segments = new Set(contacts.map(c => c.segment).filter(Boolean));
      setAvailableSegments(['todos', ...segments]);
    }
  }, [contacts]);

  useEffect(() => {
    // Si hay contactos en caché, usarlos y evitar nueva llamada
    if (cachedContacts) {
      setContacts(cachedContacts);
      setLoading(false);
    } else {
      fetchContacts();
    }
  }, []);

  // Actualizar segmentos disponibles cuando cambian los contactos
  useEffect(() => {
    if (contacts && contacts.length > 0) {
      const segments = new Set(contacts.map(c => c.segment).filter(Boolean));
      setAvailableSegments(['todos', ...segments]);
    }
  }, [contacts]);

  // Asignar un segmento a una lista de números
  const assignSegment = async (segmentName, numbers) => {
    // Actualizar el estado local primero para una respuesta inmediata
    setContacts(prev => {
      const updated = prev.map(c => 
      numbers.includes(c.number)
        ? { ...c, segment: segmentName }
        : c
    );
      // Actualizar caché global
      cachedContacts = updated;
      return updated;
    });
    
    // Crear un objeto con los números/IDs y sus segmentos
    const segmentsToUpdate = {};
    numbers.forEach(number => {
      const contact = contacts.find(c => c.number === number);
      if (contact) {
        // Usar el ID del contacto si está disponible, de lo contrario usar el número
        const key = contact.id || contact.number;
        segmentsToUpdate[key] = segmentName;
      }
    });
    
    // Enviar al backend para persistencia
    try {
      const response = await fetch('http://localhost:3001/api/update-segments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ segments: segmentsToUpdate }),
      });
      
      if (!response.ok) {
        throw new Error('Error al guardar los segmentos');
      }
      
      console.log('Segmentos guardados correctamente en el servidor');
    } catch (error) {
      console.error('Error al guardar segmentos:', error);
      // Opcional: Mostrar un mensaje de error al usuario
    }
  };

  // Exponer función para refrescar manualmente
  const refreshContacts = fetchContacts;

  const importContacts = async (file) => {
    setLoading(true);
    setError(null);
    try {
      const result = await contactsService.importContacts(file);
      // Después de importar, podrías querer refrescar la lista de contactos
      const updatedContacts = await contactsService.getContacts();
      setContacts(updatedContacts);
      cachedContacts = updatedContacts;
      return result;
    } catch (err) {
      setError('Error al importar contactos');
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { 
    contacts, 
    loading, 
    error, 
    importContacts, 
    refreshContacts,
    assignSegment,
    availableSegments 
  };
}


