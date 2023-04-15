import styled from 'styled-components';
import Image from 'next/image';
import WhatsAppLogo from '../assets/whatsapplogo.png';
import CircularProgress from '@mui/material/CircularProgress';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;
const Loading = () => {
  return (
    <StyledContainer>
      <CircularProgress />
    </StyledContainer>
  );
};

export default Loading;
