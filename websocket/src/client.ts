// import WebSocket from "ws";

// const WSURL = process.env.WSURL || "ws://localhost:3001";
// const ws = new WebSocket(WSURL);

// ws.on("open", () => {
//   console.log("Connected to server");

//   ws.send("Hello, server!");
// });

// ws.on("message", (message: string) => {
//   console.log(`Received message from server: ${message}`);
// });

// ws.on("close", () => {
//   console.log("Disconnected from server");
// });

import { io } from 'socket.io-client';

const WSURL = process.env.WSURL || 'http://localhost:3001';
const socket = io(WSURL);

socket.on('connect', () => {
  console.log('Connected to server');

  socket.emit('message', 'Hello, server!');
  socket.emit('faith', 3);
});

socket.on('message', (message: object) => {
  console.log(`Received message from server: ${JSON.stringify(message)}`);
});

socket.on('activeHealers', (message: object) => {
  console.log(`Received message from server: ${JSON.stringify(message)}`);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
