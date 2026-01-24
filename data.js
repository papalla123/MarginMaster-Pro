/* ========================================
   MARGINAXIS GLOBAL - DATABASE ENGINE
   21 Países • Multi-Currency • Pentagon Bridge
   Enterprise Intelligence v3.0
   ======================================== */

// ===== PENTAGON LINKS (Sincronización Global 2026) =====
window.PENTAGON_LINKS = {
    sueldopro: {
        name: 'SueldoPro Ultra',
        url: 'https://sueldopro-2026.vercel.app',
        icon: '💼',
        color: 'from-blue-500 to-cyan-500'
    },
    marginaxis: {
        name: 'MarginAxis Global',
        url: 'https://margin-master-pro-pboy.vercel.app',
        icon: '📊',
        color: 'from-green-500 to-emerald-500'
    },
    leadtarget: {
        name: 'Lead Target',
        url: 'https://lead-target.vercel.app', 
        icon: '🎯',
        color: 'from-violet-500 to-fuchsia-500'
    },
    liquidez: {
        name: 'Liquidez Force',
        url: 'https://liquidez-force.vercel.app',
        icon: '💰',
        color: 'from-yellow-500 to-orange-500'
    },
    wealth: {
        name: 'Wealth Armor AI',
        url: 'https://wealth-armor-ai.vercel.app',
        icon: '🛡️',
        color: 'from-emerald-500 to-green-600'
    }
};

