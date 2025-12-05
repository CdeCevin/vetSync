export interface Tratamiento {
  id: string;
  pacienteId: string;
  pacienteNombre: string; // Para mostrar en la tabla sin hacer otro fetch
  veterinarioId: string;
  veterinarioNombre: string; 
  fechaPrescripcion: string; 
  medicamento: string; 
  dosis: string;
  instrucciones: string;
  duracionDias: number;
  notas?: string;
  estado: "Activo" | "Completado" | "Cancelado";
  editado?: boolean; 
}