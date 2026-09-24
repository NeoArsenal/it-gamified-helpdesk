# Plan de Acción: Reestructuración de Inventario y Trazabilidad de Equipos (Estilo AliExpress)

## 1. Resumen Ejecutivo
Este plan define la reestructuración integral del módulo de **Inventario y Gestión Patrimonial de Hardware de Clínicas Limatambo**, transformando el flujo tradicional en un **ciclo de vida de hardware con trazabilidad completa de auditoría**:
1. **Fase de Alta en Almacén**: Registro rápido y simplificado al momento de la compra o ingreso físico del lote (Código, Tipo, Marca, Modelo, S/N y Código de Factura).
2. **Fase de Asignación Operativa**: Asignación posterior e independiente a Sede, Departamento, Área y Responsable.
3. **Fase de Operatividad y Taller**: Gestión de fallas, cambios de estado operativo y diagnóstico técnico.
4. **Trazabilidad en Vivo por Código QR**: Pantalla móvil responsive que muestra la historia del equipo con una **línea de tiempo vertical conectada por nodos (estilo seguimiento de paquetería de AliExpress)** al escanear la etiqueta física con cualquier celular.

---

## 2. Cambios en Base de Datos y Backend (`it-gamified-backend`)

### 2.1. Entidad `Activo` (`activo.entity.ts`)
* **Nuevo campo**:
  ```typescript
  @Column({ nullable: true })
  codigoFactura: string; // Ej: F001-002341 o Guía de Remisión
  ```
* **Nuevo estado en `EstadoActivo`**:
  ```typescript
  export enum EstadoActivo {
    DISPONIBLE = 'DISPONIBLE',   // En Almacén TI / Bodega (Sin asignar)
    OPERATIVO = 'OPERATIVO',     // Asignado en sede y funcionando
    REPARACION = 'REPARACION',   // En Taller por falla o mantenimiento
    BAJA = 'BAJA',               // Chatarra / Desincorporado patrimonial
    RESCATADO = 'RESCATADO',     // Piezas recicladas
  }
  ```
* **Estado por defecto**: `EstadoActivo.DISPONIBLE`.

### 2.2. DTOs de Transferencia
* `CreateActivoDto`: Agrega `codigoFactura?: string`. Se eliminan las exigencias de sede o responsable al nacer.
* `UpdateActivoDto`: Soporta actualización parcial de ubicación, responsable, estado y observaciones.

### 2.3. Motor de Auditoría y Trazabilidad Automática (`activos.service.ts`)
* **Al crear**: Registra automáticamente el primer hito de trazabilidad en `intervenciones`:
  `📦 Alta e ingreso a Almacén Central TI · Factura: ${codigoFactura}`.
* **Al asignar/reasignar**: Registra:
  `📍 Asignado a: Sede ${sede} - ${departamento} (${ubicacion}) · Responsable: ${responsable}`.
* **Al cambiar de estado (Falla o Taller)**: Registra:
  `⚠️ Cambio de estado a [${nuevoEstado}] · Diagnóstico: ${observaciones}`.

---

## 3. Rediseño del Formulario de Alta (`AssetFormModal.tsx`)

El modal de **"Registrar Nuevo Equipo"** se depura para agilizar el ingreso masivo en bodega:
* **Campos incluidos**:
  1. `Código Patrimonial *` (con botón para autogenerar).
  2. `Tipo de Equipo *` (Desktop, Laptop, Impresora, Monitor, Switch, etc.).
  3. `Marca` (HP, Lenovo, Dell, Epson, etc.).
  4. `Modelo` (ThinkPad L14, ProDesk 400, etc.).
  5. `Número de Serie (S/N)` (Grabado en chasis).
  6. `Código de Factura / Guía de Compra` *(Nuevo campo)*.
* **Campos retirados del modal de alta**: Sede, departamento, responsable, estado operativo y observaciones (el equipo entra automáticamente como *Disponible en Almacén*).

---

## 4. Nuevos Módulos de Gestión en el Frontend (`it-gamified-helpdesk`)

### 4.1. Modal de Asignación de Equipo (`AssetAssignModal.tsx`)
Permite tomar cualquier equipo en almacén y entregarlo a una estación de trabajo:
* Selector en cascada: Sede ➔ Departamento ➔ Área específica.
* Nombre del usuario / médico / técnico responsable.
* Actualiza el estado a `OPERATIVO` y dispara el evento en el historial.

### 4.2. Modal de Reporte de Falla / Diagnóstico (`AssetStatusModal.tsx`)
Cuando un equipo falla o requiere mantenimiento:
* Selector de nuevo estado: `EN TALLER / REPARACIÓN`, `OPERATIVO`, `BAJA / CHATARRA`, `EN ALMACÉN`.
* Campo amplio de **Observaciones Técnicas / Diagnóstico de la falla**.

### 4.3. Tabla Principal de Inventario (`AssetTable.tsx`)
* Muestra la factura junto al código y S/N.
* Insignia clara de **"En Almacén TI"** si aún no ha sido asignado.
* Botón de acceso directo a **"Trazabilidad"** para inspeccionar la historia completa del equipo.

---

## 5. Escaneo por Código QR: Timeline AliExpress (`/activo/[id]`)

Al escanear el QR físico con un teléfono:
1. **Cabecera de Ficha Técnica**:
   * Código de activo, Tipo, Marca, Modelo, S/N y Número de Factura.
   * Insignia del estado operativo actual con color codificado.
2. **Línea de Tiempo Vertical Conectada por Nodos (Timeline)**:
   * **Nodo superior (Estado Actual)**: Destacado en color azul/verde con halo luminoso pulsante y fecha/hora exacta.
   * **Nodos intermedios**: Asignaciones, traslados entre sedes, ingresos al taller y diagnósticos previos.
   * **Nodo base (Origen)**: Alta en almacén con el número de factura.
3. **Acciones Rápidas para el Técnico**:
   * Botón para reportar falla o agregar anotación técnica en el acto desde el celular.

---

## 6. Resumen de Implementación Completada

| Componente | Archivo | Estado |
| :--- | :--- | :--- |
| **Backend Entity** | `it-gamified-backend/src/activos/entities/activo.entity.ts` | ✅ Completado y Pushed |
| **Backend DTOs** | `it-gamified-backend/src/activos/dto/*.dto.ts` | ✅ Completado y Pushed |
| **Backend Auto-Audit** | `it-gamified-backend/src/activos/activos.service.ts` | ✅ Completado y Pushed |
| **Modal Alta Simplificado** | `it-gamified-helpdesk/src/components/inventory/AssetFormModal.tsx` | ✅ Completado |
| **Modal Asignación** | `it-gamified-helpdesk/src/components/inventory/AssetAssignModal.tsx` | ✅ Completado |
| **Modal Estado/Falla** | `it-gamified-helpdesk/src/components/inventory/AssetStatusModal.tsx` | ✅ Completado |
| **Modal Timeline Desktop** | `it-gamified-helpdesk/src/components/inventory/AssetTimelineModal.tsx` | ✅ Completado |
| **Tabla de Inventario** | `it-gamified-helpdesk/src/components/inventory/AssetTable.tsx` | ✅ Completado |
| **Vista Principal** | `it-gamified-helpdesk/src/components/views/InventoryView.tsx` | ✅ Completado |
| **QR Scan Móvil AliExpress** | `it-gamified-helpdesk/src/app/activo/[id]/page.tsx` | ✅ Completado |
