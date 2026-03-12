/**
 * ═══════════════════════════════════════════════════════════════════
 * MarginAxis Perú 2026 — MAIN ENGINE (script.js)
 * Version: 2026.3.0
 *
 * MÓDULOS:
 *   1.  Estado Global y Configuración
 *   2.  Referencias DOM
 *   3.  Utilidades de Formato
 *   4.  Toast Notifications
 *   5.  Switch de Modo (Directo / Inverso)
 *   6.  Motor de Cálculo Principal (Forward)
 *   7.  Algoritmo de Ingeniería Inversa (Reverse)
 *   8.  Tax Optimizer (Comparativa 4 Regímenes)
 *   9.  Gateway Battle (Comparativa 7 Pasarelas)
 *  10.  Recomendaciones Personalizadas
 *  11.  Actualizadores de UI
 *  12.  Forex Hub — Fetch API + Fallback
 *  13.  Convertidor de Divisas
 *  14.  Chart.js — Gráfico de Punto de Equilibrio
 *  15.  Chart.js — Gráfico de Estructura de Costos (Pie)
 *  16.  jsPDF — Reporte PDF Corporativo
 *  17.  Calendario RUC
 *  18.  Análisis de Sensibilidad
 *  19.  Navegación Móvil
 *  20.  Animaciones de Scroll
 *  21.  Listeners de Eventos
 *  22.  Inicialización
 * ═══════════════════════════════════════════════════════════════════
 */

'use strict';

/* ─────────────────────────────────────────────────────────────────
   1. ESTADO GLOBAL Y CONFIGURACIÓN
   ───────────────────────────────────────────────────────────────── */

const MA_STATE = {
  mode:              'forward',   /* 'forward' | 'reverse' */
  lastResult:        null,        /* Último cálculo completo */
  forexRates:        {},          /* Tipos de cambio vs USD */
  forexRatesPEN:     {},          /* Tipos de cambio vs PEN (calculados) */
  forexLoaded:       false,
  forexSource:       'none',      /* 'live' | 'fallback' | 'none' */
  charts:            {},          /* Instancias Chart.js */
  calcDebounce:      null,
  pdfLoaded:         false,
  pdfLoading:        false
};

const DEBOUNCE_MS   = 280;
const CHART_PRIMARY = '#34d399';
const CHART_CYAN    = '#22d3ee';
const CHART_RED     = '#f87171';
const CHART_AMBER   = '#fbbf24';
const CHART_PURPLE  = '#a78bfa';
const CHART_BG_ALpha = 'rgba(52,211,153,0.12)';

/* ─────────────────────────────────────────────────────────────────
   2. REFERENCIAS DOM
   ───────────────────────────────────────────────────────────────── */

function getEl(id) {
  return document.getElementById(id);
}

const DOM = {
  /* Mode */
  btnForward:           () => getEl('btn-mode-forward'),
  btnReverse:           () => getEl('btn-mode-reverse'),
  modeIndicator:        () => getEl('mode-indicator-text'),

  /* Costos */
  selPurchaseCurrency:  () => getEl('sel-purchase-currency'),
  inSpread:             () => getEl('in-spread'),
  inPurchaseCost:       () => getEl('in-purchase-cost'),
  inLogistics:          () => getEl('in-logistics'),
  inPackaging:          () => getEl('in-packaging'),
  inShrinkage:          () => getEl('in-shrinkage'),
  chkImported:          () => getEl('chk-imported'),
  grpPerception:        () => getEl('grp-perception'),
  selPerceptionType:    () => getEl('sel-perception-type'),
  purchaseCurrencyTag:  () => getEl('purchase-currency-tag'),
  dispBaseCost:         () => getEl('disp-base-cost'),
  dispTotalCost:        () => getEl('disp-total-cost'),

  /* Precio / Inverso */
  sectionForward:       () => getEl('section-forward-price'),
  sectionReverse:       () => getEl('section-reverse-price'),
  inSalePrice:          () => getEl('in-sale-price'),
  inDesiredProfit:      () => getEl('in-desired-profit'),
  dispPriceNoIGV:       () => getEl('disp-price-no-igv'),
  dispPriceIGV:         () => getEl('disp-price-igv'),
  dispRequiredPrice:    () => getEl('disp-required-price'),
  dispRequiredNoIGV:    () => getEl('disp-required-price-no-igv'),
  reverseResultCard:    () => getEl('reverse-result-card'),

  /* Resultado Hero */
  displayMarginPct:     () => getEl('display-margin-pct'),
  displayNetAmount:     () => getEl('display-net-amount'),
  displaySemMsg:        () => getEl('display-sem-message'),
  semBadge:             () => getEl('sem-badge'),
  semBadgeLabel:        () => getEl('sem-badge') ? getEl('sem-badge').querySelector('.ma-sem-label') : null,
  displayGrossPct:      () => getEl('display-gross-pct'),
  displayROI:           () => getEl('display-roi'),
  displaySafety:        () => getEl('display-safety'),
  displayRealUtil:      () => getEl('display-real-util'),
  displayBEUnits:       () => getEl('display-be-units'),
  displayBEDays:        () => getEl('display-be-days'),
  displayMonthlyNet:    () => getEl('display-monthly-net'),

  /* Fiscal */
  selGateway:           () => getEl('sel-gateway'),
  selRegime:            () => getEl('sel-regime'),
  selDetraction:        () => getEl('sel-detraction'),
  inMonthlyUnits:       () => getEl('in-monthly-units'),
  inFixedCosts:         () => getEl('in-fixed-costs'),
  gwInfoCard:           () => getEl('gateway-info-card'),
  gwCommission:         () => getEl('gw-commission'),
  gwFixedFee:           () => getEl('gw-fixed-fee'),
  gwEffectiveCost:      () => getEl('gw-effective-cost'),
  gwIGVComm:            () => getEl('gw-igv-comm'),
  regimeInfoCard:       () => getEl('regime-info-card'),
  regimeInfoContent:    () => getEl('regime-info-content'),

  /* Desglose */
  breakdownContainer:   () => getEl('breakdown-container'),
  detractionAlert:      () => getEl('detraction-alert'),
  detractionAlertText:  () => getEl('detraction-alert-text'),
  perceptionAlert:      () => getEl('perception-alert'),
  perceptionAlertText:  () => getEl('perception-alert-text'),

  /* Tax Optimizer */
  taxOptimizerContainer:() => getEl('tax-optimizer-container'),
  taxSavingsCard:       () => getEl('tax-savings-card'),
  taxSavingsAmount:     () => getEl('tax-savings-amount'),
  taxSavingsSub:        () => getEl('tax-savings-sub'),

  /* Gateway Battle */
  gwBattleContainer:    () => getEl('gateway-battle-container'),

  /* Recomendaciones */
  recsContainer:        () => getEl('recs-container'),

  /* Ratios */
  ratioROI:             () => getEl('ratio-roi'),
  ratioSafety:          () => getEl('ratio-safety'),
  ratioBEDays:          () => getEl('ratio-be-days'),
  ratioMonthly:         () => getEl('ratio-monthly'),
  ratioReserve:         () => getEl('ratio-reserve'),
  ratioReal:            () => getEl('ratio-real'),

  /* Sensibilidad */
  sliderFX:             () => getEl('slider-fx-variation'),
  sliderComm:           () => getEl('slider-commission-variation'),
  sliderFXDisplay:      () => getEl('slider-fx-display'),
  sliderCommDisplay:    () => getEl('slider-comm-display'),
  sensAdjMargin:        () => getEl('sens-adjusted-margin'),
  sensImpact:           () => getEl('sens-impact'),

  /* Forex */
  forexStatusDot:       () => getEl('forex-status-dot'),
  forexStatusText:      () => getEl('forex-status-text'),
  forexRatesContainer:  () => getEl('forex-rates-container'),
  btnForexRefresh:      () => getEl('btn-forex-refresh'),

  /* Convertidor */
  convAmount:           () => getEl('conv-amount'),
  convFrom:             () => getEl('conv-from'),
  convTo:               () => getEl('conv-to'),
  btnConvert:           () => getEl('btn-convert'),
  convResultAmount:     () => getEl('conv-result-amount'),
  convResultRate:       () => getEl('conv-result-rate'),

  /* Gráficos */
  chartBreakeven:       () => getEl('chart-breakeven'),
  chartCostPie:         () => getEl('chart-cost-pie'),
  chartBEUnits:         () => getEl('chart-be-units'),
  chartBEDays:          () => getEl('chart-be-days'),
  chartCurrentUnits:    () => getEl('chart-current-units'),
  chartSurplus:         () => getEl('chart-surplus'),

  /* RUC */
  inRucDigit:           () => getEl('in-ruc-digit'),
  rucCalendarContainer: () => getEl('ruc-calendar-container'),

  /* Acciones */
  btnGeneratePDF:       () => getEl('btn-generate-pdf'),
  btnCopySummary:       () => getEl('btn-copy-summary'),
  btnReset:             () => getEl('btn-reset'),

  /* Toast */
  toast:                () => getEl('ma-toast'),
  toastIcon:            () => getEl('toast-icon'),
  toastMsg:             () => getEl('toast-msg'),

  /* Mobile nav */
  mobTabs:              () => document.querySelectorAll('.ma-mob-tab')
};

/* ─────────────────────────────────────────────────────────────────
   3. UTILIDADES DE FORMATO
   ───────────────────────────────────────────────────────────────── */

function fmtPEN(val, dec) {
  if (val === null || val === undefined || isNaN(val)) return 'S/ —';
  dec = (dec !== undefined) ? dec : 2;
  const abs = Math.abs(val);
  const str = abs.toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (val < 0 ? '-S/ ' : 'S/ ') + str;
}

function fmtPct(val, dec) {
  if (val === null || val === undefined || isNaN(val)) return '—%';
  dec = (dec !== undefined) ? dec : 1;
  return (val >= 0 ? '' : '') + val.toFixed(dec) + '%';
}