// ===== GLOBAL COUNTRY CONFIGURATION (21 Countries) =====
const PAISES = {
    ES: {
        nombre: 'España',
        moneda: 'EUR',
        simbolo: '€',
        iva: 0.21,
        nombreIVA: 'IVA',
        regimenes: {
            autonomo: { nombre: 'Autónomo', tasaRenta: 0.15, aplicaIVA: true },
            sl: { nombre: 'Sociedad Limitada', tasaRenta: 0.25, aplicaIVA: true }
        },
        pasarelas: {
            efectivo: { nombre: 'Efectivo', comision: 0, fijo: 0, aplicaIVA: false, icono: '💵' },
            bizum: { nombre: 'Bizum', comision: 0.005, fijo: 0, aplicaIVA: false, icono: '📱' },
            redsys: { nombre: 'Redsys', comision: 0.0175, fijo: 0.25, aplicaIVA: true, icono: '💳' },
            stripe: { nombre: 'Stripe', comision: 0.014, fijo: 0.25, aplicaIVA: true, icono: '💳' },
            paypal: { nombre: 'PayPal', comision: 0.034, fijo: 0.35, aplicaIVA: true, icono: '💳' }
        }
    },
    PE: {
        nombre: 'Perú',
        moneda: 'PEN',
        simbolo: 'S/',
        iva: 0.18,
        nombreIVA: 'IGV',
        regimenes: {
            rus: { nombre: 'Nuevo RUS', tasaRenta: 0.015, aplicaIVA: false },
            rer: { nombre: 'RER', tasaRenta: 0.015, aplicaIVA: true },
            mype: { nombre: 'MYPE', tasaRenta: 0.10, aplicaIVA: true },
            general: { nombre: 'Régimen General', tasaRenta: 0.295, aplicaIVA: true }
        },
        pasarelas: {
            efectivo: { nombre: 'Efectivo', comision: 0, fijo: 0, aplicaIVA: false, icono: '💵' },
            yape: { nombre: 'Yape Personal', comision: 0, fijo: 0, aplicaIVA: false, icono: '📱' },
            'yape-empresa': { nombre: 'Yape Empresa', comision: 0.0295, fijo: 0, aplicaIVA: false, icono: '📱' },
            plin: { nombre: 'Plin', comision: 0.0295, fijo: 0, aplicaIVA: false, icono: '📱' },
            niubiz: { nombre: 'Niubiz', comision: 0.0344, fijo: 0, aplicaIVA: true, icono: '💳' },
            culqi: { nombre: 'Culqi', comision: 0.0399, fijo: 1.00, aplicaIVA: true, icono: '💳' }
        }
    },
    MX: {
        nombre: 'México',
        moneda: 'MXN',
        simbolo: '$',
        iva: 0.16,
        nombreIVA: 'IVA',
        regimenes: {
            resico: { nombre: 'RESICO', tasaRenta: 0.01, aplicaIVA: true },
            simplificado: { nombre: 'Simplificado de Confianza', tasaRenta: 0.025, aplicaIVA: true },
            general: { nombre: 'Régimen General', tasaRenta: 0.30, aplicaIVA: true }
        },
        pasarelas: {
            efectivo: { nombre: 'Efectivo', comision: 0, fijo: 0, aplicaIVA: false, icono: '💵' },
            oxxo: { nombre: 'OXXO Pay', comision: 0.035, fijo: 8, aplicaIVA: true, icono: '🏪' },
            conekta: { nombre: 'Conekta', comision: 0.036, fijo: 3, aplicaIVA: true, icono: '💳' },
            stripe: { nombre: 'Stripe', comision: 0.036, fijo: 3, aplicaIVA: true, icono: '💳' },
            mercadopago: { nombre: 'Mercado Pago', comision: 0.0399, fijo: 4, aplicaIVA: true, icono: '💳' }
        }
    },
    CO: {
        nombre: 'Colombia',
        moneda: 'COP',
        simbolo: '$',
        iva: 0.19,
        nombreIVA: 'IVA',
        regimenes: {
            simple: { nombre: 'Régimen Simple', tasaRenta: 0.02, aplicaIVA: false },
            ordinario: { nombre: 'Régimen Ordinario', tasaRenta: 0.35, aplicaIVA: true }
        },
        pasarelas: {
            efectivo: { nombre: 'Efectivo', comision: 0, fijo: 0, aplicaIVA: false, icono: '💵' },
            nequi: { nombre: 'Nequi', comision: 0.02, fijo: 0, aplicaIVA: false, icono: '📱' },
            bold: { nombre: 'Bold', comision: 0.0299, fijo: 0, aplicaIVA: true, icono: '💳' },
            wompi: { nombre: 'Wompi', comision: 0.0349, fijo: 900, aplicaIVA: true, icono: '💳' }
        }
    },
    CL: {
        nombre: 'Chile',
        moneda: 'CLP',
        simbolo: '$',
        iva: 0.19,
        nombreIVA: 'IVA',
        regimenes: {
            pro_pyme: { nombre: 'Pro Pyme', tasaRenta: 0.25, aplicaIVA: true },
            general: { nombre: 'Régimen General', tasaRenta: 0.27, aplicaIVA: true }
        },
        pasarelas: {
            efectivo: { nombre: 'Efectivo', comision: 0, fijo: 0, aplicaIVA: false, icono: '💵' },
            khipu: { nombre: 'Khipu', comision: 0.029, fijo: 0, aplicaIVA: true, icono: '💳' },
            webpay: { nombre: 'Webpay Plus', comision: 0.0349, fijo: 0, aplicaIVA: true, icono: '💳' }
        }
    },
    AR: {
        nombre: 'Argentina',
        moneda: 'ARS',
        simbolo: '$',
        iva: 0.21,
        nombreIVA: 'IVA',
        regimenes: {
            monotributo: { nombre: 'Monotributo', tasaRenta: 0.01, aplicaIVA: false },
            responsable: { nombre: 'Responsable Inscripto', tasaRenta: 0.35, aplicaIVA: true }
        },
        pasarelas: {
            efectivo: { nombre: 'Efectivo', comision: 0, fijo: 0, aplicaIVA: false, icono: '💵' },
            mercadopago: { nombre: 'Mercado Pago', comision: 0.0399, fijo: 5, aplicaIVA: true, icono: '💳' }
        }
    },
    BR: {
        nombre: 'Brasil',
        moneda: 'BRL',
        simbolo: 'R$',
        iva: 0.17,
        nombreIVA: 'ICMS',
        regimenes: {
            simples: { nombre: 'Simples Nacional', tasaRenta: 0.06, aplicaIVA: true },
            lucro_real: { nombre: 'Lucro Real', tasaRenta: 0.34, aplicaIVA: true }
        },
        pasarelas: {
            efectivo: { nombre: 'Dinheiro', comision: 0, fijo: 0, aplicaIVA: false, icono: '💵' },
            pix: { nombre: 'PIX', comision: 0.01, fijo: 0, aplicaIVA: false, icono: '📱' }
        }
    },
    UY: {
        nombre: 'Uruguay',
        moneda: 'UYU',
        simbolo: '$U',
        iva: 0.22,
        nombreIVA: 'IVA',
        regimenes: {
            general: { nombre: 'IRAE', tasaRenta: 0.25, aplicaIVA: true }
        },
        pasarelas: {
            efectivo: { nombre: 'Efectivo', comision: 0, fijo: 0, aplicaIVA: false, icono: '💵' }
        }
    },
    PY: {
        nombre: 'Paraguay',
        moneda: 'PYG',
        simbolo: '₲',
        iva: 0.10,
        nombreIVA: 'IVA',
        regimenes: {
            general: { nombre: 'IRE', tasaRenta: 0.10, aplicaIVA: true }
        },
        pasarelas: {
            efectivo: { nombre: 'Efectivo', comision: 0, fijo: 0, aplicaIVA: false, icono: '💵' }
        }
    },
    BO: {
        nombre: 'Bolivia',
        moneda: 'BOB',
        simbolo: 'Bs',
        iva: 0.13,
        nombreIVA: 'IVA',
        regimenes: {
            general: { nombre: 'IUE', tasaRenta: 0.25, aplicaIVA: true }
        },
        pasarelas: {
            efectivo: { nombre: 'Efectivo', comision: 0, fijo: 0, aplicaIVA: false, icono: '💵' }
        }
    },
    EC: {
        nombre: 'Ecuador',
        moneda: 'USD',
        simbolo: '$',
        iva: 0.15,
        nombreIVA: 'IVA',
        regimenes: {
            general: { nombre: 'Régimen General', tasaRenta: 0.25, aplicaIVA: true }
        },
        pasarelas: {
            efectivo: { nombre: 'Efectivo', comision: 0, fijo: 0, aplicaIVA: false, icono: '💵' }
        }
    },
    VE: {
        nombre: 'Venezuela',
        moneda: 'VES',
        simbolo: 'Bs.S',
        iva: 0.16,
        nombreIVA: 'IVA',
        regimenes: {
            general: { nombre: 'ISLR', tasaRenta: 0.34, aplicaIVA: true }
        },
        pasarelas: {
            efectivo: { nombre: 'Efectivo', comision: 0, fijo: 0, aplicaIVA: false, icono: '💵' }
        }
    },
    CR: {
        nombre: 'Costa Rica',
        moneda: 'CRC',
        simbolo: '₡',
        iva: 0.13,
        nombreIVA: 'IVA',
        regimenes: {
            general: { nombre: 'Régimen General', tasaRenta: 0.30, aplicaIVA: true }
        },
        pasarelas: {
            efectivo: { nombre: 'Efectivo', comision: 0, fijo: 0, aplicaIVA: false, icono: '💵' }
        }
    },
    PA: {
        nombre: 'Panamá',
        moneda: 'PAB',
        simbolo: 'B/.',
        iva: 0.07,
        nombreIVA: 'ITBMS',
        regimenes: {
            general: { nombre: 'ISR', tasaRenta: 0.25, aplicaIVA: true }
        },
        pasarelas: {
            efectivo: { nombre: 'Efectivo', comision: 0, fijo: 0, aplicaIVA: false, icono: '💵' }
        }
    },
    GT: {
        nombre: 'Guatemala',
        moneda: 'GTQ',
        simbolo: 'Q',
        iva: 0.12,
        nombreIVA: 'IVA',
        regimenes: {
            general: { nombre: 'ISR', tasaRenta: 0.25, aplicaIVA: true }
        },
        pasarelas: {
            efectivo: { nombre: 'Efectivo', comision: 0, fijo: 0, aplicaIVA: false, icono: '💵' }
        }
    },
    SV: {
        nombre: 'El Salvador',
        moneda: 'USD',
        simbolo: '$',
        iva: 0.13,
        nombreIVA: 'IVA',
        regimenes: {
            general: { nombre: 'ISR', tasaRenta: 0.30, aplicaIVA: true }
        },
        pasarelas: {
            efectivo: { nombre: 'Efectivo', comision: 0, fijo: 0, aplicaIVA: false, icono: '💵' },
            chivo: { nombre: 'Chivo Wallet', comision: 0, fijo: 0, aplicaIVA: false, icono: '₿' }
        }
    },
    HN: {
        nombre: 'Honduras',
        moneda: 'HNL',
        simbolo: 'L',
        iva: 0.15,
        nombreIVA: 'ISV',
        regimenes: {
            general: { nombre: 'ISR', tasaRenta: 0.25, aplicaIVA: true }
        },
        pasarelas: {
            efectivo: { nombre: 'Efectivo', comision: 0, fijo: 0, aplicaIVA: false, icono: '💵' }
        }
    },
    NI: {
        nombre: 'Nicaragua',
        moneda: 'NIO',
        simbolo: 'C$',
        iva: 0.15,
        nombreIVA: 'IVA',
        regimenes: {
            general: { nombre: 'IR', tasaRenta: 0.30, aplicaIVA: true }
        },
        pasarelas: {
            efectivo: { nombre: 'Efectivo', comision: 0, fijo: 0, aplicaIVA: false, icono: '💵' }
        }
    },
    DO: {
        nombre: 'República Dominicana',
        moneda: 'DOP',
        simbolo: 'RD$',
        iva: 0.18,
        nombreIVA: 'ITBIS',
        regimenes: {
            general: { nombre: 'ISR', tasaRenta: 0.27, aplicaIVA: true }
        },
        pasarelas: {
            efectivo: { nombre: 'Efectivo', comision: 0, fijo: 0, aplicaIVA: false, icono: '💵' }
        }
    },
    CU: {
        nombre: 'Cuba',
        moneda: 'CUP',
        simbolo: '$',
        iva: 0.00,
        nombreIVA: 'N/A',
        regimenes: {
            general: { nombre: 'Impuesto sobre Utilidades', tasaRenta: 0.35, aplicaIVA: false }
        },
        pasarelas: {
            efectivo: { nombre: 'Efectivo', comision: 0, fijo: 0, aplicaIVA: false, icono: '💵' }
        }
    },
    PR: {
        nombre: 'Puerto Rico',
        moneda: 'USD',
        simbolo: '$',
        iva: 0.115,
        nombreIVA: 'IVU',
        regimenes: {
            general: { nombre: 'Corporate Tax', tasaRenta: 0.37, aplicaIVA: true }
        },
        pasarelas: {
            efectivo: { nombre: 'Cash', comision: 0, fijo: 0, aplicaIVA: false, icono: '💵' }
        }
    }
};

