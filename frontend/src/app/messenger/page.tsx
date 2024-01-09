'use client';

import {useEffect, useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faHouse,
  faDoorOpen,
  faPlay,
  faStop,
  faRotateRight,
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import word_list from '../../../public/basic_english_850.json';

/** Letter is of type [character, opacity=1] */
type Letter = [string, number];

/** Word is of type [string, opacity=1] */
type Word = [string, number];

type GenType = 'letter' | 'word';

const NUMBERS = '0123456789';
// Allowed characters
const LETTERS = 'abcdefghijklmnopqrstuvwxyz  ';
/** words per second */
const DEFAULT_SPEED = 10;

// TODO: ADD RANDOM COLORING
// TODO: ADD RANDOM COLORING
// TODO: ADD RANDOM COLORING
// const DEFAULT_COLOR = RGB(255, 255, 255);

function generateRandomLetter(numbersAllowed = false): Letter {
  const allowed = LETTERS + (numbersAllowed ? NUMBERS : []);
  const randomIndex = Math.floor(Math.random() * allowed.length); // Generate random index
  return [allowed[randomIndex], Math.random()]; // Return the character at the random index
}

function generateRandomWord(): Word {
  const randomIndex = Math.floor(Math.random() * word_list.length); // Generate random index
  return [word_list[randomIndex] + ' ', Math.random()]; // Return the character at the random index
}

const isUserAtBottom = (threshold = 40) => {
  const {innerHeight} = window;
  const {scrollTop, offsetHeight} = document.documentElement;

  return innerHeight + scrollTop >= offsetHeight - threshold;
};

const scrollToBottom = () => {
  window.scroll({
    top: Math.max(document.body.scrollHeight, document.documentElement.clientHeight),
    // top: 100000,
    left: 0,
    behavior: 'auto', // Optional: for smooth scrolling
  });
};

export default function MessengerPage() {
  const [speed, setSpeed] = useState(1000 / DEFAULT_SPEED);
  const [stop, setStop] = useState(false);
  const [dataList, setDataList] = useState<Letter[] | Word[]>([]);
  const [genType, setGenType] = useState<GenType>('word');
  const [channel, setChannel] = useState<number>(0);
  const toggleGenType = () => {
    setGenType((prevGenType) => (prevGenType === 'letter' ? 'word' : 'letter'));
  };

  useEffect(() => {
    if (stop) return;
    console.log('channel:', channel);

    const generateData = (): Letter | Word => {
      return genType === 'letter' ? generateRandomLetter() : generateRandomWord();
    };

    function matchesChannel(rand: number, channel: number): boolean {
      if (channel === 0) return true;
      // Convert channel to an integer by removing the decimal point
      const channelAsInt = parseInt(channel.toString().replace('.', ''), 10);
      // Determine the number of digits in channelAsInt
      const digits = channelAsInt.toString().length;
      // Extract the first 'digits' decimals from rand
      const randInt = Math.floor(rand * 10 ** digits);
      // Compare and return the result
      return randInt === channelAsInt;
    }

    const updateDataList = (newData: Letter | Word) => {
      if (!matchesChannel(newData[1], channel)) {
        return;
      }
      setDataList((prevList) => {
        const randomIndex = Math.floor(Math.random() * prevList.length);
        const randomOpacity = Math.random();
        const updatedList = [...prevList, newData];
        updatedList[randomIndex][1] = randomOpacity;

        return updatedList;
      });
    };

    const intervalId = setInterval(() => {
      const newData = generateData();
      updateDataList(newData);
    }, speed);

    return () => {
      console.log('Clearing interval:', intervalId);
      clearInterval(intervalId);
    };
  }, [speed, stop, genType, channel, setDataList]);

  // useEffect(() => {
  //   if (isUserAtBottom()) {
  //     scrollToBottom();
  //   }
  // }, [dataList]);

  // TODO: FIX WHY MOBILE BUTTON DOES NOT WORK!!!!!
  // TODO: FIX WHY MOBILE BUTTON DOES NOT WORK!!!!!
  // TODO: FIX WHY MOBILE BUTTON DOES NOT WORK!!!!!
  // TODO: FIX WHY MOBILE BUTTON DOES NOT WORK!!!!!
  // TODO: FIX WHY MOBILE BUTTON DOES NOT WORK!!!!!
  // TODO: FIX WHY MOBILE BUTTON DOES NOT WORK!!!!!
  // TODO: IT IS DUE TO SCROLLING BEHAVIOR!!!!!!!!
  // TODO: IT IS DUE TO SCROLLING BEHAVIOR!!!!!!!!
  // TODO: IT IS DUE TO SCROLLING BEHAVIOR!!!!!!!!

  return (
    <>
      <div id='Full section' className='flex flex-col bg-black text-xs text-white'>
        {/* Header */}
        <header className='fixed top-0 z-30 grid w-full grid-cols-6 items-center justify-center bg-gray-800 p-4 md:grid-cols-8'>
          <div className='col-span-1 flex items-center justify-center'>
            <Link href='/'>
              <FontAwesomeIcon icon={faDoorOpen} />
            </Link>
          </div>
          <h1 className='col-span-6 text-center text-lg font-bold'>Focus on the spirits</h1>
          <div className='col-span-8 flex items-center justify-center'>
            <span>
              Speed: {1000 / speed}{' '}
              <button onClick={() => toggleGenType()}>
                <span className=' block rounded-lg bg-gray-900 px-2 py-1 text-white'>
                  {genType}s
                </span>
              </button>
            </span>
            <button onClick={() => setSpeed((prevSpeed) => prevSpeed / 2)}>
              <span className='mx-2 block rounded-lg bg-gray-900 px-2 py-1 text-white'>+</span>
            </button>
            <button onClick={() => setSpeed((prevSpeed) => prevSpeed * 2)}>
              <span className='mx-2 block rounded-lg bg-gray-900 px-2 py-1 text-white '>-</span>
            </button>
            <button onClick={() => setStop(!stop)}>
              {/* If stop true faPlay, if stop false faStop */}
              <span className='mx-2 block rounded-lg bg-gray-900 px-2 py-1 text-white'>
                {stop ? <FontAwesomeIcon icon={faPlay} /> : <FontAwesomeIcon icon={faStop} />}
              </span>
            </button>
            <button onClick={() => setDataList([])}>
              {/* Reset data list */}
              <span className='mx-2 block rounded-lg bg-gray-900 px-2 py-1 text-white'>
                <FontAwesomeIcon icon={faRotateRight} />
              </span>
            </button>
            <span className='whitespace-nowrap'>Channel:</span>
            <input
              type='number'
              className='ml-2 block rounded-lg bg-gray-900 px-2 py-1'
              value={channel}
              onChange={(e) => setChannel(parseFloat(e.target.value || '0'))}
              style={{width: `${channel.toString().length + 5}ch`}}
            />
          </div>
          <div className='col-span-8 flex items-center justify-center'></div>
        </header>

        {/* Middle */}
        <section>
          <main className='inset-0 flex min-h-[svh] items-center justify-center bg-black px-4 pb-20 pt-32 md:px-20'>
            <div className='overflow-y-scroll text-sm'>
              {dataList.map(([data, opacity], index) => (
                <span key={index} style={{opacity}}>
                  {data}
                </span>
              ))}
            </div>
          </main>
        </section>

        {/* Footer */}
        <footer className='fixed bottom-0 grid w-full grid-cols-3 bg-gray-800 p-4 text-center'>
          <div className='flex items-center justify-center'></div>
          <Link href='/' className='flex items-center justify-center'>
            <FontAwesomeIcon icon={faHouse} />
          </Link>
          <div className='flex items-center justify-center'></div>
        </footer>
      </div>
    </>
  );
}