function fmtNum(val, dec) {
  if (val === null || val === undefined || isNaN(val)) return '—';
  dec = (dec !== undefined) ? dec : 0;
  return val.toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Convierte un color (hex, rgb, rgba) a formato rgba con alpha dado.
 * Necesario porque Chart.js no puede interpretar hex con canal alpha nativo
 * de la misma forma que rgba() en todos los contextos de canvas.
 */
function toRgba(color, alpha) {
  alpha = (alpha !== undefined) ? alpha : 0.8;
  /* Formato hex #RRGGBB */
  if (/^#[0-9a-fA-F]{6}$/.test(color)) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }
  /* Formato rgba() — reemplazar alpha existente */
  if (color.indexOf('rgba(') === 0) {
    return color.replace(/,\s*[\d.]+\s*\)\s*$/, ', ' + alpha + ')');
  }
  /* Formato rgb() — convertir a rgba */
  if (color.indexOf('rgb(') === 0) {
    return color.replace('rgb(', 'rgba(').replace(')', ', ' + alpha + ')');
  }
  return color;
}

function parseF(id) {
  const el = getEl(id);
  if (!el) return 0;
  const v = parseFloat(el.value);
  return isNaN(v) ? 0 : v;
}

function parseI(id) {
  const el = getEl(id);
  if (!el) return 0;
  const v = parseInt(el.value, 10);
  return isNaN(v) ? 0 : v;
}

function selectVal(id) {
  const el = getEl(id);
  return el ? el.value : '';
}

function checkVal(id) {
  const el = getEl(id);
  return el ? el.checked : false;
}

/* ─────────────────────────────────────────────────────────────────
   4. TOAST NOTIFICATIONS
   ───────────────────────────────────────────────────────────────── */

let toastTimer = null;

function showToast(msg, icon, duration) {
  icon     = icon     || '✅';
  duration = duration || 3000;
  const t  = DOM.toast();
  const ti = DOM.toastIcon();
  const tm = DOM.toastMsg();
  if (!t || !ti || !tm) return;
  ti.textContent = icon;
  tm.textContent = msg;
  t.style.display = 'flex';
  requestAnimationFrame(function() {
    t.classList.add('ma-toast--show');
  });
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(function() {
    t.classList.remove('ma-toast--show');
    setTimeout(function() { t.style.display = 'none'; }, 350);
  }, duration);
}

/* ─────────────────────────────────────────────────────────────────
   5. SWITCH DE MODO (DIRECTO / INVERSO)
   ───────────────────────────────────────────────────────────────── */

function setMode(mode) {
  MA_STATE.mode = mode;
  const btnF = DOM.btnForward();
  const btnR = DOM.btnReverse();
  const secF = DOM.sectionForward();
  const secR = DOM.sectionReverse();
  const ind  = DOM.modeIndicator();

  if (mode === 'forward') {
    if (btnF) { btnF.classList.add('ma-mode-btn--active');    btnF.setAttribute('aria-pressed', 'true'); }
    if (btnR) { btnR.classList.remove('ma-mode-btn--active'); btnR.setAttribute('aria-pressed', 'false'); }
    if (secF) secF.style.display = '';
    if (secR) secR.style.display = 'none';
    if (ind)  ind.innerHTML = 'Modo activo: <strong>Cálculo Directo</strong>';
  } else {
    if (btnR) { btnR.classList.add('ma-mode-btn--active');    btnR.setAttribute('aria-pressed', 'true'); }
    if (btnF) { btnF.classList.remove('ma-mode-btn--active'); btnF.setAttribute('aria-pressed', 'false'); }
    if (secF) secF.style.display = 'none';
    if (secR) secR.style.display = '';
    if (ind)  ind.innerHTML = 'Modo activo: <strong>Ingeniería Inversa</strong>';
  }
  triggerCalculation();
}

/* ─────────────────────────────────────────────────────────────────
   6. MOTOR DE CÁLCULO PRINCIPAL (FORWARD)
   ───────────────────────────────────────────────────────────────── */

/**
 * Objeto central de cálculo.
 * Devuelve un objeto `result` con todos los valores calculados.
 */
function calculateForward(inputs) {
  const D   = MA_DATA;
  const igv = D.IGV.rate;          /* 0.18 */

  /* ── 1. Resolver el precio de compra en PEN ── */
  let purchaseCostPEN = inputs.purchaseCost;
  if (inputs.purchaseCurrency !== 'PEN' && MA_STATE.forexRatesPEN[inputs.purchaseCurrency]) {
    const rate = MA_STATE.forexRatesPEN[inputs.purchaseCurrency];
    const spreadFactor = 1 + (inputs.spreadPct / 100);
    purchaseCostPEN = inputs.purchaseCost * rate * spreadFactor;
  }

  /* ── 2. Costo base del producto ── */
  const shrinkageFactor = 1 + (inputs.shrinkagePct / 100);
  const baseCostNoMerma = purchaseCostPEN + inputs.logistics + inputs.packaging;
  const baseCostWithMerma = baseCostNoMerma * shrinkageFactor;

  /* ── 3. Percepción de importación ── */
  let perceptionCost = 0;
  let perceptionDetail = null;
  if (inputs.isImported) {
    const percCalc = D.percepciones.calculate(purchaseCostPEN, inputs.perceptionType, inputs.regime);
    perceptionCost = percCalc.netCost; /* 0 si puede recuperar, percepción si no */
    perceptionDetail = percCalc;
  }

  /* ── 4. Costo total del producto por unidad ── */
  const totalProductCost = baseCostWithMerma + perceptionCost;

  /* ── 5. Precio de venta → descomponer IGV ── */
  const salePriceWithIGV = inputs.salePrice;
  const chargesIGV = D.regimes[inputs.regime] ? D.regimes[inputs.regime].chargesIGV : true;
  const saleNoIGV = chargesIGV ? (salePriceWithIGV / D.IGV.factor) : salePriceWithIGV;
  const igvInPrice = chargesIGV ? (salePriceWithIGV - saleNoIGV) : 0;

  /* ── 6. Comisión de pasarela ── */
  const gw = D.gateways[inputs.gateway];
  const canRecoverIGV = D.regimes[inputs.regime] ? D.regimes[inputs.regime].deductsIGV : true;
  let gwCommBase  = 0;
  let gwCommIGV   = 0;
  let gwCommEff   = 0;
  if (gw) {
    const gwCalc = gw.getEffectiveCost(salePriceWithIGV, canRecoverIGV);
    gwCommBase = gwCalc.base;
    gwCommIGV  = gwCalc.igv;
    gwCommEff  = gwCalc.effective;
  }

  /* ── 7. Utilidad bruta antes de impuestos ── */
  const grossProfit = saleNoIGV - gwCommBase - totalProductCost;

  /* ── 8. Impuesto a la Renta por unidad ── */
  const taxCalc = D.helpers.calcTaxPerUnit(
    inputs.regime,
    grossProfit,
    saleNoIGV,
    inputs.monthlyUnits,
    D.UIT
  );
  const taxPerUnit = taxCalc.tax;

  /* ── 9. Reserva Legal (solo MYPE y General) ── */
  let legalReservePerUnit = 0;
  const netBeforeReserve = grossProfit - taxPerUnit;
  if ((inputs.regime === 'mype' || inputs.regime === 'general') && netBeforeReserve > 0) {
    legalReservePerUnit = netBeforeReserve * D.legalReserve.rate;
  }

  /* ── 10. Utilidad neta disponible ── */
  const netProfit = grossProfit - taxPerUnit - legalReservePerUnit;

  /* ── 11. Margen neto (% sobre precio de venta CON IGV) ── */
  const netMarginPct    = salePriceWithIGV > 0 ? (netProfit / salePriceWithIGV) * 100 : 0;
  const grossMarginPct  = salePriceWithIGV > 0 ? (grossProfit / salePriceWithIGV) * 100 : 0;
  const roi             = totalProductCost > 0  ? (netProfit / totalProductCost) * 100 : 0;

  /* ── 12. Punto de equilibrio ── */
  const netPerUnit = netProfit;
  let beUnits = 0;
  let beDays  = Infinity;
  if (netPerUnit > 0 && inputs.fixedCosts > 0) {
    beUnits = Math.ceil(inputs.fixedCosts / netPerUnit);
    if (inputs.monthlyUnits > 0) {
      beDays = Math.ceil((beUnits / inputs.monthlyUnits) * 30);
    }
  }

  /* ── 13. Margen de seguridad ── */
  let safetyMarginPct = 0;
  if (beUnits > 0 && inputs.monthlyUnits > 0) {
    safetyMarginPct = ((inputs.monthlyUnits - beUnits) / inputs.monthlyUnits) * 100;
  }

  /* ── 14. Proyecciones mensuales ── */
  const monthlyGrossRevenue = salePriceWithIGV * inputs.monthlyUnits;
  const monthlyNetRevenue   = saleNoIGV * inputs.monthlyUnits;
  const monthlyNetProfit    = (netProfit * inputs.monthlyUnits) - inputs.fixedCosts;
  const monthlyGateway      = gwCommEff * inputs.monthlyUnits;
  const monthlyTax          = taxPerUnit * inputs.monthlyUnits;

  /* ── 15. Detracción ── */
  const detractionCalc = MA_DATA.detracciones.calculate(salePriceWithIGV, inputs.detractionType);

  /* ── 16. Semáforo ── */
  const semLevel = MA_DATA.semaphore.classify(netMarginPct);

  /* ── 17. Componer el resultado ── */
  const result = {
    /* Inputs resueltos */
    purchaseCostPEN,
    baseCostNoMerma,
    baseCostWithMerma,
    perceptionCost,
    perceptionDetail,
    totalProductCost,
    salePriceWithIGV,
    saleNoIGV,
    igvInPrice,
    chargesIGV,
    canRecoverIGV,

    /* Comisión */
    gwCommBase,
    gwCommIGV,
    gwCommEff,
    gateway: gw,

    /* Rentabilidad */
    grossProfit,
    taxPerUnit,
    taxMethod:          taxCalc.method,
    taxDetail:          taxCalc.detail,
    legalReservePerUnit,
    netProfit,
    netMarginPct,
    grossMarginPct,
    roi,

    /* Breakeven */
    beUnits,
    beDays:             isFinite(beDays) ? beDays : null,
    safetyMarginPct,

    /* Proyecciones */
    monthlyGrossRevenue,
    monthlyNetRevenue,
    monthlyNetProfit,
    monthlyGateway,
    monthlyTax,
    fixedCosts:         inputs.fixedCosts,
    monthlyUnits:       inputs.monthlyUnits,

    /* Detracción */
    detractionCalc,

    /* Semáforo */
    semLevel,

    /* Meta */
    regime:   inputs.regime,
    _inputs:  inputs
  };

  return result;
}

/* ─────────────────────────────────────────────────────────────────
   7. ALGORITMO DE INGENIERÍA INVERSA (REVERSE)
   ───────────────────────────────────────────────────────────────── */

/**
 * Calcula el precio de venta CON IGV que produce exactamente
 * `desiredProfit` de ganancia neta después de todos los descuentos.
 *
 * Fórmula base (analítica para RER):
 *   x = precio con IGV
 *   saleNoIGV = x / 1.18
 *   gwComm    = x × gwRate × (1 o 1.18 si NRUS)
 *   fixFee    = feeFixed × (1 o 1.18 si NRUS)
 *   grossProfit = saleNoIGV - gwComm - fixFee - totalCost
 *   netProfit   = grossProfit × (1 - taxRateOnProfit)
 *
 * Para MYPE/General (tasa sobre utilidad anual proyectada),
 * se usa iteración de punto fijo (converge en < 20 iteraciones).
 */
function calculateReverse(inputs) {
  const D    = MA_DATA;
  const igv  = D.IGV.rate;

  /* ── Resolver costo total del producto (igual que forward) ── */
  let purchaseCostPEN = inputs.purchaseCost;
  if (inputs.purchaseCurrency !== 'PEN' && MA_STATE.forexRatesPEN[inputs.purchaseCurrency]) {
    const rate = MA_STATE.forexRatesPEN[inputs.purchaseCurrency];
    const sf   = 1 + (inputs.spreadPct / 100);
    purchaseCostPEN = inputs.purchaseCost * rate * sf;
  }
  const shrinkageFactor  = 1 + (inputs.shrinkagePct / 100);
  const baseCostWithMerma = (purchaseCostPEN + inputs.logistics + inputs.packaging) * shrinkageFactor;

  let perceptionCost = 0;
  if (inputs.isImported) {
    const percCalc = D.percepciones.calculate(purchaseCostPEN, inputs.perceptionType, inputs.regime);
    perceptionCost = percCalc.netCost;
  }
  const totalCost = baseCostWithMerma + perceptionCost;

  /* ── Configuración de la pasarela ── */
  const gw           = D.gateways[inputs.gateway] || D.gateways['efectivo'];
  const regime       = D.regimes[inputs.regime];
  const canRecoverIGV = regime ? regime.deductsIGV : true;
  const chargesIGV   = regime ? regime.chargesIGV  : true;
  const igvFactor    = chargesIGV ? D.IGV.factor : 1;

  /* Factor del IGV sobre la comisión: si no puede recuperar → × 1.18 */
  const commIGVFactor = canRecoverIGV ? 1 : D.IGV.factor;

  /* Coeficientes lineales: x = precio con IGV */
  /* saleNoIGV = x / igvFactor */
  /* gwComm    = x × rate × commIGVFactor + fixedFee × commIGVFactor */
  /* grossProfit = x/igvFactor - x×rate×commIGVFactor - fixedFee×commIGVFactor - totalCost */
  /* = x × (1/igvFactor - rate×commIGVFactor) - fixedFee×commIGVFactor - totalCost */

  const gwRate    = gw.commissionRate || 0;
  const fixedFee  = gw.fixedFee || 0;
  const A         = (1 / igvFactor) - (gwRate * commIGVFactor);   /* coef. lineal de x en grossProfit */
  const B         = (fixedFee * commIGVFactor) + totalCost;        /* término independiente (sumar) */

  /* grossProfit = A×x - B */
  /* netProfit   = grossProfit × (1 - marginalTaxRate) - legalReserve */

  const desiredNet = inputs.desiredProfit;

  let priceWithIGV = null;
  let iterations   = 0;

  if (inputs.regime === 'nrus') {
    /* NRUS: pago fijo, no depende del precio → ignora en el cálculo del precio */
    /* netProfit ≈ grossProfit (sin tasa proporcional sobre precio) */
    /* Necesitamos: A×x - B = desiredNet */
    if (A <= 0) { return { error: true, msg: 'Imposible calcular: comisiones superan el ingreso neto.' }; }
    priceWithIGV = (desiredNet + B) / A;

  } else if (inputs.regime === 'rer') {
    /* RER: 1.5% sobre saleNoIGV = 1.5% × (x / igvFactor) */
    /* netProfit = A×x - B - 0.015 × (x/igvFactor) */
    /* = x × (A - 0.015/igvFactor) - B */
    const A2 = A - (0.015 / igvFactor);
    if (A2 <= 0) { return { error: true, msg: 'Imposible: comisiones + RER superan el ingreso.' }; }
    priceWithIGV = (desiredNet + B) / A2;

  } else {
    /* MYPE / General: tasa sobre utilidad anual proyectada → iteración */
    /* Empezar con estimación inicial (tasa efectiva del 10% para MYPE, 29.5% General) */
    let taxRateEst = (inputs.regime === 'general') ? 0.295 : 0.10;
    let prevPrice  = 0;
    priceWithIGV   = (desiredNet + B) / (A * (1 - taxRateEst));

    for (let i = 0; i < 40; i++) {
      /* Calcular con este precio provisional */
      const grossP = A * priceWithIGV - B;
      if (grossP <= 0) {
        priceWithIGV *= 1.2;
        continue;
      }
      /* Calcular tasa efectiva usando la lógica de MA_DATA */
      const taxResult = MA_DATA.helpers.calcTaxPerUnit(
        inputs.regime,
        grossP,
        priceWithIGV / igvFactor,
        inputs.monthlyUnits,
        MA_DATA.UIT
      );
      const netBeforeReserve = grossP - taxResult.tax;
      let reserve = 0;
      if ((inputs.regime === 'mype' || inputs.regime === 'general') && netBeforeReserve > 0) {
        reserve = netBeforeReserve * MA_DATA.legalReserve.rate;
      }
      const netP = netBeforeReserve - reserve;

      /* Ajustar precio para que netP = desiredNet */
      const needed = desiredNet - netP; /* Cuánto falta */
      const newPrice = priceWithIGV + (needed / A);

      iterations++;
      if (Math.abs(newPrice - priceWithIGV) < 0.001) {
        priceWithIGV = newPrice;
        break;
      }
      priceWithIGV = newPrice;
      prevPrice = newPrice;
    }
  }

  if (!isFinite(priceWithIGV) || priceWithIGV <= 0) {
    return { error: true, msg: 'No es posible obtener esa ganancia con la configuración actual.' };
  }

  /* Redondear al centavo superior */
  priceWithIGV = Math.ceil(priceWithIGV * 100) / 100;
  const priceNoIGV = chargesIGV ? (priceWithIGV / igvFactor) : priceWithIGV;

  return {
    error:          false,
    priceWithIGV:   priceWithIGV,
    priceNoIGV:     priceNoIGV,
    totalCost:      totalCost,
    iterations:     iterations,
    verification:   null   /* Se verificará corriendo forward con el precio calculado */
  };
}

/* ─────────────────────────────────────────────────────────────────
   8. TAX OPTIMIZER — COMPARATIVA 4 REGÍMENES
   ───────────────────────────────────────────────────────────────── */

function runTaxOptimizer(baseInputs) {
  const regimes   = ['nrus', 'rer', 'mype', 'general'];
  const results   = [];
  const annualIncome = baseInputs.salePrice * baseInputs.monthlyUnits * 12;

  regimes.forEach(function(rid) {
    const eligible = MA_DATA.helpers.isRegimeEligible(rid, annualIncome, MA_DATA.UIT);
    const inputs   = Object.assign({}, baseInputs, { regime: rid });
    const calc     = calculateForward(inputs);
    results.push({
      regimeId:     rid,
      regime:       MA_DATA.regimes[rid],
      eligible:     eligible,
      netProfit:    calc.netProfit,
      netMarginPct: calc.netMarginPct,
      taxPerUnit:   calc.taxPerUnit,
      monthlyNet:   calc.monthlyNetProfit,
      calc:         calc
    });
  });

  /* Ordenar por utilidad neta MENSUAL (elegibles primero) */
  const eligibles = results.filter(function(r) { return r.eligible; });
  const ineligibles = results.filter(function(r) { return !r.eligible; });
  eligibles.sort(function(a, b) { return b.monthlyNet - a.monthlyNet; });

  const sorted  = eligibles.concat(ineligibles);
  const best    = eligibles.length > 0 ? eligibles[0] : null;

  /* Ahorro vs. Régimen General */
  const generalResult = results.find(function(r) { return r.regimeId === 'general'; });
  let savings = 0;
  if (best && generalResult && best.regimeId !== 'general') {
    savings = best.monthlyNet - generalResult.monthlyNet;
  }

  return { sorted, best, savings, generalResult };
}

/* ─────────────────────────────────────────────────────────────────
   9. GATEWAY BATTLE — COMPARATIVA 7 PASARELAS
   ───────────────────────────────────────────────────────────────── */

function runGatewayBattle(baseInputs) {
  const gateways = Object.keys(MA_DATA.gateways);
  const results  = [];

  gateways.forEach(function(gid) {
    const inputs = Object.assign({}, baseInputs, { gateway: gid });
    const calc   = calculateForward(inputs);
    results.push({
      gatewayId:    gid,
      gateway:      MA_DATA.gateways[gid],
      netProfit:    calc.netProfit,
      netMarginPct: calc.netMarginPct,
      gwCommEff:    calc.gwCommEff,
      monthlyNet:   calc.monthlyNetProfit,
      calc:         calc
    });
  });

  results.sort(function(a, b) { return b.netProfit - a.netProfit; });
  const best  = results[0];
  const worst = results[results.length - 1];
  const spread = best && worst ? best.netProfit - worst.netProfit : 0;

  return { results, best, worst, spread };
}

/* ─────────────────────────────────────────────────────────────────
   10. RECOMENDACIONES PERSONALIZADAS
   ───────────────────────────────────────────────────────────────── */

function generateRecommendations(result, taxOpt, gwBattle) {
  const recs = [];

  /* Semáforo crítico */
  if (result.netMarginPct < 8) {
    recs.push({
      priority: 'high',
      icon:     '🚨',
      title:    'Margen crítico',
      text:     'Tu margen neto es menor al 8%. El negocio no es sostenible. Considera aumentar el precio en al menos ' +
                fmtPEN(Math.abs(result.netProfit) + 5) + ' o reducir el costo del producto.'
    });
  }

  /* Pasarela más barata */
  if (gwBattle && gwBattle.best && gwBattle.best.gatewayId !== result._inputs.gateway) {
    const saving = gwBattle.best.netProfit - result.netProfit;
    if (saving > 0.50) {
      recs.push({
        priority: 'medium',
        icon:     '💳',
        title:    'Cambia de pasarela',
        text:     'Usando ' + gwBattle.best.gateway.name + ' ganarías ' + fmtPEN(saving) +
                  ' más por unidad (' + fmtPEN(saving * result.monthlyUnits) + '/mes). ' +
                  'Comisión: ' + (gwBattle.best.gateway.commissionRate * 100).toFixed(2) + '%.'
      });
    }
  }

  /* Régimen tributario óptimo */
  if (taxOpt && taxOpt.best && taxOpt.best.regimeId !== result._inputs.regime) {
    const currentRegimeResult = taxOpt.sorted.find(function(r) {
      return r.regimeId === result._inputs.regime;
    });
    if (currentRegimeResult) {
      const savingM = taxOpt.best.monthlyNet - currentRegimeResult.monthlyNet;
      if (savingM > 50) {
        recs.push({
          priority: 'high',
          icon:     '🧮',
          title:    'Optimiza tu régimen tributario',
          text:     'En ' + taxOpt.best.regime.name + ' ganarías ' + fmtPEN(savingM) +
                    '/mes más. Consulta con tu contador para migrar de régimen.'
        });
      }
    }
  }

  /* Merma alta */
  if (result._inputs.shrinkagePct > 4) {
    recs.push({
      priority: 'low',
      icon:     '📦',
      title:    'Reduce la merma',
      text:     'Tu merma es del ' + result._inputs.shrinkagePct + '%. Reducirla al 2% mejoraría ' +
                'tu costo unitario en ' + fmtPEN(result.baseCostWithMerma - ((result.purchaseCostPEN + result._inputs.logistics + result._inputs.packaging) * 1.02)) + '.'
    });
  }

  /* Punto de equilibrio lejano */
  if (result.beUnits > result.monthlyUnits * 1.5) {
    recs.push({
      priority: 'medium',
      icon:     '⚖️',
      title:    'Punto de equilibrio alto',
      text:     'Necesitas vender ' + fmtNum(result.beUnits) + ' unidades para cubrir costos fijos, ' +
                'pero solo proyectas ' + fmtNum(result.monthlyUnits) + '. Reduce costos fijos o aumenta el volumen.'
    });
  }

  /* Detracción impacta flujo de caja */
  if (result.detractionCalc && result.detractionCalc.applies) {
    recs.push({
      priority: 'low',
      icon:     '🏦',
      title:    'Gestiona la detracción',
      text:     'El ' + (result.detractionCalc.rate * 100).toFixed(0) + '% del cobro (' +
                fmtPEN(result.detractionCalc.amount) + '/unidad) va a tu cuenta BN. ' +
                'Planifica tu flujo de caja para no quedarte sin liquidez.'
    });
  }

  /* Margen de seguridad bajo */
  if (result.safetyMarginPct > 0 && result.safetyMarginPct < 20) {
    recs.push({
      priority: 'medium',
      icon:     '🛡️',
      title:    'Margen de seguridad bajo',
      text:     'Si tus ventas bajan un ' + result.safetyMarginPct.toFixed(0) + '%, entras en pérdida. ' +
                'Mantén un inventario mínimo y diversifica canales de venta.'
    });
  }

  /* Sin recomendaciones → estado óptimo */
  if (recs.length === 0) {
    recs.push({
      priority: 'success',
      icon:     '🏆',
      title:    '¡Configuración óptima!',
      text:     'Tu negocio opera en condiciones saludables. Considera reinvertir utilidades en publicidad ' +
                'o ampliar tu catálogo para aumentar el volumen mensual.'
    });
  }

  return recs;
}

/* ─────────────────────────────────────────────────────────────────
   11. ACTUALIZADORES DE UI
   ───────────────────────────────────────────────────────────────── */

function safeSet(id, val) {
  const el = getEl(id);
  if (el) el.textContent = val;
}

function updateCostSummary(result) {
  const baseCostDisplay = fmtPEN(result.purchaseCostPEN + result._inputs.logistics + result._inputs.packaging);
  const totalCostDisplay = fmtPEN(result.totalProductCost);
  safeSet('disp-base-cost',  baseCostDisplay);
  safeSet('disp-total-cost', totalCostDisplay);
}

function updatePriceBreakdown(result) {
  safeSet('disp-price-no-igv', fmtPEN(result.saleNoIGV));
  safeSet('disp-price-igv',    fmtPEN(result.igvInPrice));
}

function updateHeroResult(result) {
  const sl = result.semLevel;
  const mpEl = DOM.displayMarginPct();
  if (mpEl) {
    mpEl.textContent = fmtPct(result.netMarginPct);
    mpEl.className = 'ma-margin-pct ma-margin-' + sl.cssClass;
  }
  safeSet('display-net-amount', fmtPEN(result.netProfit) + ' por unidad');
  safeSet('display-sem-message', sl.message);
  safeSet('display-gross-pct',   fmtPct(result.grossMarginPct));
  safeSet('display-roi',         fmtPct(result.roi));
  safeSet('display-safety',      fmtPct(result.safetyMarginPct));
  safeSet('display-real-util',   fmtPEN(result.netProfit));

  const beUnitsDisplay = result.beUnits > 0 ? fmtNum(result.beUnits) + ' uds' : '—';
  const beDaysDisplay  = result.beDays !== null ? fmtNum(result.beDays) + ' días' : '∞';
  safeSet('display-be-units',   beUnitsDisplay);
  safeSet('display-be-days',    beDaysDisplay);
  safeSet('display-monthly-net', fmtPEN(result.monthlyNetProfit));

  /* Semaphore Badge */
  const badge = DOM.semBadge();
  if (badge) {
    badge.className = 'ma-semaphore-badge ma-semaphore-' + sl.cssClass;
    const lbl = badge.querySelector('.ma-sem-label');
    if (lbl) lbl.textContent = sl.label;
  }
}

function updateRatios(result) {
  safeSet('ratio-roi',      fmtPct(result.roi));
  safeSet('ratio-safety',   fmtPct(result.safetyMarginPct));
  safeSet('ratio-be-days',  result.beDays !== null ? fmtNum(result.beDays) + ' días' : '∞');
  safeSet('ratio-monthly',  fmtPEN(result.monthlyNetProfit));
  const reserveDisplay = fmtPEN(result.legalReservePerUnit * result.monthlyUnits);
  safeSet('ratio-reserve',  reserveDisplay);
  safeSet('ratio-real',     fmtPEN(result.netProfit));

  /* Chart labels for breakeven section */
  safeSet('chart-be-units',      result.beUnits > 0 ? fmtNum(result.beUnits) + ' unidades' : '—');
  safeSet('chart-be-days',       result.beDays !== null ? fmtNum(result.beDays) + ' días' : '∞');
  safeSet('chart-current-units', fmtNum(result.monthlyUnits) + ' unidades/mes');
  const surplus = result.monthlyUnits - result.beUnits;
  safeSet('chart-surplus', surplus > 0 ? '+' + fmtNum(surplus) + ' uds' : fmtNum(surplus) + ' uds');
}

function updateBreakdown(result) {
  const container = DOM.breakdownContainer();
  if (!container) return;

  const rows = [];

  /* Header */
  rows.push('<div class="ma-breakdown-row ma-breakdown-header">' +
    '<span class="ma-bk-label">Concepto</span>' +
    '<span class="ma-bk-val ma-bk-neu">Importe</span>' +
  '</div>');

  /* Ingresos */
  rows.push(bkRow('📈', 'Precio de venta (c/ IGV)', fmtPEN(result.salePriceWithIGV), 'pos'));
  if (result.chargesIGV) {
    rows.push(bkRowDim('  ↳ Sin IGV (base para impuesto a la renta)', fmtPEN(result.saleNoIGV)));
    rows.push(bkRowDim('  ↳ IGV contenido (18%)', '– ' + fmtPEN(result.igvInPrice)));
  }

  /* Separador */
  rows.push('<div class="ma-breakdown-row ma-breakdown-subtotal">' +
    '<span class="ma-bk-label">Costos del Producto</span>' +
    '<span class="ma-bk-val ma-bk-neg">–</span>' +
  '</div>');

  rows.push(bkRow('📦', 'Costo de compra (PEN)', '– ' + fmtPEN(result.purchaseCostPEN), 'neg'));
  rows.push(bkRowDim('  ↳ Logística / flete', '– ' + fmtPEN(result._inputs.logistics)));
  rows.push(bkRowDim('  ↳ Empaque', '– ' + fmtPEN(result._inputs.packaging)));
  if (result._inputs.shrinkagePct > 0) {
    const shrinkCost = result.baseCostWithMerma - (result.purchaseCostPEN + result._inputs.logistics + result._inputs.packaging);
    rows.push(bkRowDim('  ↳ Merma (' + result._inputs.shrinkagePct + '%)', '– ' + fmtPEN(shrinkCost)));
  }
  if (result.perceptionCost > 0) {
    rows.push(bkRowDim('  ↳ Percepción importación', '– ' + fmtPEN(result.perceptionCost)));
  }

  /* Comisión pasarela */
  rows.push('<div class="ma-breakdown-row ma-breakdown-subtotal">' +
    '<span class="ma-bk-label">Pasarela: ' + (result.gateway ? result.gateway.shortName : '—') + '</span>' +
    '<span class="ma-bk-val ma-bk-neg">–</span>' +
  '</div>');
  rows.push(bkRow('💳', 'Comisión base (' + (result.gateway ? (result.gateway.commissionRate * 100).toFixed(2) + '%' : '0%') + ')', '– ' + fmtPEN(result.gwCommBase), 'neg'));
  if (!result.canRecoverIGV && result.gwCommIGV > 0) {
    rows.push(bkRowDim('  ↳ IGV comisión (no recuperable en ' + result.regime.toUpperCase() + ')', '– ' + fmtPEN(result.gwCommIGV)));
  } else if (result.gwCommIGV > 0) {
    rows.push(bkRowDim('  ↳ IGV comisión (recuperable como crédito fiscal)', '± ' + fmtPEN(result.gwCommIGV)));
  }

  /* Utilidad bruta */
  rows.push('<div class="ma-breakdown-row ma-breakdown-subtotal">' +
    '<span class="ma-bk-label">Utilidad Bruta</span>' +
    '<span class="ma-bk-val ' + (result.grossProfit >= 0 ? 'ma-bk-pos' : 'ma-bk-neg') + '">' +
    fmtPEN(result.grossProfit) + '</span>' +
  '</div>');

  /* Impuesto a la renta */
  rows.push('<div class="ma-breakdown-row ma-breakdown-subtotal">' +
    '<span class="ma-bk-label">Impuestos</span>' +
    '<span class="ma-bk-val ma-bk-neg">–</span>' +
  '</div>');
  rows.push(bkRow('🏛️', 'Impuesto a la renta (' + result.taxMethod + ')', '– ' + fmtPEN(result.taxPerUnit), 'neg'));
  if (result.legalReservePerUnit > 0) {
    rows.push(bkRowDim('  ↳ Reserva legal (10%)', '– ' + fmtPEN(result.legalReservePerUnit)));
  }

  /* Total final */
  rows.push('<div class="ma-breakdown-row ma-breakdown-total">' +
    '<span class="ma-bk-label" style="font-weight:800;color:var(--ma-text-primary)">💰 Utilidad Neta Disponible</span>' +
    '<span class="ma-bk-val ' + (result.netProfit >= 0 ? 'ma-bk-pos' : 'ma-bk-neg') + '" style="font-size:1rem;font-weight:900;">' +
    fmtPEN(result.netProfit) + '</span>' +
  '</div>');

  rows.push('<div class="ma-breakdown-row ma-breakdown-dim">' +
    '<span style="color:var(--ma-text-muted)">Margen neto sobre precio de venta</span>' +
    '<span class="ma-mono" style="color:var(--ma-emerald-400)">' + fmtPct(result.netMarginPct) + '</span>' +
  '</div>');

  container.innerHTML = rows.join('');

  /* Alertas */
  updateAlerts(result);
}

function bkRow(icon, label, val, valClass) {
  return '<div class="ma-breakdown-row">' +
    '<span class="ma-bk-label">' + icon + ' ' + escHtml(label) + '</span>' +
    '<span class="ma-bk-val ma-bk-' + (valClass || 'neu') + '">' + escHtml(val) + '</span>' +
  '</div>';
}

function bkRowDim(label, val) {
  return '<div class="ma-breakdown-row ma-breakdown-dim">' +
    '<span style="color:var(--ma-text-muted)">' + escHtml(label) + '</span>' +
    '<span class="ma-mono" style="font-size:0.75rem;color:var(--ma-text-muted)">' + escHtml(val) + '</span>' +
  '</div>';
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function updateAlerts(result) {
  /* Detracción */
  const dAlert = DOM.detractionAlert();
  const dText  = DOM.detractionAlertText();
  if (dAlert && dText) {
    if (result.detractionCalc && result.detractionCalc.applies) {
      dText.textContent = ' ' + result.detractionCalc.note;
      dAlert.style.display = 'flex';
    } else {
      dAlert.style.display = 'none';
    }
  }

  /* Percepción */
  const pAlert = DOM.perceptionAlert();
  const pText  = DOM.perceptionAlertText();
  if (pAlert && pText) {
    if (result.perceptionDetail) {
      pText.innerHTML = '<strong>Percepción de importación:</strong> ' + escHtml(result.perceptionDetail.note);
      pAlert.style.display = 'flex';
    } else {
      pAlert.style.display = 'none';
    }
  }
}

function updateGatewayInfo(result) {
  const gw = result.gateway;
  if (!gw) return;
  safeSet('gw-commission',    (gw.commissionRate * 100).toFixed(2) + '%');
  safeSet('gw-fixed-fee',     fmtPEN(gw.fixedFee));
  safeSet('gw-effective-cost', fmtPEN(result.gwCommEff));
  safeSet('gw-igv-comm',      fmtPEN(result.gwCommIGV));
}

function updateRegimeInfo(regimeId) {
  const container = DOM.regimeInfoContent();
  if (!container) return;
  const regime = MA_DATA.regimes[regimeId];
  if (!regime) { container.innerHTML = ''; return; }

  let html = '<div class="ma-regime-desc">';
  if (regimeId === 'nrus') {
    html += '<strong>Cuota fija:</strong> S/20 (Cat.1, hasta S/5,000/mes) o S/50 (Cat.2, hasta S/8,000/mes). Sin IGV, sin facturas.';
  } else if (regimeId === 'rer') {
    html += '<strong>1.5%</strong> sobre ingresos netos mensuales. Pago definitivo. Facturas OK. Límite S/525,000/año.';
  } else if (regimeId === 'mype') {
    html += '<strong>10%</strong> primeras 15 UIT utilidad (S/77,250) + <strong>29.5%</strong> exceso. Pago a cuenta 1%/mes. Hasta 1,700 UIT.';
  } else if (regimeId === 'general') {
    html += '<strong>29.5%</strong> sobre utilidad neta anual. Sin límite de ingresos. Contabilidad completa.';
  }
  html += '</div>';
  html += '<div class="ma-regime-tags">';
  html += '<span class="ma-regime-tag">' + (regime.emitsFactura ? '✓ Facturas' : '✗ Sin facturas') + '</span>';
  html += '<span class="ma-regime-tag">' + (regime.deductsIGV ? '✓ Crédito fiscal' : '✗ Sin crédito IGV') + '</span>';
  html += '<span class="ma-regime-tag">' + (regime.chargesIGV ? '✓ Cobra IGV' : '✗ Sin IGV en ventas') + '</span>';
  html += '</div>';

  container.innerHTML = html;
}

function updateTaxOptimizer(taxOpt, currentRegime) {
  const container = DOM.taxOptimizerContainer();
  if (!container) return;

  let html = '';
  taxOpt.sorted.forEach(function(r) {
    const isBest      = taxOpt.best && r.regimeId === taxOpt.best.regimeId;
    const isCurrent   = r.regimeId === currentRegime;
    const isIneligible = !r.eligible;

    let cardClass = 'ma-tax-regime-card';
    if (isBest)      cardClass += ' ma-tax-regime-card--best';
    if (isIneligible) cardClass += ' ma-tax-regime-card--ineligible';

    html += '<div class="' + cardClass + '">';
    html += '<div class="ma-tax-regime-left">';
    html += '<span>' + r.regime.icon + '</span>';
    html += '<span class="ma-tax-regime-name">' + r.regime.name + '</span>';
    if (isCurrent)    html += '<span class="ma-tax-best-badge" style="background:rgba(34,211,238,0.1);color:#22d3ee;border-color:rgba(34,211,238,0.25);">ACTUAL</span>';
    if (isBest && !isCurrent) html += '<span class="ma-tax-best-badge">MEJOR</span>';
    if (isIneligible) html += '<span class="ma-tax-ineligible-badge">NO ELEGIBLE</span>';
    html += '</div>';

    html += '<div class="ma-tax-regime-right">';
    html += '<div class="ma-tax-regime-metric">';
    html += '<span class="ma-tax-regime-metric-label">Utilidad/ud</span>';
    html += '<span class="ma-tax-regime-metric-val" style="color:' + (r.netProfit >= 0 ? '#34d399' : '#f87171') + '">' + fmtPEN(r.netProfit) + '</span>';
    html += '</div>';
    html += '<div class="ma-tax-regime-metric">';
    html += '<span class="ma-tax-regime-metric-label">Margen</span>';
    html += '<span class="ma-tax-regime-metric-val" style="color:' + (r.netMarginPct >= 15 ? '#34d399' : r.netMarginPct >= 8 ? '#fbbf24' : '#f87171') + '">' + fmtPct(r.netMarginPct) + '</span>';
    html += '</div>';
    html += '</div>';

    html += '</div>';
  });

  container.innerHTML = html;

  /* Savings card */
  const savingsCard = DOM.taxSavingsCard();
  if (savingsCard) {
    if (taxOpt.savings > 0 && taxOpt.best && taxOpt.best.regimeId !== 'general') {
      savingsCard.style.display = 'block';
      safeSet('tax-savings-amount', fmtPEN(taxOpt.savings));
      safeSet('tax-savings-sub', 'al mes vs. Régimen General (' + taxOpt.best.regime.name + ')');
    } else {
      savingsCard.style.display = 'none';
    }
  }
}

function updateGatewayBattle(gwBattle, salePrice) {
  const container = DOM.gwBattleContainer();
  if (!container) return;

  const maxNet = gwBattle.results.reduce(function(m, r) { return Math.max(m, r.netProfit); }, 0);

  let html = '';
  gwBattle.results.forEach(function(r, idx) {
    const isBest = idx === 0;
    const pct    = maxNet > 0 ? Math.max(5, (r.netProfit / maxNet) * 100) : 5;
    const barColor = isBest
      ? 'linear-gradient(90deg, #10b981, #34d399)'
      : r.netProfit > 0
        ? 'linear-gradient(90deg, #064e3b, #065f46)'
        : 'linear-gradient(90deg, #7f1d1d, #991b1b)';

    html += '<div class="ma-gw-battle-row' + (isBest ? ' ma-gw-battle-row--best' : '') + '">';
    html += '<div class="ma-gw-battle-header">';
    html += '<span class="ma-gw-battle-name">' + r.gateway.icon + ' ' + r.gateway.shortName + ' (' + (r.gateway.commissionRate * 100).toFixed(2) + '%)</span>';
    html += '<span class="ma-gw-battle-val" style="color:' + (r.netProfit >= 0 ? '#34d399' : '#f87171') + '">' + fmtPEN(r.netProfit) + ' / ud</span>';
    html += '</div>';
    html += '<div class="ma-gw-battle-track">';
    html += '<div class="ma-gw-battle-bar" style="width:' + pct.toFixed(1) + '%;background:' + barColor + '">';
    html += '<span class="ma-gw-battle-bar-label">' + fmtPct(r.netMarginPct) + '</span>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
  });

  if (gwBattle.spread > 0) {
    html += '<div style="margin-top:10px;font-size:0.72rem;color:var(--ma-text-muted);text-align:center;">' +
            'Diferencia entre mejor y peor pasarela: <strong style="color:#34d399">' + fmtPEN(gwBattle.spread) + '</strong> / unidad' +
            ' (<strong style="color:#34d399">' + fmtPEN(gwBattle.spread * gwBattle.results[0].calc.monthlyUnits) + '</strong>/mes)' +
            '</div>';
  }

  container.innerHTML = html;
}

function updateRecommendations(recs) {
  const container = DOM.recsContainer();
  if (!container) return;

  const priorityColors = {
    high:    { bg: 'rgba(239,68,68,0.06)',  border: 'rgba(239,68,68,0.18)',    color: '#f87171' },
    medium:  { bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.18)',   color: '#fbbf24' },
    low:     { bg: 'rgba(34,211,238,0.06)', border: 'rgba(34,211,238,0.18)',   color: '#22d3ee' },
    success: { bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.18)',   color: '#34d399' }
  };

  let html = '';
  recs.forEach(function(rec) {
    const style = priorityColors[rec.priority] || priorityColors.low;
    html += '<div style="' +
            'padding:12px 14px;' +
            'border-radius:10px;' +
            'border:1px solid ' + style.border + ';' +
            'background:' + style.bg + ';' +
            'margin-bottom:10px;' +
            '">';
    html += '<div style="display:flex;align-items:flex-start;gap:8px;">';
    html += '<span style="font-size:1.1rem;flex-shrink:0;margin-top:1px;">' + rec.icon + '</span>';
    html += '<div>';
    html += '<div style="font-size:0.8rem;font-weight:700;color:' + style.color + ';margin-bottom:3px;">' + escHtml(rec.title) + '</div>';
    html += '<div style="font-size:0.76rem;color:rgba(255,255,255,0.65);line-height:1.45;">' + escHtml(rec.text) + '</div>';
    html += '</div>';
    html += '</div>';
    html += '</div>';
  });

  container.innerHTML = html;
}

function updateReverseResult(reverseResult) {
  const dispPrice   = DOM.dispRequiredPrice();
  const dispNoIGV   = DOM.dispRequiredNoIGV();
  if (!dispPrice || !dispNoIGV) return;

  if (!reverseResult || reverseResult.error) {
    dispPrice.textContent = 'S/ —';
    dispNoIGV.textContent = reverseResult && reverseResult.msg ? reverseResult.msg : 'Sin calcular';
    return;
  }

  dispPrice.textContent = fmtPEN(reverseResult.priceWithIGV);
  dispNoIGV.textContent = 'Sin IGV: ' + fmtPEN(reverseResult.priceNoIGV);
}

function updateSensitivity(baseResult) {
  const fxVar   = parseF('slider-fx-variation');
  const commVar = parseF('slider-commission-variation');

  safeSet('slider-fx-display',   (fxVar >= 0 ? '+' : '') + fxVar + '%');
  safeSet('slider-comm-display', (commVar >= 0 ? '+' : '') + commVar.toFixed(1) + '%');

  if (!baseResult) { return; }

  /* Recalcular con variaciones */
  const inputs = Object.assign({}, baseResult._inputs);
  inputs.spreadPct       = (inputs.spreadPct || 0) + fxVar;
  const commAdjustment   = commVar / 100;

  /* Ajustar tasa de comisión de la pasarela temporalmente */
  const gwOriginal = MA_DATA.gateways[inputs.gateway];
  if (!gwOriginal) return;

  /* Clonar la pasarela con comisión ajustada */
  const gwClone = Object.assign({}, gwOriginal, {
    commissionRate: Math.max(0, gwOriginal.commissionRate + commAdjustment),
    getEffectiveCost: gwOriginal.getEffectiveCost
  });

  /* Patch temporal */
  const origGW = MA_DATA.gateways[inputs.gateway];
  MA_DATA.gateways[inputs.gateway] = gwClone;

  let sensResult;
  try {
    sensResult = calculateForward(inputs);
  } catch(e) {
    sensResult = null;
  } finally {
    MA_DATA.gateways[inputs.gateway] = origGW;
  }

  if (!sensResult) return;

  const marginDiff = sensResult.netMarginPct - baseResult.netMarginPct;
  const profitDiff = sensResult.netProfit - baseResult.netProfit;

  const adjEl = DOM.sensAdjMargin();
  const impEl = DOM.sensImpact();
  if (adjEl) {
    adjEl.textContent = fmtPct(sensResult.netMarginPct);
    adjEl.style.color = sensResult.netMarginPct >= 15
      ? '#34d399' : sensResult.netMarginPct >= 8
      ? '#fbbf24' : '#f87171';
  }
  if (impEl) {
    const sign = profitDiff >= 0 ? '+' : '';
    impEl.textContent = sign + fmtPEN(profitDiff) + ' / ud';
    impEl.style.color = profitDiff >= 0 ? '#34d399' : '#f87171';
  }
}

/* ─────────────────────────────────────────────────────────────────
   12. FOREX HUB — FETCH API + FALLBACK
   ───────────────────────────────────────────────────────────────── */

function setForexStatus(status, text) {
  const dot  = DOM.forexStatusDot();
  const textEl = DOM.forexStatusText();
  if (dot) {
    dot.className = 'ma-forex-status-dot ma-forex-status-dot--' + status;
  }
  if (textEl) {
    textEl.textContent = text;
  }
}

async function fetchForexRates() {
  setForexStatus('loading', 'Actualizando...');
  const container = DOM.forexRatesContainer();

  try {
    /* Intentar con Open Exchange Rates (tier gratuito) usando USD como base */
    const url = 'https://open.er-api.com/v6/latest/USD';

    /* AbortController con timeout manual para compatibilidad con Safari < 17 */
    const controller = new AbortController();
    const timeoutId  = setTimeout(function() { controller.abort(); }, 8000);

    let response;
    try {
      response = await fetch(url, { signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) throw new Error('HTTP ' + response.status);

    const data = await response.json();

    if (data && data.rates) {
      MA_STATE.forexRates = data.rates;

      /* Calcular rates vs PEN */
      const penPerUSD = data.rates['PEN'] || 3.72;
      MA_DATA.forex.currencies.forEach(function(c) {
        if (c.code === 'PEN') {
          MA_STATE.forexRatesPEN[c.code] = 1;
        } else {
          const rateVsUSD = data.rates[c.code];
          if (rateVsUSD) {
            /* 1 unit of currency = penPerUSD / rateVsUSD PEN */
            MA_STATE.forexRatesPEN[c.code] = penPerUSD / rateVsUSD;
          } else {
            MA_STATE.forexRatesPEN[c.code] = c.fallbackRate;
          }
        }
      });

      MA_STATE.forexLoaded = true;
      MA_STATE.forexSource = 'live';
      setForexStatus('live', 'En vivo · ' + new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }));
      renderForexTable(MA_STATE.forexRatesPEN);
      showToast('Tipos de cambio actualizados', '💱', 2500);
    } else {
      throw new Error('Formato de respuesta inválido');
    }

  } catch (err) {
    /* Usar tasas de fallback */
    console.warn('MarginAxis Forex: API no disponible, usando tasas de referencia.', err.message);
    useFallbackRates();
  }

  /* Recalcular si hay datos */
  if (MA_STATE.lastResult) {
    triggerCalculation();
  }
}

function useFallbackRates() {
  MA_DATA.forex.currencies.forEach(function(c) {
    MA_STATE.forexRatesPEN[c.code] = c.fallbackRate;
  });
  MA_STATE.forexLoaded = true;
  MA_STATE.forexSource = 'fallback';
  setForexStatus('fallback', 'Tasas de referencia (offline)');
  renderForexTable(MA_STATE.forexRatesPEN);
}

function renderForexTable(ratesPEN) {
  const container = DOM.forexRatesContainer();
  if (!container) return;

  let html = '<div class="ma-forex-header-row" style="display:flex;gap:12px;padding:4px 10px;font-size:0.62rem;color:var(--ma-text-dim);text-transform:uppercase;letter-spacing:0.08em;border-bottom:1px solid rgba(255,255,255,0.05);margin-bottom:4px;">' +
    '<span style="width:28px;flex-shrink:0;"></span>' +
    '<span style="width:40px;flex-shrink:0;">Código</span>' +
    '<span style="flex:1;">Nombre</span>' +
    '<span style="flex-shrink:0;text-align:right;min-width:90px;">Tipo de Cambio</span>' +
    '<span style="flex-shrink:0;text-align:right;min-width:48px;">1 PEN =</span>' +
  '</div>';

  MA_DATA.forex.currencies.forEach(function(c) {
    const rate    = ratesPEN[c.code] || c.fallbackRate;
    const inverse = rate > 0 ? (1 / rate) : 0;
    const decimals = c.code === 'JPY' ? 4 : 4;

    html += '<div class="ma-forex-row">';
    html += '<span class="ma-forex-flag">' + c.flag + '</span>';
    html += '<span class="ma-forex-code">' + c.code + '</span>';
    html += '<span class="ma-forex-name">' + c.name + '</span>';
    html += '<span class="ma-forex-rate">' + rate.toFixed(c.code === 'JPY' ? 4 : 4) + ' PEN</span>';
    html += '<span class="ma-forex-change ma-forex-flat">' + inverse.toFixed(4) + '</span>';
    html += '</div>';
  });

  container.innerHTML = html;
}

function convertCurrency() {
  const amount  = parseFloat(DOM.convAmount() ? DOM.convAmount().value : 0) || 0;
  const from    = selectVal('conv-from');
  const to      = selectVal('conv-to');
  const resEl   = DOM.convResultAmount();
  const rateEl  = DOM.convResultRate();

  if (!resEl || !rateEl) return;

  if (!MA_STATE.forexLoaded) {
    resEl.textContent = '—';
    rateEl.textContent = 'Cargando tipos de cambio...';
    return;
  }

  let result;
  let rateDisplay;

  if (from === 'PEN') {
    const rateTo = MA_STATE.forexRatesPEN[to] || 1;
    result = amount / rateTo;
    rateDisplay = '1 PEN = ' + (1 / rateTo).toFixed(4) + ' ' + to;
  } else if (to === 'PEN') {
    const rateFrom = MA_STATE.forexRatesPEN[from] || 1;
    result = amount * rateFrom;
    rateDisplay = '1 ' + from + ' = ' + rateFrom.toFixed(4) + ' PEN';
  } else {
    /* Cruzar via PEN */
    const rateFromPEN = MA_STATE.forexRatesPEN[from] || 1;
    const rateToPEN   = MA_STATE.forexRatesPEN[to]   || 1;
    const amountPEN   = amount * rateFromPEN;
    result = amountPEN / rateToPEN;
    const crossRate = rateFromPEN / rateToPEN;
    rateDisplay = '1 ' + from + ' = ' + crossRate.toFixed(4) + ' ' + to + ' (vía PEN)';
  }

  /* Formato del resultado */
  const toCurrency = MA_DATA.forex.currencies.find(function(c) { return c.code === to; });
  const sym = toCurrency ? toCurrency.symbol : '';
  resEl.textContent  = sym + ' ' + result.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  rateEl.textContent = rateDisplay;
}

/* ─────────────────────────────────────────────────────────────────
   13. CHART.JS — GRÁFICO DE PUNTO DE EQUILIBRIO
   ───────────────────────────────────────────────────────────────── */

function initBreakevenChart(result) {
  const canvas = DOM.chartBreakeven();
  if (!canvas || typeof Chart === 'undefined') return;

  if (MA_STATE.charts.breakeven) {
    MA_STATE.charts.breakeven.destroy();
    MA_STATE.charts.breakeven = null;
  }

  const monthlyUnits = result.monthlyUnits;
  const beUnits      = result.beUnits || 0;
  const salePrice    = result.saleNoIGV;
  const varCost      = result.totalProductCost + result.gwCommEff;
  const fixedCosts   = result.fixedCosts;
  const netPerUnit   = result.netProfit;

  /* Generar puntos del gráfico: 0 → 2× unidades mensuales */
  const maxUnits = Math.max(monthlyUnits * 1.5, beUnits * 1.5, 50);
  const steps    = 30;
  const labels   = [];
  const revenueData  = [];
  const totalCostData = [];
  const netProfitData = [];

  for (let i = 0; i <= steps; i++) {
    const units = Math.round((maxUnits / steps) * i);
    labels.push(units);
    revenueData.push(parseFloat((salePrice * units).toFixed(2)));
    totalCostData.push(parseFloat((fixedCosts + varCost * units).toFixed(2)));
    netProfitData.push(parseFloat((netPerUnit * units - fixedCosts).toFixed(2)));
  }

  const chartData = {
    labels: labels,
    datasets: [
      {
        label:           'Ingresos Netos (S/)',
        data:            revenueData,
        borderColor:     CHART_PRIMARY,
        backgroundColor: 'rgba(52,211,153,0.06)',
        borderWidth:     2.5,
        pointRadius:     0,
        pointHoverRadius: 5,
        fill:            false,
        tension:         0.2
      },
      {
        label:           'Costos Totales (S/)',
        data:            totalCostData,
        borderColor:     CHART_RED,
        backgroundColor: 'rgba(248,113,113,0.06)',
        borderWidth:     2.5,
        pointRadius:     0,
        pointHoverRadius: 5,
        fill:            false,
        tension:         0.2
      },
      {
        label:           'Utilidad Neta (S/)',
        data:            netProfitData,
        borderColor:     CHART_CYAN,
        backgroundColor: 'rgba(34,211,238,0.06)',
        borderWidth:     2,
        pointRadius:     0,
        pointHoverRadius: 5,
        fill:            true,
        tension:         0.3
      }
    ]
  };

  const chartOptions = {
    responsive:         true,
    maintainAspectRatio: false,
    interaction: {
      mode:      'index',
      intersect: false
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.88)',
        titleColor:      '#d1fae5',
        bodyColor:       'rgba(255,255,255,0.75)',
        borderColor:     'rgba(52,211,153,0.25)',
        borderWidth:     1,
        padding:         12,
        callbacks: {
          title: function(items) {
            return 'Unidades: ' + items[0].label;
          },
          label: function(item) {
            return item.dataset.label + ': ' + fmtPEN(item.raw);
          }
        }
      },
      annotation: undefined
    },
    scales: {
      x: {
        title: {
          display: true,
          text:    'Unidades vendidas (mensual)',
          color:   'rgba(167,243,208,0.5)',
          font:    { size: 11 }
        },
        ticks: {
          color:     'rgba(255,255,255,0.4)',
          font:      { size: 10 },
          maxTicksLimit: 8
        },
        grid: {
          color:     'rgba(255,255,255,0.04)'
        }
      },
      y: {
        title: {
          display: true,
          text:    'Soles (S/)',
          color:   'rgba(167,243,208,0.5)',
          font:    { size: 11 }
        },
        ticks: {
          color:     'rgba(255,255,255,0.4)',
          font:      { size: 10, family: "'JetBrains Mono', monospace" },
          callback:  function(val) { return 'S/' + val.toLocaleString('es-PE'); },
          maxTicksLimit: 7
        },
        grid: {
          color:     'rgba(255,255,255,0.04)'
        }
      }
    }
  };

  MA_STATE.charts.breakeven = new Chart(canvas, {
    type:    'line',
    data:    chartData,
    options: chartOptions
  });
}

