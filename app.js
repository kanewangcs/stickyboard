'use strict';

const GROUP_CONFIG = {
  work: {
    label: 'Work',
    dotColor: '#EF4444',
    cardBg: '#FFF9C4',
    accentColor: '#F59E0B',
    tagBg: '#FEF3C7',
    tagText: '#92400E',
  },
  personal: {
    label: 'Personal',
    dotColor: '#06B6D4',
    cardBg: '#DBEAFE',
    accentColor: '#3B82F6',
    tagBg: '#BFDBFE',
    tagText: '#1E40AF',
  },
  study: {
    label: 'Study',
    dotColor: '#10B981',
    cardBg: '#D1FAE5',
    accentColor: '#10B981',
    tagBg: '#A7F3D0',
    tagText: '#065F46',
  },
  shopping: {
    label: 'Shopping',
    dotColor: '#F59E0B',
    cardBg: '#EDE9FE',
    accentColor: '#7C3AED',
    tagBg: '#DDD6FE',
    tagText: '#4C1D95',
  },
};

let notes = [
  {
    id: 1,
    group: 'work',
    urgent: true,
    content: 'Finalize the Q2 performance report and send to manager before EOD',
    date: 'May 7, 2026',
  },
  {
    id: 2,
    group: 'personal',
    urgent: false,
    content: 'Buy groceries: milk, eggs, bread, coffee and fresh vegetables',
    date: 'May 7, 2026',
  },
  {
    id: 3,
    group: 'study',
    urgent: false,
    content: 'Review Chapter 5: Data Structures and complete exercises 1-10',
    date: 'May 6, 2026',
  },
  {
    id: 4,
    group: 'personal',
    urgent: true,
    cardBg: '#FCE7F3',
    accentColor: '#EC4899',
    tagBg: '#FBCFE8',
    tagText: '#831843',
    content: "Call dentist to reschedule appointment, can't make Thursday",
    date: 'May 5, 2026',
  },
  {
    id: 5,
    group: 'shopping',
    urgent: false,
    content: 'Research new wireless headphones - check Sony WH-1000XM5 reviews',
    date: 'May 4, 2026',
  },
];

let nextId = 6;
let activeGroup = 'all';
let activeTab = 'all';

const canvas = document.getElementById('canvas');
const allBadge = document.getElementById('allBadge');
const modalOverlay = document.getElementById('modalOverlay');
const groupSelect = document.getElementById('groupSelect');
const urgentCheck = document.getElementById('urgentCheck');
const noteContent = document.getElementById('noteContent');

function formatDate(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function filteredNotes() {
  return notes.filter(n => {
    if (activeGroup !== 'all' && n.group !== activeGroup) return false;
    if (activeTab === 'urgent' && !n.urgent) return false;
    if (activeTab === 'normal' && n.urgent) return false;
    return true;
  });
}

const GRIP_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/><circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/></svg>`;

const TRASH_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`;

function createNoteCard(note) {
  const cfg = GROUP_CONFIG[note.group];
  const cardBg = note.cardBg || cfg.cardBg;
  const accentColor = note.accentColor || cfg.accentColor;
  const tagBg = note.tagBg || cfg.tagBg;
  const tagText = note.tagText || cfg.tagText;

  const card = document.createElement('div');
  card.className = 'note-card';
  card.dataset.id = note.id;
  card.style.background = cardBg;

  const urgentBadgeHtml = note.urgent
    ? `<div class="note-urgent-badge"><span class="udot"></span>Urgent</div>`
    : '';

  card.innerHTML = `
    <div class="note-accent" style="background:${accentColor}"></div>
    <div class="note-header">
      <div class="note-group-tag" style="background:${tagBg};color:${tagText}">${cfg.label}</div>
      ${urgentBadgeHtml}
      <div class="note-spacer"></div>
      <button class="note-close" data-id="${note.id}" title="Delete">×</button>
    </div>
    <div class="note-content" contenteditable="true" data-placeholder="Click to edit..." data-id="${note.id}">${escapeHtml(note.content)}</div>
    <div class="note-footer">
      <span class="note-date">${note.date}</span>
      <div class="note-footer-spacer"></div>
      <span class="note-footer-icon">${GRIP_SVG}</span>
      <span class="note-footer-icon delete-icon" data-id="${note.id}" title="Delete">${TRASH_SVG}</span>
    </div>
  `;

  card.querySelector('.note-content').addEventListener('blur', e => {
    const id = parseInt(e.target.dataset.id);
    const n = notes.find(x => x.id === id);
    if (n) n.content = e.target.innerText.trim();
  });

  return card;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function render() {
  const visible = filteredNotes();
  canvas.innerHTML = '';

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
  updateBadge();
}

function updateBadge() {
  allBadge.textContent = notes.length;
}

function deleteNote(id) {
  notes = notes.filter(n => n.id !== id);
  render();
}

function openModal() {
  noteContent.value = '';
  urgentCheck.checked = false;
  groupSelect.value = activeGroup !== 'all' ? activeGroup : 'work';
  modalOverlay.classList.remove('hidden');
  setTimeout(() => noteContent.focus(), 50);
}

function closeModal() {
  modalOverlay.classList.add('hidden');
}

function addNote() {
  const content = noteContent.value.trim();
  if (!content) {
    noteContent.focus();
    noteContent.style.borderColor = '#EF4444';
    setTimeout(() => { noteContent.style.borderColor = ''; }, 1500);
    return;
  }

  const group = groupSelect.value;
  const urgent = urgentCheck.checked;

  notes.unshift({
    id: nextId++,
    group,
    urgent,
    content,
    date: formatDate(new Date()),
  });

  closeModal();
  render();
}

// ── Event Listeners ──

document.getElementById('newNoteBtn').addEventListener('click', openModal);
document.getElementById('cancelBtn').addEventListener('click', closeModal);
document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
document.getElementById('addBtn').addEventListener('click', addNote);

modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) closeModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

noteContent.addEventListener('keydown', e => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) addNote();
});

// Sidebar group filter
document.querySelectorAll('.sidebar-item[data-group]').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    activeGroup = item.dataset.group;
    render();
  });
});

// Tab filter
document.querySelectorAll('.tab[data-tab]').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeTab = tab.dataset.tab;
    render();
  });
});

// Delete via event delegation on canvas
canvas.addEventListener('click', e => {
  const btn = e.target.closest('[data-id].note-close, .delete-icon[data-id]');
  if (btn) {
    deleteNote(parseInt(btn.dataset.id));
  }
});

// Initial render
render();
