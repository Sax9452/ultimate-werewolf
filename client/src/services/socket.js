import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      // ⭐ Auto-detect backend URL สำหรับทั้ง development และ production
      let backendUrl;
      
      if (import.meta.env.VITE_API_URL) {
        // ใช้ URL จาก environment variable (สำหรับ production)
        backendUrl = import.meta.env.VITE_API_URL;
      } else if (window.location.hostname === 'localhost') {
        // Development บน localhost
        backendUrl = 'http://localhost:3000';
      } else {
        // Radmin VPN หรือ LAN
        backendUrl = `http://${window.location.hostname}:3000`;
      }
      
      console.log('🔌 Connecting to backend:', backendUrl);
      
      this.socket = io(backendUrl, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('Connected to server');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from server');
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export const socketService = new SocketService();

