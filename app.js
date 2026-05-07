'use strict';

// ── i18n ──────────────────────────────────────────────────

const STRINGS = {
  zh: {
    newNote: '新建便签', groups: '分组', allNotes: '全部便签', addGroup: '+ 添加分组',
    all: '全部', urgent: '紧急', normal: '普通',
    completed: '已完成', trash: '回收站', empty: '清空',
    restore: '恢复', nothingCompleted: '暂无已完成便签', trashEmpty: '回收站为空',
    group: '分组', markAsUrgent: '标记为紧急', content: '内容',
    writePlaceholder: '在这里写下你的便签…', cancel: '取消', addNote: '添加便签',
    newGroup: '新建分组', editGroup: '编辑分组', name: '名称', groupPlaceholder: '例如：健康',
    color: '颜色', save: '保存', signOut: '退出',
    urgentBadge: '紧急', markComplete: '标记为完成',
    moveToTrash: '移到回收站', markUrgent: '标记为紧急', removeUrgency: '取消紧急',
    clickToEdit: '点击编辑…', changeGroup: '更改分组',
    emptyStateMsg: '暂无便签，点击 <strong>新建便签</strong> 添加',
    confirmEmptyTrash: n => `永久删除 ${n} 条便签？`,
    confirmDeleteGroup: n => `该分组有 ${n} 条便签，将被移到回收站，确认继续？`,
    confirmPermDelete: '永久删除这条便签？',
    langToggle: 'English',
    loginSubtitle: '跨设备同步你的便签',
    googleSignIn: '使用 Google 登录',
  },
  en: {
    newNote: 'New Note', groups: 'GROUPS', allNotes: 'All Notes', addGroup: '+ Add Group',
    all: 'All', urgent: 'Urgent', normal: 'Normal',
    completed: 'Completed', trash: 'Trash', empty: 'Empty',
    restore: 'Restore', nothingCompleted: 'Nothing completed yet', trashEmpty: 'Trash is empty',
    group: 'Group', markAsUrgent: 'Mark as Urgent', content: 'Content',
    writePlaceholder: 'Write your note here...', cancel: 'Cancel', addNote: 'Add Note',
    newGroup: 'New Group', editGroup: 'Edit Group', name: 'Name', groupPlaceholder: 'e.g. Health',
    color: 'Color', save: 'Save', signOut: 'Sign out',
    urgentBadge: 'Urgent', markComplete: 'Mark as complete',
    moveToTrash: 'Move to trash', markUrgent: 'Mark as urgent', removeUrgency: 'Remove urgency',
    clickToEdit: 'Click to edit...', changeGroup: 'Change group',
    emptyStateMsg: 'No notes here. Click <strong>+ New Note</strong> to add one.',
    confirmEmptyTrash: n => `Permanently delete ${n} trashed note(s)?`,
    confirmDeleteGroup: n => `This group has ${n} active note(s). They will be moved to trash. Continue?`,
    confirmPermDelete: 'Permanently delete this note?',
    langToggle: '中文',
    loginSubtitle: 'Sync your notes across devices',
    googleSignIn: 'Continue with Google',
  },
};

let lang = 'zh';
const T = () => STRINGS[lang];

function applyLanguage() {
  const s = T();
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = s[el.dataset.i18n];
    if (typeof v === 'string') el.textContent = v;
  });
  const nc = document.getElementById('noteContent');
  if (nc) nc.placeholder = s.writePlaceholder;
  const gn = document.getElementById('groupNameInput');
  if (gn) gn.placeholder = s.groupPlaceholder;
  document.getElementById('langBtn').textContent = s.langToggle;
  const ls = document.getElementById('loginSubtitle');
  if (ls) ls.textContent = s.loginSubtitle;
  const gs = document.getElementById('googleSignInText');
  if (gs) gs.textContent = s.googleSignIn;
  renderAll();
}

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

const IC = {
  check:   `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  zap:     `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  grip:    `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="6" r="1" fill="currentColor"/><circle cx="15" cy="6" r="1" fill="currentColor"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="9" cy="18" r="1" fill="currentColor"/><circle cx="15" cy="18" r="1" fill="currentColor"/></svg>`,
  trash:   `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`,
  pencil:  `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  restore: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.48"/></svg>`,
};

