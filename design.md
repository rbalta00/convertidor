# Diseño: Hoja Membretada para Cotizaciones

## 📋 Descripción General
Hoja de cotización profesional, editable y lista para imprimir/descargar como PDF. Diseño limpio y corporativo con membrete personalizable.

---

## 🎨 Sistema de Colores

| Token | Valor | Uso |
|-------|-------|-----|
| **primary** | `#1e40af` | Encabezados, títulos, acentos, botones |
| **primary-light** | `#dbeafe` | Fondo de tabla header |
| **gray-100** | `#f3f4f6` | Fondos de input, filas alternas |
| **gray-200** | `#e5e7eb` | Bordes, divisores |
| **gray-600** | `#4b5563` | Texto secundario, etiquetas |
| **gray-900** | `#111827` | Texto principal |
| **text** | `#111827` | Color de texto general |

**Modo oscuro:** Los colores se invierten automáticamente respetando `prefers-color-scheme`.

---

## 📝 Tipografía

| Elemento | Tipografía | Tamaño | Peso | Notas |
|----------|-----------|--------|------|-------|
| **Nombre Empresa** | Sans-serif sistema | 28px | 700 | Color primary, bold |
| **Título "COTIZACIÓN"** | Sans-serif sistema | 24px | 600 | Alineado derecha |
| **Secciones** | Sans-serif sistema | 12px | 600 | UPPERCASE, letter-spacing 0.5px |
| **Etiquetas** | Sans-serif sistema | 11px | 600 | UPPERCASE, letter-spacing 0.5px |
| **Texto Body** | Sans-serif sistema | 14px | 400 | Párrafos, inputs |
| **Tabla** | Sans-serif sistema | 13px | 400 | Datos tabulares |

**Stack:** `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif`

---

## 🏗️ Estructura y Layout

```
┌─────────────────────────────────────────┐
│        MEMBRETE / HEADER                │
│  [Logo] Empresa    [COTIZACIÓN] Folio   │
│  RFC, Tel, Email       Fecha            │
├─────────────────────────────────────────┤
│  DATOS CLIENTE              DOMICILIO   │
│  [Campos]                   [Campos]    │
├─────────────────────────────────────────┤
│  CONCEPTOS DE COTIZACIÓN                │
│  ┌──────────────────────────────────┐   │
│  │ Descripción | Qty | Precio | Total   │
│  ├──────────────────────────────────┤   │
│  │ [Row 1]                             │
│  │ [Row 2]                             │
│  └──────────────────────────────────┘   │
│  [+ Agregar Línea]                      │
├─────────────────────────────────────────┤
│                      Subtotal: $XXX      │
│                      IVA (16%): $XXX     │
│                      TOTAL:     $XXX     │
├─────────────────────────────────────────┤
│  NOTAS Y TÉRMINOS                       │
│  [Textarea con términos predefinidos]   │
├─────────────────────────────────────────┤
│  [🖨️ Imprimir] [📥 Descargar PDF] [🔄 Limpiar] │
└─────────────────────────────────────────┘
```

---

## 🎯 Secciones

### **1. Membrete (Header)**
- Espacio para logo (100x100px placeholder)
- Nombre empresa (editable, input text)
- Datos contacto: RFC, Teléfono, Email
- Título "COTIZACIÓN" alineado derecha
- Folio y Fecha

**CSS:**
```css
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 3px solid var(--primary);
}
```

---

### **2. Datos del Cliente (Two-Column)**
Sección izquierda:
- Nombre/Empresa
- RFC/RUT
- Email
- Teléfono

Sección derecha:
- Calle y Número
- Ciudad
- Estado/Provincia
- Código Postal

```css
.two-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}
```

---

### **3. Tabla de Items**
**Columnas:**
- Descripción (40%)
- Cantidad (15%)
- Precio Unitario (15%)
- Subtotal (15%)
- Acción (15%)

**Estilos:**
- Header: Fondo `primary-light`, texto `primary`
- Filas alternas: Fondo `gray-100`
- Inputs sin borde, transparentes
- Números con `font-variant-numeric: tabular-nums`

---

### **4. Totales**
Alineados a la derecha, ancho 300px:
- Subtotal (normal)
- IVA 16% (calculado automático)
- **TOTAL** (highlighted, color primary, font-weight 700)

```css
.total-row.grand {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary);
  border-top: 1px solid var(--border);
  padding-top: 8px;
}
```

---

### **5. Notas y Términos**
- Textarea con fondo `gray-100`
- Texto predefinido de ejemplo
- Min-height: 80px
- Editable

---