/* ─────────────────────────────────────────────────────────────────
   14. CHART.JS — GRÁFICO DE ESTRUCTURA DE COSTOS (PIE)
   ───────────────────────────────────────────────────────────────── */

function initCostPieChart(result) {
  const canvas = DOM.chartCostPie();
  if (!canvas || typeof Chart === 'undefined') return;

  if (MA_STATE.charts.costPie) {
    MA_STATE.charts.costPie.destroy();
    MA_STATE.charts.costPie = null;
  }

  const sp = result.salePriceWithIGV;
  if (sp <= 0) return;

  const productPct  = Math.max(0, result.totalProductCost   / sp * 100);
  const gatewayPct  = Math.max(0, result.gwCommEff          / sp * 100);
  const igvPct      = Math.max(0, result.igvInPrice         / sp * 100);
  const taxPct      = Math.max(0, result.taxPerUnit         / sp * 100);
  const reservePct  = Math.max(0, result.legalReservePerUnit/ sp * 100);
  const netPct      = Math.max(0, result.netProfit          / sp * 100);

  const labels = [
    'Costo producto',
    'Comisión pasarela',
    'IGV (impuesto)',
    'Impuesto a la renta',
    'Reserva legal',
    'Utilidad neta'
  ];
  const data = [productPct, gatewayPct, igvPct, taxPct, reservePct, netPct];
  const colors = [CHART_AMBER, CHART_CYAN, CHART_PURPLE, CHART_RED, 'rgba(255,255,255,0.3)', CHART_PRIMARY];

  MA_STATE.charts.costPie = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data:              data,
        backgroundColor:   colors.map(function(c) { return toRgba(c, 0.82); }),
        borderColor:       colors.map(function(c) { return toRgba(c, 1); }),
        borderWidth:       1.5,
        hoverBorderWidth:  3,
        hoverOffset:       8
      }]
    },
    options: {
      responsive:         true,
      maintainAspectRatio: false,
      cutout:             '62%',
      plugins: {
        legend: {
          display:   true,
          position:  'bottom',
          labels: {
            color:    'rgba(255,255,255,0.6)',
            font:     { size: 10 },
            padding:  10,
            usePointStyle: true,
            pointStyleWidth: 8
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0,0,0,0.88)',
          titleColor:      '#d1fae5',
          bodyColor:       'rgba(255,255,255,0.75)',
          borderColor:     'rgba(52,211,153,0.25)',
          borderWidth:     1,
          callbacks: {
            label: function(item) {
              const val = item.raw;
              const abs = (val / 100) * result.salePriceWithIGV;
              return ' ' + val.toFixed(1) + '% — ' + fmtPEN(abs);
            }
          }
        }
      }
    }
  });
}

