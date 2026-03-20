import {
  Brightness4, Brightness7,
  LinkOutlined,
  LogoutOutlined,
  MenuOutlined,
  PeopleOutlined, SendOutlined
} from '@mui/icons-material'
import {
  Drawer,
  IconButton, Tooltip,
  useMediaQuery, useTheme
} from '@mui/material'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { logOut } from '../../features/auth/services/authService'
import { useConnections } from '../../features/connections/hooks/useConnections'
import { useThemeMode } from '../lib/ThemeContext'

export const DashboardLayout = () => {
  const { user } = useAuth()
  const { connections } = useConnections()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { mode, toggleTheme } = useThemeMode()

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'US'

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#1a1a2e]">
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <img src="/zapflow-logo.png" alt="ZapFlow" className="w-6 h-6" />
          <span className="text-white text-sm font-medium">ZapFlow</span>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-white/10">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Canais</p>
        {connections.length === 0 ? (
          <p className="text-xs text-gray-500 italic">Nenhum canal</p>
        ) : (
          <div className="flex flex-col gap-1">
            {connections.map((conn) => (
              <div key={conn.id} className="flex items-center gap-2 py-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                <span className="text-xs text-gray-300 truncate">{conn.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <nav className="flex-1 py-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-4">Menu</p>
        {[
          { to: '/connections', icon: <LinkOutlined fontSize="small" />, label: 'Canais' },
          { to: '/contacts', icon: <PeopleOutlined fontSize="small" />, label: 'Contatos' },
          { to: '/messages', icon: <SendOutlined fontSize="small" />, label: 'Mensagens' },
        ].map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 text-sm transition-all ${
                isActive
                  ? 'text-indigo-400 bg-white/5 border-l-2 border-indigo-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            {icon} {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs text-white font-medium">
            {initials}
          </div>
          <span className="text-xs text-gray-400 flex-1 truncate">{user?.email}</span>
          <Tooltip title="Sair">
            <IconButton size="small" onClick={logOut} sx={{ color: '#6b7280' }}>
              <LogoutOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </div>
  )

  return (
    <div className={`flex h-screen ${mode === 'dark' ? 'dark' : ''}`}
      style={{ colorScheme: mode }}
    >
      {isMobile ? (
        <Drawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          PaperProps={{ sx: { width: 224, background: 'transparent' } }}
        >
          {sidebarContent}
        </Drawer>
      ) : (
        <aside className="w-56 min-w-56">
          {sidebarContent}
        </aside>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center px-4 gap-3">
          {isMobile && (
            <IconButton size="small" onClick={() => setMobileOpen(true)}>
              <MenuOutlined fontSize="small" />
            </IconButton>
          )}
          <span className="flex-1 text-sm font-medium text-gray-800 dark:text-white">ZapFlow</span>
          <Tooltip title={mode === 'dark' ? 'Modo claro' : 'Modo escuro'}>
            <IconButton size="small" onClick={toggleTheme}>
              {mode === 'dark' ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
            </IconButton>
          </Tooltip>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}