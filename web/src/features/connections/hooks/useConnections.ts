import { useEffect, useState } from 'react'
import type { Connection } from '../../../shared/types'
import { useAuth } from '../../auth/hooks/useAuth'
import { subscribeConnections } from '../services/connectionService'

export const useConnections = () => {
  const { user } = useAuth()
  const [connections, setConnections] = useState<Connection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const unsubscribe = subscribeConnections(user.uid, (data) => {
      setConnections(data)
      setLoading(false)
    })
    return unsubscribe
  }, [user])

  return { connections, loading }
}