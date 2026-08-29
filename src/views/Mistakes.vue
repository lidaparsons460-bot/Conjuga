<script setup>
/**
 * 错题集：两 Tab（复习队列 / 全部历史）
 * SM-2 简化调度：间隔 [1,2,4,7,15,30] 天 · 连对 3 次毕业
 */
import { ref, computed } from 'vue'
import { useMistakes } from '../composables/useMistakes'
import { TENSE_GROUPS } from '../composables/useVerbs'

const { state, reset, remove } = useMistakes()

const tab = ref('due') // due=复习队列 / all=全部历史

const DAY = 24 * 60 * 60 * 1000
const tenseLabel = m =>
  TENSE_GROUPS[m.mood]?.find(t => t.key === m.tense)?.label ?? `${m.mood}.${m.tense}`
const moodLabel = m => ({ indicativo: 'Ind.', subjuntivo: 'Subj.', imperativo: 'Imp.' }[m.mood] ?? m.mood)

const dueList = computed(() =>
  state.mistakes.filter(m => !m.graduated && m.dueAt <= Date.now()).sort((a, b) => a.dueAt - b.dueAt)
)
const upcoming = computed(() =>
  state.mistakes.filter(m => !m.graduated && m.dueAt > Date.now()).sort((a, b) => a.dueAt - b.dueAt)
)
const graduated = computed(() => state.mistakes.filter(m => m.graduated))

function dueText(ts) {
  const d = Math.ceil((ts - Date.now()) / DAY)
  if (d <= 0) return '已到期'
  if (d === 1) return '明天'
  return `${d} 天后`
}

const activeCount = computed(() => state.mistakes.filter(m => !m.graduated).length)
</script>

<template>
  <div class="mistakes">
    <div class="mode-tabs">
      <button :class="{ active: tab === 'due' }" @click="tab = 'due'">复习队列（{{ dueList.length }} 到期 / {{ activeCount }} 活跃）</button>
      <button :class="{ active: tab === 'all' }" @click="tab = 'all'">全部历史（{{ state.mistakes.length }}）</button>
    </div>

    <div v-if="state.mistakes.length === 0" class="empty">
      <p>错题集还是空的。<br />
      练习中答错的动词会自动收进这里，并按照记忆曲线安排复习时间，<br />
      到期后这里会提醒你重温。</p>
      <router-link to="/practice" class="btn">开始练习 →</router-link>
    </div>

    <!-- ============ Tab1 复习队列 ============ -->
    <div v-else-if="tab === 'due'" class="pane">
      <template v-if="dueList.length">
        <div class="card" v-for="m in dueList" :key="m.key">
          <div class="m-main">
            <span class="m-verb">{{ m.infinitivo }}</span>
            <span class="m-tense">{{ tenseLabel(m) }} <small>{{ moodLabel(m) }}</small></span>
          </div>
          <div class="m-meta">
            <span class="badge due">已到期 · 该复习了</span>
            <span class="badge">连对 {{ m.streak }}/3</span>
            <span class="badge">答错 {{ m.wrongCount }} 次</span>
          </div>
          <div class="m-ops">
            <router-link to="/practice" class="btn sm">去练</router-link>
            <button class="btn sm ghost" @click="reset(m)">重置进度</button>
            <button class="btn sm ghost" @click="remove(m)">删除</button>
          </div>
        </div>
      </template>
      <div v-else class="empty small">
        <p>当前没有到期错题 {{ upcoming.length ? `（下一批 ${dueText(upcoming[0].dueAt)} 到期）` : '' }}。</p>
      </div>

      <!-- 未到期预告 -->
      <template v-if="upcoming.length">
        <div class="group-label">未到期（自动排队中）</div>
        <div class="card muted" v-for="m in upcoming" :key="m.key">
          <div class="m-main">
            <span class="m-verb">{{ m.infinitivo }}</span>
            <span class="m-tense">{{ tenseLabel(m) }}</span>
          </div>
          <div class="m-meta">
            <span class="badge">{{ dueText(m.dueAt) }}</span>
            <span class="badge">连对 {{ m.streak }}/3</span>
          </div>
        </div>
      </template>
    </div>

    <!-- ============ Tab2 全部历史 ============ -->
    <div v-else class="pane">
      <template v-if="graduated.length">
        <div class="group-label">已毕业（连对 3 次出队）</div>
        <div class="card graduated" v-for="m in graduated" :key="m.key">
          <div class="m-main">
            <span class="m-verb">{{ m.infinitivo }}</span>
            <span class="m-tense">{{ tenseLabel(m) }}</span>
          </div>
          <div class="m-meta">
            <span class="badge ok">🎓 已毕业</span>
            <span class="badge">历史答错 {{ m.wrongCount }} 次</span>
          </div>
          <div class="m-ops">
            <button class="btn sm ghost" @click="reset(m)">复发 · 重新入队</button>
            <button class="btn sm ghost" @click="remove(m)">彻底删除</button>
          </div>
        </div>
      </template>
      <div v-else class="empty small"><p>还没有完全掌握的错题。<br />连续答对 3 次的错题会自动到这里，恭喜你彻底攻克它。</p></div>

      <div class="group-label">活跃中</div>
      <div class="card" v-for="m in state.mistakes.filter(x => !x.graduated)" :key="m.key">
        <div class="m-main">
          <span class="m-verb">{{ m.infinitivo }}</span>
          <span class="m-tense">{{ tenseLabel(m) }}</span>
        </div>
        <div class="m-meta">
          <span class="badge">{{ dueText(m.dueAt) }}</span>
          <span class="badge">连对 {{ m.streak }}/3</span>
          <span class="badge">答错 {{ m.wrongCount }} 次</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mistakes { display: flex; flex-direction: column; gap: var(--space-md); }

