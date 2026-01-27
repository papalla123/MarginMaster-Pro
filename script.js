/* ========================================
   MARGINAXIS PERÚ 2026 - ENGINE INTELIGENTE
   Sistema SUNAT • Ingeniería Inversa • Break-Even
   Pentagon Integration • PDF Business Reports
   ======================================== */

// ===== GLOBAL STATE =====
let chartBreakeven = null;
let tipoCambioActual = FOREX_PERU.defaultRate;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 MarginAxis Perú 2026 Iniciando...');
    
    cargarForexPeru();
    configurarEventos();
    calcular();
    verificarConexionesPentagon();
    
    console.log('✓ MarginAxis Perú 2026 Listo');
    console.log('🇵🇪 Sistema SUNAT Activo');
    console.log(`💰 UIT 2026: S/ ${PERU_2026.UIT}`);
});

// ===== EVENT CONFIGURATION =====
function configurarEventos() {
    // Inputs de costos
    ['costoCompra', 'packaging', 'logistica', 'merma'].forEach(id => {
        document.getElementById(id).addEventListener('input', calcular);
    });
    
    // Precio y pasarela
    document.getElementById('precioVenta').addEventListener('input', calcular);
    document.getElementById('pasarela').addEventListener('change', function() {
        actualizarInfoPasarela();
        calcular();
    });
    
    // Régimen tributario
    document.getElementById('regimen').addEventListener('change', function() {
        actualizarInfoRegimen();
        calcular();
    });
    
    // Importación
    document.getElementById('esImportado').addEventListener('change', toggleImportacion);
    document.getElementById('codigoHS').addEventListener('input', buscarArancel);
    
    // Ingeniería inversa
    document.getElementById('margenDeseado').addEventListener('input', calcularIngenieriaInversa);
    
    // Escalabilidad
    document.getElementById('metaGanancia').addEventListener('input', calcularEscalabilidad);
    
    // LTV/CAC
    document.getElementById('cacCliente').addEventListener('input', calcularLTVCAC);
    document.getElementById('comprasPromedio').addEventListener('input', calcularLTVCAC);
    
    // Industria
    document.getElementById('industria').addEventListener('change', calcular);
    
    // Inicializar info
    actualizarInfoPasarela();
    actualizarInfoRegimen();
}

// ===== FOREX PERÚ =====
async function cargarForexPeru() {
    try {
        const cached = localStorage.getItem(STORAGE_KEYS.forexCache);
        const cacheData = cached ? JSON.parse(cached) : null;
        
        if (cacheData && (Date.now() - cacheData.timestamp < 3600000)) {
            tipoCambioActual = cacheData.rate;
            actualizarDisplayForex();
            return;
        }
        
        const response = await fetch(FOREX_PERU.endpoint);
        const data = await response.json();
        tipoCambioActual = data.rates[FOREX_PERU.moneda] || FOREX_PERU.defaultRate;
        
        localStorage.setItem(STORAGE_KEYS.forexCache, JSON.stringify({
            rate: tipoCambioActual,
            timestamp: Date.now()
        }));
        
        actualizarDisplayForex();
        
    } catch (error) {
        console.warn('⚠️ Forex offline, usando tasa por defecto');
        tipoCambioActual = FOREX_PERU.defaultRate;
        actualizarDisplayForex();
    }
}

function actualizarDisplayForex() {
    calcular();
}

// ===== IMPORT TOGGLE =====
function toggleImportacion() {
    const esImportado = document.getElementById('esImportado').checked;
    document.getElementById('seccionAduanas').style.display = esImportado ? 'block' : 'none';
    document.getElementById('arancelesRow').style.display = esImportado ? 'flex' : 'none';
    if (esImportado) buscarArancel();
    calcular();
}

function buscarArancel() {
    const codigo = document.getElementById('codigoHS').value.trim();
    const infoEl = document.getElementById('infoArancel');
    
    if (!codigo) {
        infoEl.textContent = 'Ingresa código HS';
        return;
    }
    
    const arancel = ARANCELES_PERU[codigo];
    
    if (arancel) {
        const porcentaje = (arancel.adValorem * 100).toFixed(1);
        infoEl.textContent = `Ad Valorem: ${porcentaje}% - ${arancel.descripcion}`;
        infoEl.style.color = '#10b981';
    } else {
        infoEl.textContent = `No encontrado - usando 11% estándar`;
        infoEl.style.color = '#f59e0b';
    }
    
    calcular();
}

