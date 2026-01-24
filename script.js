/* ========================================
   MARGINAXIS GLOBAL - ENGINE v3.0
   Reverse Engineering • Stress Testing • PDF Reports
   Pentagon Integration • Mobile Optimized
   ======================================== */
// ===== PENTAGON INTEGRATION =====
async function verificarConexionesPentagon() {
    const links = window.PENTAGON_LINKS;
    
    document.getElementById('linkSueldoPro').href = links.sueldopro.url;
    document.getElementById('linkLiquidez').href = links.liquidez.url;
    document.getElementById('linkLeadTarget').href = links.leadtarget.url;
    document.getElementById('linkWealth').href = links.wealth.url;
    
    document.getElementById('syncSueldoPro').textContent = 'Listo';
    document.getElementById('syncLeadTarget').textContent = 'Listo';
    document.getElementById('syncLiquidez').textContent = 'Listo';
    document.getElementById('syncWealth').textContent = 'Listo';
}
// ===== GLOBAL STATE =====
let paisActual = getPaisActual();
let configPais = getConfigPais(paisActual);
let forexRates = {};
let chartBreakeven = null;
let stressFactors = { devaluacion: 0, costos: 0, demanda: 0 };

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 MarginAxis Global v3.0 initializing...');
    
    cargarPaisGuardado();
    cargarForex();
    configurarEventos();
    configurarStressTest();
    calcular();
    verificarConexionesPentagon();
    
    console.log('✓ MarginAxis Global ready');
});

// ===== EVENT CONFIGURATION =====
function configurarEventos() {
    document.getElementById('paisSelector').addEventListener('change', cambiarPais);
    
    document.getElementById('esImportado').addEventListener('change', toggleImportacion);
    document.getElementById('codigoHS').addEventListener('input', buscarArancel);
    
    ['costoCompra', 'packaging', 'logistica', 'merma'].forEach(id => {
        document.getElementById(id).addEventListener('input', calcular);
    });
    
    document.getElementById('precioVenta').addEventListener('input', calcular);
    document.getElementById('pasarela').addEventListener('change', calcular);
    document.getElementById('regimen').addEventListener('change', calcular);
    
    document.getElementById('metaGanancia').addEventListener('input', calcular);
    document.getElementById('salarioEmpleado').addEventListener('input', calcularEscalabilidad);
    
    document.getElementById('cacCliente').addEventListener('input', calcularLTVCAC);
    document.getElementById('comprasPromedio').addEventListener('input', calcularLTVCAC);
}

// ===== COUNTRY MANAGEMENT =====
function cambiarPais() {
    paisActual = document.getElementById('paisSelector').value;
    configPais = getConfigPais(paisActual);
    
    localStorage.setItem(STORAGE_KEYS.paisActual, paisActual);
    
    actualizarPasarelasPorPais();
    actualizarRegimenesPorPais();
    actualizarInfoFiscal();
    cargarForex();
    calcular();
    
    mostrarNotificacion(`Cambiado a ${configPais.nombre}`, 'success');
}

function cargarPaisGuardado() {
    document.getElementById('paisSelector').value = paisActual;
    actualizarPasarelasPorPais();
    actualizarRegimenesPorPais();
    actualizarInfoFiscal();
}

function actualizarPasarelasPorPais() {
    const select = document.getElementById('pasarela');
    select.innerHTML = '';
    
    Object.entries(configPais.pasarelas).forEach(([key, pasarela]) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = `${pasarela.icono} ${pasarela.nombre}`;
        select.appendChild(option);
    });
}

function actualizarRegimenesPorPais() {
    const select = document.getElementById('regimen');
    select.innerHTML = '';
    
    Object.entries(configPais.regimenes).forEach(([key, regimen]) => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = regimen.nombre;
        select.appendChild(option);
    });
}

function actualizarInfoFiscal() {
    document.getElementById('labelIVA').textContent = `${configPais.nombreIVA} (${(configPais.iva * 100).toFixed(0)}%)`;
    document.getElementById('infoIVA').textContent = `${(configPais.iva * 100).toFixed(0)}%`;
    
    const regimenKey = document.getElementById('regimen').value || Object.keys(configPais.regimenes)[0];
    const regimen = configPais.regimenes[regimenKey];
    document.getElementById('infoRenta').textContent = `${(regimen.tasaRenta * 100).toFixed(1)}%`;
}

