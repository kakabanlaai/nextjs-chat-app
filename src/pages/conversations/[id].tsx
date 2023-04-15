import { doc, getDoc } from 'firebase/firestore';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useAuthState } from 'react-firebase-hooks/auth';
import styled from 'styled-components';
import Sidebar from '../../../components/Sidebar';
import { auth, db } from '../../../config/firebase';
import { Conversation } from '../../../types';
import { getRecipientEmail } from '../../../utils/getRecipientEmail';

interface Props {
  conversation: Conversation;
}

const StyledContainer = styled.div`
  display: flex;
`;
const Conversation = ({ conversation }: Props) => {
  const [loggedInUser, __loading, __error] = useAuthState(auth);
  return (
    <StyledContainer>
      <Head>
        <title>
          Conversation with {getRecipientEmail(conversation.users, loggedInUser)}
        </title>
      </Head>
      <Sidebar />
      <h1>message</h1>
    </StyledContainer>
  );
};

export default Conversation;

export const getServerSideProps: GetServerSideProps<
  Props,
  { id: string }
> = async (context) => {
  const conversationId = context.params?.id;

  const conversationRef = doc(db, 'conversations', conversationId as string);
  const conversationSnapshot = await getDoc(conversationRef);

  return {
    props: {
      conversation: conversationSnapshot.data() as Conversation,
    },
  };
};
