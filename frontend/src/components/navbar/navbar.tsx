'use client';

import React, {useState} from 'react';
import {Link} from '@nextui-org/react';
import {faArrowRight, faBars} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

const NavLink = ({href, children}: {href: string; children: React.ReactNode}) => (
  <Link
    href={href}
    className='flex items-center px-5 py-3 font-medium text-gray-600 transition duration-150 ease-in-out hover:border-b-2 hover:border-current hover:text-gray-900'
  >
    {children}
  </Link>
);

export function Header() {
  const [navbarOpen, setNavbarOpen] = useState(false);

  return (
    <div className=' fixed top-0 z-30 w-full bg-white bg-opacity-50 backdrop-blur-md transition duration-300 ease-in-out md:bg-opacity-90'>
      <div className='mx-auto flex max-w-6xl flex-col px-4 md:flex-row md:items-center md:justify-between md:px-6 lg:px-8'>
        <div className='flex flex-row items-center justify-between p-4'>
          <a
            href='/'
            className='focus:shadow-outline rounded-lg text-lg font-semibold tracking-widest focus:outline-none'
          >
            <h1 className='Avenir md:text-4x1 text-4xl tracking-tighter text-gray-900 lg:text-3xl'>
              HealTogether
            </h1>
          </a>
          <button
            className='cursor-pointer px-3 py-1 leading-none text-gray-900 outline-none focus:outline-none md:hidden'
            type='button'
            aria-label='button'
            onClick={() => setNavbarOpen(!navbarOpen)}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>
        <div
          className={
            'flex-grow items-center pb-4 md:flex md:pb-0' + (navbarOpen ? ' flex' : ' hidden')
          }
        >
          <nav className='flex-grow'>
            <ul className='flex flex-grow flex-col items-center justify-end md:flex-row'>
              <NavLink href='/'>About Us</NavLink>
              <NavLink href='/'>Request</NavLink>
              <Link
                href='/heal'
                className='text-md mt-2 inline-flex  rounded-lg bg-gray-900 px-4 py-2 font-medium text-white transition duration-500 ease-in-out md:ml-4 md:mt-0'
              >
                <span>Start Healing</span>
                <FontAwesomeIcon className='pl-2 text-gray-400' icon={faArrowRight} />
              </Link>
              <Link
                href='/messenger'
                className='text-md mt-2 inline-flex  rounded-lg bg-gray-900 px-4 py-2 font-medium text-white transition duration-500 ease-in-out md:ml-4 md:mt-0'
              >
                <span>Messenger</span>
                <FontAwesomeIcon className='pl-2 text-gray-400' icon={faArrowRight} />
              </Link>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
