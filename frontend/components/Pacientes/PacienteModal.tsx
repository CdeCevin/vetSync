"use client"

import { useEffect, useRef, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAlertStore } from "@/hooks/use-alert-store"
import { Loader2 } from "lucide-react"
import { usePacienteService } from "@/hooks/usePacienteService"
import { Dueño } from "@/hooks/usePacienteService"

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
  dueño: Dueño
}

interface PacienteModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => Promise<any>
  onSuccess: () => Promise<any>
  initialData?: PacienteDetallado | null
  isEdit?: boolean
  title: string
  description: string
}

const defaultFormState = {
  nombre: "",
  especie: "",
  raza: "",
  color: "",
  edad: 0,
  peso: 0,
  numero_microchip: "",
  id_dueño: -1,
  ownerNombre: "",
  ownerTelefono: "",
  ownerCorreo: "",
  ownerDireccion: "",
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
  const [formData, setFormData] = useState(defaultFormState)
  const [isLoading, setIsLoading] = useState(false)
  const [isOwnerEdit, setIsOwnerEdit] = useState(false)
  const [isCreatingOwner, setIsCreatingOwner] = useState(false)
  const [ownersList, setOwnersList] = useState<Dueño[]>([])
  const { onOpen: openAlert } = useAlertStore()
  const formRef = useRef<HTMLFormElement>(null)
  const { getOwners, createOwner, updateOwner } = usePacienteService()

  useEffect(() => {
    if (isOpen) {
      getOwners().then(setOwnersList).catch(console.error)
    }
  }, [isOpen, getOwners])

  useEffect(() => {
    if (!isOpen) return

    if (isEdit && initialData) {
      setFormData({
        nombre: initialData.mascota.nombre || "",
        especie: initialData.mascota.especie || "",
        raza: initialData.mascota.raza || "",
        color: initialData.mascota.color || "",
        edad: initialData.mascota.edad || 0,
        peso: parseFloat(initialData.mascota.peso) || 0,
        numero_microchip: initialData.mascota.numero_microchip || "",
        id_dueño: initialData.mascota.id_dueño || -1,
        ownerNombre: initialData.dueño?.nombre || "",
        ownerTelefono: initialData.dueño?.telefono || "",
        ownerCorreo: initialData.dueño?.correo || "",
        ownerDireccion: initialData.dueño?.direccion || "",
      })
    } else {
      setFormData({...defaultFormState, id_dueño:-1})
    }
    setIsOwnerEdit(false)
    setIsCreatingOwner(false)
  }, [initialData, isEdit, isOpen])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Validación básica de campos (ej. 'required' de HTML)
    if (!formRef.current?.checkValidity()) {
      formRef.current?.reportValidity()
      return
    }

    try {
      setIsLoading(true)
       if (isOwnerEdit) {
        
        if (isCreatingOwner) {
          // Lógica para CREAR dueño
          const newOwner = await createOwner({
            nombre: formData.ownerNombre,
            telefono: formData.ownerTelefono,
            correo: formData.ownerCorreo,
            direccion: formData.ownerDireccion,
          })

          setOwnersList((prev) => [...prev, newOwner]) 

          setFormData((prev) => ({ 
            ...prev,
            id_dueño: newOwner.id,
            ownerNombre: "",
            ownerTelefono: "",
            ownerCorreo: "",
            ownerDireccion: "",
          }))
          
          openAlert("Éxito", "Dueño creado y seleccionado", "success")
        
        } else {
          // Lógica para ACTUALIZAR dueño
          await updateOwner(formData.id_dueño, {
            nombre: formData.ownerNombre,
            telefono: formData.ownerTelefono,
            correo: formData.ownerCorreo,
            direccion: formData.ownerDireccion,
          })
          openAlert("Éxito", "Dueño actualizado", "success")
        }

        // Al terminar, volvemos al formulario de Paciente
        setIsOwnerEdit(false)
        setIsCreatingOwner(false)
        setIsLoading(false) 
        return 
      }
      // *** VALIDACIÓN MANUAL para el placeholder -1 ***
      if (formData.id_dueño < 1) { 
        openAlert("Error", "Debes seleccionar un dueño válido.", "error")
        setIsLoading(false) 
        return 
      }

      // Lógica para CREAR/ACTUALIZAR PACIENTE
      await onSubmit(formData)
      await onSuccess()
      
      openAlert("Éxito", isEdit ? "Paciente actualizado" : "Paciente creado", "success")
      setIsLoading(false) 
      onClose() 

    } catch (err: any) {
      openAlert("Error", err.message || "Ocurrió un error", "error")
      setIsLoading(false) 
    }
  }
  
  const handleSelectOwner = (id: number) => {
    if (id === 0) {
      setIsCreatingOwner(true)
      setIsOwnerEdit(true)
      setFormData((prev) => ({
        ...prev,
        id_dueño: -1,
        ownerNombre: "",
        ownerTelefono: "",
        ownerCorreo: "",
        ownerDireccion: "",
      }))
    } else {
      const owner = ownersList.find((o) => o.id === id)
      if (!owner) return
      setIsCreatingOwner(false)
      setIsOwnerEdit(false)
      setFormData((prev) => ({
        ...prev,
        id_dueño: id,
        ownerNombre: owner.nombre,
        ownerTelefono: owner.telefono || "",
        ownerCorreo: owner.correo || "",
        ownerDireccion: owner.direccion || "",
      }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
          {isEdit && !isOwnerEdit && (
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => { setIsOwnerEdit(true); setIsCreatingOwner(false) }}>
                Actualizar Dueño
              </Button>
            </div>
          )}
        </DialogHeader>
         
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 pt-4">
         
          {!isOwnerEdit ? (
            <>
              {/* Campos paciente */}
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
                  <Input id="peso" type="number" min={0} step={0.1} required value={formData.peso} onChange={(e) => setFormData({ ...formData, peso: Number(e.target.value) })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numero_microchip">N° Microchip (opcional)</Label>
                  <Input id="numero_microchip" value={formData.numero_microchip} onChange={(e) => setFormData({ ...formData, numero_microchip: e.target.value })} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="id">Dueño</Label>
                  <select
                    value={formData.id_dueño}
                    onChange={(e) => handleSelectOwner(Number(e.target.value))}
                    className="w-full border p-2 rounded"
                  >
                  <option value={-1} disabled>
                    Seleccionar dueño...
                  </option>
                  <option value={0}>Crear nuevo dueño</option>
                   {ownersList.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.nombre}
                    </option>
                  ))}
                  {formData.id_dueño > 0 &&
                    !ownersList.some((o) => o.id == formData.id_dueño) && ( 
                      <option value={formData.id_dueño} disabled>
                        Nuevo Dueño Creado
                      </option>
                    )}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancelar</Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {isEdit ? "Actualizar Paciente" : "Crear Paciente"}
                </Button>
              </div>
            </>
          ) : (
            // Campos dueño (crear o editar)
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ownerNombre">Nombre Dueño</Label>
                <Input id="ownerNombre" required value={formData.ownerNombre} onChange={(e) => setFormData({ ...formData, ownerNombre: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerTelefono">Teléfono</Label>
                <Input id="ownerTelefono" value={formData.ownerTelefono} onChange={(e) => setFormData({ ...formData, ownerTelefono: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerCorreo">Correo</Label>
                <Input id="ownerCorreo" value={formData.ownerCorreo} onChange={(e) => setFormData({ ...formData, ownerCorreo: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerDireccion">Dirección</Label>
                <Input id="ownerDireccion" value={formData.ownerDireccion} onChange={(e) => setFormData({ ...formData, ownerDireccion: e.target.value })} />
              </div>

              <div className="flex justify-end gap-2 pt-4 col-span-2">
                <Button type="button" variant="outline" onClick={() => { setIsOwnerEdit(false); setIsCreatingOwner(false) }} disabled={isLoading}>Cancelar</Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {isCreatingOwner ? "Crear Dueño" : "Actualizar Dueño"}
                </Button>
              </div>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