// ===== FOREX MANAGEMENT =====
async function cargarForex() {
    try {
        const cached = localStorage.getItem(STORAGE_KEYS.forexCache);
        const cacheData = cached ? JSON.parse(cached) : null;
        
        if (cacheData && (Date.now() - cacheData.timestamp < 3600000)) {
            forexRates = cacheData.rates;
            actualizarDisplayForex();
            return;
        }
        
        const response = await fetch(FOREX_API.endpoint);
        const data = await response.json();
        forexRates = data.rates;
        
        localStorage.setItem(STORAGE_KEYS.forexCache, JSON.stringify({
            rates: forexRates,
            timestamp: Date.now()
        }));
        
        actualizarDisplayForex();
        
    } catch (error) {
        console.warn('⚠️ Forex offline, using defaults');
        forexRates = {};
        actualizarDisplayForex();
    }
}

function actualizarDisplayForex() {
    const rate = forexRates[configPais.moneda] || FOREX_API.defaultRates[paisActual];
    document.getElementById('infoForex').textContent = `1 USD = ${configPais.simbolo}${rate.toFixed(2)}`;
    calcular();
}

// ===== IMPORT TOGGLE =====
function toggleImportacion() {
    const esImportado = document.getElementById('esImportado').checked;
    document.getElementById('seccionAduanas').style.display = esImportado ? 'block' : 'none';
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
    
    const arancel = ARANCELES[codigo];
    
    if (arancel) {
        const porcentaje = (arancel.adValorem * 100).toFixed(1);
        infoEl.textContent = `Ad Valorem: ${porcentaje}% - ${arancel.descripcion}`;
        infoEl.style.color = '#10b981';
    } else {
        infoEl.textContent = `No encontrado - usando 11%`;
        infoEl.style.color = '#f59e0b';
    }
    
    calcular();
}

// ===== STRESS TESTING CONFIGURATION =====
function configurarStressTest() {
    const sliderDevaluacion = document.getElementById('sliderDevaluacion');
    const sliderCostos = document.getElementById('sliderCostos');
    const sliderDemanda = document.getElementById('sliderDemanda');
    
    sliderDevaluacion.addEventListener('input', function() {
        stressFactors.devaluacion = parseFloat(this.value);
        document.getElementById('labelDevaluacion').textContent = `${this.value}%`;
        aplicarStressTest();
    });
    
    sliderCostos.addEventListener('input', function() {
        stressFactors.costos = parseFloat(this.value);
        document.getElementById('labelCostos').textContent = `+${this.value}%`;
        aplicarStressTest();
    });
    
    sliderDemanda.addEventListener('input', function() {
        stressFactors.demanda = parseFloat(this.value);
        document.getElementById('labelDemanda').textContent = `-${this.value}%`;
        aplicarStressTest();
    });
}

function aplicarStressTest() {
    calcular();
    
    const totalStress = Math.abs(stressFactors.devaluacion) + stressFactors.costos + stressFactors.demanda;
    let mensaje = '';
    
    if (totalStress === 0) {
        mensaje = 'Escenario normal';
    } else if (totalStress < 30) {
        mensaje = '⚠️ Crisis leve - Ajustes menores necesarios';
    } else if (totalStress < 60) {
        mensaje = '🔥 Crisis moderada - Revisar estrategia';
    } else {
        mensaje = '💀 Crisis severa - Reestructuración urgente';
    }
    
    document.getElementById('mensajeStress').textContent = mensaje;
}

