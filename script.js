/* ========================================
   MARGINMASTER PRO ULTRA - SCRIPT PRINCIPAL
   IA Predictiva + APIs Avanzadas + Multipaís
   Golden Commerce Ecosystem v2.0
   ======================================== */

// ===== VARIABLES GLOBALES =====
let chartBreakeven = null;
let paisActual = getPaisActual();
let configPais = getConfigPais(paisActual);
let productosGuardados = [];

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 MarginMaster Pro Ultra iniciando...');
    
    // Cargar país guardado
    cargarPaisGuardado();
    
    // Cargar productos guardados
    cargarProductosGuardados();
    
    // Cargar tipo de cambio
    cargarTipoCambio();
    
    // Simular variación de commodities
    simularVariacionCommodities();
    
    // Configurar eventos
    configurarEventos();
    
    // Cálculo inicial
    calcular();
    
    console.log('✓ MarginMaster Pro Ultra listo');
});

// ===== CONFIGURAR EVENTOS =====
function configurarEventos() {
    // País selector
    document.getElementById('paisSelector').addEventListener('change', cambiarPais);
    
    // Inputs del escandallo
    document.getElementById('nombreProducto').addEventListener('input', calcular);
    document.getElementById('costoCompra').addEventListener('input', calcular);
    document.getElementById('packaging').addEventListener('input', calcular);
    document.getElementById('envio').addEventListener('input', calcular);
    document.getElementById('merma').addEventListener('input', calcular);
    
    // Toggle importación
    document.getElementById('esImportado').addEventListener('change', toggleImportacion);
    document.getElementById('partidaArancelaria').addEventListener('input', buscarArancel);
    
    // Precio de venta
    document.getElementById('precioVenta').addEventListener('input', calcular);
    
    // Selectores
    document.getElementById('pasarela').addEventListener('change', calcular);
    document.getElementById('regimen').addEventListener('change', calcular);
    
    // The Bridge
    document.getElementById('sueldoDeseado').addEventListener('input', calcular);
}

// ===== CAMBIAR PAÍS =====
function cambiarPais() {
    paisActual = document.getElementById('paisSelector').value;
    configPais = getConfigPais(paisActual);
    
    // Guardar preferencia
    localStorage.setItem(STORAGE_KEYS.paisActual, paisActual);
    
    // Actualizar UI
    actualizarPasarelasPorPais();
    actualizarRegimenesPorPais();
    actualizarLabelIVA();
    cargarTipoCambio();
    
    // Recalcular
    calcular();
    
    mostrarNotificacion(`Cambiado a ${configPais.nombre}`, 'success');
}

// ===== CARGAR PAÍS GUARDADO =====
function cargarPaisGuardado() {
    document.getElementById('paisSelector').value = paisActual;
    actualizarPasarelasPorPais();
    actualizarRegimenesPorPais();
    actualizarLabelIVA();
}

// ===== ACTUALIZAR PASARELAS POR PAÍS =====
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

// ===== ACTUALIZAR REGÍMENES POR PAÍS =====
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

// ===== ACTUALIZAR LABEL IVA =====
function actualizarLabelIVA() {
    document.getElementById('labelIVA').textContent = `${configPais.nombreIVA} (${(configPais.iva * 100).toFixed(0)}%)`;
}

// ===== TOGGLE IMPORTACIÓN =====
function toggleImportacion() {
    const esImportado = document.getElementById('esImportado').checked;
    document.getElementById('seccionImportacion').style.display = esImportado ? 'block' : 'none';
    
    if (esImportado) {
        buscarArancel();
    }
    calcular();
}

// ===== BUSCAR ARANCEL =====
function buscarArancel() {
    const partida = document.getElementById('partidaArancelaria').value.trim();
    const infoEl = document.getElementById('infoArancel');
    
    if (!partida) {
        infoEl.textContent = 'Ingresa una partida arancelaria';
        return;
    }
    
    const arancel = ARANCELES[partida];
    
    if (arancel) {
        const porcentaje = (arancel.adValorem * 100).toFixed(1);
        infoEl.textContent = `Ad Valorem: ${porcentaje}% - ${arancel.descripcion}`;
        infoEl.style.color = '#10b981';
    } else {
        infoEl.textContent = `Partida no encontrada - usando Ad Valorem promedio: 11%`;
        infoEl.style.color = '#f59e0b';
    }
    
    calcular();
}

