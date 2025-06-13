import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { Web3Provider } from '../src/context/Web3Context';
import Layout from '../src/components/layout/Layout';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Web3Provider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </Web3Provider>
  );
} 