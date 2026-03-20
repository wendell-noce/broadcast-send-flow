export interface Connection {
  id: string
  userId: string
  name: string
  createdAt: Date
}

export interface Contact {
  id: string
  userId: string
  connectionId: string
  name: string
  phone: string
  createdAt: Date
}

export type MessageStatus = 'scheduled' | 'sent'

export interface Message {
  id: string
  userId: string
  connectionId: string
  contactIds: string[]
  text: string
  status: MessageStatus
  scheduledAt: Date
  sentAt: Date | null
  createdAt: Date
}