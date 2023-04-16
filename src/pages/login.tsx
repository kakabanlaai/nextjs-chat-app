import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Button from '@mui/material/Button';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuthState, useSignInWithGoogle } from 'react-firebase-hooks/auth';
import styled from 'styled-components';
import { auth } from '../../config/firebase';

const StyledContainer = styled.div`
  height: 100vh;
  display: grid;
  place-items: center;
  background-color: whitesmoke;
`;

const StyledLoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100px;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
`;

const StyledLogoWrapper = styled.div`
  margin-bottom: 50px;
`;

const Login = () => {
  const [signInWithGoogle, _user, _loading] = useSignInWithGoogle(auth);
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  if (user) router.push('/');

  const signIn = () => {
    signInWithGoogle();
  };

  return (
    <StyledContainer>
      <Head>
        <title>Login</title>
      </Head>

      <StyledLoginContainer>
        <StyledLogoWrapper>
          <WhatsAppIcon style={{ width: '150px', height: '150px' }} />
        </StyledLogoWrapper>

        <Button
          variant="outlined"
          onClick={signIn}
        >
          Sign in with Google
        </Button>
      </StyledLoginContainer>
    </StyledContainer>
  );
};

export default Login;
