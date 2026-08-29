<script setup>
/**
 * 设置：统计 + JSON 导出/导入备份 + 清空数据
 * 备份格式：{ verbs, tags, mistakes, exportedAt, version }
 */
import { ref, computed } from 'vue'
import { db } from '../composables/db'
import { useLibrary } from '../composables/useLibrary'
import { useMistakes } from '../composables/useMistakes'
import { useNotes } from '../composables/useNotes'

const { state: library } = useLibrary()
const { state: mistakes } = useMistakes()
const { state: notes } = useNotes()

const message = ref(null) // { type: 'ok'|'err', text }

function say(type, text) {
  message.value = { type, text }
  setTimeout(() => { message.value = null }, 4000)
}

/* ============ 导出 ============ */
async function exportBackup() {
  try {
    const backup = {
      app: 'conjuga',
      version: 1,
      exportedAt: new Date().toISOString(),
      verbs: library.verbs,
      tags: library.tags,
      mistakes: mistakes.mistakes,
      notes: notes.notes,
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const d = new Date()
    const pad = n => String(n).padStart(2, '0')
    a.href = url
    a.download = `conjuga-backup-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}.json`
    a.click()
    URL.revokeObjectURL(url)
    say('ok', `已导出 ${library.verbs.length} 动词 / ${library.tags.length} 标签 / ${mistakes.mistakes.length} 错题卡 / ${notes.notes.length} 笔记`)
  } catch (e) {
    say('err', `导出失败: ${e.message}`)
  }
}

/* ============ 导入 ============ */
async function importBackup(e) {
  const file = e.target.files?.[0]
  if (!file) return
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    if (data.app !== 'conjuga' || !Array.isArray(data.verbs)) {
      throw new Error('不是 Conjuga 的备份文件')
    }
    // 合并策略：按 id 覆盖（重复的被新数据替换，不删现有）
    const verbMap = new Map(library.verbs.map(v => [v.id, v]))
    for (const v of data.verbs) verbMap.set(v.id, v)
    const tagMap = new Map(library.tags.map(t => [t.id, t]))
    for (const t of (data.tags ?? [])) tagMap.set(t.id, t)
    const mistakeMap = new Map(mistakes.mistakes.map(m => [m.key, m]))
    for (const m of (data.mistakes ?? [])) mistakeMap.set(m.key, m)
    const noteMap = new Map(notes.notes.map(n => [n.id, n]))
    for (const n of (data.notes ?? [])) noteMap.set(n.id, n)

    const newVerbs = [...verbMap.values()]
    const newTags = [...tagMap.values()]
    const newMistakes = [...mistakeMap.values()]
    const newNotes = [...noteMap.values()]

    await db.verbs.bulkPut(newVerbs)
    await db.tags.bulkPut(newTags)
    await db.mistakes.bulkPut(newMistakes)
    await db.notes.bulkPut(newNotes)

    library.verbs.splice(0, library.verbs.length, ...newVerbs)
    library.tags.splice(0, library.tags.length, ...newTags)
    mistakes.mistakes.splice(0, mistakes.mistakes.length, ...newMistakes)
    notes.notes.splice(0, notes.notes.length, ...newNotes)

    say('ok', `导入完成：${newVerbs.length} 动词 / ${newTags.length} 标签 / ${newMistakes.length} 错题卡 / ${newNotes.length} 笔记（合并覆盖模式）`)
  } catch (err) {
    say('err', `导入失败: ${err.message}`)
  } finally {
    e.target.value = '' // 允许重复选同一文件
  }
}

/* ============ 清空（双保险） ============ */
const showWipe = ref(false)
const wipeConfirmText = ref('')

async function wipeAll() {
  if (wipeConfirmText.value !== 'BORRAR') {
    say('err', '确认词不对，请输入 BORRAR（西语"删除"）')
    return
  }
  await db.verbs.clear()
  await db.tags.clear()
  await db.mistakes.clear()
  await db.notes.clear()
  library.verbs.splice(0)
  library.tags.splice(0)
  mistakes.mistakes.splice(0)
  notes.notes.splice(0)
  showWipe.value = false
  wipeConfirmText.value = ''
  say('ok', '已清空全部数据')
}

