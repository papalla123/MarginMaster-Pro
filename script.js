/* ========================================
   MARGINAXIS GLOBAL - ENGINE
   Reverse Profit Engineering • Real-Time Forex
   Pentagon Integration v3.0
   ======================================== */

// ===== GLOBAL STATE =====
let paisActual = getPaisActual();
let configPais = getConfigPais(paisActual);
let forexRates = {};
let chartBreakeven = null;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 MarginAxis Global initializing...');
    
    // Load saved country
    cargarPaisGuardado();
    
    // Load forex rates
    cargarForex();
    
    // Configure events
    configurarEventos();
    
    // Initial calculation
    calcular();
    
    // Check Pentagon connections
    verificarConexionesPentagon();
    
    console.log('✓ MarginAxis Global ready');
});

// ===== EVENT CONFIGURATION =====
function configurarEventos() {
    // Country selector
    document.getElementById('paisSelector').addEventListener('change', cambiarPais);
    
    // Import toggle
    document.getElementById('esImportado').addEventListener('change', toggleImportacion);
    document.getElementById('codigoHS').addEventListener('input', buscarArancel);
    
    // Cost inputs
    document.getElementById('costoCompra').addEventListener('input', calcular);
    document.getElementById('packaging').addEventListener('input', calcular);
    document.getElementById('logistica').addEventListener('input', calcular);
    document.getElementById('merma').addEventListener('input', calcular);
    
    // Price
    document.getElementById('precioVenta').addEventListener('input', calcular);
    
    // Selectors
    document.getElementById('pasarela').addEventListener('change', calcular);
    document.getElementById('regimen').addEventListener('change', calcular);
    
    // Reverse engineering
    document.getElementById('metaGanancia').addEventListener('input', calcular);
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
        
        // Check if cache is recent (less than 1 hour)
        if (cacheData && (Date.now() - cacheData.timestamp < 3600000)) {
            forexRates = cacheData.rates;
            actualizarDisplayForex();
            return;
        }
        
        // Fetch new rates
        const response = await fetch(FOREX_API.endpoint);
        const data = await response.json();
        
        forexRates = data.rates;
        
        // Cache the data
        localStorage.setItem(STORAGE_KEYS.forexCache, JSON.stringify({
            rates: forexRates,
            timestamp: Date.now()
        }));
        
        actualizarDisplayForex();
        
    } catch (error) {
        console.warn('⚠️ Could not load forex rates, using defaults');
        forexRates = {};
        actualizarDisplayForex();
    }
}

function actualizarDisplayForex() {
    const rate = forexRates[configPais.moneda] || FOREX_API.defaultRates[paisActual];
    document.getElementById('infoForex').textContent = `1 USD = ${configPais.simbolo}${rate.toFixed(2)}`;
    calcular(); // Recalculate with new rates
}

// ===== IMPORT TOGGLE =====
function toggleImportacion() {
    const esImportado = document.getElementById('esImportado').checked;
    document.getElementById('seccionAduanas').style.display = esImportado ? 'block' : 'none';
    
    if (esImportado) {
        buscarArancel();
    }
    calcular();
}

function buscarArancel() {
    const codigo = document.getElementById('codigoHS').value.trim();
    const infoEl = document.getElementById('infoArancel');
    
    if (!codigo) {
        infoEl.textContent = 'Ingresa un código HS';
        return;
    }
    
    const arancel = ARANCELES[codigo];
    
    if (arancel) {
        const porcentaje = (arancel.adValorem * 100).toFixed(1);
        infoEl.textContent = `Ad Valorem: ${porcentaje}% - ${arancel.descripcion}`;
        infoEl.style.color = '#10b981';
    } else {
        infoEl.textContent = `Código no encontrado - usando promedio: 11%`;
        infoEl.style.color = '#f59e0b';
    }
    
    calcular();
}

