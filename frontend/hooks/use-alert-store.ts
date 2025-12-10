// hooks/use-alert-store.ts
import { create } from 'zustand'

type AlertType = 'success' | 'error' | 'info'
interface AlertStore {
  isOpen: boolean
  title: string
  message: string
  type: AlertType
  onOpen: (title: string, message: string, type?: AlertType) => void
  onClose: () => void
}

export const useAlertStore = create<AlertStore>((set) => ({
  isOpen: false,
  title: '',
  message: '',
  type: 'info',
  
  onOpen: (title, message, type = 'info') => set({ 
    isOpen: true, 
    title, 
    message, 
    type 
  }),
  
  onClose: () => set({ isOpen: false, title: '', message: '' }),
}))