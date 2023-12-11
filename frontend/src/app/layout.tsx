import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
// import Head from "next/head";
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Heal Together',
  description: 'Heal one another by focusing our hearts',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      {/* <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </Head> */}
      <body
        className={`${inter.className} overflow-hidden bg-black text-white`}
      >
        {children}
      </body>
    </html>
  );
}
