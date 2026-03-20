import { zodResolver } from '@hookform/resolvers/zod'
import { AddOutlined, DeleteOutlined, EditOutlined, ScheduleOutlined, SendOutlined } from '@mui/icons-material'
import {
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Tooltip
} from '@mui/material'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { useAuth } from '../../auth/hooks/useAuth'
import { useConnections } from '../../connections/hooks/useConnections'
import { useMessages } from '../hooks/useMessages'
import { addMessage, deleteMessage, sendMessageNow, updateMessage } from '../services/messageService'

import type { Message } from '../../../shared/types'
import { useContacts } from '../../contacts/hooks/useContact'

type Filter = 'all' | 'scheduled' | 'sent'

const schema = z.object({
  contactIds: z.array(z.string()).min(1, 'Selecione ao menos um contato'),
  text: z.string().min(1, 'Mensagem é obrigatória').max(1000, 'Mensagem muito longa'),
  scheduledAt: z.string().optional(),
}).refine((data) => {
  if (!data.scheduledAt) return true
  return new Date(data.scheduledAt) > new Date()
}, {
  message: 'A data deve ser no futuro',
  path: ['scheduledAt'],
})

type FormData = z.infer<typeof schema>

export const MessagesPage = () => {
  const { user } = useAuth()
  const { connections } = useConnections()
  const [selectedConnection, setSelectedConnection] = useState('')
  const { messages, loading } = useMessages(selectedConnection)
  const { contacts } = useContacts(selectedConnection)
  const [filter, setFilter] = useState<Filter>('all')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [sendNow, setSendNow] = useState(false)

  const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { contactIds: [] },
  })

  const filtered = messages.filter((m) => filter === 'all' || m.status === filter)

  const onSubmit = async (data: FormData) => {
    if (!user || !selectedConnection) return
    try {
      if (sendNow) {
        await sendMessageNow(user.uid, selectedConnection, data.contactIds, data.text)
        toast.success('Mensagem enviada com sucesso!')
      } else {
        const date = new Date(data.scheduledAt!)
        if (editing) {
          await updateMessage(editing, data.contactIds, data.text, date)
          toast.success('Mensagem atualizada!')
        } else {
          await addMessage(user.uid, selectedConnection, data.contactIds, data.text, date)
          toast.success('Mensagem agendada com sucesso!')
        }
      }
      handleClose()
    } catch {
      toast.error('Erro ao salvar mensagem.')
    }
  }

  const handleEdit = (msg: Message) => {
    setEditing(msg.id)
    setValue('text', msg.text)
    setValue('contactIds', msg.contactIds)
    const d = (msg.scheduledAt as any)?.toDate?.() ?? new Date(msg.scheduledAt)
    setValue('scheduledAt', d.toISOString().slice(0, 16))
    setOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Deseja excluir esta mensagem?')) {
      await deleteMessage(id)
      toast.success('Mensagem excluída!')
    }
  }

  const handleClose = () => {
    setOpen(false)
    reset()
    setEditing(null)
    setSendNow(false)
  }

  const formatDate = (val: any) => {
    const d = val?.toDate?.() ?? new Date(val)
    return d.toLocaleString('pt-BR')
  }

  const getContactNames = (ids: string[]) =>
    ids.map((id) => contacts.find((c) => c.id === id)?.name ?? id).join(', ')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-medium text-gray-900 dark:text-white">Mensagens</h1>
          <p className="text-sm text-gray-500">Gerencie seus disparos por canal</p>
        </div>
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={() => setOpen(true)}
          disabled={!selectedConnection}
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          Nova mensagem
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Selecione um canal</InputLabel>
          <Select
            value={selectedConnection}
            label="Selecione um canal"
            onChange={(e) => setSelectedConnection(e.target.value)}
          >
            {connections.map((conn) => (
              <MenuItem key={conn.id} value={conn.id}>{conn.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {(['all', 'scheduled', 'sent'] as Filter[]).map((f) => (
          <Chip
            key={f}
            label={f === 'all' ? 'Todas' : f === 'scheduled' ? 'Agendadas' : 'Enviadas'}
            onClick={() => setFilter(f)}
            variant={filter === f ? 'filled' : 'outlined'}
            color={filter === f ? 'primary' : 'default'}
          />
        ))}
      </div>

      {!selectedConnection ? (
        <div className="text-center mt-12 text-gray-400">
          <p className="text-sm">Selecione um canal para ver as mensagens.</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center mt-12"><CircularProgress /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center mt-12 text-gray-400">
          <p className="text-sm">Nenhuma mensagem encontrada.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((msg) => (
            <div key={msg.id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-5 py-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {msg.status === 'sent' ? (
                    <Chip label="Enviada" size="small" color="success" icon={<SendOutlined />} />
                  ) : (
                    <Chip label="Agendada" size="small" color="warning" icon={<ScheduleOutlined />} />
                  )}
                  <span className="text-xs text-gray-400">{formatDate(msg.scheduledAt)}</span>
                </div>
                <div className="flex gap-1">
                  {msg.status === 'scheduled' && (
                    <Tooltip title="Editar">
                      <IconButton size="small" onClick={() => handleEdit(msg)}>
                        <EditOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Excluir">
                    <IconButton size="small" color="error" onClick={() => handleDelete(msg.id)}>
                      <DeleteOutlined fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-200 mb-2">{msg.text}</p>
              <p className="text-xs text-gray-400">👥 {getContactNames(msg.contactIds)}</p>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Editar mensagem' : 'Nova mensagem'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <div className="flex flex-col gap-4 mt-2">
              {!editing && (
                <div className="flex gap-2">
                  <Button
                    variant={sendNow ? 'outlined' : 'contained'}
                    size="small"
                    onClick={() => setSendNow(false)}
                    startIcon={<ScheduleOutlined />}
                    sx={{ flex: 1 }}
                  >
                    Agendar
                  </Button>
                  <Button
                    variant={sendNow ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setSendNow(true)}
                    startIcon={<SendOutlined />}
                    color={sendNow ? 'success' : 'primary'}
                    sx={{ flex: 1 }}
                  >
                    Enviar agora
                  </Button>
                </div>
              )}
              <FormControl size="small" fullWidth error={!!errors.contactIds}>
                <InputLabel>Contatos</InputLabel>
                <Controller
                  name="contactIds"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      multiple
                      label="Contatos"
                      renderValue={(ids) => getContactNames(ids as string[])}
                    >
                      {contacts.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          <Checkbox checked={field.value?.includes(c.id)} />
                          <ListItemText primary={c.name} secondary={c.phone} />
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                />
                {errors.contactIds && (
                  <FormHelperText>{errors.contactIds.message}</FormHelperText>
                )}
              </FormControl>

              <TextField
                label="Mensagem"
                fullWidth
                size="small"
                multiline
                rows={3}
                {...register('text')}
                error={!!errors.text}
                helperText={errors.text?.message}
              />

              {!sendNow && (
                <TextField
                  label="Agendar para"
                  type="datetime-local"
                  fullWidth
                  size="small"
                  {...register('scheduledAt')}
                  error={!!errors.scheduledAt}
                  helperText={errors.scheduledAt?.message}
                  InputLabelProps={{ shrink: true }}
                />
              )}

              
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button type="submit" variant="contained" color={sendNow ? 'success' : 'primary'}>
              {sendNow ? 'Enviar agora' : 'Salvar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  )
}