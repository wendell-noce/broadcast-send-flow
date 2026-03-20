import { useEffect, useState } from 'react'
import type { Contact } from '../../../shared/types'
import { useAuth } from '../../auth/hooks/useAuth'
import { subscribeContacts } from '../services/contactService'

export const useContacts = (connectionId: string) => {
  const { user } = useAuth()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !connectionId) return
    const unsubscribe = subscribeContacts(user.uid, connectionId, (data) => {
      setContacts(data)
      setLoading(false)
    })
    return unsubscribe
  }, [user, connectionId])

  return { contacts, loading }
}