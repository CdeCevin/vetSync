"use client"

import { useState, useEffect } from "react"
import { useInventoryService } from "../../hooks/useInventarioService"
import { ProductFormModal } from "./ProductoModal"
import { InventoryReports } from "./ReporteInvModal"
import { StockAdjustmentModal } from "./ModalAjusteStock"
import { Producto } from "./inventario"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useAlertStore } from "@/hooks/use-alert-store"
import { DeleteConfirmModal } from "@/components/modals/delete-confirm-modal"
import { useAIService, IAPrediccionResponse } from "@/hooks/useIAService"
import { InventoryPredictionModal } from "./IAModalInv"
import { 
  Edit, Trash2, FileBarChart, Plus, ArrowRightLeft, 
  Search, Package, AlertTriangle, TrendingDown, Loader2, Sparkles 
} from "lucide-react"

interface InventarioData {
  valorTotal: any;
  productosBajoStock: any;
  productosAgotados: any;
  ultimosMovimientos: any;
}

export function InventoryManagement() {
  const { 
    productos, 
    cargarProductos, 
    crearProducto, 
    editarProducto, 
    eliminarProducto, 
    registrarMovimiento, 
    obtenerReportes 
  } = useInventoryService()
  
  const { onOpen: openAlert } = useAlertStore()
  const [modalFormOpen, setModalFormOpen] = useState(false)
  const [modalReportsOpen, setModalReportsOpen] = useState(false)
  const [modalStockOpen, setModalStockOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null)
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)
  const [busqueda, setBusqueda] = useState("")
  const [filtroCategoria, setFiltroCategoria] = useState("todos")
  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [reportes, setReportes] = useState<InventarioData | null>(null)
  const { obtenerPrediccionInventario, loadingAI } = useAIService()
  const [modalPredictionOpen, setModalPredictionOpen] = useState(false)
  const [predictionData, setPredictionData] = useState<IAPrediccionResponse | null>(null)

  useEffect(() => { 
    cargarProductos()     
  }, [])

  const abrirReportes = async () => {
    const data = await obtenerReportes();
    setReportes(data);
    setModalReportsOpen(true);
  };

  const handleAIPrediction = async () => {
    try {
      const data = await obtenerPrediccionInventario()
      if (data) {
        setPredictionData(data)
        setModalPredictionOpen(true)
      }
    } catch (e: any) {
      openAlert("Error IA", "No se pudo obtener la predicción del inventario.", "error")
    }
  }

  const productosFiltrados = productos.filter((item) => {
    const term = busqueda.toLowerCase()
    const coincideBusqueda = 
      item.nombre?.toLowerCase().includes(term) ||
      item.codigo?.toLowerCase().includes(term)
    
    const coincideCategoria = filtroCategoria === "todos" || item.categoria === filtroCategoria
    
    let estadoItem = "Normal"
    if (item.stockActual === 0) estadoItem = "Agotado"
    else if (item.stockActual <= item.stockMinimo) estadoItem = "Bajo Stock"

    const coincideEstado = filtroEstado === "todos" || 
                          (filtroEstado === "agotado" && estadoItem === "Agotado") ||
                          (filtroEstado === "bajo" && estadoItem === "Bajo Stock") ||
                          (filtroEstado === "normal" && estadoItem === "Normal")

    return coincideBusqueda && coincideCategoria && coincideEstado
  })

  const stockBajo = productos.filter(p => p.stockActual <= p.stockMinimo && p.stockActual > 0).length
  const agotados = productos.filter(p => p.stockActual === 0).length

  const handleFormSubmit = async (data: Producto) => {
    try {
      if (productoSeleccionado) {
        await editarProducto(productoSeleccionado.id, data)
        openAlert("Éxito", "Producto actualizado correctamente", "success")
      } else {
        await crearProducto(data)
        openAlert("Éxito", "Producto creado correctamente", "success")
      }
    } catch (e: any) {
      openAlert("Error", e.message, "error")
    }
  }
  
  const handleOpenDelete = (producto: Producto) => {
    if(producto.stockActual > 0) {
        openAlert("Error", "No es posible eliminar un producto con stock.", "error")
        return
      }
    setProductoAEliminar(producto)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
      if (!productoAEliminar) return  
      await eliminarProducto(productoAEliminar.id) 
  }

  const handleDeleteSuccess = () => {
      cargarProductos() // Recargar lista
      setProductoAEliminar(null)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold font-serif">Gestión de Inventario</h1>
            <p className="text-gray-500">Administra tus insumos y medicamentos</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={abrirReportes}>
                <FileBarChart className="mr-2 h-4 w-4"/> Reportes
            </Button>
            <Button 
                  variant="default" 
                  className="text-white shadow-sm gap-2 bg-gradient-to-l from-secondary to-accent hover:from-accent/50 hover:to-secondary/50 "

                  onClick={handleAIPrediction}
                  disabled={loadingAI}
              >
                  {loadingAI ? <Loader2 className="h-4 w-4 animate-spin"/> : <Sparkles className="h-4 w-4 text-white"/>}
                  {loadingAI ? "Analizando..." : "Predicción IA"}
            </Button>
            
            <Button onClick={() => { setProductoSeleccionado(null); setModalFormOpen(true) }}>
                <Plus className="mr-2 h-4 w-4"/> Nuevo Producto
            </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Productos</CardTitle><Package className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold text-primary">{productos.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Productos con Stock Bajo</CardTitle><TrendingDown className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-600">{stockBajo}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Productos con Stock Agotado</CardTitle><AlertTriangle className="h-4 w-4 text-muted-foreground"/></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{agotados}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle className="font-serif text-lg">Listado de Productos</CardTitle>
            </div>
        </CardHeader>
        <CardContent>
      <div className="flex flex-col md:flex-row gap-4 mb-5">

        <div className="flex flex-col sm:flex-row gap-4 flex-1">
        
            <div className="relative flex-1 max-w-sm">
              <Search className=" absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, código..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10 border-gray/80"
              />
            </div>  
        </div>
        <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas las categorías</SelectItem>
            <SelectItem value="Medicamento">Medicamento</SelectItem>
            <SelectItem value="Insumo">Insumo</SelectItem>
            <SelectItem value="Equipo">Equipo</SelectItem>
            <SelectItem value="Alimento">Alimento</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filtroEstado} onValueChange={setFiltroEstado}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="bajo">Bajo Stock</SelectItem>
            <SelectItem value="agotado">Agotado</SelectItem>
          </SelectContent>
        </Select>
      </div>

        <Table >
            <TableHeader>
                <TableRow>
                    <TableHead >Producto</TableHead>
                    <TableHead >Categoría</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead >Costo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {productosFiltrados.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center h-24 text-gray-500">
                            No se encontraron productos.
                        </TableCell>
                    </TableRow>
                ) : (
                    productosFiltrados.map(p => {
                        // Lógica visual de estado (Badges)
                        let badgeColor = "bg-green-100 text-green-800 hover:bg-green-100"
                        let estadoTexto = "Normal"
                        if (p.stockActual === 0) {
                            badgeColor = "bg-red-100 text-red-800 hover:bg-red-100"
                            estadoTexto = "Agotado"
                        } else if (p.stockActual <= p.stockMinimo) {
                            badgeColor = "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                            estadoTexto = "Bajo Stock"
                        }

                        return (
                            <TableRow key={p.id}>
                                <TableCell>
                                    <div className="font-medium">{p.nombre}</div>
                                    <div className="text-xs text-muted-foreground">{p.codigo}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{p.categoria}</Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="font-bold">
                                        {p.stockActual} <span className="text-xs font-normal text-gray-500">{p.unidadMedida}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    ${p.costoUnitario}
                                </TableCell>
                                <TableCell>
                                    <Badge className={badgeColor}>{estadoTexto}</Badge>
                                </TableCell>
                                <TableCell className="text-center space-x-1">
                                    <Button className="hover:bg-primary/20" variant="ghost" size="icon" onClick={() => { setProductoSeleccionado(p); setModalStockOpen(true) }} title="Ajustar Stock">
                                        <ArrowRightLeft className="h-4 w-4 text-primary/50 hover:text-primary"/>
                                    </Button>
                                    <Button  className="text-slate-400 hover:text-primary hover:bg-primary/10" variant="ghost" size="icon" onClick={() => { setProductoSeleccionado(p); setModalFormOpen(true) }} title="Editar Información">
                                        <Edit className="h-4 w-4 "/>
                                    </Button>
                                    <Button className=" text-slate-400 hover:text-red-600 hover:bg-red-500/10" variant="ghost" size="icon" onClick={() => handleOpenDelete(p)} title="Eliminar">
                                        <Trash2 className="h-4 w-4"/>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )
                    })
                )}
            </TableBody>
        </Table>
        
        </CardContent>
      </Card>

      
      {/* Crear / Editar Producto */}
      <ProductFormModal 
        isOpen={modalFormOpen} 
        onClose={() => setModalFormOpen(false)} 
        onSubmit={handleFormSubmit}
        productoEditar={productoSeleccionado}
      />

      {/* Reportes Generales */}
      <InventoryReports
        isOpen={modalReportsOpen}
        onClose={() => setModalReportsOpen(false)}
        datos={reportes}
      />

      {/* Ajuste de Stock (Entrada/Salida) */}
      <StockAdjustmentModal
         isOpen={modalStockOpen}
         onClose={() => setModalStockOpen(false)}
         producto={productoSeleccionado}
         onConfirm={registrarMovimiento}
      />

      {/*Predicción de inventario con IA */}
      <InventoryPredictionModal 
        isOpen={modalPredictionOpen}
        onClose={() => setModalPredictionOpen(false)}
        data={predictionData}
      />

      {/* Confirmación de Eliminación */}
      {productoAEliminar && (
        <DeleteConfirmModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleConfirmDelete}
            onSuccess={handleDeleteSuccess}
            mensajeEx={`El producto ${productoAEliminar.nombre} se ha desactivado correctamente.`}
            mensajeConf={
                <>
                  ¿Estás seguro de que deseas desactivar el producto <b>{productoAEliminar.nombre}</b>? 
                  <br/>Esta acción no se puede deshacer.
                </>
            }
        />
      )}
      
    </div>
  )
}