const DEFAULT_GROUPS = [
  { id: 'work',     name: 'Work',     theme: 'amber'  },
  { id: 'personal', name: 'Personal', theme: 'blue'   },
  { id: 'study',    name: 'Study',    theme: 'green'  },
  { id: 'shopping', name: 'Shopping', theme: 'purple' },
];

const DEFAULT_NOTES = [
  { id: 1, group: 'work',     urgent: true,  content: '完成 Q2 绩效报告并在今日下班前发送给经理', date: 'May 7, 2026', x: null, y: null, status: 'active' },
  { id: 2, group: 'personal', urgent: false, content: '买菜：牛奶、鸡蛋、面包、咖啡和新鲜蔬菜',   date: 'May 7, 2026', x: null, y: null, status: 'active' },
  { id: 3, group: 'study',    urgent: false, content: '复习第 5 章：数据结构，完成练习 1-10',       date: 'May 6, 2026', x: null, y: null, status: 'active' },
  { id: 4, group: 'personal', urgent: true,  content: '打电话重约牙医，周四那天有冲突',             date: 'May 5, 2026', x: null, y: null, status: 'active' },
  { id: 5, group: 'shopping', urgent: false, content: '调研新款无线耳机，看看索尼 WH-1000XM5 的评测', date: 'May 4, 2026', x: null, y: null, status: 'active' },
];

// ── State ──────────────────────────────────────────────────

let groups = DEFAULT_GROUPS.map(g => ({ ...g }));
let notes  = [];
let nextId = 6;
let nextGroupId = 1;
let activeGroup = 'all';
let activeTab   = 'all';
let dragState   = null;
let groupModalMode = 'add';
let groupModalEditId = null;
let selectedTheme = 'amber';

// ── Firebase ───────────────────────────────────────────────

let fbAuth = null;
let fbDb   = null;
let currentUser = null;
let saveTimer = null;

const FIREBASE_CONFIGURED = (
  typeof FIREBASE_CONFIG !== 'undefined' &&
  FIREBASE_CONFIG.projectId &&
  FIREBASE_CONFIG.projectId !== 'YOUR_PROJECT_ID'
);

function scheduleSave() {
  saveLocal();
  if (!fbDb || !currentUser) return;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveToCloud, 1500);
}

function saveLocal() {
  try {
    localStorage.setItem('stickyboard_v3', JSON.stringify({
      notes, groups, lang, nextId, nextGroupId,
    }));
  } catch (_) {}
}

function loadLocal() {
  try {
    const raw = localStorage.getItem('stickyboard_v3');
    if (!raw) return false;
    const d = JSON.parse(raw);
    if (d.notes)        notes        = d.notes;
    if (d.groups)       groups       = d.groups;
    if (d.lang)         lang         = d.lang;
    if (d.nextId)       nextId       = d.nextId;
    if (d.nextGroupId)  nextGroupId  = d.nextGroupId;
    return true;
  } catch (_) { return false; }
}

