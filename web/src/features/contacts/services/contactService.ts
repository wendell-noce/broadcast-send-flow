import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    serverTimestamp,
    updateDoc,
    where
} from 'firebase/firestore'
import { db } from '../../../shared/lib/firrebase'
import type { Contact } from '../../../shared/types'

const COL = 'contacts'

export const subscribeContacts = (
  userId: string,
  connectionId: string,
  callback: (contacts: Contact[]) => void
) => {
  const q = query(
    collection(db, COL),
    where('userId', '==', userId),
    where('connectionId', '==', connectionId)
  )
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Contact))
    callback(data)
  })
}

export const addContact = (userId: string, connectionId: string, name: string, phone: string) =>
  addDoc(collection(db, COL), { userId, connectionId, name, phone, createdAt: serverTimestamp() })

export const updateContact = (id: string, name: string, phone: string) =>
  updateDoc(doc(db, COL, id), { name, phone })

export const deleteContact = (id: string) =>
  deleteDoc(doc(db, COL, id))