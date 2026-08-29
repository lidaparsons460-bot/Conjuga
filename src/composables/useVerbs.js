/**
 * verbos 包适配层（Day 1 验证结论封装）
 *
 * 字段结构（来自 node_modules/verbos/dist/verbo.d.ts）：
 * - Forms = { yo, tu, ud, nosotros, vosotros, uds }  ← 键名【无重音】！tú 是 tu
 * - indicativo: presente / futuro / imperfecto / preterito / condicional
 *               + 5 个完成时（presentePerfecto 等）
 * - subjuntivo: presente / imperfecto / futuro + imperfectoAlt + 3 个完成时
 * - imperativo: 只有 tu / vosotros / ud / uds（无 yo / nosotros）
 * - regular: boolean（动词级不规则标记，非时态级）
 */
import * as verbos from 'verbos'

/** 全部动词 Map：infinitivo → Verbo */
const verbMap = new Map(Object.entries(verbos))

/** 人称规范顺序 + verbos 键名 → 中文显示名 */
export const PERSONS = [
  { key: 'yo', label: 'yo' },
  { key: 'tu', label: 'tú' },
  { key: 'ud', label: 'él/ella/ud' },
  { key: 'nosotros', label: 'nosotros' },
  { key: 'vosotros', label: 'vosotros' },
  { key: 'uds', label: 'ellos/uds' },
]

/** 动词是否存在（录入校验用，重音必须精确） */
export function hasVerb(infinitive) {
  return verbMap.has(infinitive)
}

/** 取完整动词对象（含所有时态变位 + regular 元数据） */
export function getVerb(infinitive) {
  return verbMap.get(infinitive) ?? null
}

/** 取某动词是否不规则（regular 字段反转） */
export function isIrregular(infinitive) {
  const v = verbMap.get(infinitive)
  return v ? !v.regular : false
}

/** 模糊搜索动词原形（支持前缀/包含/后缀，录入自动补全用） */
export function searchVerbs(query, limit = 20) {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const starts = []
  const contains = []
  for (const name of verbMap.keys()) {
    const n = name.toLowerCase()
    if (n.startsWith(q)) starts.push(name)
    else if (n.includes(q)) contains.push(name)
    if (starts.length >= limit) break
  }
  return [...starts, ...contains].slice(0, limit)
}

/** 全部动词名数组（批量导入校验用） */
export function allVerbNames() {
  return [...verbMap.keys()]
}

/**
 * 取变位表单：getForms('poder', 'indicativo', 'presente') → Forms 对象
 * @returns {{yo:string,...}|null}
 */
export function getForms(infinitive, mood, tense) {
  const v = verbMap.get(infinitive)
  if (!v) return null
  // imperativo 的 afirmativo/negativo 是顶层字段，不在 mood 分组下
  if (mood === 'imperativo') return v[tense] ?? null
  return v[mood]?.[tense] ?? null
}

/** 时态清单（按模式分组，供对比中心 / 超级矩阵使用） */
export const TENSE_GROUPS = {
  indicativo: [
    { key: 'presente', label: 'Presente' },
    { key: 'preterito', label: 'Pret. Indefinido' },
    { key: 'imperfecto', label: 'Pret. Imperfecto' },
    { key: 'futuro', label: 'Futuro Simple' },
    { key: 'condicional', label: 'Condicional' },
    { key: 'presentePerfecto', label: 'Pret. Perfecto' },
    { key: 'futuroPerfecto', label: 'Futuro Perfecto' },
    { key: 'pluscuamperfecto', label: 'Pluscuamperfecto' },
    { key: 'preteritoAnterior', label: 'Pret. Anterior' },
    { key: 'condicionalPerfecto', label: 'Condicional Perf.' },
  ],
  subjuntivo: [
    { key: 'presente', label: 'Subj. Presente' },
    { key: 'imperfecto', label: 'Subj. Imperfecto' },
    { key: 'imperfectoAlt', label: 'Subj. Imperf. (-se)' },
    { key: 'futuro', label: 'Subj. Futuro' },
    { key: 'presentePerfecto', label: 'Subj. Perf. Comp.' },
    { key: 'pluscuamperfecto', label: 'Subj. Pluscuam.' },
  ],
  imperativo: [
    { key: 'afirmativo', label: 'Imperativo +' },
    { key: 'negativo', label: 'Imperativo −' },
  ],
}
