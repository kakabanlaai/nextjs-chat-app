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
