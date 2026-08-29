/**
 * IndexedDB 持久层（Dexie）
 * Day 4 从 localStorage 迁移而来：老数据自动导入后清空旧 key。
 * useLibrary 的对外接口保持不变（reactive state + 同名方法），视图零改动。
 */
import Dexie from 'dexie'

export const db = new Dexie('conjuga-db')
db.version(1).stores({
  verbs: 'id, infinitivo',
  tags: 'id, category, name',
})
db.version(2).stores({
  mistakes: 'key, infinitivo, mood, tense, dueAt',
})
db.version(3).stores({
  notes: 'id, group, updatedAt',
})

const LEGACY_KEYS = ['conjuga.verbs', 'conjuga.tags']

/** 首次启动迁移：localStorage → IndexedDB（幂等，迁移成功后删旧 key） */
export async function migrateFromLocalStorage() {
  try {
    const [verbCount, tagCount] = await Promise.all([db.verbs.count(), db.tags.count()])
    if (verbCount > 0 || tagCount > 0) return // 已迁移过
    for (const key of LEGACY_KEYS) {
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const data = JSON.parse(raw)
      if (!Array.isArray(data) || !data.length) continue
      await db.table(key === 'conjuga.verbs' ? 'verbs' : 'tags').bulkPut(data)
      localStorage.removeItem(key)
    }
  } catch (e) {
    console.warn('[conjuga] localStorage 迁移失败（数据保留在原处）:', e)
  }
}
