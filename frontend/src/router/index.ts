import { 
  createRouter, 
  createWebHistory, 
  type RouteRecordRaw 
} from "vue-router";
import { auth } from "@/firebase";
import { useAuthStore } from "@/store/authStore";
import type { User } from "firebase/auth";
import { useFamilyStore } from "@/store/familyStore";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("@/pages/Home.vue")
  },
  {
    path: "/auth",
    component: () => import("@/pages/Auth.vue"),
    meta: { guestOnly: true }
  },
  {
    path: "/",
    component: () => import("@/layout/DashboardLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "dashboard",
        name: "dashboard",
        component: () => import("@/pages/Dashboard.vue"),
      },
      {
        path: "rewards",
        name: "rewards",
        component: () => import("@/pages/Rewards.vue"),
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, _, next) => {
  const authStore = useAuthStore();
  const familyStore = useFamilyStore();

  const user = await new Promise((resolve) => auth.onAuthStateChanged(resolve));
  authStore.user = user as User;
  const family = await familyStore.fetchFamily();

  if (to.meta.requiresAuth && (!user || !family)) {
    next("/auth");
  } else if (to.meta.guestOnly && user) {
    next("/");
  } else {
    next();
  }
});

export default router;
