// main.js
import { renderPagos } from './interfaz.js';
import Interfaz from './interfaz.js';
import './controladores.js';
import BaseDatos from './baseDatos.js';
import { EmailService } from './services/emailService.js';
import { AuthService } from './services/authService.js';
import { EmailNotificationService } from './services/emailNotificationService.js';

const container = document.getElementById('app');
const db = new BaseDatos();

// ========== FUNCIONES DE CORRECCIÓN ==========
function corregirUsuarioAdmin() {
    const db = new BaseDatos();
    const usuarios = db.obtenerUsuarios();
    
    const usuarioConPass = usuarios.find(u => u.pass && !u.password);
    if (usuarioConPass) {
        console.log('🛠️ Corrigiendo usuario con campo pass...', usuarioConPass);
        usuarioConPass.password = usuarioConPass.pass;
        delete usuarioConPass.pass;
        db._save();
        console.log('✅ Usuario corregido:', usuarioConPass);
    }
}

// Resetear contraseñas a texto plano para que funcione el login
function resetearContraseñas() {
    const db = new BaseDatos();
    const usuarios = db.obtenerUsuarios();
    
    console.log('🔄 RESETEANDO CONTRASEÑAS A TEXTO PLANO...');
    
    usuarios.forEach(usuario => {
        if (usuario.rol === 'admin') {
            console.log(`🔄 Reseteando admin: ${usuario.email}`);
            db.actualizarUsuario(usuario.id, { 
                password: 'admin123',
                pass: undefined
            });
        }
    });
    
    console.log('🎉 CONTRASEÑAS ADMIN RESETEADAS');
}

// Botón opcional para autocompletar (solo para testing)
/*
function agregarBotonAutocompletado() {
    const botonAuto = document.createElement('button');
    botonAuto.textContent = '🔧 Autocompletar Admin';
    botonAuto.className = 'btn btn-warning btn-sm';
    botonAuto.style.position = 'fixed';
    botonAuto.style.top = '10px';
    botonAuto.style.right = '10px';
    botonAuto.style.zIndex = '9999';
    
    botonAuto.addEventListener('click', function() {
        const loginEmail = document.getElementById('loginEmail');
        const loginPass = document.getElementById('loginPass');
        
        if (loginEmail && loginPass) {
            loginEmail.value = 'admin@aeropuerto.com';
            loginPass.value = 'admin123';
            showToast('Credenciales admin autocompletadas', 'info');
        }
    });
    
    document.body.appendChild(botonAuto);
}
*/

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
    location.reload();
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

// --- Formulario de pago CORREGIDO ---
document.getElementById('formPago')?.addEventListener('submit', function(e) {
    e.preventDefault();

    const user = JSON.parse(sessionStorage.getItem('aero_user'));
    if (!user) {
        showToast('Debes iniciar sesión', 'warning');
        return;
    }

    const monto = parseFloat(this.querySelector('input[name="monto"]').value);
    const nombre = this.querySelector('input[name="nombre"]').value.trim();
    const numero = this.querySelector('input[name="numero"]').value.trim();
    const exp = this.querySelector('input[name="exp"]').value.trim();
    const cvv = this.querySelector('input[name="cvv"]').value.trim();
    
    // Obtener el ID de la reserva del dataset del formulario
    const reservaId = this.dataset.reservaId;

    if (isNaN(monto) || !reservaId || !nombre || !numero || !exp || !cvv) {
        showToast('Faltan datos del pago', 'warning');
        return;
    }

    // Procesar el pago
    const pago = {
        codigo: 'PAY-' + Date.now(),
        monto,
        reservaId,
        fecha: new Date().toISOString()
    };

    db.registrarPago(pago);
    showToast('Pago registrado correctamente', 'success');

    // ✅ CERRAR EL MODAL CORRECTAMENTE
    const modalPago = bootstrap.Modal.getInstance(document.getElementById('modalPago'));
    if (modalPago) {
        modalPago.hide();
    }

    // Actualizar la vista de pagos si está activa
    if (container.innerHTML.includes('💳 Historial de Pagos')) {
        renderPagos(container);
    }

    // Limpiar el formulario
    this.reset();
    delete this.dataset.reservaId;
});

