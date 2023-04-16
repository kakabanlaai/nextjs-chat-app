import { Timestamp } from 'firebase/firestore';

export interface Conversation {
  users: string[];
}

export interface AppUser {
  email: string;
  lastSeen: Timestamp;
  name: string;
  photoUrl: string;
}

export interface IMessage {
  id: string;
  conversation_id: string;
  text: string;
  send_at: string;
  user: string;
}
