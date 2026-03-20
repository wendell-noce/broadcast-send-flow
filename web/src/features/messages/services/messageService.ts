import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp, Timestamp,
  updateDoc,
  where
} from 'firebase/firestore'
import { db } from '../../../shared/lib/firrebase'
import type { Message } from '../../../shared/types'

const COL = 'messages'

export const subscribeMessages = (
  userId: string,
  connectionId: string,
  callback: (messages: Message[]) => void
) => {
  const q = query(
    collection(db, COL),
    where('userId', '==', userId),
    where('connectionId', '==', connectionId)
  )
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message))
    callback(data)
  })
}

export const addMessage = (
  userId: string,
  connectionId: string,
  contactIds: string[],
  text: string,
  scheduledAt: Date
) =>
  addDoc(collection(db, COL), {
    userId,
    connectionId,
    contactIds,
    text,
    status: 'scheduled',
    scheduledAt: Timestamp.fromDate(scheduledAt),
    sentAt: null,
    createdAt: serverTimestamp(),
  })

export const updateMessage = (
  id: string,
  contactIds: string[],
  text: string,
  scheduledAt: Date
) =>
  updateDoc(doc(db, COL, id), {
    contactIds,
    text,
    scheduledAt: Timestamp.fromDate(scheduledAt),
  })

export const deleteMessage = (id: string) =>
  deleteDoc(doc(db, COL, id))

export const sendMessageNow = (
  userId: string,
  connectionId: string,
  contactIds: string[],
  text: string
) =>
  addDoc(collection(db, COL), {
    userId,
    connectionId,
    contactIds,
    text,
    status: 'sent',
    scheduledAt: serverTimestamp(),
    sentAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  })