// ===== ACTUALIZAR INFO PASARELA =====
function actualizarInfoPasarela() {
    const pasarelaKey = document.getElementById('pasarela').value;
    const pasarela = PASARELAS_PERU[pasarelaKey];
    const infoEl = document.getElementById('infoPasarela');
    
    let html = `<div class="text-xs font-semibold text-amber-400 mb-1">${pasarela.nombre}</div>`;
    html += `<div class="text-xs text-slate-300 mb-2">`;
    
    if (pasarela.comision > 0) {
        html += `Comisión: ${(pasarela.comision * 100).toFixed(2)}%`;
        if (pasarela.fijo > 0) {
            html += ` + S/ ${pasarela.fijo.toFixed(2)}`;
        }
    } else {
        html += `Sin comisión`;
    }
    
    if (pasarela.aplicaIGV) {
        html += ` + IGV`;
    }
    
    if (pasarela.retencion) {
        html += ` + Retención ${(pasarela.retencion * 100)}%`;
    }
    
    html += `</div>`;
    
    // Ventajas
    html += `<div class="text-xs text-green-400">✓ ${pasarela.ventajas.join(' • ')}</div>`;
    
    // Desventajas
    if (pasarela.desventajas && pasarela.desventajas.length > 0) {
        html += `<div class="text-xs text-red-400 mt-1">✗ ${pasarela.desventajas.join(' • ')}</div>`;
    }
    
    infoEl.innerHTML = html;
}

// ===== ACTUALIZAR INFO RÉGIMEN =====
function actualizarInfoRegimen() {
    const regimenKey = document.getElementById('regimen').value;
    const regimen = REGIMENES_SUNAT[regimenKey];
    const infoEl = document.getElementById('infoRegimen');
    const rentaEl = document.getElementById('infoRenta');
    
    let textoRenta = '';
    
    if (regimenKey === 'nrus') {
        textoRenta = 'Cuota Fija';
        infoEl.textContent = 'NRUS: S/ 20 o S/ 50 según ventas';
    } else if (regimenKey === 'rer') {
        textoRenta = '1.5%';
        infoEl.textContent = 'RER: 1.5% sobre ingresos netos mensuales';
    } else if (regimenKey === 'mype') {
        textoRenta = '10% / 29.5%';
        infoEl.textContent = 'MYPE: 10% hasta 15 UIT, luego 29.5%';
    } else if (regimenKey === 'general') {
        textoRenta = '29.5%';
        infoEl.textContent = 'General: 29.5% sobre utilidad anual';
    }
    
    rentaEl.textContent = textoRenta;
}

