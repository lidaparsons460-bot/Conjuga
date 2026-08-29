<script setup>
import { ref, computed } from 'vue'
import { useLibrary, TAG_CATEGORIES } from '../composables/useLibrary'
import { hasVerb, searchVerbs, isIrregular } from '../composables/useVerbs'

const { state, addVerb, removeVerb, toggleVerbTag, addTag, renameTag, removeTag, tagsByCategory, verbsByTag } = useLibrary()

/* ============ 左侧：标签树 ============ */
const selectedTagId = ref(null) // null = 全部

const groupedTags = computed(() =>
  TAG_CATEGORIES.map(cat => ({
    ...cat,
    tags: tagsByCategory(cat.key),
  }))
)

// 新建子标签
const newTagName = ref('')
const newTagCategory = ref(TAG_CATEGORIES[1].key)
const newTagMsg = ref('')

function createTag() {
  const name = newTagName.value.trim()
  if (!name) return
  const r = addTag(name, newTagCategory.value)
  newTagMsg.value = r.ok ? '' : '标签已存在'
  if (r.ok) newTagName.value = ''
}

// 重命名 / 删除（行内操作）
const editingTagId = ref(null)
const editingName = ref('')
function startRename(tag) {
  editingTagId.value = tag.id
  editingName.value = tag.name
}
function confirmRename(tag) {
  if (editingName.value.trim()) renameTag(tag.id, editingName.value.trim())
  editingTagId.value = null
}

/* ============ 右侧：动词列表 ============ */
const search = ref('')
const filteredVerbs = computed(() => {
  let list = verbsByTag(selectedTagId.value)
  const q = search.value.trim().toLowerCase()
  if (q) list = list.filter(v => v.infinitive.includes(q))
  return list
})

// 新增动词（带自动补全 + 存在性校验）
const newVerbInput = ref('')
const suggestions = computed(() => {
  const q = newVerbInput.value.trim()
  if (!q || hasVerb(q)) return []
  return searchVerbs(q, 6).filter(name => !state.verbs.some(v => v.infinitive === name))
})
const newVerbMsg = ref('')
function createVerb(infinitive) {
  const inf = (infinitive ?? newVerbInput.value).trim()
  if (!inf) return
  if (!hasVerb(inf)) {
    newVerbMsg.value = `"${inf}" 不在词库中——请检查拼写和重音符号（当前词库收录 654 个常用动词）`
    return
  }
  const tagIds = selectedTagId.value ? [selectedTagId.value] : []
  const r = addVerb(inf, tagIds)
  newVerbMsg.value = r.ok ? '' : `"${inf}" 已在库中`
  if (r.ok) newVerbInput.value = ''
}

// 动词行上挂标签（点已有 chip 切换）
function verbTagNames(verb) {
  return verb.tags.map(id => state.tags.find(t => t.id === id)).filter(Boolean)
}

// 删除确认（简化：点删除直接删，无弹窗）
function delVerb(id) {
  removeVerb(id)
}

/* ============ 批量导入 ============ */
const showImport = ref(false)
const importText = ref('')
const importResult = ref(null) // { added, skipped, invalid }

function runImport() {
  const names = importText.value
    .split(/[\n,，;；]+/)
    .map(s => s.trim())
    .filter(Boolean)
  const added = [], skipped = [], invalid = []
  for (const n of names) {
    if (!hasVerb(n)) invalid.push(n)
    else {
      const r = addVerb(n, selectedTagId.value ? [selectedTagId.value] : [])
      r.ok ? added.push(n) : skipped.push(n)
    }
  }
  importResult.value = { added: added.length, skipped: skipped.length, invalid }
}
</script>