// ===== HARMONIZED SYSTEM CODES (Sample Customs Data) =====
const ARANCELES = {
    '8471.30.00.00': { descripcion: 'Computadoras portátiles', adValorem: 0.00 },
    '0901.21.00.00': { descripcion: 'Café tostado sin descafeinar', adValorem: 0.11 },
    '6109.10.00.31': { descripcion: 'T-shirts de algodón', adValorem: 0.11 },
    '8517.62.00.00': { descripcion: 'Máquinas receptoras para telefonía', adValorem: 0.00 },
    '1905.90.00.00': { descripcion: 'Productos de panadería', adValorem: 0.09 }
};

// ===== FOREX API CONFIGURATION =====
const FOREX_API = {
    endpoint: 'https://api.exchangerate-api.com/v4/latest/USD',
    backup: 'https://api.frankfurter.app/latest?from=USD',
    defaultRates: {
        ES: 0.92,  // EUR
        PE: 3.75,  // PEN
        MX: 17.50, // MXN
        CO: 4200,  // COP
        CL: 920,   // CLP
        AR: 850,   // ARS
        BR: 4.95,  // BRL
        UY: 39.5,  // UYU
        PY: 7300,  // PYG
        BO: 6.91,  // BOB
        EC: 1.00,  // USD
        VE: 36.5,  // VES
        CR: 520,   // CRC
        PA: 1.00,  // PAB
        GT: 7.80,  // GTQ
        SV: 1.00,  // USD
        HN: 24.7,  // HNL
        NI: 36.8,  // NIO
        DO: 59.5,  // DOP
        CU: 24.0,  // CUP
        PR: 1.00   // USD
    }
};

