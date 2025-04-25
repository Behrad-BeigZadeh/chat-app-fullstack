import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  resetUnseenCount: (userId) => {
    set((state) => {
      const updatedUsers = state.users.map((user) =>
        user.id === userId ? { ...user, unseenCount: 0 } : user
      );
      return { users: updatedUsers };
    });
  },

  incrementUnseenCount: (receiverId) => {
    set((state) => {
      const updatedUsers = state.users.map((user) =>
        user.id === receiverId
          ? { ...user, unseenCount: user.unseenCount + 1 }
          : user
      );
      return { users: updatedUsers };
    });
  },

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });

      const unseenCount = res.data.filter(
        (message) => !message.seen && message.senderId !== get().selectedUser.id
      ).length;

      set((state) => ({
        users: state.users.map((user) =>
          user.id === userId ? { ...user, unseenCount } : user
        ),
      }));
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser.id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });

      set((state) => {
        const updatedUsers = state.users.map((user) =>
          user.id === selectedUser.id
            ? { ...user, unseenCount: user.unseenCount + 1 }
            : user
        );
        return { users: updatedUsers };
      });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  deleteChat: async (userId) => {
    try {
      await axiosInstance.patch(`/messages/deleteChat/${userId}`);

      set({ messages: [] });

      set((state) => ({
        users: state.users.filter((user) => user.id !== userId),
        selectedUser: null,
      }));

      toast.success("Chat deleted successfully");
    } catch (error) {
      console.error("Failed to delete chat:", error);
      toast.error("Failed to delete the chat");
    }
  },

  markMessageAsSeen: async (messageId, senderId) => {
    try {
      await axiosInstance.patch(`/messages/${messageId}/seen`);
      const socket = useAuthStore.getState().socket;
      socket.emit("markMessageAsSeen", { messageId, senderId });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const { selectedUser, messages, users } = {
        ...get(),
        authUser: useAuthStore.getState().authUser,
      };

      set({ messages: [...messages, newMessage] });

      const isChatOpen = selectedUser?.id === newMessage.senderId;

      if (!isChatOpen) {
        set({
          users: users.map((user) =>
            user.id === newMessage.senderId
              ? { ...user, unseenCount: (user.unseenCount || 0) + 1 }
              : user
          ),
        });
      }
    });

    socket.on("messageSeen", ({ messageId }) => {
      set({
        messages: get().messages.map((msg) =>
          msg.id === messageId ? { ...msg, seen: true } : msg
        ),
      });
    });

    socket.on("updateUnseenCount", ({ senderId, unseenCount }) => {
      set((state) => ({
        users: state.users.map((user) =>
          user.id === senderId ? { ...user, unseenCount } : user
        ),
      }));
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("messageSeen");
    socket.off("updateUnseenCount");
  },

  setSelectedUser: (selectedUser) => {
    if (!selectedUser) {
      get().unsubscribeFromMessages();
    }

    set((state) => ({
      selectedUser,
      users: state.users.map((user) =>
        user.id === selectedUser?.id ? { ...user, unseenCount: 0 } : user
      ),
    }));

    if (selectedUser) {
      get().getMessages(selectedUser.id);
    } else {
      set({ messages: [] });
    }
  },
}));
