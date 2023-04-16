import {
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
  collection,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { IMessage } from '../types';

export const generateQueryGetMessages = (conversationId?: string) =>
  query(
    collection(db, 'messages'),
    where('conversation_id', '==', conversationId),
    orderBy('send_at', 'asc')
  );

export const transformMessage = (message: QueryDocumentSnapshot<DocumentData>) =>
  ({
    id: message.id,
    ...(message.data() as Omit<IMessage, 'id' | 'send_at'>),
    send_at: message.data().send_at
      ? convertFirestoreTimestampToString(message.data().send_at as Timestamp)
      : null,
  } as IMessage);

export const convertFirestoreTimestampToString = (time: Timestamp) =>
  new Date(time.toDate().getTime()).toLocaleString();
