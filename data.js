/* ========================================
   MARGINAXIS PERÚ 2026 - MOTOR TRIBUTARIO
   Sistema SUNAT Completo • UIT 2026 • Bridge SueldoPro
   Enterprise Intelligence Perú v1.0
   ======================================== */

// ===== PENTAGON LINKS (Ecosystem Integration) =====
window.PENTAGON_LINKS = {
    marginaxis: 'https://marginaxis-peru-2026.vercel.app',
    sueldopro: 'https://sueldopro-2026.vercel.app',
    liquidez: 'https://liquidez-force.vercel.app',
    leadnexus: 'https://lead-target.vercel.app',
    wealth: 'https://wealth-armor-ai.vercel.app'
};

// ===== CONSTANTES TRIBUTARIAS PERÚ 2026 =====
const PERU_2026 = {
    UIT: 5150,
    IGV: 0.18,
    percepcion: 0.01,
    detracciones: {
        'servicios': 0.12,
        'bienes': 0.10,
        'transporte': 0.04
    },
    salarioMinimo: 1025,
    gratificaciones: 2,
    cts: true,
    essalud: 0.09,
    senati: 0.0075,
    sctr: 0.0125
};

// ===== REGÍMENES TRIBUTARIOS SUNAT 2026 =====
const REGIMENES_SUNAT = {
    nrus: {
        nombre: 'Nuevo RUS (NRUS)',
        descripcion: 'Nuevo Régimen Único Simplificado',
        categorias: [
            { limite: 5000, cuota: 20, descripcion: 'Categoría 1' },
            { limite: 8000, cuota: 50, descripcion: 'Categoría 2' }
        ],
        aplicaIGV: false,
        aplicaRenta: false,
        ventajas: ['Cuota fija mensual', 'No lleva libros contables', 'Sin declaraciones mensuales'],
        restricciones: ['Máximo S/ 96,000 al año', 'No emite facturas electrónicas', 'Solo boletas']
    },
    rer: {
        nombre: 'RER',
        descripcion: 'Régimen Especial de Renta',
        tasaRenta: 0.015,
        aplicaIGV: true,
        ventajas: ['Tasa única 1.5%', 'Libros simplificados'],
        restricciones: ['Máximo S/ 525,000 al año', 'Máximo 10 trabajadores']
    },
    mype: {
        nombre: 'MYPE Tributario',
        descripcion: 'Régimen para Micro y Pequeña Empresa',
        tramos: [
            { hasta: 15, tasa: 0.10, descripcion: 'Hasta 15 UIT' },
            { desde: 15.01, tasa: 0.295, descripcion: 'Más de 15 UIT' }
        ],
        aplicaIGV: true,
        ventajas: ['Tasa progresiva', 'Depreciacipon acelerada'],
        restricciones: ['Máximo 1700 UIT de ingresos']
    },
    general: {
        nombre: 'Régimen General',
        descripcion: 'Régimen General del Impuesto a la Renta',
        tasaRenta: 0.295,
        aplicaIGV: true,
        ventajas: ['Sin límite de ingresos', 'Todos los beneficios tributarios'],
        restricciones: ['Contabilidad completa', 'Mayor carga administrativa']
    }
};

