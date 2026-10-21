import { faceSVG, BACK, esc } from './arte.js';
import { DECK, byId, SPREADS, spreadById, AREAS, MOODS } from './dados.js';

/* ============ Estado ============ */
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
};
const perfil = Object.assign({ nome: '', nasc: '', area: 'Autoconhecimento', humor: '' }, store.get('espelho.perfil', {}));
const st = { step: 1, q: '', spread: 'tempo', suggested: 'tempo', userPicked: false, deck: [], picks: [], revealed: [], reading: '', ctl: null, readingDone: false };

const $ = (id) => document.getElementById(id);
const el = (tag, attrs, html) => { const e = document.createElement(tag); if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]); if (html != null) e.innerHTML = html; return e; };
const rand = (n) => { try { const a = new Uint32Array(1); crypto.getRandomValues(a); return a[0] % n; } catch (e) { return Math.floor(Math.random() * n); } };
const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rand(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* ============ Navegação ============ */
const views = ['consulta', 'baralho', 'diario'];
let baralhoPronto = false;
const showView = (v) => {
  views.forEach((x) => { $('v-' + x).hidden = x !== v; });
  document.querySelectorAll('.nav button').forEach((b) => b.setAttribute('aria-current', b.dataset.view === v ? 'page' : 'false'));
  setDark(v === 'consulta' && st.step >= 3);
  if (v === 'baralho' && !baralhoPronto) { baralhoPronto = true; renderBaralho('maiores'); }
  if (v === 'diario') renderDiario();
  window.scrollTo({ top: 0 });
};
const setDark = (on) => document.body.classList.toggle('escuro', !!on);
document.querySelectorAll('.nav button').forEach((b) => b.addEventListener('click', () => showView(b.dataset.view)));
$('brand').addEventListener('click', () => showView('consulta'));

const STEP_LABELS = ['Seus dados', 'Pergunta', 'Cartas', 'Leitura'];
const renderSteps = () => {
  $('steps').innerHTML = STEP_LABELS.map((l, i) => {
    const n = i + 1, cls = n < st.step ? 'feito' : n === st.step ? 'atual' : '';
    return `<li class="${cls}"${n === st.step ? ' aria-current="step"' : ''}><span class="n">${n}</span>${l}</li>`;
  }).join('');
};
const goStep = (n) => {
  st.step = n;
  [1, 2, 3, 4].forEach((i) => { $('s' + i).hidden = i !== n; });
  renderSteps();
  setDark(n >= 3);
  window.scrollTo({ top: 0 });
};
document.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => goStep(+b.dataset.go)));

/* ============ Etapa 1 ============ */
const chipGroup = (box, list, key, allowNone) => {
  const render = () => {
    box.innerHTML = '';
    list.forEach((label) => {
      const b = el('button', { type: 'button', class: 'chip', 'aria-pressed': String(perfil[key] === label) }, esc(label));
      b.addEventListener('click', () => { perfil[key] = allowNone && perfil[key] === label ? '' : label; render(); });
      box.appendChild(b);
    });
  };
  render();
};
chipGroup($('areas'), AREAS, 'area', false);
chipGroup($('humores'), MOODS, 'humor', true);
$('nome').value = perfil.nome;
$('nasc').value = perfil.nasc;
$('hero').innerHTML = ['M1', 'M18', 'M21'].map((id) => `<div class="c">${faceSVG(byId[id])}</div>`).join('');
$('f-dados').addEventListener('submit', (e) => {
  e.preventDefault();
  perfil.nome = $('nome').value.trim();
  perfil.nasc = $('nasc').value;
  if (!perfil.nome) { $('nome-erro').hidden = false; $('nome').focus(); return; }
  $('nome-erro').hidden = true;
  store.set('espelho.perfil', perfil);
  $('q-title').textContent = `Qual é a sua pergunta, ${perfil.nome}?`;
  updateSuggestion();
  goStep(2);
});

