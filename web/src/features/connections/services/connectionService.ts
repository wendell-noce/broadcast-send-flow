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
import type { Connection } from '../../../shared/types'

const COL = 'connections'

export const subscribeConnections = (
  userId: string,
  callback: (connections: Connection[]) => void
) => {
  const q = query(collection(db, COL), where('userId', '==', userId))
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Connection))
    callback(data)
  })
}

export const addConnection = (userId: string, name: string) =>
  addDoc(collection(db, COL), { userId, name, createdAt: serverTimestamp() })

export const updateConnection = (id: string, name: string) =>
  updateDoc(doc(db, COL, id), { name })

export const deleteConnection = (id: string) =>
  deleteDoc(doc(db, COL, id))