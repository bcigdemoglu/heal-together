Following guide https://medium.com/@vitaliykorzenkoua/working-with-websocket-in-node-js-using-typescript-1aebb8a06bd6

Local server: http://localhost:3001
Local websocket: ws://localhost:3001

Develop with:

```
yarn build
yarn dev
```

Prod with:

```
yarn build
yarn start
```

Start test client with:

```
yarn build
yarn client
```

In client expect to see message:

```
Connected to server
Received message from server: UEvbArHfLMt88bWusXdBM
Received message from server: Hello, server!
```

In Websocket server expect to see:

```
PORT Listen At 3001
Server at localhost:3001
Websocket at ws://localhost:3001
New connection, active healers: 1
```
