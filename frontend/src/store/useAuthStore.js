import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isLoggingIn: false,
  isSigningUp: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  groups: [], 
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data, groups: res.data.groups || [] }); 
      get().connectSocket();
    } catch (error) {
      set({ authUser: null });
      console.log("error:", error.message);
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data, groups: res.data.groups || [] }); 
      toast.success("Account created");
      get().connectSocket();
    } catch (error) {
      console.log("Error:", error);
      toast.error("Cannot sign up", error);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data, groups: res.data.groups || [] });
      toast.success("Logged In");
      get().connectSocket();
    } catch (error) {
      console.log("Error in login auth", error);
      toast.error("Error occured", error);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null, groups: [] });
      get().disconnectSocket();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("error", error);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data, groups: res.data.groups || [] }); 
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Error occured", error);
      set({ authUser: null });
      console.log(error);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser, groups } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
        fullName:authUser.fullName
      },
    });

    socket.connect();
    set({ socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    socket.on("connect", () => {
      if (groups?.length > 0) {
        socket.emit("joinGroups", groups);
      }
    });

    socket.on("receiveGroupMessage", (message) => {
      console.log("Group message received:", message);
      toast.success(`${message.senderName}: ${message.text}`);
    });

    socket.on("groupNotification", (data) => {
      // toast(`${data.sender} posted in ${data.groupName}`);
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
    console.log("User disconnected");
  },
}));
