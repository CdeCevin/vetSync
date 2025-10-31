// hooks/use-alert-store.ts
import { create } from 'zustand'

// Define los tipos de alerta que tendrás
type AlertType = 'success' | 'error' | 'info'

// Define la "forma" de tu store
interface AlertStore {
  isOpen: boolean
  title: string
  message: string
  type: AlertType
  onOpen: (title: string, message: string, type?: AlertType) => void
  onClose: () => void
}

// Crea el hook
export const useAlertStore = create<AlertStore>((set) => ({
  isOpen: false,
  title: '',
  message: '',
  type: 'info',
  
  // Función para ABRIR el modal con un mensaje
  onOpen: (title, message, type = 'info') => set({ 
    isOpen: true, 
    title, 
    message, 
    type 
  }),
  
  // Función para CERRAR el modal
  onClose: () => set({ isOpen: false, title: '', message: '' }),
}))