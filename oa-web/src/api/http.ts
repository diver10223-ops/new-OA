import axios from 'axios'; import {ElMessage} from 'element-plus';
export const http=axios.create({baseURL:'/api',timeout:10000});
http.interceptors.request.use(c=>{const token=localStorage.getItem('oa_token');if(token)c.headers.Authorization=`Bearer ${token}`;return c});
http.interceptors.response.use(r=>r.data,e=>{if(e.response?.status===401){localStorage.removeItem('oa_token');if(location.pathname!='/login')location.href='/login'}ElMessage.error(e.response?.data?.message||'网络请求失败');return Promise.reject(e)});
