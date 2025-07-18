document.addEventListener('DOMContentLoaded', () => {
  const socket = io();
  const qrContainer = document.getElementById('qr-container');
  const qrCodeElement = document.getElementById('qr-code');
  const authStatus = document.getElementById('auth-status');
  const statusMessage = document.getElementById('status-message');
  const logoutBtn = document.getElementById('logout-btn');
  const messageSection = document.getElementById('message-section');
  const scheduledMessagesSection = document.getElementById('scheduled-messages');
  
  // Elementos del formulario
  const messageType = document.getElementById('message-type');
  const textContent = document.getElementById('text-content');
  const mediaContent = document.getElementById('media-content');
  const messageText = document.getElementById('message-text');
  const mediaFile = document.getElementById('media-file');
  const mediaCaption = document.getElementById('media-caption');
  const recipients = document.getElementById('recipients');
  const scheduleCheckbox = document.getElementById('schedule-message');
  const scheduleSection = document.getElementById('schedule-section');
  const scheduleDate = document.getElementById('schedule-date');
  const scheduleTime = document.getElementById('schedule-time');
  const sendBtn = document.getElementById('send-btn');
  const scheduledTable = document.getElementById('scheduled-table').querySelector('tbody');

  // Manejar cambio de tipo de mensaje
  messageType.addEventListener('change', () => {
    if (messageType.value === 'text') {
      textContent.classList.remove('hidden');
      mediaContent.classList.add('hidden');
    } else {
      textContent.classList.add('hidden');
      mediaContent.classList.remove('hidden');
    }
  });

  // Mostrar/ocultar sección de programación
  scheduleCheckbox.addEventListener('change', () => {
    scheduleSection.classList.toggle('hidden', !scheduleCheckbox.checked);
  });

  // Configurar fecha mínima como hoy
  const today = new Date().toISOString().split('T')[0];
  scheduleDate.min = today;

  // Escuchar eventos del servidor
  socket.on('qr', (qrImage) => {
    qrContainer.classList.remove('hidden');
    authStatus.classList.add('hidden');
    messageSection.classList.add('hidden');
    scheduledMessagesSection.classList.add('hidden');
    
    // Mostrar el QR como imagen
    qrCodeElement.innerHTML = `<img src="${qrImage}" alt="QR Code" style="max-width: 300px;">`;
    
    // Opcional: agregar botón para actualizar QR
    const refreshBtn = document.createElement('button');
    refreshBtn.textContent = 'Actualizar QR';
    refreshBtn.className = 'btn';
    refreshBtn.style.marginTop = '10px';
    refreshBtn.onclick = () => {
      fetch('/refresh-qr').then(() => {
        qrCodeElement.innerHTML = '<p>Generando nuevo QR...</p>';
      });
    };
    
    qrCodeElement.appendChild(refreshBtn);
  });

  socket.on('authenticated', () => {
    qrContainer.classList.add('hidden');
    authStatus.classList.remove('hidden');
    statusMessage.textContent = 'Autenticado correctamente';
    statusMessage.style.color = 'green';
  });

  socket.on('ready', () => {
    qrContainer.classList.add('hidden');
    authStatus.classList.remove('hidden');
    messageSection.classList.remove('hidden');
    scheduledMessagesSection.classList.remove('hidden');
    statusMessage.textContent = 'Conectado a WhatsApp';
    statusMessage.style.color = 'green';
    loadScheduledMessages();
  });

  socket.on('auth_failure', () => {
    statusMessage.textContent = 'Error de autenticación. Escanea el QR nuevamente.';
    statusMessage.style.color = 'red';
  });

  socket.on('disconnected', (reason) => {
    qrContainer.classList.remove('hidden');
    authStatus.classList.add('hidden');
    messageSection.classList.add('hidden');
    scheduledMessagesSection.classList.add('hidden');
    console.log('Desconectado:', reason);
  });

  // Botón de desvinculación
  logoutBtn.addEventListener('click', async () => {
    try {
      const response = await fetch('/logout', { method: 'POST' });
      if (response.ok) {
        // Mostrar mensaje de desvinculación exitosa
        statusMessage.textContent = 'Desvinculado correctamente. Escanea el nuevo QR para vincular nuevamente.';
        statusMessage.style.color = 'blue';
        
        // Mostrar el contenedor del QR
        qrContainer.classList.remove('hidden');
        authStatus.classList.remove('hidden');
        messageSection.classList.add('hidden');
        scheduledMessagesSection.classList.add('hidden');
        
        // Recargar la página después de 2 segundos para asegurar la regeneración del QR
        setTimeout(() => {
          location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error('Error al desvincular:', error);
      statusMessage.textContent = 'Error al desvincular. Intenta nuevamente.';
      statusMessage.style.color = 'red';
    }
  });

  // Enviar mensaje
  sendBtn.addEventListener('click', async () => {
    const numbers = recipients.value
      .split(/[\n,]/)
      .map(num => num.trim().replace(/[^0-9]/g, ''))
      .filter(num => num.length > 0);

    if (numbers.length === 0) {
      alert('Ingresa al menos un número de teléfono');
      return;
    }

    const isScheduled = scheduleCheckbox.checked;
    const messageData = {
      numbers,
      type: messageType.value,
      content: messageType.value === 'text' ? messageText.value : mediaCaption.value
    };

    if (isScheduled) {
      if (!scheduleDate.value || !scheduleTime.value) {
        alert('Selecciona fecha y hora para programar');
        return;
      }

      messageData.date = scheduleDate.value;
      messageData.time = scheduleTime.value + ':00';
    }

    if (messageType.value === 'media') {
      if (!mediaFile.files[0]) {
        alert('Selecciona un archivo');
        return;
      }

      const formData = new FormData();
      formData.append('media', mediaFile.files[0]);
      formData.append('data', JSON.stringify(messageData));

      try {
        const response = await fetch('/send-media', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();
        handleSendResult(result, isScheduled);
      } catch (error) {
        console.error('Error enviando media:', error);
        alert('Error al enviar el archivo');
      }
    } else {
      if (!messageText.value) {
        alert('Escribe un mensaje');
        return;
      }

      try {
        const response = await fetch('/send-message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(messageData)
        });

        const result = await response.json();
        handleSendResult(result, isScheduled);
      } catch (error) {
        console.error('Error enviando mensaje:', error);
        alert('Error al enviar el mensaje');
      }
    }
  });

  function handleSendResult(result, isScheduled) {
    if (result.success) {
      alert(isScheduled ? 'Mensaje programado correctamente' : 'Mensaje enviado correctamente');
      if (isScheduled) {
        loadScheduledMessages();
      }
      // Limpiar formulario
      messageText.value = '';
      mediaFile.value = '';
      mediaCaption.value = '';
      recipients.value = '';
      scheduleCheckbox.checked = false;
      scheduleSection.classList.add('hidden');
    } else {
      alert(`Error: ${result.error || 'No se pudo enviar el mensaje'}`);
    }
  }

  // Cargar mensajes programados
  async function loadScheduledMessages() {
    try {
      const response = await fetch('/scheduled-messages');
      const messages = await response.json();
      
      scheduledTable.innerHTML = '';
      messages.forEach(msg => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
          <td>${msg.scheduledFor}</td>
          <td>${msg.numbers.length} destinatarios</td>
          <td>${msg.type}</td>
          <td><button class="btn cancel-btn" data-id="${msg.id}">Cancelar</button></td>
        `;
        
        scheduledTable.appendChild(row);
      });

      // Agregar event listeners a los botones de cancelar
      document.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
          const jobId = btn.getAttribute('data-id');
          const response = await fetch('/cancel-scheduled', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ jobId })
          });
          
          const result = await response.json();
          if (result.success) {
            loadScheduledMessages();
          } else {
            alert(`Error: ${result.error || 'No se pudo cancelar el mensaje'}`);
          }
        });
      });
    } catch (error) {
      console.error('Error cargando mensajes programados:', error);
    }
  }
});