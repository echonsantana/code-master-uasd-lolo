// src/admin.js - VERSIÓN COMPLETA Y CORREGIDA
import BaseDatos from './baseDatos.js';

const usuarioActual = JSON.parse(sessionStorage.getItem('aero_user'));
if (!usuarioActual || usuarioActual.rol !== "admin") {
    window.location.replace("index.html");
}

const db = new BaseDatos();

// ===== ELEMENTOS DOM =====
const tablaVuelos = document.getElementById('tablaVuelos');
const tablaReservas = document.getElementById('tablaReservas');
const tablaUsuarios = document.getElementById('tablaUsuarios');
const statVuelos = document.getElementById('statVuelos');
const statReservas = document.getElementById('statReservas');
const statGanancias = document.getElementById('statGanancias');
const adminNameElement = document.getElementById('adminName');

const btnNuevoVuelo = document.getElementById('btnNuevoVuelo');
const btnNuevoUsuario = document.getElementById('btnNuevoUsuario');

const formVuelo = document.getElementById('formVuelo');
const vueloIdInput = document.getElementById('vueloId');
const busquedaInput = document.getElementById('busqueda');
const btnBuscar = document.getElementById('btnBuscar');
const btnLimpiar = document.getElementById('btnLimpiar');

// MODAL USUARIO
const modalUsuario = new bootstrap.Modal(document.getElementById('modalUsuario'));
const formUsuario = document.getElementById('formUsuario');
const usuarioIdInput = document.getElementById('usuarioId');
const nombreUsuarioInput = document.getElementById('nombreUsuario');
const emailUsuarioInput = document.getElementById('emailUsuario');
const rolUsuarioInput = document.getElementById('rolUsuario');

