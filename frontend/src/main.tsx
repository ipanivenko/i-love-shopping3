import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'sonner';

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster position="top-right" richColors closeButton />
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </BrowserRouter>
)