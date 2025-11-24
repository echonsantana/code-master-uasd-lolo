// src/controladores.js
import BaseDatos from './baseDatos.js';
import BaseDB from './baseDatos.js';
import { EmailNotificationService } from './services/emailNotificationService.js';

const db = new BaseDB();
function uid(prefix='id'){ return prefix + Math.random().toString(36).slice(2,9); }

export function registrarUsuario({ nombre, email, pass }){
  console.log('🔍 BUSCANDO USUARIO PARA EMAIL:', email);
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

// ✅ CORREGIDO: Función crearReserva mejorada
export function crearReserva({ clienteId, vueloId, asientos, total }){
  console.log('🎫 CREANDO RESERVA:', { clienteId, vueloId, asientos, total });
  
  const id = uid('R'); 
  const codigo = 'R'+Math.random().toString(36).slice(2,7).toUpperCase();
  
  const reserva = { 
    id, 
    codigo, 
    clienteId, 
    vueloId, 
    fecha: new Date().toISOString(), 
    asientos, 
    total: total || 0, 
    estado:'confirmada', 
    pagoEstado:'pendiente' 
  };
  
  console.log('📋 RESERVA A GUARDAR:', reserva);
  
  // ✅ CORREGIDO: Usar la función correcta de la base de datos
  const reservaCreada = db.crearReserva(reserva);
  
  if (reservaCreada) {
    console.log('✅ RESERVA GUARDADA EN BD:', reservaCreada);
    return { ok:true, reserva: reservaCreada };
  } else {
    console.error('❌ ERROR AL GUARDAR RESERVA');
    return { ok:false, msg:'Error al crear la reserva' };
  }
}

export function crearReservaValida({ clienteId, vueloId, asientos, total }) {
  console.log('🔍 DIAGNÓSTICO: crearReservaValida EJECUTÁNDOSE', { clienteId, vueloId, asientos, total });

  const vuelo = db.findVueloById(vueloId);
  if (!vuelo) {
      console.log('❌ Vuelo no encontrado');
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
  
  // ✅ CORREGIDO: Calcular total correctamente
  const precioBase = vuelo.precio || vuelo.tarifa || 0;
  const totalReserva = total || (precioBase * asientos.length);
  
  const reserva = {
    id, 
    codigo, 
    clienteId, 
    vueloId, 
    asientos,
    fecha: new Date().toISOString(),
    total: totalReserva,
    estado: 'confirmada',
    pagoEstado: 'pendiente'
  };
  
  console.log('📋 CREANDO RESERVA VÁLIDA:', reserva);
  
  const reservaCreada = db.crearReserva(reserva);
  
  if (!reservaCreada) {
    console.error('❌ ERROR AL CREAR RESERVA VÁLIDA');
    return null;
  }

  // ✅ ENVIAR EMAIL DE RESERVA
  const usuario = db.obtenerUsuarios().find(u => u.id === clienteId);
  if (usuario && usuario.email) {
    EmailNotificationService.enviarEmailReserva(usuario.email, reservaCreada, vuelo)
      .then(resultado => {
        if (resultado.success) {
          console.log('📧 Email de reserva enviado exitosamente a:', usuario.email);
        } else {
          console.warn('⚠️ Email de reserva no pudo enviarse:', resultado.message);
        }
      })
      .catch(error => {
        console.error('❌ Error enviando email de reserva:', error);
      });
  }

  // ✅ CORREGIDO: Usar toast global
  if (typeof window !== 'undefined' && window.showToast) {
    window.showToast('Reserva creada correctamente. Se ha enviado un email de confirmación.', 'success');
  } else {
    console.log('✅ Reserva creada correctamente');
  }
  
  return reservaCreada;
}

export function cancelarReserva(id){
  console.log('🗑️ CANCELANDO RESERVA:', id);
  const ok = db.cancelarReserva(id);
  return { ok };
}
/* función procesarPago *
export function procesarPago({ reservaId, numero, exp, cvv, nombre }) {
  console.log('💳 PROCESANDO PAGO PARA RESERVA:', reservaId);
  
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

  console.log('💰 PAGO A REGISTRAR:', pago);

  const pagoRegistrado = db.registrarPago(pago);

  if (pagoRegistrado) {
    console.log('✅ PAGO REGISTRADO CORRECTAMENTE');
    
    // ✅ CORREGIDO: Actualizar estado de pago de la reserva
    const r = db.obtenerReservas().find(x => x.id === reservaId);
    if (r) {
      r.pagoEstado = 'pagada';
      r.transaccion = pago.codigo;
      db._save(); // ✅ Guardar cambios
      console.log('✅ ESTADO DE RESERVA ACTUALIZADO A PAGADA');
    }
    
    return { ok: true, pago: pagoRegistrado };
  } else {
    console.error('❌ ERROR AL REGISTRAR PAGO');
    return { ok: false, msg: 'Error al registrar el pago' };
  }
}
*/

// En controladores.js - función procesarPago
export function procesarPago(datosPago) {
    const { reservaId, numero, exp, cvv, nombre, monto } = datosPago;
    
    console.log('💳 PROCESANDO PAGO:', datosPago);
    
    const db = new BaseDatos();
    const reserva = db.findReservaById(reservaId);
    
    if (!reserva) {
        return { ok: false, msg: 'Reserva no encontrada' };
    }
    
    if (reserva.estado === 'pagada') {
        return { ok: false, msg: 'Esta reserva ya fue pagada' };
    }
    
    // GENERAR CÓDIGO DE PAGO
    const codigoPago = 'PAG-' + Math.random().toString(36).substr(2, 8).toUpperCase();
    
    // USAR EL MONTO QUE VIENE EN LOS DATOS O CALCULARLO
    const montoFinal = monto || calcularMontoReserva(reserva); // ← AQUÍ ESTÁ LA CLAVE
    
    console.log('💰 MONTO A GUARDAR:', montoFinal);
    
    // CREAR REGISTRO DE PAGO
    const pago = {
        id: 'pago_' + Date.now(),
        codigo: codigoPago,
        reservaId: reservaId,
        monto: montoFinal, // ← GUARDAR EL MONTO
        fecha: new Date().toISOString(),
        metodo: 'tarjeta',
        estado: 'completado'
    };
    
    // GUARDAR PAGO EN LA BASE DE DATOS
    db.agregarPago(pago);
    
    // ACTUALIZAR ESTADO DE LA RESERVA
    db.actualizarReserva(reservaId, { 
        estado: 'confirmada',
        pagoEstado: 'pagada'
    });
    
    console.log('✅ PAGO REGISTRADO:', pago);
    
    return { 
        ok: true, 
        msg: 'Pago procesado correctamente',
        pago: pago 
    };
}

// Función auxiliar para calcular monto si no se proporciona
function calcularMontoReserva(reserva) {
    // Si la reserva ya tiene un monto, usarlo
    if (reserva.monto) {
        return reserva.monto;
    }
    
    // Si no, calcular basado en vuelo y asientos
    const db = new BaseDatos();
    const vuelo = db.findVueloById(reserva.vueloId);
    if (vuelo && vuelo.tarifa && reserva.asientos) {
        return vuelo.tarifa * reserva.asientos.length;
    }
    
    // Valor por defecto
    return 100;
}

export function obtenerPagos(){ 
  const pagos = db.obtenerPagos();
  console.log('📊 PAGOS OBTENIDOS:', pagos);
  return pagos; 
}

export function obtenerReservasActivas(userId) {
  console.log('🔍 OBTENIENDO RESERVAS PARA USUARIO:', userId);
  
  const db = new BaseDatos();
  const reservas = db.obtenerReservasByUser(userId);
  
  console.log('🔍 Reservas antes de filtrar:', reservas);
  
  // Filtrar SOLO reservas activas (no canceladas)
  const reservasActivas = reservas.filter(r => 
    r.estado !== 'cancelada'
  );
  
  console.log('🔍 Reservas después de filtrar:', reservasActivas);
  
  return {
    ok: true,
    reservas: reservasActivas,
    total: reservasActivas.length,
    mensaje: `Se encontraron ${reservasActivas.length} reservas activas`
  };
}

// ✅ CORREGIDO: Función toast global para usar en controladores
function toast(msg, type = 'primary') {
  if (typeof window !== 'undefined' && window.showToast) {
    window.showToast(msg, type);
  } else {
    console.log(`[${type.toUpperCase()}] ${msg}`);
  }
}