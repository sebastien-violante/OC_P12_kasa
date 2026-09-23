import { create } from "zustand";
import type { Message, StoreMessage } from "../types/types";
import getRequest from "../utils/getRequest";
import { apiUrl } from "../utils/api";

type MessageStore = {
  messages: StoreMessage[];
  selectedConversationId: number | null;

  setSelectedConversationId: (id: number | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;

  loadMessages: (
    conversationId: number,
    token?: string
  ) => Promise<void>;
};

export const useMessageStore = create<MessageStore>((set) => ({
  messages: [],
  selectedConversationId: null,

  setSelectedConversationId: (id) =>
    set({
      selectedConversationId: id,
    }),

  setMessages: (messages) =>
    set({
      messages,
    }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  clearMessages: () =>
    set({
      messages: [],
    }),

  loadMessages: async (conversationId, token) => {
    const messages = await getRequest<Message[]>({
      url: apiUrl(`/api/conversations/${conversationId}/messages`),
      token,
    });

    set({
      messages: messages ?? [],
      selectedConversationId: conversationId,
    });
  },
}));