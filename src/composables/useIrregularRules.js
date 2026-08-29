/**
 * 不规则 / 拼写变体判定引擎
 *
 * 原理：对每个动词的每个时态，先按西班牙语「规则变位」计算出期望形式，
 * 再与 verbos 包的实际变位逐人称比对：
 *   - 完全一致                          → 规则（白底 ''）
 *   - 仅正字法差异（qu↔c / gu↔g / z↔c）→ 拼写变体（黄底 'spell'）
 *   - 其他任何差异                      → 不规则（红底 'irreg'）
 *
 * 红线遵守（表现层手册 C.2.3）：不硬编码 13k 条判断，用规则推导。
 * 兜底：反身动词（-se）逐格推导不可靠，退回动词级 regular 元数据。
 */
import { getVerb, PERSONS } from './useVerbs'

const PKEYS = ['yo', 'tu', 'ud', 'nosotros', 'vosotros', 'uds']

/** 完成时态 → haber 助动词变位（仅用于识别，判定走分词规则） */
const COMPOUND_KEYS = new Set([
  'indicativo.presentePerfecto', 'indicativo.pluscuamperfecto', 'indicativo.preteritoAnterior',
  'indicativo.futuroPerfecto', 'indicativo.condicionalPerfecto',
  'subjuntivo.presentePerfecto', 'subjuntivo.pluscuamperfecto', 'subjuntivo.futuroPerfecto',
])

/** 简单时态的规则词尾（按动词类型 -ar/-er/-ir，顺序 = PKEYS） */
const SIMPLE = {
  'indicativo.presente': {
    ar: ['o', 'as', 'a', 'amos', 'áis', 'an'],
    er: ['o', 'es', 'e', 'emos', 'éis', 'en'],
    ir: ['o', 'es', 'e', 'imos', 'ís', 'en'],
  },
  'indicativo.preterito': {
    ar: ['é', 'aste', 'ó', 'amos', 'asteis', 'aron'],
    er: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'],
    ir: ['í', 'iste', 'ió', 'imos', 'isteis', 'ieron'],
  },
  'indicativo.imperfecto': {
    ar: ['aba', 'abas', 'aba', 'ábamos', 'abais', 'aban'],
    er: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
    ir: ['ía', 'ías', 'ía', 'íamos', 'íais', 'ían'],
  },
  'indicativo.futuro': {
    ar: ['ré', 'rás', 'rá', 'remos', 'réis', 'rán'],
    er: ['ré', 'rás', 'rá', 'remos', 'réis', 'rán'],
    ir: ['ré', 'rás', 'rá', 'remos', 'réis', 'rán'],
  },
  'indicativo.condicional': {
    ar: ['ría', 'rías', 'ría', 'ríamos', 'ríais', 'rían'],
    er: ['ría', 'rías', 'ría', 'ríamos', 'ríais', 'rían'],
    ir: ['ría', 'rías', 'ría', 'ríamos', 'ríais', 'rían'],
  },
  'subjuntivo.presente': {
    ar: ['e', 'es', 'e', 'emos', 'éis', 'en'],
    er: ['a', 'as', 'a', 'amos', 'áis', 'an'],
    ir: ['a', 'as', 'a', 'amos', 'áis', 'an'],
  },
  'subjuntivo.imperfecto': {
    ar: ['ara', 'aras', 'ara', 'áramos', 'arais', 'aran'],
    er: ['iera', 'ieras', 'iera', 'iéramos', 'ierais', 'ieran'],
    ir: ['iera', 'ieras', 'iera', 'iéramos', 'ierais', 'ieran'],
  },
  'subjuntivo.imperfectoAlt': {
    ar: ['ase', 'ases', 'ase', 'ásemos', 'aseis', 'asen'],
    er: ['iese', 'ieses', 'iese', 'iésemos', 'ieseis', 'iesen'],
    ir: ['iese', 'ieses', 'iese', 'iésemos', 'ieseis', 'iesen'],
  },
  'subjuntivo.futuro': {
    ar: ['are', 'ares', 'are', 'áremos', 'areis', 'aren'],
    er: ['iere', 'ieres', 'iere', 'iéremos', 'iereis', 'ieren'],
    ir: ['iere', 'ieres', 'iere', 'iéremos', 'iereis', 'ieren'],
  },
}