/* ============ Etapa 2 ============ */
const suggest = (q, area) => {
  const t = ' ' + q.toLowerCase() + ' ';
  if (/ ou /.test(t)) return 'escolha';
  if (/\b(hoje|meu dia)\b/.test(t)) return 'dia';
  if (/(namor|relacion|casament|marido|esposa|parceir|crush|ex |amizade|amig[oa]|mãe|pai |famíl)/.test(t) || area === 'Amor e relações') return 'relacao';
  if (/^\s*(devo|vou|vai|será|sera|ele |ela |consigo)\b/.test(q.toLowerCase()) && q.length < 90) return 'simnao';
  if (area === 'Uma decisão') return 'problema';
  if (area === 'Autoconhecimento') return 'psique';
  if (area === 'Trabalho e dinheiro') return 'problema';
  return 'tempo';
};
const updateSuggestion = () => {
  st.suggested = suggest(st.q, perfil.area);
  if (!st.userPicked) st.spread = st.suggested;
  renderSpread();
};
const renderSpread = () => {
  const sp = spreadById[st.spread];
  $('sp-nome').textContent = sp.name;
  $('sp-sobre').textContent = sp.about;
  $('sug-badge').hidden = st.spread !== st.suggested;
  $('sp-slots').innerHTML = sp.pos.map((p, i) => `<li><div class="slot-box">${i + 1}</div>${esc(p)}</li>`).join('');
  const box = $('spreads');
  box.innerHTML = '';
  SPREADS.forEach((s) => {
    const b = el('button', { type: 'button', class: 'spread-opt', 'aria-pressed': String(s.id === st.spread) },
      `<b>${esc(s.name)}</b><span>${s.pos.length === 1 ? '1 carta' : s.pos.length + ' cartas'}: ${esc(s.pos.join(', '))}</span>`);
    b.addEventListener('click', () => { st.spread = s.id; st.userPicked = true; renderSpread(); });
    box.appendChild(b);
  });
};
$('pergunta').addEventListener('input', () => {
  st.q = $('pergunta').value;
  $('contador').textContent = `${st.q.length} de 300`;
  if (st.q.trim()) $('perg-erro').hidden = true;
  updateSuggestion();
});
$('b-embaralhar').addEventListener('click', () => {
  st.q = $('pergunta').value.trim();
  if (!st.q) { $('perg-erro').hidden = false; $('pergunta').focus(); return; }
  startPick();
});

/* ============ Etapa 3 ============ */
const startPick = () => {
  const sp = spreadById[st.spread];
  st.deck = shuffle(DECK.map((c) => c.id));
  st.picks = [];
  $('echo-q').textContent = st.q;
  $('pick-title').textContent = sp.pos.length === 1 ? 'Escolha uma carta' : `Escolha ${['', 'uma', 'duas', 'três', 'quatro', 'cinco'][sp.pos.length]} cartas`;
  goStep(3);
  $('shuffle').innerHTML = BACK + BACK + BACK;
  $('shuffle-zone').hidden = false;
  $('deck').hidden = true;
  $('s3').classList.add('shuffling');
  renderPickBar();
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  setTimeout(() => {
    $('s3').classList.remove('shuffling');
    $('shuffle-zone').hidden = true;
    renderDeck();
    $('deck').hidden = false;
  }, reduce ? 50 : 1600);
};
const renderDeck = () => {
  const need = spreadById[st.spread].pos.length;
  const box = $('deck');
  box.innerHTML = '';
  st.deck.slice(0, 24).forEach((id, i) => {
    const idx = st.picks.findIndex((p) => p.id === id);
    const sel = idx >= 0;
    const b = el('button', { type: 'button', class: 'pick', 'aria-pressed': String(sel), 'aria-label': sel ? `Carta ${i + 1}, escolhida em ${idx + 1}º lugar` : `Carta ${i + 1}` },
      BACK + (sel ? `<span class="ord">${idx + 1}</span>` : ''));
    if (!sel && st.picks.length >= need) b.disabled = true;
    b.addEventListener('click', () => {
      if (sel) st.picks.splice(idx, 1);
      else if (st.picks.length < need) st.picks.push({ id, rev: rand(100) < 30 });
      renderDeck(); renderPickBar();
    });
    box.appendChild(b);
  });
};
const renderPickBar = () => {
  const sp = spreadById[st.spread];
  $('pick-slots').innerHTML = sp.pos.map((p, i) => `<li>${i < st.picks.length ? `<div style="width:72px">${BACK}</div>` : `<div class="slot-box">${i + 1}</div>`}${esc(p)}</li>`).join('');
  const left = sp.pos.length - st.picks.length;
  const b = $('b-revelar');
  b.disabled = left > 0;
  b.textContent = left === 0 ? 'Revelar as cartas' : left === 1 ? 'Falta 1 carta' : `Faltam ${left} cartas`;
};
$('b-reemb').addEventListener('click', startPick);
$('b-revelar').addEventListener('click', startReveal);

