import http from "http";
import express from "express";
import WebSocket from "ws";
import Baserow, { BaserowListParams } from 'baserow-client';
import dotenv from 'dotenv';
import cors from 'cors';

import { v4 as uuidv4 } from "uuid";

dotenv.config({ path: '.env.local' });

const app = express();

const allowedOrigins = ['http://fantastic-parfait-6db553.netlify.app', 'http://localhost:3000'];
app.use(cors({
  origin: allowedOrigins
}));
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const HEAL_REQUEST_TABLE_ID = 227602
const baserow = new Baserow({
  apiKey: process.env.BASEROW_DB_TOKEN,
  showUserFieldNames: true,
});
interface HealRequestItem {
  id: number;
  name: string;
  healthCondition: string;
  requesterNote: string;
  imageLink: string;
  createdAt: string;
  lastHealedAt: string;
  maxActiveHealers: number;
  priority: number;
  Active: boolean
}

const table = baserow.table<HealRequestItem>(HEAL_REQUEST_TABLE_ID);

let activeHealers = 0;

wss.on("connection", (ws: WebSocket) => {
  ws.send(JSON.stringify({id: uuidv4()}));

  activeHealers++;
  console.log(`New connection, active healers: ${activeHealers}`);
  broadcastActiveHealers();

  ws.on("message", (message: any) => {
    ws.send(JSON.stringify({message}));
  });
  ws.on("close", () => {
    activeHealers--;
    console.log(`Connection closed, active healers: ${activeHealers}`);
    broadcastActiveHealers();
  });
});

function broadcastActiveHealers(): void {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ activeHealers }));
    }
  });
}

app.get("/", (req, res) => {
  res.json({ response: uuidv4(), activeHealers });
});

app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});

interface Item {
  Name: string;
  Age: number;
  Email: string;
}

const params: BaserowListParams<HealRequestItem> = {
  page: 1,
  size: 20,
  orderBy: 'id',
  orderDir: 'ASC',
};

app.get("/allRequests", async (req, res) => {
  const allRequests = await table.list();
  res.status(200).send(allRequests);
});

app.get("/currentRequest", async (req, res) => {
  const allRequests = await table.list();
  res.status(200).send(allRequests);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`PORT Listen At ${PORT}`);
  console.log(`Server at http://localhost:${PORT}`);
  console.log(`Websocket at ws://localhost:${PORT}`);
});
