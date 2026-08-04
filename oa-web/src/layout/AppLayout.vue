<!-- filepath: /workspaces/new-OA/oa-web/src/layout/AppLayout.vue -->
<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand">Smart OA</div>

      <nav class="nav">
        <RouterLink to="/dashboard">首页</RouterLink>
        <RouterLink to="/leave">请假</RouterLink>
        <RouterLink to="/applications">我的申请</RouterLink>
        <RouterLink to="/approval/pending">待审批</RouterLink>
        <RouterLink to="/project">项目</RouterLink>
        <RouterLink to="/ask">经营问答</RouterLink>
      </nav>
    </aside>

    <div class="main">
      <header class="topbar">
        <div></div>

        <div ref="menuRef" class="user-menu">
          <button type="button" class="user-btn" @click.stop="toggleMenu">
            {{ currentName }} <span class="caret">▾</span>
          </button>

          <div v-if="menuOpen" class="menu-panel">
            <div class="menu-title">切换演示身份</div>
            <button class="menu-item" :disabled="switching" @click.stop="changeRole('employee')">普通员工</button>
            <button class="menu-item" :disabled="switching" @click.stop="changeRole('branch')">分支行行长</button>
            <button class="menu-item" :disabled="switching" @click.stop="changeRole('head')">总行行长</button>
            <button class="menu-item" :disabled="switching" @click.stop="changeRole('business')">业务负责人</button>
            <button class="menu-item logout" @click.stop="logout">退出</button>
          </div>
        </div>
      </header>

      <main class="content">
        <div v-if="message" class="message">{{ message }}</div>
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useUserStore } from '../stores/user'

type DemoRole = 'employee' | 'branch' | 'head' | 'business'

const userStore = useUserStore()
const menuOpen = ref(false)
const switching = ref(false)
const menuRef = ref<HTMLElement | null>(null)
const message = ref('')

const currentName = computed(() => userStore.user?.displayName || '总行行长')

const fallbackMap: Record<DemoRole, { username: string; displayName: string; roles: string[]; home: string }> = {
  employee: { username: 'employee', displayName: '普通员工', roles: ['EMPLOYEE'], home: '/leave' },
  branch:   { username: 'manager',  displayName: '分支行行长', roles: ['MANAGER'], home: '/approval/pending' },
  head:     { username: 'admin',    displayName: '总行行长', roles: ['ADMIN'], home: '/dashboard' },
  business: { username: 'project',  displayName: '业务负责人', roles: ['PROJECT'], home: '/project' },
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeByOutside(event: MouseEvent) {
  const target = event.target as Node | null
  if (!menuRef.value || !target) return
  if (!menuRef.value.contains(target)) menuOpen.value = false
}

function forceLocalSwitch(role: DemoRole) {
  const meta = fallbackMap[role]
  localStorage.setItem('oa_demo_role', role)
  localStorage.setItem('oa_token', `demo-${meta.username}`)
  localStorage.setItem('oa_demo_user', JSON.stringify({
    username: meta.username,
    displayName: meta.displayName,
    roles: meta.roles,
  }))
  return meta.home
}

async function changeRole(role: DemoRole) {
  if (switching.value) return
  switching.value = true
  menuOpen.value = false
  message.value = '正在切换身份...'

  try {
    let target = ''
    if (typeof userStore.switchRole === 'function') {
      target = await userStore.switchRole(role)
    }
    if (!target) target = forceLocalSwitch(role)
    message.value = '切换成功，正在跳转...'
    window.location.href = target
  } catch {
    const target = forceLocalSwitch(role)
    window.location.href = target
  } finally {
    switching.value = false
  }
}

function logout() {
  userStore.logout()
  localStorage.removeItem('oa_demo_role')
  window.location.href = '/login'
}

onMounted(async () => {
  document.addEventListener('click', closeByOutside)
  if (!userStore.user) await userStore.load()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeByOutside)
})
</script>

<style scoped>
.app-shell { min-height: 100vh; display: flex; background: #f5f7fb; }
.sidebar { width: 220px; background: #111827; color: #fff; padding: 24px 16px; }
.brand { font-size: 22px; font-weight: 700; margin-bottom: 24px; }
.nav { display: flex; flex-direction: column; gap: 10px; }
.nav a { color: #d1d5db; text-decoration: none; padding: 10px 12px; border-radius: 10px; }
.nav a.router-link-active { background: #2563eb; color: #fff; }
.main { flex: 1; display: flex; flex-direction: column; }
.topbar { height: 64px; background: #fff; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; }
.user-menu { position: relative; }
.user-btn { border: 1px solid #d1d5db; background: #fff; border-radius: 10px; padding: 8px 14px; cursor: pointer; }
.caret { margin-left: 6px; }
.menu-panel { position: absolute; top: 44px; right: 0; width: 180px; background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; box-shadow: 0 12px 24px rgba(0,0,0,.08); padding: 8px; z-index: 50; }
.menu-title { font-size: 12px; color: #6b7280; padding: 6px 8px 10px; }
.menu-item { width: 100%; text-align: left; border: 0; background: transparent; border-radius: 8px; padding: 10px 8px; cursor: pointer; }
.menu-item:hover { background: #f3f4f6; }
.menu-item:disabled { opacity: .6; cursor: not-allowed; }
.menu-item.logout { color: #dc2626; }
.content { padding: 20px; }
.message { margin-bottom: 12px; padding: 10px 12px; border-radius: 8px; background: #eff6ff; color: #1d4ed8; font-size: 14px; }
</style>