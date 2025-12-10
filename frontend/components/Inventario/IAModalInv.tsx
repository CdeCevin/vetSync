"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertTriangle, ShoppingCart, Archive, CheckCircle2, TrendingUp, Sparkles, PackageOpen } from "lucide-react"
import { IAPrediccionResponse } from "@/hooks/useIAService"
import { Card } from "@/components/ui/card"

interface InventoryPredictionModalProps {
  isOpen: boolean
  onClose: () => void
  data: IAPrediccionResponse | null
}

export function InventoryPredictionModal({ isOpen, onClose, data }: InventoryPredictionModalProps) {
  if (!data) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-accent text-xl">
            <Sparkles className="h-5 w-5 text-accent" /> 
            Análisis Inteligente de Inventario
          </DialogTitle>
          <DialogDescription>
            Diagnóstico en tiempo real basado en movimientos y stock actual.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 pb-6">
            
            {/* Resumen General */}
            <div className="bg-white/50 p-4 rounded-lg border border-accent/10">
              <h4 className="font-semibold text-accent mb-1 flex items-center gap-2">
                Resumen Ejecutivo
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed">
                {data.resumen_general}
              </p>
              <div className="mt-3 flex gap-4 text-xs font-medium text-slate-500">
                <span>Items Analizados: <span className="text-slate-900">{data.metricas_clave.total_items}</span></span>
                <span>Críticos: <span className="text-red-500/80">{data.metricas_clave.total_criticos}</span></span>
              </div>
            </div>

            {/* alertas de compra*/}
            {data.alertas_compra.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-red-500/80 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" /> Sugerencias de Compra
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {data.alertas_compra.map((item) => (
                    <Card key={item.id} className="bg-white/50 p-3 border-l-4 border-l-red-500/50 shadow-sm">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-slate-800 text-sm truncate pr-2" title={item.nombre}>{item.nombre}</span>
                        <Badge variant="destructive" className="text-[10px] bg-red-200 text-slate-700">Critico</Badge>
                      </div>
                      <div className="mt-2 text-xs space-y-1 text-slate-600">
                        <p>Stock: <span className="font-bold text-red-500/80">{item.stock_actual}</span> / Mín: {item.stock_minimo}</p>
                        <p className="flex items-center gap-1">
                           <PackageOpen className="h-3 w-3"/> Sugerido: 
                           <span className="font-bold text-slate-900">{item.cantidad_sugerida} {item.unidad}(s)</span>
                        </p>
                        <p className="italic text-slate-500 mt-1 border-t border-red-100 pt-1">
                          "{item.motivo}"
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* advertencia stock */}
            {data.stock_estancado.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-orange-700/80 uppercase tracking-wide mb-3 flex items-center gap-2 mt-4">
                  <Archive className="h-4 w-4" /> Stock Estancado (Sin movimiento)
                </h3>
                <div className="space-y-2">
                  {data.stock_estancado.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-white/50 border border-l-4 border-l-orange-500/50 rounded-lg">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-700 text-sm">{item.nombre}</span>
                        <span className="text-xs text-orange-700">
                           {item.stock_actual} {item.unidad} en bodega sin uso.
                        </span>
                      </div>
                      <Badge variant="outline" className="bg-white text-orange-600 border-orange-200 whitespace-nowrap">
                        {item.dias_sin_movimiento}+ días
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* stock saludable */}
            {data.inventario_saludable.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-green-700/80 uppercase tracking-wide mb-3 flex items-center gap-2 mt-4">
                  <CheckCircle2 className="h-4 w-4" /> Inventario Saludable
                </h3>
                <div className="flex flex-wrap gap-2">
                  {data.inventario_saludable.map((item) => (
                    <Badge key={item.id} variant="secondary" className="bg-green-100/30 text-green-800 border border-green-800/30 font-normal">
                      {item.nombre} (Stock: {item.stock_actual})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <p className="text-xs text-slate-500 text-center">
                <span className="text-slate-600 font-semibold italic">La IA puede cometer errores, recuerda revisar la información.</span>
              </p>   

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}