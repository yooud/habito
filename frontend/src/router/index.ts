import { 
  createRouter, 
  createWebHistory, 
  type RouteRecordRaw 
} from "vue-router";
import { auth } from "@/firebase";
import { useAuthStore } from "@/store/authStore";
import type { User } from "firebase/auth";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("@/pages/Home.vue")
  },
  // {
  //   path: "/login",
  //   component: () => import("@/pages/Login.vue"),
  //   meta: { guestOnly: true }
  // },
  // {
  //   path: "/register",
  //   component: () => import("@/pages/Register.vue"),
  //   meta: { guestOnly: true }
  // },
  // {
  //   path: "/dashboard",
  //   component: () => import("@/layout/DashboardLayout.vue"),
  //   meta: { requiresAuth: true },
  //   children: dashboardRoutes
  // }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, _, next) => {
  const authStore = useAuthStore();

  const user = await new Promise((resolve) => auth.onAuthStateChanged(resolve));
  authStore.user = user as User;

  if (to.meta.requiresAuth && !user) {
    next("/login");
  } else if (to.meta.guestOnly && user) {
    next("/");
  } else {
    next();
  }
});

export default router;
