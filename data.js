/* ========================================
   MARGINMASTER PRO - DATABASE
   Matriz completa de pasarelas y tasas SUNAT 2026
   Golden Commerce Ecosystem
   ======================================== */

// ===== PASARELAS DE PAGO - PERÚ 2026 =====
const PASARELAS = {
    efectivo: {
        nombre: 'Efectivo',
        comision: 0,          // 0% de comisión
        fijo: 0,              // Sin tarifa fija
        aplicaIGV: false,     // No aplica IGV sobre comisión
        icono: '💵',
        descripcion: 'Sin comisiones'
    },
    yape: {
        nombre: 'Yape Personal',
        comision: 0,
        fijo: 0,
        aplicaIGV: false,
        icono: '📱',
        descripcion: 'Gratis entre personas'
    },
    'yape-empresa': {
        nombre: 'Yape Empresa',
        comision: 0.0295,     // 2.95%
        fijo: 0,
        aplicaIGV: false,
        icono: '📱',
        descripcion: '2.95% por transacción'
    },
    plin: {
        nombre: 'Plin Empresa',
        comision: 0.0295,     // 2.95%
        fijo: 0,
        aplicaIGV: false,
        icono: '📱',
        descripcion: '2.95% por transacción'
    },
    izipay: {
        nombre: 'Izipay',
        comision: 0.0344,     // 3.44%
        fijo: 0,
        aplicaIGV: true,      // Se cobra IGV sobre la comisión
        icono: '💳',
        descripcion: '3.44% + IGV'
    },
    niubiz: {
        nombre: 'Niubiz',
        comision: 0.0344,     // 3.44%
        fijo: 0,
        aplicaIGV: true,
        icono: '💳',
        descripcion: '3.44% + IGV'
    },
    culqi: {
        nombre: 'Culqi',
        comision: 0.0399,     // 3.99%
        fijo: 1.00,           // S/ 1.00 por transacción
        aplicaIGV: true,
        icono: '💳',
        descripcion: '3.99% + S/1.00 + IGV'
    },
    mercadopago: {
        nombre: 'Mercado Pago',
        comision: 0.0399,     // 3.99%
        fijo: 1.00,           // S/ 1.00 por transacción
        aplicaIGV: true,
        icono: '💳',
        descripcion: '3.99% + S/1.00 + IGV'
    }
};

// ===== REGÍMENES TRIBUTARIOS SUNAT 2026 =====
const REGIMENES = {
    rus: {
        nombre: 'Nuevo RUS',
        tasaRenta: 0.015,      // 1.5% sobre ingresos brutos
        aplicaIGV: false,      // No se paga IGV por separado
        descripcion: 'Régimen Único Simplificado - Ideal para pequeños negocios',
        limite: 96000          // Límite anual en soles
    },
    rer: {
        nombre: 'RER',
        tasaRenta: 0.015,      // 1.5% sobre ingresos netos
        aplicaIGV: true,       // Sí paga IGV 18%
        descripcion: 'Régimen Especial de Renta - Para negocios en crecimiento',
        limite: 525000         // Límite anual en soles
    },
    mype: {
        nombre: 'MYPE',
        tasaRenta: 0.10,       // 10% sobre utilidades
        aplicaIGV: true,       // Sí paga IGV 18%
        descripcion: 'Régimen MYPE Tributario - Micro y Pequeñas Empresas'
    },
    general: {
        nombre: 'Régimen General',
        tasaRenta: 0.295,      // 29.5% sobre utilidades
        aplicaIGV: true,       // Sí paga IGV 18%
        descripcion: 'Régimen General - Para empresas consolidadas'
    }
};

// ===== TASA IGV PERÚ =====
const IGV = 0.18; // 18%

// ===== CONFIGURACIÓN SEMÁFORO DE RENTABILIDAD =====
const SEMAFORO = {
    rojo: {
        min: 0,
        max: 15,
        icono: '🔴',
        mensaje: '¡Alerta! Rentabilidad crítica',
        color: '#dc2626',
        clase: 'semaforo-rojo'
    },
    naranja: {
        min: 15,
        max: 30,
        icono: '🟠',
        mensaje: 'Rentabilidad moderada - Puede mejorar',
        color: '#f59e0b',
        clase: 'semaforo-naranja'
    },
    verde: {
        min: 30,
        max: Infinity,
        icono: '🟢',
        mensaje: '¡Excelente! Rentabilidad óptima',
        color: '#10b981',
        clase: 'semaforo-verde'
    }
};

// ===== API ENDPOINTS =====
const API = {
    // API de tipo de cambio (Free)
    tipoCambio: 'https://api.exchangerate-api.com/v4/latest/USD',
    
    // Backup: API alternativa
    tipoCambioBackup: 'https://api.frankfurter.app/latest?from=USD&to=PEN',
    
    // Valor por defecto si falla
    tipoCambioDefault: 3.75
};

// ===== CONSTANTES DE CÁLCULO =====
const CALCULOS = {
    diasLaborablesMes: 26,        // Días hábiles promedio por mes
    horasDiarias: 8,              // Jornada laboral estándar
    semanasMes: 4.33,             // Semanas promedio por mes
    mesesAnio: 12,                // Meses del año
    mermaMaxima: 100,             // Porcentaje máximo de merma permitido
    precioMinimo: 0.01            // Precio mínimo aceptable
};

// ===== MENSAJES Y TEXTOS =====
const MENSAJES = {
    errorTipoCambio: 'No se pudo actualizar el tipo de cambio',
    exito: '✓ Cálculo realizado con éxito',
    advertenciaPrecio: '⚠️ El precio de venta debe ser mayor al costo total',
    advertenciaMerma: '⚠️ El porcentaje de merma parece muy alto',
    exportExito: '✓ Ticket exportado correctamente',
    cargando: 'Cargando...',
    noData: 'Sin datos'
};

// ===== FORMATOS =====
const FORMATOS = {
    moneda: {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    },
    porcentaje: {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    },
    numero: {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }
};

// ===== COLORES TEMÁTICOS =====
const COLORES = {
    principal: '#f59e0b',     // Amber-500
    secundario: '#ea580c',    // Orange-600
    exito: '#10b981',         // Green-500
    advertencia: '#f59e0b',   // Amber-500
    peligro: '#dc2626',       // Red-600
    info: '#3b82f6',          // Blue-500
    fondo: '#0f172a',         // Slate-950
    texto: '#e2e8f0'          // Slate-200
};

// ===== EXPORTAR PARA USO GLOBAL =====
// Estas variables ya están en el scope global por estar en data.js

console.log('✓ MarginMaster Pro - Data loaded successfully');
console.log('📊 Pasarelas disponibles:', Object.keys(PASARELAS).length);
console.log('🏛️ Regímenes SUNAT:', Object.keys(REGIMENES).length);