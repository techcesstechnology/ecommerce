import { WebSocketServer, WebSocket } from 'ws';
import { config } from '../config';

interface WebSocketMessage {
  type: string;
  data: any;
}

class WebSocketService {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, Set<WebSocket>> = new Map();

  initialize(): void {
    this.wss = new WebSocketServer({ port: config.websocket.port });

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('New WebSocket connection');

      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message.toString());
          this.handleMessage(ws, data);
        } catch (error) {
          console.error('Invalid WebSocket message:', error);
        }
      });

      ws.on('close', () => {
        this.removeClient(ws);
      });
    });

    console.log(`WebSocket server running on port ${config.websocket.port}`);
  }

  private handleMessage(ws: WebSocket, message: WebSocketMessage): void {
    if (message.type === 'subscribe' && message.data?.userId) {
      this.addClient(message.data.userId, ws);
    }
  }

  private addClient(userId: string, ws: WebSocket): void {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    this.clients.get(userId)?.add(ws);
  }

  private removeClient(ws: WebSocket): void {
    for (const [userId, clients] of this.clients.entries()) {
      clients.delete(ws);
      if (clients.size === 0) {
        this.clients.delete(userId);
      }
    }
  }

  notifyUser(userId: string, message: WebSocketMessage): void {
    const userClients = this.clients.get(userId);
    if (userClients) {
      const messageStr = JSON.stringify(message);
      userClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(messageStr);
        }
      });
    }
  }

  broadcast(message: WebSocketMessage): void {
    if (!this.wss) return;
    
    const messageStr = JSON.stringify(message);
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  close(): void {
    if (this.wss) {
      this.wss.close();
    }
  }
}

export const wsService = new WebSocketService();
