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
    async register(email: string, password: string, name: string): Promise<void> {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
        this.user = userCredential.user;

        const token = await getIdToken(userCredential.user, true);
        this.setToken(token);
        await this.registerInApi(token);
      }
    },

    async login(email: string, password: string): Promise<void> {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        this.user = userCredential.user;

        const token = await getIdToken(userCredential.user);
        this.setToken(token);

        const decoded = decodeToken(token);
        if (!decoded?.id) {
          console.log("User not registered in API, registering...");
          await this.registerInApi(token);
        }
      } catch (error) {
        console.error("Login error:", error);
      }
    },

    async loginWithGoogle() {
      try {
        const user = await signInWithGoogle();
        if (user !== null) {
          this.user = user;

          const token = await getIdToken(user);
          this.setToken(token);

          const decoded = decodeToken(token);
          if (!decoded?.id) {
            await this.registerInApi(token);
          }
        }
      } catch (error) {
        console.error("Google login error:", error);
      }
    },

    async registerInApi(token: string) {
      try {
        // TODO: register in API

        const newToken = await getIdToken(this.user as User, true);
        this.setToken(newToken);
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
        // TODO: set token to API
      } else {
        localStorage.removeItem("token");
        // TODO: remove token from API
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
