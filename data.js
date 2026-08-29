window.MODEL_MATCH = {
  categories: [
    {
      id: 'iconico',
      label: 'ICÓNICO',
      short: 'Icónico',
      micro: 'imagen a escala',
      color: '#ff9f43',
      desc: 'Imágenes a escala del sistema real.',
      icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.6"/><path d="m21 15-4.3-4.3a1 1 0 0 0-1.4 0L6 20"/></svg>'
    },
    {
      id: 'analogico',
      label: 'ANALÓGICO',
      short: 'Analógico',
      micro: 'comportamiento',
      color: '#2ee6c3',
      desc: 'Se asemejan al sistema real en su comportamiento y se basan en las propiedades.',
      icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 3v18h18"/><path d="m7 14 3-4 3 2 4-6"/></svg>'
    },
    {
      id: 'simbolico',
      label: 'SIMBÓLICO',
      short: 'Simbólico',
      micro: 'matemático',
      color: '#a78bfa',
      desc: 'Relaciones lógicas y matemáticas con variables y restricciones.',
      icon: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h9M4 12h9M4 17h6"/><path d="m16 5 5 5m0-5-5 5"/></svg>'
    }
  ],

  // Fuente: Gimnasio 2 de Optimización I — sección 2.1 Introducción a los
  // Modelos, "Clasificación de los Modelos" (p. 4) y "Clasificación de los
  // Modelos Simbólicos" (p. 5). Ejemplos y ecuaciones tomados del material.
  items: [
    // ---------- ICÓNICOS: imágenes a escala del sistema real ----------
    { id: 'globo',       display: { type: 'emoji', value: '🌍' }, label: 'Globo terráqueo',      hint: 'Imagen a escala del sistema real: el planeta', cat: 'iconico' },
    { id: 'foto',        display: { type: 'emoji', value: '📸' }, label: 'Fotografía del sistema', hint: 'Imagen directa del objeto real',             cat: 'iconico' },
    { id: 'plano',       display: { type: 'emoji', value: '📐' }, label: 'Plano a escala',       hint: 'Imagen a escala del edificio real',           cat: 'iconico' },
    { id: 'satelite',    display: { type: 'emoji', value: '🛰️' }, label: 'Fotografía satelital', hint: 'Imagen a escala del terreno real',            cat: 'iconico' },

    // ---------- ANALÓGICOS: se asemejan en su comportamiento / propiedades ----------
    { id: 'maqueta',     display: { type: 'emoji', value: '⚙️' }, label: 'Maqueta en funcionamiento', hint: 'Se asemeja al comportamiento y conserva propiedades del sistema real', cat: 'analogico' },
    { id: 'curva',       display: { type: 'emoji', value: '📈' }, label: 'Curva de demanda',      hint: 'Gráfica que refleja el comportamiento del mercado',      cat: 'analogico' },
    { id: 'flujo',       display: { type: 'emoji', value: '🔀' }, label: 'Diagrama de flujo',     hint: 'Representa el comportamiento del proceso',                cat: 'analogico' },
    { id: 'comportamiento', display: { type: 'emoji', value: '🔁' }, label: 'Diagrama de comportamiento', hint: 'Representa cómo cambia el sistema',                 cat: 'analogico' },

    // ---------- SIMBÓLICOS: relaciones lógicas y matemáticas (variables y restricciones) ----------
    { id: 'fobj',        display: { type: 'formula', value: 'Max Z = 5X₁ + 2X₂' }, label: 'Caso de bolsas',          hint: 'Función objetivo: utilidad de $5 por bolsa de lujo y $2 por normal', cat: 'simbolico' },
    { id: 'rhoras',      display: { type: 'formula', value: '2X₁ + X₂ ≤ 45' },      label: 'Límite de empaquetado',   hint: 'Restricción: máximo 45 horas de empaquetado',                         cat: 'simbolico' },
    { id: 'lineal',      display: { type: 'formula', value: 'y = 2x' },             label: 'Relación entre variables', hint: 'Ecuación lineal: relación matemática entre variables',                cat: 'simbolico' },
    { id: 'rgrafico',    display: { type: 'formula', value: '2x + y ≤ 80' },        label: 'Límite del modelo',       hint: 'Restricción que limita a las variables de decisión',                   cat: 'simbolico' }
  ]
};
