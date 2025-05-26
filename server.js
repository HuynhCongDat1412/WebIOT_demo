// server.js (chạy bằng Node.js, KHÔNG phải file script.js trên web)
const WebSocket = require('ws');
const net = require('net');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  const tcpClient = new net.Socket();
  tcpClient.connect(23, '127.0.0.1'); // cổng Hercules

  tcpClient.on('data', (data) => {
    ws.send(data.toString()); // gửi dữ liệu từ tcp client đến web bằng websocket
  });

  ws.on('message', (msg) => {
    tcpClient.write(msg); // gửi dữ liệu từ web cho Hercules (nếu cần)
  });

  ws.on('close', () => {
    tcpClient.end();
  });
});