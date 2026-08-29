/**
 * 抽题引擎：动词 × 模式 × 时态 × 人称 随机组合
 */
import { TENSE_GROUPS, getForms } from './useVerbs'
import { useLibrary } from './useLibrary'
import { useMistakes } from './useMistakes'

/** 可抽的时态池（练习默认只抽简单时态，完成时态太依赖 haber 背诵，P2 再开） */
export const PRACTICE_TENSES = [
  ['indicativo', 'presente'],
  ['indicativo', 'preterito'],
  ['indicativo', 'imperfecto'],
  ['indicativo', 'futuro'],
  ['indicativo', 'condicional'],
  ['subjuntivo', 'presente'],
  ['subjuntivo', 'imperfecto'],
]

const TENSE_LABEL = (mood, key) => TENSE_GROUPS[mood].find(t => t.key === key)?.label ?? key

/** 人称池：imperativo 无 yo/nosotros（其余时态 6 人称全抽） */
const PERSONS_ALL = ['yo', 'tu', 'ud', 'nosotros', 'vosotros', 'uds']
const PERSON_LABEL = {
  yo: 'yo', tu: 'tú', ud: 'él/ella/ud',
  nosotros: 'nosotros', vosotros: 'vosotros', uds: 'ellos/uds',
}

const rnd = arr => arr[Math.floor(Math.random() * arr.length)]

export function usePractice() {
  const { verbsByTag } = useLibrary()

  /**
   * 抽一题
   * @param {string|null} tagId null=全库
   * @param {boolean} dueFirst true=优先抽活跃错题到期卡（复习模式）
   * @returns {{infinitivo, mood, tense, tenseLabel, personKey, personLabel, answer}|null}
   */
  function draw(tagId = null, dueFirst = false) {
    const verbs = verbsByTag(tagId)
    if (!verbs.length) return null

    if (dueFirst) {
      const { dueList } = useMistakes()
      // 注意：动词库存 infinitive，错题库存 infinitivo —— 两边字段名不同
      const due = dueList().filter(m => verbs.some(v => v.infinitive === m.infinitivo))
      if (due.length) {
        const m = rnd(due)
        return buildQuestion(m.infinitivo, m.mood, m.tense)
      }
    }

    // 普通随机抽：动词 × 简单时态 × 6 人称
    // 【bug 修复】动词库字段是 infinitive（不是 verbos 包的 infinitivo）
    for (let i = 0; i < 10; i++) {
      const verb = rnd(verbs)
      const [mood, tense] = rnd(PRACTICE_TENSES)
      const q = buildQuestion(verb.infinitive, mood, tense)
      if (q) return q
    }
    return null
  }

  function buildQuestion(infinitivo, mood, tense) {
    const forms = getForms(infinitivo, mood, tense)
    if (!forms) return null
    const personKey = rnd(PERSONS_ALL.filter(k => forms[k]))
    if (!personKey) return null
    return {
      infinitivo, mood, tense,
      tenseLabel: TENSE_LABEL(mood, tense),
      personKey,
      personLabel: PERSON_LABEL[personKey],
      answer: forms[personKey],
    }
  }

  return { draw, buildQuestion }
}
