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
  const { register, reset, setValue, getValues, watch } = useForm<Producto>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [noCaduca, setNoCaduca] = useState(false) 
  const { onOpen: openAlert } = useAlertStore()
  
  // validación nativa
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (productoEditar) {
      reset(productoEditar)
      if (!productoEditar.fechaExpiracion) {
        setNoCaduca(true)
      } else {
        setNoCaduca(false)
      }
    } else {
      reset({ codigo: "", nombre: "", stockActual: undefined, stockMinimo: undefined, costoUnitario: undefined, fechaExpiracion: undefined })
      setNoCaduca(false)
    }
  }, [productoEditar, isOpen, reset])

  const toggleNoCaduca = () => {
    const nuevoEstado = !noCaduca
    setNoCaduca(nuevoEstado)
    if (nuevoEstado) {
        // No aplica activado envia undefined
        setValue("fechaExpiracion", undefined)
    }
  }

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
    if (!currentData.unidadMedida) {
      openAlert("Campo incompleto", "Por favor selecciona una unidad de medida.", "error")
      return
    }
    if (Number(currentData.stockActual) < 0 || Number(currentData.stockMinimo) < 0) {
      openAlert("Valores inválidos", "El stock debe ser 0 o mayor.", "error")
      return
    }

    setIsSubmitting(true)
    try {
        const data = { ...currentData }
        data.stockActual = Number(data.stockActual)
        data.stockMinimo = Number(data.stockMinimo)
        data.costoUnitario = Number(data.costoUnitario)

        if (noCaduca) {
            data.fechaExpiracion = null as any 
        }
        
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
              <Label>Código*</Label>
              <Input 
                {...register("codigo")} 
                required 
                disabled={!!productoEditar} 
              />
            </div>
            <div className="space-y-2">
               <Label>Categoría*</Label>
               <Select 
                 onValueChange={(val: any) => setValue("categoria", val)} 
                 defaultValue={productoEditar?.categoria}
               >
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Medicamento">Medicamento</SelectItem>
                  <SelectItem value="Suplemento">Suplemento</SelectItem>
                  <SelectItem value="Material Médico">Material Médico</SelectItem>
                  <SelectItem value="Alimento">Alimento</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nombre del Producto*</Label>
            <Input 
                {...register("nombre")} 
                required 
                minLength={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Stock Inicial*</Label>
              <Input 
                required 
                type="number" 
                {...register("stockActual")} 
                disabled={!!productoEditar} 
                className={productoEditar ? "bg-gray-100" : ""} 
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label>Stock Mínimo*</Label>
              <Input 
                type="number" 
                {...register("stockMinimo")} 
                required 
                min={0}
              />
            </div>
             <div className="space-y-2">
              <Label>Unidad Medida*</Label>
              <Select onValueChange={(val) => setValue("unidadMedida", val)} defaultValue={productoEditar?.unidadMedida}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Unidades">Unidades</SelectItem>
                  <SelectItem value="ml">ml</SelectItem>
                  <SelectItem value="gr">gr</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
              <Label>Costo Unitario ($)*</Label>
              <Input 
                type="number" 
                {...register("costoUnitario")} 
                required
                min={0}
                step="0.01"
              />
          </div>

          <div className="space-y-2">
            <Label>Descripción</Label>
            <Input {...register("descripcion")} placeholder="Opcional" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
                <Label className={noCaduca ? "text-gray-400" : ""}>
                  {!noCaduca ? "Fecha Caducidad*" : <p className="line-through">Fecha Caducidad*</p>}                    
                  <Label className="inline-flex items-center cursor-pointer">
                    <Input type="checkbox" value="" className="sr-only peer" onClick={toggleNoCaduca}/>
                    <div className="relative w-9 h-5 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-buffer after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary"></div>
                  </Label>
                </Label>
                
            </div>
            <Input 
                type="date" 
                {...register("fechaExpiracion")} 
                disabled={noCaduca}
                required={!noCaduca}
                className={noCaduca ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}
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