// ===== PASARELAS DE PAGO PERÚ 2026 =====
const PASARELAS_PERU = {
    efectivo: {
        nombre: 'Efectivo',
        icono: '💵',
        comision: 0,
        fijo: 0,
        aplicaIGV: false,
        retencion: 0,
        ventajas: ['Sin comisión', 'Inmediato'],
        desventajas: ['Manejo de caja', 'Riesgo de robo']
    },
    yape_personal: {
        nombre: 'Yape Personal',
        icono: '💜',
        comision: 0,
        fijo: 0,
        aplicaIGV: false,
        retencion: 0,
        limite: 500,
        ventajas: ['Gratis', 'Instantáneo', 'Popular'],
        desventajas: ['Límite S/ 500 por operación', 'Sin comprobante automático']
    },
    yape_negocio: {
        nombre: 'Yape para Negocios',
        icono: '💜',
        comision: 0.0295,
        fijo: 0,
        aplicaIGV: false,
        retencion: 0,
        ventajas: ['Comprobante automático', 'Panel de control'],
        desventajas: ['Comisión 2.95%']
    },
    plin: {
        nombre: 'Plin',
        icono: '💚',
        comision: 0.029,
        fijo: 0,
        aplicaIGV: false,
        retencion: 0,
        ventajas: ['Sin límite diario', 'Múltiples bancos'],
        desventajas: ['Comisión 2.9%']
    },
    tunki: {
        nombre: 'Tunki',
        icono: '🦙',
        comision: 0.025,
        fijo: 0,
        aplicaIGV: false,
        retencion: 0,
        ventajas: ['Comisión baja', 'Del BCP'],
        desventajas: ['Menor adopción']
    },
    niubiz: {
        nombre: 'Niubiz (Visa/MC)',
        icono: '💳',
        comision: 0.0344,
        fijo: 0,
        aplicaIGV: true,
        retencion: 0.03,
        ventajas: ['Más aceptada', 'Profesional'],
        desventajas: ['Comisión + IGV + Retención']
    },
    izipay: {
        nombre: 'Izipay',
        icono: '💳',
        comision: 0.0375,
        fijo: 0.50,
        aplicaIGV: true,
        retencion: 0.03,
        ventajas: ['Checkout simple', 'Link de pago'],
        desventajas: ['Comisión alta']
    },
    culqi: {
        nombre: 'Culqi',
        icono: '💳',
        comision: 0.0399,
        fijo: 1.00,
        aplicaIGV: true,
        retencion: 0.03,
        ventajas: ['Integración fácil', 'Soporte local'],
        desventajas: ['Comisión + cuota fija']
    },
    mercadopago: {
        nombre: 'Mercado Pago',
        icono: '💳',
        comision: 0.0499,
        fijo: 0,
        aplicaIGV: true,
        retencion: 0.03,
        ventajas: ['Ecosistema completo', 'QR'],
        desventajas: ['Comisión más alta']
    },
    paypal: {
        nombre: 'PayPal',
        icono: '💙',
        comision: 0.055,
        fijo: 2.50,
        aplicaIGV: true,
        retencion: 0,
        ventajas: ['Internacional', 'Protección comprador'],
        desventajas: ['Comisión muy alta', 'Tipo de cambio desfavorable']
    }
};

// ===== COSTOS LABORALES PERÚ (Bridge con SueldoPro) =====
const COSTOS_LABORALES_PERU = {
    general: {
        nombre: 'Régimen General',
        essalud: 0.09,
        senati: 0.0075,
        sctr: 0.0125,
        gratificaciones: 2,
        cts: true,
        vacaciones: true,
        descripcion: 'Régimen laboral estándar',
        costoTotal: 1.6645
    },
    pequenia: {
        nombre: 'Pequeña Empresa (20-100 trab.)',
        essalud: 0.09,
        senati: 0,
        sctr: 0,
        gratificaciones: 2,
        cts: true,
        vacaciones: true,
        descripcion: 'Beneficios reducidos',
        costoTotal: 1.5833
    },
    micro: {
        nombre: 'Microempresa (1-10 trab.)',
        essalud: 0.09,
        senati: 0,
        sctr: 0,
        gratificaciones: 0,
        cts: false,
        vacaciones: true,
        descripcion: 'Solo Essalud + vacaciones',
        costoTotal: 1.1733
    }
};

// ===== CÓDIGOS HS PERÚ (Aduanas) =====
const ARANCELES_PERU = {
    '8471.30.00.00': { descripcion: 'Laptops y notebooks', adValorem: 0.00, igv: true },
    '8517.12.00.00': { descripcion: 'Smartphones', adValorem: 0.00, igv: true },
    '0901.21.00.00': { descripcion: 'Café tostado', adValorem: 0.11, igv: true },
    '6109.10.00.31': { descripcion: 'Polos de algodón', adValorem: 0.11, igv: true },
    '6204.62.00.00': { descripcion: 'Pantalones de algodón para mujer', adValorem: 0.11, igv: true },
    '1905.90.00.00': { descripcion: 'Productos de panadería', adValorem: 0.09, igv: true },
    '3304.10.00.00': { descripcion: 'Preparaciones de belleza', adValorem: 0.11, igv: true },
    '8528.72.10.00': { descripcion: 'Televisores LCD', adValorem: 0.09, igv: true },
    '9403.60.00.00': { descripcion: 'Muebles de madera', adValorem: 0.09, igv: true },
    '6403.99.00.00': { descripcion: 'Calzado de cuero', adValorem: 0.11, igv: true }
};

