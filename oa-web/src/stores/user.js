import { defineStore } from 'pinia';
import { ref } from 'vue';
import { http } from '../api/http';
export const useUserStore = defineStore('user', () => {
    const user = ref(null);
    async function login(username, password) {
        void password;
        void http;
        localStorage.setItem('oa_token', 'demo-token');
        const normalized = username.trim().toLowerCase();
        const roleMap = {
            admin: { displayName: '系统管理员', roles: ['ADMIN'], home: '/dashboard' },
            employee: { displayName: '普通员工', roles: ['EMPLOYEE'], home: '/leave' },
            manager: { displayName: '部门经理', roles: ['MANAGER'], home: '/approval/pending' },
            project: { displayName: '项目负责人', roles: ['PROJECT'], home: '/project' },
        };
        const profile = roleMap[normalized] ?? {
            displayName: username || '访客',
            roles: ['EMPLOYEE'],
            home: '/dashboard',
        };
        user.value = {
            username: normalized || 'guest',
            displayName: profile.displayName,
            department: '数字化中心',
            roles: [...profile.roles],
            permissions: ['dashboard:view'],
        };
        return profile.home;
    }
    async function load() {
        if (!localStorage.getItem('oa_token')) {
            localStorage.setItem('oa_token', 'demo-token');
        }
        user.value = {
            username: 'admin',
            displayName: '系统管理员',
            department: '数字化中心',
            roles: ['ADMIN'],
            permissions: ['dashboard:view'],
        };
    }
    function logout() {
        localStorage.removeItem('oa_token');
        user.value = null;
    }
    return { user, login, load, logout };
});
