'use strict';

// ── Constants ──────────────────────────────────────────────

const CANVAS_PADDING = 24;
const CARD_W = 220;
const CARD_ESTIMATED_H = 175;
const CARD_GAP = 20;

const THEMES = {
  amber:  { dot: '#F59E0B', cardBg: '#FFF9C4', accent: '#F59E0B', tagBg: '#FEF3C7', tagText: '#92400E' },
  blue:   { dot: '#3B82F6', cardBg: '#DBEAFE', accent: '#3B82F6', tagBg: '#BFDBFE', tagText: '#1E40AF' },
  green:  { dot: '#10B981', cardBg: '#D1FAE5', accent: '#10B981', tagBg: '#A7F3D0', tagText: '#065F46' },
  purple: { dot: '#7C3AED', cardBg: '#EDE9FE', accent: '#7C3AED', tagBg: '#DDD6FE', tagText: '#4C1D95' },
  pink:   { dot: '#EC4899', cardBg: '#FCE7F3', accent: '#EC4899', tagBg: '#FBCFE8', tagText: '#831843' },
  cyan:   { dot: '#06B6D4', cardBg: '#CFFAFE', accent: '#06B6D4', tagBg: '#A5F3FC', tagText: '#164E63' },
  red:    { dot: '#EF4444', cardBg: '#FEE2E2', accent: '#EF4444', tagBg: '#FECACA', tagText: '#991B1B' },
  orange: { dot: '#F97316', cardBg: '#FFEDD5', accent: '#F97316', tagBg: '#FED7AA', tagText: '#9A3412' },
};

// ── SVG Icons ──────────────────────────────────────────────

const I = {
  check:   `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  zap:     `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  grip:    `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="6" r="1" fill="currentColor"/><circle cx="15" cy="6" r="1" fill="currentColor"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="9" cy="18" r="1" fill="currentColor"/><circle cx="15" cy="18" r="1" fill="currentColor"/></svg>`,
  trash:   `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`,
  pencil:  `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  restore: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.48"/></svg>`,
};

// ── State ──────────────────────────────────────────────────

let groups = [
  { id: 'work',     name: 'Work',     theme: 'amber'  },
  { id: 'personal', name: 'Personal', theme: 'blue'   },
  { id: 'study',    name: 'Study',    theme: 'green'  },
  { id: 'shopping', name: 'Shopping', theme: 'purple' },
];

// status: 'active' | 'completed' | 'trashed'
let notes = [
  { id: 1, group: 'work',     urgent: true,  content: 'Finalize the Q2 performance report and send to manager before EOD', date: 'May 7, 2026', x: null, y: null, status: 'active' },
  { id: 2, group: 'personal', urgent: false, content: 'Buy groceries: milk, eggs, bread, coffee and fresh vegetables',      date: 'May 7, 2026', x: null, y: null, status: 'active' },
  { id: 3, group: 'study',    urgent: false, content: 'Review Chapter 5: Data Structures and complete exercises 1-10',      date: 'May 6, 2026', x: null, y: null, status: 'active' },
  { id: 4, group: 'personal', urgent: true,  content: "Call dentist to reschedule appointment, can't make Thursday",        date: 'May 5, 2026', x: null, y: null, status: 'active' },
  { id: 5, group: 'shopping', urgent: false, content: 'Research new wireless headphones - check Sony WH-1000XM5 reviews',  date: 'May 4, 2026', x: null, y: null, status: 'active' },
];

let nextId = 6;
let nextGroupId = 1;
let activeGroup = 'all';
let activeTab = 'all';
let dragState = null;
let groupModalMode = 'add';
let groupModalEditId = null;
let selectedTheme = 'amber';

// ── DOM refs ───────────────────────────────────────────────

const canvas = document.getElementById('canvas');

// ── Helpers ────────────────────────────────────────────────

function getTheme(note) {
  const g = groups.find(x => x.id === note.group);
  return THEMES[g ? g.theme : 'amber'];
}

function getGroup(id) { return groups.find(g => g.id === id); }

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function fmtDate(d) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ── Positions ──────────────────────────────────────────────

