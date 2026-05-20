import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000';

let socket: Socket;

if (typeof window !== 'undefined') {
  socket = io(SOCKET_URL, { autoConnect: true });
} else {
  socket = {} as Socket;
}

export { socket };
