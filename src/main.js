// main.js
import { renderPagos } from './interfaz.js';
import Interfaz from './interfaz.js';
//Interfaz.renderInicio(container);
import './controladores.js';
import BaseDatos from './baseDatos.js';



const container = document.getElementById('app');
const db = new BaseDatos();

// --- Panel de Notificaciones ---
function renderNotificaciones() {
    const lista = document.getElementById('listaNotificaciones');
    if (!lista) return;

    const notificaciones = JSON.parse(localStorage.getItem('notificaciones') || '[]');

    lista.innerHTML = notificaciones.length
        ? notificaciones
              .map(
                  n => `
            <div class="alert alert-${n.type} py-1 mb-2 d-flex justify-content-between align-items-center">
                <div>
                    <small class="text-muted">${new Date(n.fecha).toLocaleString()}</small><br>
                    ${n.msg}
                </div>
                <button type="button" class="btn-close btn-close-white btn-sm" onclick="removeNotificacion(${n.id})"></button>
            </div>
        `
              )
              .join('')
        : '<div class="text-muted">No hay notificaciones.</div>';
}

// Elimina una notificación por índice
window.removeNotificacion = function(id) {
    let notificaciones = JSON.parse(localStorage.getItem('notificaciones') || '[]');
    notificaciones = notificaciones.filter(n => n.id !== id);
    localStorage.setItem('notificaciones', JSON.stringify(notificaciones));
    renderNotificaciones();
};

// Enlace "Regístrate aquí" dentro del modal de login
document.getElementById('linkRegisterFromLogin')?.addEventListener('click', e => {
    e.preventDefault();
    const modalLogin = bootstrap.Modal.getInstance(document.getElementById('modalLogin'));
    const modalRegisterEl = document.getElementById('modalRegister');

    if (modalLogin) {
        modalLogin.hide();
        document.getElementById('modalLogin').addEventListener(
            'hidden.bs.modal',
            () => {
                new bootstrap.Modal(modalRegisterEl).show();
            },
            { once: true }
        );
    } else {
        new bootstrap.Modal(modalRegisterEl).show();
    }
});

// --- Toast ---
function showToast(msg, type = 'primary') {
    const containerToast = document.getElementById('toast-container');
    const id = 't' + Math.random().toString(36).slice(2);

    containerToast.insertAdjacentHTML(
        'beforeend',
        `
        <div id="${id}" class="toast align-items-center text-bg-${type} border-0 mb-2 show">
            <div class="d-flex">
                <div class="toast-body">${msg}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `
    );

    // Guardar notificación en historial
    const notifId = Date.now();
    let notificaciones = JSON.parse(localStorage.getItem('notificaciones') || '[]');
    notificaciones.push({
        id: notifId,
        msg,
        type,
        fecha: new Date().toISOString(),
        duracion: 4000
    });
    localStorage.setItem('notificaciones', JSON.stringify(notificaciones));
    renderNotificaciones();

    // Quitar el toast visual
    setTimeout(() => document.getElementById(id)?.remove(), 4000);

    // Quitar también del panel lateral
    setTimeout(() => removeNotificacion(notifId), 4000);
}

// --- Actualizar barra de usuario ---
function updateUserArea() {
    const user = JSON.parse(sessionStorage.getItem('aero_user'));
    const userArea = document.getElementById('nav-user-area');

    if (!user) {
        userArea.innerHTML = '';
        return;
    }

    userArea.innerHTML = `
        <span class="fw-bold me-2">${user.rol === 'admin' ? 'Admin: ' : ''}${user.nombre}</span>
        ${user.rol === 'admin' ? '<a href="admin.html" class="btn btn-sm btn-warning">Administrar</a>' : ''}
        <a href="#" class="btn btn-sm btn-danger" id="btnCerrarSesion">Cerrar sesión</a>
    `;

    // Cerrar sesión
    document.getElementById('btnCerrarSesion').addEventListener('click', () => {
        sessionStorage.removeItem('aero_user');
        location.reload();
    });
}

// --- Render inicial ---
Interfaz.renderInicio(container);
updateUserArea();
renderNotificaciones();

// --- Navegación ---
document.getElementById('nav-inicio')?.addEventListener('click', e => {
    e.preventDefault();
    Interfaz.renderInicio(container);
});

document.getElementById('nav-misreservas')?.addEventListener('click', e => {
    e.preventDefault();
    const user = JSON.parse(sessionStorage.getItem('aero_user'));
    if (!user) {
        showToast('Debes iniciar sesión', 'warning');
        new bootstrap.Modal(document.getElementById('modalLogin')).show();
        return;
    }
    window.open('reservas.html', '_blank');
});

