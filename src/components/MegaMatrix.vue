<script setup>
/**
 * 超级矩阵 MegaMatrix（用户核心刚需）
 * Excel 式冻结窗格：左列动词原形 + 顶行时态标题固定，变位区横纵滚动。
 *
 * 【P0 红线】单 <table> + position: sticky 方案。
 * 严禁拆 header 表 + body 表双表同步列宽 —— 100% 列宽错位（Experience ID 803642 教训）。
 * 列宽由 colgroup + table-layout:fixed 驱动，绝不手抠滚动条像素。
 */
import { ref, computed, watch } from 'vue'
import { useLibrary } from '../composables/useLibrary'
import { classifyTense } from '../composables/useIrregularRules'
import { TENSE_GROUPS, isIrregular } from '../composables/useVerbs'

const props = defineProps({
  /** 跳转预填：笔记关联动词 chip 传来的动词原形 */
  initSearch: { type: String, default: '' },
  /** 跳转预筛：笔记整组关联动词（非空时矩阵只显示这一组） */
  initVerbs: { type: Array, default: () => [] },
})

const { state, verbsByTag } = useLibrary()

/* ---------- 时态组 ---------- */
const TENSE_SETS = {
  core3: [
    ['indicativo', 'presente'], ['indicativo', 'preterito'], ['indicativo', 'imperfecto'],
  ],
  ind5: [
    ['indicativo', 'presente'], ['indicativo', 'preterito'], ['indicativo', 'imperfecto'],
    ['indicativo', 'futuro'], ['indicativo', 'condicional'],
  ],
  subj: [
    ['subjuntivo', 'presente'], ['subjuntivo', 'imperfecto'], ['subjuntivo', 'imperfectoAlt'],
  ],
  all: [
    ['indicativo', 'presente'], ['indicativo', 'preterito'], ['indicativo', 'imperfecto'],
    ['indicativo', 'futuro'], ['indicativo', 'condicional'],
    ['subjuntivo', 'presente'], ['subjuntivo', 'imperfecto'], ['subjuntivo', 'imperfectoAlt'], ['subjuntivo', 'futuro'],
    ['imperativo', 'afirmativo'], ['imperativo', 'negativo'],
    ['indicativo', 'presentePerfecto'], ['indicativo', 'pluscuamperfecto'],
    ['indicativo', 'futuroPerfecto'], ['indicativo', 'condicionalPerfecto'],
    ['subjuntivo', 'presentePerfecto'], ['subjuntivo', 'pluscuamperfecto'],
  ],
}
const TENSE_SET_OPTIONS = [
  { key: 'core3', label: '核心 3 时态' },
  { key: 'ind5', label: 'Indicativo 5 时态' },
  { key: 'subj', label: '仅虚拟式' },
  { key: 'all', label: '所有 17 时态' },
]
const MOOD_LABEL = { indicativo: 'Indicativo', subjuntivo: 'Subjuntivo', imperativo: 'Imperativo' }

const tenseSet = ref('ind5')
const cols = computed(() =>
  TENSE_SETS[tenseSet.value].map(([mood, key]) => ({
    mood, key,
    label: TENSE_GROUPS[mood].find(t => t.key === key)?.label ?? key,
  }))
)

/* ---------- 工具条筛选 ---------- */
const search = ref(props.initSearch)
// 父组件传入的预填变化时同步（如已在 /compare 页时再点笔记 chip）
watch(() => props.initSearch, v => { search.value = v })
const selectedTag = ref(null)
const visibleCount = ref(20)

/** 整组预筛激活时（从笔记跳转），单只动词的搜索框不再叠加过滤，避免两组条件打架 */
const groupMode = computed(() => props.initVerbs.length > 0)

/** 预筛组里不在动词库中的动词（提示用户去录入） */
const missingInGroup = computed(() => {
  if (!groupMode.value) return []
  return props.initVerbs.filter(v => !state.verbs.some(x => x.infinitive === v))
})

const filtered = computed(() => {
  if (groupMode.value) {
    // 整组预筛：只显示这组动词（保持笔记里的书写顺序）
    return props.initVerbs
      .map(v => state.verbs.find(x => x.infinitive === v))
      .filter(Boolean)
  }
  let list = verbsByTag(selectedTag.value)
  const q = search.value.trim().toLowerCase()
  if (q) list = list.filter(v => v.infinitive.includes(q))
  return list
})
const visible = computed(() => filtered.value.slice(0, visibleCount.value))

/* ---------- 行×列数据（预计算分类） ---------- */
const rows = computed(() =>
  visible.value.map(v => ({
    verb: v,
    cells: cols.value.map(c => classifyTense(v.infinitive, c.mood, c.key)),
  }))
)

/* ---------- 表格宽度（table-layout:fixed 由列宽决定总宽） ---------- */
const COL_VERB = 110
const COL_TENSE = 150
const tableWidth = computed(() => COL_VERB + cols.value.length * COL_TENSE)
const colWidth = w => ({ width: `${w}px` })