// ===== CALCULAR ENVÍO REAL (SIMULACIÓN) =====
function calcularEnvioReal() {
    // En producción, esto usaría Google Maps Distance Matrix API
    const distanciaSimulada = Math.floor(Math.random() * 30) + 5; // 5-35 km
    const costoCalculado = CALCULOS.costoBase + (distanciaSimulada * CALCULOS.costoPorKm);
    
    document.getElementById('envio').value = costoCalculado.toFixed(2);
    document.getElementById('infoEnvio').textContent = `Calculado: ${distanciaSimulada}km a ${configPais.simbolo}${CALCULOS.costoPorKm}/km`;
    document.getElementById('infoEnvio').style.color = '#10b981';
    
    calcular();
    mostrarNotificacion(`Envío calculado: ${distanciaSimulada}km`, 'success');
}

// ===== CARGAR TIPO DE CAMBIO =====
async function cargarTipoCambio() {
    try {
        const response = await fetch(API.tipoCambio);
        const data = await response.json();
        
        const monedaLocal = configPais.moneda;
        let tipoCambio = API.tipoCambioDefault[paisActual];
        
        if (data.rates && data.rates[monedaLocal]) {
            tipoCambio = data.rates[monedaLocal];
        }
        
        document.getElementById('tipoCambio').textContent = `${configPais.simbolo} ${tipoCambio.toFixed(2)}`;
        document.getElementById('fechaTipoCambio').textContent = `Actualizado: ${new Date().toLocaleDateString('es')}`;
    } catch (error) {
        console.warn('⚠️ No se pudo cargar el tipo de cambio');
        const tipoCambio = API.tipoCambioDefault[paisActual];
        document.getElementById('tipoCambio').textContent = `${configPais.simbolo} ${tipoCambio.toFixed(2)}`;
        document.getElementById('fechaTipoCambio').textContent = 'Offline';
    }
}

// ===== FUNCIÓN PRINCIPAL DE CÁLCULO =====
function calcular() {
    // 1. OBTENER VALORES
    const costoCompra = parseFloat(document.getElementById('costoCompra').value) || 0;
    const packaging = parseFloat(document.getElementById('packaging').value) || 0;
    const envio = parseFloat(document.getElementById('envio').value) || 0;
    const merma = parseFloat(document.getElementById('merma').value) || 0;
    const precioVenta = parseFloat(document.getElementById('precioVenta').value) || 0;
    const sueldoDeseado = parseFloat(document.getElementById('sueldoDeseado').value) || 0;
    
    const pasarelaKey = document.getElementById('pasarela').value;
    const regimenKey = document.getElementById('regimen').value;
    const esImportado = document.getElementById('esImportado').checked;
    
    // 2. CALCULAR COSTO DE IMPORTACIÓN
    let costoImportacion = 0;
    if (esImportado) {
        const partida = document.getElementById('partidaArancelaria').value.trim();
        const arancel = ARANCELES[partida] || { adValorem: 0.11 }; // Default 11%
        costoImportacion = costoCompra * arancel.adValorem;
    }
    
    // 3. CALCULAR COSTO TOTAL
    const costoBase = costoCompra + packaging + envio + costoImportacion;
    const costoMerma = costoBase * (merma / 100);
    const costoTotal = costoBase + costoMerma;
    
    document.getElementById('costoTotal').textContent = formatearMonedaPais(costoTotal, paisActual);
    
    // 4. CALCULAR COMISIÓN PASARELA
    const pasarela = configPais.pasarelas[pasarelaKey];
    let comisionPasarela = (precioVenta * pasarela.comision) + pasarela.fijo;
    
    if (pasarela.aplicaIVA) {
        comisionPasarela = comisionPasarela * (1 + configPais.iva);
    }
    
    document.getElementById('comisionPasarela').textContent = formatearMonedaPais(comisionPasarela, paisActual);
    const porcentajeReal = precioVenta > 0 ? (comisionPasarela / precioVenta * 100) : 0;
    document.getElementById('detallePasarela').textContent = `${porcentajeReal.toFixed(2)}% del precio`;
    
    // 5. CALCULAR IMPUESTOS
    const regimen = configPais.regimenes[regimenKey];
    let ivaMonto = 0;
    let rentaMonto = 0;
    
    if (regimen.aplicaIVA) {
        ivaMonto = precioVenta * configPais.iva;
    }
    
    const gananciaBrutaParaRenta = precioVenta - costoTotal - comisionPasarela;
    if (gananciaBrutaParaRenta > 0) {
        rentaMonto = gananciaBrutaParaRenta * regimen.tasaRenta;
    }
    
    const totalImpuestos = ivaMonto + rentaMonto;
    
    document.getElementById('igv').textContent = formatearMonedaPais(ivaMonto, paisActual);
    document.getElementById('renta').textContent = formatearMonedaPais(rentaMonto, paisActual);
    document.getElementById('totalImpuestos').textContent = formatearMonedaPais(totalImpuestos, paisActual);
    
    // 6. CALCULAR GANANCIAS
    const gananciaBruta = precioVenta - costoTotal;
    const totalCostos = costoTotal + comisionPasarela + totalImpuestos;
    const gananciaNeta = precioVenta - totalCostos;
    
    document.getElementById('gananciaBruta').textContent = formatearMonedaPais(gananciaBruta, paisActual);
    document.getElementById('totalCostos').textContent = formatearMonedaPais(totalCostos, paisActual);
    document.getElementById('gananciaNeta').textContent = formatearMonedaPais(gananciaNeta, paisActual);
    document.getElementById('enBolsillo').textContent = formatearMonedaPais(gananciaNeta, paisActual);
    
    // 7. MARGEN NETO
    const margenNeto = precioVenta > 0 ? (gananciaNeta / precioVenta * 100) : 0;
    
    // 8. SEMÁFORO
    actualizarSemaforo(margenNeto);
    
    // 9. THE BRIDGE
    const unidadesNecesarias = gananciaNeta > 0 ? Math.ceil(sueldoDeseado / gananciaNeta) : 0;
    const ventasDiarias = unidadesNecesarias > 0 ? (unidadesNecesarias / CALCULOS.diasLaborablesMes).toFixed(1) : 0;
    
    document.getElementById('unidadesNecesarias').textContent = unidadesNecesarias.toLocaleString('es');
    document.getElementById('ventasDiarias').textContent = `≈ ${ventasDiarias} ventas/día`;
    
    // 10. IA PREDICTIVA
    generarSugerenciaIA(margenNeto, gananciaNeta, precioVenta);
    
    // 11. GRÁFICO
    actualizarGraficoBreakeven(costoTotal, gananciaNeta, precioVenta);
    
    // 12. ALERTA DE COMMODITIES (SIMULACIÓN)
    verificarAlertaCommodities();
}

