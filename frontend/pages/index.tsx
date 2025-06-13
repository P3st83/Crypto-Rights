import Head from 'next/head';
import Link from 'next/link';
import { useWeb3 } from '@/context/Web3Context';

export default function Home() {
  const { connectWallet, isConnected } = useWeb3();

  return (
    <>
      <Head>
        <title>CryptoRights - Blockchain-Powered Content Ownership & Monetization</title>
        <meta name="description" content="A decentralized platform where creators can tokenize their content into NFTs, ensuring ownership, copyright protection, and direct monetization." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Own, Protect & Monetize Your Digital Content
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl">
            CryptoRights is a decentralized platform where creators can tokenize their content into NFTs, 
            ensuring ownership, copyright protection, and direct monetization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            {isConnected ? (
              <Link
                href="/explore"
                className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-3 rounded-md font-semibold text-lg"
              >
                Explore Content
              </Link>
            ) : (
              <button
                onClick={connectWallet}
                className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-3 rounded-md font-semibold text-lg"
              >
                Connect Wallet
              </button>
            )}
            <Link
              href="/create"
              className="bg-transparent border-2 border-white hover:bg-white hover:text-indigo-600 text-white px-8 py-3 rounded-md font-semibold text-lg transition-colors"
            >
              Start Creating
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Platform Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Empowering creators with blockchain technology to protect, monetize, and control their digital rights.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">NFT Content Licensing</h3>
              <p className="text-gray-600">
                Create NFTs that represent your digital content, ensuring proof of ownership and establishing an immutable record on the blockchain.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Monetization Options</h3>
              <p className="text-gray-600">
                Offer your content through one-time sales, subscriptions, or pay-per-view models, all powered by secure blockchain transactions.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Rights Registry</h3>
              <p className="text-gray-600">
                Our blockchain registry provides a permanent record of copyright ownership and licensing history for dispute resolution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Types Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">For All Types of Creators</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you create music, artwork, writing, or video, CryptoRights helps you protect and monetize your digital content.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="relative overflow-hidden rounded-lg shadow-md group">
              <div className="h-64 bg-gray-200 relative">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/music.jpg')" }}></div>
                <div className="absolute inset-0 bg-black bg-opacity-50 group-hover:bg-opacity-30 transition-all"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white text-2xl font-bold">Musicians</h3>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-lg shadow-md group">
              <div className="h-64 bg-gray-200 relative">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/art.jpg')" }}></div>
                <div className="absolute inset-0 bg-black bg-opacity-50 group-hover:bg-opacity-30 transition-all"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white text-2xl font-bold">Visual Artists</h3>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-lg shadow-md group">
              <div className="h-64 bg-gray-200 relative">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/writing.jpg')" }}></div>
                <div className="absolute inset-0 bg-black bg-opacity-50 group-hover:bg-opacity-30 transition-all"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white text-2xl font-bold">Writers</h3>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-lg shadow-md group">
              <div className="h-64 bg-gray-200 relative">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/images/video.jpg')" }}></div>
                <div className="absolute inset-0 bg-black bg-opacity-50 group-hover:bg-opacity-30 transition-all"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white text-2xl font-bold">Filmmakers</h3>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link 
              href="/explore"
              className="inline-block bg-indigo-600 text-white hover:bg-indigo-700 px-8 py-3 rounded-md font-semibold text-lg transition-colors"
            >
              Explore All Content
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Take Control of Your Digital Rights?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join thousands of creators who are already using CryptoRights to protect and monetize their content.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isConnected && (
              <button
                onClick={connectWallet}
                className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-3 rounded-md font-semibold text-lg"
              >
                Connect Wallet
              </button>
            )}
            <Link
              href="/create"
              className="bg-transparent border-2 border-white hover:bg-white hover:text-indigo-600 text-white px-8 py-3 rounded-md font-semibold text-lg transition-colors"
            >
              Create Your First Token
            </Link>
          </div>
        </div>
      </section>
    </>
  );
} 