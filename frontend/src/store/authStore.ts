import { defineStore } from "pinia";
import { auth, logout, signInWithGoogle } from "@/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  getIdToken,
  onAuthStateChanged,
  type User
} from "firebase/auth";
import { jwtDecode } from "jwt-decode";
import { login } from "@/services/authService";
import api from "@/api";

export interface DecodedToken {
  id?: number;
  email?: string;
  name?: string;
  exp?: number;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as User | null,
    token: localStorage.getItem("token") || null as string | null,
  }),

  actions: {
    async register(email: string, password: string, name: string): Promise<boolean> {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
          await updateProfile(userCredential.user, { displayName: name });
          this.user = userCredential.user;

          const token = await getIdToken(userCredential.user, true);
          this.setToken(token);
          await this.registerInApi(token);
        }
        return true;
      } catch (error) {
        console.error("Regitration error:", error);
        return false;
      }
    },

    async login(email: string, password: string): Promise<boolean> {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        this.user = userCredential.user;

        const token = await getIdToken(userCredential.user);
        this.setToken(token);
        return true;
      } catch (error) {
        console.error("Login error:", error);
        return false;
      }
    },

    async loginWithGoogle(): Promise<boolean> {
      try {
        const user = await signInWithGoogle();
        if (user !== null) {
          this.user = user;

          const token = await getIdToken(user);
          this.setToken(token);

          await this.registerInApi(token);
        }
        return true;
      } catch (error) {
        console.error("Google login error:", error);
        return false;
      }
    },

    async registerInApi(token: string) {
      try {
        await login()
      } catch (error) {
        console.error("API registration error:", error);
      }
    },

    async refreshToken() {
      if (!this.user) return;
      try {
        const newToken = await getIdToken(this.user, true);
        this.setToken(newToken);
        console.log("Token updated!");
      } catch (error) {
        console.error("Token update error:", error);
        await this.logout();
      }
    },

    async logout() {
      await logout();
      this.user = null;
      this.setToken(null);
    },

    setToken(token: string | null) {
      this.token = token;
      if (token) {
        localStorage.setItem("token", token);
        api.defaults.headers.Authorization = `Bearer ${token}`;
      } else {
        localStorage.removeItem("token");
        delete api.defaults.headers.Authorization;
      }
    },
  },
});

onAuthStateChanged(auth, async (user) => {
  const authStore = useAuthStore();
  authStore.user = user;
  if (user) {
    const token = await getIdToken(user);
    authStore.setToken(token);
    setInterval(() => authStore.refreshToken(), 50 * 60 * 1000);
  } else {
    authStore.setToken(null);
  }
});

export const decodeToken = (token: string): DecodedToken | null => {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};
