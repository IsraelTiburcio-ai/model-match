/* ============ MODEL MATCH — lógica del juego ============ */
(() => {
  'use strict';

  const { categories, items } = window.MODEL_MATCH;

  // ---------- referencias DOM ----------
  const $ = (id) => document.getElementById(id);
  const screens = {
    title: $('screen-title'),
    game: $('screen-game'),
    result: $('screen-result')
  };
  const btnPlay = $('btnPlay');
  const btnAgain = $('btnAgain');
  const btnHome = $('btnHome');
  const btnMute = $('btnMute');
  const timeValue = $('timeValue');
  const scoreValue = $('scoreValue');
  const scoreMax = $('scoreMax');
  const dotsEl = $('dots');
  const roundClock = $('roundClock');
  const roundProgress = $('roundProgress');
  const roundBar = $('roundBar');
  const roundSeconds = $('roundSeconds');
  const stage = $('stage');
  const card = $('card');
  const cardDisplay = $('cardDisplay');
  const cardLabel = $('cardLabel');
  const cardHint = $('cardHint');
  const deck = $('deck');
  const srStatus = $('srStatus');
  const resultEmoji = $('resultEmoji');
  const resultTitle = $('resultTitle');
  const resultScore = $('resultScore');
  const resultTime = $('resultTime');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- estado ----------
  const TOTAL = 8;
  let queue = [];
  let index = 0;
  let score = 0;
  let outcomes = [];
  let startTs = 0;
  let timerId = null;
  const ROUND_LIMIT_MS = 6000;
  let roundTimerId = null;
  let roundStartTs = 0;
  let locked = false;
  let playing = false;

  // ---------- utilidades ----------
  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const catById = (id) => categories.find((c) => c.id === id);

  // 8 ítems garantizando ≥2 de cada categoría
  function buildQueue() {
    const byCat = categories.map((c) => shuffle(items.filter((it) => it.cat === c.id)));
    const picked = byCat.flatMap((group) => group.slice(0, 2));
    const rest = shuffle(byCat.flatMap((group) => group.slice(2)));
    return shuffle([...picked, ...rest.slice(0, TOTAL - picked.length)]);
  }

  // ---------- audio (Web Audio API, sin archivos) ----------
  let audioCtx = null;
  let muted = localStorage.getItem('mm_muted') === '1';

  function updateMuteUI() {
    btnMute.dataset.muted = String(muted);
    btnMute.textContent = muted ? '🔇' : '🔊';
    btnMute.setAttribute('aria-pressed', String(muted));
    btnMute.setAttribute('aria-label', muted ? 'Activar sonido' : 'Silenciar sonido');
  }

  function ctx() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        try { audioCtx = new AC(); } catch (_) { return null; }
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      const resume = audioCtx.resume();
      if (resume && typeof resume.catch === 'function') resume.catch(() => {});
    }
    return audioCtx;
  }

  function primeAudio() {
    if (!muted) ctx();
  }

  function tone(freq, delay, dur, type = 'sine', peak = 0.18) {
    const ac = ctx();
    if (!ac || muted) return;
    const t0 = ac.currentTime + delay;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  const sfx = {
    tap: () => tone(600, 0, 0.07, 'sine', 0.1),
    ok: () => { tone(660, 0, 0.12, 'triangle', 0.16); tone(880, 0.09, 0.16, 'triangle', 0.16); },
    bad: () => { tone(190, 0, 0.22, 'sawtooth', 0.12); tone(140, 0.1, 0.24, 'sawtooth', 0.12); },
    finish: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.18, 'triangle', 0.15)); }
  };

  // ---------- partículas / efectos ----------
  function burst(x, y, color, n = 14) {
    if (reducedMotion) return;
    for (let i = 0; i < n; i++) {
      const p = document.createElement('span');
      p.className = 'particle';
      p.style.background = i % 3 === 0 ? '#ffffff' : color;
      p.style.left = x + 'px';
      p.style.top = y + 'px';
      document.body.appendChild(p);
      const ang = Math.random() * Math.PI * 2;
      const dist = 42 + Math.random() * 62;
      const dx = Math.cos(ang) * dist;
      const dy = Math.sin(ang) * dist - 26;
      p.animate(
        [
          { transform: 'translate(0,0) scale(1)', opacity: 1 },
          { transform: `translate(${dx}px, ${dy}px) scale(0.2)`, opacity: 0 }
        ],
        { duration: 520 + Math.random() * 260, easing: 'cubic-bezier(0.15, 0.8, 0.3, 1)' }
      ).onfinish = () => p.remove();
    }
  }

  function floatScore(x, y, text, color) {
    if (reducedMotion) return;
    const el = document.createElement('span');
    el.className = 'float-score';
    el.textContent = text;
    el.style.color = color;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    document.body.appendChild(el);
    el.animate(
      [
        { transform: 'translate(-50%, 0)', opacity: 1 },
        { transform: 'translate(-50%, -46px)', opacity: 0 }
      ],
      { duration: 750, easing: 'ease-out' }
    ).onfinish = () => el.remove();
  }

  function flyToButton(sourceEl, targetBtn) {
    if (reducedMotion) return;
    const s = sourceEl.getBoundingClientRect();
    const t = targetBtn.getBoundingClientRect();
    const ghost = sourceEl.cloneNode(true);
    ghost.style.cssText = `position:fixed;z-index:25;margin:0;left:${s.left}px;top:${s.top}px;width:${s.width}px;height:${s.height}px;pointer-events:none;`;
    document.body.appendChild(ghost);
    const dx = t.left + t.width / 2 - (s.left + s.width / 2);
    const dy = t.top + t.height / 2 - (s.top + s.height / 2);
    ghost.animate(
      [
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.12)`, opacity: 0 }
      ],
      { duration: 430, easing: 'cubic-bezier(0.4, 0, 0.6, 1)' }
    ).onfinish = () => ghost.remove();
  }

  function toast(text, ok) {
    const el = document.createElement('div');
    el.className = 'toast ' + (ok ? 'ok' : 'bad');
    el.setAttribute('aria-hidden', 'true');
    el.textContent = text;
    stage.appendChild(el);
    setTimeout(() => el.remove(), 950);
  }

  // ---------- pantallas ----------
  function show(name) {
    Object.entries(screens).forEach(([key, el]) => {
      el.classList.toggle('active', key === name);
      el.setAttribute('aria-hidden', String(key !== name));
    });
  }

  // ---------- HUD ----------
  function renderHud() {
    timeValue.textContent = Math.floor((Date.now() - startTs) / 1000) + ' s';
  }

  function clearRoundTimer() {
    clearInterval(roundTimerId);
    roundTimerId = null;
  }

  function renderRoundTimer(remaining) {
    const value = Math.max(0, Math.min(ROUND_LIMIT_MS, remaining));
    const ratio = value / ROUND_LIMIT_MS;
    roundBar.style.width = `${ratio * 100}%`;
    roundSeconds.textContent = `${Math.ceil(value / 1000)} s`;
    roundProgress.setAttribute('aria-valuenow', String(Math.round(value)));
    roundClock.classList.toggle('urgent', value <= 2000 && value > 0);
  }

  function startRoundTimer() {
    clearRoundTimer();
    roundStartTs = performance.now();
    renderRoundTimer(ROUND_LIMIT_MS);
    roundTimerId = setInterval(() => {
      const remaining = ROUND_LIMIT_MS - (performance.now() - roundStartTs);
      renderRoundTimer(remaining);
      if (remaining <= 0) {
        clearRoundTimer();
        choose(null, null, true);
      }
    }, 50);
  }

  function renderDots() {
    dotsEl.innerHTML = '';
    for (let i = 0; i < TOTAL; i++) {
      const d = document.createElement('span');
      const state = outcomes[i] === true ? ' ok' : outcomes[i] === false ? ' bad' : '';
      d.className = 'dot' + state + (i === index ? ' now' : '');
      dotsEl.appendChild(d);
    }
  }

  function markDot(i, ok) {
    outcomes[i] = ok;
    const d = dotsEl.children[i];
    if (d) d.classList.add(ok ? 'ok' : 'bad');
  }

  // ---------- juego ----------
  function renderCard() {
    const item = queue[index];
    card.classList.remove('is-correct', 'is-wrong');
    card.style.animation = 'none';
    void card.offsetWidth; // reinicia animación de entrada
    card.style.animation = '';
    if (item.display.type === 'formula') {
      cardDisplay.innerHTML = `<span class="formula">${item.display.value}</span>`;
    } else {
      cardDisplay.innerHTML = `<span class="emoji" role="img" aria-label="${item.label}">${item.display.value}</span>`;
    }
    cardLabel.textContent = item.label;
    cardHint.textContent = '';
    cardHint.classList.add('is-hidden');
    startRoundTimer();
  }

  function startGame() {
    // El primer gesto debe desbloquear el audio antes de que pueda vencer el reloj.
    primeAudio();
    queue = buildQueue();
    index = 0;
    score = 0;
    outcomes = Array(TOTAL).fill(null);
    locked = false;
    playing = true;
    scoreValue.textContent = '0';
    scoreMax.textContent = '/' + TOTAL;
    startTs = Date.now();
    renderHud();
    renderDots();
    renderCard();
    show('game');
    clearInterval(timerId);
    timerId = setInterval(renderHud, 250);
    srStatus.textContent = 'Juego iniciado. Clasifica cada modelo.';
  }

  function choose(catId, btn, timedOut = false) {
    if (!playing || locked) return;
    locked = true;
    clearRoundTimer();
    if (!timedOut) sfx.tap();

    const item = queue[index];
    const ok = catId === item.cat;
    const correctBtn = deck.querySelector(`[data-cat="${item.cat}"]`);
    cardHint.textContent = item.hint;
    cardHint.classList.remove('is-hidden');

    if (ok) {
      score++;
      scoreValue.textContent = String(score);
      sfx.ok();
      card.classList.add('is-correct');
      btn.classList.add('is-correct');
      deck.classList.add('locked');
      const r = btn.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, catById(catId).color);
      flyToButton(cardDisplay, btn);
      floatScore(r.left + r.width / 2, r.top - 6, '+1', 'var(--good)');
      toast('¡Correcto!', true);
      srStatus.textContent = `Correcto. ${item.label} es un modelo ${catById(catId).short.toLowerCase()}. ${catById(catId).desc}`;
      markDot(index, true);
    } else {
      sfx.bad();
      card.classList.add('is-wrong');
      if (btn) btn.classList.add('is-wrong');
      correctBtn.classList.add('is-reveal');
      deck.classList.add('locked');
      stage.classList.add('shake');
      if (navigator.vibrate) { try { navigator.vibrate(60); } catch (_) {} }
      const prefix = timedOut ? '¡Tiempo! ' : '';
      toast(`${prefix}Era: ${catById(item.cat).label}`, false);
      srStatus.textContent = `${timedOut ? 'Se acabó el tiempo. ' : 'Incorrecto. '}${item.label} es un modelo ${catById(item.cat).short.toLowerCase()}. ${catById(item.cat).desc}`;
      markDot(index, false);
    }

    const wait = ok ? 720 : 1250;
    setTimeout(() => {
      stage.classList.remove('shake');
      deck.classList.remove('locked');
      deck.querySelectorAll('.cat-btn').forEach((b) => b.classList.remove('is-correct', 'is-wrong', 'is-reveal'));
      index++;
      if (index >= TOTAL) endGame();
      else { renderDots(); renderCard(); locked = false; }
    }, wait);
  }

  function verdict(n) {
    if (n === TOTAL) return { emoji: '🏆', text: '¡Perfecto!' };
    if (n >= 6) return { emoji: '🌟', text: '¡Excelente!' };
    if (n >= 4) return { emoji: '💪', text: '¡Bien hecho!' };
    return { emoji: '📚', text: '¡Sigue practicando!' };
  }

  function endGame() {
    playing = false;
    clearInterval(timerId);
    clearRoundTimer();
    const secs = Math.max(1, Math.round((Date.now() - startTs) / 1000));
    const v = verdict(score);
    resultEmoji.textContent = v.emoji;
    resultTitle.textContent = v.text;
    resultScore.textContent = `${score}/${TOTAL}`;
    resultTime.textContent = `${secs} s`;
    sfx.finish();
    srStatus.textContent = `Fin del juego. Aciertos: ${score} de ${TOTAL}. Tiempo: ${secs} segundos. ${v.text}`;
    show('result');
    btnAgain.focus({ preventScroll: true });
  }

  // ---------- construcción de UI ----------
  function buildDeck() {
    deck.innerHTML = '';
    categories.forEach((c, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cat-btn';
      b.dataset.cat = c.id;
      b.style.setProperty('--cat', c.color);
      b.setAttribute('aria-label', `${c.label}: ${c.desc}`);
      b.innerHTML = `
        <span class="cat-ico" aria-hidden="true">${c.icon}</span>
        <span class="cat-name">
          <span class="cat-label">${c.label}</span>
          <span class="cat-micro">${c.micro}</span>
        </span>
        <span class="kbd" aria-hidden="true">${i + 1}</span>`;
      b.addEventListener('click', () => choose(c.id, b));
      deck.appendChild(b);
    });
  }

  function buildLegend() {
    document.querySelectorAll('.legend-chip').forEach((chip) => {
      const c = catById(chip.dataset.cat);
      if (!c) return;
      chip.style.setProperty('--cat', c.color);
      chip.innerHTML = `
        <span class="chip-icon" aria-hidden="true">${c.icon}</span>
        <span class="chip-text">
          <span class="chip-label">${c.short}</span>
          <span class="chip-micro">${c.micro}</span>
        </span>`;
    });
  }

  // ---------- eventos ----------
  btnPlay.addEventListener('click', startGame);
  btnAgain.addEventListener('click', startGame);
  btnHome.addEventListener('click', () => show('title'));

  btnMute.addEventListener('click', () => {
    muted = !muted;
    localStorage.setItem('mm_muted', muted ? '1' : '0');
    updateMuteUI();
    if (!muted) sfx.tap();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'm' || e.key === 'M') { btnMute.click(); return; }
    if (screens.game.classList.contains('active')) {
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= categories.length) {
        const c = categories[n - 1];
        choose(c.id, deck.querySelector(`[data-cat="${c.id}"]`));
      }
    }
  });

  // desbloquea el AudioContext con el primer gesto
  document.addEventListener('pointerdown', () => ctx(), { once: true });

  // ---------- init ----------
  buildDeck();
  buildLegend();
  updateMuteUI();
  scoreMax.textContent = '/' + TOTAL;
})();
