"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Producto } from "./inventario"
import { DollarSign, AlertTriangle, Package } from "lucide-react"

interface InventoryReportsProps {
  isOpen: boolean
  onClose: () => void
  datos: { totalValor: number, stockBajo: Producto[], totalItems: number }
}

export function InventoryReports({ isOpen, onClose, datos }: InventoryReportsProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Reportes de Inventario</DialogTitle>
        </DialogHeader>
        
        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-3 gap-4 mb-6">
           <Card>
             <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Valor Total Inventario</CardTitle></CardHeader>
             <CardContent className="flex items-center gap-2">
                <DollarSign className="text-green-600 h-5 w-5"/>
                <span className="text-2xl font-bold">${datos.totalValor.toLocaleString()}</span>
             </CardContent>
           </Card>
           <Card>
             <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Productos Críticos</CardTitle></CardHeader>
             <CardContent className="flex items-center gap-2">
                <AlertTriangle className="text-red-600 h-5 w-5"/>
                <span className="text-2xl font-bold">{datos.stockBajo.length}</span>
             </CardContent>
           </Card>
           <Card>
             <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Items Inventario</CardTitle></CardHeader>
             <CardContent className="flex items-center gap-2">
                <Package className="text-blue-600 h-5 w-5"/>
                <span className="text-2xl font-bold">{datos.totalItems}</span>
             </CardContent>
           </Card>
        </div>

        {/* Tabla detallada de stock bajo*/}
        <div className="border rounded-md">
            <div className="bg-gray-50 p-2 border-b font-semibold text-sm">Productos con Stock Bajo/Crítico</div>
            <Table>
                <TableHeader className="bg-gray-20 p-2 border-b font-semibold text-sm">
                    <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Stock Actual</TableHead>
                        <TableHead>Mínimo</TableHead>
                        <TableHead>Estado</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {datos.stockBajo.length === 0 ? (
                        <TableRow><TableCell colSpan={4} className="text-center text-gray-500">Todo en orden</TableCell></TableRow>
                    ) : (
                        datos.stockBajo.map(p => (
                            <TableRow key={p.id}>
                                <TableCell>{p.nombre}</TableCell>
                                <TableCell className="font-bold text-red-600">{p.stockActual}</TableCell>
                                <TableCell>{p.stockMinimo}</TableCell>
                                <TableCell className="text-red-500 text-xs">Reponer Urgente</TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>

      </DialogContent>
    </Dialog>
  )
}