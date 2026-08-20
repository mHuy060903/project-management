import { createServer } from 'http';
import app from './app.ts';
import { env } from './config/env.ts';
import { initSocket } from './realtime/socket.ts';

const httpServer = createServer(app);
initSocket(httpServer);

httpServer.listen(env.port, () => {
  console.log(`Server đang chạy tại http://localhost:${env.port}`);
});