// --- Registro MEJORADO ---
document.getElementById('formRegister')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const nombre = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPass').value;
    
    const confirmPassword = document.getElementById('regConfirmPassword')?.value || password;

    // Validaciones
    if (!nombre || !email || !password) {
        showToast('Todos los campos son obligatorios', 'warning');
        return;
    }

    if (password.length < 6) {
        showToast('La contraseña debe tener al menos 6 caracteres', 'warning');
        return;
    }

    if (password !== confirmPassword) {
        showToast('Las contraseñas no coinciden', 'warning');
        return;
    }

    // Mostrar loading
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Registrando...';
    submitBtn.disabled = true;

    try {
        console.log('🔄 Registrando usuario:', { nombre, email });
        const resultado = await AuthService.registrarUsuario({
            nombre,
            email,
            password
        });

        console.log('✅ Resultado del registro:', resultado);

        if (resultado.success) {
            showToast('✅ Registro exitoso. Ahora puedes iniciar sesión.', 'success');
            
            // Cerrar modal y limpiar formulario
            bootstrap.Modal.getInstance(document.getElementById('modalRegister'))?.hide();
            this.reset();
            
            // Limpiar estado de verificación
            const statusElement = document.getElementById('email-status');
            if (statusElement) statusElement.innerHTML = '';
            
            // Abrir modal de login después de un breve delay
            setTimeout(() => {
                new bootstrap.Modal(document.getElementById('modalLogin')).show();
            }, 500);
        } else {
            showToast(resultado.message, 'danger');
        }

    } catch (error) {
        console.error('❌ Error en registro:', error);
        showToast('Error al registrar usuario', 'danger');
    } finally {
        // Restaurar botón
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// --- Login MEJORADO ---
document.getElementById('formLogin')?.addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPass').value.trim();

    if (!email || !password) {
        showToast('Email y contraseña son obligatorios', 'warning');
        return;
    }

    // Mostrar loading
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Iniciando...';
    submitBtn.disabled = true;

    try {
        console.log('🔐 Intentando login:', { email });
        const resultado = await AuthService.loginUsuario(email, password);

        if (resultado.success) {
            // Guardar usuario en sessionStorage (sin password)
            sessionStorage.setItem('aero_user', JSON.stringify(resultado.user));
            showToast(`✅ Bienvenido, ${resultado.user.nombre}`, 'success');
            
            // Cerrar modal y limpiar formulario
            bootstrap.Modal.getInstance(document.getElementById('modalLogin'))?.hide();
            this.reset();
            
            // Actualizar interfaz
            updateUserArea();
            
            // Recargar la vista principal si es necesario
            if (typeof Interfaz !== 'undefined' && Interfaz.renderInicio) {
                Interfaz.renderInicio(container);
            }
            
            // También actualizar notificaciones
            renderNotificaciones();
            
        } else {
            showToast(resultado.message, 'danger');
        }

    } catch (error) {
        console.error('❌ Error en login:', error);
        showToast('Error al iniciar sesión', 'danger');
    } finally {
        // Restaurar botón
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
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

// --- Inicializar verificación de email en tiempo real ---
function initializeEmailVerification() {
    const emailInput = document.getElementById('regEmail');
    if (!emailInput) {
        console.log('⚠️ Input de email no encontrado');
        return;
    }

    let verificationTimer;

    emailInput.addEventListener('input', function(e) {
        const email = e.target.value.trim();
        
        // Limpiar timer anterior
        clearTimeout(verificationTimer);
        
        // Crear o obtener elemento de estado
        let statusElement = document.getElementById('email-status');
        if (!statusElement) {
            statusElement = document.createElement('div');
            statusElement.id = 'email-status';
            statusElement.className = 'mt-1 small';
            emailInput.parentNode.appendChild(statusElement);
        }

        if (!email) {
            statusElement.innerHTML = '';
            return;
        }

        // Validación básica de formato
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            statusElement.innerHTML = '<span class="text-warning">⏳ Formato de email inválido</span>';
            return;
        }

        statusElement.innerHTML = '<span class="text-info">⏳ Verificando...</span>';

        // Debounce: esperar 500ms después de que el usuario deje de escribir
        verificationTimer = setTimeout(async () => {
            try {
                const resultado = await EmailService.verificarEmail(email);
                
                if (resultado.exists) {
                    statusElement.innerHTML = '<span class="text-danger">❌ Email ya registrado</span>';
                } else if (resultado.valid) {
                    statusElement.innerHTML = '<span class="text-success">✅ Email disponible</span>';
                } else {
                    statusElement.innerHTML = `<span class="text-warning">⚠️ ${resultado.message}</span>`;
                }
            } catch (error) {
                console.error('Error en verificación:', error);
                statusElement.innerHTML = '<span class="text-danger">❌ Error verificando email</span>';
            }
        }, 500);
    });
}

// Función global para abrir pago (usada desde interfaz.js)
window.abrirPago = function(reservaId) {
    const user = JSON.parse(sessionStorage.getItem('aero_user'));
    if (!user) { 
        showToast('Inicia sesión para pagar', 'warning'); 
        new bootstrap.Modal(document.getElementById('modalLogin')).show(); 
        return; 
    }

    const formPago = document.getElementById('formPago');
    if (!formPago) return;

    formPago.dataset.reservaId = reservaId;
    formPago.reset();

    const modalPago = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalPago'));
    modalPago.show();
};

// Verificar base de datos
function verificarBD() {
    const db = new BaseDatos();
    console.log('🔍 BASE DE DATOS CARGADA:', db);
    console.log('👥 USUARIOS EN BD:', db.obtenerUsuarios());
}

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
    // Correcciones de usuarios admin
    corregirUsuarioAdmin();
    
    // Resetear contraseñas para que funcione el login
    resetearContraseñas();
    
    // Botón opcional para autocompletar (solo testing)
    agregarBotonAutocompletado();
    
    // Código existente
    initializeEmailVerification();
    
    console.log('🚀 INICIANDO PRUEBAS...');
    setTimeout(verificarBD, 1000);
    setTimeout(pruebaDirectaEmail, 2000);
});

