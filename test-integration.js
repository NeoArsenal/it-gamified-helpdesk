import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

socket.on('connect', async () => {
  console.log('Connected to server with id:', socket.id);
  
  // Create a ticket via HTTP
  const res = await fetch('http://localhost:3001/api/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      titulo: 'Test WebSocket Ticket',
      descripcion: 'Testing if WS emits',
      sede: 'Sede Central',
      departamento: 'Sistemas',
      area: 'Desarrollo'
    })
  });
  console.log('Ticket created status:', res.status);
});

socket.on('nuevoTicket', (data) => {
  console.log('✅ Received nuevoTicket:', data.titulo);
  process.exit(0);
});

setTimeout(() => {
  console.error('❌ Timeout waiting for ticket');
  process.exit(1);
}, 5000);
