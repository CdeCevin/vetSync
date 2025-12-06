"use client"
import { useEffect, useState, useRef } from "react"
import { useForm } from "react-hook-form" 
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Producto } from "./inventario"
import { useAlertStore } from "@/hooks/use-alert-store"

interface ProductFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => Promise<void>
  productoEditar?: Producto | null 
}

export function ProductFormModal({ isOpen, onClose, onSubmit, productoEditar }: ProductFormModalProps) {
  const { register, reset, setValue, getValues } = useForm<Producto>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { onOpen: openAlert } = useAlertStore()
  
  // validación nativa
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (productoEditar) {
      reset(productoEditar)
    } else {
      reset({ codigo: "", nombre: "", stockActual: 0, stockMinimo: 0, costoUnitario: 0 })
    }
  }, [productoEditar, isOpen, reset])
  const handleNativeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // validación del navegador
    if (formRef.current && !formRef.current.checkValidity()) {
      formRef.current.reportValidity()
      return
    }

    // validación manual para componentes no nativos
    const currentData = getValues()
    if (!currentData.categoria) {
        openAlert("Campo incompleto", "Por favor selecciona una categoría.", "error")
        return
    }

    setIsSubmitting(true)
    try {
        const data = { ...currentData }
        data.stockActual = Number(data.stockActual)
        data.stockMinimo = Number(data.stockMinimo)
        data.costoUnitario = Number(data.costoUnitario)
        
        await onSubmit(data)
        onClose() 
    } catch (error: any) {
        openAlert("Error al guardar", error.message || "Verifica los datos e inténtalo nuevamente.", "error")
    } finally {
        setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{productoEditar ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleNativeSubmit} className="grid gap-4 py-4" noValidate={false}>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Código *</Label>
              <Input 
                {...register("codigo")} 
                required 
                placeholder="MED-001" 
                disabled={!!productoEditar} 
              />
            </div>
            <div className="space-y-2">
               <Label>Categoría *</Label>
               <Select 
                 onValueChange={(val: any) => setValue("categoria", val)} 
                 defaultValue={productoEditar?.categoria}
               >
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Medicamento">Medicamento</SelectItem>
                  <SelectItem value="Insumo">Insumo</SelectItem>
                  <SelectItem value="Equipo">Equipo</SelectItem>
                  <SelectItem value="Alimento">Alimento</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nombre del Producto *</Label>
            <Input 
                {...register("nombre")} 
                required 
                minLength={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Stock Inicial</Label>
              <Input 
                type="number" 
                {...register("stockActual")} 
                disabled={!!productoEditar} 
                className={productoEditar ? "bg-gray-100" : ""} 
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label>Stock Mínimo (Alerta) *</Label>
              <Input 
                type="number" 
                {...register("stockMinimo")} 
                required 
                min={0}
              />
            </div>
             <div className="space-y-2">
              <Label>Unidad Medida *</Label>
              <Input 
                {...register("unidadMedida")} 
                required 
                placeholder="cajas, ml..." 
              />
            </div>
          </div>

          <div className="space-y-2">
              <Label>Costo Unitario ($)</Label>
              <Input 
                type="number" 
                {...register("costoUnitario")} 
                placeholder="0" 
                min={0}
                step="0.01"
              />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : (productoEditar ? "Guardar Cambios" : "Crear Producto")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}