function assignInitialPositions() {
  const cols = 3;
  notes.filter(n => n.status === 'active').forEach((note, i) => {
    if (note.x === null) {
      note.x = (i % cols) * (CARD_W + CARD_GAP);
      note.y = Math.floor(i / cols) * (CARD_ESTIMATED_H + CARD_GAP);
    }
  });
}

function findNewNotePosition() {
  const w = canvas.offsetWidth - CANVAS_PADDING * 2;
  const cols = Math.max(1, Math.floor((w + CARD_GAP) / (CARD_W + CARD_GAP)));
  const i = notes.filter(n => n.status === 'active').length;
  return { x: (i % cols) * (CARD_W + CARD_GAP), y: Math.floor(i / cols) * (CARD_ESTIMATED_H + CARD_GAP) };
}

function updateCanvasHeight() {
  let max = 300;
  canvas.querySelectorAll('.note-card').forEach(c => {
    const b = parseInt(c.style.top || 0) + c.offsetHeight;
    if (b > max) max = b;
  });
  canvas.style.minHeight = (max + CANVAS_PADDING * 2) + 'px';
}

// ── Drag ───────────────────────────────────────────────────

function initDrag(card, note) {
  const start = (cx, cy) => {
    const r = card.getBoundingClientRect();
    dragState = { noteId: note.id, card, offsetX: cx - r.left, offsetY: cy - r.top };
    card.classList.add('dragging');
    card.style.zIndex = 200;
  };
  card.addEventListener('mousedown', e => {
    if (e.target.closest('.note-content, .note-action-btn, button')) return;
    e.preventDefault();
    start(e.clientX, e.clientY);
  });
  card.addEventListener('touchstart', e => {
    if (e.target.closest('.note-content, .note-action-btn, button')) return;
    start(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
}

function onMove(cx, cy) {
  if (!dragState) return;
  const { card, offsetX, offsetY, noteId } = dragState;
  const r = canvas.getBoundingClientRect();
  const x = Math.max(0, cx - r.left + canvas.scrollLeft - offsetX - CANVAS_PADDING);
  const y = Math.max(0, cy - r.top  + canvas.scrollTop  - offsetY - CANVAS_PADDING);
  card.style.left = x + 'px';
  card.style.top  = y + 'px';
  const n = notes.find(x => x.id === noteId);
  if (n) { n.x = x; n.y = y; }
  updateCanvasHeight();
}

function onUp() {
  if (!dragState) return;
  dragState.card.classList.remove('dragging');
  dragState.card.style.zIndex = '';
  dragState = null;
}

document.addEventListener('mousemove', e => onMove(e.clientX, e.clientY));
document.addEventListener('mouseup', onUp);
document.addEventListener('touchmove', e => { if (!dragState) return; e.preventDefault(); onMove(e.touches[0].clientX, e.touches[0].clientY); }, { passive: false });
document.addEventListener('touchend', onUp);

// ── Note Card ──────────────────────────────────────────────

function createNoteCard(note) {
  const theme = getTheme(note);
  const group = getGroup(note.group);
  const groupName = group ? group.name : note.group;

  const card = document.createElement('div');
  card.className = 'note-card';
  card.dataset.id = note.id;
  card.style.cssText = `background:${theme.cardBg};left:${note.x}px;top:${note.y}px`;

  card.innerHTML = `
    <div class="note-accent" style="background:${theme.accent}"></div>
    <div class="note-header">
      <div class="note-group-tag" style="background:${theme.tagBg};color:${theme.tagText}">${esc(groupName)}</div>
      ${note.urgent ? `<div class="note-urgent-badge"><span class="udot"></span>Urgent</div>` : ''}
      <div class="note-spacer"></div>
      <button class="note-action-btn complete-btn" data-id="${note.id}" title="Mark as complete">${I.check}</button>
      <button class="note-action-btn trash-btn"    data-id="${note.id}" title="Move to trash">${I.trash}</button>
    </div>
    <div class="note-content" contenteditable="true" data-id="${note.id}" data-placeholder="Click to edit...">${esc(note.content)}</div>
    <div class="note-footer">
      <span class="note-date">${note.date}</span>
      <div class="note-footer-spacer"></div>
      <button class="note-action-btn urgency-btn ${note.urgent ? 'is-urgent' : ''}" data-id="${note.id}" title="${note.urgent ? 'Remove urgency' : 'Mark as urgent'}">${I.zap}</button>
      <span class="note-footer-icon">${I.grip}</span>
    </div>`;

  card.querySelector('.note-content').addEventListener('blur', e => {
    const n = notes.find(x => x.id === +e.target.dataset.id);
    if (n) n.content = e.target.innerText.trim();
  });

  initDrag(card, note);
  return card;
}

// ── Render ─────────────────────────────────────────────────

function renderCanvas() {
  canvas.innerHTML = '';
  canvas.style.minHeight = '';

  const visible = notes.filter(n => {
    if (n.status !== 'active') return false;
    if (activeGroup !== 'all' && n.group !== activeGroup) return false;
    if (activeTab === 'urgent' && !n.urgent) return false;
    if (activeTab === 'normal' && n.urgent) return false;
    return true;
  });

  if (visible.length === 0) {
    canvas.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5">
          <path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/>
          <path d="M15 3v6h6"/><path d="M8 13h8"/><path d="M8 17h5"/>
        </svg>
        <span>No notes here. Click <strong>+ New Note</strong> to add one.</span>
      </div>`;
    return;
  }

  visible.forEach(n => canvas.appendChild(createNoteCard(n)));
  updateCanvasHeight();
}

function renderSidebar() {
  const groupList = document.getElementById('groupList');
  groupList.innerHTML = '';

  groups.forEach(g => {
    const theme = THEMES[g.theme];
    const div = document.createElement('div');
    div.className = 'sidebar-item sidebar-group-item';
    div.dataset.group = g.id;
    if (activeGroup === g.id) div.classList.add('active');

    div.innerHTML = `
      <span class="dot" style="background:${theme.dot}"></span>
      <span>${esc(g.name)}</span>
      <div class="group-actions">
        <button class="group-action-btn edit-group-btn" data-id="${g.id}" title="Edit">${I.pencil}</button>
        <button class="group-action-btn del delete-group-btn" data-id="${g.id}" title="Delete">×</button>
      </div>`;

    div.addEventListener('click', e => {
      if (e.target.closest('.group-action-btn')) return;
      document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
      div.classList.add('active');
      activeGroup = g.id;
      renderCanvas();
    });

    groupList.appendChild(div);
  });

  const allItem = document.getElementById('sidebarAll');
  allItem.classList.toggle('active', activeGroup === 'all');
  document.getElementById('allBadge').textContent = notes.filter(n => n.status === 'active').length;

  // Rebuild group select in note modal
  const sel = document.getElementById('groupSelect');
  if (sel) {
    const cur = sel.value;
    sel.innerHTML = groups.map(g => `<option value="${g.id}">${esc(g.name)}</option>`).join('');
    if (groups.find(g => g.id === cur)) sel.value = cur;
  }
}

function createMiniCard(note, type) {
  const theme = getTheme(note);
  const groupName = (getGroup(note.group) || {}).name || note.group;
  const div = document.createElement('div');
  div.className = 'mini-card';
  div.innerHTML = `
    <div class="mini-card-top">
      <span class="mini-tag" style="background:${theme.tagBg};color:${theme.tagText}">${esc(groupName)}</span>
      <span class="mini-date">${note.date}</span>
    </div>
    <div class="mini-content">${esc(note.content)}</div>
    <div class="mini-actions">
      <button class="mini-restore-btn" data-id="${note.id}" data-action="restore">${I.restore} Restore</button>
      ${type === 'trashed' ? `<button class="mini-delete-btn" data-id="${note.id}" data-action="perm-delete" title="Delete permanently">×</button>` : ''}
    </div>`;
  return div;
}

function renderRightPanel() {
  const completed = notes.filter(n => n.status === 'completed');
  const trashed   = notes.filter(n => n.status === 'trashed');

  document.getElementById('completedCount').textContent = completed.length;
  document.getElementById('trashCount').textContent = trashed.length;

  const cList = document.getElementById('completedList');
  cList.innerHTML = '';
  if (completed.length === 0) { cList.innerHTML = '<div class="mini-empty">Nothing completed yet</div>'; }
  else { completed.forEach(n => cList.appendChild(createMiniCard(n, 'completed'))); }

  const tList = document.getElementById('trashList');
  tList.innerHTML = '';
  if (trashed.length === 0) { tList.innerHTML = '<div class="mini-empty">Trash is empty</div>'; }
  else { trashed.forEach(n => tList.appendChild(createMiniCard(n, 'trashed'))); }
}

function renderAll() {
  renderSidebar();
  renderCanvas();
  renderRightPanel();
}

// ── Note Operations ────────────────────────────────────────

function noteSetStatus(id, status) {
  const n = notes.find(x => x.id === id);
  if (!n) return;
  if (status === 'active' && (n.x === null || n.y === null)) {
    const pos = findNewNotePosition();
    n.x = pos.x; n.y = pos.y;
  }
  n.status = status;
  renderAll();
}

function toggleUrgent(id) {
  const n = notes.find(x => x.id === id);
  if (n) { n.urgent = !n.urgent; renderCanvas(); }
}

function permanentDelete(id) {
  notes = notes.filter(n => n.id !== id);
  renderRightPanel();
}

function emptyTrash() {
  const count = notes.filter(n => n.status === 'trashed').length;
  if (!count) return;
  if (!confirm(`Permanently delete ${count} trashed note(s)?`)) return;
  notes = notes.filter(n => n.status !== 'trashed');
  renderRightPanel();
}

// ── Group Operations ───────────────────────────────────────

function renderColorPicker() {
  document.getElementById('colorPicker').innerHTML = Object.entries(THEMES).map(([key, t]) =>
    `<div class="color-dot-pick ${selectedTheme === key ? 'selected' : ''}" data-theme="${key}" style="background:${t.dot}" title="${key}"></div>`
  ).join('');
}

function openGroupModal(mode, groupId = null) {
  groupModalMode = mode;
  groupModalEditId = groupId;
  const g = groupId ? getGroup(groupId) : null;
  document.getElementById('groupModalTitle').textContent = mode === 'add' ? 'New Group' : 'Edit Group';
  document.getElementById('groupNameInput').value = g ? g.name : '';
  selectedTheme = g ? g.theme : 'amber';
  renderColorPicker();
  document.getElementById('groupModalOverlay').classList.remove('hidden');
  setTimeout(() => document.getElementById('groupNameInput').focus(), 50);
}

function closeGroupModal() { document.getElementById('groupModalOverlay').classList.add('hidden'); }

function saveGroup() {
  const name = document.getElementById('groupNameInput').value.trim();
  if (!name) {
    const el = document.getElementById('groupNameInput');
    el.style.borderColor = '#EF4444';
    el.focus();
    setTimeout(() => { el.style.borderColor = ''; }, 1500);
    return;
  }
  if (groupModalMode === 'add') {
    groups.push({ id: 'grp_' + (nextGroupId++), name, theme: selectedTheme });
  } else {
    const g = getGroup(groupModalEditId);
    if (g) { g.name = name; g.theme = selectedTheme; }
  }
  closeGroupModal();
  renderAll();
}

function deleteGroup(id) {
  const activeIn = notes.filter(n => n.group === id && n.status === 'active');
  if (activeIn.length) {
    if (!confirm(`This group has ${activeIn.length} active note(s). They will be moved to trash. Continue?`)) return;
    activeIn.forEach(n => n.status = 'trashed');
  }
  groups = groups.filter(g => g.id !== id);
  if (activeGroup === id) activeGroup = 'all';
  renderAll();
}

// ── Note Modal ─────────────────────────────────────────────

function openNoteModal() {
  document.getElementById('noteContent').value = '';
  document.getElementById('urgentCheck').checked = false;
  const sel = document.getElementById('groupSelect');
  if (activeGroup !== 'all' && groups.find(g => g.id === activeGroup)) sel.value = activeGroup;
  document.getElementById('noteModalOverlay').classList.remove('hidden');
  setTimeout(() => document.getElementById('noteContent').focus(), 50);
}

function closeNoteModal() { document.getElementById('noteModalOverlay').classList.add('hidden'); }

function addNote() {
  const el = document.getElementById('noteContent');
  const content = el.value.trim();
  if (!content) {
    el.style.borderColor = '#EF4444';
    el.focus();
    setTimeout(() => { el.style.borderColor = ''; }, 1500);
    return;
  }
  const pos = findNewNotePosition();
  notes.unshift({
    id: nextId++,
    group: document.getElementById('groupSelect').value,
    urgent: document.getElementById('urgentCheck').checked,
    content, date: fmtDate(new Date()),
    x: pos.x, y: pos.y, status: 'active',
  });
  closeNoteModal();
  renderAll();
}

// ── Event Listeners ────────────────────────────────────────

// Header
document.getElementById('newNoteBtn').addEventListener('click', openNoteModal);

// Note modal
document.getElementById('noteModalCloseBtn').addEventListener('click', closeNoteModal);
document.getElementById('noteCancelBtn').addEventListener('click', closeNoteModal);
document.getElementById('noteAddBtn').addEventListener('click', addNote);
document.getElementById('noteModalOverlay').addEventListener('click', e => { if (e.target.id === 'noteModalOverlay') closeNoteModal(); });
document.getElementById('noteContent').addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) addNote(); });

// Group modal
document.getElementById('addGroupBtn').addEventListener('click', () => openGroupModal('add'));
document.getElementById('groupModalCloseBtn').addEventListener('click', closeGroupModal);
document.getElementById('groupCancelBtn').addEventListener('click', closeGroupModal);
document.getElementById('groupSaveBtn').addEventListener('click', saveGroup);
document.getElementById('groupModalOverlay').addEventListener('click', e => { if (e.target.id === 'groupModalOverlay') closeGroupModal(); });
document.getElementById('groupNameInput').addEventListener('keydown', e => { if (e.key === 'Enter') saveGroup(); });

// Color picker
document.getElementById('colorPicker').addEventListener('click', e => {
  const dot = e.target.closest('.color-dot-pick');
  if (!dot) return;
  selectedTheme = dot.dataset.theme;
  document.querySelectorAll('.color-dot-pick').forEach(d => d.classList.toggle('selected', d.dataset.theme === selectedTheme));
});

// Group list (edit/delete delegated)
document.getElementById('groupList').addEventListener('click', e => {
  const eBtn = e.target.closest('.edit-group-btn');
  const dBtn = e.target.closest('.delete-group-btn');
  if (eBtn) openGroupModal('edit', eBtn.dataset.id);
  if (dBtn) deleteGroup(dBtn.dataset.id);
});

// All Notes sidebar item
document.getElementById('sidebarAll').addEventListener('click', () => {
  document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
  document.getElementById('sidebarAll').classList.add('active');
  activeGroup = 'all';
  renderCanvas();
});

// Tabs
document.querySelectorAll('.tab[data-tab]').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeTab = tab.dataset.tab;
    renderCanvas();
  });
});

// Canvas: complete / trash / urgency toggle (delegated)
canvas.addEventListener('click', e => {
  const c = e.target.closest('.complete-btn');
  const t = e.target.closest('.trash-btn');
  const u = e.target.closest('.urgency-btn');
  if (c) noteSetStatus(+c.dataset.id, 'completed');
  if (t) noteSetStatus(+t.dataset.id, 'trashed');
  if (u) toggleUrgent(+u.dataset.id);
});

// Completed list (restore)
document.getElementById('completedList').addEventListener('click', e => {
  const btn = e.target.closest('[data-action="restore"]');
  if (btn) noteSetStatus(+btn.dataset.id, 'active');
});

// Trash list (restore / perm-delete)
document.getElementById('trashList').addEventListener('click', e => {
  const r = e.target.closest('[data-action="restore"]');
  const d = e.target.closest('[data-action="perm-delete"]');
  if (r) noteSetStatus(+r.dataset.id, 'active');
  if (d && confirm('Permanently delete this note?')) permanentDelete(+d.dataset.id);
});

// Empty trash
document.getElementById('emptyTrashBtn').addEventListener('click', emptyTrash);

// Global ESC
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeNoteModal(); closeGroupModal(); }
});

// ── Init ───────────────────────────────────────────────────

assignInitialPositions();
renderAll();
