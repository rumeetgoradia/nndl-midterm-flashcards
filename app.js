'use strict';

const titles = {
  2: 'Single-Layer Models',
  3: 'Multilayer Perceptrons',
  4: 'Distributed Representations & Neural Language Models',
  5: 'Backpropagation',
  6: 'Optimization',
  7: 'Convolutional Neural Networks',
  8: 'Image Classification',
  9: 'Generalization'
};
const $ = (selector) => document.querySelector(selector);
const state = { all: [], deck: [], mode: localStorage.getItem('nndl-mode') || 'tiles', current: 0, flipped: false, seen: new Set(JSON.parse(localStorage.getItem('nndl-seen') || '[]')) };
const esc = (text) => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function label(card) { return `LECTURE ${String(card.lecture).padStart(2,'0')} · ${card.title.toUpperCase()}`; }
function markSeen(id) {
  state.seen.add(id);
  localStorage.setItem('nndl-seen', JSON.stringify([...state.seen]));
  $('#deck-progress').textContent = `${Math.round(state.seen.size / state.all.length * 100)}%`;
}
function faceMarkup(card, answer, idx) {
  return `<div class="face ${answer ? 'back' : 'front'}"><div class="face-top"><span class="card-label">${esc(label(card))}</span><span class="card-index">${String(idx+1).padStart(2,'0')}</span></div><div class="card-text">${esc(answer ? card.answer : card.question)}</div><div class="face-bottom"><span>${answer ? 'ANSWER' : 'QUESTION'}</span><span>CLICK TO FLIP ↻</span></div></div>`;
}
function renderTiles() {
  const root = $('#tiles-view');
  root.innerHTML = state.deck.map((card, idx) => `<article class="tile" role="button" tabindex="0" aria-label="Flashcard ${idx+1}: ${esc(card.question)}" aria-pressed="false" data-id="${esc(card.id)}"> <div class="tile-inner">${faceMarkup(card,false,idx)}${faceMarkup(card,true,idx)}</div></article>`).join('');
  root.querySelectorAll('.tile').forEach(tile => {
    const flip = () => { tile.classList.toggle('flipped'); tile.setAttribute('aria-pressed', tile.classList.contains('flipped')); if (tile.classList.contains('flipped')) markSeen(tile.dataset.id); };
    tile.addEventListener('click', flip);
    tile.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
  });
}
function renderPlaylist() {
  const card = state.deck[state.current];
  if (!card) return;
  const panel = $('#playlist-card');
  panel.classList.toggle('flipped', state.flipped);
  panel.querySelector('.playlist-front-label').textContent = label(card);
  panel.querySelector('.playlist-question').textContent = state.flipped ? card.answer : card.question;
  panel.querySelector('.playlist-question').className = `playlist-question ${state.flipped ? 'playlist-answer' : ''}`;
  $('#playlist-position').textContent = `${String(state.current+1).padStart(2,'0')} / ${String(state.deck.length).padStart(2,'0')}`;
  $('#playlist-lecture').textContent = label(card);
  $('#progress-fill').style.width = `${(state.current+1)/state.deck.length*100}%`;
  if (state.flipped) markSeen(card.id);
}
function render() {
  const hasCards = state.deck.length > 0;
  $('#tiles-view').classList.toggle('hidden', state.mode !== 'tiles' || !hasCards);
  $('#playlist-view').classList.toggle('hidden', state.mode !== 'playlist' || !hasCards);
  $('#empty-state').classList.toggle('hidden', hasCards);
  $('#visible-count').textContent = `${state.deck.length} CARD${state.deck.length===1?'':'S'}`;
  $('#deck-label').textContent = $('#lecture-filter').value === 'all' ? 'ALL CARDS' : label({lecture:Number($('#lecture-filter').value),title:titles[$('#lecture-filter').value]});
  $('#tiles-btn').classList.toggle('active', state.mode === 'tiles');
  $('#playlist-btn').classList.toggle('active', state.mode === 'playlist');
  $('#tiles-btn').setAttribute('aria-pressed', state.mode === 'tiles');
  $('#playlist-btn').setAttribute('aria-pressed', state.mode === 'playlist');
  renderTiles();
  if (hasCards) renderPlaylist();
}
function filterDeck() {
  const lecture = $('#lecture-filter').value;
  const query = $('#search').value.trim().toLocaleLowerCase();
  state.deck = state.all.filter(card => (lecture === 'all' || card.lecture === Number(lecture)) && (!query || `${card.question} ${card.answer} ${card.title}`.toLocaleLowerCase().includes(query)));
  state.current = 0; state.flipped = false; render();
}
function setMode(mode) { state.mode = mode; localStorage.setItem('nndl-mode', mode); render(); }
function move(delta) { if (!state.deck.length) return; state.current = (state.current + delta + state.deck.length) % state.deck.length; state.flipped = false; renderPlaylist(); }
function flipCurrent() { if (!state.deck.length) return; state.flipped = !state.flipped; renderPlaylist(); }

fetch('cards.json').then(r => { if (!r.ok) throw new Error('Could not load the cards.'); return r.json(); }).then(cards => {
  state.all = cards;
  $('#card-count').textContent = cards.length;
  $('#deck-progress').textContent = `${Math.round(state.seen.size/cards.length*100)}%`;
  $('#lecture-count').textContent = Object.keys(titles).length;
  for (const [number,title] of Object.entries(titles)) {
    const option = document.createElement('option'); option.value = number; option.textContent = `Lecture ${String(number).padStart(2,'0')} · ${title}`; $('#lecture-filter').append(option);
  }
  $('#lecture-filter').addEventListener('change', filterDeck);
  $('#search').addEventListener('input', filterDeck);
  $('#tiles-btn').addEventListener('click', () => setMode('tiles'));
  $('#playlist-btn').addEventListener('click', () => setMode('playlist'));
  $('#shuffle-btn').addEventListener('click', () => { for (let i=state.deck.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [state.deck[i],state.deck[j]]=[state.deck[j],state.deck[i]]; } state.current=0; state.flipped=false; render(); });
  $('#prev-btn').addEventListener('click', () => move(-1));
  $('#next-btn').addEventListener('click', () => move(1));
  $('#flip-btn').addEventListener('click', flipCurrent);
  $('#playlist-card').addEventListener('click', flipCurrent);
  document.addEventListener('keydown', e => {
    if (e.target.matches('input,select,textarea')) { if (e.key === '/' && e.target.id !== 'search') { e.preventDefault(); $('#search').focus(); } return; }
    if (e.key === 'ArrowRight') move(1);
    if (e.key === 'ArrowLeft') move(-1);
    if (e.key === ' ' && state.mode === 'playlist') { e.preventDefault(); flipCurrent(); }
    if (e.key === '/' ) { e.preventDefault(); $('#search').focus(); }
  });
  $('#search').addEventListener('keydown', e => { if (e.key === 'Escape') { $('#search').value=''; filterDeck(); $('#search').blur(); } });
  if (state.mode !== 'playlist') state.mode = 'tiles';
  filterDeck();
}).catch(err => { $('#empty-state').textContent = err.message; $('#empty-state').classList.remove('hidden'); });