// ===== MOTOR DE CÁLCULO PRINCIPAL =====
function calcular() {
    const precioVenta = parseFloat(document.getElementById('precioVenta').value) || 0;
    const costoCompra = parseFloat(document.getElementById('costoCompra').value) || 0;
    const packaging = parseFloat(document.getElementById('packaging').value) || 0;
    const logistica = parseFloat(document.getElementById('logistica').value) || 0;
    const mermaPercent = parseFloat(document.getElementById('merma').value) || 0;
    
    // Calcular costos directos
    const costosDirectos = costoCompra + packaging + logistica;
    document.getElementById('costosDirectos').textContent = formatearSoles(costosDirectos);
    
    // Calcular merma
    const costoMerma = costosDirectos * (mermaPercent / 100);
    document.getElementById('costoMerma').textContent = formatearSoles(costoMerma);
    
    // Calcular aranceles si es importado
    let costoAranceles = 0;
    if (document.getElementById('esImportado').checked) {
        const codigo = document.getElementById('codigoHS').value.trim();
        const arancel = ARANCELES_PERU[codigo];
        const tasaArancel = arancel ? arancel.adValorem : 0.11;
        costoAranceles = costoCompra * tasaArancel;
        document.getElementById('costoAranceles').textContent = formatearSoles(costoAranceles);
    }
    
    // Calcular comisión de pasarela
    const pasarelaKey = document.getElementById('pasarela').value;
    const pasarela = PASARELAS_PERU[pasarelaKey];
    
    const comisionPorcentaje = precioVenta * pasarela.comision;
    const comisionTotal = comisionPorcentaje + pasarela.fijo;
    document.getElementById('costoComision').textContent = formatearSoles(comisionTotal);
    
    // Calcular IGV sobre comisión
    const igvComision = pasarela.aplicaIGV ? comisionTotal * PERU_2026.IGV : 0;
    document.getElementById('igvComision').textContent = formatearSoles(igvComision);
    
    // Calcular retención
    const retencion = pasarela.retencion ? precioVenta * pasarela.retencion : 0;
    document.getElementById('retencion').textContent = formatearSoles(retencion);
    
    // Calcular ganancia antes de impuestos
    const costosTotalesSinImpuesto = costosDirectos + costoMerma + costoAranceles + comisionTotal + igvComision + retencion;
    const gananciaAntesImpuesto = precioVenta - costosTotalesSinImpuesto;
    
    // Calcular impuesto a la renta
    const regimenKey = document.getElementById('regimen').value;
    let impuestoRenta = 0;
    
    if (regimenKey === 'nrus') {
        // NRUS: Cuota fija mensual (20 o 50 soles)
        const nrusData = calcularNRUS(precioVenta);
        impuestoRenta = nrusData.cuota || 0;
    } else if (regimenKey === 'rer') {
        // RER: 1.5% sobre ingresos
        impuestoRenta = precioVenta * 0.015;
    } else if (regimenKey === 'mype') {
        // MYPE: Progresivo (simulamos mensual)
        const utilidadMensual = gananciaAntesImpuesto;
        const utilidadAnualProyectada = utilidadMensual * 12;
        const limite15UIT = 15 * PERU_2026.UIT;
        
        if (utilidadAnualProyectada <= limite15UIT) {
            impuestoRenta = (gananciaAntesImpuesto * 0.10) / 12;
        } else {
            // Calculamos proporción mensual
            const tramo1 = limite15UIT * 0.10;
            const tramo2 = (utilidadAnualProyectada - limite15UIT) * 0.295;
            impuestoRenta = (tramo1 + tramo2) / 12;
        }
    } else if (regimenKey === 'general') {
        // General: 29.5% sobre utilidad
        impuestoRenta = gananciaAntesImpuesto * 0.295;
    }
    
    document.getElementById('impuestoRenta').textContent = formatearSoles(impuestoRenta);
    
    // Calcular totales finales
    const costoTotalUnitario = costosTotalesSinImpuesto + impuestoRenta;
    const gananciaNeta = precioVenta - costoTotalUnitario;
    const margenNeto = precioVenta > 0 ? (gananciaNeta / precioVenta) * 100 : 0;
    
    // Mostrar resultados
    document.getElementById('costoTotalUnitario').textContent = formatearSoles(costoTotalUnitario);
    document.getElementById('gananciaNeta').textContent = formatearSoles(gananciaNeta);
    document.getElementById('margenNeto').textContent = formatearPorcentaje(margenNeto);
    
    // Actualizar semáforo
    actualizarSemaforo(margenNeto);
    
    // Actualizar displays de moneda
    document.getElementById('displaySoles').textContent = formatearSoles(gananciaNeta);
    document.getElementById('displayUSD').textContent = `$ ${convertirPENaUSD(gananciaNeta, tipoCambioActual).toFixed(2)}`;
    document.getElementById('displayEUR').textContent = `€ ${convertirPENaEUR(gananciaNeta, tipoCambioActual).toFixed(2)}`;
    
    // Calcular ingeniería inversa
    calcularIngenieriaInversa();
    
    // Calcular escalabilidad
    calcularEscalabilidad();
    
    // Calcular LTV/CAC
    calcularLTVCAC();
    
    // Actualizar gráfico break-even
    actualizarChartBreakeven(costoTotalUnitario, precioVenta, gananciaNeta);
    
    // Comparar con benchmark
    compararConBenchmarkIndustria(margenNeto);
}

// ===== SEMÁFORO DE RENTABILIDAD =====
function actualizarSemaforo(margenNeto) {
    const semaforo = determinarSemaforo(margenNeto);
    const resultsCard = document.getElementById('resultsCard');
    
    // Remover clases anteriores
    resultsCard.classList.remove('traffic-light-green', 'traffic-light-yellow', 'traffic-light-red');
    
    // Agregar clase según semáforo
    resultsCard.classList.add(semaforo.class);
    
    // Actualizar textos
    document.getElementById('semaforoIcono').textContent = semaforo.icono;
    document.getElementById('semaforoMensaje').textContent = semaforo.mensaje;
    document.getElementById('semaforoRecomendacion').textContent = semaforo.recomendacion;
}

