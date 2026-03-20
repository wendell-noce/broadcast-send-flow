# ZapFlow — Sistema de Disparo em Massa

> Plataforma SaaS para gerenciamento e disparo de mensagens em massa, com suporte a agendamento e envio em tempo real.

🔗 **Acesso:** [https://broadcast-send-flow.web.app](https://broadcast-send-flow.web.app)

---

## Tecnologias

### Frontend
- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) — bundler
- [Material UI](https://mui.com/) — componentes
- [Tailwind CSS](https://tailwindcss.com/) — estilização
- [React Router DOM](https://reactrouter.com/) — roteamento
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) — formulários e validação
- [React Hot Toast](https://react-hot-toast.com/) — notificações
- [React iMask](https://imask.js.org/) — máscaras de input

### Backend
- [Firebase Authentication](https://firebase.google.com/docs/auth) — autenticação
- [Cloud Firestore](https://firebase.google.com/docs/firestore) — banco de dados em tempo real
- [Firebase Cloud Functions](https://firebase.google.com/docs/functions) — agendador de mensagens
- [Firebase Hosting](https://firebase.google.com/docs/hosting) — hospedagem

---

## Funcionalidades

- 🔐 Autenticação com e-mail e senha
- 🔗 CRUD de canais de envio
- 👥 CRUD de contatos por canal
- 💬 CRUD de mensagens com agendamento
- ⚡ Envio imediato de mensagens
- 🕐 Disparo automático de mensagens agendadas via Cloud Function
- 🔴 Dados em tempo real com Firestore `onSnapshot`
- 🌙 Tema dark/light com persistência
- 📱 Layout responsivo com drawer no mobile
- 🔒 Isolamento multi-tenant por usuário

---

## Arquitetura

O projeto está dividido em duas pastas principais:

```
broadcast-send-flow/
  ├── functions/        # Cloud Functions (Node.js + TypeScript)
  └── web/              # Frontend (React + Vite + TypeScript)
```

### Frontend — Feature-based

```
web/src/
  ├── features/
  │   ├── auth/
  │   │   ├── components/   # AuthPage
  │   │   ├── hooks/        # useAuth
  │   │   └── services/     # authService
  │   ├── connections/
  │   │   ├── components/   # ConnectionsPage
  │   │   ├── hooks/        # useConnections
  │   │   └── services/     # connectionService
  │   ├── contacts/
  │   │   ├── components/   # ContactsPage
  │   │   ├── hooks/        # useContacts
  │   │   └── services/     # contactService
  │   └── messages/
  │       ├── components/   # MessagesPage
  │       ├── hooks/        # useMessages
  │       └── services/     # messageService
  ├── shared/
  │   ├── components/       # DashboardLayout
  │   ├── lib/              # firebase, ThemeContext, AppThemeProvider
  │   └── types/            # tipos globais TypeScript
  └── pages/                # AppRoutes
```

### Modelagem de dados (Firestore)

Todas as coleções são raiz — sem subcoleções. O isolamento multi-tenant é feito pelo campo `userId` em cada documento.

**`connections`**
```
id, userId, name, createdAt
```

**`contacts`**
```
id, userId, connectionId, name, phone, createdAt
```

**`messages`**
```
id, userId, connectionId, contactIds[], text, status, scheduledAt, sentAt, createdAt
```

### Cloud Function

A função `processScheduledMessages` roda a cada 1 minuto e atualiza todas as mensagens com `status == "scheduled"` e `scheduledAt <= now` para `status == "sent"`.

---

## Instalação e execução local

### Pré-requisitos

- Node.js v20.19+
- Firebase CLI instalado globalmente

```bash
npm install -g firebase-tools
firebase login
```

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/broadcast-send-flow.git
cd broadcast-send-flow
```

### 2. Configure o Firebase

Crie um projeto no [Firebase Console](https://console.firebase.google.com/) e ative:
- Authentication (e-mail/senha)
- Firestore Database
- Cloud Functions (requer plano Blaze)

### 3. Configure as variáveis do frontend

Atualize o arquivo `web/src/shared/lib/firebase.ts` com as credenciais do seu projeto:

```ts
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
}
```

### 4. Instale as dependências

```bash
# Frontend
cd web
npm install

# Functions
cd ../functions
npm install
```

### 5. Execute localmente

```bash
# Frontend
cd web
npm run dev

# Emuladores Firebase (opcional)
cd ..
firebase emulators:start
```

### 6. Deploy

```bash
# Frontend
cd web && npm run build && cd ..
firebase deploy --only hosting

# Cloud Functions
firebase deploy --only functions

# Regras e índices
firebase deploy --only firestore
```

---

## Segurança

As Firestore Security Rules garantem que cada usuário acessa apenas seus próprios documentos:

```
allow read, write: if request.auth != null
  && request.auth.uid == resource.data.userId;
```

---

## Licença

MIT