// ===== MAIN CALCULATION ENGINE =====
function calcular() {
    let costoCompra = parseFloat(document.getElementById('costoCompra').value) || 0;
    let packaging = parseFloat(document.getElementById('packaging').value) || 0;
    let logistica = parseFloat(document.getElementById('logistica').value) || 0;
    const merma = parseFloat(document.getElementById('merma').value) || 0;
    let precioVenta = parseFloat(document.getElementById('precioVenta').value) || 0;
    const metaGanancia = parseFloat(document.getElementById('metaGanancia').value) || 0;
    
    const pasarelaKey = document.getElementById('pasarela').value;
    const regimenKey = document.getElementById('regimen').value;
    const esImportado = document.getElementById('esImportado').checked;
    
    // APPLY STRESS FACTORS
    if (stressFactors.costos > 0) {
        costoCompra *= (1 + stressFactors.costos / 100);
        packaging *= (1 + stressFactors.costos / 100);
        logistica *= (1 + stressFactors.costos / 100);
    }
    
    if (stressFactors.devaluacion !== 0 && esImportado) {
        costoCompra *= (1 + stressFactors.devaluacion / 100);
    }
    
    // IMPORT COSTS
    let costoImportacion = 0;
    if (esImportado) {
        const codigo = document.getElementById('codigoHS').value.trim();
        const arancel = ARANCELES[codigo] || { adValorem: 0.11 };
        costoImportacion = costoCompra * arancel.adValorem;
    }
    
    // TOTAL COST
    const costoBase = costoCompra + packaging + logistica + costoImportacion;
    const costoMerma = costoBase * (merma / 100);
    const costoTotalUnitario = costoBase + costoMerma;
    
    document.getElementById('costoTotalUnitario').textContent = formatearMonedaPais(costoTotalUnitario, paisActual);
    
    // PAYMENT GATEWAY COMMISSION
    const pasarela = configPais.pasarelas[pasarelaKey];
    let comisionPasarela = (precioVenta * pasarela.comision) + pasarela.fijo;
    
    if (pasarela.aplicaIVA) {
        comisionPasarela = comisionPasarela * (1 + configPais.iva);
    }
    
    document.getElementById('comisionPasarela').textContent = formatearMonedaPais(comisionPasarela, paisActual);
    const porcentajeComision = precioVenta > 0 ? (comisionPasarela / precioVenta * 100) : 0;
    document.getElementById('detallePasarela').textContent = `${porcentajeComision.toFixed(2)}%`;
    
    // TAXES
    const regimen = configPais.regimenes[regimenKey];
    let montoIVA = 0;
    let montoRenta = 0;
    
    if (regimen.aplicaIVA) {
        montoIVA = precioVenta * configPais.iva;
    }
    
    const gananciaBrutaParaRenta = precioVenta - costoTotalUnitario - comisionPasarela;
    if (gananciaBrutaParaRenta > 0) {
        montoRenta = gananciaBrutaParaRenta * regimen.tasaRenta;
    }
    
    const totalImpuestos = montoIVA + montoRenta;
    
    document.getElementById('montoIVA').textContent = formatearMonedaPais(montoIVA, paisActual);
    document.getElementById('montoRenta').textContent = formatearMonedaPais(montoRenta, paisActual);
    document.getElementById('totalImpuestos').textContent = formatearMonedaPais(totalImpuestos, paisActual);
    
    // PROFIT CALCULATIONS
    const gananciaBruta = precioVenta - costoTotalUnitario;
    const totalCostos = costoTotalUnitario + comisionPasarela + totalImpuestos;
    let gananciaNeta = precioVenta - totalCostos;
    
    // Apply demand factor
    if (stressFactors.demanda > 0) {
        gananciaNeta *= (1 - stressFactors.demanda / 100);
    }
    
    document.getElementById('gananciaBruta').textContent = formatearMonedaPais(gananciaBruta, paisActual);
    document.getElementById('totalCostos').textContent = formatearMonedaPais(totalCostos, paisActual);
    document.getElementById('gananciaNeta').textContent = formatearMonedaPais(gananciaNeta, paisActual);
    document.getElementById('enBolsillo').textContent = formatearMonedaPais(gananciaNeta, paisActual);
    
    // NET MARGIN
    const margenNeto = precioVenta > 0 ? (gananciaNeta / precioVenta * 100) : 0;
    
    // UPDATE UI COMPONENTS
    actualizarSemaforo(margenNeto);
    actualizarMultiCurrency(gananciaNeta);
    calcularReverseProfitEngineering(gananciaNeta, metaGanancia, costoTotalUnitario);
    actualizarGraficoBreakeven(costoTotalUnitario, gananciaNeta, precioVenta);
    actualizarInfoFiscal();
    calcularEscalabilidad();
    calcularLTVCAC();
    
    // STRESS TEST DISPLAY
    document.getElementById('margenStress').textContent = `${margenNeto.toFixed(1)}%`;
    document.getElementById('margenStress').style.color = margenNeto >= 30 ? '#10b981' : margenNeto >= 15 ? '#f59e0b' : '#dc2626';
}

// ===== TRAFFIC LIGHT =====
function actualizarSemaforo(margenNeto) {
    const card = document.getElementById('trafficLight');
    const icon = document.getElementById('trafficIcon');
    const display = document.getElementById('margenNeto');
    const message = document.getElementById('trafficMessage');
    
    let estado;
    if (margenNeto < TRAFFIC_LIGHT.red.max) estado = TRAFFIC_LIGHT.red;
    else if (margenNeto < TRAFFIC_LIGHT.yellow.max) estado = TRAFFIC_LIGHT.yellow;
    else estado = TRAFFIC_LIGHT.green;
    
    card.className = 'obsidian-card p-6 md:p-8 slide-in traffic-light-container ' + estado.class;
    icon.textContent = estado.icon;
    display.textContent = `${margenNeto.toFixed(1)}%`;
    display.style.color = estado.color;
    message.textContent = estado.message;
}

