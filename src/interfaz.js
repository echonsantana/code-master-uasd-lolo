// src/interfaz.js
import { listarVuelos, crearReserva, cancelarReserva, procesarPago } from './controladores.js';
import BaseDatos from './baseDatos.js';
//import * as Interfaz from './interfaz.js';

const container = document.getElementById('contenidoPrincipal'); // div donde mostrarás los vuelos
//Interfaz.renderVuelos(container);
renderVuelos(container);

const db = new BaseDatos();

const modalPagoEl = document.getElementById('modalPago');
let modalPago = null;
if (modalPagoEl) {
    modalPago = new bootstrap.Modal(modalPagoEl, { backdrop: 'static', keyboard: false });
}




/* --------------------------- Utilidades --------------------------- */
function toast(msg, type = 'primary') {
    const c = document.getElementById('toast-container');
    if (!c) return;
    const id = 't' + Math.random().toString(36).slice(2, 8);
    c.insertAdjacentHTML('beforeend', `
        <div id="${id}" class="toast align-items-center text-bg-${type} border-0 mb-2 show" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">${msg}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `);
    setTimeout(() => document.getElementById(id)?.remove(), 4500);
}

function getUser() {
    const u = sessionStorage.getItem('aero_user');
    return u ? JSON.parse(u) : null;
}

function normalize(s = '') {
    return String(s).toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') 
        .replace(/[^\w\s]/g, '') 
        .trim();
}

/* --------------------------- Hero / Inicio --------------------------- */
function heroHtml() {
    const user = getUser();
    return `
    <div class="hero p-3 rounded-3 mb-3" style="background: linear-gradient(90deg, rgba(10,20,60,0.95), rgba(0,50,120,0.95)); color: white;">
            <div class="d-flex justify-content-between align-items-center">
                <!-- Navbar -->
                <span class="navbar-brand text-illuminated fw-bold fs-3" id="brand">
                        Animate al vuelo y en las nubes exploremos el código 
                </span>


            <div class="text-end">
                ${user 
                    ? `<span class="me-2">👋 ${user.nombre}</span>
                       ${user.rol === "admin" ? '<button class="btn btn-warning btn-sm me-2" id="btn-admin">Administrar</button>' : ''}
                       <button class="btn btn-light btn-sm" id="btn-logout">Cerrar sesión</button>`
                    : `<button class="btn btn-light btn-sm" id="btn-login">Iniciar sesión</button>
                       <button class="btn btn-outline-light btn-sm" id="btn-register">Registrarse</button>`}
            </div>
        </div>

        <div class="mt-3 search-panel rounded p-3">
            <form id="form-busq" class="row g-2 align-items-end">
                <div class="col-md-3">
                    <label class="form-label small">Origen</label>
                    <input class="form-control" id="f-origen" value="Santo Domingo (SDQ)"/>
                </div>
                <div class="col-md-3">
                    <label class="form-label small">Destino</label>
                    <input class="form-control" id="f-destino" value="Punta Cana (PUJ)" />
                </div>
                <div class="col-md-2">
                    <label class="form-label small">Fecha</label>
                    <input type="date" class="form-control" id="f-fecha" value="2025-11-20"/>
                </div>
                <div class="col-md-2">
                    <label class="form-label small">Pasajeros</label>
                    <select class="form-select" id="f-pax">
                        <option>1</option><option>2</option><option>3</option>
                    </select>
                </div>
                <div class="col-md-2 text-end">
                    <button class="btn btn-primary w-100" id="buscarBtn">Buscar vuelos</button>
                </div>
            </form>
        </div>
    </div>
    `;
}
//

function mostrarResultado(oferta) {
    const cont = document.querySelector('.ofertas .ofertas-carrusel');

    if(!cont) return;

    if(!oferta) {
        cont.innerHTML = `<p class="text-center w-100 text-white">❌ No se encontraron vuelos para esta búsqueda.</p>`;
        return;
    }

    cont.innerHTML = `
      <div class="card mx-2" style="min-width: 250px; flex: 0 0 auto;">
        <img src="https://picsum.photos/seed/${oferta.img}/600/300" class="card-img-top" alt="${oferta.d}">
        <div class="card-body text-center">
          <h6 class="card-title">${oferta.o} → ${oferta.d}</h6>
          <p class="text-muted small mb-1">Desde $${oferta.p} USD</p>
          <button class="btn btn-outline-primary btn-sm btn-reservar-oferta" data-origen="${oferta.o}" data-destino="${oferta.d}">Reservar ahora</button>
        </div>
      </div>
    `;
}

