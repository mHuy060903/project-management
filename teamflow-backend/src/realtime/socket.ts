import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env.ts';
import { Role } from '@/generated/prisma/client.ts';

interface SocketUser {
  userId: string;
  tenantId: string;
  role: Role;
}

declare module 'socket.io' {
  interface Socket {
    user?: SocketUser;
  }
}

let io: Server;

export function initSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: { origin: '*' }, 
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Thiếu access token'));

    try {
      const payload = jwt.verify(token, env.jwtAccessSecret) as any;
      socket.user = { userId: payload.sub, tenantId: payload.tenantId, role: payload.role };
      next();
    } catch {
      next(new Error('Token không hợp lệ'));
    }
  });

  io.on('connection', (socket: Socket) => {
    socket.on('project:join', (projectId: string) => {
      socket.join(`project:${projectId}`);
    });

    socket.on('project:leave', (projectId: string) => {
      socket.leave(`project:${projectId}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.io chưa được khởi tạo');
  return io;
}