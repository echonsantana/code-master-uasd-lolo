// src/admin.js
import BaseDatos from './baseDatos.js';

// --- VALIDAR ACCESO DE ADMIN ---
const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));
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

// ===== FUNCIONES AUXILIARES =====
function showToast(msg, tipo='success') {
    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-bg-${tipo} border-0 position-fixed bottom-0 end-0 m-3`;
    toastEl.setAttribute('role', 'alert');
    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${msg}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    document.body.appendChild(toastEl);
    const toast = new bootstrap.Toast(toastEl, { delay: 2500 });
    toast.show();
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

// ===== ESTADÍSTICAS =====
function actualizarEstadisticas() {
    const vuelos = db.obtenerVuelos();
    const reservas = db.obtenerReservas();
    const ganancias = reservas.reduce((sum, r) => sum + (r.total || 0), 0);

    statVuelos.textContent = vuelos.length;
    statReservas.textContent = reservas.length;
    statGanancias.textContent = `$${ganancias}`;
}

// ===== VUELOS =====
function renderVuelos(filtrados = null) {
    const vuelos = filtrados || db.obtenerVuelos();
    tablaVuelos.innerHTML = '';

    vuelos.forEach(v => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${v.id}</td>
            <td>${v.origen}</td>
            <td>${v.destino}</td>
            <td>${v.fecha}</td>
            <td>$${v.precio}</td>
            <td>
                <button class="btn btn-sm btn-primary btnEditar" data-id="${v.id}">✏️</button>
                <button class="btn btn-sm btn-danger btnEliminar" data-id="${v.id}">🗑️</button>
            </td>
        `;
        tablaVuelos.appendChild(tr);
    });

    document.querySelectorAll('.btnEditar').forEach(btn => {
        btn.addEventListener('click', e => {
            const vuelo = db.findVueloById(e.target.dataset.id);
            vueloIdInput.value = vuelo.id;
            formVuelo.origen.value = vuelo.origen;
            formVuelo.destino.value = vuelo.destino;
            formVuelo.fecha.value = vuelo.fecha;
            formVuelo.precio.value = vuelo.precio;
            new bootstrap.Modal(document.getElementById('modalVuelo')).show();
        });
    });

    document.querySelectorAll('.btnEliminar').forEach(btn => {
        btn.addEventListener('click', e => {
            if (confirm('¿Eliminar este vuelo?')) {
                db.eliminarVuelo(e.target.dataset.id);
                renderVuelos();
                actualizarEstadisticas();
            }
        });
    });
}

formVuelo.addEventListener('submit', e => {
    e.preventDefault();
    const id = vueloIdInput.value;
    const data = {
        origen: formVuelo.origen.value,
        destino: formVuelo.destino.value,
        fecha: formVuelo.fecha.value,
        precio: Number(formVuelo.precio.value)
    };
    if (id) db.actualizarVuelo(id, data);
    else db.agregarVuelo(data);

    renderVuelos();
    actualizarEstadisticas();
    bootstrap.Modal.getInstance(document.getElementById('modalVuelo')).hide();
});

btnNuevoVuelo.addEventListener('click', () => {
    vueloIdInput.value = '';
    formVuelo.reset();
    new bootstrap.Modal(document.getElementById('modalVuelo')).show();
});

btnBuscar.addEventListener('click', () => {
    const term = busquedaInput.value.toLowerCase();
    renderVuelos(
        db.obtenerVuelos().filter(
            v => v.origen.toLowerCase().includes(term) || v.destino.toLowerCase().includes(term)
        )
    );
});

btnLimpiar.addEventListener('click', () => {
    busquedaInput.value = '';
    renderVuelos();
});

// ===== USUARIOS =====
function renderUsuarios() {
    const usuarios = db.obtenerUsuarios();
    tablaUsuarios.innerHTML = '';

    usuarios.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${u.id}</td>
            <td>${u.nombre}</td>
            <td>${u.email}</td>
            <td>${u.rol}</td>
            <td>
                <button class="btn btn-sm btn-success btnEditarUsuario" data-id="${u.id}">✏️</button>
                <button class="btn btn-sm btn-danger btnEliminarUsuario" data-id="${u.id}">🗑️</button>
            </td>
        `;
        tablaUsuarios.appendChild(tr);
    });

    document.querySelectorAll('.btnEditarUsuario').forEach(btn => {
        btn.addEventListener('click', e => {
            const u = db.obtenerUsuarios().find(x => x.id === e.target.dataset.id);
            usuarioIdInput.value = u.id;
            nombreUsuarioInput.value = u.nombre;
            emailUsuarioInput.value = u.email;
            rolUsuarioInput.value = u.rol;
            modalUsuario.show();
        });
    });

    document.querySelectorAll('.btnEliminarUsuario').forEach(btn => {
        btn.addEventListener('click', e => {
            if (confirm('¿Eliminar este usuario?')) {
                db.eliminarUsuario(e.target.dataset.id);
                renderUsuarios();
                actualizarEstadisticas();
            }
        });
    });
}

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
        rol: rolUsuarioInput.value
    };
    if (id) db.actualizarUsuario(id, data);
    else db.agregarUsuario(data);

    renderUsuarios();
    actualizarEstadisticas();
    modalUsuario.hide();
});

// ===== RESERVAS =====
function renderReservas() {
    const reservas = db.obtenerReservas();
    tablaReservas.innerHTML = '';

    reservas.forEach(r => {
        const usuario = db.obtenerUsuarios().find(u => u.id === r.clienteId);
        const vuelo = db.obtenerVuelos().find(v => v.id === r.vueloId);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${r.id}</td>
            <td>${usuario ? usuario.nombre : 'Desconocido'}</td>
            <td>${vuelo ? vuelo.origen + ' → ' + vuelo.destino : 'Desconocido'}</td>
            <td>${r.fecha}</td>
            <td>${r.estado}</td>
        `;
        tablaReservas.appendChild(tr);
    });
}

// ===== INICIAL =====
renderVuelos();
renderUsuarios();
renderReservas();
actualizarEstadisticas();
