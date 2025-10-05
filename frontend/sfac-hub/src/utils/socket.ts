import io from 'socket.io-client';

// Connect to the Socket.IO server

const socket = io('https://sfac-hub.onrender.com', {
  transports: ['websocket'], // ensures WS connection
});

export { socket };