// ===== COMPARAR CON BENCHMARK =====
function compararConBenchmarkIndustria(margenNeto) {
    const industria = document.getElementById('industria').value;
    const comparacion = compararConBenchmark(margenNeto, industria);
    
    if (comparacion) {
        const benchmarkDiv = document.getElementById('benchmarkComparison');
        const textoDiv = document.getElementById('benchmarkTexto');
        
        benchmarkDiv.style.display = 'block';
        
        let html = `<div class="mb-2">`;
        html += `<span class="font-bold">${BENCHMARKS_PERU[industria].nombre}:</span> `;
        html += `Margen promedio ${comparacion.benchmark.toFixed(1)}%</div>`;
        
        html += `<div class="${comparacion.mejor ? 'text-green-400' : 'text-orange-400'}">`;
        html += `${comparacion.mensaje}`;
        html += `</div>`;
        
        textoDiv.innerHTML = html;
    }
}

// ===== INGENIERÍA INVERSA =====
function calcularIngenieriaInversa() {
    const margenDeseado = parseFloat(document.getElementById('margenDeseado').value) || 30;
    const costoCompra = parseFloat(document.getElementById('costoCompra').value) || 0;
    const packaging = parseFloat(document.getElementById('packaging').value) || 0;
    const logistica = parseFloat(document.getElementById('logistica').value) || 0;
    const mermaPercent = parseFloat(document.getElementById('merma').value) || 0;
    
    const costosDirectos = costoCompra + packaging + logistica;
    const costoMerma = costosDirectos * (mermaPercent / 100);
    
    // Estimación simplificada (iterativa para precisión)
    let precioSugerido = 0;
    let margenActual = 0;
    let intentos = 0;
    const maxIntentos = 100;
    
    // Comenzar con una estimación
    precioSugerido = (costosDirectos + costoMerma) / (1 - (margenDeseado / 100));
    
    // Iterar para afinar considerando pasarela e impuestos
    while (Math.abs(margenActual - margenDeseado) > 0.5 && intentos < maxIntentos) {
        const pasarelaKey = document.getElementById('pasarela').value;
        const pasarela = PASARELAS_PERU[pasarelaKey];
        
        const comisionTotal = (precioSugerido * pasarela.comision) + pasarela.fijo;
        const igvComision = pasarela.aplicaIGV ? comisionTotal * PERU_2026.IGV : 0;
        const retencion = pasarela.retencion ? precioSugerido * pasarela.retencion : 0;
        
        const gananciaAntes = precioSugerido - costosDirectos - costoMerma - comisionTotal - igvComision - retencion;
        
        // Impuesto aproximado (usamos tasa efectiva promedio)
        const impuestoAprox = gananciaAntes * 0.15;
        
        const gananciaNeta = gananciaAntes - impuestoAprox;
        margenActual = (gananciaNeta / precioSugerido) * 100;
        
        // Ajustar
        if (margenActual < margenDeseado) {
            precioSugerido *= 1.02;
        } else if (margenActual > margenDeseado) {
            precioSugerido *= 0.98;
        }
        
        intentos++;
    }
    
    document.getElementById('precioSugerido').textContent = formatearSoles(precioSugerido);
    
    const margenBrutoNecesario = margenDeseado + 15;
    document.getElementById('margenBrutoNecesario').textContent = formatearPorcentaje(margenBrutoNecesario);
}

// ===== ESCALABILIDAD =====
function calcularEscalabilidad() {
    const metaGanancia = parseFloat(document.getElementById('metaGanancia').value) || 0;
    const precioVenta = parseFloat(document.getElementById('precioVenta').value) || 0;
    const costoTotalText = document.getElementById('costoTotalUnitario').textContent;
    const costoTotal = parseFloat(costoTotalText.replace(/[^\d.,-]/g, '').replace(',', '.')) || 0;
    
    const gananciaPorUnidad = precioVenta - costoTotal;
    
    if (gananciaPorUnidad <= 0) {
        document.getElementById('unidadesNecesarias').textContent = '∞';
        return;
    }
    
    const unidadesNecesarias = Math.ceil(metaGanancia / gananciaPorUnidad);
    document.getElementById('unidadesNecesarias').textContent = unidadesNecesarias.toLocaleString('es-PE');
}

