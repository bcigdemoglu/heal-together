import WebSocket from "ws";

const WSURL = process.env.WSURL || "ws://localhost:3001";
const ws = new WebSocket(WSURL);

ws.on("open", () => {
  console.log("Connected to server");

  ws.send("Hello, server!");
});

ws.on("message", (message: string) => {
  console.log(`Received message from server: ${message}`);
});

ws.on("close", () => {
  console.log("Disconnected from server");
});
