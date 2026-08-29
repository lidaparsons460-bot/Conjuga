<script setup>
/**
 * 首页：今日复习指挥台
 * 到期队列 → 一键去练；统计概览；最近录入。
 */
import { computed } from 'vue'
import { useLibrary } from '../composables/useLibrary'
import { useMistakes } from '../composables/useMistakes'
import { TENSE_GROUPS } from '../composables/useVerbs'

const { state } = useLibrary()
const { state: mistakesState, dueList } = useMistakes()

const DAY = 24 * 60 * 60 * 1000

const due = computed(() => dueList())
const upcoming = computed(() =>
  mistakesState.mistakes.filter(m => !m.graduated && m.dueAt > Date.now()).sort((a, b) => a.dueAt - b.dueAt)
)
const graduatedCount = computed(() => mistakesState.mistakes.filter(m => m.graduated).length)
const activeCount = computed(() => mistakesState.mistakes.filter(m => !m.graduated).length)
const totalWrongCount = computed(() =>
  mistakesState.mistakes.reduce((s, m) => s + m.wrongCount, 0)
)

const tenseLabel = m =>
  TENSE_GROUPS[m.mood]?.find(t => t.key === m.tense)?.label ?? `${m.mood}.${m.tense}`

function dueText(ts) {
  const d = Math.ceil((ts - Date.now()) / DAY)
  if (d <= 0) return '已到期'
  if (d === 1) return '明天'
  return `${d} 天后`
}

const recentVerbs = computed(() =>
  [...state.verbs].sort((a, b) => b.createdAt - a.createdAt).slice(0, 8)
)

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '夜深了，注意休息'
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
})
</script>

<template>
  <div class="dash">
    <div class="hello">
      <h3>{{ greeting }}</h3>
      <p>已收录 {{ state.verbs.length }} 个动词 · {{ state.tags.length }} 个标签 · {{ activeCount }} 张待复习错题</p>
    </div>

    <!-- 今日复习主卡 -->
    <div class="hero" :class="{ urgent: due.length > 0 }">
      <template v-if="due.length > 0">
        <p class="hero-num">{{ due.length }}</p>
        <p class="hero-label">张错题卡到期，该复习了</p>
        <router-link to="/practice" class="btn lg">立即开始复习 →</router-link>
      </template>
      <template v-else-if="activeCount > 0">
        <p class="hero-num">✓</p>
        <p class="hero-label">今日无到期错题{{ upcoming.length ? `（下一批 ${dueText(upcoming[0].dueAt)}）` : '' }}</p>
        <router-link to="/practice" class="btn lg ghost">自由练习 →</router-link>
      </template>
      <template v-else>
        <p class="hero-num">∅</p>
        <p class="hero-label">还没有需要复习的错题<br />可以先自由练习，答错的会自动安排复习</p>
        <router-link to="/practice" class="btn lg ghost">自由练习 →</router-link>
      </template>
    </div>

    <!-- 统计卡 -->
    <div class="stats">
      <div class="stat">
        <b>{{ state.verbs.length }}</b>
        <span>动词</span>
      </div>
      <div class="stat">
        <b>{{ activeCount }}</b>
        <span>活跃错题</span>
      </div>
      <div class="stat">
        <b>{{ graduatedCount }}</b>
        <span>已毕业 🎓</span>
      </div>
      <div class="stat">
        <b>{{ totalWrongCount }}</b>
        <span>累计答错</span>
      </div>
    </div>

    <div class="cols">
      <!-- 到期队列预览 -->
      <div v-if="due.length" class="panel">
        <div class="panel-head">今日到期（前 8）</div>
        <div v-for="m in due.slice(0, 8)" :key="m.key" class="due-row">
          <span class="v">{{ m.infinitivo }}</span>
          <span class="t">{{ tenseLabel(m) }}</span>
          <span class="s">连对 {{ m.streak }}/3</span>
        </div>
        <router-link v-if="due.length > 8" to="/mistakes" class="more">查看全部 {{ due.length }} 张 →</router-link>
      </div>

      <!-- 最近录入 -->
      <div class="panel">
        <div class="panel-head">最近录入</div>
        <div v-if="recentVerbs.length">
          <div v-for="v in recentVerbs" :key="v.id" class="due-row">
            <span class="v">{{ v.infinitive }}</span>
            <span class="t">{{ v.tags.length }} 标签</span>
          </div>
        </div>
        <p v-else class="empty-line">还没录入动词 → <router-link to="/library">去动词库</router-link></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dash { max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--space-lg); }

.hello h3 { margin: 0 0 var(--space-xs); font-size: var(--fs-h3); }
.hello p { margin: 0; color: var(--color-text-muted); font-size: var(--fs-sub-body); }

.hero {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--card-radius);
  padding: var(--space-lg);
  text-align: center;
}
.hero.urgent { border-color: var(--color-brand); background: var(--color-brand-strong); }
.hero-num { margin: 0; font-size: var(--fs-h1); font-weight: 800; color: var(--color-brand); line-height: 1.1; }
.hero-label { margin: var(--space-xs) 0 var(--space-md); color: var(--color-text-muted); }

.stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-md); }
.stat {
  background: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--card-radius);
  padding: var(--space-md); text-align: center;
}
.stat b { display: block; font-size: var(--fs-h2); color: var(--color-brand); }
.stat span { font-size: var(--fs-caption); color: var(--color-text-muted); }

.cols { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }
.panel {
  background: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--card-radius);
  padding: var(--space-md);
}
.panel-head { font-weight: 700; margin-bottom: var(--space-sm); }
.due-row {
  display: flex; align-items: baseline; gap: var(--space-sm);
  padding: var(--space-xs) 0; border-bottom: 1px dashed var(--color-border);
  font-size: var(--fs-sub-body);
}
.due-row:last-of-type { border-bottom: 0; }
.due-row .v { font-family: var(--font-mono); font-weight: 700; min-width: 90px; }
.due-row .t { color: var(--color-text-muted); flex: 1; }
.due-row .s { font-size: var(--fs-caption); color: var(--color-text-muted); white-space: nowrap; }
.more { display: block; text-align: center; margin-top: var(--space-sm); font-size: var(--fs-caption); color: var(--color-brand); }
.empty-line { color: var(--color-text-muted); font-size: var(--fs-sub-body); }
.empty-line a { color: var(--color-brand); }

.btn {
  display: inline-block; border: 0; background: var(--btn-primary-bg); color: var(--btn-primary-fg);
  border-radius: var(--btn-radius); min-height: var(--btn-height-lg); padding: 0 var(--space-lg);
  font-size: var(--fs-sub-body); font-weight: 600; cursor: pointer; text-decoration: none; line-height: var(--btn-height-lg);
}
.btn.lg { padding: 0 var(--space-xl); font-size: var(--fs-body); }
.btn.ghost { background: var(--btn-secondary-bg); color: var(--btn-secondary-fg); border: 1px solid var(--color-border); }

@media (max-width: 700px) {
  .stats { grid-template-columns: repeat(2, 1fr); }
  .cols { grid-template-columns: 1fr; }
}
</style>
