import { useEffect, useState } from 'react'
import type { Message } from '../../../shared/types'
import { useAuth } from '../../auth/hooks/useAuth'
import { subscribeMessages } from '../services/messageService'

export const useMessages = (connectionId: string) => {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || !connectionId) return
    const unsubscribe = subscribeMessages(user.uid, connectionId, (data) => {
      setMessages(data)
      setLoading(false)
    })
    return unsubscribe
  }, [user, connectionId])

  return { messages, loading }
}