import { connect } from 'cloudflare:sockets';

const userID = 'cd27b60b-c33b-45a6-bc00-e0f826012570';

export default {
  async fetch(request, env, ctx) {
    const upgradeHeader = request.headers.get('Upgrade');
    if (!upgradeHeader || upgradeHeader !== 'websocket') {
      return new Response('VLESS proxy is running', { status: 200 });
    }
    const [client, server] = Object.values(new WebSocketPair());
    server.accept();
    handleSession(server, userID);
    return new Response(null, { status: 101, webSocket: client });
  }
};

function handleSession(webSocket, userID) {
  let remoteSocket = null;
  let isConnected = false;

  webSocket.addEventListener('message', async (event) => {
    if (!isConnected) {
      const data = event.data;
      isConnected = true;
    } else if (remoteSocket) {
      const writer = remoteSocket.writable.getWriter();
      await writer.write(event.data);
      writer.releaseLock();
    }
  });

  webSocket.addEventListener('close', () => {
    if (remoteSocket) remoteSocket.close();
  });
    }