function loadMore() {
  visibleCount.value += 30
}
</script>

<template>
  <div class="mega">
    <!-- 组预筛提示条（从笔记跳转带入） -->
    <div v-if="groupMode" class="group-banner">
      <span>📌 笔记关联组（{{ filtered.length }} 个在库中）</span>
      <span v-if="missingInGroup.length" class="miss">
        不在库中，无法显示：{{ missingInGroup.join(' · ') }}
        <router-link to="/library" class="miss-link">去录入 →</router-link>
      </span>
      <router-link to="/compare" class="clear-group">✕ 退出组模式</router-link>
    </div>

    <!-- 工具条 -->
    <div v-else class="toolbar">
      <input v-model="search" class="search" placeholder="🔍 搜动词原形（如 tener / -car）" />
      <div class="chips">
        <button class="chip" :class="{ on: selectedTag === null }" @click="selectedTag = null">全部（{{ state.verbs.length }}）</button>
        <button
          v-for="tag in state.tags"
          :key="tag.id"
          class="chip"
          :class="{ on: selectedTag === tag.id }"
          @click="selectedTag = tag.id"
        >{{ tag.name }}（{{ verbsByTag(tag.id).length }}）</button>
      </div>
      <select v-model="tenseSet">
        <option v-for="o in TENSE_SET_OPTIONS" :key="o.key" :value="o.key">{{ o.label }}</option>
      </select>
      <span class="count">当前 {{ visible.length }}/{{ filtered.length }} 词 × {{ cols.length }} 时态</span>
    </div>

    <!-- 空库引导 -->
    <div v-if="state.verbs.length === 0" class="empty">
      <p>动词库是空的，超级矩阵没数据可显示。<br />先去「动词库」录入或批量导入动词。</p>
      <router-link to="/library" class="btn">→ 去动词库</router-link>
    </div>

    <!-- Excel 冻结单表 -->
    <div v-else class="mega-wrap">
      <table class="mega-matrix" :style="{ width: tableWidth + 'px' }">
        <colgroup>
          <col :style="colWidth(COL_VERB)" />
          <col v-for="c in cols" :key="c.mood + c.key" :style="colWidth(COL_TENSE)" />
        </colgroup>
        <thead>
          <tr>
            <th class="corner">
              <b>动词 ↓ × 时态 →</b>
              <small>冻结窗格 · 横纵滚动</small>
            </th>
            <th v-for="c in cols" :key="c.mood + c.key" class="tense">
              {{ c.label }}
              <small>{{ MOOD_LABEL[c.mood] }}</small>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.verb.id">
            <th class="verb">
              {{ row.verb.infinitive }}
              <small v-if="isIrregular(row.verb.infinitive)" class="irr">不规则</small>
            </th>
            <td v-for="(cell, ci) in row.cells" :key="ci">
              <div v-if="cell" class="per-6">
                <div
                  v-for="p in cell.persons"
                  :key="p.key"
                  class="per-cell"
                  :class="p.cls"
                >
                  <span class="pname">{{ p.key }}</span>
                  <span class="pform">{{ p.form ?? '—' }}</span>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 图例 + 加载更多 -->
    <div class="legend">
      <span class="l-irreg">不规则（换词根/词干）</span>
      <span class="l-spell">拼写变体（c→qu · g→gu · z→c）</span>
      <span class="l-norm">规则</span>
    </div>

    <div v-if="filtered.length > visible.length" class="load-more">
      <button class="btn" @click="loadMore">
        ➕ 加载下 30 只（当前 {{ visible.length }} / {{ filtered.length }}）
      </button>
    </div>
  </div>
</template>

<style scoped>
.mega { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: var(--space-md); }

/* ===== 工具条 ===== */
.toolbar { display: flex; align-items: center; gap: var(--space-sm); flex-wrap: wrap; flex-shrink: 0; }

/* 组预筛提示条 */
.group-banner {
  display: flex; align-items: center; gap: var(--space-md); flex-wrap: wrap;
  background: var(--color-brand-strong);
  border: 1px solid var(--color-brand);
  border-radius: var(--radius);
  padding: var(--space-sm) var(--space-md);
  font-size: var(--fs-sub-body);
  flex-shrink: 0;
}
.group-banner .miss { font-size: var(--fs-caption); color: var(--color-text-muted); }
.group-banner .miss-link { color: var(--color-brand); margin-left: var(--space-xs); }
.group-banner .clear-group { margin-left: auto; color: var(--color-text-muted); text-decoration: none; }
.group-banner .clear-group:hover { color: var(--color-brand); }
.toolbar .search { width: 220px; }
.toolbar select { max-width: 180px; }
.chips { display: flex; gap: var(--space-xs); flex-wrap: wrap; }
.chip {
  border: 1px solid var(--chip-border); background: var(--chip-bg); color: var(--chip-fg);
  border-radius: var(--radius-pill); font-size: var(--fs-caption);
  min-height: 30px; padding: 2px 12px; cursor: pointer;
}
.chip.on { background: var(--chip-active-bg); color: var(--chip-active-fg); border-color: var(--chip-active-bg); font-weight: 600; }
.count { margin-left: auto; font-size: var(--fs-caption); color: var(--color-text-muted); white-space: nowrap; }

