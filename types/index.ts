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

export enum MessageType {
  Text,
  Audio,
}

export interface IMessage {
  id: string;
  conversation_id: string;
  text: string;
  audioUrl: string;
  send_at: string;
  user: string;
}
