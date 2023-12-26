'use client';

import {useEffect, useState} from 'react';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faHouse, faDoorOpen, faPlay, faStop} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

/** Letter is of type [character, opacity=1] */
type Letter = [string, number];

function generateRandomLetter(numbersAllowed = false): Letter {
  const defaultOpacity = 1;
  const numbers = '0123456789';
  const letters = 'abcdefghijklmnopqrstuvwxyz \n'; // Define allowed characters
  const allowed = letters + (numbersAllowed ? numbers : []);
  const randomIndex = Math.floor(Math.random() * allowed.length); // Generate random index
  return [allowed[randomIndex], defaultOpacity]; // Return the character at the random index
}

const isUserAtBottom = (threshold = 100) => {
  const {innerHeight} = window;
  const {scrollTop, offsetHeight} = document.documentElement;

  return innerHeight + scrollTop >= offsetHeight - threshold;
};

const scrollToBottom = () => {
  window.scroll({
    top: document.body.scrollHeight,
    left: 0,
    // behavior: 'smooth', // Optional: for smooth scrolling
  });
};

export default function MessengerPage() {
  const [letterSpeed, setLetterSpeed] = useState(50);
  const [stop, setStop] = useState(false);
  const [letterList, setLetterList] = useState<Letter[]>([]);

  useEffect(() => {
    if (!stop) {
      const interval = setInterval(() => {
        const newLetter = generateRandomLetter();
        setLetterList((prevList) => {
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
  }, [letterList]);

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
            <button
              onClick={() => setLetterSpeed((prevSpeed) => prevSpeed / 2)}
              className='mx-2 rounded-lg bg-gray-900 px-2 py-1 text-white'
            >
              +
            </button>
            <button
              onClick={() => setLetterSpeed((prevSpeed) => prevSpeed * 2)}
              className='mx-2 rounded-lg bg-gray-900 px-2 py-1 text-white'
            >
              -
            </button>
            <button
              className='mx-2 rounded-lg bg-gray-900 px-2 py-1 text-white'
              onClick={() => setStop(!stop)}
            >
              {/* If stop true faPlay, if stop false faStop */}
              {stop ? <FontAwesomeIcon icon={faPlay} /> : <FontAwesomeIcon icon={faStop} />}
            </button>
          </div>
        </header>

        {/* Middle */}
        <section>
          <main className='relative flex items-center justify-center p-4 pb-20 pt-32'>
            <div className='h-4/5 w-4/5 overflow-y-scroll text-sm'>
              {letterList.map(([char, opacity], index) => (
                <span key={index} style={{opacity}}>
                  {char}
                </span>
              ))}
            </div>
          </main>
        </section>

        {/* Footer */}
        <footer className='fixed bottom-0 grid w-full grid-cols-3 bg-gray-800 p-4 text-center'>
          <div className='flex items-center justify-center'></div>
          <div className='flex items-center justify-center'>
            <FontAwesomeIcon icon={faHouse} />
          </div>
          <div className='flex items-center justify-center'></div>
        </footer>
      </div>
    </>
  );
}
