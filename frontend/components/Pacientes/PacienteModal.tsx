"use client"

import { useEffect, useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAlertStore } from "@/hooks/use-alert-store"
import { Loader2 } from "lucide-react"

// --- Interfaces de Datos ---
interface Mascota {
  id: number
  nombre: string
  especie: string
  raza: string
  color: string
  edad: number
  peso: string
  numero_microchip: string | null
  activo: 1 | 0
  id_dueño: number
}
interface PacienteDetallado {
  mascota: Mascota
}

// Estado inicial vacío para el formulario
const defaultFormState = {
  nombre: "",
  especie: "",
  raza: "",
  color: "",
  edad: 0,
  peso: 0,
  numero_microchip: "",
  id_dueño: 0, 
}

// --- Props del Modal ---
interface PacienteModalProps {
  isOpen: boolean // Controla si el modal está abierto
  onClose: () => void // Función para cerrarlo
  onSubmit: (data: any) => Promise<any> // La función de API ASÍNCRONA (handleCreate/handleEdit)
  onSuccess: () => Promise<any> // La función de refresco ASÍNCRONA (fetchPacientes)
  initialData?: PacienteDetallado | null // Los datos para editar
  isEdit?: boolean
  title: string
  description: string
}

export function PacienteModal({
  isOpen,
  onClose,
  onSubmit,
  onSuccess,
  initialData,
  isEdit = false,
  title,
  description,
}: PacienteModalProps) {

  // --- Estados Internos ---
  const [formData, setFormData] = useState(defaultFormState)
  const [isLoading, setIsLoading] = useState(false) // Estado de carga INTERNO
  const { onOpen: openAlert } = useAlertStore()
  const formRef = useRef<HTMLFormElement>(null)

  // Efecto para cargar datos en el formulario
  useEffect(() => {
    if (isOpen) {
      if (isEdit && initialData) {
        // Modo Edición: Carga datos desde 'initialData.mascota'
        setFormData({
          nombre: initialData.mascota.nombre || "",
          especie: initialData.mascota.especie || "",
          raza: initialData.mascota.raza || "",
          color: initialData.mascota.color || "",
          edad: initialData.mascota.edad || 0,
          peso: parseFloat(initialData.mascota.peso) || 0, // Convierte string a number
          numero_microchip: initialData.mascota.numero_microchip || "",
          id_dueño: initialData.mascota.id_dueño || 0,
        })
      } else {
        // Modo Creación: Resetea
        setFormData(defaultFormState)
      }
    }
  }, [initialData, isEdit, isOpen]) // Se resetea cada vez que se abre

  // --- Manejador de Submit (con try/catch) ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!formRef.current?.checkValidity()) {
      formRef.current?.reportValidity()
      return
    }

    try {
      setIsLoading(true) // Activa la carga
      await onSubmit(formData) // 1. Llama a la API (handleCreate/handleEdit)
      await onSuccess() // 2. Refresca la lista (fetchPacientes)
      
      openAlert("Éxito", isEdit ? "Paciente actualizado" : "Paciente creado", "success")
      onClose() // 3. Cierra el modal
    } catch (error: any) {
      // Si onSubmit o onSuccess fallan, muestra la alerta de error
      openAlert("Error", error.message || "Ocurrió un error inesperado", "error")
    } finally {
      setIsLoading(false) // Desactiva la carga
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" required value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="especie">Especie</Label>
              <Input id="especie" required value={formData.especie} onChange={(e) => setFormData({ ...formData, especie: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="raza">Raza</Label>
              <Input id="raza" required value={formData.raza} onChange={(e) => setFormData({ ...formData, raza: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input id="color" required value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edad">Edad</Label>
              <Input id="edad" type="number" min={0} required value={formData.edad} onChange={(e) => setFormData({ ...formData, edad: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="peso">Peso (kg)</Label>
              <Input id="peso" type="number" min={0} step="0.1" required value={formData.peso} onChange={(e) => setFormData({ ...formData, peso: Number(e.target.value) })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero_microchip">N° Microchip (opcional)</Label>
              <Input id="numero_microchip" value={formData.numero_microchip} onChange={(e) => setFormData({ ...formData, numero_microchip: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="id_dueño">ID del Dueño</Label>
              <Input id="id_dueño" type="number" min={1} required value={formData.id_dueño} onChange={(e) => setFormData({ ...formData, id_dueño: Number(e.target.value) })} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEdit ? "Actualizar Paciente" : "Crear Paciente"}
            </Button>
          </div>
        </form>
        
      </DialogContent>
    </Dialog>
  )
}