import { zodResolver } from '@hookform/resolvers/zod'
import { AddOutlined, DeleteOutlined, EditOutlined } from '@mui/icons-material'
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip
} from '@mui/material'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { useAuth } from '../../auth/hooks/useAuth'
import { useConnections } from '../hooks/useConnections'
import {
  addConnection,
  deleteConnection,
  updateConnection
} from '../services/connectionService'

const schema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(50, 'Nome deve ter no máximo 50 caracteres'),
})

type FormData = z.infer<typeof schema>

export const ConnectionsPage = () => {
  const { user } = useAuth()
  const { connections, loading } = useConnections()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    if (!user) return
    try {
      if (editing) {
        await updateConnection(editing, data.name)
        toast.success('Canal atualizado!')
      } else {
        await addConnection(user.uid, data.name)
        toast.success('Canal criado!')
      }
      reset()
      setEditing(null)
      setOpen(false)
    } catch {
      toast.error('Erro ao salvar canal.')
    }
  }

  const handleEdit = (id: string, currentName: string) => {
    setEditing(id)
    setValue('name', currentName)
    setOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Deseja excluir este canal?')) {
      await deleteConnection(id)
      toast.success('Canal excluído!')
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
          <h1 className="text-lg font-medium text-gray-900 dark:text-white">Canais</h1>
          <p className="text-sm text-gray-500">Gerencie seus canais de envio</p>
        </div>
        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={() => setOpen(true)}
          sx={{ textTransform: 'none', borderRadius: 2 }}
        >
          Novo canal
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center mt-12">
          <CircularProgress />
        </div>
      ) : connections.length === 0 ? (
        <div className="text-center mt-12 text-gray-400">
          <p className="text-sm">Nenhum canal cadastrado ainda.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {connections.map((conn) => (
            <div
              key={conn.id}
              className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-5 py-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  {conn.name}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Tooltip title="Editar">
                  <IconButton size="small" onClick={() => handleEdit(conn.id, conn.name)}>
                    <EditOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Excluir">
                  <IconButton size="small" color="error" onClick={() => handleDelete(conn.id)}>
                    <DeleteOutlined fontSize="small" />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle>{editing ? 'Editar canal' : 'Novo canal'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <TextField
              autoFocus
              label="Nome do canal"
              fullWidth
              size="small"
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
              sx={{ mt: 1 }}
            />
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