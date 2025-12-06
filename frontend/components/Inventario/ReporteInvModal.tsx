"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Producto } from "./inventario"
import { DollarSign, AlertTriangle, Package } from "lucide-react"

interface InventoryReportsProps {
  isOpen: boolean
  onClose: () => void
  datos: { 
    totalValor: number; 
    stockBajo: Producto[]; 
    totalItems: number; 
  }
}

export function InventoryReports({ isOpen, onClose, datos }: InventoryReportsProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="font-serif">Reportes de Inventario</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
           <Card>
             <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Valor Total</CardTitle></CardHeader>
             <CardContent className="flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-full">
                    <DollarSign className="text-green-600 h-5 w-5"/>
                </div>
                <div>
                    <span className="text-2xl font-bold">${datos.totalValor.toLocaleString()}</span>
                    <p className="text-xs text-muted-foreground">En activos</p>
                </div>
             </CardContent>
           </Card>
           
           <Card>
             <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Productos Críticos</CardTitle></CardHeader>
             <CardContent className="flex items-center gap-2">
                <div className="p-2 bg-red-100 rounded-full">
                    <AlertTriangle className="text-red-600 h-5 w-5"/>
                </div>
                <div>
                    <span className="text-2xl font-bold text-red-600">{datos.stockBajo.length}</span>
                    <p className="text-xs text-muted-foreground">Requieren atención</p>
                </div>
             </CardContent>
           </Card>
           
           <Card>
             <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Items</CardTitle></CardHeader>
             <CardContent className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 rounded-full">
                    <Package className="text-blue-600 h-5 w-5"/>
                </div>
                <div>
                    <span className="text-2xl font-bold">{datos.totalItems}</span>
                    <p className="text-xs text-muted-foreground">Registrados</p>
                </div>
             </CardContent>
           </Card>
        </div>
        <div className="border rounded-md overflow-hidden">
            <div className="bg-muted/50 p-3 border-b font-semibold text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500"/>
                Productos con Stock Bajo o Crítico
            </div>
            <div className="max-h-[300px] overflow-y-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead className="text-center">Stock Actual</TableHead>
                            <TableHead className="text-center">Mínimo</TableHead>
                            <TableHead className="text-right">Estado</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {datos.stockBajo.length === 0 ? (
                            <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Todo en orden. No hay productos críticos.</TableCell></TableRow>
                        ) : (
                            datos.stockBajo.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell className="font-medium">
                                        {p.nombre}
                                        <span className="block text-xs text-muted-foreground">{p.codigo}</span>
                                    </TableCell>
                                    <TableCell className="text-center font-bold text-red-600 bg-red-50">
                                        {p.stockActual} <span className="text-[10px] font-normal text-gray-500">{p.unidadMedida}</span>
                                    </TableCell>
                                    <TableCell className="text-center">{p.stockMinimo}</TableCell>
                                    <TableCell className="text-right">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            {p.stockActual === 0 ? "Agotado" : "Reponer"}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>

      </DialogContent>
    </Dialog>
  )
}