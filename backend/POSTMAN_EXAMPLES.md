# Cómo probar el Historial Médico en Postman

Gracias a la implementación transaccional (`crearHistorial.js`), puedes realizar las 3 acciones (Crear Historial, Asignar Tratamiento + Descontar Stock, Asignar Procedimiento) en **una sola petición**.

## Configuración de la Petición

- **Método**: `POST`
- **URL**: `http://localhost:3001/api/1/historial`
  - *(Reemplaza `1` con el ID real de la clínica si es distinto)*.
- **Headers**:
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer TU_TOKEN_JWT_AQUI`
    - *(Debes estar logueado como Veterinario o Admin)*.

## Body (JSON)

Copia y pega este JSON en la pestaña **Body** -> **raw**:

```json
{
  "paciente_id": 50,
  "cita_id": null,
  "diagnostico": "Gastritis Aguda Severa",
  "notas_generales": "El paciente presenta dolor abdominal y vómitos.",
  
  "procedimientos": [
    {
      "nombre": "Ecografía Abdominal",
      "notas": "Se observa inflamación en paredes gástricas."
    }
  ],

  "tratamientos": [
    {
      "medicamento_id": 102, 
      "dosis": "1 comprimido",
      "instrucciones": "Cada 12 horas por 3 días",
      "duracion_dias": 3,
      "notas": "Entregado en consulta",
      "cantidad": 2
    }
  ]
}
```

### Claves del JSON:
1.  **`cita_id`**: Puede ser `null` (Urgencia) o un ID (ej: `105`) para cerrar la cita automáticamente.
2.  **`procedimientos`**: Array de objetos. Cada uno crea una fila en la tabla `Procedimientos`.
3.  **`tratamientos`**:
    - **`cantidad`**: **IMPORTANTE**. Este campo es el que activa el descuento de inventario.
        - Ejemplo: `"cantidad": 2` restará 2 unidades al item con ID `102` en `Inventario_Items`.
        - Este número **no se guarda** en la tabla `Tratamientos` (por limitación de esquema), solo se usa para la transacción de stock.
    - **`dosis`, `instrucciones`**: Se guardan como texto en el registro del tratamiento.

## Ejemplo Específico: Paciente #7 (Paso 1: Solo Historial)

Aquí creamos solo la cabecera del evento. Como tiene `notas_generales`, pasa la validación.

**URL**: `POST /api/1/historial`

```json
{
  "paciente_id": 7,
  "cita_id": null,
  "diagnostico": "Dermatitis Alérgica",
  "notas_generales": "Paciente presenta irritación en la zona lumbar. Se sospecha alergia a pulgas."
}
```
*Esto devolverá un ID (ej: `206`). Guárdalo para los siguientes pasos.*

## Ejemplo Específico: Paciente #7 (Paso 2: Agregar Tratamiento)

Ahora agregamos el tratamiento al historial `206`.

**URL**: `POST /api/1/tratamientos`

```json
{
  "id_paciente": 7,
  "id_historial_medico": 206,
  "prescripto_por": 21,
  "id_medicamento": 102,
  "dosis": "10mg",
  "cantidad": 1,
  "instrucciones": "Oral cada 24 hrs por 5 días",
  "duracion_dias": 5,
  "notas": "Corticoide"
}
```

## Ejemplo Específico: Paciente #7 (Paso 3: Agregar Procedimiento)

**URL**: `POST /api/1/procedimientos`

```json
{
  "id_historial_medico": 206,
  "nombre_procedimiento": "Raspado de piel",
  "notas": "Muestra tomada para cultivo."
}
```
*Al enviar esto, el sistema valida que tengas al menos una "Resolución" (Notas, Procedimientos o Tratamientos), crea el historial, guarda el raspado, guarda la receta y resta 1 unidad del item 102.*

## Agregar más cosas tarde (Flujo "Se me olvidó algo")

Sí, puedes agregar más procedimientos o tratamientos a ese mismo historial (digamos que el ID generado fue `500`) en cualquier momento.

**URL**: `POST /api/1/procedimientos`

```json
{
  "id_historial_medico": 500,
  "nombre_procedimiento": "Limpieza de herida",
  "notas": "Se realiza aseo quirúrgico de la zona afectada."
}
```
*Esto insertará el nuevo procedimiento vinculado a la visita original, sin tener que crear una visita nueva.*
