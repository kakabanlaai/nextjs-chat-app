import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import Loading from '../../components/Loading';
import { auth, db } from '../../config/firebase';
import '../styles/globalStyle.css';
import Login from './login';

export default function App({ Component, pageProps }: AppProps) {
  const [user, loading, _error] = useAuthState(auth);

  useEffect(() => {
    const setUserInDb = async () => {
      try {
        await setDoc(doc(db, 'users', user?.uid as string), {
          name: user?.displayName,
          email: user?.email,
          lastSeen: serverTimestamp(),
          photoUrl: user?.photoURL,
        });
      } catch (error) {
        console.log('ERROR SETTING USER INFO IN DB', error);
      }
    };

    if (user) setUserInDb();
  }, [user]);

  if (loading) return <Loading />;

  if (!user) return <Login />;

  return <Component {...pageProps} />;
}
