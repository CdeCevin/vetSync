"use client"

import { useState, useCallback, useMemo } from "react"
import { useAuth } from "@/components/user-context"
import { ROUTES } from "@/apiRoutes" 
import { Producto } from "../components/Inventario/inventario"

export function useInventoryService() {
  const { usuario, token, fetchWithAuth } = useAuth()
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(false)

  const idClinica = usuario?.id_clinica
  const baseUrl = idClinica ? `${ROUTES.base}/${idClinica}/Inventarios` : ""

  const cargarProductos = useCallback(async () => {
    if (!idClinica || !token) return

    setLoading(true)
    try {
      const response = await fetchWithAuth(baseUrl, {
        cache: "no-store",
      })
      
      if (!response.ok) throw new Error("Error al cargar inventario")
      
      const data = await response.json()
      
      // Mapeo de datos para asegurar tipos numéricos
      const productosFormateados = data.map((item: any) => ({
        ...item,
        costoUnitario: Number(item.costoUnitario),
        stockActual: Number(item.stockActual),
        stockMinimo: Number(item.stockMinimo)
      }))

      setProductos(productosFormateados)
    } catch (error) {
      console.error("Error loading inventory:", error)
    } finally {
      setLoading(false)
    }
  }, [idClinica, token, fetchWithAuth, baseUrl])

  const crearProducto = useCallback(async (data: Omit<Producto, "id" | "estado">) => {
    if (!idClinica) throw new Error("No hay clínica asociada")
    console.log(data)
    const response = await fetchWithAuth(baseUrl, {
      method: "POST",
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Error al crear producto")
    }
    
    await cargarProductos()
  }, [idClinica, fetchWithAuth, baseUrl, cargarProductos])

  const editarProducto = useCallback(async (id: string, data: Partial<Producto>) => {
    if (!idClinica) throw new Error("No hay clínica asociada")

    const { stockActual, ...dataParaEnviar } = data

    const response = await fetchWithAuth(`${baseUrl}/${id}`, {
      method: "PUT",
      body: JSON.stringify(dataParaEnviar)
    })

    if (!response.ok) {
      throw new Error("Error al actualizar producto")
    }
    await cargarProductos()
  }, [idClinica, fetchWithAuth, baseUrl, cargarProductos])

  const registrarMovimiento = useCallback(async (idProducto: string, tipo: "entrada" | "salida" | "ajuste", cantidad: number, motivo: string) => {
    if (!idClinica) throw new Error("No hay clínica asociada")

    const payload = {
      tipo,
      cantidad,
      motivo
    }

    const response = await fetchWithAuth(`${baseUrl}/${idProducto}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Error al registrar movimiento")
    }

    await cargarProductos()
  }, [idClinica, fetchWithAuth, baseUrl, cargarProductos])

  const eliminarProducto = useCallback(async (id: string) => {
    if (!idClinica) throw new Error("No hay clínica asociada")

    const response = await fetchWithAuth(`${baseUrl}/${id}`, {
      method: "DELETE"
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "No se pudo eliminar el producto")
    }
    
    await cargarProductos()
  }, [idClinica, fetchWithAuth, baseUrl, cargarProductos])

  const obtenerReportes = useCallback(async () => {
  if (!idClinica || !token) return null;

  const response = await fetchWithAuth(`${baseUrl}/reporte`, {
      cache: "no-store",
    });

    if (!response.ok) throw new Error("Error al obtener reportes");

    const data = await response.json();

    return {
      valorTotal: data.valorTotal,
      productosBajoStock: data.productosBajoStock,
      productosAgotados: data.productosAgotados,
      ultimosMovimientos: data.ultimosMovimientos
    };
  }, [idClinica, token, fetchWithAuth, baseUrl]);


  // ARREGLAR
  const generarReportes = useCallback(() => {
    const totalValor = productos.reduce((acc, p) => acc + (p.stockActual * p.costoUnitario), 0)
    const stockBajo = productos.filter(p => p.stockActual <= p.stockMinimo)
    return { 
        totalValor, 
        stockBajo, 
        totalItems: productos.length 
    }
  }, [productos])

  return useMemo(() => ({
    productos, 
    loading, 
    cargarProductos, 
    crearProducto, 
    editarProducto, 
    eliminarProducto, 
    registrarMovimiento, 
    generarReportes,
    obtenerReportes
  }), [
    productos, 
    loading, 
    cargarProductos, 
    crearProducto, 
    editarProducto, 
    eliminarProducto, 
    registrarMovimiento, 
    generarReportes,
    obtenerReportes
  ])
}