// ===== FUNCIONES AUXILIARES MEJORADAS =====
function showToast(msg, tipo = 'success') {
    const toastContainer = document.getElementById('toastContainer') || document.body;
    
    // Eliminar toasts anteriores
    const toastsAnteriores = document.querySelectorAll('.toast');
    toastsAnteriores.forEach(toast => toast.remove());
    
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-bg-${tipo} border-0`;
    toastEl.setAttribute('role', 'alert');
    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${msg}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toastEl);
    
    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

// ===== DIAGNÓSTICO DE DATOS =====
function diagnosticarDatos() {
    const vuelos = db.obtenerVuelos();
    const reservas = db.obtenerReservas();
    
    console.log('🔍 DIAGNÓSTICO COMPLETO DE DATOS:');
    console.log('=== VUELOS ===');
    vuelos.forEach(v => {
        console.log(`✈️ ${v.id}: ${v.origen} → ${v.destino} | $${v.precio || v.tarifa || 0} | Asientos: ${v.asientosReservados?.length || 0}/${v.asientosTotales}`);
    });
    
    console.log('=== RESERVAS ===');
    let gananciaTotal = 0;
    reservas.forEach(r => {
        const vuelo = vuelos.find(v => v.id === r.vueloId);
        const precioVuelo = vuelo ? (vuelo.precio || vuelo.tarifa || 0) : 0;
        const cantidadAsientos = r.asientos ? r.asientos.length : 1;
        const totalCalculado = precioVuelo * cantidadAsientos;
        const totalFinal = r.total || totalCalculado;
        
        if (r.estado !== 'cancelada') {
            gananciaTotal += totalFinal;
        }
        
        console.log(`📋 ${r.id}: Vuelo ${r.vueloId} | Asientos: ${r.asientos?.join(', ') || 'N/A'} | Estado: ${r.estado} | Total: $${totalFinal} | Pago: ${r.pagoEstado}`);
    });
    
    console.log(`💰 GANANCIA TOTAL CALCULADA: $${gananciaTotal}`);
    return gananciaTotal;
}

// ===== REPARAR RESERVAS EXISTENTES =====
function repararReservas() {
    console.log('🔧 REPARANDO RESERVAS EXISTENTES...');
    
    const vuelos = db.obtenerVuelos();
    const reservas = db.obtenerReservas();
    let reservasReparadas = 0;
    
    reservas.forEach(reserva => {
        const vuelo = vuelos.find(v => v.id === reserva.vueloId);
        if (vuelo) {
            const precioVuelo = vuelo.precio || vuelo.tarifa || 0;
            const cantidadAsientos = reserva.asientos ? reserva.asientos.length : 1;
            const totalReserva = precioVuelo * cantidadAsientos;
            
            // Solo actualizar si el total es diferente o no existe
            if (reserva.total !== totalReserva || !reserva.total) {
                reserva.total = totalReserva;
                reservasReparadas++;
                console.log(`🔧 Reserva ${reserva.id} reparada: $${totalReserva}`);
            }
        }
    });
    
    // Guardar cambios si hubo reparaciones
    if (reservasReparadas > 0) {
        db._save();
    }
    
    console.log(`✅ ${reservasReparadas} reservas reparadas`);
    return reservasReparadas;
}

// ===== ESTADÍSTICAS CORREGIDAS =====
function actualizarEstadisticas() {
    const vuelos = db.obtenerVuelos();
    const reservas = db.obtenerReservas();
    
    console.log('🔍 ANALIZANDO DATOS PARA ESTADÍSTICAS:');
    console.log('- Total vuelos:', vuelos.length);
    console.log('- Total reservas:', reservas.length);
    
    // ✅ CORREGIDO: Calcular ganancias de TODAS las reservas confirmadas
    let ganancias = 0;
    let reservasConPrecio = 0;
    
    reservas.forEach(reserva => {
        if (reserva.estado !== 'cancelada') {
            // Buscar el vuelo para obtener el precio
            const vuelo = vuelos.find(v => v.id === reserva.vueloId);
            if (vuelo) {
                const precioVuelo = vuelo.precio || vuelo.tarifa || 0;
                const cantidadAsientos = reserva.asientos ? reserva.asientos.length : 1;
                const totalReserva = reserva.total || (precioVuelo * cantidadAsientos);
                
                ganancias += totalReserva;
                reservasConPrecio++;
                
                console.log(`💰 Reserva ${reserva.id}: ${cantidadAsientos} asientos x $${precioVuelo} = $${totalReserva}`);
            } else {
                console.warn(`⚠️ Vuelo no encontrado para reserva ${reserva.id}`);
            }
        }
    });
    
    console.log(`💰 GANANCIAS CALCULADAS: $${ganancias} (de ${reservasConPrecio} reservas)`);

    statVuelos.textContent = vuelos.length;
    statReservas.textContent = reservas.filter(r => r.estado !== 'cancelada').length;
    statGanancias.textContent = `$${ganancias.toLocaleString()}`;
    
    // Actualizar tooltips
    statVuelos.title = `${vuelos.length} vuelos registrados`;
    statReservas.title = `${reservas.filter(r => r.estado !== 'cancelada').length} reservas activas de ${reservas.length} totales`;
    statGanancias.title = `Ganancias estimadas de ${reservasConPrecio} reservas confirmadas`;
}

// ===== VUELOS MEJORADOS =====
function renderVuelos(filtrados = null) {
    const vuelos = filtrados || db.obtenerVuelos();
    tablaVuelos.innerHTML = '';

    if (vuelos.length === 0) {
        tablaVuelos.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="bi bi-airplane fs-1 d-block mb-2"></i>
                    No hay vuelos registrados
                </td>
            </tr>
        `;
        return;
    }

    vuelos.forEach(v => {
        const asientosOcupados = v.asientosReservados?.length || 0;
        const porcentajeOcupacion = Math.round((asientosOcupados / v.asientosTotales) * 100);
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <span class="badge bg-primary">${v.id}</span>
            </td>
            <td>
                <strong>${v.origen}</strong>
                <br><small class="text-muted">${v.aerolinea || 'Aerolínea'}</small>
            </td>
            <td>
                <strong>${v.destino}</strong>
                <br><small class="text-muted">Puerta ${v.puerta || 'N/A'}</small>
            </td>
            <td>
                ${new Date(v.fecha).toLocaleDateString()}
                <br><small class="text-muted">${v.estado || 'Programado'}</small>
            </td>
            <td>
                <strong class="text-success">$${v.precio || v.tarifa || 0}</strong>
                <br>
                <div class="progress mt-1" style="height: 4px;">
                    <div class="progress-bar ${porcentajeOcupacion > 80 ? 'bg-danger' : porcentajeOcupacion > 50 ? 'bg-warning' : 'bg-success'}" 
                         style="width: ${porcentajeOcupacion}%"></div>
                </div>
                <small class="text-muted">${asientosOcupados}/${v.asientosTotales} asientos</small>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary btnEditar" data-id="${v.id}" title="Editar vuelo">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-outline-danger btnEliminar" data-id="${v.id}" title="Eliminar vuelo">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tablaVuelos.appendChild(tr);
    });

    // Event listeners para botones
    document.querySelectorAll('.btnEditar').forEach(btn => {
        btn.addEventListener('click', e => {
            const vuelo = db.findVueloById(e.target.closest('.btnEditar').dataset.id);
            if (vuelo) {
                vueloIdInput.value = vuelo.id;
                formVuelo.origen.value = vuelo.origen;
                formVuelo.destino.value = vuelo.destino;
                formVuelo.fecha.value = vuelo.fecha;
                formVuelo.precio.value = vuelo.precio || vuelo.tarifa || 0;
                new bootstrap.Modal(document.getElementById('modalVuelo')).show();
            }
        });
    });

    document.querySelectorAll('.btnEliminar').forEach(btn => {
        btn.addEventListener('click', e => {
            const vueloId = e.target.closest('.btnEliminar').dataset.id;
            const vuelo = db.findVueloById(vueloId);
            
            if (confirm(`¿Estás seguro de eliminar el vuelo ${vuelo.id} (${vuelo.origen} → ${vuelo.destino})?`)) {
                db.eliminarVuelo(vueloId);
                renderVuelos();
                actualizarEstadisticas();
                showToast('Vuelo eliminado correctamente', 'success');
            }
        });
    });
}

