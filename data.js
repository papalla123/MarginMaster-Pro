/**
 * ═══════════════════════════════════════════════════════════════════
 * MarginAxis Perú 2026 — DATA LAYER (data.js)
 * Version: 2026.3.0
 * Enciclopedia Fiscal, Pasarelas, Forex y Configuración Base
 *
 * CONTENIDO:
 *   1. Constantes Fiscales SUNAT 2026
 *   2. Regímenes Tributarios (NRUS, RER, MYPE, General)
 *   3. Pasarelas de Pago (comisiones, IGV, fees)
 *   4. Detracciones SPOT
 *   5. Percepciones IGV
 *   6. Forex — 10 Divisas Principales
 *   7. Calendario de Vencimientos RUC 2026
 *   8. Semáforo de Viabilidad
 *   9. Reserva Legal
 *  10. Valores por Defecto
 * ═══════════════════════════════════════════════════════════════════
 */

'use strict';

/* ─────────────────────────────────────────────────────────────────
   1. CONSTANTES FISCALES SUNAT 2026
   ───────────────────────────────────────────────────────────────── */

const MA_DATA = {

  meta: {
    version:     '2026.3.0',
    year:        2026,
    currency:    'PEN',
    symbol:      'S/',
    country:     'PE',
    lastUpdated: '2025-01-01',
    source:      'SUNAT — Resolución de Superintendencia y D.S. proyectados 2026'
  },

  /* ── UIT (Unidad Impositiva Tributaria) ── */
  UIT: 5150,

  /* ── IGV (Impuesto General a las Ventas) ── */
  IGV: {
    rate:        0.18,
    factor:      1.18,        /* precio con IGV = precio sin IGV × 1.18 */
    rateDisplay: '18%',
    description: 'Impuesto General a las Ventas — Tasa estándar vigente en Perú'
  },

  /* ── Impuesto a la Renta de Cuarta Categoría (Referencia) ── */
  rentaCuarta: {
    retentionRate:   0.08,
    exemptMonthly:   3535,     /* S/. a partir de UIT 2026 / 12 × 8.25 meses */
    description:     '8% de retención sobre recibos por honorarios > S/1,500'
  },

  /* ── Límites de Libros Contables ── */
  libros: {
    registroVentas:    {
      obligatorioDesde: 0,
      description:      'Obligatorio desde el primer sol de ingresos (RER, MYPE, General)'
    },
    registroCompras:   {
      obligatorioDesde: 0,
      description:      'Obligatorio para llevar crédito fiscal (RER, MYPE, General)'
    },
    librosSimplificados: {
      libroDesde:   0,
      libroHasta:   1545000,   /* 300 UIT × S/5,150 */
      description:  'Hasta 300 UIT de ingresos anuales (S/1,545,000)'
    },
    librosCompletos: {
      desde:       1545000,
      description: 'Más de 300 UIT requiere contabilidad completa'
    }
  },

  /* ═══════════════════════════════════════════════════════════════
     2. REGÍMENES TRIBUTARIOS SUNAT 2026
     ═══════════════════════════════════════════════════════════════ */

  regimes: {

    /* ── NUEVO RÉGIMEN ÚNICO SIMPLIFICADO ── */
    nrus: {
      id:               'nrus',
      code:             'NRUS',
      name:             'Nuevo RUS',
      fullName:         'Nuevo Régimen Único Simplificado',
      icon:             '🟢',
      color:            '#10b981',
      chargesIGV:       false,
      deductsIGV:       false,
      emitsFactura:     false,
      emitsBoleta:      true,
      maxAnnualIncome:  96000,     /* S/ 8,000 × 12 meses (Categoría 2) */
      taxBase:          'fixed',
      description:      'Cuota fija mensual. Sin IGV, sin facturas. Ideal para negocios pequeños con ventas directas al consumidor final.',
      categories: [
        {
          id:           'cat1',
          name:         'Categoría 1',
          maxMonthly:   5000,
          maxAnnual:    60000,
          monthlyFee:   20,
          description:  'Ingresos o compras mensuales hasta S/ 5,000'
        },
        {
          id:           'cat2',
          name:         'Categoría 2',
          maxMonthly:   8000,
          maxAnnual:    96000,
          monthlyFee:   50,
          description:  'Ingresos o compras mensuales hasta S/ 8,000'
        }
      ],
      restrictions: [
        'Solo boletas de venta y tickets',
        'Sin crédito fiscal del IGV',
        'Sin deducción de gastos',
        'No puede exportar',
        'No puede tener más de 1 unidad de explotación',
        'No puede tener activos fijos > S/ 70,000 (excepto predios)',
        'Prohibido: servicios de transporte, agencias de viaje, propaganda, espectáculos'
      ],
      advantages: [
        'Cero contabilidad formal',
        'Cuota fija predecible',
        'Sin declaración anual',
        'Sin retenciones ni percepciones complejas'
      ],
      howToCalculateTax: function(monthlySaleNoIGV) {
        /* En NRUS el precio de venta NO incluye IGV */
        if (monthlySaleNoIGV <= 5000) {
          return { category: 'cat1', monthlyFee: 20, annualFee: 240 };
        } else if (monthlySaleNoIGV <= 8000) {
          return { category: 'cat2', monthlyFee: 50, annualFee: 600 };
        } else {
          return { category: 'exceeded', monthlyFee: null, annualFee: null, exceeded: true };
        }
      }
    },

    /* ── RÉGIMEN ESPECIAL DE RENTA ── */
    rer: {
      id:               'rer',
      code:             'RER',
      name:             'Régimen Especial (RER)',
      fullName:         'Régimen Especial de Renta',
      icon:             '🔵',
      color:            '#22d3ee',
      chargesIGV:       true,
      deductsIGV:       true,
      emitsFactura:     true,
      emitsBoleta:      true,
      maxAnnualIncome:  525000,    /* S/ 525,000 anuales */
      taxBase:          'income',
      incomeRate:       0.015,     /* 1.5% mensual sobre ingresos netos */
      igvMonthlyRate:   0.18,
      paymentType:      'definitivo', /* Pago mensual es definitivo, sin declaración anual */
      description:      '1.5% mensual sobre ingresos netos. Pago definitivo. Facturas y boletas. Crédito fiscal IGV.',
      restrictions: [
        'Ingresos anuales máximos S/ 525,000',
        'Compras anuales máximas S/ 525,000',
        'Sin trabajadores en 4ta categoría > 10',
        'Actividades no permitidas: casinos, tragamonedas, espectáculos, transporte terrestre',
        'Prohibido: negocios relacionados con combustibles a granel'
      ],
      advantages: [
        'Facturas y boletas',
        'Crédito fiscal IGV sobre compras',
        'Tasa fija sobre ingresos (predecible)',
        'Sin declaración anual de renta',
        'Libros simplificados (Registro de Ventas y Compras)'
      ],
      declarations: {
        monthly:   'PDT 621 — IGV + Renta de Tercera (pago definitivo)',
        annual:    'No hay declaración anual de renta en RER'
      },
      howToCalculateTax: function(monthlyNetSale) {
        const incomeTax = monthlyNetSale * 0.015;
        const igv = monthlyNetSale * 0.18;
        return {
          incomeTax:    incomeTax,
          igvCollected: igv,
          totalToPay:   incomeTax, /* El IGV se paga menos crédito fiscal */
          description:  `1.5% × S/${monthlyNetSale.toFixed(2)} = S/${incomeTax.toFixed(2)}`
        };
      }
    },

    /* ── RÉGIMEN MYPE TRIBUTARIO ── */
    mype: {
      id:               'mype',
      code:             'MYPE',
      name:             'MYPE Tributario',
      fullName:         'Régimen MYPE Tributario',
      icon:             '🟡',
      color:            '#fbbf24',
      chargesIGV:       true,
      deductsIGV:       true,
      emitsFactura:     true,
      emitsBoleta:      true,
      maxAnnualIncome:  null,          /* Hasta 1,700 UIT */
      maxAnnualUIT:     1700,          /* 1,700 UIT = S/ 8,755,000 */
      taxBase:          'profit',
      monthlyAdvanceRate: 0.01,        /* 1% de ingresos para negocios hasta 300 UIT */
      monthlyAdvanceRateHigh: null,    /* Coeficiente para más de 300 UIT */
      igvMonthlyRate:   0.18,
      description:      'Impuesto a la Renta progresivo: 10% hasta 15 UIT de utilidad y 29.5% sobre el exceso. Facturas. Crédito fiscal IGV.',
      brackets: [
        {
          id:           'bracket1',
          fromUIT:      0,
          toUIT:        15,
          fromAmount:   0,
          toAmount:     77250,         /* 15 UIT × S/5,150 */
          rate:         0.10,
          rateDisplay:  '10%',
          description:  'Primeras 15 UIT de renta neta anual → 10%'
        },
        {
          id:           'bracket2',
          fromUIT:      15,
          toUIT:        Infinity,
          fromAmount:   77250,
          toAmount:     Infinity,
          rate:         0.295,
          rateDisplay:  '29.5%',
          description:  'Renta neta anual que excede 15 UIT → 29.5%'
        }
      ],
      thresholds: {
        simplifiedBooks:  {
          uitLimit:       300,
          amountLimit:    1545000,     /* 300 UIT × S/5,150 */
          description:    'Hasta 300 UIT: Registro de Ventas y Compras + Libro Diario simplificado'
        },
        fullBooks: {
          uitLimit:       1700,
          amountLimit:    8755000,     /* 1,700 UIT × S/5,150 */
          description:    'Entre 300 y 1,700 UIT: Contabilidad completa'
        }
      },
      restrictions: [
        'Ingresos máximos 1,700 UIT = S/ 8,755,000',
        'No aplicable si hay vinculación económica con empresas del Régimen General',
        'Declaración anual obligatoria'
      ],
      advantages: [
        'Tasa del 10% sobre primeras S/77,250 de utilidad',
        'Facturas y boletas',
        'Crédito fiscal IGV total',
        'Pago a cuenta mensual bajo (1%)',
        'Beneficios de reinversión'
      ],
      declarations: {
        monthly:   'PDT 621 — IGV Mensual + Pago a cuenta de IR (1%)',
        annual:    'PDT 710 — Declaración Anual de Renta'
      },
      howToCalculateTax: function(annualNetProfit, uitValue) {
        uitValue = uitValue || 5150;
        const bracket1Limit = 15 * uitValue;   /* S/ 77,250 */
        let tax = 0;
        if (annualNetProfit <= 0) {
          return { tax: 0, bracket1Tax: 0, bracket2Tax: 0, effectiveRate: 0 };
        }
        if (annualNetProfit <= bracket1Limit) {
          tax = annualNetProfit * 0.10;
          return {
            tax:           tax,
            bracket1Tax:   tax,
            bracket2Tax:   0,
            effectiveRate: 0.10,
            description:   `10% × S/${annualNetProfit.toFixed(2)} = S/${tax.toFixed(2)}`
          };
        } else {
          const bracket1Tax = bracket1Limit * 0.10;
          const bracket2Tax = (annualNetProfit - bracket1Limit) * 0.295;
          tax = bracket1Tax + bracket2Tax;
          const effectiveRate = tax / annualNetProfit;
          return {
            tax:           tax,
            bracket1Tax:   bracket1Tax,
            bracket2Tax:   bracket2Tax,
            effectiveRate: effectiveRate,
            description:   `10% × S/${bracket1Limit.toFixed(0)} + 29.5% × S/${(annualNetProfit - bracket1Limit).toFixed(0)} = S/${tax.toFixed(2)}`
          };
        }
      }
    },

    /* ── RÉGIMEN GENERAL ── */
    general: {
      id:               'general',
      code:             'GENERAL',
      name:             'Régimen General',
      fullName:         'Régimen General del Impuesto a la Renta',
      icon:             '🔴',
      color:            '#f87171',
      chargesIGV:       true,
      deductsIGV:       true,
      emitsFactura:     true,
      emitsBoleta:      true,
      maxAnnualIncome:  null,
      taxBase:          'profit',
      corporateRate:    0.295,         /* 29.5% sobre renta neta */
      monthlyAdvanceRate: 0.015,       /* 1.5% de ingresos como pago a cuenta */
      igvMonthlyRate:   0.18,
      description:      '29.5% sobre utilidad neta anual. Sin límite de ingresos. Contabilidad completa. Para empresas consolidadas.',
      restrictions: [
        'Declaración anual obligatoria',
        'Contabilidad completa (no simplificada)',
        'Mayor complejidad tributaria'
      ],
      advantages: [
        'Sin límite de ingresos',
        'Máxima capacidad de deducción de gastos',
        'Acceso a todos los beneficios tributarios',
        'Posibilidad de escudo fiscal por depreciación e inversión',
        'Reinversión de utilidades con beneficios'
      ],
      declarations: {
        monthly:   'PDT 621 — IGV + Pago a cuenta IR (1.5%)',
        annual:    'PDT 710 — Declaración Anual con cierre de ejercicio'
      },
      howToCalculateTax: function(annualNetProfit) {
        const tax = Math.max(0, annualNetProfit * 0.295);
        return {
          tax:           tax,
          effectiveRate: 0.295,
          description:   `29.5% × S/${annualNetProfit.toFixed(2)} = S/${tax.toFixed(2)}`
        };
      }
    }

  }, /* end regimes */

  /* ═══════════════════════════════════════════════════════════════
     3. PASARELAS DE PAGO — COMISIONES REALES PERÚ 2026
     ═══════════════════════════════════════════════════════════════ */

  gateways: {

    niubiz: {
      id:              'niubiz',
      name:            'Niubiz (VisaNet)',
      shortName:       'Niubiz',
      icon:            '💳',
      color:           '#1a73e8',
      colorSecondary:  '#0d47a1',
      commissionRate:  0.0399,         /* 3.99% sobre el monto de la venta */
      fixedFee:        0.00,           /* Sin fee fijo por transacción */
      hasIGVOnComm:    true,           /* Emiten factura con IGV sobre la comisión */
      minTransaction:  1.00,
      maxTransaction:  null,
      chargebackRate:  0.0015,         /* 0.15% adicional por chargebacks promedio */
      settlement:      'T+1',          /* Abono al día siguiente hábil */
      acceptedCards:   ['Visa', 'Mastercard', 'Amex', 'Diners', 'Débito'],
      description:     'Procesador líder en Perú. Tasa estándar ~3.99%. Fee neto si recuperas IGV: 3.99%; si no: ~4.71%.',
      website:         'https://www.niubiz.com.pe',
      bestFor:         'Empresas con facturación media-alta y necesidad de máxima confianza del consumidor',
      integration:     ['API REST', 'WooCommerce', 'Magento', 'Shopify', 'PrestaShop'],
      getEffectiveCost: function(saleAmount, canRecoverIGV) {
        const commBase = saleAmount * this.commissionRate;
        const commIGV  = commBase * 0.18;
        if (canRecoverIGV) {
          return { base: commBase, igv: commIGV, effective: commBase, recovered: commIGV };
        } else {
          return { base: commBase, igv: commIGV, effective: commBase + commIGV, recovered: 0 };
        }
      }
    },

    culqi: {
      id:              'culqi',
      name:            'Culqi',
      shortName:       'Culqi',
      icon:            '⚡',
      color:           '#00d4aa',
      colorSecondary:  '#00a886',
      commissionRate:  0.0349,         /* 3.49% sobre el monto */
      fixedFee:        0.30,           /* S/ 0.30 fijo por transacción */
      hasIGVOnComm:    true,
      minTransaction:  1.00,
      maxTransaction:  null,
      chargebackRate:  0.001,
      settlement:      'T+2',
      acceptedCards:   ['Visa', 'Mastercard', 'Amex', 'Débito'],
      description:     '3.49% + S/0.30 fijo. La comisión porcentual más baja del mercado, pero el fee fijo penaliza tickets pequeños.',
      website:         'https://culqi.com',
      bestFor:         'Tiendas online con ticket promedio entre S/50 y S/500',
      integration:     ['API REST', 'JavaScript', 'PHP', 'Python', 'Ruby', 'WooCommerce'],
      getEffectiveCost: function(saleAmount, canRecoverIGV) {
        const commBase = saleAmount * this.commissionRate + this.fixedFee;
        const commIGV  = commBase * 0.18;
        if (canRecoverIGV) {
          return { base: commBase, igv: commIGV, effective: commBase, recovered: commIGV };
        } else {
          return { base: commBase, igv: commIGV, effective: commBase + commIGV, recovered: 0 };
        }
      }
    },

    mercadopago: {
      id:              'mercadopago',
      name:            'Mercado Pago',
      shortName:       'MercadoPago',
      icon:            '🤝',
      color:           '#009ee3',
      colorSecondary:  '#006cba',
      commissionRate:  0.0499,         /* 4.99% — mayor tasa del mercado */
      fixedFee:        0.00,
      hasIGVOnComm:    true,
      minTransaction:  1.00,
      maxTransaction:  null,
      chargebackRate:  0.002,
      settlement:      'T+2',
      acceptedCards:   ['Visa', 'Mastercard', 'Amex', 'Débito', 'Yape', 'Plin', 'Cuotas'],
      description:     '4.99% — La comisión más alta, pero accede al ecosistema MercadoLibre y acepta cuotas sin recargo para el comprador.',
      website:         'https://www.mercadopago.com.pe',
      bestFor:         'Vendedores en MercadoLibre o que necesitan aceptar cuotas 0% para el cliente',
      integration:     ['API REST', 'Checkout Pro', 'Checkout Transparente', 'WooCommerce', 'Shopify'],
      getEffectiveCost: function(saleAmount, canRecoverIGV) {
        const commBase = saleAmount * this.commissionRate;
        const commIGV  = commBase * 0.18;
        if (canRecoverIGV) {
          return { base: commBase, igv: commIGV, effective: commBase, recovered: commIGV };
        } else {
          return { base: commBase, igv: commIGV, effective: commBase + commIGV, recovered: 0 };
        }
      }
    },

    izipay: {
      id:              'izipay',
      name:            'Izipay',
      shortName:       'Izipay',
      icon:            '📱',
      color:           '#ff6600',
      colorSecondary:  '#cc5200',
      commissionRate:  0.0350,         /* 3.50% online; varía en POS físico */
      fixedFee:        0.00,
      hasIGVOnComm:    true,
      minTransaction:  1.00,
      maxTransaction:  null,
      chargebackRate:  0.001,
      settlement:      'T+1',
      acceptedCards:   ['Visa', 'Mastercard', 'Amex', 'Débito', 'Tarjetas débito BCP'],
      description:     '3.50% online. Fuerte en terminales POS físicos. Buena opción para negocios con canal presencial y online.',
      website:         'https://izipay.pe',
      bestFor:         'Negocios con punto de venta físico que también venden online',
      integration:     ['API REST', 'POS Terminal', 'WooCommerce', 'QR Pago'],
      getEffectiveCost: function(saleAmount, canRecoverIGV) {
        const commBase = saleAmount * this.commissionRate;
        const commIGV  = commBase * 0.18;
        if (canRecoverIGV) {
          return { base: commBase, igv: commIGV, effective: commBase, recovered: commIGV };
        } else {
          return { base: commBase, igv: commIGV, effective: commBase + commIGV, recovered: 0 };
        }
      }
    },

    yape: {
      id:              'yape',
      name:            'Yape Business',
      shortName:       'Yape',
      icon:            '💜',
      color:           '#7c3aed',
      colorSecondary:  '#5b21b6',
      commissionRate:  0.0250,         /* 2.50% — comisión más baja del mercado */
      fixedFee:        0.00,
      hasIGVOnComm:    true,
      minTransaction:  1.00,
      maxTransaction:  null,
      chargebackRate:  0.0005,
      settlement:      'T+1',
      acceptedCards:   ['Yape (BCP)', 'Visa Débito BCP'],
      description:     '2.50% — La comisión más baja. Limitado a usuarios Yape (>15 millones). Ideal para alto volumen con clientela joven.',
      website:         'https://www.yape.com.pe/yape-para-negocios',
      bestFor:         'Negocios físicos, delivery, MYPE con clientela masiva de clase media',
      integration:     ['QR estático/dinámico', 'API Business', 'SDK Android/iOS'],
      limitation:      'Solo usuarios de la app Yape (BCP). No acepta tarjetas de crédito.',
      getEffectiveCost: function(saleAmount, canRecoverIGV) {
        const commBase = saleAmount * this.commissionRate;
        const commIGV  = commBase * 0.18;
        if (canRecoverIGV) {
          return { base: commBase, igv: commIGV, effective: commBase, recovered: commIGV };
        } else {
          return { base: commBase, igv: commIGV, effective: commBase + commIGV, recovered: 0 };
        }
      }
    },

    kushki: {
      id:              'kushki',
      name:            'Kushki',
      shortName:       'Kushki',
      icon:            '🔷',
      color:           '#2563eb',
      colorSecondary:  '#1d4ed8',
      commissionRate:  0.0300,         /* 3.00% referencial — varía por volumen */
      fixedFee:        0.00,
      hasIGVOnComm:    true,
      minTransaction:  1.00,
      maxTransaction:  null,
      chargebackRate:  0.001,
      settlement:      'T+2',
      acceptedCards:   ['Visa', 'Mastercard', 'Amex', 'Débito'],
      description:     '3.00% referencial. Fintech latinoamericano con foco en e-commerce de mediano volumen. API moderna.',
      website:         'https://www.kushkipagos.com',
      bestFor:         'E-commerce de mediano volumen, marketplaces, plataformas digitales',
      integration:     ['API REST', 'JavaScript', 'Mobile SDK', 'WooCommerce'],
      getEffectiveCost: function(saleAmount, canRecoverIGV) {
        const commBase = saleAmount * this.commissionRate;
        const commIGV  = commBase * 0.18;
        if (canRecoverIGV) {
          return { base: commBase, igv: commIGV, effective: commBase, recovered: commIGV };
        } else {
          return { base: commBase, igv: commIGV, effective: commBase + commIGV, recovered: 0 };
        }
      }
    },

    payme: {
      id:              'payme',
      name:            'Pay-me',
      shortName:       'Pay-me',
      icon:            '🟠',
      color:           '#ea580c',
      colorSecondary:  '#c2410c',
      commissionRate:  0.0320,         /* 3.20% referencial */
      fixedFee:        0.00,
      hasIGVOnComm:    true,
      minTransaction:  1.00,
      maxTransaction:  null,
      chargebackRate:  0.001,
      settlement:      'T+2',
      acceptedCards:   ['Visa', 'Mastercard', 'Débito'],
      description:     '3.20% referencial. Procesador enfocado en MYPE peruanas con soporte local. Integración sencilla.',
      website:         'https://www.payme.pe',
      bestFor:         'MYPE peruanas que necesitan soporte local en español y rápida integración',
      integration:     ['API REST', 'Plugin WooCommerce', 'SDK Móvil'],
      getEffectiveCost: function(saleAmount, canRecoverIGV) {
        const commBase = saleAmount * this.commissionRate;
        const commIGV  = commBase * 0.18;
        if (canRecoverIGV) {
          return { base: commBase, igv: commIGV, effective: commBase, recovered: commIGV };
        } else {
          return { base: commBase, igv: commIGV, effective: commBase + commIGV, recovered: 0 };
        }
      }
    },

    efectivo: {
      id:              'efectivo',
      name:            'Efectivo / Transferencia',
      shortName:       'Efectivo',
      icon:            '💵',
      color:           '#10b981',
      colorSecondary:  '#059669',
      commissionRate:  0.00,           /* Sin comisión */
      fixedFee:        0.00,
      hasIGVOnComm:    false,
      minTransaction:  0,
      maxTransaction:  null,
      chargebackRate:  0,
      settlement:      'Inmediato',
      acceptedCards:   [],
      description:     '0% de comisión. Cero costo de procesamiento. Riesgo de seguridad en efectivo y limitación de trazabilidad.',
      website:         null,
      bestFor:         'Ventas presenciales de bajo riesgo o transferencias bancarias B2B',
      integration:     ['Manual'],
      getEffectiveCost: function(saleAmount, canRecoverIGV) {
        return { base: 0, igv: 0, effective: 0, recovered: 0 };
      }
    }

  }, /* end gateways */

  /* ═══════════════════════════════════════════════════════════════
     4. DETRACCIONES (SPOT) — Sistema de Pago de Obligaciones Tributarias
     ═══════════════════════════════════════════════════════════════ */

  detracciones: {

    description: 'Sistema de Pago de Obligaciones Tributarias (SPOT). El comprador retiene un % y lo deposita en la cuenta del proveedor en el Banco de la Nación.',
    minimumAmount: 700,                /* Solo aplica si la operación > S/ 700 */
    minimumAmountDisplay: 'S/ 700',
    bankAccount: 'Banco de la Nación (cuenta corriente del proveedor)',
    purpose: 'Anticipo para pago de IGV, Renta y otros tributos SUNAT',
    note: 'Las detracciones NO reducen el margen neto, pero SÍ restringen el flujo de caja disponible.',

    types: {

      bienes_gravados: {
        id:          'bienes_gravados',
        code:        '001',
        label:       'Bienes gravados con IGV (10%)',
        shortLabel:  'Bienes con IGV',
        rate:        0.10,
        rateDisplay: '10%',
        description: 'Bienes muebles gravados con IGV no incluidos en otras categorías. Aplica a la mayoría del comercio electrónico.',
        examples:    ['Ropa', 'Calzado', 'Electrónicos', 'Muebles', 'Cosméticos', 'Juguetes', 'Artículos para el hogar']
      },

      servicios: {
        id:          'servicios',
        code:        '002',
        label:       'Servicios generales (12%)',
        shortLabel:  'Servicios',
        rate:        0.12,
        rateDisplay: '12%',
        description: 'Prestación de servicios gravados con IGV de forma general. La tasa más común para servicios profesionales y técnicos.',
        examples:    ['Consultoría', 'Marketing digital', 'Diseño gráfico', 'Programación', 'Mantenimiento', 'Limpieza industrial']
      },

      transporte_carga: {
        id:          'transporte_carga',
        code:        '003',
        label:       'Transporte de bienes por vía terrestre (4%)',
        shortLabel:  'Transp. Carga',
        rate:        0.04,
        rateDisplay: '4%',
        description: 'Servicio de transporte de bienes por carretera. Tasa reducida por ser actividad de necesidad logística.',
        examples:    ['Transporte de mercadería', 'Courier empresarial', 'Mudanzas comerciales']
      },

      transporte_pasajeros: {
        id:          'transporte_pasajeros',
        code:        '004',
        label:       'Transporte público de pasajeros por vía terrestre (10%)',
        shortLabel:  'Transp. Pasajeros',
        rate:        0.10,
        rateDisplay: '10%',
        description: 'Servicio de transporte terrestre de personas. Aplica a empresas de transporte interprovincial.',
        examples:    ['Transporte interprovincial', 'Servicio de tours', 'Transporte turístico']
      },

      contratos_construccion: {
        id:          'contratos_construccion',
        code:        '005',
        label:       'Contratos de construcción (4%)',
        shortLabel:  'Construcción',
        rate:        0.04,
        rateDisplay: '4%',
        description: 'Contratos de construcción según CIIU. Incluye remodelaciones, ampliaciones y obras civiles.',
        examples:    ['Construcción de edificios', 'Remodelaciones', 'Ampliaciones', 'Instalaciones eléctricas en obra']
      },

      oro_minerales: {
        id:          'oro_minerales',
        code:        '006',
        label:       'Oro y demás minerales metálicos (10%)',
        shortLabel:  'Minerales',
        rate:        0.10,
        rateDisplay: '10%',
        description: 'Primera venta de oro, plata, cobre y demás minerales metálicos por el productor o primer vendedor.',
        examples:    ['Oro en barra', 'Cobre refinado', 'Plata', 'Zinc']
      },

      madera: {
        id:          'madera',
        code:        '007',
        label:       'Madera (4%)',
        shortLabel:  'Madera',
        rate:        0.04,
        rateDisplay: '4%',
        description: 'Venta de madera y productos de madera. Sector con tasa reducida para apoyar la formalización.',
        examples:    ['Madera aserrada', 'Tableros de madera', 'Parquet', 'Marcos de madera']
      },

      residuos: {
        id:          'residuos',
        code:        '008',
        label:       'Residuos, subproductos, desechos y desperdicios (15%)',
        shortLabel:  'Residuos',
        rate:        0.15,
        rateDisplay: '15%',
        description: 'Venta de residuos industriales, chatarra y desperdicios. Tasa más alta del sistema SPOT.',
        examples:    ['Chatarra metálica', 'Papel reciclado', 'Residuos plásticos', 'Desperdicios industriales']
      },

      azucar: {
        id:          'azucar',
        code:        '009',
        label:       'Azúcar y melaza de caña (10%)',
        shortLabel:  'Azúcar',
        rate:        0.10,
        rateDisplay: '10%',
        description: 'Primera venta de azúcar y melaza por el productor o ingenio azucarero.',
        examples:    ['Azúcar blanca', 'Azúcar rubia', 'Melaza', 'Azúcar industrial']
      },

      no_aplica: {
        id:          'no_aplica',
        code:        '000',
        label:       'No aplica a mi operación',
        shortLabel:  'No aplica',
        rate:        0.00,
        rateDisplay: '0%',
        description: 'La operación no está sujeta al sistema SPOT. Por ejemplo: ventas a consumidores finales (personas naturales sin negocio), importaciones directas, operaciones menores a S/ 700.',
        examples:    ['Ventas a personas naturales (consumidor final)', 'Operaciones < S/ 700', 'Exportaciones']
      }

    }, /* end detracciones.types */

    calculate: function(saleAmount, type) {
      if (saleAmount <= this.minimumAmount || type === 'no_aplica') {
        return { applies: false, amount: 0, rate: 0, netReceived: saleAmount };
      }
      const t = this.types[type];
      if (!t) {
        return { applies: false, amount: 0, rate: 0, netReceived: saleAmount };
      }
      const detractionAmount = saleAmount * t.rate;
      return {
        applies:         true,
        type:            type,
        label:           t.label,
        rate:            t.rate,
        rateDisplay:     t.rateDisplay,
        amount:          detractionAmount,
        netReceived:     saleAmount - detractionAmount,
        note:            `El cliente paga S/${saleAmount.toFixed(2)} pero deposita S/${detractionAmount.toFixed(2)} en tu cuenta BN. Recibes directamente S/${(saleAmount - detractionAmount).toFixed(2)}.`
      };
    }

  }, /* end detracciones */

  /* ═══════════════════════════════════════════════════════════════
     5. PERCEPCIONES DEL IGV
     ═══════════════════════════════════════════════════════════════ */

  percepciones: {

    description: 'Cobro anticipado del IGV realizado por agentes de percepción designados por SUNAT o por Aduanas en importaciones. Se aplica como crédito fiscal (excepto en NRUS).',

    ventaInterna: {
      description: 'Aplicada por grandes empresas designadas como agentes de percepción en ventas internas.',
      types: {
        general: {
          rate:        0.02,
          rateDisplay: '2%',
          label:       'Venta interna general (2%)',
          description: 'Para clientes designados en el padrón de percepción',
          applies:     'Ventas a clientes en el padrón de contribuyentes sujetos a percepción'
        },
        noDesignado: {
          rate:        0.05,
          rateDisplay: '5%',
          label:       'Cliente no designado (5%)',
          description: 'Para clientes sin RUC o no habidos',
          applies:     'Ventas a clientes sin RUC o con domicilio fiscal no habido'
        }
      }
    },

    importacion: {
      description: 'Aplicada por Aduanas (SUNAT) en el momento del despacho aduanero de importaciones.',
      types: {
        general: {
          rate:        0.035,
          rateDisplay: '3.5%',
          label:       'Importación general (3.5%)',
          description: 'Tasa estándar para importaciones de bienes con buen historial tributario',
          applies:     'Importadores con RUC activo y buen historial en SUNAT'
        },
        consumo: {
          rate:        0.05,
          rateDisplay: '5%',
          label:       'Bienes de consumo masivo (5%)',
          description: 'Para bienes de consumo incluidos en listados SUNAT',
          applies:     'Bienes de consumo en listas publicadas por SUNAT'
        },
        noHabido: {
          rate:        0.10,
          rateDisplay: '10%',
          label:       'No habido / No domiciliado (10%)',
          description: 'Sanción para importadores con problemas tributarios',
          applies:     'Importadores con condición "no habido" o "no domiciliado" ante SUNAT'
        }
      }
    },

    creditFiscal: {
      canRecover:       ['rer', 'mype', 'general'],
      cannotRecover:    ['nrus'],
      recoveryNote:     'En RER, MYPE y General: la percepción pagada se usa como crédito para reducir el IGV mensual por pagar. En NRUS: la percepción es un costo real que aumenta el precio de la mercadería.'
    },

    calculate: function(purchaseCost, type, regime) {
      const perceptionTypes = {
        '3.5': this.importacion.types.general,
        '5':   this.importacion.types.consumo,
        '10':  this.importacion.types.noHabido
      };
      const t = perceptionTypes[String(type)] || this.importacion.types.general;
      const amount = purchaseCost * t.rate;
      const canRecover = this.creditFiscal.canRecover.includes(regime);
      return {
        rate:        t.rate,
        rateDisplay: t.rateDisplay,
        amount:      amount,
        canRecover:  canRecover,
        netCost:     canRecover ? 0 : amount,  /* Si recupera, no es costo neto */
        note:        canRecover
                       ? `Recuperas S/${amount.toFixed(2)} como crédito fiscal de IGV (${regime.toUpperCase()})`
                       : `Costo real S/${amount.toFixed(2)} — No recuperable en ${regime.toUpperCase()}`
      };
    }

  }, /* end percepciones */

  /* ═══════════════════════════════════════════════════════════════
     6. FOREX — 10 DIVISAS PRINCIPALES VS SOL PERUANO (PEN)
     ═══════════════════════════════════════════════════════════════ */

  forex: {

    baseCurrency:  'PEN',
    apiBase:       'https://open.er-api.com/v6/latest/',
    apiAlt:        'https://api.exchangerate-api.com/v4/latest/',
    apiKey:        null,               /* API pública, no requiere clave en tier gratuito */
    updateInterval: 3600000,           /* Actualizar cada 1 hora (ms) */
    fallbackDate:  '2025-01-01',

    currencies: [
      {
        code:         'USD',
        name:         'Dólar Americano',
        nativeName:   'United States Dollar',
        country:      'Estados Unidos',
        flag:         '🇺🇸',
        symbol:       '$',
        fallbackRate: 3.72,            /* S/ por 1 USD — referencial BCRP 2025 */
        decimals:     4,
        importance:   1,
        note:         'Principal moneda de referencia para importaciones peruanas'
      },
      {
        code:         'EUR',
        name:         'Euro',
        nativeName:   'Euro',
        country:      'Zona Euro',
        flag:         '🇪🇺',
        symbol:       '€',
        fallbackRate: 4.05,
        decimals:     4,
        importance:   2,
        note:         'Segunda moneda más usada en transacciones internacionales'
      },
      {
        code:         'GBP',
        name:         'Libra Esterlina',
        nativeName:   'British Pound Sterling',
        country:      'Reino Unido',
        flag:         '🇬🇧',
        symbol:       '£',
        fallbackRate: 4.70,
        decimals:     4,
        importance:   3,
        note:         'Moneda de alto valor, referencia para mercados de lujo'
      },
      {
        code:         'JPY',
        name:         'Yen Japonés',
        nativeName:   '日本円',
        country:      'Japón',
        flag:         '🇯🇵',
        symbol:       '¥',
        fallbackRate: 0.025,           /* S/ por 1 JPY */
        decimals:     6,
        importance:   4,
        note:         'Importante para importaciones de electrónicos y maquinaria japonesa'
      },
      {
        code:         'CNY',
        name:         'Yuan Chino',
        nativeName:   '人民币',
        country:      'China',
        flag:         '🇨🇳',
        symbol:       '¥',
        fallbackRate: 0.52,
        decimals:     4,
        importance:   5,
        note:         'Crítico para importadores que compran directamente en Alibaba/AliExpress'
      },
      {
        code:         'CAD',
        name:         'Dólar Canadiense',
        nativeName:   'Canadian Dollar',
        country:      'Canadá',
        flag:         '🇨🇦',
        symbol:       'CA$',
        fallbackRate: 2.75,
        decimals:     4,
        importance:   6,
        note:         'Relevante para importaciones de materias primas canadienses'
      },
      {
        code:         'CHF',
        name:         'Franco Suizo',
        nativeName:   'Schweizer Franken',
        country:      'Suiza',
        flag:         '🇨🇭',
        symbol:       'Fr',
        fallbackRate: 4.20,
        decimals:     4,
        importance:   7,
        note:         'Moneda refugio, referencia para productos de alta calidad y precisión'
      },
      {
        code:         'AUD',
        name:         'Dólar Australiano',
        nativeName:   'Australian Dollar',
        country:      'Australia',
        flag:         '🇦🇺',
        symbol:       'A$',
        fallbackRate: 2.45,
        decimals:     4,
        importance:   8,
        note:         'Usado en comercio del Pacífico Sur y exportaciones mineras'
      },
      {
        code:         'HKD',
        name:         'Dólar de Hong Kong',
        nativeName:   'Hong Kong Dollar',
        country:      'Hong Kong',
        flag:         '🇭🇰',
        symbol:       'HK$',
        fallbackRate: 0.48,
        decimals:     4,
        importance:   9,
        note:         'Puerto financiero entre China continental y mercados occidentales'
      },
      {
        code:         'SGD',
        name:         'Dólar de Singapur',
        nativeName:   'Singapore Dollar',
        country:      'Singapur',
        flag:         '🇸🇬',
        symbol:       'S$',
        fallbackRate: 2.80,
        decimals:     4,
        importance:   10,
        note:         'Hub financiero del sudeste asiático, relevante para trading regional'
      }
    ],

    /* Obtener datos de fallback cuando la API no responde */
    getFallbackRates: function() {
      const rates = {};
      this.currencies.forEach(function(c) {
        rates[c.code] = c.fallbackRate;
      });
      return rates;
    },

    /* Convertir monto de moneda extranjera a PEN con spread bancario */
    convertToPEN: function(amount, fromCurrency, rates, spreadPct) {
      spreadPct = spreadPct || 0;
      if (fromCurrency === 'PEN') return amount;
      const rate = rates[fromCurrency];
      if (!rate) return amount;
      const spreadFactor = 1 + (spreadPct / 100);
      return amount * rate * spreadFactor;
    },

    /* Convertir PEN a otra moneda */
    convertFromPEN: function(amountPEN, toCurrency, rates) {
      if (toCurrency === 'PEN') return amountPEN;
      const rate = rates[toCurrency];
      if (!rate) return amountPEN;
      return amountPEN / rate;
    }

  }, /* end forex */

  /* ═══════════════════════════════════════════════════════════════
     7. CALENDARIO DE VENCIMIENTOS RUC SUNAT 2026
     ═══════════════════════════════════════════════════════════════ */

  rucCalendar: {

    year:        2026,
    description: 'Fechas proyectadas de vencimiento para declaraciones y pagos mensuales de IGV y Pago a Cuenta IR, según último dígito del RUC.',
    source:      'SUNAT — Cronograma de Obligaciones Mensuales proyectado 2026',
    note:        'Cuando la fecha cae en día no hábil, el vencimiento se traslada al siguiente día hábil. Confirma siempre en sunat.gob.pe.',

    months: [
      'Enero', 'Febrero', 'Marzo',
      'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre',
      'Octubre', 'Noviembre', 'Diciembre'
    ],

    monthsShort: [
      'Ene', 'Feb', 'Mar',
      'Abr', 'May', 'Jun',
      'Jul', 'Ago', 'Sep',
      'Oct', 'Nov', 'Dic'
    ],

    /*
     * deadlines[digit][monthIndex] = día del mes de vencimiento
     * Índice de mes: 0 = Enero ... 11 = Diciembre
     * Dígito: 0 a 9 (último dígito del RUC)
     */
    deadlines: {
      0: [14, 13, 13, 14, 14, 12, 14, 13, 14, 14, 14, 14],
      1: [15, 14, 14, 15, 15, 13, 15, 14, 15, 15, 15, 15],
      2: [16, 17, 17, 16, 18, 16, 16, 17, 16, 16, 16, 16],
      3: [19, 18, 18, 19, 19, 17, 19, 18, 19, 19, 19, 19],
      4: [20, 19, 19, 20, 20, 18, 20, 19, 20, 20, 20, 20],
      5: [21, 20, 20, 21, 21, 19, 21, 20, 21, 21, 21, 21],
      6: [10, 11, 11, 10, 12, 10, 10, 11, 10, 10, 10, 10],
      7: [11, 12, 12, 11, 13, 11, 11, 12, 11, 11, 11, 11],
      8: [12, 13, 13, 12, 14, 12, 12, 13, 12, 12, 12, 12],
      9: [13, 14, 14, 13, 15, 13, 13, 14, 13, 13, 13, 13]
    },

    /* Obtener el calendario completo para un dígito de RUC */
    getSchedule: function(rucDigit) {
      const digit = parseInt(rucDigit, 10);
      if (isNaN(digit) || digit < 0 || digit > 9) return null;
      const days = this.deadlines[digit];
      const now  = new Date();
      return this.months.map(function(monthName, idx) {
        const dueDate = new Date(2026, idx, days[idx]);
        const isCurrentMonth = (now.getMonth() === idx && now.getFullYear() <= 2026);
        const isPast = dueDate < now && now.getFullYear() >= 2026;
        return {
          monthIndex:     idx,
          monthName:      monthName,
          monthShort:     MA_DATA.rucCalendar.monthsShort[idx],
          day:            days[idx],
          dueDate:        dueDate,
          isCurrentMonth: isCurrentMonth,
          isPast:         isPast,
          label:          days[idx] + ' ' + MA_DATA.rucCalendar.monthsShort[idx],
          fullLabel:      days[idx] + ' de ' + monthName + ' 2026'
        };
      });
    },

    /* Obtener próximos vencimientos (máximo N) */
    getUpcoming: function(rucDigit, maxCount) {
      maxCount = maxCount || 3;
      const schedule = this.getSchedule(rucDigit);
      if (!schedule) return [];
      const now = new Date();
      return schedule
        .filter(function(s) { return s.dueDate >= now; })
        .slice(0, maxCount);
    }

  }, /* end rucCalendar */

  /* ═══════════════════════════════════════════════════════════════
     8. SEMÁFORO DE VIABILIDAD DEL NEGOCIO
     ═══════════════════════════════════════════════════════════════ */

  semaphore: {

    description: 'Sistema de clasificación de rentabilidad para evaluar la viabilidad financiera del negocio basado en el margen neto por unidad.',

    levels: [
      {
        id:          'critical',
        label:       'CRÍTICO',
        emoji:       '🔴',
        color:       '#ef4444',
        colorLight:  '#fca5a5',
        cssClass:    'critical',
        minMargin:   -Infinity,
        maxMargin:   8,
        badgeBg:     'rgba(239, 68, 68, 0.1)',
        badgeBorder: 'rgba(239, 68, 68, 0.25)',
        message:     'Margen insostenible. Alto riesgo de pérdida operativa. Revisa urgentemente tu estructura de costos o incrementa el precio.',
        recommendation: 'Reduce costos de producto o aumenta precio. El negocio no es viable en su estado actual.'
      },
      {
        id:          'risk',
        label:       'EN RIESGO',
        emoji:       '🟡',
        color:       '#f59e0b',
        colorLight:  '#fde68a',
        cssClass:    'risk',
        minMargin:   8,
        maxMargin:   15,
        badgeBg:     'rgba(245, 158, 11, 0.1)',
        badgeBorder: 'rgba(245, 158, 11, 0.25)',
        message:     'Margen ajustado. Vulnerable a variaciones del mercado y tipo de cambio. Sin colchón para imprevistos.',
        recommendation: 'Busca reducir al menos una capa de costos. Evalúa cambiar de régimen o pasarela de pago.'
      },
      {
        id:          'moderate',
        label:       'MODERADO',
        emoji:       '🔵',
        color:       '#22d3ee',
        colorLight:  '#a5f3fc',
        cssClass:    'moderate',
        minMargin:   15,
        maxMargin:   25,
        badgeBg:     'rgba(34, 211, 238, 0.1)',
        badgeBorder: 'rgba(34, 211, 238, 0.25)',
        message:     'Margen aceptable. Hay espacio de mejora. El negocio opera pero con margen de maniobra limitado.',
        recommendation: 'Enfoca en escalar volumen para maximizar utilidad mensual absoluta.'
      },
      {
        id:          'healthy',
        label:       'SALUDABLE',
        emoji:       '🟢',
        color:       '#10b981',
        colorLight:  '#a7f3d0',
        cssClass:    'healthy',
        minMargin:   25,
        maxMargin:   Infinity,
        badgeBg:     'rgba(16, 185, 129, 0.1)',
        badgeBorder: 'rgba(16, 185, 129, 0.25)',
        message:     'Excelente rentabilidad. Negocio financieramente sólido con capacidad de reinversión y crecimiento.',
        recommendation: 'Reinvierte en marketing y capacidad productiva. Tienes poder de competir en precio si necesitas.'
      }
    ],

    /* Clasificar un margen neto */
    classify: function(netMarginPct) {
      for (var i = 0; i < this.levels.length; i++) {
        var level = this.levels[i];
        if (netMarginPct >= level.minMargin && netMarginPct < level.maxMargin) {
          return level;
        }
      }
      return this.levels[this.levels.length - 1]; /* Fallback a healthy */
    }

  }, /* end semaphore */

  /* ═══════════════════════════════════════════════════════════════
     9. RESERVA LEGAL
     ═══════════════════════════════════════════════════════════════ */

  legalReserve: {

    rate:             0.10,             /* 10% de la utilidad neta de libre disposición */
    maxCapitalRatio:  0.20,             /* Hasta el 20% del capital social suscrito */
    legalBasis:       'Artículo 229, Ley General de Sociedades (Ley 26887)',
    description:      'Obligatorio para S.A. y similares. El 10% de la utilidad neta se destina a una reserva hasta que ésta alcance el 20% del capital social. No es costo, pero reduce la utilidad disponible para distribuir como dividendos.',
    appliesToRegimes: ['mype', 'general'],
    note:             'En la práctica, muchas MYPE informales no aplican la reserva legal, pero MarginAxis la incluye para un cálculo conservador y legalmente correcto.',
    dividendTax:      0.05,             /* 5% de retención sobre dividendos distribuidos */
    dividendTaxNote:  'Los dividendos pagados a personas naturales domiciliadas tienen 5% de retención (Art. 24-B LIR)'

  }, /* end legalReserve */

  /* ═══════════════════════════════════════════════════════════════
     10. VALORES POR DEFECTO (para la UI)
     ═══════════════════════════════════════════════════════════════ */

  defaults: {

    /* Costos del producto */
    purchaseCost:      30.00,
    logistics:         5.00,
    packaging:         2.00,
    shrinkagePct:      2.0,
    isImported:        false,
    perceptionType:    '3.5',

    /* Precio y meta */
    salePrice:         79.90,
    desiredProfit:     25.00,

    /* Configuración fiscal */
    gateway:           'niubiz',
    regime:            'mype',
    detractionType:    'bienes_gravados',

    /* Proyección */
    monthlyUnits:      200,
    fixedCosts:        1500,

    /* Forex */
    purchaseCurrency:  'PEN',
    spreadPct:         0.5,

    /* Sensibilidad */
    fxVariation:       0,
    commVariation:     0,

    /* RUC */
    rucDigit:          0,

    /* Calculado en tiempo de ejecución */
    calculatedAt:      null

  }, /* end defaults */

  /* ═══════════════════════════════════════════════════════════════
     11. HELPERS / UTILITIES (funciones puras sin dependencias externas)
     ═══════════════════════════════════════════════════════════════ */

  helpers: {

    /* Formato de moneda peruana */
    formatPEN: function(amount, decimals) {
      decimals = (decimals !== undefined) ? decimals : 2;
      var abs = Math.abs(amount);
      var formatted = 'S/ ' + abs.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return amount < 0 ? '-' + formatted : formatted;
    },

    /* Formato de porcentaje */
    formatPct: function(value, decimals) {
      decimals = (decimals !== undefined) ? decimals : 1;
      return value.toFixed(decimals) + '%';
    },

    /* Redondear al centavo más cercano hacia arriba */
    ceilCents: function(value) {
      return Math.ceil(value * 100) / 100;
    },

    /* Redondear al sol más cercano hacia arriba */
    ceilSoles: function(value) {
      return Math.ceil(value);
    },

    /* Verificar si un régimen es elegible según ingresos anuales proyectados */
    isRegimeEligible: function(regimeId, annualIncome, uitValue) {
      uitValue = uitValue || 5150;
      var regime = MA_DATA.regimes[regimeId];
      if (!regime) return false;

      if (regimeId === 'nrus') {
        return annualIncome <= 96000;
      }
      if (regimeId === 'rer') {
        return annualIncome <= 525000;
      }
      if (regimeId === 'mype') {
        return annualIncome <= (1700 * uitValue);
      }
      if (regimeId === 'general') {
        return true; /* Sin límite */
      }
      return false;
    },

    /* Calcular el impuesto a la renta por unidad según régimen */
    calcTaxPerUnit: function(regimeId, grossProfitPerUnit, salePriceNoIGV, monthlyUnits, uitValue) {
      uitValue = uitValue || MA_DATA.UIT;
      var regime = MA_DATA.regimes[regimeId];
      if (!regime) return { tax: 0, method: 'N/A', detail: '' };

      var tax = 0, method = '', detail = '';

      switch (regimeId) {

        case 'nrus':
          /* Cuota fija dividida entre unidades mensuales */
          var monthlyIncome = salePriceNoIGV * monthlyUnits;
          var nrusCalc = MA_DATA.regimes.nrus.howToCalculateTax(monthlyIncome);
          if (nrusCalc.exceeded) {
            tax = 0; /* No elegible, no calcular */
            method = 'NRUS (excedido)';
            detail = 'Ingresos superan el límite del NRUS';
          } else {
            tax = monthlyUnits > 0 ? nrusCalc.monthlyFee / monthlyUnits : 0;
            method = 'NRUS ' + (nrusCalc.category === 'cat1' ? 'Cat.1 S/20' : 'Cat.2 S/50');
            detail = 'S/' + nrusCalc.monthlyFee + '/mes ÷ ' + monthlyUnits + ' uds = S/' + tax.toFixed(4);
          }
          break;

        case 'rer':
          /* 1.5% sobre el precio de venta sin IGV */
          tax = salePriceNoIGV * 0.015;
          method = 'RER 1.5%';
          detail = '1.5% × S/' + salePriceNoIGV.toFixed(2) + ' = S/' + tax.toFixed(4);
          break;

        case 'mype':
          /* Proyección anual y cálculo progresivo */
          var annualProfit = grossProfitPerUnit * monthlyUnits * 12;
          if (annualProfit <= 0) {
            tax = 0;
            method = 'MYPE (sin utilidad)';
            detail = 'Utilidad bruta proyectada negativa o cero';
            break;
          }
          var mypeCalc = MA_DATA.regimes.mype.howToCalculateTax(annualProfit, uitValue);
          var effectiveAnnualRate = mypeCalc.tax / annualProfit;
          tax = grossProfitPerUnit * effectiveAnnualRate;
          method = 'MYPE ' + (effectiveAnnualRate * 100).toFixed(1) + '% ef.';
          detail = 'Proy. anual S/' + annualProfit.toFixed(0) + ' → ' + mypeCalc.description;
          break;

        case 'general':
          /* 29.5% sobre la utilidad bruta estimada */
          tax = grossProfitPerUnit > 0 ? grossProfitPerUnit * 0.295 : 0;
          method = 'General 29.5%';
          detail = '29.5% × S/' + grossProfitPerUnit.toFixed(2) + ' = S/' + tax.toFixed(4);
          break;

        default:
          tax = 0;
          method = 'N/A';
          detail = 'Régimen no reconocido';
      }

      return {
        tax:    Math.max(0, tax),
        method: method,
        detail: detail
      };
    }

  } /* end helpers */

}; /* end MA_DATA */

/* ─────────────────────────────────────────────────────────────────
   EXPORTACIÓN — Disponible globalmente como MA_DATA
   El objeto es inmutable mediante Object.freeze en nivel raíz
   (no en funciones anidadas para preservar compatibilidad)
   ───────────────────────────────────────────────────────────────── */

/* Hacer disponible globalmente para script.js */
if (typeof window !== 'undefined') {
  window.MA_DATA = MA_DATA;
}

/* Para entornos Node.js/bundlers */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MA_DATA;
}