/* ============ Etapa 4 ============ */
function startReveal() {
  const sp = spreadById[st.spread];
  st.revealed = sp.pos.map(() => false);
  st.reading = ''; st.readingDone = false;
  $('read-meta').textContent = `Tiragem ${sp.name}, para a pergunta de ${perfil.nome}`;
  $('read-q').textContent = st.q;
  $('reading').hidden = true;
  $('reading-body').innerHTML = '';
  $('reading-actions').hidden = true;
  $('reading-note').hidden = true;
  $('year').hidden = true;
  $('acao-status').textContent = '';
  $('reveal-actions').hidden = false;
  $('flip-hint').hidden = false;
  const table = $('table');
  table.innerHTML = '';
  st.picks.forEach((p, i) => {
    const card = byId[p.id];
    const place = el('figure', { class: 'place', style: 'margin:0' });
    place.innerHTML = `<figcaption class="pos">${esc(sp.pos[i])}</figcaption>
      <button type="button" class="flip" aria-label="Revelar a carta da posição ${esc(sp.pos[i])}"><div class="inner"><div class="side">${BACK}</div><div class="side front${p.rev ? ' inv' : ''}">${faceSVG(card)}</div></div></button>
      <div class="cardname" hidden></div>`;
    const btn = place.querySelector('.flip');
    btn.addEventListener('click', () => reveal(i));
    table.appendChild(place);
  });
  goStep(4);
}
const reveal = (i) => {
  if (st.revealed[i]) return;
  st.revealed[i] = true;
  const place = $('table').children[i];
  const p = st.picks[i], card = byId[p.id];
  const btn = place.querySelector('.flip');
  btn.classList.add('open');
  btn.disabled = true;
  btn.setAttribute('aria-label', `${card.name}${p.rev ? ', invertida' : ''}`);
  const nm = place.querySelector('.cardname');
  nm.hidden = false;
  nm.innerHTML = `${esc(card.name)}${p.rev ? '<div style="margin-top:6px"><span class="tag-inv">Invertida</span></div>' : ''}`;
  if (st.revealed.every(Boolean)) {
    $('reveal-actions').hidden = true;
    $('flip-hint').hidden = true;
    setTimeout(startReading, 700);
  }
};
$('b-todas').addEventListener('click', () => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  st.revealed.forEach((r, i) => { if (!r) setTimeout(() => reveal(i), reduce ? 0 : i * 450); });
});

const reduceNum = (n) => { while (n > 22) n = String(n).split('').reduce((a, b) => a + +b, 0); return n === 22 ? 0 : n; };
const personalYear = () => {
  if (!perfil.nasc) return null;
  const [, m, d] = perfil.nasc.split('-').map(Number);
  if (!m || !d) return null;
  const y = new Date().getFullYear();
  return { year: y, card: byId['M' + reduceNum(d + m + String(y).split('').reduce((a, b) => a + +b, 0))] };
};

