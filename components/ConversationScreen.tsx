import CancelIcon from '@mui/icons-material/Cancel';
import MicIcon from '@mui/icons-material/Mic';
import SendIcon from '@mui/icons-material/Send';
import StopCircleIcon from '@mui/icons-material/StopCircle';
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
  LinearProgress,
} from '@mui/material';
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { useRouter } from 'next/router';
import {
  KeyboardEventHandler,
  MouseEventHandler,
  useRef,
  useState,
} from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection } from 'react-firebase-hooks/firestore';
import styled from 'styled-components';
import { auth, db } from '../config/firebase';
import { useRecipient } from '../hooks/useRecipient';
import { Conversation, IMessage, MessageType } from '../types';
import {
  convertFirestoreTimestampToString,
  generateQueryGetMessages,
  transformMessage,
} from '../utils/getMessagesInConversation';
import Message from './Message';
import RecipientAvatar from './RecipientAvatar';

const StyledRecipientHeader = styled.div`
  position: sticky;
  background-color: white;
  z-index: 100;
  top: 0;
  display: flex;
  align-items: center;
  padding: 15px;
  height: 80px;
  border-bottom: 1px solid whitesmoke;
`;

const StyledHeaderInfo = styled.div`
  flex-grow: 1;
  > h3 {
    margin-top: 0;
    margin-bottom: 3px;
  }
  > span {
    font-size: 14px;
    color: gray;
  }
`;

const StyledH3 = styled.h3`
  word-break: break-all;
`;

const StyledHeaderIcons = styled.div`
  display: flex;
`;

const StyledMessageContainer = styled.div`
  padding: 30px;
  background-color: #e5ded8;
  min-height: 90vh;
`;

const StyledInputContainer = styled.form`
  display: flex;
  align-items: center;
  padding: 10px;
  position: sticky;
  bottom: 0;
  background-color: white;
  z-index: 100;
`;

const StyledInput = styled.input`
  flex-grow: 1;
  outline: none;
  border: none;
  border-radius: 10px;
  background-color: whitesmoke;
  padding: 15px;
  margin-left: 15px;
  margin-right: 15px;
`;

const StyledVoiceProcess = styled(LinearProgress)`
  height: 30px;
  width: 100%;
  border-radius: 15px;
`;

const EndOfMessagesForAutoScroll = styled.div`
  margin-bottom: 30px;
`;

