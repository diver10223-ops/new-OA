import { defineStore } from 'pinia'
import { ref } from 'vue'
import { http } from '../api/http'

export interface User {
  username: string
  displayName: string
  department: string
  roles: string[]
  permissions: string[]
}

type DemoRole = 'employee' | 'branch' | 'head' | 'business'

interface LoginResponse {
  code: number
  message: string
  data: {
    token: string
    username: string
    displayName?: string
    roles?: string[]
  }
}

const roleMeta: Record<DemoRole, { backendUsername: string; displayName: string; home: string; roles: string[] }> = {
  employee: {
    backendUsername: 'employee',
    displayName: '普通员工',
    home: '/leave',
    roles: ['EMPLOYEE'],
  },
  branch: {
    backendUsername: 'manager',
    displayName: '分支行行长',
    home: '/approval/pending',
    roles: ['MANAGER'],
  },
  head: {
    backendUsername: 'admin',
    displayName: '总行行长',
    home: '/dashboard',
    roles: ['ADMIN'],
  },
  business: {
    backendUsername: 'project',
    displayName: '业务负责人',
    home: '/project',
    roles: ['PROJECT'],
  },
}

function normalizeRole(value: string): DemoRole {
  const role = value.trim().toLowerCase()

  if (role === 'employee') return 'employee'
  if (role === 'branch' || role === 'manager') return 'branch'
  if (role === 'head' || role === 'admin') return 'head'
  if (role === 'business' || role === 'project') return 'business'

  return 'employee'
}

function buildUser(role: DemoRole, username?: string, displayName?: string, roles?: string[]): User {
  const meta = roleMeta[role]

  return {
    username: username || meta.backendUsername,
    displayName: displayName || meta.displayName,
    department: '数字化中心',
    roles: roles && roles.length > 0 ? roles : meta.roles,
    permissions: ['dashboard:view'],
  }
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const currentRole = ref<DemoRole>('head')

  async function login(roleInput: string, password: string) {
    const role = normalizeRole(roleInput)
    const meta = roleMeta[role]

    try {
      const { data } = await http.post<LoginResponse>('/auth/login', {
        username: meta.backendUsername,
        password: password || 'password',
      })

      const payload = data?.data
      const token = payload?.token || `demo-${meta.backendUsername}`
      const username = payload?.username || meta.backendUsername
      const roles = payload?.roles?.length ? payload.roles : meta.roles
      const displayName = meta.displayName

      localStorage.setItem('oa_token', token)
      localStorage.setItem('oa_demo_role', role)
      localStorage.setItem('oa_demo_user', JSON.stringify({
        username,
        displayName,
        roles,
      }))

      currentRole.value = role
      user.value = buildUser(role, username, displayName, roles)

      return meta.home
    } catch (error) {
      console.error('登录接口失败，使用 demo 本地身份', error)

      localStorage.setItem('oa_token', `demo-${meta.backendUsername}`)
      localStorage.setItem('oa_demo_role', role)
      localStorage.setItem('oa_demo_user', JSON.stringify({
        username: meta.backendUsername,
        displayName: meta.displayName,
        roles: meta.roles,
      }))

      currentRole.value = role
      user.value = buildUser(role)

      return meta.home
    }
  }

  async function switchRole(role: DemoRole) {
    return await login(role, 'password')
  }

  async function load() {
    const savedRole = localStorage.getItem('oa_demo_role')
    const role = savedRole ? normalizeRole(savedRole) : 'head'
    currentRole.value = role

    const savedUser = localStorage.getItem('oa_demo_user')
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser) as Partial<User>
        user.value = buildUser(
          role,
          typeof parsed.username === 'string' ? parsed.username : undefined,
          typeof parsed.displayName === 'string' ? parsed.displayName : undefined,
          Array.isArray(parsed.roles) ? parsed.roles : undefined,
        )
        return
      } catch (error) {
        console.error('读取本地用户信息失败', error)
      }
    }

    user.value = buildUser(role)
  }

  function logout() {
    localStorage.removeItem('oa_token')
    localStorage.removeItem('oa_demo_user')
    localStorage.removeItem('oa_demo_role')
    user.value = null
    currentRole.value = 'head'
  }

  return {
    user,
    currentRole,
    login,
    load,
    logout,
    switchRole,
  }
})