'use client';

import {useEffect, useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faHouse, faDoorOpen, faPlay, faStop} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import word_list from '../../../public/basic_english_850.json';

/** Letter is of type [character, opacity=1] */
type Letter = [string, number];

/** Word is of type [string, opacity=1] */
type Word = [string, number];

const DEFAULT_OPACITY = 0;
const DEFAULT_SPEED = 100;

function generateRandomLetter(numbersAllowed = false): Letter {
  const numbers = '0123456789';
  const letters = 'abcdefghijklmnopqrstuvwxyz \n'; // Define allowed characters
  const allowed = letters + (numbersAllowed ? numbers : []);
  const randomIndex = Math.floor(Math.random() * allowed.length); // Generate random index
  return [allowed[randomIndex], DEFAULT_OPACITY]; // Return the character at the random index
}

function generateRandomWord(): Word {
  const randomIndex = Math.floor(Math.random() * word_list.length); // Generate random index
  return [word_list[randomIndex] + ' ', DEFAULT_OPACITY]; // Return the character at the random index
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
  const [letterSpeed, setLetterSpeed] = useState(1000 / DEFAULT_SPEED);
  const [stop, setStop] = useState(false);
  const [dataList, setDataList] = useState<Letter[] | Word[]>([]);

  useEffect(() => {
    if (!stop) {
      const interval = setInterval(() => {
        const newLetter = generateRandomWord();
        setDataList((prevList) => {
          const randomIndex = Math.floor(Math.random() * prevList.length);
          const randomOpacity = Math.random();
          const newList = [...prevList];
          newList.push(newLetter);
          newList[randomIndex][1] = randomOpacity;
          return newList;
        });
      }, letterSpeed);

      return () => {
        console.log('Clearing interval: ', interval);
        clearInterval(interval);
      };
    }
  }, [letterSpeed, stop]);

  useEffect(() => {
    if (isUserAtBottom()) {
      scrollToBottom();
    }
  }, [dataList]);

  // TODO: FIX WHY MOBILE BUTTON DOES NOT WORK!!!!!
  // TODO: FIX WHY MOBILE BUTTON DOES NOT WORK!!!!!
  // TODO: FIX WHY MOBILE BUTTON DOES NOT WORK!!!!!
  // TODO: FIX WHY MOBILE BUTTON DOES NOT WORK!!!!!
  // TODO: FIX WHY MOBILE BUTTON DOES NOT WORK!!!!!
  // TODO: FIX WHY MOBILE BUTTON DOES NOT WORK!!!!!

  return (
    <>
      <div id='Full section' className='flex flex-col bg-black text-white'>
        {/* Header */}
        <header className='fixed top-0 z-30 grid w-full grid-cols-8 items-center justify-center bg-gray-800 p-4'>
          <div className='col-span-1 flex items-center justify-center'>
            <Link href='/'>
              <FontAwesomeIcon icon={faDoorOpen} />
            </Link>
          </div>
          <h1 className='col-span-6 text-center text-lg font-bold'>Focus on the spirits</h1>
          <div className='col-span-8 flex items-center justify-center'>
            <span>Speed: {1000 / letterSpeed} letters per sec</span>
            <button onClick={() => setLetterSpeed((prevSpeed) => prevSpeed / 2)}>
              <span className='mx-2 block rounded-lg bg-gray-900 px-2 py-1 text-white'>+</span>
            </button>
            <button onClick={() => setLetterSpeed((prevSpeed) => prevSpeed * 2)}>
              <span className='mx-2 block rounded-lg bg-gray-900 px-2 py-1 text-white '>-</span>
            </button>
            <button onClick={() => setStop(!stop)}>
              {/* If stop true faPlay, if stop false faStop */}
              <span className='mx-2 block rounded-lg bg-gray-900 px-2 py-1 text-white'>
                {stop ? <FontAwesomeIcon icon={faPlay} /> : <FontAwesomeIcon icon={faStop} />}
              </span>
            </button>
          </div>
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
