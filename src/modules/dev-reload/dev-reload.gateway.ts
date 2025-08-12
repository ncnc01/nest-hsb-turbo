import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: 'dev-reload',
})
export class DevReloadGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(DevReloadGateway.name);
  private connectedClients = new Set<string>();

  handleConnection(client: Socket) {
    this.connectedClients.add(client.id);
    this.logger.debug(`Client connected: ${client.id} (Total: ${this.connectedClients.size})`);
    
    // Send initial connection confirmation
    client.emit('connected', { 
      message: 'Connected to dev reload server',
      isDevelopment: process.env.NODE_ENV !== 'production'
    });
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    this.logger.debug(`Client disconnected: ${client.id} (Total: ${this.connectedClients.size})`);
  }

  sendReloadCommand(type: string, data?: any) {
    if (this.connectedClients.size === 0) {
      return;
    }

    const payload = {
      type,
      timestamp: Date.now(),
      ...data,
    };

    this.logger.debug(`Sending reload command: ${type}`);
    this.server.emit('reload', payload);
  }

  // Send Turbo Stream updates
  sendTurboStream(html: string, target: string, action: string = 'replace') {
    const turboStream = `
      <turbo-stream action="${action}" target="${target}">
        <template>${html}</template>
      </turbo-stream>
    `;

    this.server.emit('turbo-stream', { 
      stream: turboStream,
      timestamp: Date.now() 
    });
  }
}