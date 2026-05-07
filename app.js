'use strict';

const CANVAS_PADDING = 24;
const CARD_W = 220;
const CARD_ESTIMATED_H = 175;
const CARD_GAP = 20;

const GROUP_CONFIG = {
  work:     { label: 'Work',     dotColor: '#EF4444', cardBg: '#FFF9C4', accentColor: '#F59E0B', tagBg: '#FEF3C7', tagText: '#92400E' },
  personal: { label: 'Personal', dotColor: '#06B6D4', cardBg: '#DBEAFE', accentColor: '#3B82F6', tagBg: '#BFDBFE', tagText: '#1E40AF' },
  study:    { label: 'Study',    dotColor: '#10B981', cardBg: '#D1FAE5', accentColor: '#10B981', tagBg: '#A7F3D0', tagText: '#065F46' },
  shopping: { label: 'Shopping', dotColor: '#F59E0B', cardBg: '#EDE9FE', accentColor: '#7C3AED', tagBg: '#DDD6FE', tagText: '#4C1D95' },
};

let notes = [
  { id: 1, group: 'work',     urgent: true,  content: 'Finalize the Q2 performance report and send to manager before EOD', date: 'May 7, 2026', x: null, y: null },
  { id: 2, group: 'personal', urgent: false, content: 'Buy groceries: milk, eggs, bread, coffee and fresh vegetables',      date: 'May 7, 2026', x: null, y: null },
  { id: 3, group: 'study',    urgent: false, content: 'Review Chapter 5: Data Structures and complete exercises 1-10',      date: 'May 6, 2026', x: null, y: null },
  { id: 4, group: 'personal', urgent: true,  content: "Call dentist to reschedule appointment, can't make Thursday",        date: 'May 5, 2026', x: null, y: null,
    cardBg: '#FCE7F3', accentColor: '#EC4899', tagBg: '#FBCFE8', tagText: '#831843' },
  { id: 5, group: 'shopping', urgent: false, content: 'Research new wireless headphones - check Sony WH-1000XM5 reviews',  date: 'May 4, 2026', x: null, y: null },
];

let nextId = 6;
let activeGroup = 'all';
let activeTab   = 'all';
let dragState   = null;

const canvas        = document.getElementById('canvas');
const allBadge      = document.getElementById('allBadge');
const modalOverlay  = document.getElementById('modalOverlay');
const groupSelect   = document.getElementById('groupSelect');
const urgentCheck   = document.getElementById('urgentCheck');
const noteContentEl = document.getElementById('noteContent');

// ── Positions ──────────────────────────────────────────────

function assignInitialPositions() {
  const COLS = 3;
  notes.forEach((note, i) => {
    if (note.x === null || note.y === null) {
      note.x = (i % COLS) * (CARD_W + CARD_GAP);
      note.y = Math.floor(i / COLS) * (CARD_ESTIMATED_H + CARD_GAP);
    }
  });
}

function findNewNotePosition() {
  const canvasW = canvas.offsetWidth - CANVAS_PADDING * 2;
  const cols = Math.max(1, Math.floor((canvasW + CARD_GAP) / (CARD_W + CARD_GAP)));
  const i = notes.length;
  return {
    x: (i % cols) * (CARD_W + CARD_GAP),
    y: Math.floor(i / cols) * (CARD_ESTIMATED_H + CARD_GAP),
  };
}

function updateCanvasHeight() {
  let maxBottom = 300;
  canvas.querySelectorAll('.note-card').forEach(card => {
    const b = parseInt(card.style.top || 0) + card.offsetHeight;
    if (b > maxBottom) maxBottom = b;
  });
  canvas.style.minHeight = (maxBottom + CANVAS_PADDING * 2) + 'px';
}

// ── SVG icons ──────────────────────────────────────────────

const GRIP_SVG  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/></svg>`;
const TRASH_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`;

// ── Drag ───────────────────────────────────────────────────

function initDrag(card, note) {
  const onStart = (clientX, clientY) => {
    const rect = card.getBoundingClientRect();
    dragState = {
      noteId: note.id,
      card,
      offsetX: clientX - rect.left,
      offsetY: clientY - rect.top,
    };
    card.classList.add('dragging');
    card.style.zIndex = 200;
  };

  card.addEventListener('mousedown', e => {
    if (e.target.closest('.note-content, .note-close, .delete-icon, button')) return;
    e.preventDefault();
    onStart(e.clientX, e.clientY);
  });

  card.addEventListener('touchstart', e => {
    if (e.target.closest('.note-content, .note-close, .delete-icon, button')) return;
    const t = e.touches[0];
    onStart(t.clientX, t.clientY);
  }, { passive: true });
}

function onPointerMove(clientX, clientY) {
  if (!dragState) return;
  const { card, offsetX, offsetY, noteId } = dragState;
  const rect = canvas.getBoundingClientRect();

  let x = clientX - rect.left + canvas.scrollLeft - offsetX - CANVAS_PADDING;
  let y = clientY - rect.top  + canvas.scrollTop  - offsetY - CANVAS_PADDING;

  x = Math.max(0, x);
  y = Math.max(0, y);

  card.style.left = x + 'px';
  card.style.top  = y + 'px';

  const note = notes.find(n => n.id === noteId);
  if (note) { note.x = x; note.y = y; }

  updateCanvasHeight();
}