const stats = computed(() => [
  { label: '动词', value: library.verbs.length },
  { label: '标签', value: library.tags.length },
  { label: '错题卡（活跃）', value: mistakes.mistakes.filter(m => !m.graduated).length },
  { label: '错题卡（毕业）', value: mistakes.mistakes.filter(m => m.graduated).length },
  { label: '笔记', value: notes.notes.length },
])
</script>

<template>
  <div class="settings">
    <div v-if="message" class="toast" :class="message.type">{{ message.text }}</div>

    <!-- 统计 -->
    <div class="stats">
      <div v-for="s in stats" :key="s.label" class="stat">
        <b>{{ s.value }}</b>
        <span>{{ s.label }}</span>
      </div>
    </div>

    <!-- 备份 -->
    <div class="card">
      <h4>数据备份</h4>
      <p class="desc">你的数据全部保存在本设备的浏览器中，不会上传到任何服务器。为避免浏览器清理缓存时丢失数据，建议每周导出一次备份文件，保存到网盘或本地文件夹。</p>
      <div class="row">
        <button class="btn" @click="exportBackup">⬇ 导出备份（JSON）</button>
        <label class="btn ghost file-btn">
          ⬆ 导入备份
          <input type="file" accept=".json" hidden @change="importBackup" />
        </label>
      </div>
    </div>

    <!-- 危险区 -->
    <div class="card danger">
      <h4>危险区</h4>
      <p class="desc">清空动词库、标签、全部错题进度。此操作不可撤销。</p>
      <button v-if="!showWipe" class="btn danger-btn" @click="showWipe = true">清空全部数据…</button>
      <div v-else class="wipe-confirm">
        <p>输入 <b>BORRAR</b> 确认清空：</p>
        <input v-model="wipeConfirmText" placeholder="BORRAR" />
        <div class="row">
          <button class="btn danger-btn" @click="wipeAll">确认清空</button>
          <button class="btn ghost" @click="showWipe = false; wipeConfirmText = ''">取消</button>
        </div>
      </div>
    </div>

    <p class="foot">Conjuga · 西班牙语动词变位练习 · 本地离线使用</p>
  </div>
</template>

<style scoped>
.settings { max-width: 640px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--space-lg); position: relative; }

.toast {
  position: sticky; top: 0; z-index: var(--z-toast);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius); font-size: var(--fs-sub-body);
}
.toast.ok { background: rgba(52,199,89,.12); color: var(--color-ok); }
.toast.err { background: rgba(255,59,48,.12); color: var(--color-err); }

.stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: var(--space-md); }
.stat { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--card-radius); padding: var(--space-md); text-align: center; }
.stat b { display: block; font-size: var(--fs-h2); color: var(--color-brand); }
.stat span { font-size: var(--fs-caption); color: var(--color-text-muted); }

.card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--card-radius); padding: var(--space-lg); }
.card.danger { border-color: rgba(255,59,48,.4); }
.card h4 { margin: 0 0 var(--space-sm); }
.desc { margin: 0 0 var(--space-md); color: var(--color-text-muted); font-size: var(--fs-sub-body); line-height: 1.7; }
.row { display: flex; gap: var(--space-sm); flex-wrap: wrap; }

.btn {
  display: inline-block; border: 0; background: var(--btn-primary-bg); color: var(--btn-primary-fg);
  border-radius: var(--btn-radius); min-height: var(--btn-height); padding: 0 var(--space-lg);
  font-size: var(--fs-sub-body); font-weight: 600; cursor: pointer; line-height: var(--btn-height);
}
.btn.ghost { background: var(--btn-secondary-bg); color: var(--btn-secondary-fg); border: 1px solid var(--color-border); }
.btn.danger-btn { background: var(--btn-danger-bg); }
.file-btn { cursor: pointer; }

.wipe-confirm p { margin: 0 0 var(--space-sm); }
.wipe-confirm b { font-family: var(--font-mono); color: var(--color-err); }
.wipe-confirm input {
  width: 200px; height: var(--input-height);
  border: 1px solid var(--color-border); border-radius: var(--radius);
  padding: 0 var(--space-sm); font-family: var(--font-mono);
  margin-bottom: var(--space-sm);
}
.foot { text-align: center; font-size: var(--fs-caption); color: var(--color-text-muted); }

@media (max-width: 900px) {
  .stats { grid-template-columns: repeat(3, 1fr); }
}
</style>