// ===== MULTI-CURRENCY DISPLAY =====
function actualizarMultiCurrency(gananciaNeta) {
    document.getElementById('displayLocal').textContent = formatearMonedaPais(gananciaNeta, paisActual);
    
    const usd = convertirAUSD(gananciaNeta, paisActual, forexRates);
    document.getElementById('displayUSD').textContent = `$${usd.toFixed(2)}`;
    
    const eur = convertirAEUR(gananciaNeta, paisActual, forexRates);
    document.getElementById('displayEUR').textContent = `€${eur.toFixed(2)}`;
}

// ===== REVERSE PROFIT ENGINEERING =====
function calcularReverseProfitEngineering(gananciaNetaActual, metaGanancia, costoTotal) {
    if (gananciaNetaActual <= 0) {
        document.getElementById('precioSugerido').textContent = formatearMonedaPais(0, paisActual);
        document.getElementById('unidadesRequeridas').textContent = '∞';
        document.getElementById('ventasDiarias').textContent = 'N/A';
        return;
    }
    
    const unidadesRequeridas = Math.ceil(metaGanancia / gananciaNetaActual);
    const ventasDiarias = (unidadesRequeridas / CALCULOS.diasLaborablesMes).toFixed(1);
    
    document.getElementById('unidadesRequeridas').textContent = unidadesRequeridas.toLocaleString('es');
    document.getElementById('ventasDiarias').textContent = `≈ ${ventasDiarias} ventas/día`;
    
    const precioActual = parseFloat(document.getElementById('precioVenta').value) || 0;
    const margenActual = precioActual > 0 ? (gananciaNetaActual / precioActual) : 0;
    
    if (margenActual > 0) {
        const precioSugerido = costoTotal / (1 - margenActual);
        document.getElementById('precioSugerido').textContent = formatearMonedaPais(precioSugerido, paisActual);
    } else {
        document.getElementById('precioSugerido').textContent = formatearMonedaPais(costoTotal * 1.5, paisActual);
    }
}

// ===== SCALABILITY ANALYSIS =====
function calcularEscalabilidad() {
    const salarioEmpleado = parseFloat(document.getElementById('salarioEmpleado').value) || 0;
    const gananciaNetaEl = document.getElementById('gananciaNeta');
    const gananciaNeta = parseFloat(gananciaNetaEl.textContent.replace(/[^\d.,-]/g, '').replace(',', '.')) || 0;
    
    if (gananciaNeta <= 0) {
        document.getElementById('ventasExtraEmpleado').textContent = '∞';
        return;
    }
    
    const ventasExtra = Math.ceil(salarioEmpleado / gananciaNeta);
    document.getElementById('ventasExtraEmpleado').textContent = ventasExtra.toLocaleString('es');
}

// ===== LTV vs CAC OPTIMIZER =====
function calcularLTVCAC() {
    const cac = parseFloat(document.getElementById('cacCliente').value) || 0;
    const comprasAnuales = parseFloat(document.getElementById('comprasPromedio').value) || 1;
    const gananciaNetaEl = document.getElementById('gananciaNeta');
    const gananciaNeta = parseFloat(gananciaNetaEl.textContent.replace(/[^\d.,-]/g, '').replace(',', '.')) || 0;
    
    const ltv = gananciaNeta * comprasAnuales * 3;
    
    if (cac === 0) {
        document.getElementById('ratioLTVCAC').textContent = '∞:1';
        document.getElementById('mensajeLTVCAC').textContent = 'Sin costo de adquisición';
        return;
    }
    
    const ratio = ltv / cac;
    document.getElementById('ratioLTVCAC').textContent = `${ratio.toFixed(1)}:1`;
    
    let mensaje = '';
    if (ratio >= 3) {
        mensaje = '✅ Excelente - CAC muy rentable';
    } else if (ratio >= 1) {
        mensaje = '⚠️ Aceptable - Optimiza tu CAC';
    } else {
        mensaje = '❌ Crítico - Pierdes dinero por cliente';
    }
    
    document.getElementById('mensajeLTVCAC').textContent = mensaje;
}