// ===== PROFITABILITY TRAFFIC LIGHT =====
const TRAFFIC_LIGHT = {
    red: {
        max: 15,
        icon: '🔴',
        message: '¡Alerta! Rentabilidad crítica',
        color: '#dc2626',
        class: 'traffic-light-red'
    },
    yellow: {
        max: 30,
        icon: '🟡',
        message: 'Rentabilidad moderada - Puede mejorar',
        color: '#f59e0b',
        class: 'traffic-light-yellow'
    },
    green: {
        max: Infinity,
        icon: '🟢',
        message: '¡Excelente! Rentabilidad óptima',
        color: '#10b981',
        class: 'traffic-light-green'
    }
};

// ===== BUSINESS CONSTANTS =====
const CALCULOS = {
    diasLaborablesMes: 26,
    horasDiarias: 8,
    semanasMes: 4.33,
    mesesAnio: 12
};

// ===== STORAGE KEYS =====
const STORAGE_KEYS = {
    paisActual: 'marginaxis_pais',
    productos: 'marginaxis_productos',
    forexCache: 'marginaxis_forex_cache'
};

// ===== HELPER FUNCTIONS =====

// Get current country
function getPaisActual() {
    return localStorage.getItem(STORAGE_KEYS.paisActual) || 'PE';
}