// ===== ACTUALIZAR SEMÁFORO =====
function actualizarSemaforo(margenNeto) {
    const card = document.getElementById('semaforoCard');
    const icono = document.getElementById('semaforoIcono');
    const display = document.getElementById('margenNeto');
    const mensaje = document.getElementById('semaforoMensaje');
    
    let estado;
    if (margenNeto < SEMAFORO.rojo.max) estado = SEMAFORO.rojo;
    else if (margenNeto < SEMAFORO.naranja.max) estado = SEMAFORO.naranja;
    else estado = SEMAFORO.verde;
    
    card.className = 'glass-card rounded-3xl p-8 slide-in semaforo-container ' + estado.clase;
    icono.textContent = estado.icono;
    display.textContent = `${margenNeto.toFixed(1)}%`;
    display.style.color = estado.color;
    mensaje.textContent = estado.mensaje;
}

// ===== GENERAR SUGERENCIA IA =====
function generarSugerenciaIA(margen, ganancia, precio) {
    const sugerencia = SUGERENCIAS_IA.find(s => s.condicion(margen));
    const texto = sugerencia ? sugerencia.mensaje.replace('{margen}', margen.toFixed(1)) : 'Calculando estrategia...';
    
    document.getElementById('textoIA').textContent = texto;
}

// ===== ACTUALIZAR GRÁFICO =====
function actualizarGraficoBreakeven(costoTotal, gananciaNeta, precioVenta) {
    const ctx = document.getElementById('chartBreakeven').getContext('2d');
    
    if (chartBreakeven) chartBreakeven.destroy();
    
    const unidades = Array.from({length: 20}, (_, i) => i + 1);
    const costos = unidades.map(u => costoTotal * u);
    const ganancias = unidades.map(u => gananciaNeta * u);
    const ventas = unidades.map(u => precioVenta * u);
    
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
                    label: 'Ganancia Neta',
                    data: ganancias,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'Ventas Brutas',
                    data: ventas,
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    borderDash: [5, 5]
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
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleColor: '#f59e0b',
                    bodyColor: '#e2e8f0',
                    callbacks: {
                        label: (ctx) => ctx.dataset.label + ': ' + formatearMonedaPais(ctx.parsed.y, paisActual)
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#94a3b8',
                        callback: (val) => formatearMonedaPais(val, paisActual)
                    },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                },
                x: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: 'rgba(148, 163, 184, 0.1)' }
                }
            }
        }
    });
}

