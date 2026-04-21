import type { AppProps } from 'next/app';
import Layout from '../components/Layout';
import '../styles/globals.css';
import { useRouter } from 'next/router';

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Pages where layout should NOT be shown
  const noLayoutRoutes = ['/login', '/signup'];

  if (noLayoutRoutes.includes(router.pathname)) {
    return <Component {...pageProps} />;
  }

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}