// ===== FOREX PERÚ =====
const FOREX_PERU = {
    endpoint: 'https://api.exchangerate-api.com/v4/latest/USD',
    backup: 'https://api.apis.net.pe/v1/tipo-cambio-sunat',
    moneda: 'PEN',
    simbolo: 'S/',
    defaultRate: 3.75,
    factorConversion: {
        USD: 1,
        EUR: 0.92
    }
};

// ===== SEMÁFORO DE RENTABILIDAD PERÚ =====
const SEMAFORO_RENTABILIDAD = {
    rojo: {
        max: 10,
        icono: '🔴',
        mensaje: '¡CRISIS! Estás perdiendo plata',
        recomendacion: 'Urgente: Revisar precios o reducir costos',
        color: '#dc2626',
        class: 'traffic-light-red'
    },
    amarillo: {
        max: 25,
        icono: '🟡',
        mensaje: 'SUPERVIVENCIA - Apenas cubres gastos',
        recomendacion: 'Optimiza tu estructura de costos',
        color: '#f59e0b',
        class: 'traffic-light-yellow'
    },
    verde: {
        max: Infinity,
        icono: '🟢',
        mensaje: '¡RENTABLE! Tu negocio es sostenible',
        recomendacion: 'Sigue así y busca escalar',
        color: '#10b981',
        class: 'traffic-light-green'
    }
};

// ===== BENCHMARKS PERÚ POR INDUSTRIA =====
const BENCHMARKS_PERU = {
    retail: { margenBruto: 40, margenNeto: 8, nombre: 'Retail/Tiendas' },
    restaurante: { margenBruto: 65, margenNeto: 10, nombre: 'Restaurantes' },
    tecnologia: { margenBruto: 70, margenNeto: 20, nombre: 'Tecnología/SaaS' },
    manufactura: { margenBruto: 35, margenNeto: 12, nombre: 'Manufactura' },
    servicios: { margenBruto: 60, margenNeto: 15, nombre: 'Servicios' },
    ecommerce: { margenBruto: 45, margenNeto: 5, nombre: 'E-commerce' },
    belleza: { margenBruto: 55, margenNeto: 12, nombre: 'Belleza/Spa' },
    educacion: { margenBruto: 70, margenNeto: 18, nombre: 'Educación' },
    construccion: { margenBruto: 30, margenNeto: 8, nombre: 'Construcción' },
    consultoria: { margenBruto: 75, margenNeto: 25, nombre: 'Consultoría' }
};

// ===== STORAGE KEYS =====
const STORAGE_KEYS = {
    productos: 'marginaxis_peru_productos',
    configuracion: 'marginaxis_peru_config',
    forexCache: 'marginaxis_peru_forex',
    ultimoRegimen: 'marginaxis_peru_regimen'
};

// ===== CONSTANTES DE CÁLCULO =====
const CONSTANTES = {
    diasMes: 30,
    diasLaborables: 26,
    horasDia: 8,
    mesesAnio: 12,
    semanasAnio: 52
};

// ===== HELPER FUNCTIONS =====

// Calcular cuota NRUS según ventas mensuales
function calcularNRUS(ventasMensuales) {
    if (ventasMensuales <= 5000) {
        return { cuota: 20, categoria: 1 };
    } else if (ventasMensuales <= 8000) {
        return { cuota: 50, categoria: 2 };
    } else {
        return { cuota: null, mensaje: 'Excede límite NRUS' };
    }
}

// Calcular impuesto MYPE Tributario
function calcularMYPE(utilidadAnual) {
    const limite15UIT = 15 * PERU_2026.UIT;
    
    if (utilidadAnual <= limite15UIT) {
        return utilidadAnual * 0.10;
    } else {
        const tramo1 = limite15UIT * 0.10;
        const tramo2 = (utilidadAnual - limite15UIT) * 0.295;
        return tramo1 + tramo2;
    }
}