// ===== VERIFICAR ALERTA COMMODITIES =====
function verificarAlertaCommodities() {
    const alertaDiv = document.getElementById('alertaCommodity');
    const mensajeDiv = document.getElementById('mensajeCommodity');
    
    // Simulación: verificar si hay variaciones significativas
    const commoditiesAlerta = Object.values(COMMODITIES).filter(c => Math.abs(c.variacion) > 3);
    
    if (commoditiesAlerta.length > 0) {
        const commodity = commoditiesAlerta[0];
        const signo = commodity.variacion > 0 ? '+' : '';
        mensajeDiv.textContent = `${commodity.nombre} ${signo}${commodity.variacion}% - Tu margen podría estar en riesgo`;
        alertaDiv.style.display = 'block';
    } else {
        alertaDiv.style.display = 'none';
    }
}

// ===== ANALIZADOR DE COMBOS =====
function calcularCombo() {
    const cantidad = parseInt(document.getElementById('cantidadCombo').value) || 3;
    const descuento = parseFloat(document.getElementById('descuentoCombo').value) || 15;
    const precioUnitario = parseFloat(document.getElementById('precioVenta').value) || 0;
    const costoTotal = parseFloat(document.getElementById('costoTotal').textContent.replace(/[^\d.,-]/g, '').replace(',', '.')) || 0;
    
    const precioCombo = (precioUnitario * cantidad) * (1 - descuento / 100);
    const costoCombo = costoTotal * cantidad;
    const gananciaCombo = precioCombo - costoCombo;
    const margenCombo = precioCombo > 0 ? (gananciaCombo / precioCombo * 100) : 0;
    
    document.getElementById('resultadoCombo').style.display = 'block';
    document.getElementById('margenCombo').textContent = `${margenCombo.toFixed(1)}%`;
    document.getElementById('detalleCombo').textContent = 
        `Combo: ${formatearMonedaPais(precioCombo, paisActual)} | Ganancia: ${formatearMonedaPais(gananciaCombo, paisActual)}`;
}

// ===== MODO COMPETENCIA INFERNAL =====
function analizarCompetencia() {
    const precioCompetencia = parseFloat(document.getElementById('precioCompetencia').value) || 0;
    const precioActual = parseFloat(document.getElementById('precioVenta').value) || 0;
    const costoTotal = parseFloat(document.getElementById('costoTotal').textContent.replace(/[^\d.,-]/g, '').replace(',', '.')) || 0;
    
    if (precioCompetencia === 0) {
        mostrarNotificacion('Ingresa el precio del competidor', 'warning');
        return;
    }
    
    const diferencia = precioActual - precioCompetencia;
    const porcentajeDif = precioActual > 0 ? (diferencia / precioActual * 100) : 0;
    const reduccionNecesaria = precioActual - precioCompetencia;
    const reduccionCostos = reduccionNecesaria > 0 ? (reduccionNecesaria / costoTotal * 100) : 0;
    
    let mensaje = '';
    
    if (diferencia > 0) {
        mensaje = `🔥 Estás ${Math.abs(porcentajeDif).toFixed(1)}% MÁS CARO. Para igualar su precio (${formatearMonedaPais(precioCompetencia, paisActual)}), necesitas: 
        1) Reducir costos en ${Math.abs(reduccionCostos).toFixed(1)}%, O 
        2) Cambiar a pasarela gratuita (Efectivo/Yape), O 
        3) Justificar tu valor premium con branding.`;
    } else if (diferencia < 0) {
        mensaje = `💪 Estás ${Math.abs(porcentajeDif).toFixed(1)}% MÁS BARATO. ¡Tienes ventaja competitiva! Considera subir tu precio para maximizar margen.`;
    } else {
        mensaje = `⚡ Mismo precio que la competencia. Diferénciate con envío gratis, mejor servicio o combos.`;
    }
    
    document.getElementById('resultadoCompetencia').textContent = mensaje;
    document.getElementById('resultadoCompetencia').style.display = 'block';
}

// ===== GUARDAR PRODUCTO =====
function guardarProducto() {
    const producto = {
        id: Date.now(),
        nombre: document.getElementById('nombreProducto').value || 'Sin nombre',
        precioVenta: parseFloat(document.getElementById('precioVenta').value) || 0,
        costoTotal: parseFloat(document.getElementById('costoTotal').textContent.replace(/[^\d.,-]/g, '').replace(',', '.')) || 0,
        margen: parseFloat(document.getElementById('margenNeto').textContent.replace('%', '')) || 0,
        pais: paisActual,
        fecha: new Date().toISOString()
    };
    
    productosGuardados.push(producto);
    localStorage.setItem(STORAGE_KEYS.productos, JSON.stringify(productosGuardados));
    
    renderizarProductosGuardados();
    mostrarNotificacion('Producto guardado correctamente', 'success');
}

