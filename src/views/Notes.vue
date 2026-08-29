<script setup>
/**
 * 笔记：自己发现的规律 / 口诀 / 易混点
 * 卡片流 + 分组色标 + 关联动词（点击可跳超级矩阵查看）。
 */
import { ref, computed } from 'vue'
import { useNotes, NOTE_GROUPS } from '../composables/useNotes'
import { useLibrary } from '../composables/useLibrary'

const { state, add, update, remove } = useNotes()
const { state: library } = useLibrary()

const filter = ref('all') // all / pattern / mnemonic / confusion
const query = ref('')

// 编辑器状态
const editing = ref(false)
const draft = ref({ id: null, title: '', body: '', group: 'pattern', verbsText: '' })

const filtered = computed(() => {
  let list = state.notes
  if (filter.value !== 'all') list = list.filter(n => n.group === filter.value)
  const s = query.value.trim().toLowerCase()
  if (s) list = list.filter(n => n.title.toLowerCase().includes(s) || n.body.toLowerCase().includes(s))
  return list
})

const groupMeta = key => NOTE_GROUPS.find(g => g.key === key)

function openNew() {
  draft.value = { id: null, title: '', body: '', group: filter.value === 'all' ? 'pattern' : filter.value, verbsText: '' }
  editing.value = true
}

function openEdit(n) {
  draft.value = { id: n.id, title: n.title, body: n.body, group: n.group, verbsText: (n.verbs ?? []).join(', ') }
  editing.value = true
}

function saveDraft() {
  const d = draft.value
  if (!d.title.trim() && !d.body.trim()) return
  const verbs = d.verbsText.split(/[,，\s]+/).map(v => v.trim()).filter(Boolean)
  if (d.id) {
    update(d.id, { title: d.title.trim(), body: d.body, group: d.group, verbs })
  } else {
    add(d.title.trim() || '（无标题）', d.body, d.group, verbs)
  }
  editing.value = false
}

function confirmRemove(n) {
  // 单用户低风险：点一次变红"确认删"，再点才删
  if (n._confirming) remove(n.id)
  else {
    n._confirming = true
    setTimeout(() => { n._confirming = false }, 2000)
  }
}

/** 关联动词是否在库中（不在也可关联，只是跳转校验） */
const verbInLibrary = inf => library.verbs.some(v => v.infinitive === inf)
</script>

<template>
  <div class="notes">
    <!-- 工具条 -->
    <div class="toolbar">
      <div class="chips">
        <button class="chip" :class="{ on: filter === 'all' }" @click="filter = 'all'">全部（{{ state.notes.length }}）</button>
        <button
          v-for="g in NOTE_GROUPS"
          :key="g.key"
          class="chip"
          :class="{ on: filter === g.key }"
          @click="filter = g.key"
        >{{ g.label }}（{{ state.notes.filter(n => n.group === g.key).length }}）</button>
      </div>
      <input v-model="query" class="search" placeholder="搜索笔记…" />
      <button class="btn" @click="openNew">＋ 新笔记</button>
    </div>

    <!-- 编辑器 -->
    <div v-if="editing" class="editor">
      <div class="ed-row">
        <input v-model="draft.title" class="ed-title" placeholder="标题，如：-zar 动词的拼写陷阱" />
        <div class="chips">
          <button
            v-for="g in NOTE_GROUPS"
            :key="g.key"
            class="chip"
            :class="{ on: draft.group === g.key }"
            @click="draft.group = g.key"
          >{{ g.label }}</button>
        </div>
      </div>
      <textarea v-model="draft.body" class="ed-body" rows="6" placeholder="写规律 / 口诀 / 易混对比…&#10;例：empezar 在 e 前必须 z→c：empecé / empiece&#10;同理：buscar→busqué · llegar→llegué"></textarea>
      <div class="ed-row">
        <input v-model="draft.verbsText" class="ed-verbs" placeholder="关联动词（逗号分隔，如：empezar, buscar, llegar）" />
        <div class="ed-ops">
          <button class="btn ghost" @click="editing = false">取消</button>
          <button class="btn" @click="saveDraft">保存</button>
        </div>
      </div>
    </div>

    <!-- 卡片列表 -->
    <div v-if="filtered.length" class="grid">
      <div v-for="n in filtered" :key="n.id" class="note" :data-group="n.group">
        <div class="note-head">
          <span class="dot" :style="{ background: groupMeta(n.group)?.color }"></span>
          <b class="note-title">{{ n.title }}</b>
          <span class="note-ops">
            <button class="op" @click="openEdit(n)">编辑</button>
            <button class="op" :class="{ danger: n._confirming }" @click="confirmRemove(n)">
              {{ n._confirming ? '确认删？' : '删除' }}
            </button>
          </span>
        </div>
        <pre class="note-body">{{ n.body }}</pre>
        <div v-if="n.verbs?.length" class="note-verbs">
          <router-link
            v-for="v in n.verbs"
            :key="v"
            :to="{ path: '/compare', query: { verb: v } }"
            class="v-chip"
            :class="{ missing: !verbInLibrary(v) }"
            :title="verbInLibrary(v) ? `在超级矩阵中查看 ${v} 的全部变位` : `${v} 还不在动词库，先去「动词库」录入才能在矩阵中查看`"
          >{{ v }}</router-link>
          <!-- 整组对比入口：≥2 只动词时出现 -->
          <router-link
            v-if="n.verbs.length >= 2"
            :to="{ path: '/compare', query: { verbs: n.verbs.join(',') } }"
            class="v-chip group-chip"
            :title="`在超级矩阵中同时对比这 ${n.verbs.length} 个动词`"
          >⇆ 整组对比（{{ n.verbs.length }}）</router-link>
        </div>
        <div class="note-date">{{ new Date(n.updatedAt).toLocaleDateString() }}</div>
      </div>
    </div>

    <div v-else class="empty">
      <p>{{ state.notes.length ? '没有匹配的笔记' : '还没有笔记。' }}</p>
      <p v-if="!state.notes.length" class="hint">
        把你发现的规律和口诀记在这里，随时可以关联动词、跳到矩阵里对照验证。<br />
        例如：「未来时和条件式不用去词尾，整个原形 + 后缀」
      </p>
    </div>
  </div>