// Get country configuration
function getConfigPais(codigoPais) {
    return PAISES[codigoPais] || PAISES.PE;
}

// Format currency by country
function formatearMonedaPais(valor, codigoPais) {
    const config = getConfigPais(codigoPais);
    const decimals = ['CLP', 'COP', 'PYG', 'CUP'].includes(config.moneda) ? 0 : 2;
    
    return new Intl.NumberFormat('es', {
        style: 'currency',
        currency: config.moneda,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(valor);
}

// Convert to USD
function convertirAUSD(valor, paisCodigo, forexRates) {
    const config = getConfigPais(paisCodigo);
    if (config.moneda === 'USD') return valor;
    
    const rate = forexRates[config.moneda] || FOREX_API.defaultRates[paisCodigo];
    return valor / rate;
}

// Convert to EUR
function convertirAEUR(valor, paisCodigo, forexRates) {
    const valorUSD = convertirAUSD(valor, paisCodigo, forexRates);
    const eurRate = forexRates['EUR'] || FOREX_API.defaultRates.ES;
    return valorUSD * eurRate;
}

console.log('✔ MarginAxis Global Database v3.0 loaded');
console.log('🌍 Countries configured:', Object.keys(PAISES).length);
console.log('⬡ Pentagon Bridge initialized');
console.log('🔥 Stress Testing ready');
console.log('📊 Advanced analytics enabled');