.mode-tabs { display: flex; border-bottom: 1px solid var(--color-border); }
.mode-tabs button {
  padding: var(--space-sm) var(--space-md);
  font-size: var(--fs-sub-body);
  background: transparent; border: 0; border-bottom: 2px solid transparent;
  color: var(--color-text-muted); cursor: pointer; margin-bottom: -1px; min-height: var(--btn-height);
}
.mode-tabs button.active { color: var(--color-brand); border-bottom-color: var(--color-brand); font-weight: 600; }

.pane { display: flex; flex-direction: column; gap: var(--space-sm); }
.group-label { font-size: var(--fs-sub-body); font-weight: 700; color: var(--color-text-muted); margin-top: var(--space-md); }

.card {
  background: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--card-radius);
  padding: var(--space-md) var(--space-lg);
  display: flex; align-items: center; gap: var(--space-md); flex-wrap: wrap;
}
.card.muted { opacity: var(--op-graduated); }
.card.graduated { border-style: dashed; }

.m-main { display: flex; align-items: baseline; gap: var(--space-md); min-width: 220px; }
.m-verb { font-family: var(--font-mono); font-weight: 700; font-size: var(--fs-h-small); }
.m-tense { color: var(--color-text-muted); font-size: var(--fs-sub-body); }
.m-tense small { font-size: var(--fs-caption); }

.m-meta { display: flex; gap: var(--space-xs); flex-wrap: wrap; flex: 1; }
.badge {
  font-size: var(--fs-caption); padding: 2px 10px;
  border-radius: var(--radius-pill); border: 1px solid var(--color-border);
  color: var(--color-text-muted); white-space: nowrap;
}
.badge.due { border-color: var(--color-brand); color: var(--color-brand); font-weight: 600; }
.badge.ok { border-color: var(--color-ok); color: var(--color-ok); }

.m-ops { display: flex; gap: var(--space-xs); }
.btn {
  display: inline-block; border: 0; background: var(--btn-primary-bg); color: var(--btn-primary-fg);
  border-radius: var(--btn-radius); min-height: var(--btn-height); padding: 0 var(--space-lg);
  font-size: var(--fs-sub-body); font-weight: 600; cursor: pointer; text-decoration: none; line-height: var(--btn-height);
}
.btn.sm { min-height: 34px; line-height: 34px; padding: 0 var(--space-md); font-size: var(--fs-caption); }
.btn.ghost { background: var(--btn-secondary-bg); color: var(--btn-secondary-fg); border: 1px solid var(--color-border); }

.empty { text-align: center; padding: var(--space-xl); color: var(--color-text-muted); line-height: 2; }
.empty.small { padding: var(--space-lg); }
</style>
