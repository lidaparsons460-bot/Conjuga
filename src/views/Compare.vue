<script setup>
/**
 * 对比中心 Compare：三模式 Tab
 *   Tab1 ⇆ 横向对比（同时态 × 多动词 → 广度找共性）
 *   Tab2 ⇅ 纵向对比（同动词 × 全时态 → 深度看性格）
 *   Tab3 ⧉ 超级矩阵（全动词 × 全时态 Excel 冻结表 → 立体找规律）
 */
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import MegaMatrix from '../components/MegaMatrix.vue'
import { useLibrary } from '../composables/useLibrary'
import { classifyTense } from '../composables/useIrregularRules'
import { TENSE_GROUPS } from '../composables/useVerbs'

const route = useRoute()
const { state, verbsByTag } = useLibrary()
const mode = ref('mega') // 默认进超级矩阵（用户刚需）

/* 笔记关联动词跳转：
 *   ?verb=empezar          → 单只，预填搜索框
 *   ?verbs=empezar,buscar  → 整组，矩阵只显示这一组（组模式） */
const megaInitSearch = computed(() => String(route.query.verb ?? ''))
const megaInitVerbs = computed(() =>
  String(route.query.verbs ?? '')
    .split(',')
    .map(v => v.trim())
    .filter(Boolean)
)

const hasVerbs = computed(() => state.verbs.length > 0)

/* ================= Tab1 横向对比 ================= */
const H_TENSES = [
  ['indicativo', 'presente'], ['indicativo', 'preterito'], ['indicativo', 'imperfecto'],
  ['indicativo', 'futuro'], ['indicativo', 'condicional'],
  ['subjuntivo', 'presente'], ['subjuntivo', 'imperfecto'],
  ['imperativo', 'afirmativo'],
].map(([mood, key]) => ({
  mood, key,
  label: `${TENSE_GROUPS[mood].find(t => t.key === key)?.label ?? key}（${mood.slice(0, 4)}.）`,
}))

const hTag = ref(null)
const hTense = ref('indicativo.presente')
const hTenseParts = computed(() => {
  const [mood, key] = hTense.value.split('.')
  return { mood, key }
})
const hVerbs = computed(() => verbsByTag(hTag.value))
const hRows = computed(() =>
  hVerbs.value.map(v => ({
    verb: v,
    cell: classifyTense(v.infinitive, hTenseParts.value.mood, hTenseParts.value.key),
  }))
)

/* ================= Tab2 纵向对比 ================= */
const vInf = ref('')
// 有动词库时默认选第一只
const vSelected = computed(() => vInf.value || state.verbs[0]?.infinitive || '')

const vGroups = [
  { label: 'Indicativo · 简单时态', mood: 'indicativo', tenses: TENSE_GROUPS.indicativo.filter(t => !t.key.includes('Perfecto') && t.key !== 'preteritoAnterior') },
  { label: 'Subjuntivo · 简单时态', mood: 'subjuntivo', tenses: TENSE_GROUPS.subjuntivo },
  { label: 'Imperativo', mood: 'imperativo', tenses: TENSE_GROUPS.imperativo },
  { label: 'Indicativo · 完成时态', mood: 'indicativo', tenses: TENSE_GROUPS.indicativo.filter(t => t.key.includes('Perfecto') || t.key === 'preteritoAnterior') },
]
const vRows = computed(() =>
  !vSelected.value ? []
    : vGroups.map(g => ({
        ...g,
        rows: g.tenses.map(t => ({ tense: t, cell: classifyTense(vSelected.value, g.mood, t.key) })),
      }))
)
</script>

<template>
  <div class="compare">
    <!-- 三模式 Tab -->
    <div class="mode-tabs">
      <button :class="{ active: mode === 'h' }" @click="mode = 'h'">⇆ 横向对比（同时态多动词）</button>
      <button :class="{ active: mode === 'v' }" @click="mode = 'v'">⇅ 纵向对比（同动词全时态）</button>
      <button :class="{ active: mode === 'mega' }" @click="mode = 'mega'">⧉ 超级矩阵（全动词×全时态）</button>
    </div>

    <!-- 空库引导（三个 Tab 共用） -->
    <div v-if="!hasVerbs" class="empty">
      <p>对比中心需要先有动词数据。<br />去「动词库」录入或批量导入动词后再回来。</p>
      <router-link to="/library" class="btn">→ 去动词库</router-link>
    </div>

    <!-- ============ Tab1 横向对比 ============ -->
    <div v-else-if="mode === 'h'" class="pane">
      <div class="toolbar">
        <div class="chips">
          <button class="chip" :class="{ on: hTag === null }" @click="hTag = null">全部（{{ state.verbs.length }}）</button>
          <button
            v-for="tag in state.tags"
            :key="tag.id"
            class="chip"
            :class="{ on: hTag === tag.id }"
            @click="hTag = tag.id"
          >{{ tag.name }}（{{ verbsByTag(tag.id).length }}）</button>
        </div>
        <select v-model="hTense">
          <option v-for="t in H_TENSES" :key="t.mood + '.' + t.key" :value="t.mood + '.' + t.key">{{ t.label }}</option>
        </select>
      </div>

      <div class="card-table">
        <table>
          <thead>
            <tr>
              <th>动词</th>
              <th>yo</th><th>tú</th><th>él/ud</th><th>nos.</th><th>vos.</th><th>ellos</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in hRows" :key="row.verb.id">
              <th>{{ row.verb.infinitive }}</th>
              <template v-if="row.cell">
                <td v-for="p in row.cell.persons" :key="p.key" :class="p.cls">{{ p.form ?? '—' }}</td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="legend">
        <span class="l-irreg">不规则</span><span class="l-spell">拼写变体</span><span>规则（无底色）</span>
      </div>
    </div>

    <!-- ============ Tab2 纵向对比 ============ -->
    <div v-else-if="mode === 'v'" class="pane">
      <div class="toolbar">
        <span class="toolbar-label">选动词：</span>
        <select v-model="vInf">
          <option value="">（默认第一只）</option>
          <option v-for="v in state.verbs" :key="v.id" :value="v.infinitive">{{ v.infinitive }}</option>
        </select>
        <span v-if="vSelected" class="verb-title">{{ vSelected }} 全时态变位</span>
      </div>

      <div v-if="vSelected">
        <div v-for="group in vRows" :key="group.label" class="tense-group">
          <div class="group-label">{{ group.label }}</div>
          <div class="card-table">
            <table>
              <thead>
                <tr>
                  <th>时态</th>
                  <th>yo</th><th>tú</th><th>él/ud</th><th>nos.</th><th>vos.</th><th>ellos</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in group.rows" :key="row.tense.key">
                  <th>{{ row.tense.label }}</th>
                  <template v-if="row.cell">
                    <td v-for="p in row.cell.persons" :key="p.key" :class="p.cls">{{ p.form ?? '—' }}</td>
                  </template>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- ============ Tab3 超级矩阵 ============ -->
    <div v-else class="pane mega-pane">
      <MegaMatrix :init-search="megaInitSearch" :init-verbs="megaInitVerbs" />
    </div>
  </div>
