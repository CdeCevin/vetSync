"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Producto } from "./inventario"
import { ArrowRight, AlertCircle } from "lucide-react"
import { useAlertStore } from "@/hooks/use-alert-store"

interface StockAdjustmentModalProps {
  producto: Producto | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (id: string, tipo: "entrada" | "salida" | "ajuste", cantidad: number, motivo: string) => Promise<void>
}

export function StockAdjustmentModal({ producto, isOpen, onClose, onConfirm }: StockAdjustmentModalProps) {
  const [tipo, setTipo] = useState<"entrada" | "salida" | "ajuste">("entrada")
  const [cantidad, setCantidad] = useState<string>("")
  const [motivo, setMotivo] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { onOpen: openAlert } = useAlertStore()

  useEffect(() => {
    if (isOpen) {
      setTipo("entrada")
      setCantidad("")
      setMotivo("")
    }
  }, [isOpen, producto])

  if (!producto) return null

  const valorCantidad = parseInt(cantidad) || 0
  let stockFinal = producto.stockActual

  if (tipo === "entrada") stockFinal += valorCantidad
  if (tipo === "salida") stockFinal -= valorCantidad
  if (tipo === "ajuste") stockFinal = valorCantidad
  const esInvalido = stockFinal < 0 || valorCantidad <= 0

  const handleSave = async () => {
    if (esInvalido) return
    
    setIsLoading(true)
    try {
      await onConfirm(producto.id, tipo, valorCantidad, motivo)
      openAlert("Éxito", `El stock se ha actualizado correctamente.`, "success")
      onClose()
    } catch (err: any) {
      openAlert("Error al ajustar stock", err.message || "Ocurrió un problema inesperado.", "error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajustar Stock</DialogTitle>
          <DialogDescription>
            Producto: <span className="font-semibold text-foreground">{producto.nombre}</span> ({producto.codigo})
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tipo" className="text-right">Acción</Label>
            <Select value={tipo} onValueChange={(val: any) => setTipo(val)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Seleccione acción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entrada">Añadir Stock (+)</SelectItem>
                <SelectItem value="salida">Quitar Stock (-)</SelectItem>
                <SelectItem value="ajuste">Corrección Manual (=)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="cantidad" className="text-right">Cantidad</Label>
            <div className="col-span-3 relative">
                <Input
                id="cantidad"
                type="number"
                min="1"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                className={stockFinal < 0 ? "border-red-500 focus-visible:ring-red-500" : ""}
                placeholder="0"
                />
                <span className="absolute right-10 top-2 text-sm text-gray-400">{producto.unidadMedida}</span>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="motivo" className="text-right">Motivo</Label>
            <Textarea
              id="motivo"
              placeholder="Ej: Compra mensual, rotura, inventario anual..."
              className="col-span-3"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
          </div>

          <div className={`mt-2 p-3 rounded-lg border flex items-center justify-between ${stockFinal < 0 ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"}`}>
            <div className="text-center">
                <p className="text-xs text-gray-500 uppercase font-bold">Actual</p>
                <p className="text-xl font-mono">{producto.stockActual}</p>
            </div>
            <ArrowRight className="text-gray-400" />
            <div className="text-center">
                <p className="text-xs text-gray-500 uppercase font-bold">Final</p>
                <p className={`text-xl font-mono font-bold ${stockFinal < 0 ? "text-red-600" : "text-blue-600"}`}>
                    {stockFinal}
                </p>
            </div>
          </div>

          {stockFinal < 0 && (
             <div className="flex items-center text-red-600 text-sm gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>El stock resultante no puede ser negativo.</span>
             </div>
          )}

        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isLoading || esInvalido || valorCantidad <= 0}>
            {isLoading ? "Guardando..." : "Confirmar Movimiento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}