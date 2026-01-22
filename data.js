/* ========================================
   MARGINMASTER PRO ULTRA - DATABASE
   Matriz Global Multipaís + APIs Avanzadas
   Golden Commerce Ecosystem v2.0
   ======================================== */

// ===== CONFIGURACIÓN MULTIPAÍS =====
const PAISES = {
    PE: {
        nombre: 'Perú',
        moneda: 'PEN',
        simbolo: 'S/',
        iva: 0.18,
        nombreIVA: 'IGV',
        pasarelas: {
            efectivo: { nombre: 'Efectivo', comision: 0, fijo: 0, aplicaIVA: false, icono: '💵' },
            yape: { nombre: 'Yape Personal', comision: 0, fijo: 0, aplicaIVA: false, icono: '📱' },
            'yape-empresa': { nombre: 'Yape Empresa', comision: 0.0295, fijo: 0, aplicaIVA: false, icono: '📱' },
            plin: { nombre: 'Plin Empresa', comision: 0.0295, fijo: 0, aplicaIVA: false, icono: '📱' },
            izipay: { nombre: 'Izipay', comision: 0.0344, fijo: 0, aplicaIVA: true, icono: '💳' },
            niubiz: { nombre: 'Niubiz', comision: 0.0344, fijo: 0, aplicaIVA: true, icono: '💳' },
            culqi: { nombre: 'Culqi', comision: 0.0399, fijo: 1.00, aplicaIVA: true, icono: '💳' },
            mercadopago: { nombre: 'Mercado Pago', comision: 0.0399, fijo: 1.00, aplicaIVA: true, icono: '💳' }
        },
        regimenes: {
            rus: { nombre: 'Nuevo RUS', tasaRenta: 0.015, aplicaIVA: false },
            rer: { nombre: 'RER', tasaRenta: 0.015, aplicaIVA: true },
            mype: { nombre: 'MYPE', tasaRenta: 0.10, aplicaIVA: true },
            general: { nombre: 'Régimen General', tasaRenta: 0.295, aplicaIVA: true }
        }
    },
    MX: {
        nombre: 'México',
        moneda: 'MXN',
        simbolo: '$',
        iva: 0.16,
        nombreIVA: 'IVA',
        pasarelas: {
            efectivo: { nombre: 'Efectivo', comision: 0, fijo: 0, aplicaIVA: false, icono: '💵' },
            oxxo: { nombre: 'OXXO Pay', comision: 0.035, fijo: 8, aplicaIVA: true, icono: '🏪' },
            conekta: { nombre: 'Conekta', comision: 0.036, fijo: 3, aplicaIVA: true, icono: '💳' },
            openpay: { nombre: 'OpenPay', comision: 0.029, fijo: 2.5, aplicaIVA: true, icono: '💳' },
            stripe: { nombre: 'Stripe', comision: 0.036, fijo: 3, aplicaIVA: true, icono: '💳' },
            mercadopago: { nombre: 'Mercado Pago', comision: 0.0399, fijo: 4, aplicaIVA: true, icono: '💳' }
        },
        regimenes: {
            resico: { nombre: 'RESICO', tasaRenta: 0.01, aplicaIVA: true },
            simplificado: { nombre: 'Simplificado de Confianza', tasaRenta: 0.025, aplicaIVA: true },
            general: { nombre: 'Régimen General', tasaRenta: 0.30, aplicaIVA: true }
        }
    },
    CO: {
        nombre: 'Colombia',
        moneda: 'COP',
        simbolo: '$',
        iva: 0.19,
        nombreIVA: 'IVA',
        pasarelas: {
            efectivo: { nombre: 'Efectivo', comision: 0, fijo: 0, aplicaIVA: false, icono: '💵' },
            nequi: { nombre: 'Nequi', comision: 0.02, fijo: 0, aplicaIVA: false, icono: '📱' },
            daviplata: { nombre: 'Daviplata', comision: 0.02, fijo: 0, aplicaIVA: false, icono: '📱' },
            bold: { nombre: 'Bold', comision: 0.0299, fijo: 0, aplicaIVA: true, icono: '💳' },
            wompi: { nombre: 'Wompi', comision: 0.0349, fijo: 900, aplicaIVA: true, icono: '💳' },
            payu: { nombre: 'PayU', comision: 0.0349, fijo: 900, aplicaIVA: true, icono: '💳' },
            mercadopago: { nombre: 'Mercado Pago', comision: 0.0399, fijo: 1000, aplicaIVA: true, icono: '💳' }
        },
        regimenes: {
            simple: { nombre: 'Régimen Simple', tasaRenta: 0.02, aplicaIVA: false },
            ordinario: { nombre: 'Régimen Ordinario', tasaRenta: 0.35, aplicaIVA: true }
        }
    },
    CL: {
        nombre: 'Chile',
        moneda: 'CLP',
        simbolo: '$',
        iva: 0.19,
        nombreIVA: 'IVA',
        pasarelas: {
            efectivo: { nombre: 'Efectivo', comision: 0, fijo: 0, aplicaIVA: false, icono: '💵' },
            khipu: { nombre: 'Khipu', comision: 0.029, fijo: 0, aplicaIVA: true, icono: '💳' },
            flow: { nombre: 'Flow', comision: 0.035, fijo: 0, aplicaIVA: true, icono: '💳' },
            webpay: { nombre: 'Webpay Plus', comision: 0.0349, fijo: 0, aplicaIVA: true, icono: '💳' },
            mercadopago: { nombre: 'Mercado Pago', comision: 0.0399, fijo: 500, aplicaIVA: true, icono: '💳' }
        },
        regimenes: {
            pro_pyme: { nombre: 'Pro Pyme', tasaRenta: 0.25, aplicaIVA: true },
            general: { nombre: 'Régimen General', tasaRenta: 0.27, aplicaIVA: true }
        }
    }
};

