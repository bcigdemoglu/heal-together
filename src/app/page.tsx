import Image from "next/image";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </Head>
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-gray-800 p-4 text-center">
          <h1 className="text-lg font-bold">Focus your positive thoughts</h1>
        </header>

        {/* Middle */}
        <main className="flex-1 flex justify-center items-center overflow-hidden relative w-full h-screen">
          <div className="w-4/5 h-4/5 flex justify-center items-center">
            <Image
              src={
                "https://qph.cf2.quoracdn.net/main-qimg-e6b6e69ff7ea0b523db2909b7391005c-pjlq"
              }
              alt="SoulImage"
              width={0}
              height={0}
              sizes="100vw"
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 p-4 grid grid-cols-3 text-center">
          <div className="flex justify-center items-center">
            <span>Active Healers 1</span>
          </div>
          <div className="flex justify-center items-center">
            <Image
              src="https://www.svgrepo.com/show/22031/home-icon-silhouette.svg"
              alt="Home"
              width={24}
              height={24}
            />
          </div>
          <div className="flex justify-center items-center">
            <span>Remaining 1:11</span>
          </div>
        </footer>
      </div>
    </>
  );
}
