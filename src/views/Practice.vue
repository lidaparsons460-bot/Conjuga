<script setup>
/**
 * 练习页：抽题 → 输入 → 精确比对（重音敏感）→ 错题入库
 * 比对规则（表现层手册红线）：
 *   - 全等 → 对
 *   - 忽略重音/大小写后等 → 对（带"重音提醒"提示，西语重音不算硬错但要点名）
 *   - 其他 → 错，正确答案 + 红色标出差异位置
 */
import { ref, computed, onMounted } from 'vue'
import { useLibrary } from '../composables/useLibrary'
import { useMistakes } from '../composables/useMistakes'
import { usePractice } from '../composables/usePractice'

const { state, verbsByTag } = useLibrary()
const { recordWrong, recordRight, isActive, dueList } = useMistakes()
const { draw } = usePractice()

const mode = ref('all') // all=全库随机 / due=优先错题到期
const tagId = ref(null)
const question = ref(null)
const input = ref('')
const result = ref(null) // { ok, accentWarn, diffPos }
const stats = ref({ right: 0, wrong: 0 })

const dueCount = computed(() => dueList().length)

/** tagId → 标签名（诊断文案用） */
const tagChips = computed(() =>
  Object.fromEntries(state.tags.map(t => [t.id, t.name]))
)

function next() {
  input.value = ''
  result.value = null
  question.value = draw(tagId.value, mode.value === 'due')
}

onMounted(next)

/** 忽略重音 + 大小写的归一化（á→a é→e í→i ó→o ú→u ü→u） */
const deaccent = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

function submit() {
  if (!question.value || result.value || !input.value.trim()) return
  const q = question.value
  const ans = input.value.trim()
  if (ans === q.answer) {
    result.value = { ok: true, accentWarn: false }
    stats.value.right++
    if (isActive(q.infinitivo, q.mood, q.tense)) recordRight(q.infinitivo, q.mood, q.tense)
  } else if (deaccent(ans) === deaccent(q.answer)) {
    result.value = { ok: true, accentWarn: true }
    stats.value.right++
    if (isActive(q.infinitivo, q.mood, q.tense)) recordRight(q.infinitivo, q.mood, q.tense)
  } else {
    result.value = { ok: false, diffPos: firstDiff(ans, q.answer) }
    stats.value.wrong++
    recordWrong(q.infinitivo, q.mood, q.tense)
  }
}

function firstDiff(a, b) {
  const n = Math.min(a.length, b.length)
  for (let i = 0; i < n; i++) if (a[i] !== b[i]) return i
  return n
}

/** 正确答案按差异位高亮（错后教学） */
const answerChars = computed(() => {
  if (!result.value || result.value.ok || !question.value) return []
  const d = result.value.diffPos
  return question.value.answer.split('').map((ch, i) => ({ ch, hot: i >= d }))
})

function onKey(e) {
  if (e.key === 'Enter') {
    result.value ? next() : submit()
  }
}
</script>

<template>
  <div class="practice">
    <!-- 顶部控制条 -->
    <div class="controls">
      <div class="mode-chips">
        <button class="chip" :class="{ on: mode === 'all' }" @click="mode = 'all'; next()">随机抽题</button>
        <button class="chip" :class="{ on: mode === 'due' }" @click="mode = 'due'; next()">
          优先错题{{ dueCount ? `（${dueCount} 到期）` : '' }}
        </button>
      </div>
      <div class="chips">
        <button class="chip tag" :class="{ on: tagId === null }" @click="tagId = null; next()">全部（{{ state.verbs.length }}）</button>
        <button
          v-for="tag in state.tags"
          :key="tag.id"
          class="chip tag"
          :class="{ on: tagId === tag.id }"
          @click="tagId = tag.id; next()"
        >{{ tag.name }}（{{ verbsByTag(tag.id).length }}）</button>
      </div>
      <span class="stats">✓ {{ stats.right }} · ✕ {{ stats.wrong }}</span>
    </div>

    <!-- 空库引导 -->
    <div v-if="state.verbs.length === 0" class="empty">
      <p>没有动词可以练。<br />先去「动词库」录入动词。</p>
      <router-link to="/library" class="btn">→ 去动词库</router-link>
    </div>

    <!-- 答题卡 -->
    <div v-else-if="question" class="card">
      <p class="q-label">请变位 · {{ question.tenseLabel }}</p>
      <h3 class="q-verb">{{ question.infinitivo }}</h3>
      <p class="q-person">{{ question.personLabel }}</p>

      <div class="input-row">
        <input
          ref="inputEl"
          v-model="input"
          :disabled="!!result"
          placeholder="输入变位…（Enter 提交）"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          @keyup="onKey"
        />
        <button v-if="!result" class="btn" @click="submit">提交</button>
        <button v-else class="btn" @click="next">下一题 →</button>
      </div>

      <!-- 判定结果 -->
      <div v-if="result" class="verdict" :class="result.ok ? 'ok' : 'bad'">
        <template v-if="result.ok">
          <p v-if="!result.accentWarn">✓ 正确</p>
          <p v-else>✓ 基本正确，但重音符号有出入：你写「{{ input }}」，标准是「{{ question.answer }}」<br />
          <span class="hint">平时练习算你通过，不过书面考试中重音符号是要计分的，建议留意一下。</span></p>
        </template>
        <template v-else>
          <p>✕ 错误。正确答案：</p>
          <p class="answer">
            <span v-for="(c, i) in answerChars" :key="i" :class="{ hot: c.hot }">{{ c.ch }}</span>
          </p>
          <p class="wrong-echo">你写的是「{{ input }}」</p>
          <p class="tip">已录入错题集 · 明天到期重练</p>
        </template>
      </div>
    </div>

    <!-- 抽题失败：带真实诊断（不再误导性甩锅） -->
    <div v-else class="empty">
      <template v-if="verbsByTag(tagId).length === 0">
        <p>当前筛选「{{ tagId ? tagChips[tagId] ?? '标签' : '全部' }}」下没有动词。</p>
        <p class="hint">换一个标签，或去「动词库」录入。</p>
      </template>
      <template v-else>
        <p>以下动词暂时无法生成练习题：</p>
        <p class="hint">通常是拼写和词库不一致造成的（多打了一个字母、错拼了重音等）。<br />
        请到「动词库」核对拼写后重试：<br />
        <code>{{ verbsByTag(tagId).map(v => v.infinitive).join(' · ') }}</code></p>
      </template>
    </div>
  </div>
