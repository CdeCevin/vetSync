"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tratamiento } from "./tratamiento"
import { useAuth } from "@/components/user-context"

interface TratamientoFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => Promise<void>
  tratamientoEditar?: Tratamiento | null
}

export function TratamientoFormModal({ isOpen, onClose, onSubmit, tratamientoEditar }: TratamientoFormModalProps) {
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<Tratamiento>()
  const { usuario } = useAuth()

  useEffect(() => {
    if (tratamientoEditar) {
      reset(tratamientoEditar)
    } else {
      reset({
        medicamento: "",
        dosis: "",
        instrucciones: "",
        duracionDias: 1,
        notas: "",
        veterinarioNombre: usuario?.nombre_completo || "Veterinario Actual",
        veterinarioId: usuario?.id.toString() || "0"
      })
    }
  }, [tratamientoEditar, isOpen, reset, usuario])

  const onFormSubmit = async (data: Tratamiento) => {
    // Simulacion - luego cambiar por un combobox
    if (!tratamientoEditar) {
        data.pacienteId = "p1" 
        data.pacienteNombre = "Max (Perro) - Demo" 
    }
    
    data.duracionDias = Number(data.duracionDias)
    await onSubmit(data)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{tratamientoEditar ? "Editar Tratamiento" : "Registrar Nuevo Tratamiento"}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 py-4">
          
          {/* Selección de Paciente (Simulada para este ejemplo) */}
          {!tratamientoEditar && (
             <div className="space-y-2">
                <Label>Paciente</Label>
                <Select defaultValue="p1">
                    <SelectTrigger><SelectValue placeholder="Seleccionar paciente" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="p1">Max (Perro)</SelectItem>
                        <SelectItem value="p2">Luna (Gato)</SelectItem>
                    </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">En el sistema real, esto sería un buscador.</p>
             </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>Medicamento *</Label>
                <Input {...register("medicamento", { required: "El medicamento es obligatorio" })} placeholder="Ej: Amoxicilina" />
                {errors.medicamento && <span className="text-red-500 text-xs">{errors.medicamento.message}</span>}
            </div>
            <div className="space-y-2">
                <Label>Dosis *</Label>
                <Input {...register("dosis", { required: true })} placeholder="Ej: 500mg" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label>Duración (Días)</Label>
                <Input type="number" min="1" {...register("duracionDias", { required: true })} />
             </div>
             <div className="space-y-2">
                <Label>Prescrito Por</Label>
                <Input {...register("veterinarioNombre")} disabled className="bg-muted" />
             </div>
          </div>

          <div className="space-y-2">
            <Label>Instrucciones</Label>
            <Textarea {...register("instrucciones")} placeholder="Ej: Administrar con comida cada 12 horas..." />
          </div>

          <div className="space-y-2">
            <Label>Notas Adicionales</Label>
            <Textarea {...register("notas")} placeholder="Observaciones sobre el paciente..." />
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar Tratamiento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}