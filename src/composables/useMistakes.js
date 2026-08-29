/**
 * 错题 store + 简化 SM-2 复习调度
 *
 * 错题粒度 = 动词 × 模式 × 时态（人称错哪格就整卡重来，符合"默整个时态"的学习习惯）
 * SM-2 简化：quality 只有 对(5) / 错(2) 两档
 *   - 错 → 间隔归 1，连对清零，回到明天重练
 *   - 对 → 连对+1，间隔按 [1,2,4,7,15,30] 天梯度走（覆盖艾宾浩斯关键点）
 *   - 连对 3 次 → 毕业出队（错题集隐藏，历史保留）
 */
import { reactive } from 'vue'
import { db } from './db'

const DAY = 24 * 60 * 60 * 1000
/** 间隔梯度（天）：连对第 1/2/3/4/5/6 次后的下次间隔 */
const INTERVALS = [1, 2, 4, 7, 15, 30]
const GRADUATE_AT = 3 // 连对 3 次毕业

const state = reactive({
  mistakes: [], // [{ key, infinitivo, mood, tense, streak, wrongCount, lastWrong, dueAt, graduated }]
  ready: false,
})

const keyOf = (inf, mood, tense) => `${inf}|${mood}|${tense}`

export async function initMistakes() {
  state.mistakes = await db.mistakes.toArray()
  state.ready = true
}

function persist(m) {
  db.mistakes.put(m)
}

export function useMistakes() {
  /** 练习答错时入库（已存在则重置进度） */
  function recordWrong(infinitivo, mood, tense) {
    const key = keyOf(infinitivo, mood, tense)
    let m = state.mistakes.find(x => x.key === key)
    if (m) {
      m.streak = 0
      m.wrongCount++
      m.lastWrong = Date.now()
      m.dueAt = Date.now() + DAY
      m.graduated = false
    } else {
      m = {
        key, infinitivo, mood, tense,
        streak: 0, wrongCount: 1, lastWrong: Date.now(),
        dueAt: Date.now() + DAY, graduated: false,
      }
      state.mistakes.push(m)
    }
    persist(m)
  }

  /** 练习答对时推进（对已有错题卡片生效） */
  function recordRight(infinitivo, mood, tense) {
    const m = state.mistakes.find(x => x.key === keyOf(infinitivo, mood, tense))
    if (!m || m.graduated) return
    m.streak++
    m.dueAt = Date.now() + (INTERVALS[Math.min(m.streak, INTERVALS.length) - 1] ?? 30) * DAY
    if (m.streak >= GRADUATE_AT) m.graduated = true
    persist(m)
  }

  /** 判断某动词时态当前是否是"活跃错题"（答对不应推进非错题/已毕业卡） */
  function isActive(infinitivo, mood, tense) {
    const m = state.mistakes.find(x => x.key === keyOf(infinitivo, mood, tense))
    return !!m && !m.graduated
  }

  /** 到期待复习队列（按到期时间升序） */
  function dueList(now = Date.now()) {
    return state.mistakes
      .filter(m => !m.graduated && m.dueAt <= now)
      .sort((a, b) => a.dueAt - b.dueAt)
  }

  /** 手动重置毕业卡（错题复发） */
  function reset(m) {
    m.streak = 0
    m.graduated = false
    m.dueAt = Date.now() + DAY
    persist(m)
  }

  function remove(m) {
    state.mistakes = state.mistakes.filter(x => x.key !== m.key)
    db.mistakes.delete(m.key)
  }

  return { state, recordWrong, recordRight, isActive, dueList, reset, remove }
}
