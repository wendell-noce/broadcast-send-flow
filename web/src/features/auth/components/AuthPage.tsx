import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, CircularProgress, TextField } from '@mui/material'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { signIn, signUp } from '../services/authService'

const schema = z.object({
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

type FormData = z.infer<typeof schema>

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    setLoading(true)
    try {
      if (isLogin) {
        await signIn(data.email, data.password)
      } else {
        await signUp(data.email, data.password)
      }
    } catch (err: any) {
      const messages: Record<string, string> = {
        'auth/user-not-found': 'Usuário não encontrado',
        'auth/wrong-password': 'Senha incorreta',
        'auth/email-already-in-use': 'E-mail já cadastrado',
        'auth/invalid-credential': 'E-mail ou senha incorretos',
      }
      setError(messages[err.code] ?? 'Erro ao autenticar, tente novamente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">

        <div className="flex items-center justify-center gap-3 mb-6">
          <img src="/zapflow-logo.png" alt="ZapFlow" className="w-10 h-10" />
          <div>
            <h1 className="text-lg font-medium text-gray-900 dark:text-white">ZapFlow</h1>
            <p className="text-xs text-gray-400">Sistema de disparo em massa</p>
          </div>
        </div>

        <h2 className="text-base font-medium text-gray-900 dark:text-white mb-1">
          {isLogin ? 'Entrar na conta' : 'Criar conta'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {isLogin ? 'Acesse seu espaço ZapFlow' : 'Comece a usar o ZapFlow'}
        </p>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <TextField
            label="E-mail"
            type="email"
            fullWidth
            size="small"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            label="Senha"
            type="password"
            fullWidth
            size="small"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{ borderRadius: 2, py: 1.2 }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : isLogin ? 'Entrar' : 'Criar conta'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          {isLogin ? 'Não tem conta?' : 'Já tem conta?'}{' '}
          <span
            className="text-indigo-500 cursor-pointer hover:underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? 'Criar agora' : 'Entrar'}
          </span>
        </p>
      </div>
    </div>
  )
}