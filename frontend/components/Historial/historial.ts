export interface Procedimiento {
  id: number;
  nombre_procedimiento: string;
  realizado_en?: string;
  estado?: string;
  notas?: string;
}

export interface TratamientoHistorial {
  id: number;
  dosis: string;
  instrucciones: string;
  medicamento_nombre?: string;
  estado: string;
}

export interface HistorialMedico {
  id: number;
  fecha_visita: string;
  diagnostico: string;
  notas_generales: string;
  id_cita: number | null;
  paciente_nombre?: string;
  paciente_id?: number;
  paciente?: { id: number; nombre: string; detalle?: string };
  dueño_nombre?:string;
  veterinario_nombre?: string;
  veterinario?: string;
  veterinario_id?: number;
  procedimientos: Procedimiento[] | string[];
  tratamientos: TratamientoHistorial[];
}