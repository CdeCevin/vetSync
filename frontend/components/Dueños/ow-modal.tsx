"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAlertStore } from "@/hooks/use-alert-store"

interface Dueño {
  id: number
  nombre: string
  telefono?: string
  correo: string
  direccion?: string
}

interface OwnerModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (ownerData: Dueño) => void
  initialData?: Partial<Dueño>
  isEdit?: boolean
  title: string
  description: string
  onSuccess: () => Promise<any>
}

export function OwnerModal({
  isOpen,
  onClose,
  onSubmit,
  onSuccess,
  initialData,
  isEdit = false,
  title,
  description,
}: OwnerModalProps) {
  const safeInitialData = initialData || {}
  const [isLoading, setIsLoading] = useState(false)
  const { onOpen: openAlert } = useAlertStore()
  const [formData, setFormData] = useState<Dueño>({
    id: safeInitialData.id ?? 0,
    nombre: safeInitialData.nombre || "",
    correo: safeInitialData.correo || "",
    telefono: safeInitialData.telefono  || "",
    direccion:safeInitialData.direccion  || "",
  })

  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || 0,
        nombre: initialData.nombre || "",
        telefono: initialData.telefono || "",
        correo: initialData.correo || "", // No se rellena la contraseña en edición
        direccion: initialData.direccion || "",
      })
    } else if (!isEdit) {
      setFormData({
        id: 0,
        nombre: "",
        telefono: "",
        correo: "",
        direccion: "",
       })
    }
  }, [initialData, isEdit])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (formRef.current && !formRef.current.checkValidity()) {
      // Si no es válido, checkValidity() FORZARÁ que aparezca el
      // mensaje nativo del navegador en el campo incorrecto.
      // Detenemos la función aquí.
      return
    }
    try {
      setIsLoading(true)
      const dataToSubmit = { ...formData }
      if (isEdit) {
        dataToSubmit.id = safeInitialData.id ?? -1;
      }

      // Lógica original: no enviar contraseña si está vacía en edición
      await onSubmit(dataToSubmit)
      await onSuccess()
      const successMessage = isEdit ? "Usuario actualizado" : "Usuario creado"  
      openAlert("¡Éxito!", `${successMessage} correctamente.`, "success")
    
    // En edición, si contraseña está vacía no la mandes para no actualizarla
    if (!isEdit) {
      setFormData({
        id: 2,
        nombre: "",
        telefono: "",
        correo: "",
        direccion: "",
      })
    }
    onClose()
    } catch (error: any) {
      // 10. Si 'onSubmit' lanzó un error:
      // Muestra el modal de error
      openAlert("Error", error.message || "Ocurrió un error inesperado.", "error")
    } finally {
      // 11. Se ejecuta siempre (después de 'try' o 'catch')
      // Desactiva el estado de "cargando"
     setIsLoading(false) 
     }
    
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required={!isEdit}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="correo">Correo electrónico</Label>
              <Input
                id="correo"
                type="email"
                value={formData.correo}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                required={!isEdit}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefono">Télefono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                required={!isEdit}
                placeholder={isEdit ? "Déjalo vacío para no cambiar" : ""}
                maxLength={11}
                />
            </div>
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                //required={!isEdit}
                maxLength={60}
                />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              {isEdit ? "Actualizar Usuario" : "Crear Usuario"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
