# Cómo probar el Historial Médico, Tratamientos y Procedimientos en Postman

## 1. HISTORIAL MÉDICO (CRUD)

### A. Crear Historial (Completo: Cita + Procedimientos + Tratamientos)
Crea todo en una sola transacción.
- **Método**: `POST`
- **URL**: `http://localhost:3001/api/1/historial`
- **Body JSON**:
```json
{
  "paciente_id": 50,
  "cita_id": null,
  "diagnostico": "Gastroenteritis",
  "notas_generales": "Dolor abdominal marcado.",
  "procedimientos": [
    { "nombre": "Ecografía", "notas": "Sin hallazgos" }
  ],
  "tratamientos": [
    { "medicamento_id": 102, "dosis": "10mg", "cantidad": 2, "instrucciones": "Oral", "duracion_dias": 3 }
  ]
}
```

### B. Ver LISTADO de Historiales (Recientes)
Obtiene los últimos 50 historiales de todos los pacientes, con sus detalles (Procedimientos y Tratamientos completos).
- **Método**: `GET`
- **URL**: `http://localhost:3001/api/1/historial`
- **Respuesta**: Array JSON detallado con todos los historiales.

### C. Buscar Historial (Avanzado)
Busca por nombre de paciente, dueño, vet, o diagnóstico.
- **Método**: `GET`
- **URL**: `http://localhost:3001/api/1/historial/buscar?q=Firulais`
- **URL (Por Procedimiento)**: `http://localhost:3001/api/1/historial/buscar?q=Limpieza` (Encuentra historiales donde se hizo 'Limpieza')

### D. Editar Historial (Cabecera)
Edita diagnóstico, notas, o reasigna paciente/vet.
- **Método**: `PUT`
- **URL**: `http://localhost:3001/api/1/historial/206`
- **Body JSON**:
  "diagnostico": "Diagnóstico Corregido",
  "notas": "Nuevas notas...",
  "peso": 4.5,             // Opcional: Corregir peso
  "temperatura": 39.1,     // Opcional: Corregir temperatura
  "fecha_visita": "2023-12-05 10:00:00", // Opcional: Backdating
  "id_paciente": 55,       // Opcional: Reasignar paciente
  "id_usuario": 22         // Opcional: Reasignar veterinario
}
```

### E. Eliminar Historial (Soft Delete)
**IMPORTANTE**: Esta acción eliminará (ocultará) también todos los tratamientos y procedimientos asociados a este historial.
- **Método**: `DELETE`
- **URL**: `http://localhost:3001/api/1/historial/206`
- **Body JSON**: No requerido (el ID viaja en URL).

---

## 2. TRATAMIENTOS (CRUD)

### A. Agregar Tratamiento (Individual)
Agrega un tratamiento a un historial existente y descuenta stock.
- **Método**: `POST`
- **URL**: `http://localhost:3001/api/1/tratamientos`
- **Body JSON**:
```json
{
  "id_historial_medico": 206,
  "id_paciente": 50,
  "prescripto_por": 21,
  "id_medicamento": 102,
  "dosis": "5ml",
  "cantidad": 1,
  "instrucciones": "Noche",
  "duracion_dias": 5,
  "notas": "Jarabe"
}
```

### B. Ver LISTADO de Tratamientos (Recientes)
- **Método**: `GET`
- **URL**: `http://localhost:3001/api/1/tratamientos`
- **Respuesta**: Array JSON con los últimos 50 tratamientos activos.

### C. Buscar Tratamientos
Busca por medicamento, paciente o vet.
- **Método**: `GET`
- **URL**: `http://localhost:3001/api/1/tratamientos/buscar?q=Paracetamol`

### C. Editar Tratamiento
- **Método**: `PUT`
- **URL**: `http://localhost:3001/api/1/tratamientos/50`
- **Body JSON**:
```json
{
  "dosis": "10ml",
  "instrucciones": "Mañana y Noche",
  "cantidad": 5 // Opcional: Si se envía, ajusta el stock (devuelve el anterior, resta el nuevo)
}
```

### D. Eliminar Tratamiento (Soft Delete)
- **Método**: `DELETE`
- **URL**: `http://localhost:3001/api/1/tratamientos/50`

---

## 3. PROCEDIMIENTOS (CRUD)

### A. Agregar Procedimiento (Individual)
- **Método**: `POST`
- **URL**: `http://localhost:3001/api/1/procedimientos`
- **Body JSON**:
```json
{
  "id_historial_medico": 206,
  "nombre_procedimiento": "Limpieza Dental",
  "notas": "Extracción de molar requerida"
}
```

### B. Editar Procedimiento
- **Método**: `PUT`
- **URL**: `http://localhost:3001/api/1/procedimientos/15`
- **Body JSON**:
```json
{
  "nombre_procedimiento": "Limpieza Dental Profunda",
  "notas": "Se aplicó anestesia local"
}
```

### C. Eliminar Procedimiento (Soft Delete)
- **Método**: `DELETE`
- **URL**: `http://localhost:3001/api/1/procedimientos/15`