</template>

<style scoped>
.compare { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: var(--space-md); }

.mode-tabs { display: flex; border-bottom: 1px solid var(--color-border); flex-shrink: 0; }
.mode-tabs button {
  padding: var(--space-sm) var(--space-md);
  font-size: var(--fs-sub-body);
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  margin-bottom: -1px;
  min-height: var(--btn-height);
}
.mode-tabs button.active {
  color: var(--color-brand);
  border-bottom-color: var(--color-brand);
  font-weight: 600;
}

.pane { display: flex; flex-direction: column; gap: var(--space-md); }
/* 超级矩阵 pane：吃满剩余高度，表格内部滚动 */
.pane.mega-pane { flex: 1; min-height: 0; }

.toolbar { display: flex; align-items: center; gap: var(--space-sm); flex-wrap: wrap; }
.toolbar-label { font-size: var(--fs-sub-body); color: var(--color-text-muted); }
.verb-title { font-family: var(--font-mono); font-weight: 700; margin-left: var(--space-md); }

.chips { display: flex; gap: var(--space-xs); flex-wrap: wrap; }
.chip {
  border: 1px solid var(--chip-border); background: var(--chip-bg); color: var(--chip-fg);
  border-radius: var(--radius-pill); font-size: var(--fs-caption);
  min-height: 30px; padding: 2px 12px; cursor: pointer;
}
.chip.on { background: var(--chip-active-bg); color: var(--chip-active-fg); border-color: var(--chip-active-bg); font-weight: 600; }

/* ===== 矩阵表格（Tab1 / Tab2 共用） ===== */
.card-table { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--card-radius); overflow: hidden; }
table { width: 100%; border-collapse: collapse; }
th, td {
  border-bottom: 1px solid var(--table-border);
  padding: var(--space-sm) var(--space-md);
  text-align: left;
  font-size: var(--fs-sub-body);
}
thead th { background: var(--table-head-bg); color: var(--table-head-fg); font-size: var(--fs-caption); font-weight: 700; }
tbody th { font-family: var(--font-mono); font-weight: 700; white-space: nowrap; }
tbody td { font-family: var(--font-mono); }
tbody tr:hover { background: var(--color-brand-strong); }
tbody td.irreg { background: var(--mega-irreg-bg); color: var(--mega-irreg-fg); font-weight: 700; }
tbody td.spell { background: var(--mega-spell-bg); color: var(--mega-spell-fg); font-weight: 700; }

.tense-group { margin-bottom: var(--space-lg); }
.group-label { font-size: var(--fs-sub-body); font-weight: 700; color: var(--color-text-muted); margin-bottom: var(--space-xs); }

.legend { display: flex; gap: var(--space-md); font-size: var(--fs-caption); color: var(--color-text-muted); }
.legend span::before {
  content: ''; display: inline-block; width: 12px; height: 12px;
  border-radius: var(--radius-sm); margin-right: 5px; vertical-align: middle;
}
.l-irreg::before { background: var(--mega-irreg-bg); box-shadow: inset 0 0 0 1px var(--mega-irreg-fg); }
.l-spell::before { background: var(--mega-spell-bg); box-shadow: inset 0 0 0 1px var(--mega-spell-fg); }

.empty { text-align: center; padding: var(--space-xl); color: var(--color-text-muted); line-height: 2; }
.btn {
  display: inline-block;
  border: 0; background: var(--btn-primary-bg); color: var(--btn-primary-fg);
  border-radius: var(--btn-radius); min-height: var(--btn-height); padding: 0 var(--space-lg);
  font-size: var(--fs-sub-body); font-weight: 600; cursor: pointer; text-decoration: none; line-height: var(--btn-height);
}
</style>
