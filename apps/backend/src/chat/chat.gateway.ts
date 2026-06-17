import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer() server!: Server;

  constructor(private readonly jwt: JwtService, private readonly chat: ChatService) {}

  async handleConnection(client: Socket) {
    const token = String(client.handshake.auth?.token ?? '');
    const payload = await this.jwt.verifyAsync(token, { secret: process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret' });
    client.data.user = payload;
  }

  @SubscribeMessage('match:join')
  async join(@ConnectedSocket() client: Socket, @MessageBody() body: { matchId: string }) {
    await this.chat.ensureMatchParticipant(client.data.user.sub, body.matchId);
    await client.join(`match:${body.matchId}`);
  }

  @SubscribeMessage('message:send')
  async send(@ConnectedSocket() client: Socket, @MessageBody() body: { matchId: string; content: string; mediaUrl?: string }) {
    const message = await this.chat.send(client.data.user.sub, body.matchId, body.content, body.mediaUrl);
    this.server.to(`match:${body.matchId}`).emit('message:new', message);
    return message;
  }

  @SubscribeMessage('typing')
  typing(@ConnectedSocket() client: Socket, @MessageBody() body: { matchId: string; isTyping: boolean }) {
    client.to(`match:${body.matchId}`).emit('typing', { userId: client.data.user.sub, isTyping: body.isTyping });
  }
}

