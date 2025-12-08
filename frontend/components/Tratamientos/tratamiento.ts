export interface Tratamiento {
  id: number;
  pacienteId: number;
  pacienteNombre: string;
  veterinarioId: number;
  veterinarioNombre: string;
  fechaPrescripcion: string;
  medicamento: string;
  medicamentoId?: number; 
  dosis: string;
  instrucciones: string;
  duracionDias: number;
  notas: string;
  estado: string;
  editado: boolean;
}