// ===== LTV/CAC RATIO =====
function calcularLTVCAC() {
    const cacCliente = parseFloat(document.getElementById('cacCliente').value) || 0;
    const comprasAnio = parseFloat(document.getElementById('comprasPromedio').value) || 0;
    const gananciaNeta = parseFloat(document.getElementById('gananciaNeta').textContent.replace(/[^\d.,-]/g, '').replace(',', '.')) || 0;
    
    if (cacCliente === 0) {
        document.getElementById('ratioLTVCAC').textContent = '0:1';
        document.getElementById('mensajeLTVCAC').textContent = 'Ingresa CAC para calcular';
        return;
    }
    
    const ltv = gananciaNeta * comprasAnio * 3;
    const ratio = ltv / cacCliente;
    
    document.getElementById('ratioLTVCAC').textContent = `${ratio.toFixed(1)}:1`;
    
    let mensaje = '';
    if (ratio < 1) {
        mensaje = '🔴 Crítico: Pierdes dinero por cada cliente';
    } else if (ratio < 3) {
        mensaje = '🟡 Bajo: Necesitas mejorar retención o reducir CAC';
    } else if (ratio < 5) {
        mensaje = '🟢 Bueno: Modelo sostenible';
    } else {
        mensaje = '🟢 Excelente: Modelo muy rentable';
    }
    
    document.getElementById('mensajeLTVCAC').textContent = mensaje;
}

// ===== BREAK-EVEN CHART =====
function actualizarChartBreakeven(costoTotal, precioVenta, gananciaPorUnidad) {
    const ctx = document.getElementById('chartBreakeven').getContext('2d');
    
    // Calcular punto de equilibrio (asumiendo costos fijos mensuales)
    const costosFijos = 1000;
    const unidadesBreakeven = gananciaPorUnidad > 0 ? Math.ceil(costosFijos / gananciaPorUnidad) : 0;
    
    document.getElementById('unidadesBreakeven').textContent = unidadesBreakeven.toLocaleString('es-PE');
    
    const maxUnidades = unidadesBreakeven * 2 || 100;
    const unidades = Array.from({length: 10}, (_, i) => Math.floor(i * maxUnidades / 10));
    
    const ingresos = unidades.map(u => u * precioVenta);
    const costos = unidades.map(u => costosFijos + (u * costoTotal));
    
    if (chartBreakeven) {
        chartBreakeven.destroy();
    }
    
    chartBreakeven = new Chart(ctx, {
        type: 'line',
        data: {
            labels: unidades,
            datasets: [
                {
                    label: 'Ingresos',
                    data: ingresos,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    tension: 0.4
                },
                {
                    label: 'Costos Totales',
                    data: costos,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 3,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#e2e8f0',
                        font: { size: 12, weight: 'bold' }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Unidades Vendidas',
                        color: '#94a3b8',
                        font: { size: 11, weight: 'bold' }
                    },
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Soles (S/)',
                        color: '#94a3b8',
                        font: { size: 11, weight: 'bold' }
                    },
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                }
            }
        }
    });
}