// ===== PARTIDAS ARANCELARIAS (SAMPLE) =====
const ARANCELES = {
    // Café
    '0901.21.00.00': { descripcion: 'Café tostado sin descafeinar', adValorem: 0.11 },
    '0901.22.00.00': { descripcion: 'Café tostado descafeinado', adValorem: 0.11 },
    
    // Textiles
    '6109.10.00.31': { descripcion: 'T-shirts de algodón', adValorem: 0.11 },
    '6203.42.00.00': { descripcion: 'Pantalones de algodón', adValorem: 0.11 },
    
    // Electrónica
    '8517.62.00.00': { descripcion: 'Máquinas receptoras para telefonía', adValorem: 0.00 },
    '8471.30.00.00': { descripcion: 'Computadoras portátiles', adValorem: 0.00 },
    
    // Alimentos
    '1905.90.00.00': { descripcion: 'Productos de panadería', adValorem: 0.09 },
    '2106.90.99.00': { descripcion: 'Preparaciones alimenticias', adValorem: 0.11 }
};

// ===== COMMODITIES Y PRECIOS (SIMULACIÓN) =====
const COMMODITIES = {
    cafe: { nombre: 'Café Arábica', unidad: 'kg', precioBase: 8.50, variacion: 0 },
    harina: { nombre: 'Harina de Trigo', unidad: 'kg', precioBase: 2.20, variacion: 0 },
    azucar: { nombre: 'Azúcar', unidad: 'kg', precioBase: 1.80, variacion: 0 },
    petroleo: { nombre: 'Petróleo WTI', unidad: 'barril', precioBase: 78.00, variacion: 0 },
    algodon: { nombre: 'Algodón', unidad: 'kg', precioBase: 4.20, variacion: 0 }
};

// ===== SEMÁFORO DE RENTABILIDAD =====
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
    // Tipo de cambio
    tipoCambio: 'https://api.exchangerate-api.com/v4/latest/USD',
    tipoCambioBackup: 'https://api.frankfurter.app/latest?from=USD',
    
    // Commodities (simulación - en producción usar APIs reales)
    commodities: 'https://api.example.com/commodities',
    
    // Aduanas VUCE (simulación)
    vuce: 'https://api.example.com/vuce',
    
    // Google Maps Distance Matrix
    googleMaps: 'https://maps.googleapis.com/maps/api/distancematrix/json',
    
    // Valores por defecto
    tipoCambioDefault: {
        PE: 3.75,
        MX: 17.50,
        CO: 4200,
        CL: 920
    }
};