// En main.js - AL FINAL DEL ARCHIVO
function pruebaDirectaEmail() {
    console.log('🎯 PRUEBA DIRECTA DE EMAIL INICIADA');
    
    const reservaEjemplo = {
        id: 'R-TEST123',
        codigo: 'R-TEST123', 
        asientos: ['10A', '10B'],
        fecha: new Date().toISOString(),
        estado: 'confirmada',
        pagoEstado: 'pendiente'
    };
    
    const vueloEjemplo = {
        id: 'F1001',
        origen: 'Santo Domingo (SDQ)',
        destino: 'Punta Cana (PUJ)',
        aerolinea: 'AeroPremium',
        fecha: '2025-11-20'
    };
    
    // Probar email de reserva
    console.log('2. 📧 ENVIANDO EMAIL DE PRUEBA...');
    EmailNotificationService.enviarEmailReserva('test@ejemplo.com', reservaEjemplo, vueloEjemplo)
        .then(resultado => {
            console.log('3. ✅ RESULTADO PRUEBA EMAIL:', resultado);
            
            return EmailNotificationService.enviarEmailConfirmacion('test@ejemplo.com', 'Usuario Test');
        })
        .then(resultado => {
            console.log('5. ✅ RESULTADO EMAIL CONFIRMACIÓN:', resultado);
            console.log('🎉 PRUEBA DE EMAILS COMPLETADA');
        })
        .catch(error => {
            console.error('❌ ERROR EN PRUEBA:', error);
        });
}