/* ─────────────────────────────────────────────────────────────────
   15. jsPDF — REPORTE PDF CORPORATIVO
   ───────────────────────────────────────────────────────────────── */

function loadJsPDF() {
  return new Promise(function(resolve, reject) {
    if (window.jspdf || window.jsPDF) {
      resolve(window.jspdf || window.jsPDF);
      return;
    }
    if (MA_STATE.pdfLoading) {
      /* Esperar hasta que cargue */
      const check = setInterval(function() {
        if (window.jspdf || window.jsPDF) {
          clearInterval(check);
          resolve(window.jspdf || window.jsPDF);
        }
      }, 100);
      setTimeout(function() {
        clearInterval(check);
        reject(new Error('Timeout cargando jsPDF'));
      }, 15000);
      return;
    }
    MA_STATE.pdfLoading = true;
    const script = document.createElement('script');
    script.src   = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = function() {
      MA_STATE.pdfLoaded  = true;
      MA_STATE.pdfLoading = false;
      resolve(window.jspdf || window.jsPDF);
    };
    script.onerror = function() {
      MA_STATE.pdfLoading = false;
      reject(new Error('No se pudo cargar jsPDF'));
    };
    document.head.appendChild(script);
  });
}

async function generatePDFReport() {
  const result = MA_STATE.lastResult;
  if (!result) {
    showToast('Primero ingresa tus datos para generar el reporte.', '⚠️', 3000);
    return;
  }

  const btn = DOM.btnGeneratePDF();
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Generando PDF...'; }
  showToast('Preparando reporte PDF...', '📄', 2000);

  try {
    const jsPDFLib = await loadJsPDF();
    const jsPDF    = jsPDFLib.jsPDF || jsPDFLib;
    const doc      = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const PAGE_W = 210;
    const PAGE_H = 297;
    const MARGIN = 18;
    const COL_W  = PAGE_W - MARGIN * 2;
    let y        = 0;

    /* Función helper para nueva página */
    function checkPage(needed) {
      if (y + needed > PAGE_H - 20) {
        doc.addPage();
        y = 20;
        drawHeader();
      }
    }

    /* ── Header corporativo ── */
    function drawHeader() {
      /* Fondo header */
      doc.setFillColor(2, 26, 19);
      doc.rect(0, 0, PAGE_W, 28, 'F');
      /* Línea acento */
      doc.setFillColor(16, 185, 129);
      doc.rect(0, 28, PAGE_W, 1.2, 'F');
      /* Logo texto */
      doc.setTextColor(52, 211, 153);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('MARGINAXIS', MARGIN, 16);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(167, 243, 208);
      doc.text('INGENIERÍA DE RENTABILIDAD — PERÚ 2026', MARGIN, 22);
      /* Fecha */
      doc.setFontSize(7);
      doc.setTextColor(100, 180, 140);
      const now = new Date();
      doc.text(
        'Generado: ' + now.toLocaleDateString('es-PE') + ' ' + now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
        PAGE_W - MARGIN,
        22,
        { align: 'right' }
      );
      y = 36;
    }

    /* ── Función para sección con título ── */
    function sectionTitle(title, icon) {
      checkPage(16);
      doc.setFillColor(5, 61, 46);
      doc.roundedRect(MARGIN, y, COL_W, 10, 2, 2, 'F');
      doc.setTextColor(52, 211, 153);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text((icon || '▸') + ' ' + title, MARGIN + 4, y + 6.5);
      y += 14;
    }

    /* ── Función para fila de datos ── */
    function dataRow(label, value, valueColor, isBold) {
      checkPage(9);
      doc.setDrawColor(30, 70, 50);
      doc.setLineWidth(0.2);
      doc.line(MARGIN, y + 7, MARGIN + COL_W, y + 7);

      doc.setFontSize(9);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.setTextColor(180, 220, 200);
      doc.text(label, MARGIN + 3, y + 5);

      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      if (valueColor) {
        doc.setTextColor(valueColor[0], valueColor[1], valueColor[2]);
      } else {
        doc.setTextColor(240, 253, 244);
      }
      doc.text(String(value), PAGE_W - MARGIN - 3, y + 5, { align: 'right' });
      y += 8;
    }

    /* ── Semáforo visual ── */
    function drawSemaphore(sl) {
      checkPage(40);
      /* Círculo semáforo */
      let rgb = [16, 185, 129];
      if (sl.cssClass === 'critical') rgb = [239, 68, 68];
      else if (sl.cssClass === 'risk') rgb = [245, 158, 11];
      else if (sl.cssClass === 'moderate') rgb = [34, 211, 238];

      const cx = MARGIN + COL_W / 2;
      doc.setFillColor(rgb[0], rgb[1], rgb[2]);
      doc.circle(cx, y + 15, 18, 'F');

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(sl.label, cx, y + 13, { align: 'center' });

      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(result.netMarginPct.toFixed(1) + '%', cx, y + 22, { align: 'center' });

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(rgb[0], rgb[1], rgb[2]);
      doc.text(sl.message, MARGIN, y + 36, { maxWidth: COL_W });
      y += 44;
    }

    /* ═══════════════════════════
       INICIO DEL PDF
       ═══════════════════════════ */

    /* Fondo oscuro de página */
    doc.setFillColor(2, 15, 11);
    doc.rect(0, 0, PAGE_W, PAGE_H, 'F');

    drawHeader();

    /* ── SEMÁFORO ── */
    sectionTitle('Viabilidad del Negocio', '🚦');
    drawSemaphore(result.semLevel);

    /* ── RESULTADO PRINCIPAL ── */
    sectionTitle('Resultado Principal', '💰');
    dataRow('Precio de Venta (con IGV)',  fmtPEN(result.salePriceWithIGV), null, false);
    dataRow('Precio sin IGV',            fmtPEN(result.saleNoIGV), null, false);
    dataRow('Costo Total Producto',      fmtPEN(result.totalProductCost), [248, 113, 113], false);
    dataRow('Comisión Pasarela (' + (result.gateway ? result.gateway.shortName : '—') + ')', fmtPEN(result.gwCommEff), [248, 113, 113], false);
    dataRow('Impuesto a la Renta (' + result.taxMethod + ')', fmtPEN(result.taxPerUnit), [248, 113, 113], false);
    if (result.legalReservePerUnit > 0) {
      dataRow('Reserva Legal (10%)', fmtPEN(result.legalReservePerUnit), [248, 113, 113], false);
    }
    dataRow('UTILIDAD NETA POR UNIDAD',  fmtPEN(result.netProfit), result.netProfit >= 0 ? [52, 211, 153] : [248, 113, 113], true);
    dataRow('Margen Neto %',             fmtPct(result.netMarginPct), result.netProfit >= 0 ? [52, 211, 153] : [248, 113, 113], true);
    dataRow('ROI',                       fmtPct(result.roi), null, false);
    y += 4;

    /* ── PROYECCIONES MENSUALES ── */
    sectionTitle('Proyecciones Mensuales', '📈');
    dataRow('Unidades vendidas / mes',   fmtNum(result.monthlyUnits), null, false);
    dataRow('Ingresos brutos mensuales', fmtPEN(result.monthlyGrossRevenue), null, false);
    dataRow('Costos fijos mensuales',    fmtPEN(result.fixedCosts), [248, 113, 113], false);
    dataRow('Utilidad neta mensual',     fmtPEN(result.monthlyNetProfit), result.monthlyNetProfit >= 0 ? [52, 211, 153] : [248, 113, 113], true);
    y += 4;

    /* ── PUNTO DE EQUILIBRIO ── */
    sectionTitle('Análisis de Punto de Equilibrio', '⚖️');
    dataRow('Punto de equilibrio',       fmtNum(result.beUnits) + ' unidades/mes', null, false);
    dataRow('Días para equilibrio',      result.beDays !== null ? fmtNum(result.beDays) + ' días' : '∞', null, false);
    dataRow('Margen de seguridad',       fmtPct(result.safetyMarginPct), result.safetyMarginPct >= 30 ? [52, 211, 153] : result.safetyMarginPct >= 15 ? [251, 191, 36] : [248, 113, 113], false);
    y += 4;

    /* ── CONFIGURACIÓN FISCAL ── */
    sectionTitle('Configuración Fiscal', '🏛️');
    const regimeData = MA_DATA.regimes[result.regime];
    dataRow('Régimen tributario', regimeData ? regimeData.name : result.regime, null, false);
    dataRow('UIT 2026', fmtPEN(MA_DATA.UIT), null, false);
    dataRow('Pasarela de pago', result.gateway ? result.gateway.name : '—', null, false);
    if (result.detractionCalc && result.detractionCalc.applies) {
      dataRow('Detracción aplicable', result.detractionCalc.rateDisplay + ' (' + fmtPEN(result.detractionCalc.amount) + ')', [251, 191, 36], false);
    }
    y += 4;

    /* ── TIPO DE CAMBIO ── */
    if (result._inputs.purchaseCurrency !== 'PEN') {
      checkPage(30);
      sectionTitle('Tipo de Cambio', '💱');
      const penRate = MA_STATE.forexRatesPEN[result._inputs.purchaseCurrency] || 0;
      dataRow('Moneda de compra', result._inputs.purchaseCurrency, null, false);
      dataRow('TC referencial vs PEN', penRate.toFixed(4) + ' PEN', null, false);
      dataRow('Spread bancario', result._inputs.spreadPct + '%', null, false);
      dataRow('Costo compra en PEN', fmtPEN(result.purchaseCostPEN), null, false);
      y += 4;
    }

    /* ── DISCLAIMER ── */
    checkPage(25);
    doc.setFillColor(5, 30, 20);
    doc.roundedRect(MARGIN, y, COL_W, 20, 2, 2, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 160, 130);
    const disclaimer = 'AVISO LEGAL: Los cálculos presentados en este reporte son referenciales y no constituyen ' +
      'asesoría tributaria, contable ni legal. Consulte siempre con un Contador Público Colegiado ' +
      '(CPC) para decisiones fiscales. Datos basados en normativa SUNAT proyectada 2026 y UIT S/ 5,150.';
    doc.text(disclaimer, MARGIN + 4, y + 6, { maxWidth: COL_W - 8 });
    y += 24;

    /* ── Footer de página ── */
    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFillColor(2, 15, 11);
      doc.rect(0, PAGE_H - 10, PAGE_W, 10, 'F');
      doc.setFontSize(7);
      doc.setTextColor(60, 120, 90);
      doc.text('© MarginAxis Perú 2026 · marginaxis.pe · Página ' + p + ' de ' + totalPages, PAGE_W / 2, PAGE_H - 4, { align: 'center' });
    }

    /* ── Guardar ── */
    const filename = 'MarginAxis-Reporte-' +
      new Date().toLocaleDateString('es-PE').replace(/\//g, '-') + '.pdf';
    doc.save(filename);
    showToast('¡Reporte PDF descargado!', '📄', 3500);

  } catch (err) {
    console.error('Error generando PDF:', err);
    showToast('Error al generar el PDF: ' + err.message, '❌', 5000);
  } finally {
    if (btn) {
      btn.disabled     = false;
      btn.innerHTML    = '<span>📄</span> Descargar Reporte PDF Corporativo';
    }
  }
}