// ===== CONSTANTES DE CÁLCULO =====
const CALCULOS = {
    diasLaborablesMes: 26,
    horasDiarias: 8,
    semanasMes: 4.33,
    mesesAnio: 12,
    mermaMaxima: 100,
    precioMinimo: 0.01,
    
    // Costos de envío por km (estimación)
    costoPorKm: 0.50,
    costoBase: 5.00
};

// ===== SUGERENCIAS IA (REGLAS DE NEGOCIO) =====
const SUGERENCIAS_IA = [
    {
        condicion: (margen) => margen > 60,
        mensaje: '🚀 Este producto tiene un margen excepcional del {margen}%. Es momento de escalar: invierte en publicidad digital (TikTok, Meta Ads) para multiplicar ventas.'
    },
    {
        condicion: (margen) => margen >= 40 && margen <= 60,
        mensaje: '💎 Margen sólido del {margen}%. Considera crear combos o upsells para aumentar el ticket promedio sin sacrificar rentabilidad.'
    },
    {
        condicion: (margen) => margen >= 20 && margen < 40,
        mensaje: '⚡ Margen moderado del {margen}%. Optimiza costos: negocia mejores precios con proveedores o cambia a una pasarela más económica.'
    },
    {
        condicion: (margen) => margen >= 10 && margen < 20,
        mensaje: '⚠️ Margen ajustado del {margen}%. Considera aumentar el precio un 10-15% o reducir costos operativos. Este producto necesita mejoras urgentes.'
    },
    {
        condicion: (margen) => margen < 10,
        mensaje: '🔴 ¡Alerta crítica! Margen del {margen}%. Este producto pierde dinero. Opciones: 1) Aumentar precio 20%+, 2) Reducir costos 30%, 3) Descontinuar y enfocarte en productos rentables.'
    }
];

// ===== MENSAJES Y TEXTOS =====
const MENSAJES = {
    errorTipoCambio: 'No se pudo actualizar el tipo de cambio',
    exito: '✓ Cálculo realizado con éxito',
    advertenciaPrecio: '⚠️ El precio de venta debe ser mayor al costo total',
    advertenciaMerma: '⚠️ El porcentaje de merma parece muy alto',
    exportExito: '✓ Ticket exportado correctamente',
    guardadoExito: '✓ Producto guardado correctamente',
    cargando: 'Cargando...',
    noData: 'Sin datos'
};

// ===== FORMATOS =====
const FORMATOS = {
    moneda: {
        style: 'currency',
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
    principal: '#f59e0b',
    secundario: '#ea580c',
    exito: '#10b981',
    advertencia: '#f59e0b',
    peligro: '#dc2626',
    info: '#3b82f6',
    fondo: '#0f172a',
    texto: '#e2e8f0'
};

// ===== STORAGE KEYS =====
const STORAGE_KEYS = {
    productos: 'marginmaster_productos',
    paisActual: 'marginmaster_pais',
    ultimoCalculo: 'marginmaster_ultimo'
};

// ===== FUNCIONES HELPER GLOBALES =====

// Obtener país actual
function getPaisActual() {
    const stored = localStorage.getItem(STORAGE_KEYS.paisActual);
    return stored || 'PE';
}

// Obtener configuración del país
function getConfigPais(codigoPais) {
    return PAISES[codigoPais] || PAISES.PE;
}

// Formatear moneda según país
function formatearMonedaPais(valor, codigoPais) {
    const config = getConfigPais(codigoPais);
    return new Intl.NumberFormat('es', {
        style: 'currency',
        currency: config.moneda,
        minimumFractionDigits: config.moneda === 'CLP' ? 0 : 2,
        maximumFractionDigits: config.moneda === 'CLP' ? 0 : 2
    }).format(valor);
}

// Simular variación de commodities (en producción, usar API real)
function simularVariacionCommodities() {
    Object.keys(COMMODITIES).forEach(key => {
        COMMODITIES[key].variacion = (Math.random() * 10 - 5).toFixed(2);
    });
}

console.log('✓ MarginMaster Pro Ultra - Data loaded successfully');
console.log('🌎 Países disponibles:', Object.keys(PAISES).length);
console.log('📦 Partidas arancelarias cargadas:', Object.keys(ARANCELES).length);
console.log('📊 Commodities monitoreados:', Object.keys(COMMODITIES).length);