/* --------------------------- Render Inicio --------------------------- */
export function renderInicio(container) {
    container.innerHTML = heroHtml() + `

        

    
    <section class="ofertas my-4">
        <h4 class="text-center mb-3 text-white">Ofertas Especiales de la Semana</h4>
        <div class="row g-3">
        ${[
            {o:'Santo Domingo', d:'Paris', p:750, img:'paris'},
            {o:'Punta Cana', d:'New York', p:490, img:'newyork'},
            {o:'Santo Domingo', d:'Madrid', p:680, img:'madrid'},
            {o:'Santiago', d:'Miami', p:420, img:'miami'},
            {o:'Santo Domingo', d:'Buenos Aires', p:810, img:'buenosaires'},
            {o:'Punta Cana', d:'Londres', p:920, img:'london'},
            {o:'Santo Domingo', d:'Panama', p:250, img:'panama'},
            {o:'Santo Domingo', d:'Ciudad de Mexico', p:540, img:'mexico'},
            {o:'Santo Domingo', d:'Toronto', p:630, img:'toronto'},
            {o:'Santiago', d:'Madrid', p:700, img:'madrid2'},
            {o:'Punta Cana', d:'Toronto', p:600, img:'toronto2'},
            {o:'Santo Domingo', d:'Lisboa', p:650, img:'lisboa'},
            {o:'Santo Domingo', d:'Roma', p:720, img:'roma'},
            {o:'Santiago', d:'Miami', p:430, img:'miami2'},
            {o:'Punta Cana', d:'Chicago', p:560, img:'chicago'},
            {o:'Santo Domingo', d:'Cancun', p:470, img:'cancun'},
            {o:'Santo Domingo', d:'Berlin', p:800, img:'berlin'},
            {o:'Punta Cana', d:'Los Angeles', p:900, img:'losangeles'},
            // Nuevas ofertas
            {o:'Santo Domingo', d:'Tokio', p:1100, img:'tokyo'},
            {o:'Punta Cana', d:'Hong Kong', p:1200, img:'hongkong'},
            {o:'Santo Domingo', d:'Dubai', p:950, img:'dubai'},
            {o:'Santiago', d:'Barcelona', p:700, img:'barcelona'},
            {o:'Punta Cana', d:'Amsterdam', p:880, img:'amsterdam'},
            {o:'Santo Domingo', d:'Venecia', p:760, img:'venecia'},
            {o:'Santiago', d:'Lisboa', p:680, img:'lisboa2'},
            {o:'Santo Domingo', d:'Seul', p:1050, img:'seul'},
            {o:'Punta Cana', d:'Los Ángeles', p:910, img:'losangeles2'},
            {o:'Santo Domingo', d:'Moscu', p:850, img:'moscu'},
            {o:'Santiago', d:'París', p:780, img:'paris2'},
            {o:'Punta Cana', d:'Miami', p:430, img:'miami3'},
            {o:'Santo Domingo', d:'San Francisco', p:970, img:'sanfrancisco'},
            {o:'Santo Domingo', d:'Sydney', p:1500, img:'sydney'},
            {o:'Punta Cana', d:'Toronto', p:620, img:'toronto3'}
        ].map(item => `
        <div class="col-md-4 col-lg-3">
          <div class="card h-100 border-0 shadow-sm">
          <img src="https://picsum.photos/seed/${item.img}/600/300" class="card-img-top" alt="${item.d}">
          <div class="card-body text-center">
            <h6 class="card-title">${item.o} → ${item.d}</h6>
            <p class="text-muted small mb-1">Desde $${item.p} USD</p>
            <button class="btn btn-outline-primary btn-sm btn-reservar-oferta" data-origen="${item.o}" data-destino="${item.d}">Reservar ahora</button>
                </div>
              </div>
            </div>
        `).join('')}
        </div>
    </section>


        <!-- Aquí ponemos el contenedor para la tabla de vuelos -->
        <div id="contenidoVuelos" class="mt-4"></div>

    
    

        <div class="row">
    <div class="col-lg-8">
        <div id="contenidoPrincipal"></div>
    </div>

    <div class="col-lg-15">
        <div class="departures-horizontal" id="sideDepartures">
            <h6>Próximos vuelos</h6>
            <div id="tableroSmall"></div>
        </div>
    </div>
</div>

<!-- Modal Reserva -->
<div class="modal fade" id="modalReservaOferta" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content shadow-lg border-0 rounded-3 overflow-hidden">
            <div class="modal-header bg-primary text-white">
                <h5 class="modal-title">Confirmar Reserva</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>

            <div class="modal-body" id="contenidoReservaModal"></div>
        </div>
    </div>
</div>

<!-- Modal Pago -->
<!-- Modal de Pago -->
<div class="modal fade" id="modalPago" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <form id="formPago">
        <div class="modal-header">
          <h5 class="modal-title">Pagar Reserva</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label for="monto" class="form-label">Monto</label>
            <input type="number" step="0.01" name="monto" class="form-control" required>
          </div>
          <div class="mb-3">
            <label for="nombre" class="form-label">Nombre en tarjeta</label>
            <input type="text" name="nombre" class="form-control" required>
          </div>
          <div class="mb-3">
            <label for="numero" class="form-label">Número de tarjeta</label>
            <input type="text" name="numero" class="form-control" required>
          </div>
          <div class="row">
            <div class="col">
              <label for="exp" class="form-label">Expiración</label>
              <input type="text" name="exp" class="form-control" placeholder="MM/AA" required>
            </div>
            <div class="col">
              <label for="cvv" class="form-label">CVV</label>
              <input type="text" name="cvv" class="form-control" required>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="submit" class="btn btn-primary">Pagar</button>
        </div>
      </form>
    </div>
  </div>
</div>


    `;




    // Datos de todos los vuelos
 const todosVuelos = [
    {origen:'Santo Domingo', destino:'París', fecha:'2025-11-20', precio:750},
    {origen:'Punta Cana', destino:'New York', fecha:'2025-11-21', precio:490},
    {origen:'Santo Domingo', destino:'Madrid', fecha:'2025-11-22', precio:680},
    {origen:'Santiago', destino:'Miami', fecha:'2025-11-23', precio:420},
    {origen:'Santo Domingo', destino:'Buenos Aires', fecha:'2025-11-24', precio:810},
    {origen:'Punta Cana', destino:'Londres', fecha:'2025-11-25', precio:920},
    {origen:'Santo Domingo', destino:'Panamá', fecha:'2025-11-26', precio:250},
    {origen:'Santo Domingo', destino:'Ciudad de México', fecha:'2025-11-27', precio:540},
    {origen:'Santo Domingo', destino:'Toronto', fecha:'2025-11-28', precio:630},
    {origen:'Santiago', destino:'Madrid', fecha:'2025-11-29', precio:700},
    {origen:'Punta Cana', destino:'Toronto', fecha:'2025-11-30', precio:600},
    {origen:'Santo Domingo', destino:'Lisboa', fecha:'2025-12-01', precio:650}
    // Agrega más vuelos según necesites
 ];

 // Función para mostrar la tabla
 function renderTablaVuelosAdmin() {
    const cont = document.getElementById('contenidoPrincipal');
    if (!cont) return;

    let html = `
    <div class="d-flex justify-content-between align-items-center mb-2">
        <h4 class="text-white">📋 Todos los Vuelos Disponibles</h4>
        <button id="btnCerrarTabla" class="btn btn-sm btn-outline-light">Cerrar</button>
    </div>
    <div class="table-responsive" style="max-height: 500px; overflow-y: auto;">
        <table class="table table-striped table-hover text-white">
            <thead class="table-dark">
                <tr>
                    <th>Origen</th>
                    <th>Destino</th>
                    <th>Fecha</th>
                    <th>Precio (USD)</th>
                    <th>Reservar</th>
                </tr>
            </thead>
            <tbody>
                ${todosVuelos.map(v => `
                    <tr>
                        <td>${v.origen}</td>
                        <td>${v.destino}</td>
                        <td>${v.fecha}</td>
                        <td>$${v.precio}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary btn-reservar" 
                                    data-origen="${v.origen}" 
                                    data-destino="${v.destino}" 
                                    data-fecha="${v.fecha}" 
                                    data-precio="${v.precio}">
                                Reservar
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    `;

    cont.innerHTML = html;

    // Botón cerrar
    document.getElementById('btnCerrarTabla').addEventListener('click', () => {
        cont.innerHTML = ''; // borra la tabla
    });

    // Eventos de botones de reservar
    document.querySelectorAll('.btn-reservar').forEach(btn => {
        btn.addEventListener('click', () => {
            const vuelo = {
                origen: btn.dataset.origen,
                destino: btn.dataset.destino,
                fecha: btn.dataset.fecha,
                precio: btn.dataset.precio
            };
            renderReservaModal(vuelo);
        });
    });
}

// Listener del nav "Vuelos"
const navVuelos = document.getElementById('nav-vuelos');
if (navVuelos) {
    navVuelos.addEventListener('click', e => {
        e.preventDefault();

        const user = JSON.parse(localStorage.getItem('usuario_actual'));

        if (!user) {
            // Solución para evitar freeze
            e.target.blur();  

            toast("Debes iniciar sesión para ver los vuelos", "danger");

            const modalLogin = document.getElementById('modalLogin');
            const modal = new bootstrap.Modal(modalLogin);
            modal.show();

            return;  
        }

        renderTablaVuelosAdmin();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

    // -------------------- LÓGICA DE BÚSQUEDA CON HIGHLIGHT --------------------
function limpiarInput(texto) {
    return texto.replace(/\s*\(.*\)/, '').trim().toLowerCase();
    }

 document.getElementById('buscarBtn')?.addEventListener('click', e => {
    e.preventDefault();

    const origen = limpiarInput(document.getElementById('f-origen').value);
    const destino = limpiarInput(document.getElementById('f-destino').value);

    const ofertasSemana = [
        {o:'Santo Domingo', d:'Paris', p:750, img:'paris'},
            {o:'Punta Cana', d:'New York', p:490, img:'newyork'},
            {o:'Santo Domingo', d:'Madrid', p:680, img:'madrid'},
            {o:'Santiago', d:'Miami', p:420, img:'miami'},
            {o:'Santo Domingo', d:'Buenos Aires', p:810, img:'buenosaires'},
            {o:'Punta Cana', d:'Londres', p:920, img:'london'},
            {o:'Santo Domingo', d:'Panama', p:250, img:'panama'},
            {o:'Santo Domingo', d:'Ciudad de Mexico', p:540, img:'mexico'},
            {o:'Santo Domingo', d:'Toronto', p:630, img:'toronto'},
            {o:'Santiago', d:'Madrid', p:700, img:'madrid2'},
            {o:'Punta Cana', d:'Toronto', p:600, img:'toronto2'},
            {o:'Santo Domingo', d:'Lisboa', p:650, img:'lisboa'},
            {o:'Santo Domingo', d:'Roma', p:720, img:'roma'},
            {o:'Santiago', d:'Miami', p:430, img:'miami2'},
            {o:'Punta Cana', d:'Chicago', p:560, img:'chicago'},
            {o:'Santo Domingo', d:'Cancun', p:470, img:'cancun'},
            {o:'Santo Domingo', d:'Berlin', p:800, img:'berlin'},
            {o:'Punta Cana', d:'Los Angeles', p:900, img:'losangeles'},
            // Nuevas ofertas
            {o:'Santo Domingo', d:'Tokio', p:1100, img:'tokyo'},
            {o:'Punta Cana', d:'Hong Kong', p:1200, img:'hongkong'},
            {o:'Santo Domingo', d:'Dubai', p:950, img:'dubai'},
            {o:'Santiago', d:'Barcelona', p:700, img:'barcelona'},
            {o:'Punta Cana', d:'Amsterdam', p:880, img:'amsterdam'},
            {o:'Santo Domingo', d:'Venecia', p:760, img:'venecia'},
            {o:'Santiago', d:'Lisboa', p:680, img:'lisboa2'},
            {o:'Santo Domingo', d:'Seul', p:1050, img:'seul'},
            {o:'Punta Cana', d:'Los Angeles', p:910, img:'losangeles2'},
            {o:'Santo Domingo', d:'Moscu', p:850, img:'moscu'},
            {o:'Santiago', d:'Paris', p:780, img:'paris2'},
            {o:'Punta Cana', d:'Miami', p:430, img:'miami3'},
            {o:'Santo Domingo', d:'San Francisco', p:970, img:'sanfrancisco'},
            {o:'Santo Domingo', d:'Sydney', p:1500, img:'sydney'},
            {o:'Punta Cana', d:'Toronto', p:620, img:'toronto3'}
    ];

    const resultados = ofertasSemana.filter(item => 
        item.o.toLowerCase().includes(origen) && 
        item.d.toLowerCase().includes(destino)
    );

    const cont = document.querySelector('.ofertas .row.g-3');

    if (!cont) return;

    if (resultados.length === 0) {
        cont.innerHTML = `<p class="text-center w-100 text-white">❌ No se encontraron vuelos para esta búsqueda.</p>`;
    } else {
        cont.innerHTML = `<p class="text-center w-100 text-warning fw-bold mb-3">✈️ Vuelos encontrados:</p>` + 
            resultados.map(item => `
                <div class="col-md-4 col-lg-3">
                    <div class="card h-100 border-0 shadow-lg border-primary p-2">
                        <img src="https://picsum.photos/seed/${item.img}/600/300" class="card-img-top" alt="${item.d}">
                        <div class="card-body text-center">
                            <h6 class="card-title text-primary fw-bold">${item.o} → ${item.d}</h6>
                            <p class="text-muted small mb-1">Desde $${item.p} USD</p>
                            <button class="btn btn-outline-success btn-sm btn-reservar-oferta" data-origen="${item.o}" data-destino="${item.d}">Reservar ahora</button>
                        </div>
                    </div>
                </div>
            `).join('');
    }
    // volver a activar los botones de reservar
document.querySelectorAll('.btn-reservar-oferta').forEach(btn => {
    btn.addEventListener('click', () => {
        const origen = btn.dataset.origen;
        const destino = btn.dataset.destino;

        const vuelo = {
            id: 'oferta-' + Date.now(),
            origen,
            destino,
            asientosTotales: 20,
            asientosReservados: []
        };

        // abrir modal de reserva como ya tienes en tu función
        renderReservaModal(vuelo);
    });
});

});



    document.getElementById('btn-login')?.addEventListener('click', () => 
        new bootstrap.Modal(document.getElementById('modalLogin')).show()
    );

    document.getElementById('btn-register')?.addEventListener('click', () => 
        new bootstrap.Modal(document.getElementById('modalRegister')).show()
    );

    document.getElementById('btn-admin')?.addEventListener('click', () => {
        renderAdminPanel(container);
    });

    document.getElementById('btn-logout')?.addEventListener('click', () => {
        sessionStorage.removeItem('aero_user');
        toast('Sesión cerrada', 'info');
        renderInicio(container);
    });

    renderTableroSmall();

    const ofertaPendiente = sessionStorage.getItem('ofertaPendiente');
    const user = getUser();
    if (ofertaPendiente && user) {
        const vuelos = listarVuelos();
        const busc = normalize(ofertaPendiente);
        let vuelo = vuelos.find(v => normalize(v.destino).includes(busc)) || vuelos[0];
        if (vuelo) {
            renderReservaModal(vuelo);
            sessionStorage.removeItem('ofertaPendiente');
        }
    }

    document.querySelectorAll('.btn-reservar-oferta').forEach(btn => {
    btn.addEventListener('click', e => {
        e.preventDefault();
        const destino = btn.dataset.destino || '';
        const user = getUser(); // tu función que obtiene usuario de sessionStorage
        if (!user) {
            sessionStorage.setItem('ofertaPendiente', destino);
            toast('Debes iniciar sesión para reservar esta oferta', 'warning');
            new bootstrap.Modal(document.getElementById('modalLogin')).show();
            return;
        }

        const vuelos = listarVuelos();
        const busc = normalize(destino);
        let vuelo = vuelos.find(v => normalize(v.destino).includes(busc)) || vuelos[0];
        if (!vuelo) { 
            toast('No se encontró vuelo para esta oferta', 'danger'); 
            return; 
        }
        renderReservaModal(vuelo); // abre el modal de reserva
    });
 });

}



/* --------------------------- Modal Reserva --------------------------- 
function renderReservaModal(vuelo) {
    const booked = vuelo.asientosReservados || [];
    let seats = '';
    for (let i = 1; i <= (vuelo.asientosTotales || 20); i++) {
        const cls = booked.includes(i) ? 'seat booked' : 'seat';
        seats += `<div class="${cls}" data-seat="${i}">${i}</div>`;
    }

    const cont = document.getElementById('contenidoReservaModal');
    if (!cont) return;

    cont.innerHTML = `
        <div>
            <h5 class="mb-3 text-center">${vuelo.origen} → ${vuelo.destino}</h5>
            <div class="seat-grid mb-3 d-flex justify-content-center flex-wrap">${seats}</div>
            <div class="d-flex gap-2 justify-content-end mt-4">
                <button class="btn btn-outline-secondary" id="cancelReserveModal">Volver</button>
                <button class="btn btn-success" id="confirmReserveModal">Confirmar y pagar</button>
            </div>
        </div>
    `;

    const modal = new bootstrap.Modal(document.getElementById('modalReservaOferta'));
    const selected = new Set();

    cont.querySelectorAll('.seat').forEach(el => {
        if (el.classList.contains('booked')) return;
        el.addEventListener('click', () => {
            const n = parseInt(el.dataset.seat);
            if (selected.has(n)) { selected.delete(n); el.classList.remove('selected'); }
            else { selected.add(n); el.classList.add('selected'); }
        });
    });

    cont.querySelector('#cancelReserveModal')?.addEventListener('click', () => modal.hide());

    cont.querySelector('#confirmReserveModal')?.addEventListener('click', () => {
        if (selected.size === 0) { toast('Selecciona al menos un asiento', 'warning'); return; }
        const user = getUser();
        if (!user) { toast('Inicia sesión para reservar', 'warning'); new bootstrap.Modal(document.getElementById('modalLogin')).show(); return; }
        const asientos = Array.from(selected);
        const res = crearReserva({ clienteId: user.id, vueloId: vuelo.id, asientos });
        if (!res || !res.ok) { toast('Error creando reserva', 'danger'); return; }
        document.getElementById('formPago').dataset.reservaId = res.reserva.id;
        modal.hide();
        new bootstrap.Modal(document.getElementById('modalPago')).show();
    });

    modal.show();
} */

/* --------------------------- Vuelos --------------------------- */
export function renderVuelos(container) {
    const vuelos = listarVuelos();
    const html = vuelos.map(v => `
        <div class="card mb-3 card-flight">
            <img src="https://picsum.photos/seed/${v.numero}/800/200" class="card-img-top" alt="destino"/>
            <div class="card-body d-flex justify-content-between align-items-center">
                <div>
                    <div class="fw-bold">${v.origen} → ${v.destino}</div>
                    <div class="small text-muted">${v.aerolinea || ''} • ${new Date(v.salida).toLocaleDateString()}</div>
                </div>
                <div class="text-end">
                    <div class="fw-bold">$${v.tarifa}</div>
                    <button class="btn btn-sm btn-outline-primary" data-id="${v.id}">Reservar</button>
                </div>
            </div>
        </div>
    `).join('');

    const cont = container.querySelector('#contenidoPrincipal');
    if (cont) cont.innerHTML = `<h5>Resultados</h5>${html}`;

    container.querySelectorAll('.card button[data-id]').forEach(b => {
        b.addEventListener('click', e => {
            const user = getUser();
            if (!user) { toast('Debes iniciar sesión', 'warning'); new bootstrap.Modal(document.getElementById('modalLogin')).show(); return; }
            const id = e.target.getAttribute('data-id');
            renderReserva(container, id);
        });
    });
}

/* --------------------------- Función auxiliar para mostrar pago --------------------------- */
// Función para abrir el modal de pago
function abrirPago(reservaId) {
    const user = getUser();
    if (!user) { 
        toast('Inicia sesión para pagar', 'warning'); 
        new bootstrap.Modal(document.getElementById('modalLogin')).show(); 
        return; 
    }

    const formPago = document.getElementById('formPago');
    if (!formPago) return;

    formPago.dataset.reservaId = reservaId; // Guardamos la reserva
    formPago.reset(); // Limpiamos el formulario

    // Abrimos el modal
    const modalPago = bootstrap.Modal.getOrCreateInstance(document.getElementById('modalPago'));
    modalPago.show();
}

// Configuramos el submit del formulario de pago
document.addEventListener('DOMContentLoaded', () => {
    const formPago = document.getElementById('formPago');
    if (!formPago) return;

    formPago.addEventListener('submit', function(e) {
        e.preventDefault(); // Evita recargar la página

        const reservaId = formPago.dataset.reservaId;
        if (!reservaId) return;

        // Aquí iría tu lógica real de procesar pago
        // Ejemplo: procesarPago(reservaId);
        console.log('Procesando pago para la reserva:', reservaId);

        // Cerramos el modal
        const modalPago = bootstrap.Modal.getInstance(document.getElementById('modalPago'));
        if (modalPago) modalPago.hide();

        // Mostramos mensaje de éxito
        toast('Pago realizado con éxito', 'success');
    });
});


/* --------------------------- Reserva en contenido principal --------------------------- */
function renderReserva(container, vueloId) {
    const vuelo = db.findVueloById(vueloId);
    if (!vuelo) { toast('Vuelo no encontrado', 'danger'); return; }

    const booked = vuelo.asientosReservados || [];
    let seats = '';
    for (let i = 1; i <= (vuelo.asientosTotales || 20); i++) {
        const cls = booked.includes(i) ? 'seat booked' : 'seat';
        seats += `<div class="${cls}" data-seat="${i}">${i}</div>`;
    }

    const cont = container.querySelector('#contenidoPrincipal');
    if (!cont) return;

    cont.innerHTML = `
        <div class="card">
            <div class="card-body">
                <h5>${vuelo.origen} → ${vuelo.destino}</h5>
                <div class="seat-grid mb-3 d-flex flex-wrap">${seats}</div>
                <div class="d-flex gap-2">
                    <button class="btn btn-success" id="confirmReserve">Confirmar y pagar</button>
                    <button class="btn btn-outline-secondary" id="back">Volver</button>
                </div>
            </div>
        </div>
    `;

    const selected = new Set();
    cont.querySelectorAll('.seat').forEach(el => {
        if (el.classList.contains('booked')) return;
        el.addEventListener('click', () => {
            const n = parseInt(el.dataset.seat);
            if (selected.has(n)) { selected.delete(n); el.classList.remove('selected'); }
            else { selected.add(n); el.classList.add('selected'); }
        });
    });

    cont.querySelector('#back')?.addEventListener('click', () => renderVuelos(container));

    cont.querySelector('#confirmReserve')?.addEventListener('click', () => {
        if (selected.size === 0) { toast('Selecciona asientos', 'warning'); return; }
        const user = getUser();
        if (!user) { 
            toast('Inicia sesión para reservar', 'warning'); 
            new bootstrap.Modal(document.getElementById('modalLogin')).show(); 
            return; 
        }
        const asientos = Array.from(selected);
        const res = crearReserva({ clienteId: user.id, vueloId, asientos });
        if (!res || !res.ok) { toast('Error creando reserva', 'danger'); return; }

        abrirPago(res.reserva.id);
    });
}

/* --------------------------- Modal Reserva --------------------------- */
function renderReservaModal(vuelo) {
    const booked = vuelo.asientosReservados || [];
    let seats = '';
    for (let i = 1; i <= (vuelo.asientosTotales || 20); i++) {
        const cls = booked.includes(i) ? 'seat booked' : 'seat';
        seats += `<div class="${cls}" data-seat="${i}">${i}</div>`;
    }

    const cont = document.getElementById('contenidoReservaModal');
    if (!cont) return;

    cont.innerHTML = `
        <div>
            <h5 class="mb-3 text-center">${vuelo.origen} → ${vuelo.destino}</h5>
            <div class="seat-grid mb-3 d-flex justify-content-center flex-wrap">${seats}</div>
            <div class="d-flex gap-2 justify-content-end mt-4">
                <button class="btn btn-outline-secondary" id="cancelReserveModal">Volver</button>
                <button class="btn btn-success" id="confirmReserveModal">Confirmar y pagar</button>
            </div>
        </div>
    `;

    const modal = new bootstrap.Modal(document.getElementById('modalReservaOferta'));
    const selected = new Set();

    cont.querySelectorAll('.seat').forEach(el => {
        if (el.classList.contains('booked')) return;
        el.addEventListener('click', () => {
            const n = parseInt(el.dataset.seat);
            if (selected.has(n)) { selected.delete(n); el.classList.remove('selected'); }
            else { selected.add(n); el.classList.add('selected'); }
        });
    });

    cont.querySelector('#cancelReserveModal')?.addEventListener('click', () => modal.hide());

    cont.querySelector('#confirmReserveModal')?.addEventListener('click', () => {
        if (selected.size === 0) { toast('Selecciona al menos un asiento', 'warning'); return; }
        const user = getUser();
        if (!user) { 
            toast('Inicia sesión para reservar', 'warning'); 
            new bootstrap.Modal(document.getElementById('modalLogin')).show(); 
            return; 
        }
        const asientos = Array.from(selected);
        const res = crearReserva({ clienteId: user.id, vueloId: vuelo.id, asientos });
        if (!res || !res.ok) { toast('Error creando reserva', 'danger'); return; }

        modal.hide();
        abrirPago(res.reserva.id);
    });

    modal.show();
}


/* --------------------------- Reserva en contenido principal --------------------------- 
function renderReserva(container, vueloId) {
    const vuelo = db.findVueloById(vueloId);
    if (!vuelo) { toast('Vuelo no encontrado', 'danger'); return; }

    const booked = vuelo.asientosReservados || [];
    let seats = '';
    for (let i = 1; i <= (vuelo.asientosTotales || 20); i++) {
        const cls = booked.includes(i) ? 'seat booked' : 'seat';
        seats += `<div class="${cls}" data-seat="${i}">${i}</div>`;
    }

    const cont = container.querySelector('#contenidoPrincipal');
    if (!cont) return;

    cont.innerHTML = `
        <div class="card">
            <div class="card-body">
                <h5>${vuelo.origen} → ${vuelo.destino}</h5>
                <div class="seat-grid mb-3 d-flex flex-wrap">${seats}</div>
                <div class="d-flex gap-2">
                    <button class="btn btn-success" id="confirmReserve">Confirmar y pagar</button>
                    <button class="btn btn-outline-secondary" id="back">Volver</button>
                </div>
            </div>
        </div>
    `;

    const selected = new Set();
    cont.querySelectorAll('.seat').forEach(el => {
        if (el.classList.contains('booked')) return;
        el.addEventListener('click', () => {
            const n = parseInt(el.dataset.seat);
            if (selected.has(n)) { selected.delete(n); el.classList.remove('selected'); }
            else { selected.add(n); el.classList.add('selected'); }
        });
    });

    cont.querySelector('#back')?.addEventListener('click', () => renderVuelos(container));

    cont.querySelector('#confirmReserve')?.addEventListener('click', () => {
        if (selected.size === 0) { toast('Selecciona asientos', 'warning'); return; }
        const user = getUser();
        if (!user) { toast('Inicia sesión para reservar', 'warning'); new bootstrap.Modal(document.getElementById('modalLogin')).show(); return; }
        const asientos = Array.from(selected);
        const res = crearReserva({ clienteId: user.id, vueloId, asientos });
        if (!res || !res.ok) { toast('Error creando reserva', 'danger'); return; }
        document.getElementById('formPago').dataset.reservaId = res.reserva.id;
        new bootstrap.Modal(document.getElementById('modalPago')).show();
    });
}*/



/* --------------------------- Mis Reservas --------------------------- */
export function renderMisReservas(container) {
    const user = getUser();
    if (!user) { toast('Inicia sesión para ver reservas', 'warning'); new bootstrap.Modal(document.getElementById('modalLogin')).show(); return; }

    const reservas = db.obtenerReservasByUser(user.id) || [];
    const cont = container.querySelector('#contenidoPrincipal');
    if (!cont) return;

    if (!reservas.length) { cont.innerHTML = '<div class="alert alert-info">No tienes reservas</div>'; return; }

    const html = reservas.map(r => `
        <div class="card mb-2">
            <div class="card-body d-flex justify-content-between align-items-center">
                <div>
                    <div class="fw-semibold">${r.codigo}</div>
                    <div class="small text-muted">Vuelo: ${r.vueloId}</div>
                    <div class="small text-muted">Fecha: ${new Date(r.fecha).toLocaleString()}</div>
                </div>
                <div>
                    <div class="small">Estado: ${r.estado}</div>
                    <button class="btn btn-sm btn-outline-danger" data-id="${r.id}">Cancelar</button>
                </div>
            </div>
        </div>
    `).join('');

    cont.innerHTML = `<h5>Mis Reservas</h5>${html}`;

    document.querySelectorAll('.btn-pagar').forEach(btn => {
    btn.addEventListener('click', () => {
      const reservaId = btn.dataset.reservaId;
      document.getElementById('reservaIdPago').value = reservaId;
      new bootstrap.Modal(document.getElementById('modalPago')).show();
    });
  });

    cont.querySelectorAll('button[data-id]').forEach(b => {
        b.addEventListener('click', e => {
            const id = e.target.getAttribute('data-id');
            const res = cancelarReserva(id);
            if (res.ok) { toast('Reserva cancelada', 'info'); renderMisReservas(container); }
            else toast('Error al cancelar', 'danger');
        });
    });
}

/* --------------------------- Tablero pequeño (side) --------------------------- */
function renderTableroSmall() {
    const vuelos = listarVuelos().slice(0, 10); // si quieres más, cambia a 10 o todos

    const html = vuelos.map(v => `
        <div class="small text-white mb-1">
            <strong>${v.numero}</strong> ${v.origen} → ${v.destino}
            <span class="text-light">
                ${new Date(v.fecha + "T08:00").toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
        </div>
    `).join('');

    const el = document.getElementById('tableroSmall');
    if (el) el.innerHTML = html;
}

renderTableroSmall();


/* --------------------------- Panel Administrativo --------------------------- */
export function renderAdminPanel(container) {
    const user = getUser();
    if (!user || user.rol !== "admin") { toast("Acceso denegado: solo administradores", "danger"); return; }

    const vuelos = listarVuelos();
    const reservas = db.obtenerTodasReservas ? db.obtenerTodasReservas() : [];

   

    //renderTablaVuelosAdmin(vuelos);
    //renderTablaReservas(reservas);
    document.addEventListener('DOMContentLoaded', () => {
    //renderTablaVuelosAdmin(); // sin parámetros
    renderTablaReservas(reservas); // asegúrate de que reservas exista
});

    document.getElementById("btnAgregarVuelo")?.addEventListener("click", () => {
        const numero = prompt("Número de vuelo:");
        const origen = prompt("Origen:");
        const destino = prompt("Destino:");
        const tarifa = prompt("Tarifa:");
        if (!numero || !origen || !destino || !tarifa) return toast("Datos incompletos", "warning");
        db.agregarVuelo({ numero, origen, destino, tarifa });
        toast("Vuelo agregado", "success");
        renderAdminPanel(container);
    });
}

//
export function renderPagos(container = document.getElementById('app')) {
  const user = JSON.parse(sessionStorage.getItem('aero_user'));
  if (!user) {
    toast('Debes iniciar sesión para ver tus pagos', 'warning');
    return;
  }

  const db = new BaseDatos();
  const reservas = db.obtenerReservasByUser(user.id);
  const pagos = db.obtenerPagos().filter(p => reservas.find(r => r.id === p.reservaId));

  container.innerHTML = `
    <div class="container my-4">
      <h3 class="mb-4 text-primary"><i class="bi bi-credit-card"></i> Historial de Pagos</h3>

      <div class="row">
        <div class="col-md-12">
          ${
            pagos.length
              ? `<div class="table-responsive">
                  <table class="table table-striped table-sm">
                    <thead class="table-light">
                      <tr>
                        <th>Código</th>
                        <th>Reserva</th>
                        <th>Monto</th>
                        <th>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${pagos.map(p => `
                        <tr>
                          <td>${p.codigo}</td>
                          <td>${p.reservaId}</td>
                          <td>$${p.monto}</td>
                          <td>${p.fecha.slice(0,10)}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>`
              : `<p class="text-muted">Aún no has realizado pagos.</p>`
          }
        </div>
      </div>
    </div>
  `;

  // === PAGAR DIRECTO SIN FORMULARIO ===
  reservas
    .filter(r => r.pagoEstado !== 'pagada' && r.estado !== 'cancelada')
    .forEach(reserva => {
      const result = procesarPago({
        reservaId: reserva.id,
        numero: '0000 0000 0000 0000', // valores dummy
        exp: '12/99',
        cvv: '000',
        nombre: user.nombre || 'Cliente'
      });

      if (result.ok) {
        toast(`✅ Pago de ${reserva.codigo} realizado correctamente`);
      } else {
        toast(result.msg || `Error al procesar el pago de ${reserva.codigo}`, 'danger');
      }
    });

  // Refresca el historial después de procesar todos los pagos
  // Evita stack overflow usando setTimeout para romper recursión directa
  setTimeout(() => renderPagos(container), 50);
}




//



function renderTablaVuelosGeneral(vuelos) {
    const cont = document.getElementById("listaVuelos");
    if (!cont) return;

    if (!vuelos.length) { cont.innerHTML = "<div class='alert alert-info'>No hay vuelos registrados</div>"; return; }

    cont.innerHTML = `
        <table class="table table-dark table-striped table-bordered">
            <thead><tr><th>#</th><th>Origen</th><th>Destino</th><th>Tarifa</th><th>Acciones</th></tr></thead>
            <tbody>
                ${vuelos.map(v => `
                    <tr>
                        <td>${v.numero}</td>
                        <td>${v.origen}</td>
                        <td>${v.destino}</td>
                        <td>$${v.tarifa}</td>
                        <td>
                            <button class="btn btn-sm btn-outline-warning btn-edit" data-id="${v.id}">Editar</button>
                            <button class="btn btn-sm btn-outline-danger btn-del" data-id="${v.id}">Eliminar</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    cont.querySelectorAll(".btn-del").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            if (confirm("¿Eliminar vuelo?")) {
                db.eliminarVuelo(id);
                toast("Vuelo eliminado", "info");
                renderAdminPanel(document.getElementById("main"));
            }
        });
    });

    cont.querySelectorAll(".btn-edit").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            const vuelo = db.findVueloById(id);
            if (!vuelo) return toast("Vuelo no encontrado", "danger");
            const nuevoOrigen = prompt("Nuevo origen:", vuelo.origen);
            const nuevoDestino = prompt("Nuevo destino:", vuelo.destino);
            const nuevaTarifa = prompt("Nueva tarifa:", vuelo.tarifa);
            if (!nuevoOrigen || !nuevoDestino || !nuevaTarifa) return toast("Datos incompletos", "warning");
            db.actualizarVuelo(id, { origen: nuevoOrigen, destino: nuevoDestino, tarifa: nuevaTarifa });
            toast("Vuelo actualizado", "success");
            renderAdminPanel(document.getElementById("main"));
        });
    });
}