// ===== BREAK-EVEN CHART =====
function actualizarGraficoBreakeven(costoTotal, gananciaNeta, precioVenta) {
    const ctx = document.getElementById('chartBreakeven').getContext('2d');
    
    if (chartBreakeven) chartBreakeven.destroy();
    
    const unidades = Array.from({length: 20}, (_, i) => i + 1);
    const costos = unidades.map(u => costoTotal * u);
    const ventas = unidades.map(u => precioVenta * u);
    const ganancias = unidades.map(u => gananciaNeta * u);
    
    chartBreakeven = new Chart(ctx, {
        type: 'line',
        data: {
            labels: unidades,
            datasets: [
                {
                    label: 'Costos',
                    data: costos,
                    borderColor: '#dc2626',
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'Ventas',
                    data: ventas,
                    borderColor: '#06b6d4',
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'Ganancia',
                    data: ganancias,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: { color: '#e2e8f0', font: { size: 10 } }
                },
                tooltip: {
                    backgroundColor: 'rgba(2, 6, 23, 0.95)',
                    titleColor: '#10b981',
                    bodyColor: '#e2e8f0'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#94a3b8', font: { size: 10 } },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                },
                x: {
                    ticks: { color: '#94a3b8', font: { size: 10 } },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                }
            }
        }
    });
    
    const breakeven = precioVenta > costoTotal ? Math.ceil(costoTotal / (precioVenta - costoTotal)) : 0;
    document.getElementById('unidadesBreakeven').textContent = breakeven;
}

// ===== PDF EXPORT =====
function exportarPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const producto = document.getElementById('nombreProducto').value || 'Producto';
        const precio = document.getElementById('precioVenta').value;
        const margen = document.getElementById('margenNeto').textContent;
        const ganancia = document.getElementById('gananciaNeta').textContent;
        const costo = document.getElementById('costoTotalUnitario').textContent;
        
        doc.setFontSize(20);
        doc.setTextColor(16, 185, 129);
        doc.text('MarginAxis Global', 105, 20, { align: 'center' });
        
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Reporte de Rentabilidad', 105, 30, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text(`Producto: ${producto}`, 20, 50);
        doc.text(`País: ${configPais.nombre}`, 20, 60);
        doc.text(`Fecha: ${new Date().toLocaleDateString('es')}`, 20, 70);
        
        doc.setFontSize(14);
        doc.setTextColor(16, 185, 129);
        doc.text('Datos Financieros', 20, 90);
        
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`Precio de Venta: ${formatearMonedaPais(parseFloat(precio), paisActual)}`, 20, 100);
        doc.text(`Costo Total: ${costo}`, 20, 110);
        doc.text(`Ganancia Neta: ${ganancia}`, 20, 120);
        doc.text(`Margen Neto: ${margen}`, 20, 130);
        
        if (stressFactors.devaluacion !== 0 || stressFactors.costos !== 0 || stressFactors.demanda !== 0) {
            doc.setFontSize(14);
            doc.setTextColor(220, 38, 38);
            doc.text('Análisis de Estrés Aplicado', 20, 150);
            
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            doc.text(`Devaluación: ${stressFactors.devaluacion}%`, 20, 160);
            doc.text(`Aumento Costos: ${stressFactors.costos}%`, 20, 170);
            doc.text(`Caída Demanda: ${stressFactors.demanda}%`, 20, 180);
        }
        
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text('MarginAxis Global - Enterprise Profit Intelligence', 105, 280, { align: 'center' });
        doc.text('Golden Commerce Ecosystem v3.0', 105, 285, { align: 'center' });
        
        doc.save(`MarginAxis_${producto}_${new Date().getTime()}.pdf`);
        mostrarNotificacion('PDF generado exitosamente', 'success');
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        mostrarNotificacion('Error al generar PDF', 'error');
    }
}