</template>

<style scoped>
.notes { max-width: 860px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--space-md); }

.toolbar { display: flex; align-items: center; gap: var(--space-sm); flex-wrap: wrap; }
.chips { display: flex; gap: var(--space-xs); flex-wrap: wrap; }
.chip {
  border: 1px solid var(--chip-border); background: var(--chip-bg); color: var(--chip-fg);
  border-radius: var(--radius-pill); font-size: var(--fs-caption);
  min-height: 32px; padding: 2px 14px; cursor: pointer;
}
.chip.on { background: var(--chip-active-bg); color: var(--chip-active-fg); border-color: var(--chip-active-bg); font-weight: 600; }
.search {
  flex: 1; min-width: 140px; height: 36px;
  border: 1px solid var(--input-border); border-radius: var(--radius);
  padding: 0 var(--space-md); background: var(--input-bg); color: var(--color-text);
  font-size: var(--fs-sub-body);
}
.search:focus { outline: none; border-color: var(--input-border-focus); }

.btn {
  border: 0; background: var(--btn-primary-bg); color: var(--btn-primary-fg);
  border-radius: var(--btn-radius); min-height: var(--btn-height); padding: 0 var(--space-lg);
  font-size: var(--fs-sub-body); font-weight: 600; cursor: pointer; white-space: nowrap;
}
.btn.ghost { background: var(--btn-secondary-bg); color: var(--btn-secondary-fg); border: 1px solid var(--color-border); }

.editor {
  background: var(--card-bg); border: 1px solid var(--color-brand);
  border-radius: var(--card-radius); padding: var(--space-md);
  display: flex; flex-direction: column; gap: var(--space-sm);
}
.ed-row { display: flex; gap: var(--space-sm); align-items: center; flex-wrap: wrap; }
.ed-title {
  flex: 1; min-width: 200px; height: 40px;
  border: 1px solid var(--input-border); border-radius: var(--radius);
  padding: 0 var(--space-md); font-weight: 700; font-size: var(--fs-sub-body);
  background: var(--input-bg); color: var(--color-text);
}
.ed-title:focus, .ed-body:focus, .ed-verbs:focus { outline: none; border-color: var(--input-border-focus); }
.ed-body {
  width: 100%; border: 1px solid var(--input-border); border-radius: var(--radius);
  padding: var(--space-sm) var(--space-md); font-family: inherit; font-size: var(--fs-sub-body);
  line-height: 1.7; resize: vertical; background: var(--input-bg); color: var(--color-text);
}
.ed-verbs {
  flex: 1; min-width: 220px; height: 36px;
  border: 1px solid var(--input-border); border-radius: var(--radius);
  padding: 0 var(--space-md); font-family: var(--font-mono); font-size: var(--fs-caption);
  background: var(--input-bg); color: var(--color-text);
}
.ed-ops { display: flex; gap: var(--space-xs); }

.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: var(--space-md); }
.note {
  background: var(--card-bg); border: 1px solid var(--card-border);
  border-left: 3px solid var(--color-border);
  border-radius: var(--card-radius); padding: var(--space-md);
  display: flex; flex-direction: column; gap: var(--space-xs);
}
.note[data-group="pattern"] { border-left-color: var(--color-brand); }
.note[data-group="mnemonic"] { border-left-color: var(--color-ok); }
.note[data-group="confusion"] { border-left-color: var(--color-err); }

.note-head { display: flex; align-items: center; gap: var(--space-xs); }
.dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.note-title { flex: 1; font-size: var(--fs-sub-body); line-height: 1.4; }
.note-ops { display: flex; gap: 2px; }
.op {
  border: 0; background: transparent; color: var(--color-text-muted);
  font-size: var(--fs-caption); cursor: pointer; padding: 2px 6px; border-radius: var(--radius-sm);
}
.op:hover { color: var(--color-brand); background: var(--color-brand-strong); }
.op.danger { color: #fff; background: var(--color-err); font-weight: 700; }

.note-body {
  margin: 0; font-family: inherit; font-size: var(--fs-sub-body);
  line-height: 1.7; white-space: pre-wrap; word-break: break-word;
  color: var(--color-text);
}
.note-verbs { display: flex; gap: var(--space-xs); flex-wrap: wrap; margin-top: 2px; }
.v-chip {
  font-family: var(--font-mono); font-size: var(--fs-caption);
  border: 1px solid var(--color-brand); color: var(--color-brand);
  border-radius: var(--radius-pill); padding: 1px 10px; text-decoration: none;
}
.v-chip.missing { border-style: dashed; opacity: .6; }
.v-chip.group-chip { background: var(--color-brand); color: var(--btn-primary-fg); font-weight: 600; }
.note-date { font-size: var(--fs-caption); color: var(--color-text-muted); margin-top: auto; }

.empty { text-align: center; padding: var(--space-xl); color: var(--color-text-muted); line-height: 2; }
.hint { font-size: var(--fs-caption); }

@media (max-width: 700px) {
  .grid { grid-template-columns: 1fr; }
}
</style>