// ===== RESERVAS MEJORADAS =====
function renderReservas() {
    const reservas = db.obtenerReservas();
    tablaReservas.innerHTML = '';

    if (reservas.length === 0) {
        tablaReservas.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted py-4">
                    <i class="bi bi-calendar-check fs-1 d-block mb-2"></i>
                    No hay reservas registradas
                </td>
            </tr>
        `;
        return;
    }

    // Ordenar reservas por fecha (más recientes primero)
    reservas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    reservas.forEach(r => {
        const usuario = db.obtenerUsuarios().find(u => u.id === r.clienteId);
        const vuelo = db.obtenerVuelos().find(v => v.id === r.vueloId);
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <span class="badge bg-secondary">${r.codigo}</span>
            </td>
            <td>
                <strong>${usuario ? usuario.nombre : 'Cliente no encontrado'}</strong>
                <br><small class="text-muted">${usuario ? usuario.email : 'N/A'}</small>
            </td>
            <td>
                ${vuelo ? `${vuelo.origen} → ${vuelo.destino}` : 'Vuelo no encontrado'}
                <br><small class="text-muted">${vuelo ? vuelo.numero : 'N/A'} • ${r.asientos?.join(', ') || 'Sin asientos'}</small>
            </td>
            <td>
                ${new Date(r.fecha).toLocaleDateString()}
                <br><small class="text-muted">${new Date(r.fecha).toLocaleTimeString()}</small>
            </td>
            <td>
                <span class="badge ${r.estado === 'confirmada' ? 'bg-success' : r.estado === 'cancelada' ? 'bg-danger' : 'bg-warning'}">
                    ${r.estado}
                </span>
                <br>
                <span class="badge ${r.pagoEstado === 'pagada' ? 'bg-success' : 'bg-secondary'}">
                    ${r.pagoEstado}
                </span>
                <br>
                <small class="text-success fw-bold">$${r.total || 0}</small>
            </td>
        `;
        tablaReservas.appendChild(tr);
    });
}

// ===== USUARIOS MEJORADOS =====
function renderUsuarios() {
    const usuarios = db.obtenerUsuarios();
    tablaUsuarios.innerHTML = '';

    if (usuarios.length === 0) {
        tablaUsuarios.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">
                    <i class="bi bi-people fs-1 d-block mb-2"></i>
                    No hay usuarios registrados
                </td>
            </tr>
        `;
        return;
    }

    usuarios.forEach(u => {
        const reservasUsuario = db.obtenerReservas().filter(r => r.clienteId === u.id);
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <span class="badge bg-dark">${u.id}</span>
            </td>
            <td>
                <strong>${u.nombre}</strong>
                ${u.puntos ? `<br><small class="text-info">${u.puntos} puntos</small>` : ''}
            </td>
            <td>${u.email}</td>
            <td>
                <span class="badge ${u.rol === 'admin' ? 'bg-danger' : 'bg-primary'}">
                    ${u.rol}
                </span>
                <br>
                <small class="text-muted">${reservasUsuario.length} reservas</small>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-success btnEditarUsuario" data-id="${u.id}" title="Editar usuario">
                        <i class="bi bi-pencil"></i>
                    </button>
                    ${u.rol !== 'admin' ? `
                    <button class="btn btn-outline-danger btnEliminarUsuario" data-id="${u.id}" title="Eliminar usuario">
                        <i class="bi bi-trash"></i>
                    </button>
                    ` : ''}
                </div>
            </td>
        `;
        tablaUsuarios.appendChild(tr);
    });

    document.querySelectorAll('.btnEditarUsuario').forEach(btn => {
        btn.addEventListener('click', e => {
            const u = db.obtenerUsuarios().find(x => x.id === e.target.closest('.btnEditarUsuario').dataset.id);
            if (u) {
                usuarioIdInput.value = u.id;
                nombreUsuarioInput.value = u.nombre;
                emailUsuarioInput.value = u.email;
                rolUsuarioInput.value = u.rol;
                modalUsuario.show();
            }
        });
    });

    document.querySelectorAll('.btnEliminarUsuario').forEach(btn => {
        btn.addEventListener('click', e => {
            const usuarioId = e.target.closest('.btnEliminarUsuario').dataset.id;
            const usuario = db.obtenerUsuarios().find(u => u.id === usuarioId);
            
            if (usuario && usuario.rol !== 'admin' && confirm(`¿Estás seguro de eliminar al usuario ${usuario.nombre}?`)) {
                db.eliminarUsuario(usuarioId);
                renderUsuarios();
                actualizarEstadisticas();
                showToast('Usuario eliminado correctamente', 'success');
            } else if (usuario?.rol === 'admin') {
                showToast('No se pueden eliminar usuarios administradores', 'warning');
            }
        });
    });
}

