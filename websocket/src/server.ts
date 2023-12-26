import { createServer } from 'http';
import express from 'express';
import { Request, Response } from 'express';
// import WebSocket from "ws";
import { Server as SocketIOServer } from 'socket.io';
import Baserow, { BaserowListParams, BaserowRecord } from 'baserow-client';
import dotenv from 'dotenv';
import cors from 'cors';

import { v4 as uuidv4 } from 'uuid';

dotenv.config({ path: '.env.local' });

const app = express();

const allowedOrigins = [
  'https://fantastic-parfait-6db553.netlify.app',
  'https://heal-together.vercel.app',
  'http://localhost:3000',
  /192.168.*/,
];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

/* 3 minutes 33 seconds */
const DEFAULT_EXPIRATION_DURATION = 3 * 60 * 1000 + 33 * 1000;
// const DEFAULT_EXPIRATION_DURATION = 5 * 1000; // 5 seconds

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
  healStartedAt: string;
  healEndedAt: string | undefined;
  expirationDuration: number;
  maxActiveHealers: number;
  priority: number;
  faith: FAITH_ENUM;
  Active: boolean;
}

type baserowHealRequestItemType = { [K in keyof HealRequestItem]: undefined };
const baseHealRequestItem: baserowHealRequestItemType =
  {} as baserowHealRequestItemType;

const HEAL_REQUEST_TABLE_ID = 227602;
const table = baserow.table<HealRequestItem>(HEAL_REQUEST_TABLE_ID);

interface ServerState {
  id: number;
  activeHealers: Map<string, boolean>;
  maxActiveHealers: number;
  currentHealRequest?: HealRequestItem;
  lastUpdatedAt: string;
  lastBackedUpAt: string;
  expirationDuration: number;
}

const sS = (): ServerState => ({
  id: 0,
  activeHealers: new Map(),
  maxActiveHealers: 0,
  currentHealRequest: undefined,
  lastUpdatedAt: '',
  lastBackedUpAt: '',
  expirationDuration: DEFAULT_EXPIRATION_DURATION,
});

enum FAITH_ENUM {
  ALL,
  AGNOSTIC,
  JEWISH,
  CHRISTIAN,
  MUSLIM,
  BUDDHIST,
  HINDU,
  SIKH,
  "BAHA'I",
  SHINTO,
  DAOIST,
}

type ServerStateByFaith = {
  [value in FAITH_ENUM]: ServerState;
};

const sSBF: ServerStateByFaith = Object.fromEntries(
  Object.values(FAITH_ENUM)
    .filter((value) => typeof value === 'number')
    .map((faith) => [faith, { ...sS() }])
) as ServerStateByFaith;

interface ServerStateTable {
  id: number;
  lastUpdatedAt: string;
  stateJSON: string;
}

const sSTable = {
  id: Number(process.env.SERVER_STATE_DB_ID) || 2,
  lastUpdatedAt: '',
  stateJSON: '',
};

const SERVER_STATE_TABLE_ID = 228882;
const serverStateTable = baserow.table<ServerStateTable>(SERVER_STATE_TABLE_ID);
let serverIsRestored = false;

function updateSSField<K extends keyof ServerState>(
  sS: ServerState,
  key: K,
  newVal: ServerState[K]
): void {
  sS[key] = newVal;
}

function getSS(faith: FAITH_ENUM): ServerState {
  return sSBF[faith];
}

function replacer(key: any, value: any) {
  if (value instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(value.entries()),
    };
  } else {
    return value;
  }
}

function reviver(key: any, value: any) {
  if (typeof value === 'object' && value !== null) {
    if (value.dataType === 'Map') {
      return new Map(value.value);
    }
  }
  return value;
}

function toJSONString(obj: any) {
  return JSON.stringify(obj, replacer, 2);
}

function updateSS<K extends keyof ServerState>(
  sSBF: ServerStateByFaith,
  faith: FAITH_ENUM,
  key: K,
  newVal: ServerState[K]
): void {
  sSBF[faith][key] = newVal;
  sSBF[faith].lastUpdatedAt = new Date().toISOString();
  // console.log(`Updated ServerState.${FAITH_ENUM[faith]}.${key}: ${newVal}`);
  // console.log(
  //   `Updated ServerState.${FAITH_ENUM[faith]}.${key}: ${toJSONString(
  //     sSBF[faith]
  //   )}`
  // );
}

function getTotalActiveHealers() {
  return Object.values(sSBF).reduce(
    (acc, serverState) => acc + serverState.activeHealers.size,
    0
  );
}

function updateSSActiveHealers(
  sSBF: ServerStateByFaith,
  faith: FAITH_ENUM,
  socketId: string,
  addHealer = true
): void {
  let newActiveHealers = sSBF[faith].activeHealers;
  if (addHealer) {
    sSBF[faith].activeHealers.set(socketId, true);
  } else {
    sSBF[faith].activeHealers.delete(socketId);
  }
  const maxActiveHealers = Math.max(
    sSBF[faith].maxActiveHealers,
    sSBF[faith].activeHealers.size
  );
  updateSS(sSBF, faith, 'activeHealers', newActiveHealers);
  updateSS(sSBF, faith, 'maxActiveHealers', maxActiveHealers);
}

