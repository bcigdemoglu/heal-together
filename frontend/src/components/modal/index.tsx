import React, { useState } from 'react';
import {
  Modal,
  Input,
  Checkbox,
  Button,
  Link,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@nextui-org/react';

export const ModalLogin = () => {
  const [visible, setVisible] = useState(false);

  const handleOpen = () => setVisible(true);
  const handleClose = () => {
    setVisible(false);
    console.log('closed');
  };

  return (
    <div className='h-screen flex items-center justify-center'>
      <Link
        href='#'
        onClick={handleOpen}
        className='text-blue-600 hover:text-blue-900'
      >
        Login
      </Link>

      <Modal
        isOpen={visible}
        onClose={handleClose}
        className='overflow-hidden rounded-lg bg-white shadow-md'
      >
        <ModalHeader className='border-b border-gray-200 px-4 py-2'>
          <h3 className='text-lg font-medium text-gray-900'>
            Welcome to{' '}
            <text className='font-semibold text-blue-600'>NextUI</text>
          </h3>
        </ModalHeader>
        <ModalBody className='px-4 py-4'>
          <Input
            value=''
            onChange={() => {}}
            placeholder='Email'
            className='mt-2 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <Input
            value=''
            onChange={() => {}}
            type='password'
            placeholder='Password'
            className='mt-2 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <ModalBody className='mt-4 flex items-center justify-between'>
            <Checkbox className='h-4 w-4 text-blue-600 focus:ring-blue-500'>
              <text className='ml-2 text-sm'>Remember me</text>
            </Checkbox>
            <Link
              href='#'
              className='text-sm font-medium text-blue-600 hover:underline'
            >
              Forgot password?
            </Link>
          </ModalBody>
        </ModalBody>
        <ModalFooter className='flex items-center justify-end border-t border-gray-200 px-4 py-2'>
          <Button
            variant='flat'
            className='w-auto text-red-600 hover:bg-red-100 hover:text-red-700'
            onClick={handleClose}
          >
            Close
          </Button>
          <Button className='ml-2 w-auto bg-blue-600 text-white hover:bg-blue-700'>
            Sign in
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};