const ConversationScreen = ({
  conversation,
  messages,
}: {
  conversation: Conversation;
  messages: IMessage[];
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [loggedInUser, _loading, _error] = useAuthState(auth);

  const conversationUsers = conversation.users;
  const { recipientEmail, recipient } = useRecipient(conversationUsers);

  const router = useRouter();
  const conversationId = router.query.id; // localhost:3000/conversations/:id

  const queryGetMessages = generateQueryGetMessages(conversationId as string);
  const [messagesSnapshot, messagesLoading, __error] =
    useCollection(queryGetMessages);

  //voice recorder state
  const [openDialog, setOpenDialog] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isReviewingVoice, setIsReviewingVoice] = useState(false);
  const [processValue, setProcessValue] = useState(0);
  const [audioUrl, setAudioUrl] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  //voice component ref
  const stopBtn = useRef<HTMLButtonElement | null>(null);
  const cancelBtn = useRef<HTMLButtonElement | null>(null);
  const showMessages = () => {
    if (messagesLoading) {
      return messages.map((message) => (
        <Message
          key={message.id}
          message={message}
        />
      ));
    }

    if (messagesSnapshot) {
      return messagesSnapshot.docs.map((message) => (
        <Message
          key={message.id}
          message={transformMessage(message)}
        />
      ));
    }

    return null;
  };

  const addMessageToDbAndUpdateLastSeen = async (messageType: MessageType) => {
    // update last seen in 'users' collection
    await setDoc(
      doc(db, 'users', loggedInUser?.uid as string),
      {
        lastSeen: serverTimestamp(),
      },
      { merge: true }
    ); // just update what is changed

    // add new message to 'messages' collection
    if (messageType === MessageType.Text) {
      await addDoc(collection(db, 'messages'), {
        conversation_id: conversationId,
        send_at: serverTimestamp(),
        text: newMessage,
        user: loggedInUser?.email,
      });
    }

    if (messageType === MessageType.Audio) {
      const storage = getStorage();
      const storageRef = ref(
        storage,
        `audios/${loggedInUser?.uid + new Date().getTime().toString()}`
      );
      const audioSnapshot = await uploadBytes(storageRef, audioBlob as Blob);
      const audioDownloadUrl = await getDownloadURL(audioSnapshot.ref);

      await addDoc(collection(db, 'messages'), {
        conversation_id: conversationId,
        send_at: serverTimestamp(),
        audioUrl: audioDownloadUrl,
        user: loggedInUser?.email,
      });

      handleCloseVoiceRecorder();
    }

    // reset input field
    setNewMessage('');

    // scroll to bottom
    scrollToBottom();
  };

  const sendMessageOnEnter: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (!newMessage) return;
      addMessageToDbAndUpdateLastSeen(MessageType.Text);
    }
  };

  const sendMessageOnClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    if (!newMessage) return;
    addMessageToDbAndUpdateLastSeen(MessageType.Text);
  };

  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  //voice recorder
  const handleCloseVoiceRecorder = () => {
    setIsRecordingVoice(false);
    setIsReviewingVoice(false);
    setProcessValue(0);
    setAudioUrl('');
    setAudioBlob(null);
  };

  const voiceRecorder = () => {
    setIsRecordingVoice(true);

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (stream) {
        const timer = setInterval(() => {
          setProcessValue((prev) => prev + 0.1);
        }, 100);

        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks: BlobPart[] = [];
        mediaRecorder.addEventListener('dataavailable', function (event) {
          audioChunks.push(event.data);
        });

        if (stopBtn.current) {
          stopBtn.current.onclick = () => {
            clearInterval(timer);
            mediaRecorder.stop();
            setIsReviewingVoice(true);
          };
        }

        if (cancelBtn.current) {
          cancelBtn.current.onclick = () => {
            clearInterval(timer);
            handleCloseVoiceRecorder();
          };
        }

        mediaRecorder.addEventListener('stop', function () {
          const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
          setAudioBlob(audioBlob);
          setAudioUrl(URL.createObjectURL(audioBlob));
        });
        mediaRecorder.start();
      })
      .catch((err) => {
        setOpenDialog(true);
      });
  };

  const sendAudioMessageOnClick: MouseEventHandler<HTMLButtonElement> = async (
    event
  ) => {
    event.preventDefault();
    if (!setIsReviewingVoice) await stopBtn.current?.click();
    if (!audioBlob) return;
    addMessageToDbAndUpdateLastSeen(MessageType.Audio);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  return (
    <>
      <StyledRecipientHeader>
        <RecipientAvatar
          recipient={recipient}
          recipientEmail={recipientEmail}
        />

        <StyledHeaderInfo>
          <StyledH3>{recipient ? recipient.name : recipientEmail}</StyledH3>
          {recipient && (
            <span>
              Last active:{' '}
              {convertFirestoreTimestampToString(recipient.lastSeen)}
            </span>
          )}
          {!recipient && <span>Unregistered user</span>}
        </StyledHeaderInfo>

        {/* <StyledHeaderIcons>
          <IconButton>
            <AttachFileIcon />
          </IconButton>
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </StyledHeaderIcons> */}
      </StyledRecipientHeader>

      <StyledMessageContainer>
        {showMessages()}
        <EndOfMessagesForAutoScroll ref={endOfMessagesRef} />
      </StyledMessageContainer>

      {/*send Text*/}
      {!isRecordingVoice && (
        <StyledInputContainer>
          {/* <InsertEmoticonIcon /> */}
          <StyledInput
            value={newMessage}
            onChange={(event) => setNewMessage(event.target.value)}
            onKeyDown={sendMessageOnEnter}
          />
          <IconButton
            onClick={sendMessageOnClick}
            disabled={!newMessage}
          >
            <SendIcon />
          </IconButton>
          <IconButton onClick={voiceRecorder}>
            <MicIcon />
          </IconButton>
        </StyledInputContainer>
      )}

      {/*send voice*/}
      {isRecordingVoice && (
        <StyledInputContainer>
          {/* <InsertEmoticonIcon /> */}
          <IconButton ref={cancelBtn}>
            <CancelIcon />
          </IconButton>

          {/*stop recording*/}
          {!isReviewingVoice && (
            <>
              <IconButton ref={stopBtn}>
                <StopCircleIcon />
              </IconButton>
              <StyledVoiceProcess
                color="inherit"
                variant="determinate"
                value={(processValue * 100) / 60}
              />
              {/*recording chip*/}
              <Chip
                style={{ marginLeft: '10px' }}
                label={
                  '0:' +
                  (processValue < 10
                    ? '0' + Math.round(processValue)
                    : Math.round(processValue))
                }
              />
            </>
          )}

          {/*play|pause review voice*/}
          {isReviewingVoice && (
            <audio
              style={{ width: '100%' }}
              controls
              src={audioUrl}
            />
          )}

          <IconButton onClick={sendAudioMessageOnClick}>
            <SendIcon />
          </IconButton>
        </StyledInputContainer>
      )}

      {/*error notify: micro access permission denied*/}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
      >
        <DialogTitle>
          {"You haven't allowed Chat-app access to your microphone"}
        </DialogTitle>
        <DialogActions>
          <Button onClick={handleCloseDialog}>CLOSE</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ConversationScreen;