/* ─────────────────────────────────────────────────────────────────
   16. CALENDARIO RUC
   ───────────────────────────────────────────────────────────────── */

function updateRUCCalendar() {
  const digit     = parseI('in-ruc-digit');
  const container = DOM.rucCalendarContainer();
  if (!container) return;

  const schedule  = MA_DATA.rucCalendar.getSchedule(clamp(digit, 0, 9));
  if (!schedule)  { container.innerHTML = '<p class="ma-placeholder-text">Dígito inválido.</p>'; return; }

  const now       = new Date();
  let html = '<div class="ma-ruc-calendar-grid">';

  schedule.forEach(function(m) {
    const isCurrent = (now.getMonth() === m.monthIndex && now.getFullYear() === 2026) || (now.getMonth() === m.monthIndex && now.getFullYear() === 2025 && m.monthIndex === 11);
    const isPast    = m.dueDate < now && now.getFullYear() >= 2026;
    let cellClass   = 'ma-ruc-month-cell';
    if (isCurrent) cellClass += ' ma-ruc-month-cell--current';
    let dayStyle    = 'color:var(--ma-emerald-400)';
    if (isPast)     dayStyle  = 'color:rgba(255,255,255,0.25)';
    if (isCurrent)  dayStyle  = 'color:#34d399;font-weight:900';

    html += '<div class="' + cellClass + '" title="Vence: ' + m.fullLabel + '">';
    html += '<span class="ma-ruc-month-name">' + m.monthShort + '</span>';
    html += '<span class="ma-ruc-month-day" style="' + dayStyle + '">' + m.day + '</span>';
    html += '</div>';
  });

  html += '</div>';

  /* Próximos vencimientos */
  const upcoming = MA_DATA.rucCalendar.getUpcoming(clamp(digit, 0, 9), 3);
  if (upcoming.length > 0) {
    html += '<div style="margin-top:12px;font-size:0.72rem;color:var(--ma-text-muted);">';
    html += '<div style="font-weight:700;color:var(--ma-emerald-400);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.06em;">Próximos vencimientos</div>';
    upcoming.forEach(function(u) {
      html += '<div style="display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px solid rgba(255,255,255,0.04);">';
      html += '<span>' + u.monthName + ' 2026</span>';
      html += '<span style="font-family:var(--ma-font-mono);font-weight:700;color:var(--ma-text-primary);">' + u.day + ' ' + u.monthShort + '</span>';
      html += '</div>';
    });
    html += '</div>';
  }

  container.innerHTML = html;
}

