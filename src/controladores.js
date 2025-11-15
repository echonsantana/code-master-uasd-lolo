// src/controladores.js
import BaseDatos from './baseDatos.js'; // si no está arriba del todo, añádelo

import BaseDB from './baseDatos.js';

const db = new BaseDB();
function uid(prefix='id'){ return prefix + Math.random().toString(36).slice(2,9); }

export function registrarUsuario({ nombre, email, pass }){
  const u = db.obtenerUsuarios().find(x=> x.email===email);
  if(u) return { ok:false, msg:'Email ya registrado' };
  const nuevo = { id: uid('u'), nombre, email, pass };
  db.agregarUsuario(nuevo);
  return { ok:true, usuario:nuevo };
}

export function loginUsuario(email, pass){
  const u = db.obtenerUsuarios().find(x=> x.email===email && x.pass===pass);
  if(!u) return { ok:false, msg:'Credenciales inválidas' };
  return { ok:true, usuario:u };
}

export function listarVuelos(){ return db.obtenerVuelos(); }

export function crearReserva({ clienteId, vueloId, asientos }){
  const id = uid('R'); const codigo = 'R'+Math.random().toString(36).slice(2,7).toUpperCase();
  const reserva = { id, codigo, clienteId, vueloId, fecha: new Date().toISOString(), asientos, total:0, estado:'confirmada', pagoEstado:'pendiente' };
  const vuelo = db.findVueloById(vueloId); reserva.total = (vuelo && vuelo.tarifa) ? vuelo.tarifa * asientos.length : 0;
  db.crearReserva(reserva);
  return { ok:true, reserva };
}

//
export function crearReservaValida({ clienteId, vueloId, asientos }) {
  const vuelo = db.findVueloById(vueloId);
  if (!vuelo) {
    toast('Vuelo no encontrado', 'danger');
    return null;
  }

  // Verificar duplicados
  const duplicado = db.obtenerReservas().some(r =>
    r.clienteId === clienteId &&
    r.vueloId === vueloId
  );
  if (duplicado) {
    toast('Ya existe una reserva para este vuelo', 'danger');
    return null;
  }

  // Verificar asientos disponibles
  const asientosReservados = vuelo.asientosReservados || [];
  const asientosDisponibles = vuelo.asientosTotales - asientosReservados.length;
  if ((asientos?.length || 0) > asientosDisponibles) {
    toast('No hay suficientes asientos disponibles', 'danger');
    return null;
  }

  // Marcar los asientos como reservados
  vuelo.asientosReservados = [...asientosReservados, ...asientos];

  // Crear reserva
  const id = uid('R');
  const codigo = 'R' + Math.random().toString(36).slice(2,7).toUpperCase();
  const reserva = {
    id, codigo, clienteId, vueloId, asientos,
    fecha: new Date().toISOString(),
    total: vuelo.tarifa * asientos.length,
    estado: 'confirmada',
    pagoEstado: 'pendiente'
  };
  db.crearReserva(reserva);

  toast('Reserva creada correctamente', 'success');
  return reserva;
}

//

export function cancelarReserva(id){
  const ok = db.cancelarReserva(id);
  return { ok };
}

export function procesarPago({ reservaId, numero, exp, cvv, nombre }) {
  if (!reservaId) return { ok: false, msg: 'Falta el ID de la reserva' };

  const reserva = db.obtenerReservas().find(r => r.id === reservaId);
  if (!reserva) return { ok: false, msg: 'Reserva no encontrada' };

  const pago = {
    id: 'P' + Math.random().toString(36).slice(2, 8).toUpperCase(),
    codigo: 'PAY' + Math.random().toString(36).slice(2, 8).toUpperCase(),
    reservaId,
    clienteId: reserva.clienteId,
    monto: reserva.total || 0,
    metodo: 'Tarjeta',
    nombre: nombre || 'Sin nombre',
    fecha: new Date().toISOString(),
    estado: 'Completado'
  };

  db.registrarPago(pago);

  const r = db.obtenerReservas().find(x => x.id === reservaId);
  if (r) {
    r.pagoEstado = 'pagada';
    r.transaccion = pago.codigo;
    db._save();
  }

  return { ok: true, pago };
}




export function obtenerPagos(){ return db.obtenerPagos(); }
