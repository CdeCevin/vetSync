"use client"

import { useState, useCallback } from "react"
import { Producto, MovimientoStock } from "../components/Inventario/inventario"

// Datos iniciales falsos
let MOCK_DB: Producto[] = [
  { id: "1", codigo: "MED-001", nombre: "Amoxicilina", categoria: "Medicamento", stockActual: 15, stockMinimo: 20, unidadMedida: "cajas", costoUnitario: 5000, estado: "activo" },
  { id: "2", codigo: "INS-002", nombre: "Guantes Latex", categoria: "Insumo", stockActual: 0, stockMinimo: 50, unidadMedida: "unidades", costoUnitario: 100, estado: "activo" },
]

export function useInventoryService() {
  const [productos, setProductos] = useState<Producto[]>(MOCK_DB)
  const [loading, setLoading] = useState(false)

  // VS-002: Obtener productos
    const cargarProductos = useCallback(async () => {
        setLoading(true)
        return new Promise<void>((resolve) => {
            setTimeout(() => {
            setProductos(MOCK_DB.filter((p) => p.estado === "activo"))
            setLoading(false)
            resolve()
            }, 400)
        })
    }, [])

  // VS-003: Crear Producto
    const crearProducto = async (data: Omit<Producto, "id" | "estado">) => {
        setLoading(true)
        const existe = MOCK_DB.some(p => p.codigo === data.codigo && p.estado === 'activo')
        if (existe) throw new Error("El código ya existe (VS-003)")

        const nuevo: Producto = { ...data, id: crypto.randomUUID(), estado: "activo" }
        MOCK_DB.push(nuevo)
        await cargarProductos()
    }

    const editarProducto = async (id: string, data: Partial<Producto>) => {
        setLoading(true)
        const index = MOCK_DB.findIndex(p => p.id === id)
        if (index === -1) throw new Error("Producto no encontrado")

        // Regla VS-004: No se puede editar stock actual directamente aquí
        if (data.stockActual !== undefined) delete data.stockActual 

        MOCK_DB[index] = { ...MOCK_DB[index], ...data }
        await cargarProductos()
    }
    

  // VS-005: Ajuste de Stock
  const registrarMovimiento = async (idProducto: string, tipo: "entrada" | "salida" | "ajuste", cantidad: number, motivo: string) => {
    setLoading(true)
    const index = MOCK_DB.findIndex((p) => p.id === idProducto)
    if (index === -1) throw new Error("Producto no encontrado")

    const producto = MOCK_DB[index]
    let nuevoStock = producto.stockActual

    if (tipo === "entrada") nuevoStock += cantidad
    if (tipo === "salida") nuevoStock -= cantidad
    if (tipo === "ajuste") nuevoStock = cantidad

    if (nuevoStock < 0) {
        setLoading(false)
        throw new Error("El stock no puede ser negativo")
    }

    // Actualizamos la "Base de Datos"
    MOCK_DB[index] = { ...producto, stockActual: nuevoStock }
    await cargarProductos()
  }

  // VS-006: Eliminación (Soft Delete) con validación
    const eliminarProducto = async (id: string) => {
        const producto = MOCK_DB.find(p => p.id === id)
        // Regla VS-006: Solo si stock es 0
        if (producto && producto.stockActual > 0) {
            throw new Error("No se puede eliminar productos con stock > 0 (VS-006)")
        }

        const index = MOCK_DB.findIndex(p => p.id === id)
        MOCK_DB[index] = { ...MOCK_DB[index], estado: "inactivo" }
        await cargarProductos()
    }

    const generarReportes = () => {
        const totalValor = productos.reduce((acc, p) => acc + (p.stockActual * p.costoUnitario), 0)
        const stockBajo = productos.filter(p => p.stockActual <= p.stockMinimo)
        return { totalValor, stockBajo, totalItems: productos.length }
    }

    return { productos, loading, cargarProductos, crearProducto, editarProducto, eliminarProducto, generarReportes,registrarMovimiento }
}