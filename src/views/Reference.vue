<script setup>
/**
 * 时态规律速查：规则词尾表 + stem-changing 规律 + 拼写变体
 * 数据为静态教学表格（不依赖动词库）。
 */
import { ref } from 'vue'

const PERSONS = ['yo', 'tú', 'él/ud', 'nos.', 'vos.', 'ellos']

/** 规则词尾表（以 hablar / comer / vivir 为例词） */
const ENDINGS = [
  {
    group: 'Indicativo · 简单时态',
    rows: [
      { tense: 'Presente', ar: ['hablo', 'hablas', 'habla', 'hablamos', 'habláis', 'hablan'], er: ['como', 'comes', 'come', 'comemos', 'coméis', 'comen'], ir: ['vivo', 'vives', 'vive', 'vivimos', 'vivís', 'viven'] },
      { tense: 'Pretérito Indefinido', ar: ['hablé', 'hablaste', 'habló', 'hablamos', 'hablasteis', 'hablaron'], er: ['comí', 'comiste', 'comió', 'comimos', 'comisteis', 'comieron'], ir: ['viví', 'viviste', 'vivió', 'vivimos', 'vivisteis', 'vivieron'] },
      { tense: 'Pretérito Imperfecto', ar: ['hablaba', 'hablabas', 'hablaba', 'hablábamos', 'hablabais', 'hablaban'], er: ['comía', 'comías', 'comía', 'comíamos', 'comíais', 'comían'], ir: ['vivía', 'vivías', 'vivía', 'vivíamos', 'vivíais', 'vivían'] },
      { tense: 'Futuro Simple', ar: 'hablar', er: 'comer', ir: 'vivir', suffix: ['ré', 'rás', 'rá', 'remos', 'réis', 'rán'] },
      { tense: 'Condicional', ar: 'hablar', er: 'comer', ir: 'vivir', suffix: ['ría', 'rías', 'ría', 'ríamos', 'ríais', 'rían'] },
    ],
  },
  {
    group: 'Subjuntivo · 简单时态',
    rows: [
      { tense: 'Presente', ar: ['hable', 'hables', 'hable', 'hablemos', 'habléis', 'hablen'], er: ['coma', 'comas', 'coma', 'comamos', 'comáis', 'coman'], ir: ['viva', 'vivas', 'viva', 'vivamos', 'viváis', 'vivan'], note: '词尾 -ar↔-er/ir 互换（交叉规则）' },
      { tense: 'Imperfecto (-ra)', ar: ['hablara', 'hablaras', 'hablara', 'habláramos', 'hablarais', 'hablaran'], er: ['comiera', 'comieras', 'comiera', 'comiéramos', 'comierais', 'comieran'], ir: ['viviera', 'vivieras', 'viviera', 'viviéramos', 'vivierais', 'vivieran'] },
      { tense: 'Imperfecto (-se)', ar: ['hablase', 'hablases', 'hablase', 'hablásemos', 'hablaseis', 'hablasen'], er: ['comiese', 'comieses', 'comiese', 'comiésemos', 'comieseis', 'comiesen'], ir: ['viviese', 'vivieses', 'viviese', 'vivieseis*', 'vivieseis', 'viviesen'] },
    ],
  },
  {
    group: 'Imperativo',
    rows: [
      { tense: 'Afirmativo', ar: ['—', 'habla', 'hable', '—', 'hablad', 'hablen'], er: ['—', 'come', 'coma', '—', 'comed', 'coman'], ir: ['—', 'vive', 'viva', '—', 'vivid', 'vivan'], note: '只有 4 人称；-ir 的 vosotros 是 -id' },
      { tense: 'Negativo', ar: ['—', 'no hables', 'no hable', '—', 'no habléis', 'no hablen'], er: ['—', 'no comas', 'no coma', '—', 'no comáis', 'no coman'], ir: ['—', 'no vivas', 'no viva', '—', 'no viváis', 'no vivan'], note: '否定命令式 = 虚拟式现在时' },
    ],
  },
]

/** Stem-changing 主表 */
const STEM = [
  { change: 'e → ie', verbs: 'querer, pensar, entender, empezar, preferir, sentir, divertirse', tense: 'Pres. / Subj.Pres.', exempt: 'nosotros & vosotros 不变（"boot" 靴子动词）' },
  { change: 'o → ue', verbs: 'poder, dormir, volver, contar, costar, encontrar, morir', tense: 'Pres. / Subj.Pres.', exempt: 'nosotros & vosotros 不变（morir 同时 o→ue+ü：murmurando dormimos）' },
  { change: 'e → i', verbs: 'pedir, servir, repetir, seguir, vestir, elegir', tense: 'Pres. / Pret. / Subj.Pres. / Imp.', exempt: '-ir 动词为主，6 人称中 4 个变' },
  { change: 'u → ue', verbs: 'jugar（唯一）', tense: 'Pres. / Subj.Pres.', exempt: 'juego / juegas / juega / jugamos / jugáis / juegan' },
  { change: 'i → ie', verbs: 'adquirir（唯一）', tense: 'Pres. / Subj.Pres.', exempt: 'adquiero / adquieres / adquiere' },
]