function resetSSCurrentHealRequest(
  sSBF: ServerStateByFaith,
  faith: FAITH_ENUM
): void {
  updateSS(sSBF, faith, 'currentHealRequest', undefined);
  updateSS(sSBF, faith, 'maxActiveHealers', sSBF[faith].activeHealers.size);
}

function updateSSHealRequest(
  sSBF: ServerStateByFaith,
  healRequest: HealRequestItem
): HealRequestItem {
  updateSS(sSBF, healRequest.faith, 'currentHealRequest', healRequest);
  return healRequest;
}

// function backupSS() {
//   serverStateTable
//     .update(sSTable.id, {
//       id: sSTable.id,
//       stateJSON: JSON.stringify(sS),
//       lastUpdatedAt: sS.lastUpdatedAt,
//     })
//     .then(() => {
//       console.log('Server state backed up to DB');
//     });
// }

// function fiveMinutesPassedSinceLastBackup(lastBackupISOString: string) {
//   const lastBackupDate = new Date(lastBackupISOString);
//   const expirationDate = new Date(Date.now() - EXPIRATION_DURATION); // 5 minutes in milliseconds

//   return lastBackupDate < expirationDate;
// }

// function safelyParseStateJSON(ssJSON: string): ServerState {
//   let parsedServerState;
//   try {
//     parsedServerState = JSON.parse(ssJSON);
//   } catch (e) {
//     console.log(ssJSON);
//     console.log(e);
//     parsedServerState = { ...sS, id: sSTable.id };
//   }

//   return parsedServerState;
// }

// async function restoreSS(sS: ServerState): Promise<void> {
//   console.log('Retrieve server state from DB');
//   const lastServerState = await serverStateTable.get(sSTable.id);

//   const stateJSON: ServerState = safelyParseStateJSON(
//     lastServerState.getStringValue('stateJSON')
//   );

//   for (const key of Object.keys(stateJSON) as Array<keyof ServerState>) {
//     updateSSField(key, stateJSON[key]);
//   }

//   console.log(`Restored ServerState: ${JSON.stringify(sS, null, 2)}`);
//   serverIsRestored = true;
// }

io.on('connection', (socket) => {
  socket.emit('connection', { id: uuidv4() });

  console.log(
    `${Date.now()} - New connection ${
      socket.id
    }, total active healers: ${getTotalActiveHealers()}`
  );

  socket.on('faith', (faith: number) => {
    const socketFaith = verifyFaithEnum(faith);
    let oldFaith = socket.data.faith;
    if (oldFaith && oldFaith !== socketFaith) {
      // remove from existing faith if present
      updateSSActiveHealers(sSBF, oldFaith, socket.id, false);
    }
    socket.data.faith = socketFaith;
    updateSSActiveHealers(sSBF, socketFaith, socket.id);
    console.log(
      `${Date.now()} - ${socket.id} connected to faith ${
        FAITH_ENUM[socketFaith]
      }, total active healers: ${getTotalActiveHealers()}`
    );
    broadcastActiveHealers();
  });

  socket.on('message', (message) => {
    socket.emit('message', { message });
  });

  socket.on('disconnect', (reason) => {
    const socketFaith: FAITH_ENUM | undefined = socket.data.faith;
    if (socketFaith) {
      updateSSActiveHealers(sSBF, socketFaith, socket.id, false);
    }
    console.log(
      `${Date.now()} - ${
        socket.id
      } disconnected, total active healers: ${getTotalActiveHealers()}`
    );
    broadcastActiveHealers();
  });
});

function broadcastActiveHealers() {
  io.emit('activeHealers', { totalActiveHealers: getTotalActiveHealers() });
}

app.get('/', (req, res) => {
  res.json({ totalActiveHealers: getTotalActiveHealers(), sSBF });
});

app.get('/ssBF', (req, res) => {
  res.json(JSON.parse(toJSONString(sSBF)));
});

app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

app.get('/allRequests', async (req, res) => {
  const params: BaserowListParams<HealRequestItem> = {
    page: 1,
    size: 100,
    orderBy: 'healEndedAt',
    orderDir: 'ASC',
  };
  const allRequests = await table.list(params);
  res.status(200).json(allRequests);
});

function baserowRecordToHealRequestItem(
  record: BaserowRecord<HealRequestItem>
): HealRequestItem {
  return {
    id: record.getID(),
    name: record.getStringValue('name'),
    healthCondition: record.getStringValue('healthCondition'),
    requesterNote: record.getStringValue('requesterNote'),
    imageLink: record.getStringValue('imageLink'),
    createdAt: record.getStringValue('createdAt'),
    healStartedAt: record.getStringValue('healStartedAt'),
    healEndedAt: record.getStringValue('healEndedAt'),
    maxActiveHealers: record.getNumberValue('maxActiveHealers'),
    priority: record.getNumberValue('priority'),
    faith: parseInt(record.getStringValue('faith').split('_').pop() || '0', 10),
    Active: Boolean(record.getNumberValue('Active')),
    expirationDuration: DEFAULT_EXPIRATION_DURATION,
  };
}