const renderReadingText = (txt) => {
  const blocks = [];
  let cur = null;
  txt.split(/\n/).forEach((line) => {
    const t = line.trim();
    if (!t) { cur = null; return; }
    if (/^#{1,4}\s/.test(t)) { blocks.push({ h: t.replace(/^#{1,4}\s*/, '').replace(/\*\*/g, '') }); cur = null; return; }
    const clean = t.replace(/\*\*(.+?)\*\*/g, '$1').replace(/^[-*]\s+/, '');
    if (cur) cur.p += ' ' + clean; else { cur = { p: clean }; blocks.push(cur); }
  });
  let html = '', inTake = false;
  blocks.forEach((b) => {
    if (b.h) { inTake = /pergunta para levar/i.test(b.h); html += inTake ? `<div class="take"><h3 style="font-size:15px;font-family:var(--body);font-weight:500;color:var(--citrinitas);margin:0 0 6px">${esc(b.h)}</h3>` : `<h3>${esc(b.h)}</h3>`; if (inTake) html += '<!--take-->'; }
    else html += `<p>${esc(b.p)}</p>`;
  });
  html = html.replace(/<!--take-->([\s\S]*)$/, '$1</div>');
  $('reading-body').innerHTML = html;
};

const localReading = () => {
  const sp = spreadById[st.spread];
  const parts = st.picks.map((p, i) => {
    const c = byId[p.id];
    return `## ${sp.pos[i]}: ${c.name}${p.rev ? ', invertida' : ''}\n${p.rev ? 'Invertida, esta carta' : 'Esta carta'} fala de ${p.rev ? c.rev : c.up}. Na posição ${sp.pos[i].toLowerCase()}, ela pede que você observe onde isso aparece na sua pergunta. ${c.kind === 'major' ? `É um arcano maior, ligado ao arquétipo ${c.arch.toLowerCase().replace(/^o |^a /, '')}: um tema de fundo, maior do que a situação do momento.` : `Pertence a ${c.suit.name}, elemento ${c.suit.el.toLowerCase()}, a função ${c.suit.fn}.`}`;
  });
  const majors = st.picks.filter((p) => byId[p.id].kind === 'major').length;
  const revs = st.picks.filter((p) => p.rev).length;
  const syn = `${majors > st.picks.length / 2 ? 'A maioria das cartas é de arcanos maiores, sinal de que a pergunta toca em algo profundo da sua história.' : 'Os arcanos menores predominam, então a resposta está mais no dia a dia do que em grandes viradas.'} ${revs ? `${revs === 1 ? 'Uma carta veio invertida' : revs + ' cartas vieram invertidas'}: ali há energia travada ou voltada para dentro.` : 'Nenhuma carta veio invertida, e as energias fluem sem grandes bloqueios.'}`;
  const qs = ['O que você já sabe sobre isso e ainda não admitiu para si?', 'Que parte de você está pedindo para ser ouvida nessa situação?', 'Se você não tivesse medo, qual seria o próximo passo?', 'O que precisa terminar para que algo novo possa começar?'];
  return parts.join('\n\n') + `\n\n## O que as cartas dizem juntas\n${syn}\n\n## Uma pergunta para levar\n${qs[rand(qs.length)]}`;
};

const API_URL = 'api/leitura';
const errCopy = {
  429: 'Muitas leituras em pouco tempo. Espere alguns minutos e tente de novo.',
  400: 'Não foi possível montar a consulta. Revise a pergunta e tente de novo.'
};
async function startReading() {
  $('reading').hidden = false;
  const py = personalYear();
  if (py) {
    $('year').hidden = false;
    $('year').innerHTML = `<div class="mini">${faceSVG(py.card)}</div><div><div class="hint">Seu ano pessoal em ${py.year}</div><p style="font-size:16px">${esc(py.card.name)}: ${esc(py.card.up)}.</p></div>`;
  }
  const finish = (text, note) => {
    st.reading = text; st.readingDone = true;
    renderReadingText(text);
    $('thinking').hidden = true;
    if (note) { $('reading-note').hidden = false; $('reading-note').textContent = note; }
    $('reading-actions').hidden = false;
  };
  const basica = 'Leitura básica, feita a partir do significado tradicional de cada carta.';
  $('thinking').hidden = false;
  $('thinking-txt').textContent = 'As cartas estão sendo lidas…';
  st.ctl = new AbortController();
  let text = '';
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: st.ctl.signal,
      body: JSON.stringify({
        nome: perfil.nome, area: perfil.area, humor: perfil.humor, pergunta: st.q,
        tiragem: st.spread, cartas: st.picks, anoPessoal: py ? { ano: py.year, carta: py.card.id } : null
      })
    });
    if (!res.ok || !res.body) {
      finish(localReading(), (errCopy[res.status] ? errCopy[res.status] + ' ' : '') + basica);
      return;
    }
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      text += dec.decode(value, { stream: true });
      $('thinking-txt').textContent = 'Escrevendo a leitura…';
      renderReadingText(text);
    }
    if (!text.trim()) { finish(localReading(), basica); return; }
    finish(text, '');
  } catch (e) {
    if (e && e.name === 'AbortError') { finish(text || localReading(), text ? 'Leitura interrompida.' : basica); return; }
    finish(text || localReading(), text ? 'A conexão caiu antes do fim da leitura.' : basica);
  }
}
$('b-parar').addEventListener('click', () => st.ctl && st.ctl.abort());
$('b-nova').addEventListener('click', () => { $('pergunta').value = ''; st.q = ''; st.userPicked = false; $('contador').textContent = '0 de 300'; updateSuggestion(); goStep(2); });
$('b-copiar').addEventListener('click', () => {
  const sp = spreadById[st.spread];
  const head = `Pergunta: ${st.q}\nTiragem: ${sp.name}\nCartas: ${st.picks.map((p, i) => `${sp.pos[i]}: ${byId[p.id].name}${p.rev ? ' (invertida)' : ''}`).join('; ')}\n\n`;
  const txt = head + st.reading.replace(/^#{1,4}\s*/gm, '');
  const done = () => { $('acao-status').textContent = 'Leitura copiada.'; };
  try {
    navigator.clipboard.writeText(txt).then(done, () => { selectReading(); $('acao-status').textContent = 'Texto selecionado. Use copiar do seu aparelho.'; });
  } catch (e) { selectReading(); $('acao-status').textContent = 'Texto selecionado. Use copiar do seu aparelho.'; }
});
const selectReading = () => { const r = document.createRange(); r.selectNodeContents($('reading-body')); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r); };
$('b-salvar').addEventListener('click', () => {
  const list = store.get('espelho.diario', []);
  list.unshift({ at: new Date().toISOString(), q: st.q, spread: st.spread, picks: st.picks, text: st.reading });
  const ok = store.set('espelho.diario', list.slice(0, 40));
  $('acao-status').textContent = ok ? 'Salva no diário.' : 'Este navegador não permitiu salvar. Use “Copiar leitura” para guardar o texto.';
  if (ok) $('b-salvar').disabled = true;
});