/** 拼写变体（正字法）——只为保证发音不变 */
const SPELL = [
  { rule: 'c → qu', when: '-car 动词 + e 前的词尾', ex: 'buscar → busqué / toque (toca→toque)', note: '保持 /k/ 音' },
  { rule: 'g → gu', when: '-gar 动词 + e 前的词尾', ex: 'llegar → llegué / llegue (llega→llegue)', note: '保持 /g/ 音' },
  { rule: 'z → c', when: '-zar 动词 + e 前的词尾', ex: 'empezar → empecé / empiece (empieza→empiece)', note: 'z 不出现在 e/i 前' },
  { rule: 'gu → g', when: '-guar 动词', ex: 'averiguar → averigüe', note: 'ü 保持 /gw/ 音' },
  { rule: 'g → j', when: '-ger/-gir 动词 + o/a 前', ex: 'recoger → recojo / dirige (dirige→dirija)', note: '保持 /x/ 音' },
  { rule: ' vowel + -cer/-cir → -zco', when: 'yo 现在时', ex: 'conocer → conozco / traducir → traduzco', note: '发音拼写惯例' },
]

const tab = ref('endings') // endings / stem / spell
</script>

<template>
  <div class="ref">
    <div class="mode-tabs">
      <button :class="{ active: tab === 'endings' }" @click="tab = 'endings'">词尾表</button>
      <button :class="{ active: tab === 'stem' }" @click="tab = 'stem'">词干变化</button>
      <button :class="{ active: tab === 'spell' }" @click="tab = 'spell'">拼写变体</button>
    </div>

    <!-- ============ 词尾表 ============ -->
    <div v-if="tab === 'endings'">
      <div v-for="g in ENDINGS" :key="g.group" class="group">
        <div class="g-label">{{ g.group }}</div>
        <div class="card-table">
          <table>
            <thead>
              <tr><th>时态</th><th>-ar（hablar）</th><th>-er（comer）</th><th>-ir（vivir）</th></tr>
            </thead>
            <tbody>
              <tr v-for="r in g.rows" :key="r.tense">
                <th>
                  {{ r.tense }}
                  <small v-if="r.note">{{ r.note }}</small>
                </th>
                <td v-for="col in ['ar', 'er', 'ir']" :key="col">
                  <template v-if="Array.isArray(r[col])">
                    <span v-for="(f, i) in r[col]" :key="i" class="f">{{ f }}</span>
                  </template>
                  <template v-else>
                    <span class="f stem">{{ r[col] }}</span><span v-for="(s, i) in r.suffix" :key="i" class="f">{{ s }}</span>
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <p class="foot-note">人称顺序：yo · tú · él/ud · nosotros · vosotros · ellos（点击行可对照超级矩阵验证）</p>
    </div>

    <!-- ============ 词干变化 ============ -->
    <div v-else-if="tab === 'stem'" class="card-table">
      <table>
        <thead>
          <tr><th>变化</th><th>代表动词</th><th>作用时态</th><th>例外 / 提示</th></tr>
        </thead>
        <tbody>
          <tr v-for="s in STEM" :key="s.change">
            <th class="mono">{{ s.change }}</th>
            <td class="ex">{{ s.verbs }}</td>
            <td>{{ s.tense }}</td>
            <td class="ex muted">{{ s.exempt }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ============ 拼写变体 ============ -->
    <div v-else>
      <p class="intro">拼写变体不是不规则——只是为了<b>保住发音</b>的正字法调整。超级矩阵里用黄色标出的就是它们。</p>
      <div class="card-table">
        <table>
          <thead>
            <tr><th>规则</th><th>触发条件</th><th>例子</th><th>目的</th></tr>
          </thead>
          <tbody>
            <tr v-for="s in SPELL" :key="s.rule">
              <th class="mono">{{ s.rule }}</th>
              <td>{{ s.when }}</td>
              <td class="mono">{{ s.ex }}</td>
              <td class="muted">{{ s.note }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ref { display: flex; flex-direction: column; gap: var(--space-md); }

.mode-tabs { display: flex; border-bottom: 1px solid var(--color-border); }
.mode-tabs button {
  padding: var(--space-sm) var(--space-md); font-size: var(--fs-sub-body);
  background: transparent; border: 0; border-bottom: 2px solid transparent;
  color: var(--color-text-muted); cursor: pointer; margin-bottom: -1px; min-height: var(--btn-height);
}
.mode-tabs button.active { color: var(--color-brand); border-bottom-color: var(--color-brand); font-weight: 600; }

.group { margin-bottom: var(--space-lg); }
.g-label { font-size: var(--fs-sub-body); font-weight: 700; color: var(--color-text-muted); margin-bottom: var(--space-xs); }

.card-table { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--card-radius); overflow: hidden; }
table { width: 100%; border-collapse: collapse; }
th, td {
  border-bottom: 1px solid var(--table-border);
  padding: var(--space-sm) var(--space-md);
  text-align: left; font-size: var(--fs-sub-body); vertical-align: top;
}
thead th { background: var(--table-head-bg); color: var(--table-head-fg); font-size: var(--fs-caption); }
tbody th { white-space: nowrap; }
tbody th small { display: block; font-weight: 400; color: var(--color-text-muted); font-size: var(--fs-caption); margin-top: 2px; }
td .f {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: var(--fs-caption);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 1px 6px;
  margin: 1px 3px 1px 0;
}
td .f.stem { color: var(--color-brand); border-color: var(--color-brand); font-weight: 700; }
.mono { font-family: var(--font-mono); font-weight: 700; }
.ex { font-size: var(--fs-caption); line-height: 1.6; }
.muted { color: var(--color-text-muted); font-size: var(--fs-caption); }
.foot-note, .intro { font-size: var(--fs-caption); color: var(--color-text-muted); margin: 0; }
.intro b { color: var(--color-brand); }
</style>
