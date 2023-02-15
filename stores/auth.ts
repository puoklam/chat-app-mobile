import create from "zustand";
import * as SecureStore from "expo-secure-store";
import fetcher from "../utils/fetcher";
import { User, Profile } from "../models/user";

interface UserState {
  token?: string;
  pushToken?: string;
  user?: User;
  loggedIn: boolean;
  setPushToken: (token?: string) => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  me: () => Promise<User | undefined>;
  setProfile: (params: Partial<Profile>) => void;
  // setUser: (value?: User | ((prev?: User) => User)) => void;
};

const useAuthStore = create<UserState>((set, get) => ({
  // token: localStorage.getItem("token") || undefined,
  token: undefined,
  pushToken: undefined,
  user: undefined,
  loggedIn: false,
  setPushToken: (token) => set({ pushToken: token }),
  login: async (username, password) => {
    try {
      const res = await fetcher.post("auth/signin", {
        body: JSON.stringify({
          email: username,
          password
        }),
        headers: {
          "X-Expo-Push-Token": get().pushToken ?? ""
        }
      });
      const json = await res.json();
      const token = json["id_token"];
      if (token === undefined) return;
      // alert(token);
      // localStorage.setItem("token", token);
      set({
        token
      });
      SecureStore.setItemAsync("id_token", token);
    } catch(e) {
      console.log(e);
      throw e;
    }
    // const res = await fetch("https://reactnative.dev/movies.json");
    // const json = await res.json();
    // alert(JSON.stringify(json));
  },
  logout: async () => {
    try {
      const res = await fetcher.post("auth/signout");
      if (res.status !== 204 && res.status !== 401) throw new Error(res.statusText);
      // localStorage.removeItem("token");
      set({
        token: undefined
      });
    } catch(e) {
      console.log(e);
    }
  },
  me: async () => {
    try {
      const res = await fetcher.get("auth/user");
      if (res.status === 401) {
        set({
          user: undefined,
          loggedIn: false
        });
        return undefined;
      } else if (res.status >= 400) throw new Error(res.statusText);
      const json = await res.json();
      set({
        user: json,
        loggedIn: true
      });
      return json;
    } catch(e) {
      console.log(e);
      alert(e);
    }
  },
  setProfile: (params) => set(({ user }) => {
    if (user === undefined) return {};
    const newUser: User = { ...user };
    Object.assign(newUser, params);
    return {
      user: newUser
    };
  })
}));

export default useAuthStore;