/* ===== Excel 冻结单表（P0 红线：绝不拆双表） ===== */
.mega-wrap {
  flex: 1;              /* 吃满 pane 剩余高度（自适应屏幕，替代写死 540px） */
  min-height: 200px;    /* 极矮窗口保底，避免表格被压没 */
  overflow: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}
.mega-matrix {
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed; /* 列宽完全由 colgroup 驱动，杜绝错位 */
}
.mega-matrix th, .mega-matrix td {
  border-right: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  padding: 0;
  background: var(--color-surface);
  overflow: hidden;
}
/* 顶行时态：冻结 */
.mega-matrix thead th.tense {
  position: sticky;
  top: 0;
  z-index: var(--mega-head-z);
  background: var(--mega-head-bg);
  color: var(--color-brand);
  font-weight: 700;
  font-size: var(--mega-tense-fs);
  padding: var(--space-sm) 6px var(--space-xs);
  line-height: 1.25;
  text-align: center;
}
.mega-matrix thead th.tense small {
  display: block;
  font-size: var(--fs-caption);
  font-weight: 500;
  color: var(--color-text-muted);
  margin-top: 2px;
}
/* 左上角交叉：双冻结，z-index 最高 */
.mega-matrix thead th.corner {
  position: sticky;
  top: 0;
  left: 0;
  z-index: var(--mega-corner-z);
  background: var(--mega-corner-bg);
  padding: var(--space-sm);
  text-align: left;
}
.mega-matrix thead th.corner b {
  display: block;
  font-size: var(--mega-tense-fs);
  color: var(--color-brand);
}
.mega-matrix thead th.corner small {
  font-size: var(--fs-caption);
  color: var(--color-text-muted);
}
/* 左列动词：冻结 */
.mega-matrix tbody th.verb {
  position: sticky;
  left: 0;
  z-index: var(--mega-col-z);
  background: var(--color-surface);
  padding: var(--space-xs) var(--space-sm);
  text-align: left;
  font-family: var(--font-mono);
  font-size: var(--mega-verb-fs);
  font-weight: 700;
}
.mega-matrix tbody th.verb small {
  display: block;
  font-family: var(--font-sans);
  font-size: var(--fs-caption);
  font-weight: 500;
  color: var(--color-text-muted);
}
.mega-matrix tbody th.verb small.irr { color: var(--color-brand); }
/* Hover 整行高亮（找规律交互） */
.mega-wrap table tbody tr:hover td,
.mega-wrap table tbody tr:hover th.verb { background: var(--mega-row-hover); }

/* ===== 单元格内部 6 人称 ===== */
.per-6 { display: grid; grid-template-rows: repeat(6, 1fr); }
.per-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-xs);
  font-family: var(--font-mono);
  font-size: var(--mega-cell-fs);
  padding: 3px 6px;
  border-top: 1px dashed rgba(0, 0, 0, .06);
}
.per-cell:first-child { border-top: 0; }
.per-cell .pname {
  font-family: var(--font-sans);
  font-size: var(--mega-person-fs);
  color: var(--color-text-muted);
  font-weight: 500;
}
.per-cell .pform { font-weight: 600; text-align: right; }
.per-cell.irreg { background: var(--mega-irreg-bg); }
.per-cell.irreg .pform { color: var(--mega-irreg-fg); }
.per-cell.spell { background: var(--mega-spell-bg); }
.per-cell.spell .pform { color: var(--mega-spell-fg); }

/* ===== 图例 / 加载更多 / 空态 ===== */
.legend { display: flex; gap: var(--space-md); flex-wrap: wrap; font-size: var(--fs-caption); color: var(--color-text-muted); flex-shrink: 0; }
.legend span::before {
  content: '';
  display: inline-block;
  width: 12px; height: 12px;
  border-radius: var(--radius-sm);
  margin-right: 5px;
  vertical-align: middle;
}
.l-irreg::before { background: var(--mega-irreg-bg); box-shadow: inset 0 0 0 1px var(--mega-irreg-fg); }
.l-spell::before { background: var(--mega-spell-bg); box-shadow: inset 0 0 0 1px var(--mega-spell-fg); }
.l-norm::before { background: var(--color-surface); border: 1px solid var(--color-border); }

.load-more { display: flex; justify-content: center; flex-shrink: 0; }
.btn {
  display: inline-block;
  border: 0;
  background: var(--btn-primary-bg);
  color: var(--btn-primary-fg);
  border-radius: var(--btn-radius);
  min-height: var(--btn-height);
  padding: 0 var(--space-lg);
  font-size: var(--fs-sub-body);
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  line-height: var(--btn-height);
}

.empty { text-align: center; padding: var(--space-xl); color: var(--color-text-muted); line-height: 2; }
</style>