<template>
  <div class="library">
    <!-- ============ 左：标签树 ============ -->
    <aside class="tag-panel">
      <div class="tag-head">
        <span>标签分组</span>
        <span class="count">{{ state.verbs.length }} 词</span>
      </div>

      <button class="tag-item all" :class="{ active: selectedTagId === null }" @click="selectedTagId = null">
        📂 全部动词
        <span class="count">{{ state.verbs.length }}</span>
      </button>

      <div v-for="cat in groupedTags" :key="cat.key" class="tag-group">
        <div class="group-label" :style="{ color: cat.color }">{{ cat.label }}</div>
        <template v-if="cat.tags.length">
          <div v-for="tag in cat.tags" :key="tag.id" class="tag-row">
            <button
              v-if="editingTagId !== tag.id"
              class="tag-item"
              :class="{ active: selectedTagId === tag.id }"
              @click="selectedTagId = tag.id"
            >
              <span class="dot" :style="{ background: cat.color }"></span>
              {{ tag.name }}
              <span class="count">{{ verbsByTag(tag.id).length }}</span>
            </button>
            <div v-else class="rename-row">
              <input v-model="editingName" @keyup.enter="confirmRename(tag)" />
              <button @click="confirmRename(tag)">✓</button>
            </div>
            <span class="tag-ops">
              <button class="op" title="重命名" @click="startRename(tag)">✎</button>
              <button class="op" title="删除" @click="removeTag(tag.id)">✕</button>
            </span>
          </div>
        </template>
        <div v-else class="group-empty">（空）</div>
      </div>

      <!-- 新建子标签 -->
      <div class="new-tag">
        <input v-model="newTagName" placeholder="新建子标签…" @keyup.enter="createTag" />
        <select v-model="newTagCategory">
          <option v-for="c in TAG_CATEGORIES" :key="c.key" :value="c.key">{{ c.label }}</option>
        </select>
        <button @click="createTag">+</button>
      </div>
      <p v-if="newTagMsg" class="msg err">{{ newTagMsg }}</p>
    </aside>

    <!-- ============ 右：动词列表 ============ -->
    <section class="verb-panel">
      <div class="toolbar">
        <input v-model="search" class="search" placeholder="🔍 搜索动词原形…" />
        <div class="add-verb">
          <input v-model="newVerbInput" placeholder="录入动词原形（如 tener）" @keyup.enter="createVerb()" />
          <div v-if="suggestions.length" class="sug">
            <button v-for="s in suggestions" :key="s" @click="createVerb(s)">{{ s }}</button>
          </div>
        </div>
        <button class="btn" @click="createVerb()">添加</button>
        <button class="btn ghost" @click="showImport = !showImport">批量导入</button>
      </div>
      <p v-if="newVerbMsg" class="msg err">{{ newVerbMsg }}</p>

      <!-- 批量导入面板 -->
      <div v-if="showImport" class="import-panel">
        <textarea v-model="importText" rows="4" placeholder="每行一个动词原形，逗号分隔也可以&#10;例如：tener, poder, dormir, buscar"></textarea>
        <div class="import-actions">
          <button class="btn" @click="runImport">导入</button>
          <span v-if="importResult" class="msg">
            新增 {{ importResult.added }} · 已存在 {{ importResult.skipped }} ·
            无效 {{ importResult.invalid.length }}
            <template v-if="importResult.invalid.length">
              （{{ importResult.invalid.join('、') }} 不在词库）
            </template>
          </span>
        </div>
      </div>

      <!-- 动词表 -->
      <div v-if="filteredVerbs.length" class="verb-table">
        <div class="verb-row head">
          <span>动词</span><span>标签</span><span>不规则</span><span></span>
        </div>
        <div v-for="verb in filteredVerbs" :key="verb.id" class="verb-row">
          <span class="inf">{{ verb.infinitive }}</span>
          <span class="chips">
            <button
              v-for="tag in verbTagNames(verb)"
              :key="tag.id"
              class="chip"
              title="点击移除该标签"
              @click="toggleVerbTag(verb.id, tag.id)"
            >{{ tag.name }} ✕</button>
            <select class="chip-add" @change="e => { if (e.target.value) { toggleVerbTag(verb.id, e.target.value); e.target.value = '' } }">
              <option value="">+ 标签</option>
              <option v-for="tag in state.tags" :key="tag.id" :value="tag.id">{{ tag.name }}</option>
            </select>
          </span>
          <span class="irreg" :class="{ yes: isIrregular(verb.infinitive) }">
            {{ isIrregular(verb.infinitive) ? '不规则' : '规则' }}
          </span>
          <button class="del" @click="delVerb(verb.id)">删除</button>
        </div>
      </div>

      <div v-else class="empty">
        <p v-if="state.verbs.length === 0">
          动词库还是空的。<br />
          试试右上角录入 <b>tener</b>，或点「批量导入」一次性贴入你学过的动词。
        </p>
        <p v-else>当前筛选下没有动词。</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.library {
  display: flex;
  gap: var(--space-lg);
  min-height: 100%;
  align-items: stretch;
}
/* main-body 改为 flex 列后，占满剩余高度并允许内容横向溢出 */
.library {
  flex: 1;
  min-width: 0;
}

/* ===== 左侧标签树 ===== */
.tag-panel {
  width: 240px;
  flex-shrink: 0;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: var(--card-radius);
  padding: var(--space-md);
}
.tag-head {
  display: flex;
  justify-content: space-between;
  font-size: var(--fs-sub-body);
  font-weight: 600;
  margin-bottom: var(--space-sm);
}
.tag-head .count {
  color: var(--color-text-muted);
  font-weight: 400;
  font-size: var(--fs-caption);
}
.tag-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  width: 100%;
  min-height: var(--touch-min);
  padding: var(--space-sm) var(--space-md);
  border: 0;
  border-radius: var(--radius);
  background: transparent;
  color: var(--color-text);
  font-size: var(--fs-sub-body);
  cursor: pointer;
  text-align: left;
}
.tag-item:hover { background: var(--color-brand-strong); }
.tag-item.active { background: var(--sidebar-active-bg); color: var(--sidebar-active-fg); font-weight: 600; }
.tag-item .count { margin-left: auto; color: var(--color-text-muted); font-size: var(--fs-caption); }
.tag-item .dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

