// preload.js
// Este script prellena el localStorage solo si no existe

const defaultData = {
  "aero_premium_v1": {
    "usuarios": [s
      { "id": "u1", "nombre": "Agente Admin", "email": "admin@vuela.com", "pass": "admin123", "rol": "admin" }
    ],
    "vuelos": [
      { "id": "F1001", "numero": "F1001", "origen": "Santo Domingo (SDQ)", "destino": "Punta Cana (PUJ)", "fecha": "2025-11-20", "aerolinea": "AeroDominicana", "asientosTotales": 30, "asientosReservados": [], "precio": 60, "estado": "A tiempo" },
      { "id": "F1002", "numero": "F1002", "origen": "Santo Domingo (SDQ)", "destino": "Santiago (STI)", "fecha": "2025-11-21", "aerolinea": "AeroCaribe", "asientosTotales": 24, "asientosReservados": [], "precio": 55, "estado": "A tiempo" },
      { "id": "F3001", "numero": "F3001", "origen": "Santo Domingo (SDQ)", "destino": "New York (JFK)", "fecha": "2025-11-30", "aerolinea": "IslandAir", "asientosTotales": 100, "asientosReservados": [], "precio": 320, "estado": "A tiempo" }
    ],
    "reservas": [],
    "pagos": []
  }
};

// Solo agrega los datos si no existen
for (const key in defaultData) {
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, JSON.stringify(defaultData[key]));
  }
}
