"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Info } from "lucide-react" // Íconos

// 1. Importa el store
import { useAlertStore } from "@/hooks/use-alert-store"

export function AlertModal() {
  // 2. Lee el estado y las funciones del store
  const { isOpen, title, message, type, onClose } = useAlertStore()

  // (Esto es para evitar errores de hidratación con Next.js)
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  // 3. Elige ícono y color según el tipo de alerta
  const Icon = type === 'success' ? CheckCircle : type === 'error' ? XCircle : Info
  const color = type === 'success' ? 'text-green-600' : type === 'error' ? 'text-red-600' : 'text-blue-600'

  return (
    // 4. El Dialog se controla con el 'isOpen' y 'onClose' del store
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center text-center">
          {/* 5. Muestra el ícono, título y mensaje del store */}
          <Icon className={`w-16 h-16 mb-4 ${color}`} />
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          <DialogDescription className="text-lg">
            {message}
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center pt-4">
          <Button onClick={onClose}>
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}