.tag-group { margin-top: var(--space-md); }
.group-label { font-size: var(--fs-caption); font-weight: 700; margin-bottom: var(--space-xs); }
.group-empty { font-size: var(--fs-caption); color: var(--color-text-muted); padding-left: var(--space-md); }

.tag-row { display: flex; align-items: center; }
.tag-row .tag-item { flex: 1; min-width: 0; }
.tag-ops { display: flex; gap: 2px; }
.tag-ops .op {
  border: 0; background: transparent; color: var(--color-text-muted);
  cursor: pointer; font-size: var(--fs-caption); padding: 4px 6px; border-radius: var(--radius-sm);
}
.tag-ops .op:hover { color: var(--color-brand); background: var(--color-brand-strong); }

.rename-row { display: flex; flex: 1; gap: 4px; }
.rename-row input { flex: 1; min-width: 0; }
.rename-row button { border: 0; background: var(--color-brand); color: #fff; border-radius: var(--radius-sm); cursor: pointer; }

.new-tag { display: flex; gap: 4px; margin-top: var(--space-lg); }
.new-tag input { flex: 1; min-width: 0; }
.new-tag select { max-width: 80px; }
.new-tag button {
  border: 0; background: var(--color-brand); color: #fff;
  border-radius: var(--radius-sm); cursor: pointer; padding: 0 12px;
}

/* ===== 右侧动词列表 ===== */
.verb-panel { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: var(--space-md); }

.toolbar { display: flex; gap: var(--space-sm); align-items: flex-start; }
.toolbar .search { width: 200px; }
.add-verb { position: relative; flex: 1; max-width: 320px; }
.add-verb input { width: 100%; }
.sug {
  position: absolute; top: calc(100% + 2px); left: 0; right: 0;
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: var(--radius); z-index: var(--z-dropdown);
  overflow: hidden;
}
.sug button {
  display: block; width: 100%; text-align: left; border: 0; background: transparent;
  padding: var(--space-sm) var(--space-md); min-height: 36px;
  color: var(--color-text); cursor: pointer; font-family: var(--font-mono);
}
.sug button:hover { background: var(--color-brand-strong); }

.btn {
  border: 0; background: var(--btn-primary-bg); color: var(--btn-primary-fg);
  border-radius: var(--btn-radius); min-height: var(--btn-height); padding: 0 var(--space-md);
  font-size: var(--fs-sub-body); cursor: pointer; font-weight: 600;
}
.btn.ghost { background: var(--btn-secondary-bg); color: var(--btn-secondary-fg); border: 1px solid var(--color-border); }

input, select, textarea {
  height: var(--input-height);
  border: 1px solid var(--input-border);
  background: var(--input-bg);
  color: var(--color-text);
  border-radius: var(--radius);
  padding: 0 var(--space-sm);
  font-size: var(--fs-sub-body);
  font-family: inherit;
}
input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--input-border-focus);
  box-shadow: var(--input-focus-ring);
}

.msg { font-size: var(--fs-caption); color: var(--color-text-muted); }
.msg.err { color: var(--color-err); }

.import-panel { background: var(--card-bg); border: 1px dashed var(--color-border); border-radius: var(--card-radius); padding: var(--space-md); }
.import-panel textarea { width: 100%; height: auto; padding: var(--space-sm); font-family: var(--font-mono); resize: vertical; }
.import-actions { display: flex; gap: var(--space-md); align-items: center; margin-top: var(--space-sm); }

.verb-table { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--card-radius); overflow: hidden; }
.verb-row {
  display: grid;
  grid-template-columns: 120px 1fr 70px 70px;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-bottom: 1px solid var(--color-border);
  min-height: var(--touch-min);
}
.verb-row:last-child { border-bottom: 0; }
.verb-row.head { background: var(--table-head-bg); color: var(--table-head-fg); font-size: var(--fs-caption); font-weight: 700; min-height: 36px; }
.verb-row:not(.head):hover { background: var(--color-brand-strong); }
.inf { font-family: var(--font-mono); font-weight: 700; }
.irreg { font-size: var(--fs-caption); color: var(--color-text-muted); }
.irreg.yes { color: var(--color-brand); font-weight: 700; }
.del { border: 0; background: transparent; color: var(--color-text-muted); cursor: pointer; font-size: var(--fs-caption); }
.del:hover { color: var(--color-err); }

.chips { display: flex; flex-wrap: wrap; gap: var(--space-xs); align-items: center; }
.chip {
  border: 1px solid var(--chip-border); background: var(--chip-bg);
  color: var(--chip-fg); border-radius: var(--radius-pill);
  font-size: var(--fs-caption); padding: 2px 10px; cursor: pointer; min-height: 26px;
}
.chip:hover { border-color: var(--color-err); color: var(--color-err); }
.chip-add { min-height: 26px; height: 26px; width: auto; font-size: var(--fs-caption); color: var(--color-text-muted); padding: 0 8px; }

.empty { text-align: center; color: var(--color-text-muted); padding: var(--space-xl) var(--space-md); line-height: 1.8; }
</style>
