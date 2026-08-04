import {createRouter,createWebHistory} from 'vue-router';
import Login from '../views/Login.vue';
import Layout from '../layout/AppLayout.vue';
import Dashboard from '../views/Dashboard.vue';
import Forbidden from '../views/Forbidden.vue';
import NotFound from '../views/NotFound.vue';
import LeaveList from '../views/LeaveList.vue';
import LeaveForm from '../views/LeaveForm.vue';
import LeaveDetail from '../views/LeaveDetail.vue';
import ApprovalTasks from '../views/ApprovalTasks.vue';
import ProjectList from '../views/ProjectList.vue';
import ProjectDetail from '../views/ProjectDetail.vue';
import MyApplications from '../views/MyApplications.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: Login, meta: { public: true } },
    {
      path: '/',
      component: Layout,
      redirect: '/dashboard',
      children: [
        { path: 'dashboard', component: Dashboard },
        { path: 'approval/pending', component: ApprovalTasks },
        { path: 'approval/completed', component: ApprovalTasks, props: { completed: true } },
        { path: 'approval/:id', component: LeaveDetail },
        { path: 'applications', component: MyApplications },
        { path: 'leave', component: LeaveList },
        { path: 'leave/new', component: LeaveForm },
        { path: 'leave/:id/edit', component: LeaveForm },
        { path: 'leave/:id', component: LeaveDetail },
        { path: 'project', component: ProjectList },
        { path: 'project/:id', component: ProjectDetail },
      ],
    },
    { path: '/403', component: Forbidden, meta: { public: true } },
    { path: '/:pathMatch(.*)*', component: NotFound, meta: { public: true } },
  ],
});

router.beforeEach((to) => {
  if (to.path === '/login') {
    return true;
  }
  return true;
});

export default router;
