export type CategoriaProducto = "Medicamento" | "Insumo" | "Equipo" | "Alimento" | "Otro";

export interface Producto {
  id: string;
  codigo: string;
  nombre: string; 
  categoria: CategoriaProducto; 
  descripcion?: string; 
  stockActual: number; 
  stockMinimo: number; 
  unidadMedida: string; 
  fechaExpiracion?: Date; 
  estado: "activo" | "inactivo"; 
  costoUnitario: number;
}

export interface MovimientoStock {
  id: string;
  productoId: string;
  tipo: "entrada" | "salida" | "ajuste";
  cantidad: number;
  motivo?: string;
  fecha: Date;
  usuario: string;
}