// ===== EVENT LISTENERS =====
formVuelo.addEventListener('submit', e => {
    e.preventDefault();
    const id = vueloIdInput.value;
    const data = {
        origen: formVuelo.origen.value,
        destino: formVuelo.destino.value,
        fecha: formVuelo.fecha.value,
        precio: Number(formVuelo.precio.value),
        aerolinea: 'AeroDominicana'
    };
    
    if (id) {
        db.actualizarVuelo(id, data);
        showToast('Vuelo actualizado correctamente', 'success');
    } else {
        db.agregarVuelo(data);
        showToast('Vuelo agregado correctamente', 'success');
    }

    renderVuelos();
    actualizarEstadisticas();
    bootstrap.Modal.getInstance(document.getElementById('modalVuelo')).hide();
    formVuelo.reset();
    vueloIdInput.value = '';
});

btnNuevoVuelo.addEventListener('click', () => {
    vueloIdInput.value = '';
    formVuelo.reset();
    // Establecer fecha mínima como hoy
    formVuelo.fecha.min = new Date().toISOString().split('T')[0];
    new bootstrap.Modal(document.getElementById('modalVuelo')).show();
});

btnBuscar.addEventListener('click', () => {
    const term = busquedaInput.value.toLowerCase();
    renderVuelos(
        db.obtenerVuelos().filter(
            v => v.origen.toLowerCase().includes(term) || 
                 v.destino.toLowerCase().includes(term) ||
                 v.id.toLowerCase().includes(term)
        )
    );
});

btnLimpiar.addEventListener('click', () => {
    busquedaInput.value = '';
    renderVuelos();
});

btnNuevoUsuario.addEventListener('click', () => {
    usuarioIdInput.value = '';
    formUsuario.reset();
    modalUsuario.show();
});

formUsuario.addEventListener('submit', e => {
    e.preventDefault();
    const id = usuarioIdInput.value;
    const data = {
        nombre: nombreUsuarioInput.value,
        email: emailUsuarioInput.value,
        rol: rolUsuarioInput.value,
        password: 'temp123' // Contraseña temporal para nuevos usuarios
    };
    
    if (id) {
        db.actualizarUsuario(id, data);
        showToast('Usuario actualizado correctamente', 'success');
    } else {
        db.agregarUsuario(data);
        showToast('Usuario agregado correctamente', 'success');
    }

    renderUsuarios();
    actualizarEstadisticas();
    modalUsuario.hide();
    formUsuario.reset();
});

// ===== INICIALIZACIÓN COMPLETA =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 Inicializando panel admin mejorado...');
    
    // Mostrar nombre del admin
    if (adminNameElement && usuarioActual) {
        adminNameElement.textContent = `Bienvenido, ${usuarioActual.nombre}`;
    }
    
    // Reparar reservas existentes si es necesario
    const reservasReparadas = repararReservas();
    if (reservasReparadas > 0) {
        showToast(`Se repararon ${reservasReparadas} reservas`, 'info');
    }
    
    // Ejecutar diagnóstico completo
    diagnosticarDatos();
    
    // Cargar datos iniciales
    renderVuelos();
    renderUsuarios();
    renderReservas();
    actualizarEstadisticas();
    
    showToast('Panel administrativo cargado correctamente', 'success');
});