/* ─────────────────────────────────────────────────────────────────
   17. COPIAR RESUMEN AL PORTAPAPELES
   ───────────────────────────────────────────────────────────────── */

function copySummaryToClipboard() {
  const result = MA_STATE.lastResult;
  if (!result) { showToast('Sin datos para copiar. Ingresa tus valores primero.', '⚠️', 3000); return; }

  const lines = [
    '📐 MARGINAXIS PERÚ 2026 — RESUMEN DE RENTABILIDAD',
    '═══════════════════════════════════════════',
    '📅 Generado: ' + new Date().toLocaleString('es-PE'),
    '',
    '💰 RESULTADO POR UNIDAD',
    '  Precio de venta:      ' + fmtPEN(result.salePriceWithIGV),
    '  Costo total producto: ' + fmtPEN(result.totalProductCost),
    '  Comisión pasarela:    ' + fmtPEN(result.gwCommEff),
    '  Impuesto a la renta:  ' + fmtPEN(result.taxPerUnit),
    '  ─────────────────────────────',
    '  UTILIDAD NETA:        ' + fmtPEN(result.netProfit),
    '  MARGEN NETO:          ' + fmtPct(result.netMarginPct),
    '  ROI:                  ' + fmtPct(result.roi),
    '',
    '📈 PROYECCIÓN MENSUAL (' + fmtNum(result.monthlyUnits) + ' uds)',
    '  Ingresos brutos:      ' + fmtPEN(result.monthlyGrossRevenue),
    '  Utilidad neta:        ' + fmtPEN(result.monthlyNetProfit),
    '  Costos fijos:         ' + fmtPEN(result.fixedCosts),
    '',
    '⚖️ PUNTO DE EQUILIBRIO',
    '  Unidades necesarias:  ' + fmtNum(result.beUnits) + ' uds/mes',
    '  Margen de seguridad:  ' + fmtPct(result.safetyMarginPct),
    '',
    '🏛️ CONFIGURACIÓN FISCAL',
    '  Régimen:              ' + (MA_DATA.regimes[result.regime] ? MA_DATA.regimes[result.regime].name : result.regime),
    '  Pasarela:             ' + (result.gateway ? result.gateway.name : '—'),
    '  UIT 2026:             S/ 5,150',
    '',
    '═══════════════════════════════════════════',
    '⚠️ Cálculo referencial. Consulte con su contador CPC.',
    'Herramienta: MarginAxis Perú 2026 — marginaxis.pe'
  ];

  const text = lines.join('\n');

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text)
      .then(function() { showToast('Resumen copiado al portapapeles', '📋', 3000); })
      .catch(function() { fallbackCopy(text); });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand('copy');
    showToast('Resumen copiado', '📋', 3000);
  } catch(e) {
    showToast('No se pudo copiar. Usa Ctrl+A y Ctrl+C manualmente.', '⚠️', 4000);
  }
  document.body.removeChild(ta);
}