/* ============ Baralho ============ */
const FILTERS = [['maiores', 'Arcanos maiores'], ['paus', 'Paus'], ['copas', 'Copas'], ['espadas', 'Espadas'], ['ouros', 'Ouros']];
let filtroAtual = 'maiores';
const renderBaralho = (g) => {
  filtroAtual = g;
  const fb = $('filtros');
  fb.innerHTML = '';
  FILTERS.forEach(([k, l]) => {
    const b = el('button', { type: 'button', class: 'chip', 'aria-pressed': String(k === g) }, l);
    b.addEventListener('click', () => { $('detalhe').hidden = true; renderBaralho(k); });
    fb.appendChild(b);
  });
  const grid = $('grade');
  grid.innerHTML = '';
  DECK.filter((c) => c.group === g).forEach((c) => {
    const b = el('button', { type: 'button', class: 'card-btn', 'aria-label': `Ver ${c.name}` }, faceSVG(c) + `<span>${esc(c.name)}</span>`);
    b.addEventListener('click', () => showDetail(c));
    grid.appendChild(b);
  });
};
const showDetail = (c) => {
  const d = $('detalhe');
  d.hidden = false;
  d.innerHTML = `<div class="big">${faceSVG(c)}</div><div class="txt">
    <div class="hint">${c.kind === 'major' ? `Arcano maior ${esc(c.n)}` : `Arcano menor de ${esc(c.suit.name)}`}</div>
    <h3>${esc(c.name)}</h3>
    <div class="kv"><b>Arquétipo ou elemento</b>${esc(c.arch)}</div>
    <div class="kv"><b>De pé</b>${esc(c.up)}</div>
    <div class="kv"><b>Invertida</b>${esc(c.rev)}</div>
    <div><button class="link" type="button" id="fechar-det">Fechar</button></div></div>`;
  $('fechar-det').addEventListener('click', () => { d.hidden = true; });
  d.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
};

