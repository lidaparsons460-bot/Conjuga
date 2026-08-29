/**
 * 笔记 store：记录自己发现的规律、口诀、易混点
 * 结构：{ id, title, body, group, verbs[], createdAt, updatedAt }
 * group 三组（与标签大类对齐）：pattern 规律 / mnemonic 口诀 / confusion 易混
 */
import { reactive } from 'vue'
import { db } from './db'

export const NOTE_GROUPS = [
  { key: 'pattern', label: '规律', color: 'var(--color-brand)' },
  { key: 'mnemonic', label: '口诀', color: 'var(--color-ok)' },
  { key: 'confusion', label: '易混', color: 'var(--color-err)' },
]

const state = reactive({
  notes: [],
  ready: false,
})

let uid = Date.now()
const genId = () => `n_${uid++}`

export async function initNotes() {
  state.notes = await db.notes.toArray()
  state.notes.sort((a, b) => b.updatedAt - a.updatedAt)
  state.ready = true
}

export function useNotes() {
  function save(note) {
    note.updatedAt = Date.now()
    db.notes.put(note)
  }

  function add(title, body, group, verbs = []) {
    const note = {
      id: genId(), title, body, group, verbs,
      createdAt: Date.now(), updatedAt: Date.now(),
    }
    state.notes.unshift(note)
    db.notes.put(note)
    return note
  }

  function update(id, patch) {
    const note = state.notes.find(n => n.id === id)
    if (!note) return
    Object.assign(note, patch)
    save(note)
  }

  function remove(id) {
    state.notes = state.notes.filter(n => n.id !== id)
    db.notes.delete(id)
  }

  function byGroup(groupKey) {
    return state.notes.filter(n => n.group === groupKey)
  }

  function search(q) {
    const s = q.trim().toLowerCase()
    if (!s) return state.notes
    return state.notes.filter(n =>
      n.title.toLowerCase().includes(s) || n.body.toLowerCase().includes(s)
    )
  }

  return { state, add, update, remove, byGroup, search }
}