</template>

<style scoped>
.practice { max-width: 640px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--space-lg); }

.controls { display: flex; align-items: center; gap: var(--space-md); flex-wrap: wrap; }
.mode-chips, .chips { display: flex; gap: var(--space-xs); flex-wrap: wrap; }
.chip {
  border: 1px solid var(--chip-border); background: var(--chip-bg); color: var(--chip-fg);
  border-radius: var(--radius-pill); font-size: var(--fs-caption);
  min-height: 32px; padding: 2px 14px; cursor: pointer;
}
.chip.on { background: var(--chip-active-bg); color: var(--chip-active-fg); border-color: var(--chip-active-bg); font-weight: 600; }
.stats { margin-left: auto; font-size: var(--fs-sub-body); color: var(--color-text-muted); white-space: nowrap; }

.card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--card-radius);
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
.q-label { margin: 0; font-size: var(--fs-caption); color: var(--color-text-muted); }
.q-verb { margin: 0; font-family: var(--font-mono); font-size: var(--fs-h2); color: var(--color-brand); }
.q-person { margin: 0; font-size: var(--fs-subtitle); font-weight: 600; }

.input-row { display: flex; gap: var(--space-sm); margin-top: var(--space-sm); }
.input-row input {
  flex: 1;
  height: var(--input-person-height);
  font-family: var(--font-mono);
  font-size: var(--fs-h-small);
  border: 1px solid var(--input-border);
  border-radius: var(--radius);
  padding: 0 var(--space-md);
  background: var(--input-bg);
  color: var(--color-text);
}
.input-row input:focus { outline: none; border-color: var(--input-border-focus); box-shadow: var(--input-focus-ring); }
.input-row input:disabled { opacity: var(--op-disabled); }

.btn {
  border: 0; background: var(--btn-primary-bg); color: var(--btn-primary-fg);
  border-radius: var(--btn-radius); min-height: var(--btn-height-lg); padding: 0 var(--space-lg);
  font-size: var(--fs-sub-body); font-weight: 600; cursor: pointer; white-space: nowrap;
}

.verdict { border-radius: var(--radius); padding: var(--space-md); margin-top: var(--space-sm); }
.verdict p { margin: 0 0 var(--space-xs); }
.verdict.ok { background: rgba(52,199,89,.08); color: var(--color-ok); }
.verdict.bad { background: var(--mega-irreg-bg); color: var(--color-brand); }
.answer { font-family: var(--font-mono); font-size: var(--fs-h3); letter-spacing: 1px; }
.answer .hot { color: var(--color-brand); font-weight: 900; text-decoration: underline; }
.wrong-echo { font-family: var(--font-mono); color: var(--color-text-muted); }
.tip { font-size: var(--fs-caption); color: var(--color-text-muted); }

.empty { text-align: center; padding: var(--space-xl); color: var(--color-text-muted); line-height: 2; }
.empty .hint, .verdict .hint { font-size: var(--fs-caption); color: var(--color-text-muted); }
.empty code { font-family: var(--font-mono); background: var(--color-brand-strong); padding: 2px 6px; border-radius: var(--radius-sm); }
</style>