function renderTablaReservas(reservas) {
    const cont = document.getElementById("listaReservas");
    if (!cont) return;

    if (!reservas.length) { cont.innerHTML = "<div class='alert alert-info'>No hay reservas registradas</div>"; return; }

    cont.innerHTML = `
        <table class="table table-dark table-bordered">
            <thead><tr><th>Código</th><th>Usuario</th><th>Vuelo</th><th>Fe cha</th><th>Estado</th></tr></thead>
            <tbody>
                ${reservas.map(r => `
                    <tr>
                        <td>${r.codigo}</td>
                        <td>${r.clienteId}</td>
                        <td>${r.vueloId}</td>
                        <td>${new Date(r.fecha).toLocaleString()}</td>
                        <td>${r.estado}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

/* --------------------------- Procesar pago desde modal --------------------------- *
document.getElementById('formPago')?.addEventListener('submit', e => {
  e.preventDefault();

  const user = JSON.parse(sessionStorage.getItem('aero_user'));
  if (!user) {
    toast('Debes iniciar sesión para pagar', 'warning');
    return;
  }

  const reservaId = document.getElementById('formPago').dataset.reservaId 
                    || document.getElementById('reservaIdPago').value;
  if (!reservaId) {
    toast('No se encontró la reserva asociada al pago', 'danger');
    return;
  }

  // Recoger datos del formulario
  const numero = document.querySelector('#formPago input[placeholder="1234 5678 9012 3456"]').value.trim();
  const nombre = document.querySelector('#formPago input[placeholder="Juan Pérez"]').value.trim();
  const exp = document.querySelector('#formPago input[placeholder="MM/AA"]').value.trim();
  const cvv = document.querySelector('#formPago input[placeholder="123"]').value.trim();

  // Procesar sin restricciones
  const result = procesarPago({ reservaId, numero, exp, cvv, nombre });

  if (result.ok) {
    toast('✅ Pago completado correctamente');
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalPago'));
    modal?.hide();
  } else {
    toast(result.msg || 'Error al procesar el pago', 'danger');
  }
});*/




export default { renderInicio, renderVuelos, renderMisReservas, renderAdminPanel };