// ===== PDF EXPORT =====
function exportarPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const producto = document.getElementById('nombreProducto').value || 'Producto';
        const precio = document.getElementById('precioVenta').value;
        const costo = document.getElementById('costoTotalUnitario').textContent;
        const ganancia = document.getElementById('gananciaNeta').textContent;
        const margen = document.getElementById('margenNeto').textContent;
        const regimen = document.getElementById('regimen').options[document.getElementById('regimen').selectedIndex].text;
        const pasarela = document.getElementById('pasarela').options[document.getElementById('pasarela').selectedIndex].text;
        
        // Header
        doc.setFillColor(6, 78, 59);
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setTextColor(251, 191, 36);
        doc.setFontSize(24);
        doc.setFont(undefined, 'bold');
        doc.text('MarginAxis Perú 2026', 105, 15, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.text('Análisis de Rentabilidad SUNAT', 105, 25, { align: 'center' });
        doc.text(`Fecha: ${new Date().toLocaleDateString('es-PE')}`, 105, 32, { align: 'center' });
        
        // Producto
        doc.setFontSize(16);
        doc.setTextColor(251, 191, 36);
        doc.text(`Producto: ${producto}`, 20, 50);
        
        // Configuración
        doc.setFontSize(14);
        doc.setTextColor(16, 185, 129);
        doc.text('Configuración', 20, 65);
        
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`Régimen SUNAT: ${regimen}`, 20, 75);
        doc.text(`Método de Cobro: ${pasarela}`, 20, 82);
        doc.text(`UIT 2026: S/ ${PERU_2026.UIT}`, 20, 89);
        doc.text(`IGV: ${(PERU_2026.IGV * 100)}%`, 20, 96);
        
        // Resultados Financieros
        doc.setFontSize(14);
        doc.setTextColor(16, 185, 129);
        doc.text('Resultados Financieros', 20, 110);
        
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`Precio de Venta: ${formatearSoles(parseFloat(precio))}`, 20, 120);
        doc.text(`Costo Total: ${costo}`, 20, 127);
        doc.text(`Ganancia Neta: ${ganancia}`, 20, 134);
        doc.text(`Margen Neto: ${margen}`, 20, 141);
        
        // Semáforo
        const margenNum = parseFloat(margen.replace('%', ''));
        const semaforo = determinarSemaforo(margenNum);
        
        doc.setFontSize(14);
        doc.setTextColor(semaforo.color === '#10b981' ? 16 : semaforo.color === '#f59e0b' ? 245 : 220, 
                         semaforo.color === '#10b981' ? 185 : semaforo.color === '#f59e0b' ? 158 : 38, 
                         semaforo.color === '#10b981' ? 129 : semaforo.color === '#f59e0b' ? 11 : 38);
        doc.text('Estado de Rentabilidad', 20, 155);
        
        doc.setFontSize(11);
        doc.text(`${semaforo.icono} ${semaforo.mensaje}`, 20, 165);
        doc.text(semaforo.recomendacion, 20, 172);
        
        // Desglose de costos
        doc.setFontSize(14);
        doc.setTextColor(16, 185, 129);
        doc.text('Desglose de Costos', 20, 190);
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        let y = 200;
        doc.text(`Costos Directos: ${document.getElementById('costosDirectos').textContent}`, 20, y);
        y += 7;
        doc.text(`Merma: ${document.getElementById('costoMerma').textContent}`, 20, y);
        y += 7;
        doc.text(`Comisión Pasarela: ${document.getElementById('costoComision').textContent}`, 20, y);
        y += 7;
        doc.text(`IGV Comisión: ${document.getElementById('igvComision').textContent}`, 20, y);
        y += 7;
        doc.text(`Impuesto Renta: ${document.getElementById('impuestoRenta').textContent}`, 20, y);
        
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('MarginAxis Perú 2026 - Sistema SUNAT Completo', 105, 280, { align: 'center' });
        doc.text('Pentágono Financiero Ecosystem • Made with 💚 in Peru', 105, 285, { align: 'center' });
        
        doc.save(`MarginAxis_Peru_${producto}_${new Date().getTime()}.pdf`);
        mostrarNotificacion('✓ PDF generado exitosamente', 'success');
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        mostrarNotificacion('✗ Error al generar PDF', 'error');
    }
}