/* ─────────────────────────────────────────────────────────────────
   18. RECOLECTAR INPUTS
   ───────────────────────────────────────────────────────────────── */

function collectInputs() {
  return {
    purchaseCurrency: selectVal('sel-purchase-currency') || 'PEN',
    spreadPct:        parseF('in-spread'),
    purchaseCost:     parseF('in-purchase-cost'),
    logistics:        parseF('in-logistics'),
    packaging:        parseF('in-packaging'),
    shrinkagePct:     parseF('in-shrinkage'),
    isImported:       checkVal('chk-imported'),
    perceptionType:   selectVal('sel-perception-type') || '3.5',
    salePrice:        parseF('in-sale-price'),
    desiredProfit:    parseF('in-desired-profit'),
    gateway:          selectVal('sel-gateway') || 'niubiz',
    regime:           selectVal('sel-regime') || 'mype',
    detractionType:   selectVal('sel-detraction') || 'no_aplica',
    monthlyUnits:     Math.max(1, parseI('in-monthly-units')),
    fixedCosts:       parseF('in-fixed-costs')
  };
}

/* ─────────────────────────────────────────────────────────────────
   19. CICLO PRINCIPAL DE CÁLCULO
   ───────────────────────────────────────────────────────────────── */

function runCalculation() {
  const inputs = collectInputs();

  /* Actualizar la moneda tag del precio de compra */
  const currTag = DOM.purchaseCurrencyTag();
  if (currTag) {
    const cData = MA_DATA.forex.currencies.find(function(c) { return c.code === inputs.purchaseCurrency; });
    currTag.textContent = cData ? cData.symbol : inputs.purchaseCurrency;
  }

  /* Actualizar visibilidad de percepción */
  const grpPerc = DOM.grpPerception();
  if (grpPerc) grpPerc.style.display = inputs.isImported ? '' : 'none';

  /* Actualizar info de régimen */
  updateRegimeInfo(inputs.regime);

  /* ── MODO INVERSO ── */
  if (MA_STATE.mode === 'reverse') {
    const reverseResult = calculateReverse(inputs);
    updateReverseResult(reverseResult);

    if (!reverseResult.error) {
      /* Correr forward con el precio calculado para mostrar desglose */
      const verifyInputs = Object.assign({}, inputs, { salePrice: reverseResult.priceWithIGV });
      const verifyResult = calculateForward(verifyInputs);
      verifyResult._inputs = verifyInputs;
      MA_STATE.lastResult = verifyResult;

      updateCostSummary(verifyResult);
      updateHeroResult(verifyResult);
      updateRatios(verifyResult);
      updateBreakdown(verifyResult);
      updateGatewayInfo(verifyResult);

      const taxOpt  = runTaxOptimizer(verifyInputs);
      const gwBattle = runGatewayBattle(verifyInputs);
      const recs     = generateRecommendations(verifyResult, taxOpt, gwBattle);

      updateTaxOptimizer(taxOpt, inputs.regime);
      updateGatewayBattle(gwBattle, inputs.salePrice);
      updateRecommendations(recs);
      updateSensitivity(verifyResult);
      initBreakevenChart(verifyResult);
      initCostPieChart(verifyResult);
    }
    return;
  }

  /* ── MODO FORWARD ── */
  const result    = calculateForward(inputs);
  result._inputs  = inputs;
  MA_STATE.lastResult = result;

  /* Actualizar price breakdown */
  updatePriceBreakdown(result);

  /* Actualizar costo summary */
  updateCostSummary(result);

  /* Actualizar hero */
  updateHeroResult(result);

  /* Actualizar ratios */
  updateRatios(result);

  /* Desglose detallado */
  updateBreakdown(result);

  /* Info de pasarela */
  updateGatewayInfo(result);

  /* Tax Optimizer */
  const taxOpt = runTaxOptimizer(inputs);
  updateTaxOptimizer(taxOpt, inputs.regime);

  /* Gateway Battle */
  const gwBattle = runGatewayBattle(inputs);
  updateGatewayBattle(gwBattle, inputs.salePrice);

  /* Recomendaciones */
  const recs = generateRecommendations(result, taxOpt, gwBattle);
  updateRecommendations(recs);

  /* Sensibilidad */
  updateSensitivity(result);

  /* Gráficos */
  initBreakevenChart(result);
  initCostPieChart(result);
}