function onPointerUp() {
  if (!dragState) return;
  dragState.card.classList.remove('dragging');
  dragState.card.style.zIndex = '';
  dragState = null;
}

document.addEventListener('mousemove', e => onPointerMove(e.clientX, e.clientY));
document.addEventListener('mouseup', onPointerUp);
document.addEventListener('touchmove', e => {
  if (!dragState) return;
  e.preventDefault();
  const t = e.touches[0];
  onPointerMove(t.clientX, t.clientY);
}, { passive: false });
document.addEventListener('touchend', onPointerUp);

// ── Note card ──────────────────────────────────────────────

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function createNoteCard(note) {
  const cfg        = GROUP_CONFIG[note.group];
  const cardBg     = note.cardBg     || cfg.cardBg;
  const accentColor = note.accentColor || cfg.accentColor;
  const tagBg      = note.tagBg      || cfg.tagBg;
  const tagText    = note.tagText    || cfg.tagText;

  const card = document.createElement('div');
  card.className   = 'note-card';
  card.dataset.id  = note.id;
  card.style.background = cardBg;
  card.style.left  = note.x + 'px';
  card.style.top   = note.y + 'px';

  card.innerHTML = `
    <div class="note-accent" style="background:${accentColor}"></div>
    <div class="note-header">
      <div class="note-group-tag" style="background:${tagBg};color:${tagText}">${cfg.label}</div>
      ${note.urgent ? `<div class="note-urgent-badge"><span class="udot"></span>Urgent</div>` : ''}
      <div class="note-spacer"></div>
      <button class="note-close" data-id="${note.id}" title="Delete">×</button>
    </div>
    <div class="note-content" contenteditable="true" data-placeholder="Click to edit..." data-id="${note.id}">${escapeHtml(note.content)}</div>
    <div class="note-footer">
      <span class="note-date">${note.date}</span>
      <div class="note-footer-spacer"></div>
      <span class="note-footer-icon" title="Drag to move">${GRIP_SVG}</span>
      <span class="note-footer-icon delete-icon" data-id="${note.id}" title="Delete">${TRASH_SVG}</span>
    </div>`;

  card.querySelector('.note-content').addEventListener('blur', e => {
    const n = notes.find(x => x.id === parseInt(e.target.dataset.id));
    if (n) n.content = e.target.innerText.trim();
  });

  initDrag(card, note);
  return card;
}

// ── Render ─────────────────────────────────────────────────

function filteredNotes() {
  return notes.filter(n => {
    if (activeGroup !== 'all' && n.group !== activeGroup) return false;
    if (activeTab === 'urgent' && !n.urgent) return false;
    if (activeTab === 'normal' && n.urgent) return false;
    return true;
  });
}

function render() {
  canvas.innerHTML = '';
  canvas.style.minHeight = '';
  const visible = filteredNotes();

  if (visible.length === 0) {
    canvas.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5">
          <path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/>
          <path d="M15 3v6h6"/><path d="M8 13h8"/><path d="M8 17h5"/>
        </svg>
        <span>No notes yet. Click <strong>+ New Note</strong> to add one.</span>
      </div>`;
    return;
  }

  visible.forEach(n => canvas.appendChild(createNoteCard(n)));
  updateCanvasHeight();
  updateBadge();
}

function updateBadge() {
  allBadge.textContent = notes.length;
}

// ── Modal ──────────────────────────────────────────────────

function openModal() {
  noteContentEl.value = '';
  urgentCheck.checked = false;
  groupSelect.value   = activeGroup !== 'all' ? activeGroup : 'work';
  modalOverlay.classList.remove('hidden');
  setTimeout(() => noteContentEl.focus(), 50);
}

function closeModal() {
  modalOverlay.classList.add('hidden');
}

function formatDate(d) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function addNote() {
  const content = noteContentEl.value.trim();
  if (!content) {
    noteContentEl.focus();
    noteContentEl.style.borderColor = '#EF4444';
    setTimeout(() => { noteContentEl.style.borderColor = ''; }, 1500);
    return;
  }
  const pos = findNewNotePosition();
  notes.unshift({ id: nextId++, group: groupSelect.value, urgent: urgentCheck.checked, content, date: formatDate(new Date()), x: pos.x, y: pos.y });
  closeModal();
  render();
}

// ── Event listeners ────────────────────────────────────────

document.getElementById('newNoteBtn').addEventListener('click', openModal);
document.getElementById('cancelBtn').addEventListener('click', closeModal);
document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
document.getElementById('addBtn').addEventListener('click', addNote);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
noteContentEl.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) addNote(); });

document.querySelectorAll('.sidebar-item[data-group]').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    activeGroup = item.dataset.group;
    render();
  });
});

document.querySelectorAll('.tab[data-tab]').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeTab = tab.dataset.tab;
    render();
  });
});

canvas.addEventListener('click', e => {
  const btn = e.target.closest('[data-id].note-close, .delete-icon[data-id]');
  if (btn) {
    notes = notes.filter(n => n.id !== parseInt(btn.dataset.id));
    render();
  }
});

// ── Init ───────────────────────────────────────────────────

assignInitialPositions();
render();