async function saveToCloud() {
  if (!fbDb || !currentUser) return;
  try {
    await fbDb.collection('users').doc(currentUser.uid).set({
      notes, groups, lang, nextId, nextGroupId,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  } catch (e) { console.error('Cloud save failed', e); }
}

async function loadFromCloud() {
  if (!fbDb || !currentUser) return;
  try {
    const snap = await fbDb.collection('users').doc(currentUser.uid).get();
    if (snap.exists) {
      const d = snap.data();
      if (d.notes)       notes       = d.notes;
      if (d.groups)      groups      = d.groups;
      if (d.lang)        lang        = d.lang;
      if (d.nextId)      nextId      = d.nextId;
      if (d.nextGroupId) nextGroupId = d.nextGroupId;
    } else {
      // First login: push local data to cloud
      await saveToCloud();
    }
    saveLocal();
  } catch (e) { console.error('Cloud load failed', e); }
}

// ── DOM refs ───────────────────────────────────────────────

const canvas = document.getElementById('canvas');

// ── Helpers ────────────────────────────────────────────────

const getTheme = n => { const g = groups.find(x => x.id === n.group); return THEMES[g ? g.theme : 'amber']; };
const getGroup = id => groups.find(g => g.id === id);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmtDate = d => d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' });

// ── Group Picker ───────────────────────────────────────────

let pickerNoteId = null;
const picker = document.createElement('div');
picker.className = 'group-picker hidden';
document.body.appendChild(picker);

function showPicker(noteId, tagEl) {
  pickerNoteId = noteId;
  const n = notes.find(x => x.id === noteId);
  picker.innerHTML = groups.map(g => {
    const t = THEMES[g.theme];
    const active = n && n.group === g.id ? 'active-group' : '';
    return `<div class="gpi ${active}" data-gid="${g.id}"><span class="gpi-dot" style="background:${t.dot}"></span><span>${esc(g.name)}</span></div>`;
  }).join('');
  picker.classList.remove('hidden');
  const r = tagEl.getBoundingClientRect();
  picker.style.top = (r.bottom + 4) + 'px';
  picker.style.left = r.left + 'px';
}

function hidePicker() { picker.classList.add('hidden'); pickerNoteId = null; }

picker.addEventListener('click', e => {
  const item = e.target.closest('.gpi');
  if (!item) return;
  const n = notes.find(x => x.id === pickerNoteId);
  if (n) { n.group = item.dataset.gid; scheduleSave(); }
  hidePicker(); renderCanvas();
});

document.addEventListener('click', e => {
  if (!picker.classList.contains('hidden') && !e.target.closest('.note-group-tag') && !e.target.closest('.group-picker')) hidePicker();
});

// ── Positions ──────────────────────────────────────────────

function assignInitialPositions() {
  const cols = 3;
  notes.filter(n => n.status === 'active').forEach((note, i) => {
    if (note.x === null || note.x === undefined) {
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
    card.classList.add('dragging'); card.style.zIndex = 200;
  };
  card.addEventListener('mousedown', e => {
    if (e.target.closest('.note-content,.note-action-btn,.note-group-tag,button')) return;
    e.preventDefault(); start(e.clientX, e.clientY);
  });
  card.addEventListener('touchstart', e => {
    if (e.target.closest('.note-content,.note-action-btn,.note-group-tag,button')) return;
    start(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
}

document.addEventListener('mousemove', e => {
  if (!dragState) return;
  const { card, offsetX, offsetY, noteId } = dragState;
  const r = canvas.getBoundingClientRect();
  const x = Math.max(0, e.clientX - r.left + canvas.scrollLeft - offsetX - CANVAS_PADDING);
  const y = Math.max(0, e.clientY - r.top  + canvas.scrollTop  - offsetY - CANVAS_PADDING);
  card.style.left = x + 'px'; card.style.top = y + 'px';
  const n = notes.find(x => x.id === noteId);
  if (n) { n.x = x; n.y = y; }
  updateCanvasHeight();
});

document.addEventListener('mouseup', () => {
  if (!dragState) return;
  dragState.card.classList.remove('dragging'); dragState.card.style.zIndex = '';
  scheduleSave(); dragState = null;
});

document.addEventListener('touchmove', e => {
  if (!dragState) return; e.preventDefault();
  const t = e.touches[0];
  const { card, offsetX, offsetY, noteId } = dragState;
  const r = canvas.getBoundingClientRect();
  const x = Math.max(0, t.clientX - r.left + canvas.scrollLeft - offsetX - CANVAS_PADDING);
  const y = Math.max(0, t.clientY - r.top  + canvas.scrollTop  - offsetY - CANVAS_PADDING);
  card.style.left = x + 'px'; card.style.top = y + 'px';
  const n = notes.find(x => x.id === noteId);
  if (n) { n.x = x; n.y = y; }
  updateCanvasHeight();
}, { passive: false });

document.addEventListener('touchend', () => {
  if (!dragState) return;
  dragState.card.classList.remove('dragging'); dragState.card.style.zIndex = '';
  scheduleSave(); dragState = null;
});

// ── Note Card ──────────────────────────────────────────────

function createNoteCard(note) {
  const theme = getTheme(note);
  const group = getGroup(note.group);
  const groupName = group ? group.name : note.group;
  const s = T();

  const card = document.createElement('div');
  card.className = 'note-card';
  card.dataset.id = note.id;
  card.style.cssText = `background:${theme.cardBg};left:${note.x}px;top:${note.y}px`;

  card.innerHTML = `
    <div class="note-accent" style="background:${theme.accent}"></div>
    <div class="note-header">
      <div class="note-group-tag" data-id="${note.id}" style="background:${theme.tagBg};color:${theme.tagText}" title="${s.changeGroup}">${esc(groupName)}</div>
      ${note.urgent ? `<div class="note-urgent-badge"><span class="udot"></span>${s.urgentBadge}</div>` : ''}
      <div class="note-spacer"></div>
      <button class="note-action-btn complete-btn" data-id="${note.id}" title="${s.markComplete}">${IC.check}</button>
      <button class="note-action-btn trash-btn"    data-id="${note.id}" title="${s.moveToTrash}">${IC.trash}</button>
    </div>
    <div class="note-content" contenteditable="true" data-id="${note.id}" data-placeholder="${s.clickToEdit}">${esc(note.content)}</div>
    <div class="note-footer">
      <span class="note-date">${note.date}</span>
      <div class="note-footer-spacer"></div>
      <button class="note-action-btn urgency-btn ${note.urgent ? 'is-urgent' : ''}" data-id="${note.id}" title="${note.urgent ? s.removeUrgency : s.markUrgent}">${IC.zap}</button>
      <span class="note-footer-icon">${IC.grip}</span>
    </div>`;

  card.querySelector('.note-content').addEventListener('blur', e => {
    const n = notes.find(x => x.id === +e.target.dataset.id);
    if (n) { n.content = e.target.innerText.trim(); scheduleSave(); }
  });

  card.querySelector('.note-group-tag').addEventListener('click', e => {
    e.stopPropagation();
    if (!picker.classList.contains('hidden') && pickerNoteId === note.id) { hidePicker(); return; }
    showPicker(note.id, e.currentTarget);
  });

  initDrag(card, note);
  return card;
}

// ── Render ─────────────────────────────────────────────────

function renderCanvas() {
  canvas.innerHTML = ''; canvas.style.minHeight = ''; hidePicker();
  const visible = notes.filter(n => {
    if (n.status !== 'active') return false;
    if (activeGroup !== 'all' && n.group !== activeGroup) return false;
    if (activeTab === 'urgent' && !n.urgent) return false;
    if (activeTab === 'normal' &&  n.urgent) return false;
    return true;
  });
  if (!visible.length) {
    canvas.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5">
          <path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/>
          <path d="M15 3v6h6"/><path d="M8 13h8"/><path d="M8 17h5"/>
        </svg>
        <span>${T().emptyStateMsg}</span>
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
        <button class="group-action-btn edit-group-btn"   data-id="${g.id}">${IC.pencil}</button>
        <button class="group-action-btn del delete-group-btn" data-id="${g.id}">×</button>
      </div>`;
    div.addEventListener('click', e => {
      if (e.target.closest('.group-action-btn')) return;
      document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
      div.classList.add('active'); activeGroup = g.id; renderCanvas();
    });
    groupList.appendChild(div);
  });

  document.getElementById('sidebarAll').classList.toggle('active', activeGroup === 'all');
  document.getElementById('allBadge').textContent = notes.filter(n => n.status === 'active').length;

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
  const s = T();
  const div = document.createElement('div');
  div.className = 'mini-card';
  div.innerHTML = `
    <div class="mini-card-top">
      <span class="mini-tag" style="background:${theme.tagBg};color:${theme.tagText}">${esc(groupName)}</span>
      <span class="mini-date">${note.date}</span>
    </div>
    <div class="mini-content">${esc(note.content)}</div>
    <div class="mini-actions">
      <button class="mini-restore-btn" data-id="${note.id}" data-action="restore">${IC.restore} ${s.restore}</button>
      ${type === 'trashed' ? `<button class="mini-delete-btn" data-id="${note.id}" data-action="perm-delete">×</button>` : ''}
    </div>`;
  return div;
}

function renderRightPanel() {
  const s = T();
  const completed = notes.filter(n => n.status === 'completed');
  const trashed   = notes.filter(n => n.status === 'trashed');
  document.getElementById('completedCount').textContent = completed.length;
  document.getElementById('trashCount').textContent = trashed.length;
  const cList = document.getElementById('completedList');
  cList.innerHTML = completed.length ? '' : `<div class="mini-empty">${s.nothingCompleted}</div>`;
  completed.forEach(n => cList.appendChild(createMiniCard(n, 'completed')));
  const tList = document.getElementById('trashList');
  tList.innerHTML = trashed.length ? '' : `<div class="mini-empty">${s.trashEmpty}</div>`;
  trashed.forEach(n => tList.appendChild(createMiniCard(n, 'trashed')));
}

function renderAll() { renderSidebar(); renderCanvas(); renderRightPanel(); }

// ── Note Operations ────────────────────────────────────────

function noteSetStatus(id, status) {
  const n = notes.find(x => x.id === id);
  if (!n) return;
  if (status === 'active' && (n.x === null || n.x === undefined)) {
    const pos = findNewNotePosition(); n.x = pos.x; n.y = pos.y;
  }
  n.status = status; scheduleSave(); renderAll();
}

function toggleUrgent(id) {
  const n = notes.find(x => x.id === id);
  if (n) { n.urgent = !n.urgent; scheduleSave(); renderCanvas(); }
}

function permanentDelete(id) { notes = notes.filter(n => n.id !== id); scheduleSave(); renderRightPanel(); }

function emptyTrash() {
  const count = notes.filter(n => n.status === 'trashed').length;
  if (!count || !confirm(T().confirmEmptyTrash(count))) return;
  notes = notes.filter(n => n.status !== 'trashed'); scheduleSave(); renderRightPanel();
}

// ── Group Operations ───────────────────────────────────────

function renderColorPicker() {
  document.getElementById('colorPicker').innerHTML = Object.entries(THEMES).map(([key, t]) =>
    `<div class="color-dot-pick ${selectedTheme === key ? 'selected' : ''}" data-theme="${key}" style="background:${t.dot}"></div>`
  ).join('');
}

function openGroupModal(mode, groupId = null) {
  groupModalMode = mode; groupModalEditId = groupId;
  const g = groupId ? getGroup(groupId) : null;
  const s = T();
  document.getElementById('groupModalTitle').textContent = mode === 'add' ? s.newGroup : s.editGroup;
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
    el.style.borderColor = '#EF4444'; el.focus();
    setTimeout(() => { el.style.borderColor = ''; }, 1500); return;
  }
  if (groupModalMode === 'add') {
    groups.push({ id: 'grp_' + (nextGroupId++), name, theme: selectedTheme });
  } else {
    const g = getGroup(groupModalEditId);
    if (g) { g.name = name; g.theme = selectedTheme; }
  }
  closeGroupModal(); scheduleSave(); renderAll();
}

function deleteGroup(id) {
  const activeIn = notes.filter(n => n.group === id && n.status === 'active');
  if (activeIn.length && !confirm(T().confirmDeleteGroup(activeIn.length))) return;
  activeIn.forEach(n => n.status = 'trashed');
  groups = groups.filter(g => g.id !== id);
  if (activeGroup === id) activeGroup = 'all';
  scheduleSave(); renderAll();
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
    el.style.borderColor = '#EF4444'; el.focus();
    setTimeout(() => { el.style.borderColor = ''; }, 1500); return;
  }
  const pos = findNewNotePosition();
  notes.unshift({
    id: nextId++, group: document.getElementById('groupSelect').value,
    urgent: document.getElementById('urgentCheck').checked,
    content, date: fmtDate(new Date()), x: pos.x, y: pos.y, status: 'active',
  });
  closeNoteModal(); scheduleSave(); renderAll();
}

// ── Event Listeners ────────────────────────────────────────

document.getElementById('newNoteBtn').addEventListener('click', openNoteModal);
document.getElementById('noteModalCloseBtn').addEventListener('click', closeNoteModal);
document.getElementById('noteCancelBtn').addEventListener('click', closeNoteModal);
document.getElementById('noteAddBtn').addEventListener('click', addNote);
document.getElementById('noteModalOverlay').addEventListener('click', e => { if (e.target.id === 'noteModalOverlay') closeNoteModal(); });
document.getElementById('noteContent').addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) addNote(); });

document.getElementById('addGroupBtn').addEventListener('click', () => openGroupModal('add'));
document.getElementById('groupModalCloseBtn').addEventListener('click', closeGroupModal);
document.getElementById('groupCancelBtn').addEventListener('click', closeGroupModal);
document.getElementById('groupSaveBtn').addEventListener('click', saveGroup);
document.getElementById('groupModalOverlay').addEventListener('click', e => { if (e.target.id === 'groupModalOverlay') closeGroupModal(); });
document.getElementById('groupNameInput').addEventListener('keydown', e => { if (e.key === 'Enter') saveGroup(); });

document.getElementById('colorPicker').addEventListener('click', e => {
  const dot = e.target.closest('.color-dot-pick');
  if (!dot) return;
  selectedTheme = dot.dataset.theme;
  document.querySelectorAll('.color-dot-pick').forEach(d => d.classList.toggle('selected', d.dataset.theme === selectedTheme));
});

document.getElementById('groupList').addEventListener('click', e => {
  if (e.target.closest('.edit-group-btn'))   openGroupModal('edit', e.target.closest('.edit-group-btn').dataset.id);
  if (e.target.closest('.delete-group-btn')) deleteGroup(e.target.closest('.delete-group-btn').dataset.id);
});

document.getElementById('sidebarAll').addEventListener('click', () => {
  document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
  document.getElementById('sidebarAll').classList.add('active');
  activeGroup = 'all'; renderCanvas();
});

document.querySelectorAll('.tab[data-tab]').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active'); activeTab = tab.dataset.tab; renderCanvas();
  });
});

canvas.addEventListener('click', e => {
  const c = e.target.closest('.complete-btn');
  const t = e.target.closest('.trash-btn');
  const u = e.target.closest('.urgency-btn');
  if (c) noteSetStatus(+c.dataset.id, 'completed');
  if (t) noteSetStatus(+t.dataset.id, 'trashed');
  if (u) toggleUrgent(+u.dataset.id);
});

document.getElementById('completedList').addEventListener('click', e => {
  const r = e.target.closest('[data-action="restore"]');
  if (r) noteSetStatus(+r.dataset.id, 'active');
});

document.getElementById('trashList').addEventListener('click', e => {
  const r = e.target.closest('[data-action="restore"]');
  const d = e.target.closest('[data-action="perm-delete"]');
  if (r) noteSetStatus(+r.dataset.id, 'active');
  if (d && confirm(T().confirmPermDelete)) permanentDelete(+d.dataset.id);
});

document.getElementById('emptyTrashBtn').addEventListener('click', emptyTrash);

document.getElementById('langBtn').addEventListener('click', () => {
  lang = lang === 'zh' ? 'en' : 'zh';
  scheduleSave(); applyLanguage();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeNoteModal(); closeGroupModal(); hidePicker(); }
});

// ── Init ───────────────────────────────────────────────────

function startApp() {
  document.getElementById('loadingScreen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  assignInitialPositions();
  applyLanguage(); // also calls renderAll
}

if (FIREBASE_CONFIGURED) {
  // Show spinner while auth resolves
  document.getElementById('loadingScreen').classList.remove('hidden');

  firebase.initializeApp(FIREBASE_CONFIG);
  fbAuth = firebase.auth();
  fbDb   = firebase.firestore();

  fbAuth.onAuthStateChanged(async user => {
    if (user) {
      currentUser = user;
      document.getElementById('userInfo').classList.remove('hidden');
      document.getElementById('userAvatar').src = user.photoURL || '';
      document.getElementById('userName').textContent = user.displayName || user.email;
      document.getElementById('loginScreen').classList.add('hidden');

      // Load from cloud (merge with local)
      if (!loadLocal()) { notes = DEFAULT_NOTES.map(n => ({ ...n })); }
      await loadFromCloud();
      assignInitialPositions();
      startApp();
    } else {
      currentUser = null;
      document.getElementById('loadingScreen').classList.add('hidden');
      document.getElementById('loginScreen').classList.remove('hidden');
      document.getElementById('app').classList.add('hidden');
      document.getElementById('userInfo').classList.add('hidden');
      // Pre-fill login subtitle with lang from localStorage
      loadLocal();
      const ls = document.getElementById('loginSubtitle');
      const gs = document.getElementById('googleSignInText');
      if (ls) ls.textContent = T().loginSubtitle;
      if (gs) gs.textContent = T().googleSignIn;
    }
  });

  document.getElementById('googleSignInBtn').addEventListener('click', () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    fbAuth.signInWithPopup(provider).catch(err => {
      // Popup blocked? Try redirect
      if (err.code === 'auth/popup-blocked') fbAuth.signInWithRedirect(provider);
      else console.error(err);
    });
  });

  document.getElementById('signOutBtn').addEventListener('click', () => fbAuth.signOut());

} else {
  // No Firebase — use localStorage only
  if (!loadLocal()) {
    notes = DEFAULT_NOTES.map(n => ({ ...n }));
  }
  startApp();
}
