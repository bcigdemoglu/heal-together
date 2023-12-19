'use client';

import Image from 'next/image';
import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';

interface SocketMessage {
  totalActiveHealers: number;
}

export default function Home() {
  const [activeHealers, setActiveHealers] = useState<number>(0);

  useEffect(() => {
    // const ws = new WebSocket("ws://localhost:3001");
    // const ws = new WebSocket('wss://heal-together-backend.onrender.com');
    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || '');
    console.log(process.env.NEXT_PUBLIC_BACKEND_URL);

    socket.on('activeHealers', (arg: SocketMessage) => {
      const { totalActiveHealers } = arg;
      setActiveHealers(totalActiveHealers);
    });

    socket.emit('faith', 3);

    // ws.onmessage = (event: MessageEvent) => {
    //   const data: WebSocketMessage = JSON.parse(event.data);
    //   if (data.activeHealers !== undefined) {
    //     setActiveHealers(data.activeHealers);
    //   }
    // };

    // return () => {
    //   ws.close();
    // };
  }, []);

  return (
    <>
      <div id='Full section' className='flex h-svh flex-col'>
        {/* Header */}
        <header className='bg-gray-800 p-4 text-center'>
          <h1 className='text-lg font-bold'>Focus your positive thoughts</h1>
        </header>

        {/* Middle */}
        <main className='flex flex-1 items-center justify-center'>
          <div className='h-4/5 relative flex w-4/5 items-center justify-center'>
            <Image
              src={
                'https://i.ibb.co/vmH0Vng/Whats-App-Image-2023-12-08-at-23-33-52.jpg'
              }
              alt='SoulImage'
              width={0}
              height={0}
              sizes='100vh'
              style={{
                height: '100%',
                width: 'auto',
                objectFit: 'contain',
              }}
            />
          </div>
        </main>

        {/* Footer */}
        <footer className='grid grid-cols-3 bg-gray-800 p-4 text-center'>
          <div className='flex items-center justify-center'>
            <span>Active Healers {activeHealers}</span>
          </div>
          <div className='flex items-center justify-center'>
            <Image
              src='https://www.svgrepo.com/show/22031/home-icon-silhouette.svg'
              alt='Home'
              width={24}
              height={24}
            />
          </div>
          <div className='flex items-center justify-center'>
            <span>Remaining 1:11</span>
          </div>
        </footer>
      </div>
    </>
  );
}