function triggerCalculation() {
  if (MA_STATE.calcDebounce) clearTimeout(MA_STATE.calcDebounce);
  MA_STATE.calcDebounce = setTimeout(runCalculation, DEBOUNCE_MS);
}

function triggerImmediately() {
  if (MA_STATE.calcDebounce) clearTimeout(MA_STATE.calcDebounce);
  runCalculation();
}

/* ─────────────────────────────────────────────────────────────────
   20. RESET DE VALORES
   ───────────────────────────────────────────────────────────────── */

function resetAllValues() {
  const d = MA_DATA.defaults;
  const setVal = function(id, val) {
    const el = getEl(id);
    if (el) el.value = val;
  };
  const setCheck = function(id, val) {
    const el = getEl(id);
    if (el) el.checked = val;
  };

  setVal('sel-purchase-currency', d.purchaseCurrency);
  setVal('in-spread',             d.spreadPct);
  setVal('in-purchase-cost',      d.purchaseCost);
  setVal('in-logistics',          d.logistics);
  setVal('in-packaging',          d.packaging);
  setVal('in-shrinkage',          d.shrinkagePct);
  setCheck('chk-imported',        d.isImported);
  setVal('sel-perception-type',   d.perceptionType);
  setVal('in-sale-price',         d.salePrice);
  setVal('in-desired-profit',     d.desiredProfit);
  setVal('sel-gateway',           d.gateway);
  setVal('sel-regime',            d.regime);
  setVal('sel-detraction',        d.detractionType);
  setVal('in-monthly-units',      d.monthlyUnits);
  setVal('in-fixed-costs',        d.fixedCosts);
  setVal('slider-fx-variation',   d.fxVariation);
  setVal('slider-commission-variation', d.commVariation);

  setMode('forward');
  triggerImmediately();
  showToast('Valores restablecidos', '🔄', 2500);
}

/* ─────────────────────────────────────────────────────────────────
   21. NAVEGACIÓN MÓVIL
   ───────────────────────────────────────────────────────────────── */

function initMobileNav() {
  const tabs = DOM.mobTabs();
  if (!tabs) return;

  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      tabs.forEach(function(t) {
        t.classList.remove('ma-mob-tab--active');
        t.removeAttribute('aria-current');
      });
      tab.classList.add('ma-mob-tab--active');
      tab.setAttribute('aria-current', 'page');

      const section = tab.getAttribute('data-section');
      if (section) {
        const el = getEl(section);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });
}

/* ─────────────────────────────────────────────────────────────────
   22. ANIMACIONES DE SCROLL
   ───────────────────────────────────────────────────────────────── */

function initScrollAnimations() {
  const elements = document.querySelectorAll('.ma-scroll-anim, .bento-card');
  if (!elements.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('ma-in-view');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold:   0.05,
      rootMargin:  '0px 0px -40px 0px'
    });

    elements.forEach(function(el, idx) {
      el.classList.add('ma-scroll-anim');
      el.style.transitionDelay = Math.min(idx * 40, 400) + 'ms';
      observer.observe(el);
    });
  } else {
    /* Fallback: mostrar todo */
    elements.forEach(function(el) {
      el.classList.add('ma-in-view');
    });
  }
}

/* ─────────────────────────────────────────────────────────────────
   23. LISTENERS DE EVENTOS
   ───────────────────────────────────────────────────────────────── */

function bindEvents() {

  /* ── Todos los inputs de cálculo ── */
  document.querySelectorAll('.ma-calc-trigger').forEach(function(el) {
    const event = (el.tagName === 'INPUT' && el.type !== 'checkbox' && el.type !== 'range')
      ? 'input'
      : 'change';
    el.addEventListener(event, triggerCalculation);
  });

  /* Sliders: actualizar display en tiempo real */
  const sliderFX   = getEl('slider-fx-variation');
  const sliderComm = getEl('slider-commission-variation');
  if (sliderFX) {
    sliderFX.addEventListener('input', function() {
      const v = parseFloat(this.value);
      safeSet('slider-fx-display', (v >= 0 ? '+' : '') + v + '%');
      this.setAttribute('aria-valuenow', v);
      updateSensitivity(MA_STATE.lastResult);
    });
  }
  if (sliderComm) {
    sliderComm.addEventListener('input', function() {
      const v = parseFloat(this.value);
      safeSet('slider-comm-display', (v >= 0 ? '+' : '') + v.toFixed(1) + '%');
      this.setAttribute('aria-valuenow', v);
      updateSensitivity(MA_STATE.lastResult);
    });
  }

  /* ── Importado checkbox ── */
  const chkImported = getEl('chk-imported');
  if (chkImported) {
    chkImported.addEventListener('change', function() {
      const grp = getEl('grp-perception');
      if (grp) grp.style.display = this.checked ? '' : 'none';
    });
  }

  /* ── Mode Switch ── */
  const btnF = DOM.btnForward();
  const btnR = DOM.btnReverse();
  if (btnF) btnF.addEventListener('click', function() { setMode('forward'); });
  if (btnR) btnR.addEventListener('click', function() { setMode('reverse'); });

  /* ── RUC Calendar ── */
  const rucInput = getEl('in-ruc-digit');
  if (rucInput) {
    rucInput.addEventListener('input', function() {
      let v = parseInt(this.value, 10);
      if (isNaN(v) || this.value === '') { updateRUCCalendar(); return; }
      if (v < 0) { this.value = 0; v = 0; }
      if (v > 9) { this.value = 9; v = 9; }
      updateRUCCalendar();
    });
  }

  /* ── Forex refresh ── */
  const btnFX = DOM.btnForexRefresh();
  if (btnFX) {
    btnFX.addEventListener('click', function() {
      fetchForexRates();
    });
  }

  /* ── Convertidor ── */
  const btnConv = DOM.btnConvert();
  if (btnConv) btnConv.addEventListener('click', convertCurrency);

  const convInputs = ['conv-amount', 'conv-from', 'conv-to'];
  convInputs.forEach(function(id) {
    const el = getEl(id);
    if (el) el.addEventListener('change', convertCurrency);
  });
  const convAmt = getEl('conv-amount');
  if (convAmt) convAmt.addEventListener('input', convertCurrency);

  /* ── Botones de acción ── */
  const btnPDF = DOM.btnGeneratePDF();
  if (btnPDF) btnPDF.addEventListener('click', generatePDFReport);

  const btnCopy = DOM.btnCopySummary();
  if (btnCopy) btnCopy.addEventListener('click', copySummaryToClipboard);

  const btnReset = DOM.btnReset();
  if (btnReset) btnReset.addEventListener('click', function() {
    if (confirm('¿Restablecer todos los valores a sus valores predeterminados?')) {
      resetAllValues();
    }
  });

  /* ── Navegación suave desde header ── */
  document.querySelectorAll('.ma-nav-link[href^="#"]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').slice(1);
      const targetEl = getEl(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ── Tecla Enter en campos numéricos ── */
  document.querySelectorAll('.ma-input').forEach(function(input) {
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        triggerImmediately();
      }
    });
  });

  /* ── Redimensionamiento de ventana: actualizar gráficos ── */
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      if (MA_STATE.lastResult) {
        initBreakevenChart(MA_STATE.lastResult);
        initCostPieChart(MA_STATE.lastResult);
      }
    }, 400);
  });

  /* ── Visibilidad de página: recargar forex si ha pasado > 1h ── */
  document.addEventListener('visibilitychange', function() {
    if (!document.hidden && MA_STATE.forexSource === 'live') {
      try {
        const lastFetch = parseInt(sessionStorage.getItem('ma_forex_ts') || '0', 10);
        if (Date.now() - lastFetch > 3600000) {
          fetchForexRates();
        }
      } catch (e) {
        /* sessionStorage no disponible (modo privado o restricciones de origen) */
        fetchForexRates();
      }
    }
  });
}

/* ─────────────────────────────────────────────────────────────────
   24. INICIALIZACIÓN PRINCIPAL
   ───────────────────────────────────────────────────────────────── */

function init() {

  /* Verificar dependencias */
  if (typeof MA_DATA === 'undefined') {
    console.error('MarginAxis: data.js no cargado correctamente.');
    return;
  }

  /* Bindear eventos */
  bindEvents();

  /* Inicializar navegación móvil */
  initMobileNav();

  /* Cargar tipos de cambio (async, no bloquea la UI) */
  useFallbackRates(); /* Mostrar rates de referencia inmediatamente */
  fetchForexRates().then(function() {
    try { sessionStorage.setItem('ma_forex_ts', Date.now().toString()); } catch (e) { /* ignorar */ }
  }).catch(function() { /* ya manejado en fetchForexRates */ });

  /* Inicializar calendario RUC con el valor por defecto */
  updateRUCCalendar();

  /* Ejecutar cálculo inicial */
  triggerImmediately();

  /* Animaciones de scroll (con delay para permitir renderizado) */
  setTimeout(initScrollAnimations, 400);

  /* Convertidor: calcular con valores iniciales */
  setTimeout(convertCurrency, 1500);

  /* Actualizar forex automáticamente cada hora */
  setInterval(function() {
    fetchForexRates();
  }, MA_DATA.forex.updateInterval);

  /* Marcar como inicializado */
  console.info(
    '%c📐 MarginAxis Perú 2026 %cv' + MA_DATA.meta.version + '%c iniciado. UIT: S/ ' + MA_DATA.UIT,
    'color:#34d399;font-weight:900;font-size:14px;',
    'color:#22d3ee;font-weight:700;',
    'color:rgba(255,255,255,0.6);'
  );
}

/* ─────────────────────────────────────────────────────────────────
   PUNTO DE ENTRADA
   ───────────────────────────────────────────────────────────────── */

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  /* DOM ya cargado */
  init();
}
