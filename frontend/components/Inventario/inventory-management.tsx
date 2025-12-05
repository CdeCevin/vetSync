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
import { 
  Edit, Trash2, FileBarChart, Plus, ArrowRightLeft, 
  Search, Package, AlertTriangle, TrendingDown 
} from "lucide-react"

export function InventoryManagement() {
  const { 
    productos, 
    cargarProductos, 
    crearProducto, 
    editarProducto, 
    eliminarProducto, 
    registrarMovimiento, 
    generarReportes 
  } = useInventoryService()
  
  const { onOpen: openAlert } = useAlertStore()

  const [modalFormOpen, setModalFormOpen] = useState(false)
  const [modalReportsOpen, setModalReportsOpen] = useState(false)
  const [modalStockOpen, setModalStockOpen] = useState(false)
  
  // Modal de Eliminación
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null)
  
  // Selección para Edición/Ajuste
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null)

  // Filtros
  const [busqueda, setBusqueda] = useState("")
  const [filtroCategoria, setFiltroCategoria] = useState("todos")
  const [filtroEstado, setFiltroEstado] = useState("todos")

  // Carga inicial (revisar porque aqui normalmente se producen los bucles !!)
  useEffect(() => { cargarProductos() }, [cargarProductos])

  // filtrado
  const productosFiltrados = productos.filter((item) => {
    const coincideBusqueda = 
      item.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      item.codigo.toLowerCase().includes(busqueda.toLowerCase())
    
    const coincideCategoria = filtroCategoria === "todos" || item.categoria === filtroCategoria
    
    // Cálculo de estado para filtro (REvisar, esto podria venir ya calculado desde el backend con un estado,,)
    let estadoItem = "Normal"
    if (item.stockActual === 0) estadoItem = "Agotado"
    else if (item.stockActual <= item.stockMinimo) estadoItem = "Bajo Stock"

    const coincideEstado = filtroEstado === "todos" || 
                          (filtroEstado === "agotado" && estadoItem === "Agotado") ||
                          (filtroEstado === "bajo" && estadoItem === "Bajo Stock") ||
                          (filtroEstado === "normal" && estadoItem === "Normal")

    return coincideBusqueda && coincideCategoria && coincideEstado
  })

  // --- Mas calculos para los cards (REvisar, esto podria venir ya calculado desde el backend con un estado,,)
  const stockBajo = productos.filter(p => p.stockActual <= p.stockMinimo && p.stockActual > 0).length
  const agotados = productos.filter(p => p.stockActual === 0).length

  // Guardar (Crear/Editar)
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

  // Lógica de eliminacion (REVISAR))
  
  // Abrir modal
  const handleOpenDelete = (producto: Producto) => {
    setProductoAEliminar(producto)
    setIsDeleteModalOpen(true)
  }

  // Función async para onConfirm
  const handleConfirmDelete = async () => {
      if (!productoAEliminar) return
      // El modal manejará el loading y el try/catch internamente
      await eliminarProducto(productoAEliminar.id) 
  }

  // Función post-éxito para onSuccess
  const handleDeleteSuccess = () => {
      cargarProductos() // Recargamos la lista
      setProductoAEliminar(null)
  }

  return (
    <div className="p-6 space-y-6">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold font-serif">Gestión de Inventario</h1>
            <p className="text-gray-500">Administra tus insumos y medicamentos</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => setModalReportsOpen(true)}>
                <FileBarChart className="mr-2 h-4 w-4"/> Reportes
            </Button>
            <Button onClick={() => { setProductoSeleccionado(null); setModalFormOpen(true) }}>
                <Plus className="mr-2 h-4 w-4"/> Nuevo Producto
            </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productos.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stockBajo}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Agotado</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{agotados}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar por nombre, código..."
            className="pl-9"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
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

      {/* TABLA PRINCIPAL */}
      <div className="border rounded-md bg-white">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Costo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
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
                                    <div className="text-xs text-gray-500">{p.codigo}</div>
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
                                <TableCell className="text-right space-x-1">
                                    <Button variant="ghost" size="icon" onClick={() => { setProductoSeleccionado(p); setModalStockOpen(true) }} title="Ajustar Stock">
                                        <ArrowRightLeft className="h-4 w-4 text-blue-500"/>
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => { setProductoSeleccionado(p); setModalFormOpen(true) }} title="Editar">
                                        <Edit className="h-4 w-4 text-gray-600"/>
                                    </Button>
                                    {/* Botón Eliminar abre el modal */}
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenDelete(p)} title="Eliminar">
                                        <Trash2 className="h-4 w-4 text-red-500"/>
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )
                    })
                )}
            </TableBody>
        </Table>
      </div>

      {/* --- MODALES --- */}
      {/* Crear / Editar */}
      <ProductFormModal 
        isOpen={modalFormOpen} 
        onClose={() => setModalFormOpen(false)} 
        onSubmit={handleFormSubmit}
        productoEditar={productoSeleccionado}
      />

      {/* Reportes */}
      <InventoryReports
        isOpen={modalReportsOpen}
        onClose={() => setModalReportsOpen(false)}
        datos={generarReportes()}
      />

      {/*Ajuste de Stock */}
      <StockAdjustmentModal
         isOpen={modalStockOpen}
         onClose={() => setModalStockOpen(false)}
         producto={productoSeleccionado}
         onConfirm={registrarMovimiento}
      />

      {/*Confirmar Eliminación*/}
      {productoAEliminar && (
        <DeleteConfirmModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleConfirmDelete}
            onSuccess={handleDeleteSuccess}
            mensajeEx={`El producto ${productoAEliminar.nombre} se ha eliminado correctamente.`}
            mensajeConf={
                <>
                  ¿Estás seguro de que deseas desactivar el producto <b>{productoAEliminar.nombre}</b>? 
                  <br/>Esta acción ocultará el producto de la lista activa.
                </>
            }
        />
      )}
      
    </div>
  )
}