/* ============ Diário ============ */
const renderDiario = () => {
  const box = $('entradas');
  const list = store.get('espelho.diario', []);
  box.innerHTML = '';
  if (!list.length) {
    box.innerHTML = `<div class="empty"><p class="lede" style="max-width:40ch">Nenhuma leitura salva ainda. Ao fim de uma consulta, toque em “Salvar no diário” para guardá-la aqui.</p><button class="btn" type="button" id="diario-ir">Fazer uma consulta</button></div>`;
    $('diario-ir').addEventListener('click', () => showView('consulta'));
    return;
  }
  list.forEach((en, i) => {
    const sp = spreadById[en.spread] || { name: '', pos: [] };
    const dt = new Date(en.at);
    const item = el('article', { class: 'entry' });
    item.innerHTML = `<div class="meta">${dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}, tiragem ${esc(sp.name)}</div>
      <p class="q">${esc(en.q)}</p>
      <div class="minis">${en.picks.map((p) => `<div class="mini" title="${esc(byId[p.id].name)}" style="${p.rev ? 'transform:rotate(180deg)' : ''}">${faceSVG(byId[p.id])}</div>`).join('')}</div>
      <p class="hint">${en.picks.map((p, k) => `${esc(sp.pos[k] || '')}: ${esc(byId[p.id].name)}${p.rev ? ' (invertida)' : ''}`).join(' / ')}</p>
      <div class="actions"><button class="link" type="button" data-ver="${i}" aria-expanded="false">Ler de novo</button><button class="link" type="button" data-del="${i}">Apagar</button></div>
      <div class="reading" data-texto="${i}" hidden style="margin:0"></div>`;
    box.appendChild(item);
  });
  box.querySelectorAll('[data-ver]').forEach((b) => b.addEventListener('click', () => {
    const i = b.dataset.ver, t = box.querySelector(`[data-texto="${i}"]`);
    const open = t.hidden;
    t.hidden = !open;
    b.setAttribute('aria-expanded', String(open));
    b.textContent = open ? 'Recolher' : 'Ler de novo';
    if (open && !t.innerHTML) t.innerHTML = list[i].text.split(/\n+/).map((l) => /^#{1,4}\s/.test(l) ? `<h3>${esc(l.replace(/^#{1,4}\s*/, ''))}</h3>` : `<p>${esc(l)}</p>`).join('');
  }));
  box.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.confirm) { list.splice(+b.dataset.del, 1); store.set('espelho.diario', list); renderDiario(); }
    else { b.dataset.confirm = '1'; b.textContent = 'Toque de novo para apagar'; }
  }));
};

/* ============ Início ============ */
renderSteps();
updateSuggestion();

