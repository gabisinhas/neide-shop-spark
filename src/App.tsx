import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CartProvider } from './contexts/CartContext'
import { TooltipProvider } from '../src/presentation/components/ui/tooltip'
import { Toaster } from '../src/presentation/components/ui/toaster'
import Index from './presentation/pages/Index'
import Admin from './presentation/pages/Admin'
import NotFound from './presentation/pages/NotFound'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <TooltipProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </TooltipProvider>
      </CartProvider>
    </QueryClientProvider>
  )
}

export default App