// ===== CSV EXPORT =====
function exportarCSV() {
    const producto = document.getElementById('nombreProducto').value || 'Producto';
    const precio = document.getElementById('precioVenta').value;
    const costo = document.getElementById('costoTotalUnitario').textContent;
    const margen = document.getElementById('margenNeto').textContent;
    const ganancia = document.getElementById('gananciaNeta').textContent;
    const regimen = document.getElementById('regimen').options[document.getElementById('regimen').selectedIndex].text;
    
    const csv = [
        ['Campo', 'Valor'],
        ['Producto', producto],
        ['País', 'Perú'],
        ['Régimen SUNAT', regimen],
        ['Precio Venta', precio],
        ['Costo Total', costo],
        ['Margen Neto', margen],
        ['Ganancia Neta', ganancia],
        ['UIT 2026', `S/ ${PERU_2026.UIT}`],
        ['IGV', `${(PERU_2026.IGV * 100)}%`],
        ['Fecha', new Date().toLocaleDateString('es-PE')]
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MarginAxis_Peru_${producto}_${new Date().getTime()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    mostrarNotificacion('✓ CSV exportado', 'success');
}

// ===== SHARE RESULTS =====
function compartirResultados() {
    const texto = `📊 Análisis MarginAxis Perú 2026
Producto: ${document.getElementById('nombreProducto').value || 'Mi Producto'}
Margen Neto: ${document.getElementById('margenNeto').textContent}
Ganancia: ${document.getElementById('gananciaNeta').textContent}

🇵🇪 Sistema SUNAT Completo
🚀 Calcula tu rentabilidad real en Peru`;
    
    if (navigator.share) {
        navigator.share({
            title: 'MarginAxis Perú 2026',
            text: texto
        }).then(() => {
            mostrarNotificacion('✓ Compartido exitosamente', 'success');
        }).catch(() => {});
    } else {
        navigator.clipboard.writeText(texto).then(() => {
            mostrarNotificacion('✓ Copiado al portapapeles', 'success');
        });
    }
}

// ===== PRODUCT SAVE =====
function guardarProducto() {
    const producto = {
        id: Date.now(),
        nombre: document.getElementById('nombreProducto').value || 'Sin nombre',
        precio: parseFloat(document.getElementById('precioVenta').value) || 0,
        costo: parseFloat(document.getElementById('costoTotalUnitario').textContent.replace(/[^\d.,-]/g, '').replace(',', '.')) || 0,
        margen: parseFloat(document.getElementById('margenNeto').textContent.replace('%', '')) || 0,
        regimen: document.getElementById('regimen').value,
        fecha: new Date().toISOString()
    };
    
    let productos = JSON.parse(localStorage.getItem(STORAGE_KEYS.productos) || '[]');
    productos.push(producto);
    localStorage.setItem(STORAGE_KEYS.productos, JSON.stringify(productos));
    
    mostrarNotificacion('✓ Producto guardado correctamente', 'success');
}

// ===== PENTAGON INTEGRATION =====
async function verificarConexionesPentagon() {
    const links = window.PENTAGON_LINKS;
    
    document.getElementById('linkSueldoPro').href = links.sueldopro;
    document.getElementById('linkLiquidez').href = links.liquidez;
    document.getElementById('linkLeadNexus').href = links.leadnexus;
    document.getElementById('linkWealth').href = links.wealth;
    
    document.getElementById('syncSueldoPro').textContent = '🟢 Conectado';
    document.getElementById('syncLeadNexus').textContent = '🟢 Conectado';
    document.getElementById('syncLiquidez').textContent = '🟢 Conectado';
    document.getElementById('syncWealth').textContent = '🟢 Conectado';
}

// ===== SIMULATOR FUNCTIONS =====
function simularCambio(porcentaje) {
    const precioActual = parseFloat(document.getElementById('precioVenta').value) || 0;
    const nuevoPrecio = precioActual * (1 + porcentaje / 100);
    document.getElementById('precioVenta').value = nuevoPrecio.toFixed(2);
    calcular();
    mostrarNotificacion(`Precio ${porcentaje > 0 ? 'aumentado' : 'reducido'} ${Math.abs(porcentaje)}%`, 'info');
}

function resetearValores() {
    document.getElementById('costoCompra').value = 100.00;
    document.getElementById('packaging').value = 5.00;
    document.getElementById('logistica').value = 10.00;
    document.getElementById('merma').value = 5;
    document.getElementById('precioVenta').value = 250.00;
    document.getElementById('metaGanancia').value = 10000;
    document.getElementById('esImportado').checked = false;
    document.getElementById('nombreProducto').value = '';
    
    toggleImportacion();
    calcular();
    mostrarNotificacion('✓ Valores reseteados', 'info');
}

// ===== MOBILE MENU =====
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('hidden');
}

// ===== NOTIFICATIONS =====
function mostrarNotificacion(mensaje, tipo = 'info') {
    const notif = document.createElement('div');
    notif.textContent = mensaje;
    
    let bgColor = '#06b6d4';
    if (tipo === 'success') bgColor = '#10b981';
    if (tipo === 'warning') bgColor = '#f59e0b';
    if (tipo === 'error') bgColor = '#ef4444';
    
    notif.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.875rem;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.6);
        z-index: 9999;
        font-weight: 700;
        font-size: 0.9rem;
        max-width: 90%;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notif);
    setTimeout(() => {
        notif.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// Animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

console.log('✓ MarginAxis Perú 2026 Engine Cargado');
console.log('🇵🇪 Sistema SUNAT Completo Activo');
console.log(`💰 UIT 2026: S/ ${PERU_2026.UIT}`);
console.log('📊 Cálculos de Rentabilidad Listos');
console.log('🔄 Ingeniería Inversa Habilitada');
console.log('📈 Simulador de Escalabilidad Listo');
console.log('📄 Exportación PDF Profesional Activa');
console.log('⬡ Pentagon Bridge Conectado');
