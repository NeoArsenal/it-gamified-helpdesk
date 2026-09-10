import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('Connected to server with id:', socket.id);
  
  socket.on('nuevoTicket', (data) => {
    console.log('Received nuevoTicket:', data);
  });
});

socket.on('connect_error', (err) => {
  console.error('Connection error:', err.message);
});