### **6. Botones de Acción**
Cinco botones centrados, flexibles:
- **🖨️ Imprimir** (Primary - Azul) - Abre dialog de impresión del navegador
- **📥 PDF** (Primary - Azul) - Descarga como PDF (html2pdf.js)
- **📄 Word** (Primary - Azul) - Descarga como .docx editable (docx.js)
- **☁️ Drive** (Secondary - Gris) - Instrucciones para Google Drive
- **🔄 Limpiar** (Secondary - Gris) - Reinicia formulario

```css
.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
}
```

---

## 📱 Responsive

- **Desktop (900px):** Layout completo, dos columnas
- **Tablet (600px):** Dos columnas se apilan a una
- **Mobile (< 600px):** Una columna, fuentes y padding reducidos

```css
@media (max-width: 600px) {
  .two-column {
    grid-template-columns: 1fr;
  }
  /* Botones se apilan verticalmente */
}
```

---

## 🖨️ Impresión

- **Fondo:** Blanco puro
- **Color:** Negro sólido (no temas)
- **Ajustes de color:** `print-color-adjust: exact`
- **Ocultos al imprimir:** Botones de acción
- **Inputs:** Se muestran como texto plano

```css
@media print {
  .actions {
    display: none;
  }
  input, textarea {
    border: none;
    background: transparent !important;
    color: #000 !important;
  }
}
```

---

## ⚙️ Funcionalidad JavaScript

### **Cálculos Automáticos**
- Al cambiar Cantidad o Precio → Se recalcula Subtotal
- Se actualiza IVA (16%) automático
- Se actualiza TOTAL automático

### **Métodos**
- `addRow()` - Agrega nueva línea a la tabla
- `removeRow(btn)` - Elimina línea (mínimo 1 requerida)
- `calculateRow(row)` - Recalcula subtotal de una fila
- `updateTotals()` - Actualiza subtotal, IVA y total
- `printDocument()` - Abre dialog de impresión del navegador
- `downloadPDF()` - Genera y descarga PDF (html2pdf.js)
- `downloadWord()` - Genera y descarga .docx con formato de tabla
- `saveToDrive()` - Muestra instrucciones para Google Drive
- `resetForm()` - Limpia toda la cotización con confirmación

### **Formatos**
- Moneda: `Intl.NumberFormat('es-MX', currency: 'MXN')`
- Resultado: `$XXX.XX`

---

## 📦 Dependencias

- **html2pdf.js v0.10.1** - CDN Cloudflare
  - Convierte HTML a PDF para descarga
  - URL: `https://cdnjs.cloudflare.com/ajax/libs/html2pdf/0.10.1/html2pdf.bundle.min.js`

- **docx.js v8.5.0** - CDN jsDelivr
  - Genera documentos Word (.docx) con tablas, estilos, formatos
  - URL: `https://cdnjs.cloudflare.com/ajax/libs/docx/8.5.0/docx.min.js`
  - Usado en la función `downloadWord()`

---

## 🎨 Customización

Para personalizar:

1. **Colores:** Editar tokens `:root`
2. **Tipografía:** Cambiar `font-family`
3. **Logo:** Reemplazar placeholder por `<img>`
4. **Términos:** Cambiar texto predefinido en textarea
5. **IVA:** Cambiar `0.16` por otro porcentaje en `calculateRow()`
6. **Moneda:** Cambiar `'es-MX'` y `'MXN'` en `formatCurrency()`

---

## ✨ Características Especiales

- ✅ **Tema Claro/Oscuro** - Respeta preferencias del SO
- ✅ **Impresión Optimizada** - Se ve perfecta al imprimir
- ✅ **Cálculos Automáticos** - Sin errores manuales
- ✅ **Múltiples Formatos de Descarga**
  - PDF (html2pdf.js)
  - Word editable (.docx con docx.js)
  - Google Drive (instrucciones integradas)
- ✅ **Responsivo** - Funciona en móvil, tablet, desktop
- ✅ **Almacenamiento Local** - Guarda datos (opcional, con localStorage)
- ✅ **Sin dependencias pesadas** - Solo dos librerías CDN ligeras

---

## 📱 Integraciones Externas

### **Google Drive**
1. Descarga la cotización en PDF o Word
2. Ve a [Google Drive](https://drive.google.com)
3. Sube el archivo o crea un documento
4. Comparte el enlace con el cliente

**Ventajas:**
- Historial de versiones automático
- Acceso desde cualquier dispositivo
- Comentarios colaborativos
- Fácil de compartir

### **Google Docs (Alternativa)**
- Copia el contenido de la cotización
- Pégalo en Google Docs
- Formatea manualmente si es necesario
- Colabora en tiempo real

---

## 📄 Casos de Uso

✓ Cotizaciones de servicios  
✓ Presupuestos de productos  
✓ Proformas para facturas  
✓ Presupuestos de reparación  
✓ Cotizaciones de proyectos  

---

**Versión:** 1.0  
**Última actualización:** 2025-09-19  
**Estado:** ✅ Listo para usar
