import http from "http";
import express from "express";
import WebSocket from "ws";

import { nanoid } from "nanoid/non-secure";

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let activeHealers = 0;

wss.on("connection", (ws: WebSocket) => {
  ws.send(nanoid());

  activeHealers++;
  console.log(`New connection, active healers: ${activeHealers}`);

  ws.on("message", (message: any) => {
    ws.send(message);
  });
  ws.on("close", () => {
    activeHealers--;
    console.log(`Connection closed, active healers: ${activeHealers}`);
  });
});

app.get("/", (req, res) => {
  res.json({ response: nanoid(), activeHealers });
});

app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`PORT Listen At ${PORT}`);
  console.log(`Server at http://localhost:${PORT}`);
  console.log(`Websocket at ws://localhost:${PORT}`);
});
