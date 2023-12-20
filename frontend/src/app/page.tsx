'use client';

import Image from 'next/image';
import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';
import { time } from 'console';

interface SocketMessage {
  totalActiveHealers: number;
}

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

interface HealRequestItem {
  id: number;
  name: string;
  healthCondition: string;
  requesterNote: string;
  imageLink: string;
  createdAt: string;
  healStartedAt: string;
  healEndedAt: string | undefined;
  maxActiveHealers: number;
  priority: number;
  faith: FAITH_ENUM;
  Active: boolean;
  expirationDuration: number;
}

export default function Home() {
  const faith = FAITH_ENUM.CHRISTIAN;

  const [activeHealers, setActiveHealers] = useState<number>(0);
  const [healRequest, setHealRequest] = useState<HealRequestItem>();
  const [timeRemaning, setTimeRemaining] = useState('');
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const flipCard = () => setIsCardFlipped(!isCardFlipped);

  const healEndTime = (hR: HealRequestItem) => {
    const startTime = new Date(hR.healStartedAt).getTime();
    return startTime + hR.expirationDuration;
  };
  const healExpired = (hR: HealRequestItem) => {
    const isExpired = Date.now() > healEndTime(hR);
    return isExpired;
  };

  /**
   * The defaultUrl is set to the local network IP (e.g., 192.168.x.x:PORT) instead of localhost:PORT.
   * This change allows the backend to be accessible from mobile devices on the same network.
   * To dynamically set the URL, we use window.location.href combined with the backend PORT.
   * Additionally, it's important to configure CORS on the backend server to accept requests
   * from the 192.168.* subnet, ensuring cross-origin access from various local devices.
   */
  const getBackendUrl = () => {
    const defaultBackendUrl = new URL(window.location.href);
    defaultBackendUrl.port =
      process.env.NEXT_PUBLIC_BACKEND_PORT || defaultBackendUrl.port;
    const BACKEND_URL =
      process.env.NEXT_PUBLIC_BACKEND_URL || defaultBackendUrl.toString();
    return BACKEND_URL;
  };

  const fetchHealRequest = async (faith: FAITH_ENUM) => {
    const genHealRequestUrl = new URL('genHealRequest', getBackendUrl());
    genHealRequestUrl.searchParams.set('faith', faith.toString());
    await fetch(genHealRequestUrl)
      .then((response) => response.json())
      .then((data: HealRequestItem) => {
        setHealRequest(data);
      });
  };

  useEffect(() => {
    const backendUrl = getBackendUrl();
    const socket = io(backendUrl);

    socket.on('activeHealers', (arg: SocketMessage) => {
      const { totalActiveHealers } = arg;
      setActiveHealers(totalActiveHealers);
    });

    socket.on('connect', () => {
      console.log('Healing active');
    });
    socket.emit('faith', faith); // Assign user to faith

    fetchHealRequest(faith); // Initial fetch of healRequest
    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    if (healRequest) {
      const intervalId = setInterval(async () => {
        if (healExpired(healRequest)) {
          await fetchHealRequest(faith);
        } else {
          const endTime = healEndTime(healRequest);
          const currentTime = new Date().getTime();
          const timeDifference = Math.floor((endTime - currentTime) / 1000); // difference in seconds

          const minutes = Math.floor(timeDifference / 60)
            .toString()
            .padStart(2, '0');
          const seconds = (timeDifference % 60).toString().padStart(2, '0');

          setTimeRemaining(`${minutes}:${seconds}`);
        }
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [healRequest, faith]);

  return (
    <>
      <div id='Full section' className='flex h-svh flex-col'>
        {/* Header */}
        <header className='bg-gray-800 p-4 text-center'>
          <h1 className='text-lg font-bold'>Focus your positive thoughts</h1>
        </header>

        {/* Middle */}
        {/* Flip inspired from https://play.tailwindcss.com/gt4tkNCFyA */}
        <main className='flex flex-1 items-center justify-center'>
          {healRequest ? (
            <div
              className='h-4/5 group relative flex w-4/5 items-center justify-center [perspective:1000px]'
              onClick={flipCard}
            >
              <div
                className={`h-full relative transition-all duration-500 [transform-style:preserve-3d] ${
                  isCardFlipped ? '[transform:rotateY(180deg)]' : ''
                }`}
              >
                <Image
                  src={healRequest.imageLink}
                  id='soulImage'
                  alt='SoulImage'
                  width={0}
                  height={0}
                  sizes='100vh'
                  quality={100}
                  priority={true}
                  className='h-full w-auto object-contain'
                />
                <div className='absolute inset-0 flex items-center overflow-y-auto bg-black/80 px-12 text-center text-lg text-slate-200 [transform:rotateY(180deg)] [backface-visibility:hidden]'>
                  <div id='soulText' className='h-full'>
                    {healRequest.name}: {healRequest.healthCondition}{' '}
                    {healRequest.requesterNote} {'amen '.repeat(200)}
                  </div>
                </div>
              </div>
            </div>
          ) : undefined}
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
            {healRequest ? (
              <span>Remaining {timeRemaning}</span>
            ) : (
              <span>Receiving image...</span>
            )}
          </div>
        </footer>
      </div>
    </>
  );
}
