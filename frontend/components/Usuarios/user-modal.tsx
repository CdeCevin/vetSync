"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAlertStore } from "@/hooks/use-alert-store"

interface User {
  id?: number
  id_rol: number
  nombre_completo: string
  correo_electronico: string
  contraseña?: string
}

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (userData: User) => void
  initialData?: Partial<User>
  isEdit?: boolean
  title: string
  description: string
  onSuccess: () => Promise<any>
}

export function UserModal({
  isOpen,
  onClose,
  onSubmit,
  onSuccess,
  initialData,
  isEdit = false,
  title,
  description,
}: UserModalProps) {
  const safeInitialData = initialData || {}
  const [isLoading, setIsLoading] = useState(false)
  const { onOpen: openAlert } = useAlertStore()
  const [formData, setFormData] = useState<User>({
    id: safeInitialData.id ?? 0,
    id_rol: safeInitialData.id_rol ?? 2, // Por defecto 'Veterinario'
    nombre_completo: safeInitialData.nombre_completo || "",
    correo_electronico: safeInitialData.correo_electronico || "",
    contraseña: "",
  })

  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (initialData) {
      setFormData({
        id_rol: initialData.id_rol ?? 2,
        nombre_completo: initialData.nombre_completo || "",
        correo_electronico: initialData.correo_electronico || "",
        contraseña: "", // No se rellena la contraseña en edición
      })
    } else if (!isEdit) {
      setFormData({
        id_rol: 2,
        nombre_completo: "",
        correo_electronico: "",
        contraseña: "",
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
        dataToSubmit.id = safeInitialData.id
      }

      // Lógica original: no enviar contraseña si está vacía en edición
      if (isEdit && !dataToSubmit.contraseña) {
      delete dataToSubmit.contraseña
      }
      await onSubmit(dataToSubmit)
      await onSuccess()
      const successMessage = isEdit ? "Usuario actualizado" : "Usuario creado"  
      openAlert("¡Éxito!", `${successMessage} correctamente.`, "success")
    
    // En edición, si contraseña está vacía no la mandes para no actualizarla
    if (!isEdit) {
      setFormData({
        id_rol: 2,
        nombre_completo: "",
        correo_electronico: "",
        contraseña: "",
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
              <Label htmlFor="nombre_completo">Nombre completo</Label>
              <Input
                id="nombre_completo"
                value={formData.nombre_completo}
                onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                required={!isEdit}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="correo_electronico">Correo electrónico</Label>
              <Input
                id="correo_electronico"
                type="email"
                value={formData.correo_electronico}
                onChange={(e) => setFormData({ ...formData, correo_electronico: e.target.value })}
                required={!isEdit}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contraseña">{isEdit ? "Nueva contraseña (opcional)" : "Contraseña"}</Label>
              <Input
                id="contraseña"
                type="password"
                value={formData.contraseña}
                onChange={(e) => setFormData({ ...formData, contraseña: e.target.value })}
                required={!isEdit}
                placeholder={isEdit ? "Déjalo vacío para no cambiar" : ""}
                minLength={isEdit ? undefined : 8}
                pattern={isEdit && !formData.contraseña ? undefined : ".*[0-9].*"}
                title="Debe tener al menos 8 caracteres y 1 número."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="id_rol">Rol</Label>
              <Select
                value={String(formData.id_rol)}
                onValueChange={(value) => setFormData({ ...formData, id_rol: Number(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Administrador</SelectItem>
                  <SelectItem value="2">Veterinario</SelectItem>
                  <SelectItem value="3">Recepcionista</SelectItem>
                </SelectContent>
              </Select>
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