// ===== CARGAR PRODUCTOS GUARDADOS =====
function cargarProductosGuardados() {
    const stored = localStorage.getItem(STORAGE_KEYS.productos);
    if (stored) {
        productosGuardados = JSON.parse(stored);
        renderizarProductosGuardados();
    }
}

// ===== RENDERIZAR PRODUCTOS GUARDADOS =====
function renderizarProductosGuardados() {
    const container = document.getElementById('productosGuardados');
    
    if (productosGuardados.length === 0) {
        container.innerHTML = '<div class="text-xs text-slate-500">No hay productos guardados</div>';
        return;
    }
    
    container.innerHTML = productosGuardados.map(p => `
        <div class="producto-chip">
            <span>${p.nombre} - ${p.margen.toFixed(1)}%</span>
            <button class="delete-btn" onclick="eliminarProducto(${p.id})">✕</button>
        </div>
    `).join('');
}

// ===== ELIMINAR PRODUCTO =====
function eliminarProducto(id) {
    productosGuardados = productosGuardados.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.productos, JSON.stringify(productosGuardados));
    renderizarProductosGuardados();
    mostrarNotificacion('Producto eliminado', 'success');
}

// ===== NUEVO PRODUCTO =====
function nuevoProducto() {
    document.getElementById('nombreProducto').value = 'Nuevo Producto';
    resetearValores();
}

// ===== SIMULADOR =====
function simularCambio(porcentaje) {
    const precioActual = parseFloat(document.getElementById('precioVenta').value) || 0;
    const nuevoPrecio = precioActual * (1 + porcentaje / 100);
    document.getElementById('precioVenta').value = nuevoPrecio.toFixed(2);
    calcular();
    mostrarNotificacion(`Precio ${porcentaje > 0 ? 'aumentado' : 'reducido'} en ${Math.abs(porcentaje)}%`);
}

function cambiarPasarela(index) {
    const pasarelas = Object.keys(configPais.pasarelas);
    document.getElementById('pasarela').value = pasarelas[index] || pasarelas[0];
    calcular();
    mostrarNotificacion(`Cambiado a ${configPais.pasarelas[pasarelas[index]].nombre}`);
}

function resetearValores() {
    document.getElementById('costoCompra').value = 50.00;
    document.getElementById('packaging').value = 5.00;
    document.getElementById('envio').value = 8.00;
    document.getElementById('merma').value = 5;
    document.getElementById('precioVenta').value = 120.00;
    document.getElementById('sueldoDeseado').value = 3000;
    document.getElementById('esImportado').checked = false;
    toggleImportacion();
    calcular();
    mostrarNotificacion('Valores reseteados');
}

// ===== EXPORTAR TICKET =====
function exportarTicket() {
    const producto = document.getElementById('nombreProducto').value || 'Mi Producto';
    const precio = document.getElementById('precioVenta').value;
    const costo = document.getElementById('costoTotal').textContent;
    const margen = document.getElementById('margenNeto').textContent;
    const ganancia = document.getElementById('gananciaNeta').textContent;
    
    const ticket = `
━━━━━━━━━━━━━━━━━━━━━━━━━
💰 MARGINMASTER PRO ULTRA
   Ticket de Rentabilidad
━━━━━━━━━━━━━━━━━━━━━━━━━

📦 PRODUCTO: ${producto}
🌎 MERCADO: ${configPais.nombre}
📅 FECHA: ${new Date().toLocaleDateString('es')}

💵 PRECIO DE VENTA: ${formatearMonedaPais(parseFloat(precio), paisActual)}
💎 COSTO TOTAL: ${costo}
📊 MARGEN NETO: ${margen}
✨ GANANCIA NETA: ${ganancia}

━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 MarginMaster Pro Ultra v2.0
   Golden Commerce Ecosystem
━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();
    
    navigator.clipboard.writeText(ticket).then(() => {
        mostrarNotificacion('✓ Ticket copiado al portapapeles', 'success');
    }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = ticket;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        mostrarNotificacion('✓ Ticket copiado', 'success');
    });
}

// ===== NOTIFICACIONES =====
function mostrarNotificacion(mensaje, tipo = 'info') {
    const notif = document.createElement('div');
    notif.textContent = mensaje;
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${tipo === 'success' ? '#10b981' : tipo === 'warning' ? '#f59e0b' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.75rem;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
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

console.log('✓ Script.js Ultra cargado completamente');
console.log('🌎 Sistema multipaís activado');
console.log('🤖 IA predictiva activada');
console.log('💾 Sistema de persistencia activado');