document.getElementById('nav-pagos')?.addEventListener('click', e => {
    e.preventDefault();
    renderPagos(container);
});

// --- Formulario de pago ---
document.getElementById('formPago')?.addEventListener('submit', e => {
    e.preventDefault();

    const user = JSON.parse(sessionStorage.getItem('aero_user'));
    if (!user) return showToast('Debes iniciar sesión', 'warning');

    const monto = parseFloat(document.getElementById('pagoMonto').value);
    const reservaId = document.getElementById('reservaIdPago').value;

    if (isNaN(monto) || !reservaId) {
        showToast('Faltan datos del pago', 'warning');
        return;
    }

    const pago = {
        codigo: 'PAY-' + Date.now(),
        monto,
        reservaId,
        fecha: new Date().toISOString()
    };

    db.registrarPago(pago);
    showToast('Pago registrado correctamente', 'success');

    bootstrap.Modal.getInstance(document.getElementById('modalPago'))?.hide();

    if (container.innerHTML.includes('💳 Historial de Pagos')) {
        renderPagos(container);
    }

    e.target.reset();
});

// --- Registro ---
document.getElementById('formRegister')?.addEventListener('submit', e => {
    e.preventDefault();

    const nombre = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const pass = document.getElementById('regPass').value.trim();
    const rol = document.getElementById('regRoleSelect').value;

    if (!nombre || !email || !pass) return showToast('Completa todos los campos', 'warning');

    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    if (usuarios.some(u => u.email === email)) return showToast('Correo ya registrado', 'danger');

    usuarios.push({
        id: Date.now(),
        nombre,
        email,
        password: pass,
        rol
    });

    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    showToast('Registrado correctamente', 'success');

    bootstrap.Modal.getInstance(document.getElementById('modalRegister'))?.hide();
    new bootstrap.Modal(document.getElementById('modalLogin')).show();
});

// --- Login ---
document.getElementById('formLogin')?.addEventListener('submit', e => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const pass = document.getElementById('loginPass').value.trim();
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const user = usuarios.find(u => u.email === email && u.password === pass);

    if (!user) return showToast('Usuario o contraseña incorrectos', 'danger');

    sessionStorage.setItem('aero_user', JSON.stringify(user));
    localStorage.setItem('usuarioActual', JSON.stringify(user));

    showToast(`Bienvenido, ${user.nombre}`, 'success');
    bootstrap.Modal.getInstance(document.getElementById('modalLogin'))?.hide();
    updateUserArea();
});

// --- Recuperar contraseña ---
document.getElementById('linkForgotPassword')?.addEventListener('click', e => {
    e.preventDefault();
    bootstrap.Modal.getInstance(document.getElementById('modalLogin'))?.hide();
    new bootstrap.Modal(document.getElementById('modalForgotPassword')).show();
});

document.getElementById('btnSendToken1')?.addEventListener('click', e => {
    const email = document.getElementById('fpEmail1').value.trim();
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const user = usuarios.find(u => u.email === email);

    if (!user) return showToast('Correo no encontrado', 'danger');

    const token = Math.floor(100000 + Math.random() * 900000);
    let tokens = JSON.parse(localStorage.getItem('tokens') || '{}');
    tokens[email] = token;
    localStorage.setItem('tokens', JSON.stringify(tokens));

    showToast(`Token enviado (simulado): ${token}`, 'success');

    bootstrap.Modal.getInstance(document.getElementById('modalForgotPassword'))?.hide();
    new bootstrap.Modal(document.getElementById('modalResetPassword')).show();
    document.getElementById('rpEmail1').value = email;
});

document.getElementById('btnResetPassword1')?.addEventListener('click', e => {
    const email = document.getElementById('rpEmail1').value.trim();
    const tokenInput = document.getElementById('rpToken1').value.trim();
    const newPass = document.getElementById('rpPass1').value.trim();

    let tokens = JSON.parse(localStorage.getItem('tokens') || '{}');
    if (tokens[email] != tokenInput) return showToast('Token inválido', 'danger');

    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const index = usuarios.findIndex(u => u.email === email);
    if (index === -1) return showToast('Usuario no encontrado', 'danger');

    usuarios[index].password = newPass;
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    delete tokens[email];
    localStorage.setItem('tokens', JSON.stringify(tokens));

    showToast('Contraseña actualizada', 'success');
    bootstrap.Modal.getInstance(document.getElementById('modalResetPassword'))?.hide();
});
