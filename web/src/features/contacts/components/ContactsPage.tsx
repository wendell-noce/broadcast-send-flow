import { zodResolver } from '@hookform/resolvers/zod'
import { AddOutlined, DeleteOutlined, EditOutlined, PhoneOutlined } from '@mui/icons-material'
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem, Select,
  TextField,
  Tooltip
} from '@mui/material'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { IMaskInput } from 'react-imask'
import { z } from 'zod'
import { useAuth } from '../../auth/hooks/useAuth'
import { useConnections } from '../../connections/hooks/useConnections'
import { useContacts } from '../hooks/useContact'
import { addContact, deleteContact, updateContact } from '../services/contactService'

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  phone: z.string().min(14, 'Telefone inválido — ex: (85) 99999-0000'),
})

type FormData = z.infer<typeof schema>

const PhoneMaskInput = ({ onChange, value, inputRef, ...other }: any) => (
  <IMaskInput
    {...other}
    mask="(00) 00000-0000"
    value={value}
    inputRef={inputRef}
    onAccept={(val: string) => onChange({ target: { value: val } })}
    overwrite
  />
)

export const ContactsPage = () => {
  const { user } = useAuth()
  const { connections } = useConnections()
  const [selectedConnection, setSelectedConnection] = useState('')
  const { contacts, loading } = useContacts(selectedConnection)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)

  const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    if (!user || !selectedConnection) return
    try {
      if (editing) {
        await updateContact(editing, data.name, data.phone)
        toast.success('Contato atualizado!')
      } else {
        await addContact(user.uid, selectedConnection, data.name, data.phone)
        toast.success('Contato criado!')
      }
      handleClose()
    } catch {
      toast.error('Erro ao salvar contato.')
    }
  }

  const handleEdit = (id: string, currentName: string, currentPhone: string) => {
    setEditing(id)
    setValue('name', currentName)
    setValue('phone', currentPhone)
    setOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Deseja excluir este contato?')) {
      await deleteContact(id)
      toast.success('Contato excluído!')
    }
  }

  const handleClose = () => {
    setOpen(false)
    reset()
    setEditing(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-medium text-gray-900 dark:text-white">Contatos</h1>
          <p className="text-sm text-gray-500">Gerencie seus contatos por canal</p>
        </div>
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={() => setOpen(true)}
          disabled={!selectedConnection}
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          Novo contato
        </Button>
      </div>

      <FormControl size="small" sx={{ minWidth: 240, mb: 3 }}>
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

      {!selectedConnection ? (
        <div className="text-center mt-12 text-gray-400">
          <p className="text-sm">Selecione um canal para ver os contatos.</p>
        </div>
      ) : loading ? (
        <div className="flex justify-center mt-12">
          <CircularProgress />
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center mt-12 text-gray-400">
          <p className="text-sm">Nenhum contato cadastrado neste canal.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-5 py-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xs font-medium text-indigo-600 dark:text-indigo-300">
                  {contact.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{contact.name}</p>
                  <p className="text-xs text-gray-500">{contact.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Tooltip title="Editar">
                  <IconButton size="small" onClick={() => handleEdit(contact.id, contact.name, contact.phone)}>
                    <EditOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Excluir">
                  <IconButton size="small" color="error" onClick={() => handleDelete(contact.id)}>
                    <DeleteOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle>{editing ? 'Editar contato' : 'Novo contato'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <div className="flex flex-col gap-4 mt-2">
              <TextField
                autoFocus
                label="Nome"
                fullWidth
                size="small"
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Telefone"
                    fullWidth
                    size="small"
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                    InputProps={{
                      inputComponent: PhoneMaskInput,
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneOutlined fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancelar</Button>
            <Button type="submit" variant="contained">Salvar</Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  )
}