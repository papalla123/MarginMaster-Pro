/* ========================================
   MARGINMASTER PRO - SCRIPT PRINCIPAL
   Lógica reactiva y motor de cálculos
   Golden Commerce Ecosystem
   ======================================== */

// ===== VARIABLES GLOBALES =====
let chartBreakeven = null;
let tipoCambioActual = API.tipoCambioDefault;

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 MarginMaster Pro iniciando...');
    
    // Cargar tipo de cambio
    cargarTipoCambio();
    
    // Configurar eventos de inputs reactivos
    configurarEventos();
    
    // Cálculo inicial
    calcular();
    
    console.log('✓ MarginMaster Pro listo');
});

// ===== CONFIGURAR EVENTOS =====
function configurarEventos() {
    // Inputs del escandallo
    document.getElementById('costoCompra').addEventListener('input', calcular);
    document.getElementById('packaging').addEventListener('input', calcular);
    document.getElementById('envio').addEventListener('input', calcular);
    document.getElementById('merma').addEventListener('input', calcular);
    
    // Precio de venta
    document.getElementById('precioVenta').addEventListener('input', calcular);
    
    // Selectores
    document.getElementById('pasarela').addEventListener('change', calcular);
    document.getElementById('regimen').addEventListener('change', calcular);
    
    // The Bridge
    document.getElementById('sueldoDeseado').addEventListener('input', calcular);
}

// ===== CARGAR TIPO DE CAMBIO DESDE API =====
async function cargarTipoCambio() {
    try {
        const response = await fetch(API.tipoCambio);
        const data = await response.json();
        
        if (data.rates && data.rates.PEN) {
            tipoCambioActual = data.rates.PEN;
            document.getElementById('tipoCambio').textContent = `S/ ${tipoCambioActual.toFixed(2)}`;
            document.getElementById('fechaTipoCambio').textContent = `Actualizado: ${new Date().toLocaleDateString('es-PE')}`;
        }
    } catch (error) {
        console.warn('⚠️ No se pudo cargar el tipo de cambio, usando valor por defecto');
        document.getElementById('tipoCambio').textContent = `S/ ${tipoCambioActual.toFixed(2)}`;
        document.getElementById('fechaTipoCambio').textContent = 'Offline';
    }
}