// ===== CSV EXPORT =====
function exportarCSV() {
    const producto = document.getElementById('nombreProducto').value || 'Producto';
    const precio = document.getElementById('precioVenta').value;
    const costo = document.getElementById('costoTotalUnitario').textContent;
    const margen = document.getElementById('margenNeto').textContent;
    const ganancia = document.getElementById('gananciaNeta').textContent;
    
    const csv = [
        ['Campo', 'Valor'],
        ['Producto', producto],
        ['País', configPais.nombre],
        ['Precio Venta', precio],
        ['Costo Total', costo],
        ['Margen Neto', margen],
        ['Ganancia Neta', ganancia],
        ['Fecha', new Date().toLocaleDateString('es')]
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MarginAxis_${producto}_${new Date().getTime()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    mostrarNotificacion('CSV exportado', 'success');
}

// ===== SHARE RESULTS =====
function compartirResultados() {
    const texto = `📊 Análisis MarginAxis Global
Producto: ${document.getElementById('nombreProducto').value}
Margen Neto: ${document.getElementById('margenNeto').textContent}
Ganancia: ${document.getElementById('gananciaNeta').textContent}

🚀 Analiza tu rentabilidad en margin-master-pro.vercel.app`;
    
    if (navigator.share) {
        navigator.share({
            title: 'MarginAxis Global',
            text: texto
        }).then(() => {
            mostrarNotificacion('Compartido exitosamente', 'success');
        }).catch(() => {});
    } else {
        navigator.clipboard.writeText(texto).then(() => {
            mostrarNotificacion('Copiado al portapapeles', 'success');
        });
    }
}

// ===== PRODUCT SAVE/LOAD =====
function guardarProducto() {
    const producto = {
        id: Date.now(),
        nombre: document.getElementById('nombreProducto').value || 'Sin nombre',
        precio: parseFloat(document.getElementById('precioVenta').value) || 0,
        costo: parseFloat(document.getElementById('costoTotalUnitario').textContent.replace(/[^\d.,-]/g, '').replace(',', '.')) || 0,
        margen: parseFloat(document.getElementById('margenNeto').textContent.replace('%', '')) || 0,
        pais: paisActual,
        fecha: new Date().toISOString()
    };
    
    let productos = JSON.parse(localStorage.getItem(STORAGE_KEYS.productos) || '[]');
    productos.push(producto);
    localStorage.setItem(STORAGE_KEYS.productos, JSON.stringify(productos));
    
    mostrarNotificacion('Producto guardado correctamente', 'success');
}

// ===== PENTAGON INTEGRATION =====
async function verificarConexionesPentagon() {
    const links = window.PENTAGON_LINKS;
    
    document.getElementById('linkSueldoPro').href = links.sueldopro;
    document.getElementById('linkLiquidez').href = links.liquidez;
    document.getElementById('linkLeadTarget').href = links.leadtarget;
    document.getElementById('linkWealth').href = links.wealth;
    
    document.getElementById('syncSueldoPro').textContent = 'Listo';
    document.getElementById('syncLeadTarget').textContent = 'Listo';
    document.getElementById('syncLiquidez').textContent = 'Listo';
    document.getElementById('syncWealth').textContent = 'Listo';
}

// ===== SIMULATOR FUNCTIONS =====
function simularCambio(porcentaje) {
    const precioActual = parseFloat(document.getElementById('precioVenta').value) || 0;
    const nuevoPrecio = precioActual * (1 + porcentaje / 100);
    document.getElementById('precioVenta').value = nuevoPrecio.toFixed(2);
    calcular();
    mostrarNotificacion(`Precio ${porcentaje > 0 ? 'aumentado' : 'reducido'} ${Math.abs(porcentaje)}%`);
}

function resetearValores() {
    document.getElementById('costoCompra').value = 100.00;
    document.getElementById('packaging').value = 10.00;
    document.getElementById('logistica').value = 15.00;
    document.getElementById('merma').value = 5;
    document.getElementById('precioVenta').value = 250.00;
    document.getElementById('metaGanancia').value = 10000;
    document.getElementById('esImportado').checked = false;
    
    // Reset stress sliders
    document.getElementById('sliderDevaluacion').value = 0;
    document.getElementById('sliderCostos').value = 0;
    document.getElementById('sliderDemanda').value = 0;
    stressFactors = { devaluacion: 0, costos: 0, demanda: 0 };
    document.getElementById('labelDevaluacion').textContent = '0%';
    document.getElementById('labelCostos').textContent = '0%';
    document.getElementById('labelDemanda').textContent = '0%';
    
    toggleImportacion();
    calcular();
    mostrarNotificacion('Valores reseteados');
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
    notif.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${tipo === 'success' ? '#10b981' : tipo === 'warning' ? '#f59e0b' : tipo === 'error' ? '#dc2626' : '#06b6d4'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.75rem;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        z-index: 9999;
        font-weight: 600;
        font-size: 0.875rem;
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

console.log('✓ MarginAxis Global Engine v3.0 loaded');
console.log('🌍 21-country system active');
console.log('💱 Real-time Forex enabled');
console.log('🔥 Stress Testing ready');
console.log('📄 PDF Reports enabled');
console.log('⬡ Pentagon Bridge connected');