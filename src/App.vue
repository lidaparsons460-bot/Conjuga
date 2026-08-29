<script setup>
import { useRoute } from 'vue-router'
import { ref, computed, watch } from 'vue'

const route = useRoute()

const navItems = [
  { to: '/', label: '首页', icon: '◉' },
  { to: '/library', label: '动词库', icon: '▤' },
  { to: '/compare', label: '对比中心', icon: '⇆' },
  { to: '/practice', label: '练习', icon: '✎' },
  { to: '/mistakes', label: '错题集', icon: '✕' },
  { to: '/notes', label: '笔记', icon: '✐' },
  { to: '/reference', label: '规律速查', icon: '⚐' },
  { to: '/settings', label: '设置', icon: '⚙' },
]

const pageTitle = computed(() => route.meta.title ?? '')

// 竖屏抽屉导航（设计文档：侧边栏抽屉）
const drawerOpen = ref(false)
watch(() => route.path, () => { drawerOpen.value = false })
</script>

<template>
  <div class="layout">
    <!-- 竖屏遮罩 -->
    <div v-if="drawerOpen" class="overlay" @click="drawerOpen = false"></div>

    <aside class="sidebar" :class="{ open: drawerOpen }">
      <div class="brand">
        <b>Conjuga</b>
        <small>变位学习</small>
      </div>
      <nav class="nav">
        <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          :class="{ active: route.path === item.to }"
        >
          <span class="ico">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </router-link>
      </nav>
    </aside>

    <main class="main">
      <header class="main-head">
        <button class="drawer-toggle" aria-label="菜单" @click="drawerOpen = true">☰</button>
        <h2>{{ pageTitle }}</h2>
      </header>
      <div class="main-body">
        <router-view />
      </div>
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
}
.sidebar {
  width: var(--sidebar-width);
  flex-shrink: 0;
  background: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  display: flex;
  flex-direction: column;
}
.brand {
  padding: var(--space-md);
  border-bottom: 1px solid var(--sidebar-border);
}
.brand b {
  color: var(--color-brand);
  font-size: var(--fs-h3);
  display: block;
}
.brand small {
  color: var(--color-text-muted);
  font-size: var(--fs-caption);
}
.nav {
  padding: var(--space-sm);
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  min-height: var(--touch-min);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius);
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: var(--fs-sub-body);
}
.nav-item .ico {
  width: 20px;
  text-align: center;
}
.nav-item:hover {
  background: var(--color-brand-strong);
  color: var(--color-text);
}
.nav-item.active {
  background: var(--sidebar-active-bg);
  color: var(--sidebar-active-fg);
  font-weight: 600;
}
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.main-head {
  padding: var(--space-sm) var(--space-lg);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}
.main-head h2 {
  margin: 0;
  font-size: var(--fs-h3);
}
.main-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
}

/* 抽屉开关：仅竖屏显示 */
.drawer-toggle {
  display: none;
  border: 0;
  background: transparent;
  font-size: 20px;
  color: var(--color-text);
  min-width: var(--touch-min);
  min-height: var(--touch-min);
  cursor: pointer;
  border-radius: var(--radius);
}
.drawer-toggle:active { background: var(--color-brand-strong); }

/* 竖屏 / 窄屏：侧栏变抽屉 */
@media (max-width: 900px) {
  .drawer-toggle { display: block; }

  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: var(--sidebar-width-desktop);
    z-index: var(--z-drawer);
    transform: translateX(-100%);
    transition: transform .25s ease;
    box-shadow: var(--shadow-lg);
  }
  .sidebar.open { transform: translateX(0); }

  .overlay {
    position: fixed;
    inset: 0;
    background: var(--modal-overlay-bg);
    z-index: var(--z-drawer-overlay);
  }
}
</style>