// ===== MAIN CALCULATION ENGINE =====
function calcular() {
    // 1. GET VALUES
    const costoCompra = parseFloat(document.getElementById('costoCompra').value) || 0;
    const packaging = parseFloat(document.getElementById('packaging').value) || 0;
    const logistica = parseFloat(document.getElementById('logistica').value) || 0;
    const merma = parseFloat(document.getElementById('merma').value) || 0;
    const precioVenta = parseFloat(document.getElementById('precioVenta').value) || 0;
    const metaGanancia = parseFloat(document.getElementById('metaGanancia').value) || 0;
    
    const pasarelaKey = document.getElementById('pasarela').value;
    const regimenKey = document.getElementById('regimen').value;
    const esImportado = document.getElementById('esImportado').checked;
    
    // 2. IMPORT COSTS
    let costoImportacion = 0;
    if (esImportado) {
        const codigo = document.getElementById('codigoHS').value.trim();
        const arancel = ARANCELES[codigo] || { adValorem: 0.11 };
        costoImportacion = costoCompra * arancel.adValorem;
    }
    
    // 3. TOTAL COST
    const costoBase = costoCompra + packaging + logistica + costoImportacion;
    const costoMerma = costoBase * (merma / 100);
    const costoTotalUnitario = costoBase + costoMerma;
    
    document.getElementById('costoTotalUnitario').textContent = formatearMonedaPais(costoTotalUnitario, paisActual);
    
    // 4. PAYMENT GATEWAY COMMISSION
    const pasarela = configPais.pasarelas[pasarelaKey];
    let comisionPasarela = (precioVenta * pasarela.comision) + pasarela.fijo;
    
    if (pasarela.aplicaIVA) {
        comisionPasarela = comisionPasarela * (1 + configPais.iva);
    }
    
    document.getElementById('comisionPasarela').textContent = formatearMonedaPais(comisionPasarela, paisActual);
    const porcentajeComision = precioVenta > 0 ? (comisionPasarela / precioVenta * 100) : 0;
    document.getElementById('detallePasarela').textContent = `${porcentajeComision.toFixed(2)}% del precio`;
    
    // 5. TAXES
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
    
    // 6. PROFIT CALCULATIONS
    const gananciaBruta = precioVenta - costoTotalUnitario;
    const totalCostos = costoTotalUnitario + comisionPasarela + totalImpuestos;
    const gananciaNeta = precioVenta - totalCostos;
    
    document.getElementById('gananciaBruta').textContent = formatearMonedaPais(gananciaBruta, paisActual);
    document.getElementById('totalCostos').textContent = formatearMonedaPais(totalCostos, paisActual);
    document.getElementById('gananciaNeta').textContent = formatearMonedaPais(gananciaNeta, paisActual);
    document.getElementById('enBolsillo').textContent = formatearMonedaPais(gananciaNeta, paisActual);
    
    // 7. NET MARGIN
    const margenNeto = precioVenta > 0 ? (gananciaNeta / precioVenta * 100) : 0;
    
    // 8. TRAFFIC LIGHT
    actualizarSemaforo(margenNeto);
    
    // 9. MULTI-CURRENCY DISPLAY
    actualizarMultiCurrency(gananciaNeta);
    
    // 10. REVERSE PROFIT ENGINEERING
    calcularReverseProfitEngineering(gananciaNeta, metaGanancia, costoTotalUnitario);
    
    // 11. BREAK-EVEN CHART
    actualizarGraficoBreakeven(costoTotalUnitario, gananciaNeta, precioVenta);
    
    // 12. UPDATE FISCAL INFO
    actualizarInfoFiscal();
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
    
    card.className = 'obsidian-card p-8 slide-in traffic-light-container ' + estado.class;
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
    
    // Calculate units needed
    const unidadesRequeridas = Math.ceil(metaGanancia / gananciaNetaActual);
    const ventasDiarias = (unidadesRequeridas / CALCULOS.diasLaborablesMes).toFixed(1);
    
    document.getElementById('unidadesRequeridas').textContent = unidadesRequeridas.toLocaleString('es');
    document.getElementById('ventasDiarias').textContent = `≈ ${ventasDiarias} ventas/día`;
    
    // Calculate minimum suggested price
    const precioActual = parseFloat(document.getElementById('precioVenta').value) || 0;
    const margenActual = precioActual > 0 ? (gananciaNetaActual / precioActual) : 0;
    
    if (margenActual > 0) {
        const ventasMensualesActuales = metaGanancia / gananciaNetaActual;
        const precioSugerido = costoTotal / (1 - margenActual);
        document.getElementById('precioSugerido').textContent = formatearMonedaPais(precioSugerido, paisActual);
    } else {
        document.getElementById('precioSugerido').textContent = formatearMonedaPais(costoTotal * 1.5, paisActual);
    }
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
                    label: 'Costos Totales',
                    data: costos,
                    borderColor: '#dc2626',
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'Ventas Brutas',
                    data: ventas,
                    borderColor: '#06b6d4',
                    backgroundColor: 'rgba(6, 182, 212, 0.1)',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'Ganancia Neta',
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
                    labels: { color: '#e2e8f0', font: { size: 11 } }
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
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                },
                x: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                }
            }
        }
    });
    
    // Calculate break-even
    const breakeven = costoTotal > 0 ? Math.ceil(costoTotal / (precioVenta - costoTotal)) : 0;
    document.getElementById('unidadesBreakeven').textContent = breakeven;
}

// ===== PENTAGON INTEGRATION =====
async function verificarConexionesPentagon() {
    const links = window.PENTAGON_LINKS;
    
    // Update navigation links
    document.getElementById('linkSueldoPro').href = links.sueldopro;
    document.getElementById('linkLiquidez').href = links.liquidez;
    document.getElementById('linkLeadTarget').href = links.leadtarget;
    document.getElementById('linkWealth').href = links.wealth;
    
    // Check if we can fetch data (this would require CORS support from other apps)
    // For now, we just show "ready to sync"
    document.getElementById('syncSueldoPro').textContent = 'Listo para sincronizar';
    document.getElementById('syncLeadTarget').textContent = 'Listo para sincronizar';
    document.getElementById('syncLiquidez').textContent = 'Listo para sincronizar';
    document.getElementById('syncWealth').textContent = 'Listo para sincronizar';
}

// ===== SIMULATOR FUNCTIONS =====
function simularCambio(porcentaje) {
    const precioActual = parseFloat(document.getElementById('precioVenta').value) || 0;
    const nuevoPrecio = precioActual * (1 + porcentaje / 100);
    document.getElementById('precioVenta').value = nuevoPrecio.toFixed(2);
    calcular();
    mostrarNotificacion(`Precio ${porcentaje > 0 ? 'aumentado' : 'reducido'} en ${Math.abs(porcentaje)}%`);
}

function resetearValores() {
    document.getElementById('costoCompra').value = 100.00;
    document.getElementById('packaging').value = 10.00;
    document.getElementById('logistica').value = 15.00;
    document.getElementById('merma').value = 5;
    document.getElementById('precioVenta').value = 250.00;
    document.getElementById('metaGanancia').value = 10000;
    document.getElementById('esImportado').checked = false;
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
        background: ${tipo === 'success' ? '#10b981' : tipo === 'warning' ? '#f59e0b' : '#06b6d4'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.75rem;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        z-index: 9999;
        font-weight: 600;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notif);
    setTimeout(() => {
        notif.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// Add animation styles
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

console.log('✓ MarginAxis Global Engine loaded');
console.log('🌍 Multi-country system active');
console.log('💱 Real-time Forex enabled');
console.log('⬡ Pentagon Bridge connected');