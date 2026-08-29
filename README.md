# MODEL MATCH

**Subtítulo:** Clasifica el modelo correcto

Microjuego educativo arcade, mobile-first, para reforzar la **clasificación de los modelos**: **Icónico · Analógico · Simbólico**.

- **Tema académico:** Optimización I — Gimnasio 2 ("Modelos de Programación Lineal"), sección **2.1 Introducción a los Modelos → Clasificación de los Modelos** (p. 4) y **Clasificación de los Modelos Simbólicos** (p. 5).
- **Mecánica:** Aparece en pantalla un modelo (imagen, maqueta, gráfica o fórmula) y el jugador tiene **6 segundos** para clasificarlo tocando una de las 3 categorías. La pista se revela después de responder como feedback académico. Hay sonido opcional, partículas y vibración visual al fallar.
- **Duración:** 8 clasificaciones por partida ≈ **45–60 segundos** como máximo con la cuenta regresiva activa.
- **Fuente académica:** Material oficial del Gimnasio 2 de la profesora (PDF). Las definiciones y ejemplos provienen directamente del material:
  - **Icónicos:** imágenes a escala del sistema real (globo terráqueo, fotografía, plano).
  - **Analógicos:** se asemejan al sistema real en su comportamiento y se basan en las propiedades (maqueta en funcionamiento, curva de demanda, diagrama de flujo, diagrama de comportamiento).
  - **Simbólicos:** relaciones lógicas y matemáticas con variables y restricciones (`Max Z = 5X₁ + 2X₂`, `2X₁ + X₂ ≤ 45`, etc., tomadas de los ejemplos del material).

## Cómo jugar

1. Toca **JUGAR**.
2. Clasifica 8 modelos tocando **ICÓNICO**, **ANALÓGICO** o **SIMBÓLICO**.
3. Al final ves tus aciertos, tu tiempo y puedes **JUGAR OTRA VEZ**.

En desktop también funciona con teclado: `1` `2` `3` para responder, `M` para silenciar.

## Correr localmente

No hay build: es HTML + CSS + JS vanilla.

```bash
# opción 1: abrir directo
open index.html

# opción 2: servidor local
python3 -m http.server 8000
# → http://localhost:8000
```

## URL pública

https://israeltiburcio-ai.github.io/model-match/

El deploy es automático a **GitHub Pages** vía GitHub Actions (`.github/workflows/pages.yml`) en cada push a `main`.

## Estructura

```
index.html      → estructura del juego
styles.css      → estilos (mobile-first, 390×844 de referencia)
script.js       → lógica del juego, audio y efectos
data.js         → categorías e ítems (contenido académico)
assets/         → favicon
.github/workflows/pages.yml → deploy automático
```

## Accesibilidad

Contraste alto, focus visible, objetivos táctiles grandes, feedback no dependiente solo del color (íconos + etiquetas), soporte de teclado, `aria-live` para lectores de pantalla y soporte de `prefers-reduced-motion`.
