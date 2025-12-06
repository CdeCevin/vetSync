"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Producto } from "./inventario"
import { DollarSign, AlertTriangle, Package } from "lucide-react"

interface Movimiento {
  id: number;
  tipo_movimiento: string;
  cantidad: number;
  motivo: string;
  creado_en: string;
  producto: string;
  codigo: string;
}

interface InventoryReportsProps {
  isOpen: boolean;
  onClose: () => void;
  datos: {
    valorTotal: number;
    productosBajoStock: number;
    productosAgotados: number;
    ultimosMovimientos: Movimiento[];
  } | null
}

export function InventoryReports({ isOpen, onClose, datos }: InventoryReportsProps) {
  const noData = !datos || (datos.ultimosMovimientos.length === 0 && datos.valorTotal === 0 && datos.productosBajoStock === 0 && datos.productosAgotados === 0);
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="min-w-5xl max-w-5xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif">Reportes de Inventario</DialogTitle>
        </DialogHeader>
        {noData ? (
          <div className="text-center py-20 text-gray-500">
            No hay datos de inventario disponibles.
          </div>
        ) : (
          <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
           <Card>
             <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Valor Total</CardTitle></CardHeader>
             <CardContent className="flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-full">
                    <DollarSign className="text-green-600 h-5 w-5"/>
                </div>
                <div>
                    <span className="text-2xl font-bold">${datos.valorTotal.toLocaleString()}</span>
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
                    <span className="text-2xl font-bold text-red-600">{datos.productosBajoStock}</span>
                    <p className="text-xs text-muted-foreground">Requieren atención</p>
                </div>
             </CardContent>
           </Card>
        </div>
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="font-serif text-lg"> Últimos Movimientos</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                 <div className="flex flex-col md:flex-row gap-4 mb-5 max-h-[20vh] overflow-y-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Producto</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-center">Cantidad</TableHead>
                        <TableHead>Motivo</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {datos.ultimosMovimientos.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No hay movimientos recientes.
                            </TableCell>
                        </TableRow>
                        ) : (
                        datos.ultimosMovimientos.map(m => (
                            <TableRow key={m.id}>
                            <TableCell>{m.creado_en}</TableCell>
                            <TableCell>
                                <b>{m.producto}</b>
                                <div className="text-xs text-muted-foreground">{m.codigo}</div>
                            </TableCell>
                            <TableCell>{m.tipo_movimiento}</TableCell>
                            <TableCell className="text-center">{m.cantidad}</TableCell>
                            <TableCell>{m.motivo}</TableCell>
                            </TableRow>
                        ))
                        )}
                    </TableBody>
                    </Table>
                    </div>
                    </CardContent>
                </Card>
        </>
        )}                
      </DialogContent>
    </Dialog>
  )
}