async function fetchDBNextHealRequest(
  faith: FAITH_ENUM
): Promise<HealRequestItem | undefined> {
  const params: BaserowListParams<HealRequestItem> = {
    size: 3,
    orderBy: 'healEndedAt',
    orderDir: 'ASC',
    search: `FAITH_ENUM_${faith}`,
  };
  const allRequests = await table.list(params);
  const healRequestItem = allRequests[0];
  if (healRequestItem) {
    return baserowRecordToHealRequestItem(healRequestItem);
  } else {
    return undefined;
  }
}

async function updateDBHealRequest(
  healRequest: HealRequestItem,
  update: Partial<HealRequestItem>
): Promise<HealRequestItem> {
  const updatedRecord = await table.update(healRequest.id, {
    ...baseHealRequestItem,
    ...update,
  });
  return baserowRecordToHealRequestItem(updatedRecord);
}

async function setDBHealStartedAt(
  healRequest: HealRequestItem
): Promise<HealRequestItem> {
  const currentDate = new Date().toISOString();
  return await updateDBHealRequest(healRequest, {
    healStartedAt: currentDate,
  });
}

async function setDBHealEnded(
  healRequest: HealRequestItem
): Promise<HealRequestItem> {
  const currentDate = new Date().toISOString();
  return await updateDBHealRequest(healRequest, {
    healEndedAt: currentDate,
    maxActiveHealers: sSBF[healRequest.faith].maxActiveHealers,
  });
}

async function fetchDBSetSSNextHealRequest(
  requestedFaith: FAITH_ENUM
): Promise<HealRequestItem> {
  const fetchedRequest = await fetchDBNextHealRequest(requestedFaith);
  if (!fetchedRequest) {
    throw new Error('Fetching request failed');
  }
  const updatedRequest = await setDBHealStartedAt(fetchedRequest);
  if (!updatedRequest) {
    throw new Error('Failed updating request');
  }
  return updateSSHealRequest(sSBF, updatedRequest);
}

async function finalizeDBandSSHealRequest(
  healRequest: HealRequestItem
): Promise<HealRequestItem> {
  const finalizedHealRequest = await setDBHealEnded(healRequest);
  resetSSCurrentHealRequest(sSBF, healRequest.faith);
  return finalizedHealRequest;
}

function isHealRequestExpired(healRequest: HealRequestItem): boolean {
  if (!healRequest.healStartedAt) {
    throw new Error('Heal has not started, internal error');
  }
  const healStartedAt = new Date(healRequest.healStartedAt);
  const expirationDate = new Date(Date.now() - healRequest.expirationDuration);

  return healStartedAt <= expirationDate;
}

function verifyFaithEnum(requestedFaith: number): FAITH_ENUM {
  if (!(requestedFaith in FAITH_ENUM)) {
    console.error(`Invalid faith value: ${requestedFaith}, default to 0`);
    return 0;
  }
  return requestedFaith;
}

interface HealRequestQuery {
  faith: number;
}
type HealRequestType = Request<unknown, unknown, unknown, HealRequestQuery>;

app.get(
  '/currentHealRequest',
  async (req: HealRequestType, res: Response<HealRequestItem>) => {
    const requestedFaith = verifyFaithEnum(req.query['faith']);
    const currentHealRequest = sSBF[requestedFaith].currentHealRequest;
    res.status(200).json(currentHealRequest);
  }
);

app.get(
  '/nextHealRequest',
  async (req: HealRequestType, res: Response<HealRequestItem>) => {
    const requestedFaith = verifyFaithEnum(req.query['faith']);
    const nextHealRequest = await fetchDBNextHealRequest(requestedFaith);
    res.status(200).json(nextHealRequest);
  }
);

app.get(
  '/endHealRequest',
  async (req: HealRequestType, res: Response<HealRequestItem>) => {
    const requestedFaith = verifyFaithEnum(req.query['faith']);
    const currentHealRequest = sSBF[requestedFaith].currentHealRequest;
    if (currentHealRequest) {
      await finalizeDBandSSHealRequest(currentHealRequest);
    }
    res.status(200).json(currentHealRequest);
  }
);

app.get(
  '/genHealRequest',
  async (req: HealRequestType, res: Response<HealRequestItem>) => {
    const requestedFaith = verifyFaithEnum(req.query['faith']);
    const currentHealRequest = sSBF[requestedFaith].currentHealRequest;
    if (currentHealRequest) {
      // If current request is defined check for expiration
      if (!isHealRequestExpired(currentHealRequest)) {
        return res.status(200).json(currentHealRequest);
      } else {
        await finalizeDBandSSHealRequest(currentHealRequest);
      }
    }
    // If current request is not defined, fetch DB and set server state
    const nextHealRequest = await fetchDBSetSSNextHealRequest(requestedFaith);
    return res.status(200).json(nextHealRequest);
  }
);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, async () => {
  // Do not restore server state
  // await restoreSS(sS);

  console.log(`PORT Listen At ${PORT}`);
  console.log(`Server at http://localhost:${PORT}`);
  console.log(`AllRequests at http://localhost:${PORT}/allRequests`);
});