// Calcular IGV sobre comisión de pasarela
function calcularIGVComision(comision, aplicaIGV) {
    return aplicaIGV ? comision * PERU_2026.IGV : 0;
}

// Calcular retención (3% para tarjetas)
function calcularRetencion(monto, pasarela) {
    const pasarelaData = PASARELAS_PERU[pasarela];
    return pasarelaData.retencion ? monto * pasarelaData.retencion : 0;
}

// Formatear moneda peruana
function formatearSoles(valor, incluirSimbolo = true) {
    const formato = new Intl.NumberFormat('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(Math.abs(valor));
    
    return incluirSimbolo ? `S/ ${formato}` : formato;
}

// Formatear porcentaje
function formatearPorcentaje(valor, decimales = 2) {
    return `${valor.toFixed(decimales)}%`;
}

// Convertir PEN a USD
function convertirPENaUSD(soles, tipoCambio = FOREX_PERU.defaultRate) {
    return soles / tipoCambio;
}

// Convertir PEN a EUR
function convertirPENaEUR(soles, tipoCambio = FOREX_PERU.defaultRate) {
    const usd = convertirPENaUSD(soles, tipoCambio);
    return usd * FOREX_PERU.factorConversion.EUR;
}

// Obtener régimen recomendado según ingresos anuales
function obtenerRegimenRecomendado(ingresosAnuales) {
    const uitValor = PERU_2026.UIT;
    
    if (ingresosAnuales <= 96000) {
        return {
            codigo: 'nrus',
            nombre: 'NRUS',
            razon: 'Cuota fija, ideal para emprender'
        };
    } else if (ingresosAnuales <= 525000) {
        return {
            codigo: 'rer',
            nombre: 'RER',
            razon: 'Tasa baja del 1.5% sobre ingresos'
        };
    } else if (ingresosAnuales <= (uitValor * 1700)) {
        return {
            codigo: 'mype',
            nombre: 'MYPE Tributario',
            razon: 'Tasa progresiva, beneficios fiscales'
        };
    } else {
        return {
            codigo: 'general',
            nombre: 'Régimen General',
            razon: 'Sin límites, todos los beneficios'
        };
    }
}

// Calcular costo laboral total mensual
function calcularCostoLaboral(sueldoBase, regimenLaboral = 'general') {
    const regimen = COSTOS_LABORALES_PERU[regimenLaboral];
    return sueldoBase * regimen.costoTotal;
}

// Determinar semáforo de rentabilidad
function determinarSemaforo(margenNetoPercent) {
    if (margenNetoPercent < SEMAFORO_RENTABILIDAD.rojo.max) {
        return SEMAFORO_RENTABILIDAD.rojo;
    } else if (margenNetoPercent < SEMAFORO_RENTABILIDAD.amarillo.max) {
        return SEMAFORO_RENTABILIDAD.amarillo;
    } else {
        return SEMAFORO_RENTABILIDAD.verde;
    }
}

// Comparar con benchmark de industria
function compararConBenchmark(margenNeto, industria) {
    const benchmark = BENCHMARKS_PERU[industria];
    if (!benchmark) return null;
    
    const diferencia = margenNeto - benchmark.margenNeto;
    return {
        benchmark: benchmark.margenNeto,
        diferencia: diferencia,
        mejor: diferencia >= 0,
        mensaje: diferencia >= 0 
            ? `¡Superas el benchmark de ${benchmark.nombre} por ${diferencia.toFixed(1)}%!`
            : `Estás ${Math.abs(diferencia).toFixed(1)}% por debajo del benchmark de ${benchmark.nombre}`
    };
}

console.log('✓ MarginAxis Perú 2026 - Motor Tributario Cargado');
console.log('🇵🇪 Sistema SUNAT Completo Activo');
console.log(`💰 UIT 2026: S/ ${PERU_2026.UIT}`);
console.log(`📊 IGV: ${(PERU_2026.IGV * 100)}%`);
console.log(`⬡ Pentagon Bridge Conectado`);
console.log(`🔥 ${Object.keys(REGIMENES_SUNAT).length} Regímenes SUNAT Disponibles`);
console.log(`💳 ${Object.keys(PASARELAS_PERU).length} Pasarelas de Pago Configuradas`);
