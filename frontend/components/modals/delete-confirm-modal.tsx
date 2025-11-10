"use client"

import { useState } from "react" 
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { useAlertStore } from "@/hooks/use-alert-store"

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<any>
   onSuccess: () => void       
   userName?: React.ReactNode
}

export function DeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  onSuccess, 
  userName 
}: DeleteConfirmModalProps) {

  
  const [isLoading, setIsLoading] = useState(false)
  const { onOpen: openAlert } = useAlertStore()

  
  const handleConfirm = async () => {
    try {
      setIsLoading(true) 
      await onConfirm() 
      onSuccess() 
      openAlert("Éxito", `${userName} se ha eliminado.`, "success")
      onClose()

    } catch (error: any) {
      openAlert("Error", "Ha ocurrido un error al eliminar.", "error")
    } finally {
      setIsLoading(false)
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
     			¿Estás seguro de que deseas eliminar {userName || ""}? Esta acción no se puede
   			deshacer.
   		  </DialogDescription>
   		</DialogHeader>
   		<div className="flex justify-end space-x-2 pt-4">
   		  <Button 
        variant="outline" 
        onClick={onClose}
        disabled={isLoading}
      >
   			Cancelar
   		  </Button>
   		  <Button 
        variant="destructive" 
        onClick={handleConfirm}
        disabled={isLoading}
      >
        {isLoading ? "Eliminando..." : "Eliminar"}
   		  </Button>
   		</div>
   	  </DialogContent>
    </Dialog>
  )
}