/** 正字法归一化：只保留发音差异，吞掉 qu/gu/z 的拼写变体 */
const norm = s => s.toLowerCase().replace(/qu/g, 'c').replace(/gu/g, 'g').replace(/z/g, 'c')

/** 拆原形：词干 + 动词类型 + 是否反身 */
function splitInf(inf) {
  const refl = /se$/.test(inf) && inf.length > 4
  const base = refl ? inf.slice(0, -2) : inf
  if (base.endsWith('ar')) return { stem: base.slice(0, -2), type: 'ar', refl }
  if (base.endsWith('er')) return { stem: base.slice(0, -2), type: 'er', refl }
  if (base.endsWith('ir')) return { stem: base.slice(0, -2), type: 'ir', refl }
  return { stem: base, type: 'er', refl }
}

/** 简单时态期望形式（6 人称） */
function expectedSimple(inf, key) {
  const { stem, type } = splitInf(inf)
  const ends = SIMPLE[key]?.[type]
  if (!ends) return null
  // futuro / condicional 加在整个原形之后
  if (key === 'indicativo.futuro' || key === 'indicativo.condicional') {
    return PKEYS.map((_, i) => stem + type + ends[i])
  }
  return PKEYS.map((_, i) => stem + ends[i])
}

/** 命令式期望形式（仅 4 人称） */
function expectedImperativo(inf, negative) {
  const { stem, type } = splitInf(inf)
  if (!negative) {
    const map = {
      ar: { tu: 'a', vosotros: 'ad', ud: 'e', uds: 'en' },
      er: { tu: 'e', vosotros: 'ed', ud: 'a', uds: 'an' },
      ir: { tu: 'e', vosotros: 'id', ud: 'a', uds: 'an' },
    }
    const m = map[type]
    return { tu: stem + m.tu, vosotros: stem + m.vosotros, ud: stem + m.ud, uds: stem + m.uds }
  }
  // 否定命令式 = 虚拟式现在时
  const ends = SIMPLE['subjuntivo.presente'][type]
  return { tu: stem + ends[1], vosotros: stem + ends[4], ud: stem + ends[2], uds: stem + ends[5] }
}

/**
 * 判定一个动词一个时态的全部人称分类
 * @returns {{persons: {key,label,form,cls}[]}|null}
 *          cls ∈ ''（规则）| 'irreg'（红）| 'spell'（黄）| 'skip'（无人称数据）
 */
export function classifyTense(infinitive, mood, tense) {
  const v = getVerb(infinitive)
  if (!v) return null
  const actual = mood === 'imperativo' ? v[tense] : v[mood]?.[tense]
  if (!actual) return null

  const persons = PERSONS.map(p => ({
    key: p.key,
    label: p.label,
    form: actual[p.key] ?? null,
    cls: '',
  }))

  const key = `${mood}.${tense}`
  const { stem, type, refl } = splitInf(infinitive)

  // 反身动词：逐格推导不可靠（实际数据可能带代词），退回动词级 regular
  if (refl) {
    const cls = v.regular ? '' : 'irreg'
    persons.forEach(p => { if (p.form) p.cls = cls })
    return { persons }
  }

  // 完成时态：只判分词（haber 助动词形式固定）
  if (COMPOUND_KEYS.has(key)) {
    const regularParticiple = stem + (type === 'ar' ? 'ado' : 'ido')
    const bad = v.participioPasado !== regularParticiple
    persons.forEach(p => { if (p.form) p.cls = bad ? 'irreg' : '' })
    return { persons }
  }

  let expected = null
  if (mood === 'imperativo') {
    const e = expectedImperativo(infinitive, tense === 'negativo')
    expected = PKEYS.map(k => e[k] ?? null)
  } else {
    expected = expectedSimple(infinitive, key)
  }
  if (!expected) return { persons }

  persons.forEach((p, i) => {
    if (!p.form || !expected[i]) {
      if (p.form) p.cls = ''
      return
    }
    const a = p.form.toLowerCase().replace(/^no\s+/, '')
    const e = expected[i]
    if (a === e) p.cls = ''
    else if (norm(a) === norm(e)) p.cls = 'spell'
    else p.cls = 'irreg'
  })
  return { persons }
}
