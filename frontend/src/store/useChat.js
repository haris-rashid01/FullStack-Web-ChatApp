import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { showNotification } from "../lib/utils"; // 🔹 import notification helper

export const useChat = create((set, get) => ({
  users: [],
  groups: [],
  messages: [],
  selectedChat: null,
  chatType: null,
  isMessagesLoading: false,
  isUsersLoading: false,
  isGroupsLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/message/users");
      set({ users: res.data });
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const authUser = useAuthStore.getState().authUser;
      const res = await axiosInstance.get(`/groups/${authUser._id}`);
      console.log(res);

      set({ groups: res.data });
    } catch (error) {
      toast.error("Failed to load groups");
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  createGroup: async (groupData) => {
    try {
      const res = await axiosInstance.post("/groups/create", groupData);
      set({ groups: [...get().groups, res.data] });
      toast.success("Group created");
    } catch (error) {
      toast.error("Error creating group");
    }
  },

  getMessages: async (id, type = "private") => {
    set({ isMessagesLoading: true, chatType: type });
    try {
      const url =
        type === "private" ? `/message/${id}` : `/groups/${id}/messages`;

      const res = await axiosInstance.get(url);
      set({ messages: res.data });
    } catch (error) {
      toast.error("Failed to load messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { messages, selectedChat, chatType } = get();
    if (!selectedChat) return;

    try {
      const url =
        chatType === "private"
          ? `/message/send/${selectedChat._id}`
          : `/groups/${selectedChat._id}/send-group-message`;

      const res = await axiosInstance.post(url, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error("Error sending message");
    }
  },

  addMemberToGroup: async (groupId, userId) => {
    try {
      const res = await axiosInstance.post("/groups/add-member", {
        groupId,
        userId,
      });
      set((state) => ({
        groups: state.groups.map((g) => (g._id === groupId ? res.data : g)),
      }));
      toast.success("Member added");
    } catch (error) {
      toast.error("Error adding member");
    }
  },

  removeMemberFromGroup: async (groupId, userId) => {
    try {
      const res = await axiosInstance.post("/groups/remove-member", {
        groupId,
        userId,
      });
      set((state) => ({
        groups: state.groups.map((g) => (g._id === groupId ? res.data : g)),
      }));
      toast.success("Member removed");
    } catch (error) {
      toast.error("Error removing member");
    }
  },

  leaveGroup: async (groupId) => {
    try {
      const res = await axiosInstance.put(`/groups/${groupId}/leave`);

      set((state) => ({
        groups: state.groups.filter((g) => g._id !== groupId),
        selectedChat:
          state.selectedChat?._id === groupId ? null : state.selectedChat,
        messages: state.selectedChat?._id === groupId ? [] : state.messages,
      }));

      toast.success("You left the group");
    } catch (error) {
      toast.error("Error leaving group");
    }
  },

  subscribeToMessages: () => {
    const { selectedChat, chatType } = get();
    const socket = useAuthStore.getState().socket;
    if (!selectedChat || !socket) return;

    if (chatType === "private") {
      socket.on("newMessage", (newMessage) => {
        if (
          newMessage.senderId === selectedChat._id ||
          newMessage.receiverId === selectedChat._id
        ) {
          set({ messages: [...get().messages, newMessage] });

          showNotification(
            `New message from ${newMessage.sender?.username || "User"}`,
            newMessage.text || "You got a new message"
          );
        }
      });
    } else {
      socket.emit("joinGroup", { groupId: selectedChat._id });

      socket.on("receiveGroupMessage", (newMessage) => {
        if (newMessage.groupId === selectedChat._id) {
          set({ messages: [...get().messages, newMessage] });

          showNotification(
            `New message in ${selectedChat.name || "Group"}`,
            newMessage.text || "You got a new group message"
          );
        }
      });
    }
  },

  unsubscribeFromMessages: () => {
    const { selectedChat, chatType } = get();
    const socket = useAuthStore.getState().socket;
    if (!selectedChat || !socket) return;

    if (chatType === "private") {
      socket.off("newMessage");
    } else {
      socket.emit("leaveGroup", selectedChat._id);
      socket.off("receiveGroupMessage");
    }
  },

  setSelectedChat: (chat, type = "private") => {
    set({ selectedChat: chat, chatType: type, messages: [] });
  },
}));
