import { defineStore } from 'pinia';
import { ref } from 'vue';
import { http } from '../api/http';
export const useUserStore = defineStore('user', () => { const user = ref(null); async function login(username, password) { const r = await http.post('/auth/login', { username, password }); localStorage.setItem('oa_token', r.data.token); } async function load() { const r = await http.get('/users/me'); user.value = r.data; } function logout() { localStorage.removeItem('oa_token'); user.value = null; } return { user, login, load, logout }; });
