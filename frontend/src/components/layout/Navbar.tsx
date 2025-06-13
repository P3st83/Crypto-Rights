import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useWeb3 } from '../../context/Web3Context';

const Navbar: React.FC = () => {
  const router = useRouter();
  const { account, isConnected, isConnecting, connectWallet, disconnectWallet } = useWeb3();

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                CryptoRights
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link 
                href="/" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  router.pathname === '/' 
                    ? 'border-indigo-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Home
              </Link>
              <Link 
                href="/explore" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  router.pathname === '/explore' 
                    ? 'border-indigo-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Explore
              </Link>
              <Link 
                href="/marketplace/licenses" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  router.pathname === '/marketplace/licenses' 
                    ? 'border-indigo-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                License Marketplace
              </Link>
              {isConnected && (
                <>
                  <Link 
                    href="/dashboard" 
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      router.pathname === '/dashboard' 
                        ? 'border-indigo-500 text-gray-900' 
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/create" 
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      router.pathname === '/create' 
                        ? 'border-indigo-500 text-gray-900' 
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Create
                  </Link>
                  <Link 
                    href="/licenses" 
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      router.pathname === '/licenses' 
                        ? 'border-indigo-500 text-gray-900' 
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    My Licenses
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {isConnected ? (
              <div className="flex items-center space-x-4">
                <span className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full">
                  {formatAddress(account as string)}
                </span>
                <button
                  onClick={disconnectWallet}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 