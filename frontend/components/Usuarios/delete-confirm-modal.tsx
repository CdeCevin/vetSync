"use client"

import { useState } from "react" // 1. Importar useState
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { useAlertStore } from "@/hooks/use-alert-store" // 2. Importar el store de alerta

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<any> // 3. onConfirm ahora es una promesa
   onSuccess: () => void       // 4. Añadir onSuccess (para refrescar la lista)
   userName?: string
}

export function DeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  onSuccess, // Recibir prop
  userName 
}: DeleteConfirmModalProps) {

  // 5. Añadir estado de carga y el hook de alerta
  const [isLoading, setIsLoading] = useState(false)
  const { onOpen: openAlert } = useAlertStore()

  // 6. Crear el manejador de confirmación
  const handleConfirm = async () => {
    try {
      setIsLoading(true) // Inicia la carga

      await onConfirm() // Llama a la API de borrado

      onSuccess() // Refresca la lista (ej. fetchUsers())

      // Muestra alerta de éxito
      openAlert("Éxito", `El usuario ${userName} ha sido eliminado.`, "success")
      
      onClose() // Cierra este modal

    } catch (error: any) {
      // Muestra alerta de error
      openAlert("Error", error.message || "No se pudo eliminar al usuario.", "error")
    } finally {
      setIsLoading(false) // Termina la carga
    }
  }

   return (
  	<Dialog open={isOpen} onOpenChange={onClose}>
   	  <DialogContent className="sm:max-w-[425px]">
   		<DialogHeader>
  		  <div className="flex items-center space-x-2">
   			<AlertTriangle className="h-5 w-5 text-red-600" />
  			<DialogTitle>Confirmar Eliminación</DialogTitle>
  		  </div>
  		  <DialogDescription>
     			¿Estás seguro de que deseas eliminar al usuario <strong>{userName || ""}</strong>? Esta acción no se puede
   			deshacer.
   		  </DialogDescription>
   		</DialogHeader>
   		<div className="flex justify-end space-x-2 pt-4">
   		  <Button 
        variant="outline" 
        onClick={onClose}
        disabled={isLoading} // 7. Deshabilitar botones
      >
   			Cancelar
   		  </Button>
   		  <Button 
        variant="destructive" 
        onClick={handleConfirm} // 8. Llamar a la nueva función
        disabled={isLoading}  // 7. Deshabilitar botones
      >
        {isLoading ? "Eliminando..." : "Eliminar Usuario"} {/* 9. Texto de carga */}
   		  </Button>
   		</div>
   	  </DialogContent>
    </Dialog>
  )
}