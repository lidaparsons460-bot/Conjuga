/**
 * 动词库 + 标签 store（Day 4 已迁 IndexedDB，接口与 Day 2 localStorage 版完全一致）
 */
import { reactive } from 'vue'
import { db, migrateFromLocalStorage } from './db'

/** 标签硬编码大类（第二层子标签由用户自建） */
export const TAG_CATEGORIES = [
  { key: 'mistake', label: '错题组', color: 'var(--color-err)' },
  { key: 'pattern', label: '规律组', color: 'var(--color-brand)' },
  { key: 'mnemonic', label: '口诀组', color: 'var(--color-ok)' },
]

const state = reactive({
  verbs: [],   // [{ id, infinitive, tags[], notes, createdAt }]
  tags: [],    // [{ id, name, category, createdAt }]
  ready: false, // IndexedDB 异步加载完成标记
})

let uid = Date.now()
const genId = () => `id_${uid++}`

/** 启动时加载（main.js 调用一次） */
export async function initLibrary() {
  await migrateFromLocalStorage()
  state.verbs = await db.verbs.toArray()
  state.tags = await db.tags.toArray()
  state.ready = true
}

export function useLibrary() {
  // ---- 动词 ----
  function addVerb(infinitive, tagIds = []) {
    if (state.verbs.some(v => v.infinitive === infinitive)) return { ok: false, reason: 'duplicate' }
    const verb = { id: genId(), infinitive, tags: [...tagIds], notes: '', createdAt: Date.now() }
    state.verbs.push(verb)
    db.verbs.put(verb)
    return { ok: true }
  }

  function removeVerb(id) {
    state.verbs = state.verbs.filter(v => v.id !== id)
    db.verbs.delete(id)
  }

  function toggleVerbTag(verbId, tagId) {
    const verb = state.verbs.find(v => v.id === verbId)
    if (!verb) return
    const i = verb.tags.indexOf(tagId)
    if (i >= 0) verb.tags.splice(i, 1)
    else verb.tags.push(tagId)
    db.verbs.put(verb)
  }

  // ---- 标签（两层：硬编码大类 + 自定义子标签） ----
  function addTag(name, category) {
    if (state.tags.some(t => t.name === name)) return { ok: false, reason: 'duplicate' }
    const tag = { id: genId(), name, category, createdAt: Date.now() }
    state.tags.push(tag)
    db.tags.put(tag)
    return { ok: true }
  }

  function renameTag(id, newName) {
    const tag = state.tags.find(t => t.id === id)
    if (!tag) return
    tag.name = newName
    db.tags.put(tag)
  }

  function removeTag(id) {
    state.tags = state.tags.filter(t => t.id !== id)
    db.tags.delete(id)
    // 同步从动词上摘除
    for (const v of state.verbs) {
      const i = v.tags.indexOf(id)
      if (i >= 0) {
        v.tags.splice(i, 1)
        db.verbs.put(v)
      }
    }
  }

  function getTag(id) {
    return state.tags.find(t => t.id === id) ?? null
  }

  /** 按大类分组子标签（左侧树用） */
  function tagsByCategory(categoryKey) {
    return state.tags.filter(t => t.category === categoryKey)
  }

  /** 筛选：标签 id → 动词列表（tagId 为 null 时返回全部） */
  function verbsByTag(tagId) {
    if (!tagId) return state.verbs
    return state.verbs.filter(v => v.tags.includes(tagId))
  }

  return {
    state,
    addVerb,
    removeVerb,
    toggleVerbTag,
    addTag,
    renameTag,
    removeTag,
    getTag,
    tagsByCategory,
    verbsByTag,
  }
}
