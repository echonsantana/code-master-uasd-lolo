// src/services/loyaltyService.js
export class LoyaltyService {
  static calcularPuntos(monto, clase) {
    const multiplicadores = {
      economica: 1,
      economicaPlus: 1.5,
      business: 2,
      primera: 3
    };
    
    const puntosBase = Math.floor(monto / 10);
    return puntosBase * (multiplicadores[clase] || 1);
  }

  static obtenerNivel(puntosTotales) {
    if (puntosTotales >= 10000) return { nivel: 'Élite', beneficio: '50% bonus en puntos', color: '#dc3545' };
    if (puntosTotales >= 5000) return { nivel: 'Oro', beneficio: '25% bonus en puntos', color: '#ffc107' };
    if (puntosTotales >= 1000) return { nivel: 'Plata', beneficio: '10% bonus en puntos', color: '#6c757d' };
    return { nivel: 'Miembro', beneficio: 'Acceso básico', color: '#28a745' };
  }

  static obtenerBeneficios(nivel) {
    const beneficios = {
      Miembro: ['Acumulación de puntos', 'Ofertas exclusivas'],
      Plata: ['Embarque prioritario', 'Asientos con más espacio', 'Check-in express'],
      Oro: ['Acceso a salas VIP', 'Upgrade gratuito', 'Equipaje adicional'],
      Élite: ['Servicio de chauffeur', 'Suite en vuelo', 'Asistente personal']
    };
    return beneficios[nivel] || beneficios.Miembro;
  }
}