// ===== FUNCIÓN PRINCIPAL DE CÁLCULO =====
function calcular() {
    // 1. OBTENER VALORES DE INPUTS
    const costoCompra = parseFloat(document.getElementById('costoCompra').value) || 0;
    const packaging = parseFloat(document.getElementById('packaging').value) || 0;
    const envio = parseFloat(document.getElementById('envio').value) || 0;
    const merma = parseFloat(document.getElementById('merma').value) || 0;
    const precioVenta = parseFloat(document.getElementById('precioVenta').value) || 0;
    const sueldoDeseado = parseFloat(document.getElementById('sueldoDeseado').value) || 0;
    
    const pasarelaSeleccionada = document.getElementById('pasarela').value;
    const regimenSeleccionado = document.getElementById('regimen').value;
    
    // 2. CALCULAR COSTO TOTAL UNITARIO (con merma)
    const costoBase = costoCompra + packaging + envio;
    const costoMerma = costoBase * (merma / 100);
    const costoTotal = costoBase + costoMerma;
    
    // Actualizar display de costo total
    document.getElementById('costoTotal').textContent = formatearMoneda(costoTotal);
    
    // 3. CALCULAR COMISIÓN DE PASARELA
    const pasarela = PASARELAS[pasarelaSeleccionada];
    let comisionPasarela = (precioVenta * pasarela.comision) + pasarela.fijo;
    
    // Si la pasarela aplica IGV sobre su comisión
    if (pasarela.aplicaIGV) {
        comisionPasarela = comisionPasarela * (1 + IGV);
    }
    
    // Actualizar display de comisión
    document.getElementById('comisionPasarela').textContent = formatearMoneda(comisionPasarela);
    const porcentajeReal = precioVenta > 0 ? (comisionPasarela / precioVenta * 100) : 0;
    document.getElementById('detallePasarela').textContent = `${porcentajeReal.toFixed(2)}% del precio`;
    
    // 4. CALCULAR IMPUESTOS SUNAT
    const regimen = REGIMENES[regimenSeleccionado];
    let igvMonto = 0;
    let rentaMonto = 0;
    
    if (regimen.aplicaIGV) {
        // El IGV se calcula sobre el precio de venta
        igvMonto = precioVenta * IGV;
    }
    
    // La renta depende del régimen
    if (regimenSeleccionado === 'rus' || regimenSeleccionado === 'rer') {
        // RUS y RER: sobre ingresos brutos
        rentaMonto = precioVenta * regimen.tasaRenta;
    } else {
        // MYPE y General: sobre utilidad (ganancia bruta)
        const gananciaBrutaParaRenta = precioVenta - costoTotal - comisionPasarela;
        if (gananciaBrutaParaRenta > 0) {
            rentaMonto = gananciaBrutaParaRenta * regimen.tasaRenta;
        }
    }
    
    const totalImpuestos = igvMonto + rentaMonto;
    
    // Actualizar displays de impuestos
    document.getElementById('igv').textContent = formatearMoneda(igvMonto);
    document.getElementById('renta').textContent = formatearMoneda(rentaMonto);
    document.getElementById('totalImpuestos').textContent = formatearMoneda(totalImpuestos);
    
    // 5. CALCULAR GANANCIAS
    const gananciaBruta = precioVenta - costoTotal;
    const totalCostos = costoTotal + comisionPasarela + totalImpuestos;
    const gananciaNeta = precioVenta - totalCostos;
    const enBolsillo = gananciaNeta; // Lo que realmente queda
    
    // Actualizar displays de ganancias
    document.getElementById('gananciaBruta').textContent = formatearMoneda(gananciaBruta);
    document.getElementById('totalCostos').textContent = formatearMoneda(totalCostos);
    document.getElementById('gananciaNeta').textContent = formatearMoneda(gananciaNeta);
    document.getElementById('enBolsillo').textContent = formatearMoneda(enBolsillo);
    
    // 6. CALCULAR MARGEN NETO (%)
    const margenNeto = precioVenta > 0 ? (gananciaNeta / precioVenta * 100) : 0;
    
    // 7. ACTUALIZAR SEMÁFORO DE RENTABILIDAD
    actualizarSemaforo(margenNeto);
    
    // 8. THE BRIDGE - Calcular unidades necesarias para sueldo
    const unidadesNecesarias = gananciaNeta > 0 
        ? Math.ceil(sueldoDeseado / gananciaNeta) 
        : 0;
    
    const ventasDiarias = unidadesNecesarias > 0 
        ? (unidadesNecesarias / CALCULOS.diasLaborablesMes).toFixed(1)
        : 0;
    
    document.getElementById('unidadesNecesarias').textContent = unidadesNecesarias.toLocaleString('es-PE');
    document.getElementById('ventasDiarias').textContent = `≈ ${ventasDiarias} ventas/día`;
    
    // 9. ACTUALIZAR GRÁFICO DE PUNTO DE EQUILIBRIO
    const unidadesBreakeven = gananciaNeta > 0 ? 1 : 0; // Simplificado para este MVP
    document.getElementById('unidadesBreakeven').textContent = unidadesBreakeven;
    actualizarGraficoBreakeven(costoTotal, gananciaNeta, precioVenta);
}

// ===== ACTUALIZAR SEMÁFORO =====
function actualizarSemaforo(margenNeto) {
    const semaforoCard = document.getElementById('semaforoCard');
    const semaforoIcono = document.getElementById('semaforoIcono');
    const margenNetoDisplay = document.getElementById('margenNeto');
    const semaforoMensaje = document.getElementById('semaforoMensaje');
    
    let estado;
    
    if (margenNeto < SEMAFORO.rojo.max) {
        estado = SEMAFORO.rojo;
    } else if (margenNeto < SEMAFORO.naranja.max) {
        estado = SEMAFORO.naranja;
    } else {
        estado = SEMAFORO.verde;
    }
    
    // Actualizar clases
    semaforoCard.className = 'glass-card rounded-3xl p-8 slide-in semaforo-container ' + estado.clase;
    
    // Actualizar contenido
    semaforoIcono.textContent = estado.icono;
    margenNetoDisplay.textContent = `${margenNeto.toFixed(1)}%`;
    margenNetoDisplay.style.color = estado.color;
    semaforoMensaje.textContent = estado.mensaje;
}

// ===== ACTUALIZAR GRÁFICO DE BREAK-EVEN =====
function actualizarGraficoBreakeven(costoTotal, gananciaNeta, precioVenta) {
    const ctx = document.getElementById('chartBreakeven').getContext('2d');
    
    // Destruir gráfico anterior si existe
    if (chartBreakeven) {
        chartBreakeven.destroy();
    }
    
    // Generar datos para el gráfico
    const unidades = Array.from({length: 20}, (_, i) => i + 1);
    const costos = unidades.map(u => costoTotal * u);
    const ingresos = unidades.map(u => gananciaNeta * u);
    const ventasBrutas = unidades.map(u => precioVenta * u);
    
    // Crear nuevo gráfico
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
                    label: 'Ganancia Neta Acumulada',
                    data: ingresos,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'Ventas Brutas',
                    data: ventasBrutas,
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
                    display: true,
                    labels: {
                        color: '#e2e8f0',
                        font: {
                            size: 11
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleColor: '#f59e0b',
                    bodyColor: '#e2e8f0',
                    borderColor: '#f59e0b',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': S/ ' + context.parsed.y.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#94a3b8',
                        callback: function(value) {
                            return 'S/ ' + value.toFixed(0);
                        }
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#94a3b8'
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                    },
                    title: {
                        display: true,
                        text: 'Unidades Vendidas',
                        color: '#f59e0b'
                    }
                }
            }
        }
    });
}

