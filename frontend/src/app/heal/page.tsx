'use client';

import Image from 'next/image';
import {io} from 'socket.io-client';
import {useEffect, useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faHouse, faDoorOpen} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

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
const faith = FAITH_ENUM.CHRISTIAN;

const fetchHealRequest = async (
  isConnected: boolean,
  faith: FAITH_ENUM,
  backendUrl: string,
  setHealRequest: (data: HealRequestItem) => any
): Promise<void> => {
  if (!isConnected) {
    console.debug('Not connected, do not attempt');
    return;
  }

  try {
    const url = new URL('genHealRequest', backendUrl);
    url.searchParams.set('faith', faith.toString());

    const response = await fetch(url.toString());
    const data = (await response.json()) as HealRequestItem;
    console.debug('Fetched heal request');
    setHealRequest(data);
  } catch (error) {
    console.error('Error fetching heal request:', error);
  }
};

const healEndTime = (hR: HealRequestItem): number =>
  new Date(hR.healStartedAt).getTime() + hR.expirationDuration;
const healExpired = (hR: HealRequestItem): boolean => Date.now() > healEndTime(hR);

export default function HealPage() {
  const [activeHealers, setActiveHealers] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [healRequest, setHealRequest] = useState<HealRequestItem>();
  const [timeRemaning, setTimeRemaining] = useState('');
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const flipCard = () => setIsCardFlipped(!isCardFlipped);

  /**
   * The defaultUrl is set to the local network IP (e.g., 192.168.x.x:PORT) instead of localhost:PORT.
   * This change allows the backend to be accessible from mobile devices on the same network.
   * To dynamically set the URL, we use window.location.origin combined with the backend PORT.
   * Additionally, it's important to configure CORS on the backend server to accept requests
   * from the 192.168.* subnet, ensuring cross-origin access from various local devices.
   */
  const getBackendUrl = () => {
    const url = new URL(process.env.NEXT_PUBLIC_BACKEND_URL || window.location.origin);
    url.port = process.env.NEXT_PUBLIC_BACKEND_PORT || url.port;
    return url.toString();
  };

  useEffect(() => {
    const backendUrl = getBackendUrl();
    console.debug(backendUrl);
    const socket = io(backendUrl);

    socket.on('activeHealers', (arg: SocketMessage) => {
      const {totalActiveHealers} = arg;
      setActiveHealers(totalActiveHealers);
    });

    socket.on('connect', async () => {
      setIsConnected(true);
      console.debug('Healing active');
      await fetchHealRequest(true, faith, backendUrl, setHealRequest); // Initial fetch of healRequest
    });
    socket.on('disconnect', async () => {
      setIsConnected(false);
    });
    socket.emit('faith', faith); // Assign user to faith

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    if (healRequest) {
      const intervalId = setInterval(async () => {
        if (healExpired(healRequest)) {
          await fetchHealRequest(isConnected, faith, getBackendUrl(), setHealRequest);
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
  }, [isConnected, healRequest]);

  return (
    <>
      <div id='Full section' className='flex h-svh flex-col overflow-hidden bg-black text-white'>
        {/* Header */}
        <header className='grid grid-cols-8 items-center justify-center bg-gray-800 p-4'>
          <div className='col-span-1 flex items-center justify-center'>
            <Link href='/'>
              <FontAwesomeIcon icon={faDoorOpen} />
            </Link>
          </div>
          <h1 className='col-span-6 text-center text-lg font-bold'>Focus your positive thoughts</h1>
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
                    {healRequest.name}: {healRequest.healthCondition} {healRequest.requesterNote}{' '}
                    {'amen '.repeat(400)}
                  </div>
                </div>
              </div>
            </div>
          ) : undefined}
        </main>

        {/* Footer */}
        <footer className='grid grid-cols-3 bg-gray-800 p-4 text-center'>
          <div className='flex items-center justify-center'>
            <span>Active Healers: {activeHealers}</span>
          </div>
          <div className='flex items-center justify-center'>
            <FontAwesomeIcon icon={faHouse} />
          </div>
          <div className='flex items-center justify-center'>
            {healRequest ? <span>Remaining: {timeRemaning}</span> : <span>Receiving image...</span>}
          </div>
        </footer>
      </div>
    </>
  );
}