// ===== SIMULADOR: CAMBIAR PRECIO =====
function simularCambio(porcentaje) {
    const precioActual = parseFloat(document.getElementById('precioVenta').value) || 0;
    const nuevoPrecio = precioActual * (1 + porcentaje / 100);
    document.getElementById('precioVenta').value = nuevoPrecio.toFixed(2);
    calcular();
    
    // Feedback visual
    mostrarNotificacion(`Precio ${porcentaje > 0 ? 'aumentado' : 'reducido'} en ${Math.abs(porcentaje)}%`);
}

// ===== SIMULADOR: CAMBIAR PASARELA =====
function cambiarPasarela(tipoPasarela) {
    document.getElementById('pasarela').value = tipoPasarela;
    calcular();
    
    const nombrePasarela = PASARELAS[tipoPasarela].nombre;
    mostrarNotificacion(`Cambiado a ${nombrePasarela}`);
}

// ===== RESETEAR VALORES =====
function resetearValores() {
    document.getElementById('costoCompra').value = 50.00;
    document.getElementById('packaging').value = 5.00;
    document.getElementById('envio').value = 8.00;
    document.getElementById('merma').value = 5;
    document.getElementById('precioVenta').value = 120.00;
    document.getElementById('sueldoDeseado').value = 3000;
    document.getElementById('pasarela').value = 'efectivo';
    document.getElementById('regimen').value = 'rus';
    
    calcular();
    mostrarNotificacion('Valores reseteados');
}

// ===== EXPORTAR TICKET DE RENTABILIDAD =====
function exportarTicket() {
    // Obtener datos actuales
    const precioVenta = parseFloat(document.getElementById('precioVenta').value) || 0;
    const costoTotal = document.getElementById('costoTotal').textContent;
    const margenNeto = document.getElementById('margenNeto').textContent;
    const gananciaNeta = document.getElementById('gananciaNeta').textContent;
    const pasarela = document.getElementById('pasarela').options[document.getElementById('pasarela').selectedIndex].text;
    const regimen = document.getElementById('regimen').options[document.getElementById('regimen').selectedIndex].text;
    
    // Crear contenido del ticket
    const ticket = `
━━━━━━━━━━━━━━━━━━━━━━━━━
💰 MARGINMASTER PRO
   Ticket de Rentabilidad
━━━━━━━━━━━━━━━━━━━━━━━━━

📅 Fecha: ${new Date().toLocaleDateString('es-PE')}

💵 PRECIO DE VENTA
   S/ ${precioVenta.toFixed(2)}

💎 COSTO TOTAL
   ${costoTotal}

📊 MARGEN NETO
   ${margenNeto}

✨ GANANCIA NETA
   ${gananciaNeta}

💳 PASARELA
   ${pasarela}

🏛️ RÉGIMEN SUNAT
   ${regimen}

━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Golden Commerce Ecosystem
   sueldopro-2026.vercel.app
━━━━━━━━━━━━━━━━━━━━━━━━━
    `.trim();
    
    // Copiar al portapapeles
    navigator.clipboard.writeText(ticket).then(() => {
        mostrarNotificacion('✓ Ticket copiado al portapapeles', 'success');
    }).catch(() => {
        // Fallback: crear un textarea temporal
        const textarea = document.createElement('textarea');
        textarea.value = ticket;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        mostrarNotificacion('✓ Ticket copiado al portapapeles', 'success');
    });
}

// ===== MOSTRAR NOTIFICACIÓN =====
function mostrarNotificacion(mensaje, tipo = 'info') {
    // Crear elemento de notificación
    const notif = document.createElement('div');
    notif.textContent = mensaje;
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${tipo === 'success' ? '#10b981' : '#f59e0b'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.75rem;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        z-index: 9999;
        font-weight: 600;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notif);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notif.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// Agregar estilos de animación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===== FORMATEAR MONEDA =====
function formatearMoneda(valor) {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(valor);
}

// ===== FORMATEAR PORCENTAJE =====
function formatearPorcentaje(valor) {
    return new Intl.NumberFormat('es-PE', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
    }).format(valor / 100);
}

// ===== LOG DE SISTEMA =====
console.log('✓ Script.js cargado completamente');
console.log('📊 Sistema de cálculo reactivo activado');
console.log('🌉 The Bridge conectado con SueldoPro');